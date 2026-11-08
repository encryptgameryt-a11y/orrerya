/**
 * NASA/JPL long-range approximate heliocentric planetary positions.
 *
 * Implements Solar System Dynamics Table 2a, including the required Table 2b
 * periodic mean-anomaly terms for Jupiter through Neptune:
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 *
 * Elements are referred to the J2000 mean ecliptic/equinox. The Earth row in
 * JPL's source is the Earth–Moon barycentre (EMB), not Earth's centre.
 *
 * T is Julian centuries from J2000 in JDTDB:
 * T = (JDTDB - 2451545.0) / 36525.
 *
 * This is a Keplerian approximation, not a numerically integrated ephemeris.
 */

export function radians(degrees) {
  return degrees * Math.PI / 180;
}

export function wrapSigned(degrees) {
  return ((degrees + 180) % 360 + 360) % 360 - 180;
}

export function wrapPositive(degrees) {
  return ((degrees % 360) + 360) % 360;
}

export function julianCenturiesFromJ2000(julianDateTdb) {
  if (!Number.isFinite(julianDateTdb)) {
    throw new RangeError("JDTDB must be a finite Julian date.");
  }
  return (julianDateTdb - 2451545.0) / 36525;
}

export function elementsAt(item, T) {
  if (!item || !Number.isFinite(T)) {
    throw new RangeError("A planetary element record and finite Julian-century offset are required.");
  }

  const elements = {
    a: item.a + item.aRate * T,
    e: item.e + item.eRate * T,
    inclination: radians(item.inclination + item.inclinationRate * T),
    meanLongitude: item.meanLongitude + item.meanLongitudeRate * T,
    perihelion: item.longitudePerihelion + item.longitudePerihelionRate * T,
    node: item.longitudeNode + item.longitudeNodeRate * T
  };

  if (!Number.isFinite(elements.a) || elements.a <= 0) {
    throw new RangeError("The computed semi-major axis must be positive and finite.");
  }
  if (!Number.isFinite(elements.e) || elements.e < 0 || elements.e >= 1) {
    throw new RangeError("The computed eccentricity must describe a bound elliptical orbit.");
  }
  return elements;
}

/**
 * Rotate a point from the orbital plane to the J2000 mean ecliptic frame.
 * E, inclination, argument of perihelion and node are in radians.
 */
export function orbitalPlaneToEcliptic(a, e, inclination, omega, node, E) {
  if (![a, e, inclination, omega, node, E].every(Number.isFinite)
      || a <= 0 || e < 0 || e >= 1) {
    throw new RangeError("Invalid orbital-plane coordinates or elements.");
  }

  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cosW = Math.cos(omega), sinW = Math.sin(omega);
  const cosO = Math.cos(node), sinO = Math.sin(node);
  const cosI = Math.cos(inclination), sinI = Math.sin(inclination);
  const x = (cosW * cosO - sinW * sinO * cosI) * xPrime
    + (-sinW * cosO - cosW * sinO * cosI) * yPrime;
  const y = (cosW * sinO + sinW * cosO * cosI) * xPrime
    + (-sinW * sinO + cosW * cosO * cosI) * yPrime;
  const z = sinW * sinI * xPrime + cosW * sinI * yPrime;
  return { x, y, z };
}

/**
 * Solve JPL's degree-form Kepler equation and return E in radians.
 * JPL states a 10^-6 degree tolerance is sufficient for this approximation.
 */
export function solveKepler(meanAnomalyDegrees, eccentricity) {
  if (!Number.isFinite(meanAnomalyDegrees)
      || !Number.isFinite(eccentricity)
      || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError("Mean anomaly must be finite and eccentricity must be in [0, 1).");
  }

  const M = wrapSigned(meanAnomalyDegrees);
  const eDegrees = eccentricity * 180 / Math.PI;
  let E = M + eDegrees * Math.sin(radians(M));

  for (let iteration = 0; iteration < 20; iteration += 1) {
    const deltaM = M - (E - eDegrees * Math.sin(radians(E)));
    const deltaE = deltaM / (1 - eccentricity * Math.cos(radians(E)));
    E += deltaE;
    if (Math.abs(deltaE) <= 1e-6) return radians(E);
  }

  const residual = E - eDegrees * Math.sin(radians(E)) - M;
  if (Math.abs(residual) > 1e-6) {
    throw new Error("Kepler solver did not converge to JPL's stated tolerance.");
  }
  return radians(E);
}

export function positionAt(item, T) {
  const elements = elementsAt(item, T);
  const omegaDegrees = elements.perihelion - elements.node;
  const periodicCorrection = item.b * T * T
    + item.c * Math.cos(radians(item.f * T))
    + item.s * Math.sin(radians(item.f * T));
  const meanAnomaly = elements.meanLongitude - elements.perihelion + periodicCorrection;
  const E = solveKepler(meanAnomaly, elements.e);
  const point = orbitalPlaneToEcliptic(
    elements.a,
    elements.e,
    elements.inclination,
    radians(omegaDegrees),
    radians(elements.node),
    E
  );
  const distance = Math.hypot(point.x, point.y, point.z);

  return {
    ...point,
    distance,
    longitude: wrapPositive(Math.atan2(point.y, point.x) * 180 / Math.PI),
    latitude: Math.asin(point.z / distance) * 180 / Math.PI
  };
}
