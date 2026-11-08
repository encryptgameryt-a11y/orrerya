# ORRERYA scientific and technical audit register

**Audit snapshot:** 8 November 2026  
**Repository:** `encryptgameryt-a11y/orrerya`  
**Branch:** `foundation/scientific-quality-2026-11`  
**Status:** Focused page-by-page scientific review of the principal datasets, equations and model conventions completed. Automated checks and independent ephemeris regression tests pass. This is not a claim that every prose sentence has a dedicated primary citation or that browser/accessibility and production-edge checks are complete.

This register is intentionally explicit about the boundary between source-backed reference data, derived quantities, approximate models, inferences and outstanding operational QA. A green build is not scientific certification.

## 1. Page-by-page scientific review

| Page / area | Audit result | Required qualification retained in the site |
|---|---|---|
| Home and Solar System Atlas | The inventory and classifications are consistent: one Sun, eight planets, five widely recognised dwarf planets, rings, moons, small-body populations and outer-system regions. Atlas distance figures use AU and distinguish broad population ranges from spacecraft crossings. | The Atlas is an overview, not a census of every object. The 22 featured moons are a selected sample, not a complete catalogue. |
| Sun | Checked the NASA reference mass, radius, density, luminosity, spectral class, surface gravity, escape speed, core-temperature scale and differential rotation wording. Recomputed the Sun's share from the rounded Sun and eight-planet masses. | The 99.87% result is Sun ÷ (Sun + eight classical planets); NASA's approximate 99.85% refers to a broader inventory. The rounded NASA mass is not an exact immutable value; use JPL GM for orbital dynamics. Core temperature is model-dependent. |
| Eight planet profiles | Checked the eight-planet order and principal physical figures against JPL Planetary Physical Parameters and NASA NSSDCA fact-sheet conventions. Checked equatorial diameter versus JPL volume-equivalent mean radius; mass, density, sidereal rotation/orbit, gravity, escape speed and orbit labels. JPL's quoted source uncertainties are now represented in the data model and shown alongside the profiles. | Giant-planet gravity, escape speed and fact-sheet mean temperature use the 1-bar reference level; these are not properties of a solid surface. Terrestrial surface values and gas-giant atmospheric reference values are not interchangeable. JPL marks density, gravity and escape speed as derived fields. |
| Planetary classification and dwarf planets | Checked the IAU 2006 dwarf-planet criteria and the separation between five commonly recognised objects and candidates. JPL's equatorial radii and volume-equivalent mean radii are now displayed separately, with source uncertainties where published. | Haumea is strongly elongated (JPL equatorial radius 870 km; volume-equivalent mean radius 715 km); no one spherical diameter describes its shape. An absent uncertainty means the source table does not quote one, not that the value is exact. |
| Moons and rings | Checked the GM-derived calculation chain and each selected satellite's GM solution identifier against the JPL satellite table. The 22 featured bodies have host/solution provenance. Kept the Charon density inconsistency visible instead of silently repeating a value that does not reproduce from the tabulated GM and radius. | Mass is GM/G; spherical reference gravity is GM/r²; ideal spherical escape speed is √(2GM/r); bulk density uses an equivalent-volume sphere. These do not model local topography, rotation or irregular shape, and uncertainties are not propagated. Charon's GM/radius-derived density is about 1.705 g/cm³, not the JPL table's listed 1.853 g/cm³. |
| Asteroids, comets and meteors | Checked the meteor/meteoroid/meteorite distinctions against IAU terminology. C/S/M asteroid classes are described as broad spectral/compositional categories rather than simple recipes. The Ceres, Vesta, Pallas and Hygiea sizes cite the VLT/SPHERE shape survey and are explicitly volume-equivalent diameters with reported uncertainties. Comet tail physics and selected mission/sample examples were reviewed. | IAU meteoroid size limits are working conventions with no sharp natural boundary. Comet nucleus sizes inferred from brightness require modelling and coma subtraction; the Bernardinelli–Bernstein value is not a resolved sharp-disk measurement. |
| Outer Solar System | Reviewed Kuiper Belt, resonant/plutino, scattered-disc, detached-object and Centaur labels; the Oort Cloud's inferred status and approximate distance scale; and the distinction among termination shock, heliosheath and heliopause. | The Kuiper Belt's ~30–50 AU is a broad region, not a sharp wall. The Oort Cloud is inferred from long-period comet orbits and dynamical models; its ~5,000–100,000 AU scale is model-dependent and it has not been directly imaged as a bounded cloud. Voyager heliopause crossings are two directional measurements, not a universal spherical radius. The heliopause is not the edge of solar gravity. |
| Planetary migration and Solar System formation | Reviewed the separation of observations, model interpretations and hypotheses. The quoted CAI age (4.56730 ± 0.00016 Ga) is correctly described as dating some of the earliest accurately dated solids, not the completion of planet formation. | The Nice model and related migration scenarios remain dynamical models constrained by observations, not a directly observed movie of Solar System history. |
| Interactive physics tools | Checked W = mg and the distinction between mass (kg) and weight (N); exact AU definition; speed of light in vacuum; distance/light-time conversion; size comparisons; two-body Kepler orbit equations, vis-viva relation and anomaly-based speed variation. Checked reduced-motion behavior for the orbit animation. | Gravity inputs are reference values (equatorial / 1-bar as applicable). The orbit lab is an idealised Sun–planet two-body teaching model, not a numerical N-body integration. The 1-AU light-time result is a one-way vacuum calculation. |
| Planetary correlation lab | Checked the seven plotted variables, axis transforms, linear regression and Pearson correlation calculation. | The eight planets are a tiny, selected dataset. A correlation in linear or log coordinates is descriptive and does not establish causation or identify the underlying physics. |
| Glossary | Reviewed definitions for AU, barycentre, orbit elements, eccentricity, escape velocity, meteor terms, heliosphere and other frequently used terms. | Introductory definitions are context-aware summaries; precise usage can depend on the reference frame and formal discipline standard. |
| Mission timeline | Reviewed the selected mission facts and dates against agency records where checked. JUICE's 28 September 2026 Earth flyby is treated as completed; BepiColombo's November/December 2026 milestones and other future events remain scheduled plans, not completed achievements. Juno's active status is distinguished from an earlier nominal funded extension period. | Dates and mission status are a dated snapshot (8 November 2026), not a live feed. Agency schedule pages are authoritative for subsequent changes; future dates can slip. The mission list is deliberately selective rather than exhaustive. |

