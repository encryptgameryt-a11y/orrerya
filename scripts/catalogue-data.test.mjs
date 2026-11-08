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
  }

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

  const outerCorrections = ephemerisElements.filter(body =>
    ["jupiter", "saturn", "uranus", "neptune"].includes(body.slug)
  );
  assert.equal(outerCorrections.length, 4);
  assert.ok(outerCorrections.some(body => body.c !== 0 || body.s !== 0),
    "Jupiter through Neptune must retain non-zero Table 2b periodic corrections");
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
  }

  const haumea = dwarfPlanets.find(body => body.name === "Haumea");
  assert.match(haumea.note, /elongated|triaxial|shape/i,
    "Haumea's non-spherical shape limitation must remain explicit");
});

test("selected satellite catalogue has unique bodies, valid inputs and traceable GM solutions", () => {
  assert.deepEqual(satellitePhysical.map(body => body.name), expectedSatellites);
  assert.equal(new Set(satellitePhysical.map(body => body.name)).size, expectedSatellites.length);

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
