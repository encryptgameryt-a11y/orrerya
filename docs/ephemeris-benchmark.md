# ORRERYA planetary ephemeris benchmark

**Run date:** 8 November 2026  
**Implementation:** `src/lib/jpl-approx-ephemeris.js`  
**Reference:** NASA/JPL Horizons, DE441  
**Approximation:** NASA/JPL Solar System Dynamics Tables 2a and 2b

## Method

The browser model uses JPL Table 2a secular Keplerian elements and the required Table 2b periodic mean-anomaly corrections for Jupiter through Neptune. It solves Kepler's equation and rotates the orbital-plane coordinates into the J2000 mean ecliptic frame.

Reference vectors were requested from the JPL Horizons API with the following conventions:

- Centre: Sun (body-centred code `500@10`).
- Targets: Mercury (199), Venus (299), Earth–Moon barycentre (3), Mars (499), Jupiter (599), Saturn (699), Uranus (799), Neptune (899).
- Ephemeris: DE441.
- Vector corrections: none (geometric, not light-time corrected).
- Reference plane/system: ecliptic, J2000.0.
- Output units: AU and days.
- Time scale: TDB.
- Epochs: 1950-01-01 00:00 TDB (JD 2433282.5), J2000.0 (JD 2451545.0), and 2026-11-08 00:00 TDB (JD 2461352.5).

The test compares heliocentric longitude, latitude and radial distance. It does **not** treat the result as an observed sky position or a full three-dimensional position-error bound.

## Results

Maximum absolute discrepancy across the three tested epochs:

| Target | Longitude | Latitude | Radial distance |
|---|---:|---:|---:|
| Mercury | 16.0 arcsec | 5.2 arcsec | 1,379 km |
| Venus | 8.7 arcsec | 10.6 arcsec | 479 km |
| Earth–Moon barycentre | 14.0 arcsec | 1.8 arcsec | 5,718 km |
| Mars | 82.8 arcsec | 18.3 arcsec | 29,337 km |
| Jupiter | 485.1 arcsec | 31.4 arcsec | 233,031 km |
| Saturn | 1,152.7 arcsec | 48.6 arcsec | 2,349,390 km |
| Uranus | 279.0 arcsec | 5.7 arcsec | 3,804,659 km |
| Neptune | 251.6 arcsec | 3.9 arcsec | 927,331 km |

Each maximum is within 1.5 times the corresponding JPL-published nominal error for the long-range (3000 BCE–3000 CE) approximation. That 1.5 factor is a regression-test margin, **not** a formal JPL accuracy guarantee. JPL explicitly calls the figures nominal errors.

## Interpretation and limits

- All 24 planet/EMB samples (8 targets × 3 epochs) pass the regression guard.
- The Earth row is the Earth–Moon barycentre, matching the JPL source element. It is a proxy for Earth's centre; the Moon's displacement is not modelled.
- Only three modern epochs were independently benchmarked. The automated check does not certify every date in the published 3000 BCE–3000 CE fit interval.
- The browser input converts local civil time to a UTC-based Julian date but does not yet perform a complete UTC-to-TDB conversion.
- The model is a teaching-grade approximate ephemeris. It does not integrate perturbations or provide apparent coordinates, light-time, aberration or topocentric parallax. Use JPL Horizons for precision work.

## Reproduction

The fixed Horizons vector snapshots and regression assertions are stored in `scripts/ephemeris-horizons.test.mjs`. Run:

```sh
npm run test:ephemeris
```

Primary references:

- [JPL Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [JPL Horizons system](https://ssd.jpl.nasa.gov/horizons/)
- [Horizons API documentation](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
