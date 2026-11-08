# ORRERYA scientific data standard

**Baseline date:** 8 November 2026  
**Scope:** Every scientific statement, numeric value, calculation, diagram, image caption, mission-status statement and interactive model published by ORRERYA.

This standard exists to prevent false precision and to make the path from evidence to displayed text inspectable.

## 1. Evidence labels

Every claim must be treated as one of these evidence types:

- **Observed or measured:** obtained from an instrument, tracking data, laboratory measurement or documented observation.
- **Derived:** calculated from sourced inputs using a stated equation and unit system.
- **Model result:** produced by a defined physical, numerical or statistical model with stated assumptions and validity.
- **Inferred:** supported by indirect observations and a stated chain of reasoning.
- **Hypothesis:** a scientifically motivated explanation that remains unconfirmed.
- **Planned:** a future mission event or operation in an agency schedule; it is not a completed event or guarantee.

Do not turn an inference into a direct observation, a model boundary into a measured edge, or a planned event into a fact about the future.

## 2. Minimum provenance for numerical data

For each important numerical field, maintain enough information to answer:

1. What quantity is this, and what is its SI or declared unit?
2. What exact source table, dataset, mission result or publication supplies it?
3. What definition and reference convention does that source use?
4. What epoch, reference frame, pressure level or observation date applies?
5. Is the displayed value measured, derived, inferred or modelled?
6. What uncertainty or meaningful limitation applies?
7. What rounding is used for display, and what unrounded value feeds calculations?
8. When was the source checked?

A generic institutional homepage is not field-level provenance. Prefer the underlying parameter table, mission report, paper or dataset landing page. Link the reader as close to the actual source as practicable.

## 3. Physical quantities and conventions

### Mass and gravitational parameter

Mass `M` is expressed in kilograms. The gravitational parameter is `μ = GM` and is commonly published in km³ s⁻² for Solar System dynamics. Do not confuse `M` with `GM`.

When a high-quality `GM` is available, use it directly for orbital dynamics. Recovering mass through `M = GM/G` introduces the uncertainty of the measured gravitational constant `G`. Do not reconstruct a precise `GM` from a rounded mass and (G).

### Radius, diameter and shape

Distinguish equatorial radius, polar radius, mean radius and equivalent-volume radius. JPL's mean planetary radius is the radius of a sphere with the body's equivalent volume. A single spherical radius can hide the shape of a rapidly rotating or irregular body; label such simplifications.

### Density and gravity

Bulk density is total mass divided by total volume. If mass or radius is derived, say so and carry the input convention through the calculation.

Distinguish gravitational acceleration from apparent/effective surface gravity. Equatorial gravity can include rotation and the body's figure. A calculation using `GM/r²` is a spherical reference value and must be labelled as such; do not imply it reproduces local gravity on an oblate or irregular body.

### Giant-planet reference levels

Gas and ice giants do not have a solid surface comparable to Earth's. When a source gives temperature, gravity or escape speed at a 1-bar pressure level, identify that reference level. Never describe it as a solid planetary surface.

## 4. Orbital quantities and time

- A mean Sun distance, semi-major axis, instantaneous distance, perihelion and aphelion are different quantities.
- A sidereal rotation period is not a solar day; a sidereal orbital period is not automatically a seasonal year.
- State the epoch and reference frame for orbital elements.
- If using JPL long-range approximate elements, use Table 2a and its required Table 2b mean-anomaly corrections for Jupiter through Neptune. The JPL Earth row is the Earth–Moon barycentre, not Earth's centre.
- JPL's approximate-element formulation expects a Julian ephemeris date on the TDB time scale. A browser input interpreted as local civil time and converted only to UTC Julian date is a documented approximation, not a complete time-scale conversion.
- Do not imply that a heliocentric geometric position is an apparent sky position. Light-time, aberration, parallax and observer location matter for apparent coordinates.

The astronomical unit is exactly 149,597,870.7 km by IAU definition. The speed of light in vacuum is exactly 299,792.458 km s⁻¹. Keep unit conversions explicit.

## 5. Percentages, totals and denominators

Every mass fraction, share, percentage or catalogue total must state what is included and excluded. For example, the Sun's share of the Sun-plus-eight-planets total is not the same quantity as the Sun's estimated share of the broader Solar System inventory. Never put numbers with different denominators side-by-side as though they were competing measurements of one identical quantity.

## 6. Ages, formation and scientific boundaries

An age assigned to calcium–aluminium-rich inclusions (CAIs) dates some of the earliest accurately dated solids in meteorites. It does not mean that the Sun, planets or all Solar System bodies finished forming at that instant. Explain the difference between the earliest dated solids and the later accretion and evolution of planets.

The Oort Cloud is inferred from the orbits of long-period comets and dynamical models; it has not been directly imaged as a bounded cloud. Its quoted inner and outer extents are model estimates, not measured edges. The heliopause is a changing solar-wind boundary, not the edge of the Sun's gravitational influence.

## 7. Counts, mission status and updates

Moon counts, asteroid/comet inventories and mission schedules change. Every displayed snapshot must include a date and the definition of what is counted. Prefer the current source catalogue or responsible agency over a secondary summary.

For mission timelines, use explicit event dates where available and distinguish completed, underway, planned and tentative operations. Store a checked date and source with each time-sensitive item. Recheck near a milestone and whenever an agency updates its schedule.

## 8. Images and diagrams

- Credit the actual mission, instrument, agency and processing source where known.
- Distinguish a photograph, instrument image, processed/false-colour product, artist's concept and schematic illustration.
- Label diagrams "not to scale" when they are not built to a documented scale.
- An accurate image caption must not imply that an artist's concept is an observation.
- Check item-specific rights and credits before reuse; a NASA-hosted image is not automatically free of third-party restrictions.

## 9. Review gate before publication

A scientific change is ready only when:

- the claim matches its cited source and date;
- units, definitions, epoch and frame are explicit where they affect meaning;
- assumptions and uncertainty are visible to the reader;
- derived values reproduce from the documented inputs;
- visual scale and image status are honest;
- relevant unit tests and generated-site checks pass;
- the page remains understandable to a non-specialist without concealing the formal meaning.

When evidence is mixed or uncertain, preserve that uncertainty. A clear statement of what is not yet known is better science than an artificially precise answer.

## Core references

- [NASA/JPL Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html)
- [NASA/JPL Astrodynamic Parameters and DE440 gravitational parameters](https://ssd.jpl.nasa.gov/astro_par.html)
- [NASA/JPL Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [NASA/JPL Satellite Physical Parameters](https://ssd.jpl.nasa.gov/sats/phys_par/)
- [NASA NSSDCA Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [NIST CODATA recommended constants](https://physics.nist.gov/constants)
- [IAU Resolution B2: re-definition of the astronomical unit](https://www.iau.org/static/resolutions/IAU2012_English.pdf)
- [IAU meteor-astronomy definitions](https://iauarchive.eso.org/public/themes/meteors_and_meteorites/)
- [NASA/JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
