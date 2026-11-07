/**
 * Two-body orbital mechanics helpers used by the interactive orbit model.
 * Distances are in AU or km as named; speeds are in km/s.
 */
import {
  ASTRONOMICAL_UNIT_KM,
  SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
} from "./scientific-constants.js";

export {
  ASTRONOMICAL_UNIT_KM,
  SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
};

const TWO_PI = 2 * Math.PI;

function assertEccentricity(eccentricity) {
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError("Eccentricity must be finite and in the interval [0, 1).");
  }
}

function wrapRadians(angle) {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

/** Solve Kepler's equation M = E - e sin(E), returning E in radians [0, 2π). */
export function solveEccentricAnomaly(meanAnomalyRadians, eccentricity) {
  assertEccentricity(eccentricity);
  if (!Number.isFinite(meanAnomalyRadians)) {
    throw new RangeError("Mean anomaly must be a finite angle in radians.");
  }

  const meanAnomaly = wrapRadians(meanAnomalyRadians);
  let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : Math.PI;

  for (let iteration = 0; iteration < 30; iteration += 1) {
    const residual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    const derivative = 1 - eccentricity * Math.cos(eccentricAnomaly);
    const correction = residual / derivative;
    eccentricAnomaly -= correction;
    if (Math.abs(correction) < 1e-13) break;
  }

  return wrapRadians(eccentricAnomaly);
}

/** Convert true anomaly (degrees from perihelion) into mean anomaly (radians). */
export function meanAnomalyFromTrueAnomaly(trueAnomalyDegrees, eccentricity) {
  assertEccentricity(eccentricity);
  if (!Number.isFinite(trueAnomalyDegrees)) {
    throw new RangeError("True anomaly must be a finite angle in degrees.");
  }

  const trueAnomaly = trueAnomalyDegrees * Math.PI / 180;
  const eccentricAnomaly = 2 * Math.atan2(
    Math.sqrt(1 - eccentricity) * Math.sin(trueAnomaly / 2),
    Math.sqrt(1 + eccentricity) * Math.cos(trueAnomaly / 2)
  );

  return eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly);
}

/** Convert mean anomaly (radians) into true anomaly (degrees in [0, 360)). */
export function trueAnomalyFromMeanAnomaly(meanAnomalyRadians, eccentricity) {
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomalyRadians, eccentricity);
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
  );

  return ((trueAnomaly * 180 / Math.PI) % 360 + 360) % 360;
}

/**
 * Calculate distance and speed at a true anomaly using an idealised
 * Sun–planet two-body orbit and the vis-viva equation.
 */
export function orbitalState(semiMajorAxisAu, eccentricity, trueAnomalyDegrees) {
  assertEccentricity(eccentricity);
  if (!Number.isFinite(semiMajorAxisAu) || semiMajorAxisAu <= 0) {
    throw new RangeError("Semi-major axis must be a finite positive distance in AU.");
  }
  if (!Number.isFinite(trueAnomalyDegrees)) {
    throw new RangeError("True anomaly must be a finite angle in degrees.");
  }

  const trueAnomaly = trueAnomalyDegrees * Math.PI / 180;
  const distanceAu = semiMajorAxisAu * (1 - eccentricity * eccentricity)
    / (1 + eccentricity * Math.cos(trueAnomaly));
  const distanceKm = distanceAu * ASTRONOMICAL_UNIT_KM;
  const semiMajorAxisKm = semiMajorAxisAu * ASTRONOMICAL_UNIT_KM;
  const speedKmS = Math.sqrt(
    SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
      * (2 / distanceKm - 1 / semiMajorAxisKm)
  );

  return {
    distanceAu,
    distanceKm,
    speedKmS,
    perihelionAu: semiMajorAxisAu * (1 - eccentricity),
    aphelionAu: semiMajorAxisAu * (1 + eccentricity)
  };
}