## 2. Independent ephemeris benchmark

The site calculation has been extracted into `src/lib/jpl-approx-ephemeris.js`, shared by the browser explorer and test code. It implements JPL Solar System Dynamics Table 2a, including Table 2b periodic mean-anomaly terms for Jupiter through Neptune, solves Kepler's equation, and rotates positions into the J2000 mean ecliptic frame.

The implementation was compared with live JPL Horizons DE441 geometric Sun-centred vectors for all eight planets / the Earth–Moon barycentre at three exact TDB epochs: 1950-01-01, J2000.0, and 2026-11-08. All 24 target/epoch comparisons passed a 1.5× regression guard around JPL's published nominal longitude, latitude and distance errors. Maximum observed discrepancies and the exact vectors/method are in [`docs/ephemeris-benchmark.md`](./ephemeris-benchmark.md). The reproducible test is `npm run test:ephemeris`.

Important interpretation:

- JPL's Table 2a Earth row represents the Earth–Moon barycentre (EMB), not the geocentre. The explorer now calls its Earth-referenced distances and directions EMB-centred proxies, with the Moon displacement left unresolved.
- The 1.5× threshold is a code-regression guard, not a new guarantee of JPL accuracy. JPL calls its published figures nominal errors.
- Three epochs validate implementation behavior at selected points; they do not exhaustively validate every date in the 3000 BCE–3000 CE fit interval.
- The browser accepts local civil time and derives a UTC-based Julian date; it does not yet perform a complete UTC-to-TDB conversion.
- The model is geometric and approximate. It does not supply light-time-corrected apparent coordinates, aberration, topocentric parallax or numerically integrated perturbations. Use JPL Horizons for high-precision positions.

## 3. Scientific-data conventions to preserve

