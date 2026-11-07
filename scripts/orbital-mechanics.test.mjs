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
