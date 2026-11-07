export const solarSystemSources = {
  sun: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
  planets: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
  moons: "https://ssd.jpl.nasa.gov/sats/phys_par/",
  dwarfPlanets: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
  asteroids: "https://science.nasa.gov/solar-system/asteroids/facts/",
  asteroidTypes: "https://science.nasa.gov/solar-system/asteroids/asteroid-types/",
  comets: "https://science.nasa.gov/solar-system/comets/facts/",
  meteors: "https://science.nasa.gov/solar-system/meteors-meteorites/",
  kuiperBelt: "https://science.nasa.gov/solar-system/kuiper-belt/facts/",
  oortCloud: "https://science.nasa.gov/solar-system/oort-cloud/",
  heliosphere: "https://science.nasa.gov/heliophysics/",
  voyager: "https://science.nasa.gov/mission/voyager/"
} as const;

export const sunFacts = {
  massKg: 1.9884e30,
  earthMasses: 332900,
  meanRadiusKm: 695700,
  meanDiameterKm: 1391400,
  meanDensityKgM3: 1408,
  equatorialGravityMS2: 274.0,
  escapeVelocityKmS: 617.6,
  luminosityW: 3.828e26,
  spectralType: "G2 V",
  ageYears: 4.6e9,
  rotation: "Differential; roughly 25 days at the equator and longer toward the poles",
  coreTemperatureK: 1.57e7
} as const;

export interface SolarBodyPhysical {
  name: string;
  type: string;
  massKg: number;
  meanRadiusKm: number;
  densityGcm3: number;
  equatorialGravityMS2: number;
  escapeVelocityKmS: number;
  meanDistanceAU?: number;
  orbitDays?: number;
  siderealRotationDays?: number;
  note?: string;
}

export const planetPhysics: SolarBodyPhysical[] = [
  {name:"Mercury",type:"Terrestrial planet",massKg:3.30103e23,meanRadiusKm:2439.4,densityGcm3:5.4289,equatorialGravityMS2:3.70,escapeVelocityKmS:4.25,meanDistanceAU:0.3871,orbitDays:87.969,siderealRotationDays:58.6462},
  {name:"Venus",type:"Terrestrial planet",massKg:4.86731e24,meanRadiusKm:6051.8,densityGcm3:5.243,equatorialGravityMS2:8.87,escapeVelocityKmS:10.36,meanDistanceAU:0.7233,orbitDays:224.701,siderealRotationDays:-243.018,note:"Retrograde rotation; negative sign denotes direction."},
  {name:"Earth",type:"Terrestrial planet",massKg:5.97217e24,meanRadiusKm:6371.0084,densityGcm3:5.5134,equatorialGravityMS2:9.80,escapeVelocityKmS:11.19,meanDistanceAU:1,orbitDays:365.256,siderealRotationDays:0.99726968},
  {name:"Mars",type:"Terrestrial planet",massKg:6.41691e23,meanRadiusKm:3389.50,densityGcm3:3.9340,equatorialGravityMS2:3.71,escapeVelocityKmS:5.03,meanDistanceAU:1.5237,orbitDays:686.98,siderealRotationDays:1.02595676},
  {name:"Jupiter",type:"Gas giant",massKg:1.898125e27,meanRadiusKm:69911,densityGcm3:1.3262,equatorialGravityMS2:24.79,escapeVelocityKmS:60.20,meanDistanceAU:5.2028,orbitDays:4332.59,siderealRotationDays:0.41354},
  {name:"Saturn",type:"Gas giant",massKg:5.68317e26,meanRadiusKm:58232,densityGcm3:0.6871,equatorialGravityMS2:10.44,escapeVelocityKmS:36.09,meanDistanceAU:9.5388,orbitDays:10759.2,siderealRotationDays:0.44401,note:"Very low bulk density; equatorial gravity includes rapid rotation and oblateness."},
  {name:"Uranus",type:"Ice giant",massKg:8.68099e25,meanRadiusKm:25362,densityGcm3:1.270,equatorialGravityMS2:8.87,escapeVelocityKmS:21.38,meanDistanceAU:19.191,orbitDays:30688.5,siderealRotationDays:-0.71833,note:"Retrograde rotation; axial tilt is close to 98 degrees."},
  {name:"Neptune",type:"Ice giant",massKg:1.024092e26,meanRadiusKm:24622,densityGcm3:1.638,equatorialGravityMS2:11.15,escapeVelocityKmS:23.56,meanDistanceAU:30.07,orbitDays:60182,siderealRotationDays:0.67125}
];