- **Source provenance:** each quantity should identify its source table, date/snapshot, unit, reference level, frame/epoch and uncertainty when available.
- **Measured vs derived vs modelled:** do not call a derived table quantity a direct measurement. JPL marks several density/gravity/escape-speed fields as derived.
- **Mass vs GM:** use JPL gravitational parameters for dynamics. Mass requires division by G and therefore inherits the uncertainty in G; never imply an unjustified extra precision.
- **Radii:** distinguish equatorial radius, mean radius (sphere of equivalent volume), polar radius and shape model. Do not treat one diameter as universal for oblate or triaxial objects.
- **Atmospheric reference levels:** giant-planet 1-bar quantities are not measurements at a solid ground surface.
- **Time and reference frames:** orbital elements must carry their epoch, plane and time scale. UTC, TT and TDB are not interchangeable at precision levels relevant to ephemerides.
- **Percentages:** state the denominator. The 99.87% eight-planet denominator and NASA's broader approximate 99.85% inventory are not the same ratio.
- **Uncertainty:** keep source uncertainties visible, avoid false precision, and do not imply that an uncertainty was propagated where it was not.
- **Formation / dynamics:** separate observations, numerical or analytical models, and hypotheses. A fit or simulation is not direct observation.
- **Distant populations:** distinguish the observed objects from model-inferred reservoirs and estimated boundaries.
- **Images:** distinguish spacecraft observations, telescope observations, mosaics, enhanced/false colour and artist concepts. Image hosting location is not a substitute for verifying copyright/reuse terms.
- **Mission status:** date every schedule snapshot. An announced arrival, planned manoeuvre or nominal mission extension is not proof of completion or a hard end date.

## 4. Engineering verification completed

The latest PR-head GitHub Actions run is **#166 — success**:  
https://github.com/encryptgameryt-a11y/orrerya/actions/runs/42457169871

Run results:

- 13/13 physics tests passed.
- 6/6 catalogue/provenance tests passed, including planet/dwarf uncertainty fields and data-shape checks.
- 2/2 ephemeris benchmark tests passed, validating 24 Horizons snapshots plus the J2000 time conversion.
- 115 selected light-theme WCAG AA contrast checks passed (minimum normal-text ratio 4.5:1 for the sampled token/background combinations).
- Astro production build passed.
- Generated-site integrity checks passed: 26 HTML documents (25 public routes plus 404), 677 same-site links, 53 images checked for alt-attribute presence, 13 form controls checked for labels, and 40 buttons checked for accessible names.
- Reproducible dependency installation uses the committed lockfile and `npm ci`.

These checks validate the code/data checks listed above. They are not a full browser accessibility audit, visual regression test, or legal rights review.

## 5. Remaining release-gate work (not falsely marked complete)

1. **Visual and interaction QA:** perform real desktop/mobile browser runs on current devices; inspect responsive layout, keyboard-only navigation, focus visibility/order, screen-reader output, zoom/reflow, contrast in all themes/states, reduced motion, and runtime console errors. The static generated-site checks do not replace these.
2. **Production edge configuration:** retrieve actual live Cloudflare response headers and test CSP behavior, caching and canonical responses after release. Repository configuration alone does not prove that every deployed path receives the intended headers.
3. **External asset and link audit:** check image URLs and outbound references for availability, correct attribution, processing labels and each asset's actual reuse/licensing terms. NASA/ESA hosting does not automatically establish ownership or unlimited reuse rights.
4. **Broader ephemeris validation:** expand Horizons tests across more epochs (including near the ends of the published interval), time zones, leap/time-scale boundaries, and representative planetary conjunction/configuration cases. Consider a full UTC-to-TDB conversion and explicit observer-centred/apparent mode only as a separately scoped upgrade.
5. **Catalogue completeness:** the moons page features 22 selected satellites and quotes a dated recognised-moon count; do not describe it as a complete moon catalogue. A future exhaustive list requires a dated, reproducible database extract and inclusion policy.
6. **Ongoing content freshness:** recheck mission schedules and changing catalogue counts whenever dates pass or primary sources update; maintain a dated review record.
7. **Sentence-level citations:** core numerical claims and key definitions have primary/peer-reviewed source links, but not every narrative sentence across every page has an individual citation. Add citations where a claim is specialised, disputed or likely to change.

## 6. Release decision

**Scientific foundation / core numeric model:** passes the current review and automated regression gates, subject to the limitations above.  
**Full operational and accessibility release certification:** not yet complete.

Do not call the whole website “scientifically complete” merely because CI is green. A documented uncertainty or explicit unknown is better than unsupported precision. Production should remain unchanged until this PR is reviewed and explicitly merged.
