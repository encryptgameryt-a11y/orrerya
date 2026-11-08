/**
 * Idealised heliocentric Hohmann transfer between two circular, coplanar
 * planetary orbits. Distances are derived from JPL semi-major axes.
 *
 * This is not a departure-from-LEO budget, launch-window solver, Lambert
 * solution, patched-conic trajectory, or N-body mission design tool.
 */
import {
  ASTRONOMICAL_UNIT_KM,
  SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
} from "./scientific-constants.js";

const SECONDS_PER_DAY = 86400;

export function hohmannTransfer(
  initialSemiMajorAxisAu,
  finalSemiMajorAxisAu,
  solarMuKm3S2 = SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2
) {
  if (!Number.isFinite(initialSemiMajorAxisAu) || initialSemiMajorAxisAu <= 0) {
    throw new RangeError("Initial semi-major axis must be a finite positive value in AU.");
  }
  if (!Number.isFinite(finalSemiMajorAxisAu) || finalSemiMajorAxisAu <= 0) {
    throw new RangeError("Final semi-major axis must be a finite positive value in AU.");
  }
  if (Math.abs(initialSemiMajorAxisAu - finalSemiMajorAxisAu) < 1e-12) {
    throw new RangeError("Choose two different planetary orbits.");
  }
  if (!Number.isFinite(solarMuKm3S2) || solarMuKm3S2 <= 0) {
    throw new RangeError("The central body's gravitational parameter must be finite and positive.");
  }

  const r1Km = initialSemiMajorAxisAu * ASTRONOMICAL_UNIT_KM;
  const r2Km = finalSemiMajorAxisAu * ASTRONOMICAL_UNIT_KM;
  const transferSemiMajorAxisKm = (r1Km + r2Km) / 2;

  const circularSpeed1KmS = Math.sqrt(solarMuKm3S2 / r1Km);
  const circularSpeed2KmS = Math.sqrt(solarMuKm3S2 / r2Km);
  const transferSpeed1KmS = Math.sqrt(
    solarMuKm3S2 * (2 / r1Km - 1 / transferSemiMajorAxisKm)
  );
  const transferSpeed2KmS = Math.sqrt(
    solarMuKm3S2 * (2 / r2Km - 1 / transferSemiMajorAxisKm)
  );

  const departureDeltaVKmS = Math.abs(transferSpeed1KmS - circularSpeed1KmS);
  const arrivalDeltaVKmS = Math.abs(circularSpeed2KmS - transferSpeed2KmS);
  const transferTimeSeconds = Math.PI * Math.sqrt(
    transferSemiMajorAxisKm ** 3 / solarMuKm3S2
  );
  const transferTimeDays = transferTimeSeconds / SECONDS_PER_DAY;

  const period1Days = 2 * Math.PI * Math.sqrt(r1Km ** 3 / solarMuKm3S2)
    / SECONDS_PER_DAY;
  const period2Days = 2 * Math.PI * Math.sqrt(r2Km ** 3 / solarMuKm3S2)
    / SECONDS_PER_DAY;
  const synodicPeriodDays = 1 / Math.abs(1 / period1Days - 1 / period2Days);

  // Signed destination-minus-origin phase at departure. Positive means the
  // destination is ahead in the direction of orbital motion.
  const departurePhaseAngleDeg = 180 - 360 * transferTimeDays / period2Days;

  return {
    initialSemiMajorAxisAu,
    finalSemiMajorAxisAu,
    transferSemiMajorAxisAu: transferSemiMajorAxisKm / ASTRONOMICAL_UNIT_KM,
    circularSpeed1KmS,
    circularSpeed2KmS,
    transferSpeed1KmS,
    transferSpeed2KmS,
    departureDeltaVKmS,
    arrivalDeltaVKmS,
    totalDeltaVKmS: departureDeltaVKmS + arrivalDeltaVKmS,
    transferTimeDays,
    period1Days,
    period2Days,
    synodicPeriodDays,
    departurePhaseAngleDeg
  };
}