export const dwarfPlanets: SolarBodyPhysical[] = [
  {name:"Ceres",type:"Dwarf planet · main asteroid belt",massKg:9.38416e20,meanRadiusKm:469.7,densityGcm3:2.162,equatorialGravityMS2:0.27,escapeVelocityKmS:0.51,meanDistanceAU:2.767,orbitDays:1681.6,siderealRotationDays:0.37809042,note:"Smallest of the five IAU-recognized dwarf planets; largest object in the main asteroid belt."},
  {name:"Pluto",type:"Dwarf planet · Kuiper Belt",massKg:1.30246e22,meanRadiusKm:1188.3,densityGcm3:1.853,equatorialGravityMS2:0.62,escapeVelocityKmS:1.21,meanDistanceAU:39.48,orbitDays:90560,siderealRotationDays:-6.3872,note:"NASA describes Pluto as slightly larger in diameter than Eris; both diameter estimates are close and model-dependent."},
  {name:"Haumea",type:"Dwarf planet · trans-Neptunian region",massKg:4.006e21,meanRadiusKm:715,densityGcm3:2.6,equatorialGravityMS2:0.35,escapeVelocityKmS:0.78,meanDistanceAU:43.13,orbitDays:103774,siderealRotationDays:0.1631,note:"Fast rotation makes Haumea strongly elongated; a single spherical diameter hides its triaxial shape."},
  {name:"Makemake",type:"Dwarf planet · Kuiper Belt",massKg:3.1e21,meanRadiusKm:714,densityGcm3:2.1,equatorialGravityMS2:0.40,escapeVelocityKmS:0.76,meanDistanceAU:45.43,orbitDays:112897,siderealRotationDays:0.937,note:"Radius, mass and density are less tightly constrained than for Pluto or Ceres."},
  {name:"Eris",type:"Dwarf planet · scattered disc",massKg:1.66e22,meanRadiusKm:1200,densityGcm3:2.3,equatorialGravityMS2:0.77,escapeVelocityKmS:1.36,meanDistanceAU:67.7,orbitDays:203830,siderealRotationDays:1.079,note:"Most massive of the five IAU-recognized dwarf planets; its diameter uncertainty overlaps Pluto's."}
];

export interface SatellitePhysical {
  name: string;
  host: string;
  gmKm3S2: number;
  meanRadiusKm: number;
  densityGcm3: number;
  description: string;
}

