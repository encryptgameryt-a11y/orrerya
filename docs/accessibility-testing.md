# ORRERYA accessibility test protocol

This document separates checks that run automatically from checks that require a real assistive technology. A green CI job is not a screen-reader certification.

## Automated checks

Every push and pull request runs:

- Static checks for document language, skip navigation, main landmarks, named navigation, native disclosure behavior, Escape dismissal, focus return, visible focus, reduced motion, and the contrast-test configuration.
- Contrast calculations for the light and dark theme token palettes and a visible keyboard-focus indicator.
- Playwright checks for every public HTML route discovered from the generated sitemap at 390, 768, 1366 and 1920 CSS pixels.
- Keyboard checks for the skip link and the mobile navigation disclosure, including Enter, Space, Escape and focus return.
- Accessibility-tree role checks for the banner, main, contentinfo, named primary navigation, and page-level H1.
- axe-core scans for WCAG 2.0, 2.1 and 2.2 Level A/AA rules at 390px and 1366px.
- Screenshots for the homepage, planet directory, Earth profile, dwarf-planet page, correlation lab, 3D orbit explorer, orbit model, outer-system guide and mission timeline at each viewport. The JSON report and PNGs are uploaded as a CI artifact.

Automated contrast and axe results are evaluated on rendered pages, not inferred from stylesheet source alone.

## Manual screen-reader acceptance checklist

These checks need the actual assistive technology running and must be completed before claiming screen-reader support has been manually verified:

### Windows — NVDA with Firefox or Chrome
- Start at the top of the homepage. Use landmark navigation to reach banner, primary navigation, main content and footer.
- Use heading navigation. Confirm each page has one clear H1 and that heading levels describe the page outline without unexplained jumps.
- Activate “Skip to content” and confirm focus lands at the main content.
- Open and close the mobile navigation with keyboard controls. Confirm its expanded/collapsed state and accessible name are announced, Escape closes it, and focus returns to the toggle.
- Navigate data tables by row and column. On narrow screens, focus the labelled scroll region and move horizontally without losing context.
- Use the planet correlation chart and orbit diagrams. Confirm their title, description, axes, units and non-visual data equivalent are understandable.
- Open the calculator dialogs. Confirm dialog title/description are announced, focus remains within the dialog, close returns focus to its launcher, and results are announced after input changes.
- Review dynamic status messages in ephemeris, the 3D explorer and other tools. Ensure important updates are announced without excessive chatter.

### Apple — VoiceOver with Safari (macOS and iOS)
- Repeat landmark, heading and skip-link navigation.
- On iPhone, use rotor navigation and touch exploration for navigation, dialogs, tables, cards and tool controls.
- Confirm horizontal-scroll regions are reachable and labelled; ensure gesture interaction does not hide important content.
- Check that chart and image descriptions explain scientific meaning, not only appearance.

### Android — TalkBack with Chrome
- Repeat navigation and heading checks on the mobile layout.
- Confirm touch targets, menu toggle state, calculator dialogs, live results and horizontally scrollable scientific tables are discoverable and operable.
- Verify the 3D explorer has a meaningful text explanation and that essential information is not available only through dragging or WebGL.

## Reporting rule

Record the browser, operating system, assistive-technology version, routes covered, and concrete failures. Do not mark this checklist complete based on axe, Playwright, snapshots or keyboard-only testing. If a real screen reader is unavailable, report the manual check as not run.
