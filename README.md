# ORRERYA

**The Solar System, explained.** ORRERYA is an independent, static Solar System encyclopedia built with [Astro](https://astro.build/). It combines object profiles, an illustrated atlas, planetary science, mission history, a glossary and browser-based learning tools.

Canonical site origin: [https://orrerya.encryptgameryt.workers.dev](https://orrerya.encryptgameryt.workers.dev)

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm install
npm run dev
```

Build and verify the static site:

```sh
npm run verify
```

The production build is written to `dist/`. `npm run check:site` checks generated HTML for core document metadata, exactly one level-one heading, image alternative text, form-control labels, button accessible names, duplicate IDs, and broken same-site links and fragments. The verification workflow runs unit tests for Kepler's equation, orbital-state calculations, energy conservation and shared physical constants; checks key light-theme text colours against WCAG AA contrast; and verifies that every generated public HTML route appears exactly once in the XML sitemap.

## Site map

- `/` — home and introductory Solar System overview
- `/solar-system/` — measured Solar System atlas
- `/planets/` and `/planets/:slug/` — eight planet profiles
- `/explore/` — entry point for the Sun, moons, dwarf planets, small bodies and the outer Solar System
- `/science/` — fundamental interactions and planetary physics
- `/science/planetary-migration/` — planetary migration explainer
- `/missions/` — spacecraft and mission history
- `/glossary/` — searchable astronomy terminology
- `/tools/` — calculators, 2D/3D orbital models, Hohmann-transfer planning, spectroscopy, correlation analysis and planetary positions
- `/about/` — editorial policy, image attribution and corrections

## Scientific methods and limitations

ORRERYA is educational material, not a navigation or observational-planning system. Values are rounded for readability; the relevant page should identify the source, reference frame, epoch, measurement convention and important uncertainty where those details matter.

The planetary-position explorer uses the NASA/JPL Solar System Dynamics long-range approximate-position method:

- Table 2a Keplerian elements and rates, fitted for 3000 BCE–3000 CE.
- Table 2b periodic corrections to mean anomaly for Jupiter, Saturn, Uranus and Neptune.
- Kepler's equation and a rotation into the J2000 mean ecliptic frame.

The browser date input supports 1–3000 CE. It converts the selected local civil time to a UTC-based Julian date; it does **not** perform the full UTC-to-TDB conversion expected by the JPL formulation. The result is a geometric educational approximation, not an apparent sky position. It omits light-time correction, aberration, topocentric parallax and numerical perturbation integration. Use [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) for high-precision ephemerides.

The Earth orbital row uses JPL's Earth–Moon barycentre elements as a close proxy for Earth's centre. The source values and model caveats are documented in `src/data/ephemeris.ts` and on the ephemeris tool page.

## Data conventions and numerical provenance

Scientific data snapshot: **8 November 2026**. Individual catalogue counts and mission schedules carry their own dates because they change independently.

- Planet mass, equatorial radius, mean radius, bulk density, sidereal rotation, sidereal orbital period, equatorial gravity and escape velocity: [JPL Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html). JPL defines mean radius as the radius of a sphere with equivalent volume. The NASA NSSDCA fact-sheet convention reports effective equatorial acceleration and escape velocity at the 1-bar level for gas giants. ORRERYA's JPL physical-parameter values use a different convention: equatorial gravitational acceleration is derived from GM/equatorial radius without subtracting centrifugal acceleration, while escape speed is derived using the volume-equivalent mean radius. The two source conventions are not interchangeable.
- Mean distance from the Sun, perihelion and aphelion display values: [NASA NSSDCA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/). These are not interchangeable with the full-precision J2000 semi-major axis used by the orbit tools.
- Orbital semi-major axis, eccentricity, inclination and other elements: [JPL Approximate Positions, Tables 2a and 2b](https://ssd.jpl.nasa.gov/planets/approx_pos.html), referred to the J2000 mean ecliptic and equinox. Periodic Table 2b corrections are applied to Jupiter through Neptune. The Earth element represents the Earth–Moon barycentre, a close proxy for Earth's orbit.
- Satellite mass, gravity and escape speed on the moons page are derived from JPL's satellite GM and mean radius. Mass requires division by G; surface gravity and escape speed follow from GM and radius. Those derived values inherit the uncertainties and conventions of their input measurements.
- The astronomical unit is exactly 149,597,870,700 m by IAU definition. The speed of light in vacuum is exactly 299,792,458 m/s. The gravitational constant uses the 2022 CODATA recommendation, with its stated uncertainty. The solar gravitational parameter is taken directly from JPL; it is not reconstructed from a rounded solar mass and G.
- The Sun's **99.87%** figure on the homepage is calculated from the Sun plus the eight planets only. It excludes moons and minor bodies. NASA's approximate **99.85%** whole-Solar-System mass share is a separate inventory estimate. The two values intentionally have different denominators.
- The age **4.56730 ± 0.00016 billion years** refers to the dated formation interval of calcium–aluminium-rich inclusions (CAIs) in primitive meteorites, among the earliest known solids. It does not mean all planets finished forming at that instant. NASA's general Solar System age is commonly rounded to about 4.6 billion years.
- The moon-page total of 461 recognised planetary satellites is a dated catalogue snapshot (JPL catalogue checked 4 November 2026; NASA page checked October 2026). It is not a count of every moon orbiting every asteroid or other small body.

The 3D orbital explorer uses the same JPL approximate Keplerian elements to show inclinations and positions in a WebGL scene. Its compressed mode uses logarithmic radial mapping; its linear AU mode preserves relative orbital distances but intentionally exaggerates planet diameters. Camera controls orbit, pan and zoom; this is not a six-degree-of-freedom flight camera or a multi-body integrator.

The Hohmann transfer planner is an idealised heliocentric, two-impulse calculation between circular coplanar orbits. Its delta-v values are not a launch-from-surface or low-Earth-orbit mission budget. It omits planetary gravity assists, inclination changes, finite burns, launch-window constraints and N-body perturbations.

The spectroscopy lab initially presents NASA's published JWST/NIRSpec PRISM spectrum of WASP-39 b with wavelength intervals from NASA's annotated asset page and detection significances from the associated Nature paper. It does not digitise spectral points or infer new abundances. Raw public JWST products and associated research data remain available through [MAST](https://archive.stsci.edu/missions-and-data/jwst) and [Zenodo](https://doi.org/10.5281/zenodo.7388032).

The mission timeline labels past missions by launch year. Future dates are published agency plans, not guarantees; check the linked NASA, ESA or JAXA mission page before relying on a schedule.

## Core scientific sources

- [NASA/JPL Solar System Dynamics — Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [JPL Horizons system and manual](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [JPL Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html)
- [JPL Satellite Physical Parameters](https://ssd.jpl.nasa.gov/sats/phys_par/)
- [NASA Solar System exploration](https://science.nasa.gov/solar-system/)
- [NASA NSSDC planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

NASA, JPL, ESA and mission imagery remains credited at the point of use. ORRERYA is an independent project and is not affiliated with or endorsed by those organisations.

## Scientific data standard

The project-wide evidence, unit, uncertainty, and provenance rules are documented in [the scientific data standard](docs/science-data-standard.md). In brief: every important quantity must have a defined unit and measurement convention; derived values must expose their inputs and equations; time-sensitive counts and mission dates must carry a dated snapshot; and hypotheses or model estimates must never be presented as direct observations.

The long-range planetary-position tool must be described as an approximation. Its input elements are JPL Tables 2a and 2b, with the Earth–Moon barycentre used as the Earth-orbit proxy and no full UTC-to-TDB conversion. JPL Horizons remains the reference for high-precision ephemerides.

## Scientific audit and ephemeris benchmark

The page-by-page scientific review, data conventions, completed checks and remaining release gates are recorded in [the scientific and technical audit register](docs/scientific-audit-register.md). The shared JPL approximate ephemeris implementation is independently regression-tested against fixed NASA/JPL Horizons DE441 geometric vectors at 1950, J2000 and 2026 epochs. The exact request conventions, all 24 comparison samples and discrepancy summary are documented in [the ephemeris benchmark](docs/ephemeris-benchmark.md).

The benchmark is a regression check at selected epochs, not a proof of accuracy across the whole 3000 BCE–3000 CE element-fit interval. The browser tool remains an approximate geometric model and does not yet perform a complete UTC-to-TDB conversion.

## Quality checks

Every push to `main` and every pull request runs the GitHub Actions quality workflow. The `npm run verify` command runs the 13 orbital-physics tests, 6 catalogue/provenance tests, 2 Horizons ephemeris regression tests, selected WCAG AA colour-contrast checks, a production Astro build, and generated-site checks for document structure, accessible names, image alt attributes, duplicate IDs, internal links/fragments, and complete sitemap coverage.

A committed `package-lock.json` records the dependency graph resolved by Node.js 24/npm 11 in the GitHub Actions environment. CI uses `npm ci` so the build installs the exact dependency tree represented by that lockfile rather than resolving a new compatible tree on every run. Update the lockfile deliberately when changing dependencies and verify the result in CI.