export const satellitePhysical: SatellitePhysical[] = [
  {name:"Moon",host:"Earth",gmKm3S2:4902.800,meanRadiusKm:1737.4,densityGcm3:3.344,description:"Differentiated rocky satellite; tidal driver and record of early impacts."},
  {name:"Phobos",host:"Mars",gmKm3S2:0.0007087,meanRadiusKm:11.08,densityGcm3:1.872,description:"Small irregular inner moon; orbital evolution is driven by Mars tides."},
  {name:"Deimos",host:"Mars",gmKm3S2:0.0000962,meanRadiusKm:6.2,densityGcm3:1.471,description:"Small irregular outer moon of Mars."},
  {name:"Io",host:"Jupiter",gmKm3S2:5959.91547,meanRadiusKm:1821.49,densityGcm3:3.5276,description:"Extremely volcanically active; heated by tidal flexing."},
  {name:"Europa",host:"Jupiter",gmKm3S2:3202.71210,meanRadiusKm:1560.80,densityGcm3:3.0130,description:"Water-ice shell above a global salty ocean inferred from multiple lines of evidence."},
  {name:"Ganymede",host:"Jupiter",gmKm3S2:9887.83275,meanRadiusKm:2631.20,densityGcm3:1.9416,description:"Largest moon; intrinsic magnetic field and evidence for a deep ocean."},
  {name:"Callisto",host:"Jupiter",gmKm3S2:7179.28340,meanRadiusKm:2410.30,densityGcm3:1.8340,description:"Ancient, heavily cratered icy-rocky moon."},
  {name:"Amalthea",host:"Jupiter",gmKm3S2:0.16456,meanRadiusKm:83.50,densityGcm3:1.0111,description:"Small, irregular inner moon; porous and low-density."},
  {name:"Mimas",host:"Saturn",gmKm3S2:2.50349,meanRadiusKm:198.20,densityGcm3:1.1501,description:"Small icy moon dominated visually by the Herschel impact crater."},
  {name:"Enceladus",host:"Saturn",gmKm3S2:7.21037,meanRadiusKm:252.10,densityGcm3:1.6097,description:"Active south-polar water-rich plumes; strong evidence for a subsurface ocean."},
  {name:"Tethys",host:"Saturn",gmKm3S2:41.21353,meanRadiusKm:531.10,densityGcm3:0.9840,description:"Low-density icy moon with large impact structures."},
  {name:"Dione",host:"Saturn",gmKm3S2:73.11607,meanRadiusKm:561.40,densityGcm3:1.4781,description:"Icy moon with bright fracture terrain and evidence of internal activity."},
  {name:"Rhea",host:"Saturn",gmKm3S2:153.94175,meanRadiusKm:763.50,densityGcm3:1.2372,description:"Saturn's second-largest moon; ice-rich composition."},
  {name:"Titan",host:"Saturn",gmKm3S2:8978.13710,meanRadiusKm:2574.76,densityGcm3:1.8814,description:"Dense nitrogen atmosphere; methane and ethane lakes, seas and rainfall."},
  {name:"Iapetus",host:"Saturn",gmKm3S2:120.51511,meanRadiusKm:734.30,densityGcm3:1.0887,description:"Two-toned surface and an unusual equatorial ridge."},
  {name:"Ariel",host:"Uranus",gmKm3S2:83.5,meanRadiusKm:578.9,densityGcm3:1.539,description:"Heavily fractured icy moon with evidence for resurfacing."},
  {name:"Umbriel",host:"Uranus",gmKm3S2:85.1,meanRadiusKm:584.7,densityGcm3:1.523,description:"Dark, heavily cratered icy moon."},
  {name:"Titania",host:"Uranus",gmKm3S2:226.9,meanRadiusKm:788.9,densityGcm3:1.653,description:"Largest Uranian moon; ancient impact and canyon terrain."},
  {name:"Oberon",host:"Uranus",gmKm3S2:205.3,meanRadiusKm:761.4,densityGcm3:1.664,description:"Distant major Uranian moon with heavily cratered terrain."},
  {name:"Miranda",host:"Uranus",gmKm3S2:4.3,meanRadiusKm:235.8,densityGcm3:1.178,description:"Small moon with dramatic cliffs and patchwork terrain."},
  {name:"Triton",host:"Neptune",gmKm3S2:1428.49546,meanRadiusKm:1352.6,densityGcm3:2.0649,description:"Large retrograde moon, likely captured; active nitrogen geysers observed by Voyager 2."},
  {name:"Charon",host:"Pluto",gmKm3S2:105.88,meanRadiusKm:606.0,densityGcm3:1.702,description:"Large Pluto companion; Pluto and Charon orbit a common centre outside Pluto."}
];

const G_KM3_KG_S2 = 6.67430e-20;

export function satelliteDerived(body: SatellitePhysical) {
  const massKg = body.gmKm3S2 / G_KM3_KG_S2;
  const gravityMS2 = (body.gmKm3S2 / (body.meanRadiusKm * body.meanRadiusKm)) * 1000;
  const escapeVelocityKmS = Math.sqrt((2 * body.gmKm3S2) / body.meanRadiusKm);
  return { massKg, gravityMS2, escapeVelocityKmS };
}
