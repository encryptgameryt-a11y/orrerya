import test from "node:test";
import assert from "node:assert/strict";

import {
  dwarfPlanets,
  planetPhysics,
  satelliteDerived,
  satellitePhysical,
  solarMassDistribution,
  sunFacts
} from "../src/data/solar-system.ts";
import { ephemerisElements } from "../src/data/ephemeris.ts";
import {
  massSharePercent
} from "../src/lib/physical-mechanics.js";

const expectedPlanets = [
  "Mercury", "Venus", "Earth", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune"
];

const expectedDwarfPlanets = [
  "Ceres", "Pluto", "Haumea", "Makemake", "Eris"
];

const expectedSatellites = [
  "Moon", "Phobos", "Deimos", "Io", "Europa", "Ganymede", "Callisto",
  "Amalthea", "Mimas", "Enceladus", "Tethys", "Dione", "Rhea", "Titan",
  "Iapetus", "Ariel", "Umbriel", "Titania", "Oberon", "Miranda",
  "Triton", "Charon"
];

const expectedGMReferenceByHost = {
  Earth: "DE440",
  Mars: "MAR097",
  Jupiter: "JUP365",
  Saturn: "SAT441",
  Uranus: "URA111",
  Neptune: "NEP097",
  Pluto: "PLU060"
};

function assertPositiveFinite(value, description) {
  assert.ok(Number.isFinite(value) && value > 0, description + " must be positive and finite");
}

test("planet physical catalogue contains exactly the eight planets in order", () => {
  assert.deepEqual(planetPhysics.map(body => body.name), expectedPlanets);
  assert.equal(new Set(planetPhysics.map(body => body.name)).size, planetPhysics.length);

  for (const body of planetPhysics) {
    assertPositiveFinite(body.massKg, body.name + " mass");
    assertPositiveFinite(body.meanRadiusKm, body.name + " mean radius");
    assertPositiveFinite(body.densityGcm3, body.name + " density");
    assertPositiveFinite(body.equatorialGravityMS2, body.name + " equatorial gravity");
    assertPositiveFinite(body.escapeVelocityKmS, body.name + " escape velocity");
    assertPositiveFinite(body.meanDistanceAU, body.name + " mean distance");
    assertPositiveFinite(body.orbitDays, body.name + " sidereal orbital period");
    for (const field of ["equatorialRadiusUncertaintyKm", "meanRadiusUncertaintyKm",
      "massUncertaintyKg", "densityUncertaintyGcm3"]) {
      assertPositiveFinite(body[field], body.name + " quoted " + field);
    }
  }

  const neptune = planetPhysics.find(body => body.name === "Neptune");
  assert.equal(neptune.equatorialRadiusUncertaintyKm, 15);
  assert.equal(neptune.meanRadiusUncertaintyKm, 19);
  assert.equal(neptune.massUncertaintyKg, 4.8e21);
  assert.equal(neptune.densityUncertaintyGcm3, 0.004);

  for (let index = 1; index < planetPhysics.length; index += 1) {
    assert.ok(
      planetPhysics[index].meanDistanceAU > planetPhysics[index - 1].meanDistanceAU,
      "Planet mean distances should increase in canonical order"
    );
    assert.ok(
      planetPhysics[index].orbitDays > planetPhysics[index - 1].orbitDays,
      "Planet sidereal periods should increase in canonical order"
    );
  }
});

