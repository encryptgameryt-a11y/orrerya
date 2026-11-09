import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const origin = "http://127.0.0.1:4321";
const widths = [390, 768, 1366, 1920];
const axeWidths = new Set([390, 1366]);
const screenshotRoutes = new Set([
  "/",
  "/planets/",
  "/planets/earth/",
  "/explore/dwarf-planets/",
  "/tools/correlation-lab/"
]);
const screenshotDirectory = "artifacts/visual-qa";
const severeImpacts = new Set(["critical", "serious"]);
const failures = [];
const warnings = [];
const consoleErrors = [];
const failedSameOriginRequests = [];
const axeFindings = [];
let pagesVisited = 0;
let axeScans = 0;
let screenshots = 0;

const server = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321", "--strictPort"], {
  stdio: "ignore",
  env: process.env
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error("Astro preview server exited before becoming ready.");
    try {
      const response = await fetch(origin + "/sitemap.xml");
      if (response.ok) return await response.text();
    } catch {
      // The preview server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("Astro preview server did not become ready within 20 seconds.");
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function fail(message) {
  failures.push(message);
}

async function inspectKeyboardNavigation(page, width) {
  await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");

  const skipLink = await page.evaluate(() => ({
    focused: document.activeElement?.classList?.contains("skip-link") ?? false,
    outlineStyle: getComputedStyle(document.activeElement).outlineStyle,
    outlineWidth: getComputedStyle(document.activeElement).outlineWidth
  }));

  if (!skipLink.focused) fail(width + "px: first Tab does not focus the skip link.");
  if (skipLink.outlineStyle === "none" || Number.parseFloat(skipLink.outlineWidth) < 2) {
    fail(width + "px: skip link has no clearly visible keyboard focus outline.");
  }

  const toggle = page.locator(".menu-toggle");
  const isMobile = width <= 820;
  const toggleVisible = await toggle.isVisible();
  if (isMobile && !toggleVisible) fail(width + "px: mobile navigation toggle is not visible.");
  if (!isMobile && toggleVisible) fail(width + "px: compact navigation toggle is visible at desktop width.");

  if (isMobile) {
    await toggle.focus();
    await page.keyboard.press("Enter");
    if (await toggle.getAttribute("aria-expanded") !== "true") {
      fail(width + "px: Enter did not expand the mobile navigation.");
    }

    await page.keyboard.press("Escape");
    if (await toggle.getAttribute("aria-expanded") !== "false") {
      fail(width + "px: Escape did not close the mobile navigation.");
    }
    if (!await toggle.evaluate(element => document.activeElement === element)) {
      fail(width + "px: Escape did not return focus to the navigation toggle.");
    }

    await page.keyboard.press("Space");
    if (await toggle.getAttribute("aria-expanded") !== "true") {
      fail(width + "px: Space did not expand the mobile navigation.");
    }

    await page.keyboard.press("Tab");
    const focusMovedIntoNavigation = await page.evaluate(() =>
      document.querySelector("#primary-nav")?.contains(document.activeElement) ?? false
    );
    if (!focusMovedIntoNavigation) fail(width + "px: Tab did not move from the toggle into the open navigation.");

    await page.keyboard.press("Escape");
    if (await toggle.getAttribute("aria-expanded") !== "false") {
      fail(width + "px: Escape did not close the navigation when focus was on a link.");
    }
    if (!await toggle.evaluate(element => document.activeElement === element)) {
      fail(width + "px: closing the navigation from a link did not return focus to the toggle.");
    }
  } else {
    const navVisible = await page.locator("#primary-nav").isVisible();
    if (!navVisible) fail(width + "px: primary navigation is not visible at desktop width.");
  }
}

async function main() {
  await mkdir(screenshotDirectory, { recursive: true });
  const sitemapText = await waitForServer();
  const routes = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(match => decodeXml(match[1]))
    .map(value => new URL(value, origin).pathname)
    .filter(path => !path.endsWith(".xml"));

  if (!routes.includes("/")) fail("Sitemap does not contain the homepage.");
  if (routes.length < 20) fail("Expected the full public route set; sitemap exposed only " + routes.length + " HTML routes.");

  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"]
  });

  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        reducedMotion: "reduce"
      });
      const page = await context.newPage();
      page.on("pageerror", error => consoleErrors.push(width + "px " + page.url() + ": " + error.message));
      page.on("console", message => {
        if (message.type() === "error") consoleErrors.push(width + "px " + page.url() + ": " + message.text());
      });
      page.on("requestfailed", request => {
        if (request.url().startsWith(origin)) {
          failedSameOriginRequests.push(width + "px " + request.url() + ": " + (request.failure()?.errorText ?? "request failed"));
        }
      });

      await inspectKeyboardNavigation(page, width);

      for (const route of routes) {
        const url = origin + route;
        let response;
        try {
          response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        } catch (error) {
          fail(width + "px " + route + ": navigation failed — " + error.message);
          continue;
        }
        pagesVisited++;

        if (!response || response.status() >= 400) {
          fail(width + "px " + route + ": returned " + (response?.status() ?? "no response"));
          continue;
        }

        const layout = await page.evaluate(() => ({
          viewport: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          overflowElements: [...document.querySelectorAll("*")]
            .map(element => ({ element, rect: element.getBoundingClientRect() }))
            .filter(({ element, rect }) => rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1))
            .slice(0, 8)
            .map(({ element, rect }) => ({
              tag: element.tagName.toLowerCase(),
              id: element.id,
              className: typeof element.className === "string" ? element.className : "",
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            })),
          hasHeader: Boolean(document.querySelector("header")),
          hasMain: Boolean(document.querySelector("main")),
          hasFooter: Boolean(document.querySelector("footer"))
        }));

        if (layout.documentWidth > layout.viewport + 1) {
          fail(width + "px " + route + ": document overflows horizontally (" + layout.documentWidth + "px document vs " + layout.viewport + "px viewport); elements: " + JSON.stringify(layout.overflowElements));
        }
        if (!layout.hasHeader || !layout.hasMain || !layout.hasFooter) {
          fail(width + "px " + route + ": a site landmark is missing.");
        }

        if (screenshotRoutes.has(route)) {
          const safeRoute = route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replaceAll("/", "-");
          await page.screenshot({
            path: screenshotDirectory + "/" + safeRoute + "-" + width + "px.png",
            fullPage: true,
            animations: "disabled"
          });
          screenshots++;
        }

        if (axeWidths.has(width)) {
          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          axeScans++;
          for (const violation of results.violations) {
            const record = {
              width,
              route,
              impact: violation.impact ?? "unknown",
              id: violation.id,
              description: violation.description,
              help: violation.help,
              nodes: violation.nodes.length,
              examples: violation.nodes.slice(0, 3).map(node => ({
                target: node.target,
                summary: node.failureSummary
              }))
            };
            axeFindings.push(record);
            if (severeImpacts.has(record.impact)) {
              fail(width + "px " + route + ": axe " + record.impact + " violation — " + record.id + " (" + record.nodes + " node(s)).");
            }
          }
        }
      }

      await context.close();
    }

    const report = {
      generatedAt: new Date().toISOString(),
      routesFromSitemap: routes,
      viewportWidths: widths,
      pagesVisited,
      axeScans,
      screenshots,
      axeFindings,
      consoleErrors,
      failedSameOriginRequests,
      failures,
      notes: [
        "Axe scans cover WCAG 2.0/2.1/2.2 A and AA rules at 390px and 1366px. Manual interpretation is still required.",
        "Screen-reader output must still be manually checked with NVDA, VoiceOver, or TalkBack; browser automation cannot certify it."
      ]
    };

    await writeFile(screenshotDirectory + "/report.json", JSON.stringify(report, null, 2) + "\n");

    console.log("ORRERYA responsive browser checks");
    console.log("Routes: " + routes.length + " | Page/viewport visits: " + pagesVisited);
    console.log("Viewports: " + widths.join(", ") + " px");
    console.log("Axe WCAG 2.2 A/AA scans: " + axeScans);
    console.log("Full-page screenshots: " + screenshots + " (artifacts/visual-qa)");
    console.log("Axe violations: " + axeFindings.length + " total; " + axeFindings.filter(item => severeImpacts.has(item.impact)).length + " serious/critical");
    for (const finding of axeFindings.filter(item => severeImpacts.has(item.impact))) {
      console.error("Axe detail: " + finding.width + "px " + finding.route + " " + finding.id + " " + JSON.stringify(finding.examples));
    }
    console.log("Browser errors: " + consoleErrors.length + " | Failed same-origin requests: " + failedSameOriginRequests.length);

    for (const finding of axeFindings.filter(item => item.impact === "moderate" || item.impact === "minor")) {
      console.warn("Axe " + finding.impact + ": " + finding.route + " at " + finding.width + "px — " + finding.id + " (" + finding.nodes + " node(s)).");
    }

    if (consoleErrors.length) {
      for (const error of consoleErrors) console.error("Browser error: " + error);
      fail("Browser JavaScript errors were recorded; inspect artifacts/visual-qa/report.json.");
    }
    if (failedSameOriginRequests.length) {
      for (const error of failedSameOriginRequests) console.error("Network error: " + error);
      fail("Same-origin requests failed; inspect artifacts/visual-qa/report.json.");
    }

    if (failures.length) {
      console.error("Found " + failures.length + " responsive/accessibility failure(s):");
      for (const message of failures) console.error(" - " + message);
      process.exitCode = 1;
    } else {
      console.log("All configured responsive, keyboard, and severe/critical axe checks passed.");
      console.log("The report and screenshots are retained under artifacts/visual-qa.");
    }
  } finally {
    await browser.close();
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill("SIGTERM");
  });
