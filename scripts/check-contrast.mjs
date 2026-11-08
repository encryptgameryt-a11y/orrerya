import { readFile } from "node:fs/promises";
import process from "node:process";

const stylesheetPath = "src/styles/editorial-light.css";
const css = await readFile(stylesheetPath, "utf8");
const errors = [];

function parseHex(hex) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) throw new Error("Expected a six-digit hex colour: " + hex);
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function linearise(channel) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenColour(name) {
  const root = css.match(/:root\\s*\\{([^}]*)\\}/i)?.[1];
  const value = root?.match(new RegExp(escapeRegExp(name) + "\\s*:\\s*(#[0-9a-f]{6})", "i"))?.[1];
  if (!value) throw new Error("Missing colour token " + name + " in " + stylesheetPath);
  return value;
}

function selectorColour(selector) {
  const pattern = new RegExp(escapeRegExp(selector) + "\\s*\\{([^}]*)\\}", "g");
  const matches = [...css.matchAll(pattern)];
  const declarations = matches.at(-1)?.[1];
  const value = declarations?.match(/(?:^|;)\\s*color\\s*:\\s*(#[0-9a-f]{6})/i)?.[1];
  if (!value) throw new Error("Missing explicit text colour for selector " + selector);
  return value;
}

const backgrounds = ["#ffffff", "#f8fafb", "#f3f6f8", "#edf2f6", "#e8f0f5"];
const tokens = ["--text", "--muted", "--quiet", "--gold-bright", "--accent"];
const textRules = [
  ".eyebrow",
  ".gold",
  ".heading-muted",
  ".wordmark-gold",
  ".wordmark small",
  ".breadcrumbs",
  ".home-proof",
  ".home-art-label span",
  ".home-hero-bottom",
  ".discover-card p",
  ".discover-number",
  ".tool-preview p",
  ".tool-index",
  ".stat .label",
  ".stat small",
  ".field input::placeholder, .ephem-toolbar input::placeholder",
  ".result-box span",
  ".image-figure figcaption"
];

let checks = 0;
for (const token of tokens) {
  const foreground = tokenColour(token);
  for (const background of backgrounds) {
    const ratio = contrastRatio(foreground, background);
    checks++;
    if (ratio < 4.5) {
      errors.push(token + " " + foreground + " on " + background + " = " + ratio.toFixed(2) + ":1 (needs 4.5:1).");
    }
  }
}
for (const selector of textRules) {
  const foreground = selectorColour(selector);
  for (const background of backgrounds) {
    const ratio = contrastRatio(foreground, background);
    checks++;
    if (ratio < 4.5) {
      errors.push(selector + " " + foreground + " on " + background + " = " + ratio.toFixed(2) + ":1 (needs 4.5:1).");
    }
  }
}

console.log("ORRERYA light-theme text contrast checks: " + checks);
if (errors.length) {
  console.error("Found " + errors.length + " contrast failure(s):");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("All audited text colours meet WCAG AA's 4.5:1 normal-text threshold against the tested light surfaces.");
}