test("JPL long-range orbital element catalogue contains one valid record per planet", () => {
  assert.deepEqual(ephemerisElements.map(body => body.slug), expectedPlanets.map(name => name.toLowerCase()));
  assert.equal(new Set(ephemerisElements.map(body => body.slug)).size, 8);

  for (const body of ephemerisElements) {
    assertPositiveFinite(body.a, body.name + " semi-major axis");
    assert.ok(Number.isFinite(body.e) && body.e >= 0 && body.e < 1,
      body.name + " eccentricity must describe an elliptical orbit");
    for (const field of ["aRate", "eRate", "inclination", "inclinationRate",
      "meanLongitude", "meanLongitudeRate", "longitudePerihelion",
      "longitudePerihelionRate", "longitudeNode", "longitudeNodeRate",
      "b", "c", "s", "f"]) {
      assert.ok(Number.isFinite(body[field]), body.name + " " + field + " must be finite");
    }
  }

  // Exact published Table 2a semi-major axis/eccentricity values and Table
  // 2b periodic coefficients. These catch accidental mixing of the shorter
  // 1800–2050 Table 1 fit with the 3000 BCE–3000 CE Table 2a fit.
  const published = {
    mercury: [0.38709843, 0.20563661, 0, 0, 0, 0],
    venus: [0.72332102, 0.00676399, 0, 0, 0, 0],
    earth: [1.00000018, 0.01673163, 0, 0, 0, 0],
    mars: [1.52371243, 0.09336511, 0, 0, 0, 0],
    jupiter: [5.20248019, 0.04853590, -0.00012452, 0.06064060, -0.35635438, 38.35125000],
    saturn: [9.54149883, 0.05550825, 0.00025899, -0.13434469, 0.87320147, 38.35125000],
    uranus: [19.18797948, 0.04685740, 0.00058331, -0.97731848, 0.17689245, 7.67025000],
    neptune: [30.06952752, 0.00895439, -0.00041348, 0.68346318, -0.10162547, 7.67025000]
  };
  for (const body of ephemerisElements) {
    assert.deepEqual(
      [body.a, body.e, body.b, body.c, body.s, body.f],
      published[body.slug],
      body.name + " must match JPL Tables 2a and 2b"
    );
  }

  const outerCorrections = ephemerisElements.filter(body =>
    ["jupiter", "saturn", "uranus", "neptune"].includes(body.slug)
  );
  assert.equal(outerCorrections.length, 4);
  assert.ok(outerCorrections.every(body => body.c !== 0 && body.s !== 0),
    "Every planet from Jupiter through Neptune must retain both periodic Table 2b coefficients");
});

test("dwarf-planet catalogue contains the five named reference worlds", () => {
  assert.deepEqual(dwarfPlanets.map(body => body.name), expectedDwarfPlanets);
  assert.equal(new Set(dwarfPlanets.map(body => body.name)).size, 5);

  for (const body of dwarfPlanets) {
    assertPositiveFinite(body.massKg, body.name + " mass");
    assertPositiveFinite(body.meanRadiusKm, body.name + " mean radius");
    assertPositiveFinite(body.densityGcm3, body.name + " density");
    assertPositiveFinite(body.equatorialGravityMS2, body.name + " equatorial gravity");
    assertPositiveFinite(body.escapeVelocityKmS, body.name + " escape velocity");
    assertPositiveFinite(body.orbitDays, body.name + " orbital period");
    assertPositiveFinite(body.equatorialRadiusKm, body.name + " equatorial radius");
    if (body.massUncertaintyKg !== undefined) {
      assertPositiveFinite(body.massUncertaintyKg, body.name + " mass uncertainty");
    }
    if (body.meanRadiusUncertaintyKm !== undefined) {
      assertPositiveFinite(body.meanRadiusUncertaintyKm, body.name + " mean-radius uncertainty");
    }
    if (body.equatorialRadiusUncertaintyKm !== undefined) {
      assertPositiveFinite(body.equatorialRadiusUncertaintyKm, body.name + " equatorial-radius uncertainty");
    }
    if (body.densityUncertaintyGcm3 !== undefined) {
      assertPositiveFinite(body.densityUncertaintyGcm3, body.name + " density uncertainty");
    }
  }

  const ceres = dwarfPlanets.find(body => body.name === "Ceres");
  assert.equal(ceres.equatorialRadiusKm, 482.1);
  assert.equal(ceres.massUncertaintyKg, 1.3e16);
  const pluto = dwarfPlanets.find(body => body.name === "Pluto");
  assert.equal(pluto.meanRadiusUncertaintyKm, 1.6);
  assert.equal(pluto.massUncertaintyKg, 6.0e18);
  const makemake = dwarfPlanets.find(body => body.name === "Makemake");
  assert.equal(makemake.meanRadiusUncertaintyKm, 7);
  const eris = dwarfPlanets.find(body => body.name === "Eris");
  assert.equal(eris.meanRadiusUncertaintyKm, 50);
  assert.equal(eris.massUncertaintyKg, 2.0e20);

  const haumea = dwarfPlanets.find(body => body.name === "Haumea");
  assert.match(haumea.note, /elongated|triaxial|shape/i,
    "Haumea's non-spherical shape limitation must remain explicit");
  assert.equal(haumea.equatorialRadiusKm, 870);
  assert.equal(haumea.meanRadiusKm, 715);
  assert.ok(haumea.equatorialRadiusKm > haumea.meanRadiusKm,
    "Haumea's equatorial and volume-equivalent radii must not be conflated");
});

