import { readFile } from "node:fs/promises";

const files = {
  layout: await readFile("src/layouts/SiteLayout.astro", "utf8"),
  header: await readFile("src/components/SiteHeader.astro", "utf8"),
  navigation: await readFile("public/scripts/site-nav.js", "utf8"),
  baseStyles: await readFile("src/styles/global.css", "utf8"),
  contrastCheck: await readFile("scripts/check-contrast.mjs", "utf8")
};

const failures = [];
let checks = 0;

function requireMatch(source, pattern, description) {
  checks++;
  if (!pattern.test(source)) failures.push(description);
}

function requireNoMatch(source, pattern, description) {
  checks++;
  if (pattern.test(source)) failures.push(description);
}

// Landmark structure and a keyboard-accessible bypass link.
requireMatch(files.layout, /<html\s+lang=["']en["']/i, "Document language is missing.");
requireMatch(files.layout, /<a\s+class=["']skip-link["']\s+href=["']#main["'][^>]*>\s*Skip to content\s*<\/a>/i, "Skip-to-content link is missing or no longer targets #main.");
requireMatch(files.layout, /<main\s+id=["']main["']/i, "Main landmark does not expose the #main skip-link target.");

// A disclosure button is not an ARIA menu button or popup.
requireMatch(files.header, /<button\s+class=["']menu-toggle["'][^>]*type=["']button["'][^>]*aria-expanded=["']false["'][^>]*aria-controls=["']primary-nav["'][^>]*aria-label=["']Open navigation["'][^>]*>/i, "Mobile navigation toggle is missing native button or disclosure state.");
requireNoMatch(files.header, /aria-haspopup=/i, "Mobile navigation disclosure must not claim to open an ARIA popup/menu.");
requireMatch(files.header, /<nav\s+id=["']primary-nav["'][^>]*aria-label=["']Primary navigation["']/i, "Primary navigation landmark is missing its accessible name.");
requireMatch(files.baseStyles, /@media\s*\(max-width:\s*820px\)[\s\S]*?\.menu-toggle\s*\{[^}]*display:\s*block/i, "Mobile navigation toggle is not exposed at the configured narrow-screen breakpoint.");
requireMatch(files.baseStyles, /\.primary-nav\s*\{\s*display:\s*none/i, "Collapsed navigation is not hidden when closed.");
requireMatch(files.baseStyles, /\.primary-nav\.is-open\s*\{\s*display:\s*flex/i, "Expanded navigation state is not visually exposed.");

// Keyboard behavior: native button activation, Escape dismissal, and focus return.
requireMatch(files.navigation, /toggle\.addEventListener\(["']click["']/i, "Navigation toggle activation handler is missing.");
requireMatch(files.navigation, /event\.key\s*===\s*["']Escape["']/i, "Escape does not dismiss the expanded navigation.");
requireMatch(files.navigation, /closeNavigation\(true\)/i, "Escape dismissal does not return keyboard focus to the toggle.");
requireMatch(files.navigation, /toggle\.setAttribute\(["']aria-expanded["']\s*,\s*["']true["']\)/i, "Expanded navigation state is not announced to assistive technology.");
requireMatch(files.navigation, /toggle\.setAttribute\(["']aria-label["']\s*,\s*["']Close navigation["']\)/i, "Expanded navigation toggle does not receive its updated accessible name.");
requireMatch(files.navigation, /nav\.querySelectorAll\(["']a["']\)/i, "Navigation links do not close the disclosure after selection.");

// Global focus and motion preferences are required across both visual themes.
requireMatch(files.baseStyles, /:focus-visible\s*\{[^}]*outline:/i, "A visible keyboard focus indicator is missing.");
requireMatch(files.baseStyles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i, "Reduced-motion preferences are not respected.");
requireMatch(files.contrastCheck, /darkBackgrounds\s*=\s*\[/, "Dark-theme colour contrast is not included in automated checks.");
requireMatch(files.contrastCheck, /focusIndicator/, "Focus-indicator contrast is not included in automated checks.");

console.log("ORRERYA accessibility source checks: " + checks);
if (failures.length) {
  console.error("Found " + failures.length + " accessibility source issue(s):");
  for (const failure of failures) console.error(" - " + failure);
  process.exitCode = 1;
} else {
  console.log("All configured accessibility source checks passed. These static checks do not replace manual keyboard or screen-reader testing.");
}
