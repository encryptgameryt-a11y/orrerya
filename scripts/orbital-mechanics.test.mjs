import {
  escapeSpeedFromGM,
  massFromGM,
  massSharePercent,
  surfaceGravityFromGM
} from "../src/lib/physical-mechanics.js";
import test from "node:test";
import assert from "node:assert/strict";
import {
  ASTRONOMICAL_UNIT_KM,
  SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2,
  meanAnomalyFromTrueAnomaly,
  orbitalState,
  solveEccentricAnomaly,
  trueAnomalyFromMeanAnomaly
} from "../src/lib/orbital-mechanics.js";
import {
  EARTH_SIDEREAL_YEAR_DAYS,
  GRAVITATIONAL_CONSTANT_KM3_KG_S2,
  JULIAN_YEAR_DAYS,
  SPEED_OF_LIGHT_KM_S
} from "../src/lib/scientific-constants.js";

function angularDifferenceDegrees(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

test("Kepler solver satisfies M = E - e sin(E)", () => {
  for (const eccentricity of [0, 0.0167, 0.20563661, 0.7]) {
    for (const meanDegrees of [0, 1, 45, 90, 179, 270, 359]) {
      const meanRadians = meanDegrees * Math.PI / 180;
      const eccentricAnomaly = solveEccentricAnomaly(meanRadians, eccentricity);
      const residual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanRadians;
      const wrappedResidual = Math.atan2(Math.sin(residual), Math.cos(residual));
      assert.ok(Math.abs(wrappedResidual) < 1e-11, `e=${eccentricity}, M=${meanDegrees}°`);
    }
  }
});

test("true and mean anomaly conversions round-trip", () => {
  for (const eccentricity of [0, 0.0167, 0.20563661, 0.7]) {
    for (const trueDegrees of [0, 1, 17.5, 45, 90, 135, 180, 225, 270, 315, 359.9, 360]) {
      const meanRadians = meanAnomalyFromTrueAnomaly(trueDegrees, eccentricity);
      const recovered = trueAnomalyFromMeanAnomaly(meanRadians, eccentricity);
      assert.ok(angularDifferenceDegrees(recovered, trueDegrees) < 1e-9,
        `e=${eccentricity}, true anomaly=${trueDegrees}°`);
    }
  }
});

test("one orbit is periodic in mean anomaly", () => {
  for (const eccentricity of [0, 0.0167, 0.20563661]) {
    const start = meanAnomalyFromTrueAnomaly(123.4, eccentricity);
    const afterOneOrbit = trueAnomalyFromMeanAnomaly(start + 2 * Math.PI, eccentricity);
    assert.ok(angularDifferenceDegrees(afterOneOrbit, 123.4) < 1e-9);
  }
});

test("perihelion and aphelion distances match a(1 ± e)", () => {
  const a = 5.2028;
  const e = 0.0485359;
  const perihelion = orbitalState(a, e, 0);
  const aphelion = orbitalState(a, e, 180);
  assert.ok(Math.abs(perihelion.distanceAu - a * (1 - e)) < 1e-12);
  assert.ok(Math.abs(aphelion.distanceAu - a * (1 + e)) < 1e-12);
  assert.ok(Math.abs(perihelion.perihelionAu - perihelion.distanceAu) < 1e-12);
  assert.ok(Math.abs(aphelion.aphelionAu - aphelion.distanceAu) < 1e-12);
});

test("orbital speed is greater at perihelion than aphelion", () => {
  const a = 1;
  const e = 0.20563661;
  const perihelion = orbitalState(a, e, 0);
  const aphelion = orbitalState(a, e, 180);
  assert.ok(perihelion.speedKmS > aphelion.speedKmS);
});

test("vis-viva specific orbital energy stays constant around an ellipse", () => {
  const aAu = 2.767;
  const e = 0.075;
  const expectedEnergy = -SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
    / (2 * aAu * ASTRONOMICAL_UNIT_KM);

  for (const anomaly of [0, 30, 90, 150, 180, 240, 300]) {
    const state = orbitalState(aAu, e, anomaly);
    const energy = (state.speedKmS ** 2) / 2
      - SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2 / state.distanceKm;
    assert.ok(Math.abs(energy - expectedEnergy) / Math.abs(expectedEnergy) < 1e-12,
      `true anomaly=${anomaly}°`);
  }
});

test("invalid orbital inputs fail clearly", () => {
  assert.throws(() => orbitalState(0, 0.1, 0), RangeError);
  assert.throws(() => orbitalState(1, 1, 0), RangeError);
  assert.throws(() => orbitalState(1, -0.1, 0), RangeError);
  assert.throws(() => meanAnomalyFromTrueAnomaly(Number.NaN, 0.1), RangeError);
});


test("shared astronomical constants match their cited definitions", () => {
  assert.equal(ASTRONOMICAL_UNIT_KM, 149597870.7);
  assert.equal(SPEED_OF_LIGHT_KM_S, 299792.458);
  assert.equal(JULIAN_YEAR_DAYS, 365.25);
  assert.equal(EARTH_SIDEREAL_YEAR_DAYS, 365.25635535);
  assert.equal(GRAVITATIONAL_CONSTANT_KM3_KG_S2, 6.67430e-20);
  assert.equal(SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2, 1.32712440041279419e11);
});

test("Earth-like J2000 orbit gives the expected sidereal-year scale", () => {
  const semiMajorAxisAu = 1.00000018; // JPL Earth–Moon barycentre element
  const semiMajorAxisKm = semiMajorAxisAu * ASTRONOMICAL_UNIT_KM;
  const periodDays = 2 * Math.PI
    * Math.sqrt((semiMajorAxisKm ** 3) / SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2)
    / 86400;
  // This is a Sun-only two-body estimate; the Earth–Moon mass and N-body
  // perturbations account for the small difference from the JPL sidereal period.
  assert.ok(Math.abs(periodDays - EARTH_SIDEREAL_YEAR_DAYS) < 0.001);
});

test("satellite physical calculations preserve units and match lunar reference scales", () => {
  const moonGM = 4902.800; // JPL DE440, km^3 s^-2
  const moonMeanRadiusKm = 1737.4; // JPL equivalent-volume mean radius
  const moonMassKg = massFromGM(moonGM, GRAVITATIONAL_CONSTANT_KM3_KG_S2);
  const moonGravityMS2 = surfaceGravityFromGM(moonGM, moonMeanRadiusKm);
  const moonEscapeSpeedKmS = escapeSpeedFromGM(moonGM, moonMeanRadiusKm);

  assert.ok(moonMassKg > 7.34e22 && moonMassKg < 7.35e22);
  assert.ok(moonGravityMS2 > 1.62 && moonGravityMS2 < 1.63);
  assert.ok(moonEscapeSpeedKmS > 2.37 && moonEscapeSpeedKmS < 2.38);
});

test("Sun mass share uses the explicitly supplied denominator", () => {
  const sunMassKg = 1.9884e30; // NASA NSSDCA Sun Fact Sheet
  const planetMassesKg = [
    3.30103e23, 4.86731e24, 5.97217e24, 6.41691e23,
    1.898125e27, 5.68317e26, 8.68099e25, 1.024092e26
  ];
  const sunPlusPlanets = massSharePercent(sunMassKg, planetMassesKg);
  const sunOnly = massSharePercent(sunMassKg, []);

  assert.ok(sunPlusPlanets > 99.86 && sunPlusPlanets < 99.87);
  assert.equal(sunOnly, 100);
});

test("physical calculation helpers reject invalid values", () => {
  assert.throws(() => massFromGM(0, GRAVITATIONAL_CONSTANT_KM3_KG_S2), RangeError);
  assert.throws(() => massFromGM(1, 0), RangeError);
  assert.throws(() => surfaceGravityFromGM(1, -1), RangeError);
  assert.throws(() => escapeSpeedFromGM(Number.NaN, 1), RangeError);
  assert.throws(() => massSharePercent(1, [2, -1]), RangeError);
});