test("selected satellite catalogue has unique bodies, valid inputs and traceable GM solutions", () => {
  assert.deepEqual(satellitePhysical.map(body => body.name), expectedSatellites);
  assert.equal(new Set(satellitePhysical.map(body => body.name)).size, expectedSatellites.length);

  const moonRecord = satellitePhysical.find(body => body.name === "Moon");
  assert.equal(Object.hasOwn(moonRecord, "equatorialRadiusUncertaintyKm"), false,
    "Planet/dwarf uncertainty metadata must not leak into satellite records");
  assert.equal(Object.hasOwn(moonRecord, "massUncertaintyKg"), false,
    "Planet/dwarf uncertainty metadata must not leak into satellite records");

  for (const body of satellitePhysical) {
    assertPositiveFinite(body.gmKm3S2, body.name + " GM");
    assertPositiveFinite(body.meanRadiusKm, body.name + " mean radius");
    assert.ok(typeof body.gmReference === "string" && body.gmReference.length > 0,
      body.name + " must identify its JPL GM solution");
    assert.equal(body.gmReference, expectedGMReferenceByHost[body.host],
      body.name + " GM solution must match the JPL host-system solution");
    const derived = satelliteDerived(body);
    assertPositiveFinite(derived.massKg, body.name + " derived mass");
    assertPositiveFinite(derived.densityGcm3, body.name + " derived density");
    assertPositiveFinite(derived.gravityMS2, body.name + " reference gravity");
    assertPositiveFinite(derived.escapeVelocityKmS, body.name + " spherical escape speed");
  }
});

test("Charon's published JPL density discrepancy remains visible in the derived result", () => {
  const charon = satellitePhysical.find(body => body.name === "Charon");
  const density = satelliteDerived(charon).densityGcm3;
  assert.ok(density > 1.70 && density < 1.71,
    "GM/radius-derived Charon density should remain near 1.705 g/cm³");
  assert.ok(Math.abs(density - 1.853) > 0.1,
    "The derived value must not silently become JPL's non-reproducible 1.853 table entry");
});

test("solar mass share uses an explicit Sun-plus-eight-planets denominator", () => {
  assertPositiveFinite(sunFacts.massKg, "Solar mass");
  const recomputed = massSharePercent(
    sunFacts.massKg,
    planetPhysics.map(body => body.massKg)
  );
  assert.equal(
    solarMassDistribution.sunShareOfSunPlusEightPlanetsPercent,
    recomputed
  );
  assert.ok(recomputed > 99.86 && recomputed < 99.87);
  assert.equal(solarMassDistribution.nasaWholeSolarSystemEstimate.sunPercent, 99.85);
  assert.notEqual(
    recomputed,
    solarMassDistribution.nasaWholeSolarSystemEstimate.sunPercent,
    "The two percentages must remain distinct because their denominators differ"
  );
  assert.ok(solarMassDistribution.eightPlanetMassKg > 0);
});
