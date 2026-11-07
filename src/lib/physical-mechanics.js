/**
 * Unit-safe physical calculations used by Solar System reference data.
 *
 * Inputs:
 * - GM in km^3 s^-2
 * - G in km^3 kg^-1 s^-2
 * - radius in km
 *
 * Outputs:
 * - mass in kg
 * - reference gravitational acceleration at radius r in m s^-2
 * - idealised spherical escape speed at radius r in km s^-1
 */
function requirePositiveFinite(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(name + " must be a positive finite number.");
  }
}

export function massFromGM(gmKm3S2, gravitationalConstantKm3KgS2) {
  requirePositiveFinite(gmKm3S2, "GM");
  requirePositiveFinite(gravitationalConstantKm3KgS2, "G");
  return gmKm3S2 / gravitationalConstantKm3KgS2;
}

export function gravityAtRadiusFromGM(gmKm3S2, radiusKm) {
  requirePositiveFinite(gmKm3S2, "GM");
  requirePositiveFinite(radiusKm, "Radius");
  // Spherical reference acceleration GM/r^2 is km s^-2; multiply by 1000 to return m s^-2.
  return (gmKm3S2 / (radiusKm * radiusKm)) * 1000;
}

export function escapeSpeedFromGM(gmKm3S2, radiusKm) {
  requirePositiveFinite(gmKm3S2, "GM");
  requirePositiveFinite(radiusKm, "Radius");
  return Math.sqrt((2 * gmKm3S2) / radiusKm);
}

/**
 * Bulk density for a spherical body with equivalent-volume mean radius.
 * Returns g cm^-3. GM is converted to mass using the measured G constant.
 */
export function bulkDensityFromGMAndRadius(gmKm3S2, radiusKm, gravitationalConstantKm3KgS2) {
  requirePositiveFinite(gmKm3S2, "GM");
  requirePositiveFinite(radiusKm, "Radius");
  requirePositiveFinite(gravitationalConstantKm3KgS2, "G");
  const massKg = gmKm3S2 / gravitationalConstantKm3KgS2;
  const volumeKm3 = (4 / 3) * Math.PI * radiusKm ** 3;
  return massKg / (volumeKm3 * 1e12);
}

export function massSharePercent(primaryMassKg, otherMassesKg) {
  requirePositiveFinite(primaryMassKg, "Primary mass");
  if (!Array.isArray(otherMassesKg) || otherMassesKg.some((mass) => !Number.isFinite(mass) || mass < 0)) {
    throw new RangeError("Other masses must be an array of non-negative finite numbers.");
  }
  const totalMassKg = primaryMassKg + otherMassesKg.reduce((sum, mass) => sum + mass, 0);
  return (primaryMassKg / totalMassKg) * 100;
}
