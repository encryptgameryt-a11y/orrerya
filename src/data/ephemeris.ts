/**
 * Approximate planetary Keplerian elements and secular rates.
 *
 * Primary source: NASA/JPL Solar System Dynamics, "Approximate Positions of
 * the Planets", Table 2a (valid 3000 BC–3000 AD), with required Table 2b
 * periodic terms applied to Jupiter through Neptune.
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 *
 * Elements are referred to the J2000 mean ecliptic/equinox. Rates are per
 * Julian century from J2000. The Earth row is the Earth–Moon barycentre (EMB),
 * exactly as supplied by JPL; it is therefore a close Earth-centre proxy.
 *
 * b, c, s and f are Table 2b correction coefficients:
 * ΔM = b T² + c cos(f T) + s sin(f T), with angular arguments in degrees.
 * They are zero for Mercury through Mars because Table 2b applies only to
 * Jupiter, Saturn, Uranus and Neptune.
 */
export const ephemerisElements = [
  { slug: "mercury", name: "Mercury", color: "#aeb8c5", a: 0.38709843, aRate: 0.00000000, e: 0.20563661, eRate: 0.00002123, inclination: 7.00559432, inclinationRate: -0.00590158, meanLongitude: 252.25166724, meanLongitudeRate: 149472.67486623, longitudePerihelion: 77.45771895, longitudePerihelionRate: 0.15940013, longitudeNode: 48.33961819, longitudeNodeRate: -0.12214182, b: 0, c: 0, s: 0, f: 0 },
  { slug: "venus", name: "Venus", color: "#e8bd91", a: 0.72332102, aRate: -0.00000026, e: 0.00676399, eRate: -0.00005107, inclination: 3.39777545, inclinationRate: 0.00043494, meanLongitude: 181.97970850, meanLongitudeRate: 58517.81560260, longitudePerihelion: 131.76755713, longitudePerihelionRate: 0.05679648, longitudeNode: 76.67261496, longitudeNodeRate: -0.27274174, b: 0, c: 0, s: 0, f: 0 },
  { slug: "earth", name: "Earth", color: "#62a9d8", a: 1.00000018, aRate: -0.00000003, e: 0.01673163, eRate: -0.00003661, inclination: -0.00054346, inclinationRate: -0.01337178, meanLongitude: 100.46691572, meanLongitudeRate: 35999.37306329, longitudePerihelion: 102.93005885, longitudePerihelionRate: 0.31795260, longitudeNode: -5.11260389, longitudeNodeRate: -0.24123856, b: 0, c: 0, s: 0, f: 0 },
  { slug: "mars", name: "Mars", color: "#d88368", a: 1.52371243, aRate: 0.00000097, e: 0.09336511, eRate: 0.00009149, inclination: 1.85181869, inclinationRate: -0.00724757, meanLongitude: -4.56813164, meanLongitudeRate: 19140.29934243, longitudePerihelion: -23.91744784, longitudePerihelionRate: 0.45223625, longitudeNode: 49.71320984, longitudeNodeRate: -0.26852431, b: 0, c: 0, s: 0, f: 0 },
  { slug: "jupiter", name: "Jupiter", color: "#d6a77b", a: 5.20248019, aRate: -0.00002864, e: 0.04853590, eRate: 0.00018026, inclination: 1.29861416, inclinationRate: -0.00322699, meanLongitude: 34.33479152, meanLongitudeRate: 3034.90371757, longitudePerihelion: 14.27495244, longitudePerihelionRate: 0.18199196, longitudeNode: 100.29282654, longitudeNodeRate: 0.13024619, b: -0.00012452, c: 0.06064060, s: -0.35635438, f: 38.35125000 },
  { slug: "saturn", name: "Saturn", color: "#d7c18e", a: 9.54149883, aRate: -0.00003065, e: 0.05550825, eRate: -0.00032044, inclination: 2.49424102, inclinationRate: 0.00451969, meanLongitude: 50.07571329, meanLongitudeRate: 1222.11494724, longitudePerihelion: 92.86136063, longitudePerihelionRate: 0.54179478, longitudeNode: 113.63998702, longitudeNodeRate: -0.25015002, b: 0.00025899, c: -0.13434469, s: 0.87320147, f: 38.35125000 },
  { slug: "uranus", name: "Uranus", color: "#82c9c6", a: 19.18797948, aRate: -0.00020455, e: 0.04685740, eRate: -0.00001550, inclination: 0.77298127, inclinationRate: -0.00180155, meanLongitude: 314.20276625, meanLongitudeRate: 428.49512595, longitudePerihelion: 172.43404441, longitudePerihelionRate: 0.09266985, longitudeNode: 73.96250215, longitudeNodeRate: 0.05739699, b: 0.00058331, c: -0.97731848, s: 0.17689245, f: 7.67025000 },
  { slug: "neptune", name: "Neptune", color: "#658fe0", a: 30.06952752, aRate: 0.00006447, e: 0.00895439, eRate: 0.00000818, inclination: 1.77005520, inclinationRate: 0.00022400, meanLongitude: 304.22289287, meanLongitudeRate: 218.46515314, longitudePerihelion: 46.68158724, longitudePerihelionRate: 0.01009938, longitudeNode: 131.78635853, longitudeNodeRate: -0.00606302, b: -0.00041348, c: 0.68346318, s: -0.10162547, f: 7.67025000 }
] as const;
