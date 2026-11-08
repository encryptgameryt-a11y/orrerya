import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve("dist");
const siteOrigin = "https://orrerya.encryptgameryt.workers.dev";
const problems = [];
let pagesChecked = 0;
let linksChecked = 0;
let imagesChecked = 0;
let formControlsChecked = 0;
let buttonsChecked = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function readAttributes(tag) {
  const attrs = {};
  const pattern = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = pattern.exec(tag))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function tagsFor(html, tagName) {
  const pattern = new RegExp("<" + tagName + "\\b[^>]*>", "gi");
  return [...html.matchAll(pattern)].map(match => match[0]);
}

function routeCandidates(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return [];
  }
  const relative = decoded.replace(/^\/+/, "");
  if (!relative) return [path.join(root, "index.html")];

  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return [];

  const candidates = [resolved];
  if (decoded.endsWith("/")) candidates.push(path.join(resolved, "index.html"));
  else if (!path.extname(relative)) {
    candidates.push(path.join(resolved, "index.html"));
    candidates.push(resolved + ".html");
  }
  return [...new Set(candidates)];
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

try {
  if (!await isFile(path.join(root, "index.html"))) {
    throw new Error("dist/index.html is missing. Run npm run build first.");
  }

  const htmlFiles = (await walk(root)).filter(file => file.endsWith(".html"));
  const htmlByFile = new Map();
  const idsByFile = new Map();

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    htmlByFile.set(file, html);
    const ids = new Set();
    for (const match of html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)) {
      const id = match[2];
      if (ids.has(id)) {
        problems.push(path.relative(root, file) + ": duplicate id '" + id + "'.");
      }
      ids.add(id);
    }
    idsByFile.set(file, ids);
  }

  for (const [file, html] of htmlByFile) {
    pagesChecked++;
    const label = path.relative(root, file) || "index.html";
    const relativePage = path.relative(root, file).replace(/\\/g, "/");
    const pageUrl = new URL(relativePage, siteOrigin + "/");

    if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) {
      problems.push(label + ": <html> is missing a language attribute.");
    }
    if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) {
      problems.push(label + ": page title is missing or empty.");
    }
    const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
    if (h1Count !== 1) {
      problems.push(label + ": expected exactly one level-one heading; found " + h1Count + ".");
    }

    const labelledIds = new Set();
    for (const tag of tagsFor(html, "label")) {
      const attrs = readAttributes(tag);
      if (attrs.for) labelledIds.add(attrs.for);
    }
    for (const tag of [...tagsFor(html, "input"), ...tagsFor(html, "select"), ...tagsFor(html, "textarea")]) {
      const attrs = readAttributes(tag);
      if (attrs.type?.toLowerCase() === "hidden") continue;
      formControlsChecked++;
      const hasAccessibleName = Boolean(
        attrs["aria-label"]?.trim()
        || attrs["aria-labelledby"]?.trim()
        || (attrs.id && labelledIds.has(attrs.id))
      );
      if (!hasAccessibleName) {
        problems.push(label + ": form control is missing an associated label or accessible name: " + tag);
      }
    }

    for (const match of html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
      const tag = match[0].slice(0, match[0].indexOf(">") + 1);
      const attrs = readAttributes(tag);
      const visibleText = match[1].replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|#\d+|#x[0-9a-f]+);/gi, " ").replace(/\s+/g, " ").trim();
      buttonsChecked++;
      const hasAccessibleName = Boolean(
        attrs["aria-label"]?.trim()
        || attrs["aria-labelledby"]?.trim()
        || attrs.title?.trim()
        || visibleText
      );
      if (!hasAccessibleName) {
        problems.push(label + ": button is missing an accessible name: " + tag);
      }
    }

    for (const tag of tagsFor(html, "img")) {
      const attrs = readAttributes(tag);
      if (!Object.prototype.hasOwnProperty.call(attrs, "alt")) {
        problems.push(label + ": image is missing an alt attribute.");
      }
      if (attrs.src && !/^(?:https?:|data:|blob:)/i.test(attrs.src)) {
        let target;
        try {
          target = new URL(attrs.src, pageUrl);
        } catch {
          problems.push(label + ": invalid image URL: " + attrs.src);
          imagesChecked++;
          continue;
        }
        if (target.origin === siteOrigin) {
          const candidates = routeCandidates(target.pathname);
          let found = false;
          for (const candidate of candidates) {
            if (await isFile(candidate)) {
              found = true;
              break;
            }
          }
          if (!found) problems.push(label + ": local image source does not exist: " + attrs.src);
        }
      }
      imagesChecked++;
    }

    for (const tag of tagsFor(html, "a")) {
      const attrs = readAttributes(tag);
      const href = attrs.href;
      if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;

      let target;
      try {
        target = new URL(href, pageUrl);
      } catch {
        problems.push(label + ": invalid link URL: " + href);
        continue;
      }
      if (target.origin !== siteOrigin) continue;

      linksChecked++;
      const candidates = routeCandidates(target.pathname);
      let targetFile = null;
      for (const candidate of candidates) {
        if (await isFile(candidate)) {
          targetFile = candidate;
          break;
        }
      }
      if (!targetFile) {
        problems.push(label + ": local link target does not exist: " + href);
        continue;
      }

      if (target.hash) {
        let fragment;
        try {
          fragment = decodeURIComponent(target.hash.slice(1));
        } catch {
          problems.push(label + ": malformed link fragment: " + href);
          continue;
        }
        const targetIds = idsByFile.get(targetFile);
        if (targetIds && !targetIds.has(fragment)) {
          problems.push(label + ": link fragment does not exist: " + href);
        }
      }
    }
  }


  // Keep the XML sitemap in sync with every public HTML route. The 404 page
  // is intentionally excluded because it is not an indexable destination.
  const sitemapPath = path.join(root, "sitemap.xml");
  let sitemapUrlsChecked = 0;
  if (!await isFile(sitemapPath)) {
    problems.push("sitemap.xml is missing from the generated site.");
  } else {
    const sitemapXml = await readFile(sitemapPath, "utf8");
    if (!/<urlset\b/i.test(sitemapXml)) {
      problems.push("sitemap.xml is missing the urlset root element.");
    }
    const sitemapLocations = [...sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
      .map(match => match[1].trim());
    const actualRoutes = new Set();
    for (const location of sitemapLocations) {
      sitemapUrlsChecked++;
      try {
        const parsed = new URL(location);
        if (parsed.origin !== siteOrigin) {
          problems.push("sitemap.xml contains a non-canonical origin: " + location);
          continue;
        }
        if (parsed.search || parsed.hash) {
          problems.push("sitemap.xml contains a query or fragment: " + location);
        }
        const route = parsed.pathname === "/" ? "/" : parsed.pathname.endsWith("/")
          ? parsed.pathname : parsed.pathname + "/";
        if (actualRoutes.has(route)) {
          problems.push("sitemap.xml contains a duplicate route: " + route);
        }
        actualRoutes.add(route);
      } catch {
        problems.push("sitemap.xml contains an invalid URL: " + location);
      }
    }

    const expectedRoutes = new Set();
    for (const file of htmlFiles) {
      const relative = path.relative(root, file).replace(/\\/g, "/");
      if (relative === "404.html") continue;
      let route;
      if (relative === "index.html") route = "/";
      else if (relative.endsWith("/index.html")) route = "/" + relative.slice(0, -"index.html".length);
      else if (relative.endsWith(".html")) route = "/" + relative.slice(0, -".html".length) + "/";
      else continue;
      expectedRoutes.add(route);
    }
    for (const route of expectedRoutes) {
      if (!actualRoutes.has(route)) {
        problems.push("sitemap.xml is missing the generated route: " + route);
      }
    }
    for (const route of actualRoutes) {
      if (!expectedRoutes.has(route)) {
        problems.push("sitemap.xml includes a route with no generated HTML page: " + route);
      }
    }
  }

  console.log("ORRERYA site checks");
  console.log("HTML pages checked: " + pagesChecked);
  console.log("Same-site links checked: " + linksChecked);
  console.log("Images checked for alt text: " + imagesChecked);
  console.log("Form controls checked for labels: " + formControlsChecked);
  console.log("Buttons checked for accessible names: " + buttonsChecked);
  console.log("Sitemap URLs checked: " + sitemapUrlsChecked);

  if (problems.length) {
    console.error("\nFound " + problems.length + " issue(s):");
    for (const problem of problems) console.error(" - " + problem);
    process.exitCode = 1;
  } else {
    console.log("All generated-site integrity checks passed.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
