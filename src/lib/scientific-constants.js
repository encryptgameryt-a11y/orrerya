/**
 * Shared constants for Solar System calculations.
 *
 * AU: exact IAU-defined astronomical unit.
 * c and G: 2022 CODATA recommended constants.
 * GM_sun: JPL astrodynamic parameter (DE440 reference).
 * Keep these separate: GM_sun is measured much more precisely than the
 * product G * M_sun can be reconstructed from an independently rounded mass.
 */
export const ASTRONOMICAL_UNIT_KM = 149597870.7;
export const SPEED_OF_LIGHT_KM_S = 299792.458;
export const GRAVITATIONAL_CONSTANT_KM3_KG_S2 = 6.67430e-20;
export const GRAVITATIONAL_CONSTANT_RELATIVE_UNCERTAINTY = 0.00015 / 6.67430;
export const SOLAR_GRAVITATIONAL_PARAMETER_KM3_S2 = 1.32712440041279419e11;

export const SCIENTIFIC_CONSTANT_SOURCES = {
  astronomicalUnit: "https://www.iau.org/static/resolutions/IAU2012_English.pdf",
  codata2022: "https://physics.nist.gov/constants",
  solarGravitationalParameter: "https://ssd.jpl.nasa.gov/astro_par.html"
} as const;
