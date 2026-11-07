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

The production build is written to `dist/`. `npm run check:site` checks generated HTML for core document metadata, page headings, image alternative text, duplicate IDs, and broken same-site links and fragments.

## Site map

- `/` — home and introductory Solar System overview
- `/solar-system/` — measured Solar System atlas
- `/planets/` and `/planets/:slug/` — eight planet profiles
- `/explore/` — entry point for the Sun, moons, dwarf planets, small bodies and the outer Solar System
- `/science/` — fundamental interactions and planetary physics
- `/science/planetary-migration/` — planetary migration explainer
- `/missions/` — spacecraft and mission history
- `/glossary/` — searchable astronomy terminology
- `/tools/` — calculators, orbit visualisation, correlation analysis and planetary positions
- `/about/` — editorial policy, image attribution and corrections

## Scientific methods and limitations

ORRERYA is educational material, not a navigation or observational-planning system. Values are rounded for readability; the relevant page should identify the source, reference frame, epoch, measurement convention and important uncertainty where those details matter.

The planetary-position explorer uses the NASA/JPL Solar System Dynamics long-range approximate-position method:

- Table 2a Keplerian elements and rates, fitted for 3000 BCE–3000 CE.
- Table 2b periodic corrections to mean anomaly for Jupiter, Saturn, Uranus and Neptune.
- Kepler's equation and a rotation into the J2000 mean ecliptic frame.

The browser date input supports 1–3000 CE. It converts the selected local civil time to a UTC-based Julian date; it does **not** perform the full UTC-to-TDB conversion expected by the JPL formulation. The result is a geometric educational approximation, not an apparent sky position. It omits light-time correction, aberration, topocentric parallax and numerical perturbation integration. Use [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) for high-precision ephemerides.

The Earth orbital row uses JPL's Earth–Moon barycentre elements as a close proxy for Earth's centre. The source values and model caveats are documented in `src/data/ephemeris.ts` and on the ephemeris tool page.

## Core scientific sources

- [NASA/JPL Solar System Dynamics — Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [JPL Horizons system and manual](https://ssd.jpl.nasa.gov/horizons/manual.html)
- [JPL Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html)
- [JPL Satellite Physical Parameters](https://ssd.jpl.nasa.gov/sats/phys_par/)
- [NASA Solar System exploration](https://science.nasa.gov/solar-system/)
- [NASA NSSDC planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

NASA, JPL, ESA and mission imagery remains credited at the point of use. ORRERYA is an independent project and is not affiliated with or endorsed by those organisations.

## Quality checks

Every push to `main` and every pull request runs the GitHub Actions quality workflow. It installs the project dependencies, builds the static site and runs the generated-site integrity checks.
