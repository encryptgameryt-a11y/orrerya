import test from "node:test";
import assert from "node:assert/strict";

import { ephemerisElements } from "../src/data/ephemeris.ts";
import {
  julianCenturiesFromJ2000,
  positionAt,
  wrapSigned
} from "../src/lib/jpl-approx-ephemeris.js";

const AU_KM = 149597870.7;

// JPL Horizons API snapshots: DE441, Sun centre (500@10), geometric vectors
// (VEC_CORR=NONE), J2000 ecliptic, AU, exact TDB epochs. The Earth row is
// target 3 (Earth-Moon barycentre), matching the JPL Table 2a EMB elements.
// Source/API documentation: https://ssd-api.jpl.nasa.gov/doc/horizons.html
const horizonsSnapshots = [
  {
    label: "1950-01-01 00:00:00 TDB",
    jdTdb: 2433282.5,
    vectors: {
      mercury: [0.3208815126064326, 0.09919523755987102, -0.02139653050292696],
      venus: [0.09427794081347, 0.7138887939817755, 0.004209010424116465],
      earth: [-0.1827019777847186, 0.9661458551954407, 0.0001101819495711953],
      mars: [-1.395553774894103, 0.9043964307251104, 0.05337868315157205],
      jupiter: [3.406605247558555, -3.760530033862945, -0.06089144483071644],
      saturn: [-9.00736689124877, 2.500428606539161, 0.3139899154080162],
      uranus: [-1.24142476321174, 18.90453343662341, 0.08647950702716091],
      neptune: [-29.09262556441645, -8.4090260453529, 0.8433805220354059]
    }
  },
  {
    label: "2000-01-01 12:00:00 TDB (J2000)",
    jdTdb: 2451545.0,
    vectors: {
      mercury: [-0.1300936053754522, -0.4472876181353563, -0.02459830695805179],
      venus: [-0.718302296345389, -0.03265430819980606, 0.04101418202684621],
      earth: [-0.1771587841839055, 0.9672193524609504, -0.000001139275508446145],
      mars: [1.390715921746351, -0.01341631815101244, -0.03446766277581799],
      jupiter: [4.001177435589426, 2.938575782470499, -0.101785283451815],
      saturn: [6.406410428378656, 6.569988452110556, -0.3690759730763678],
      uranus: [14.43185527592405, -13.73432340215935, -0.2381417673271042],
      neptune: [16.81204760586415, -24.99176325272639, 0.1272225117089998]
    }
  },
  {
    label: "2026-11-08 00:00:00 TDB",
    jdTdb: 2461352.5,
    vectors: {
      mercury: [0.1426679889821202, 0.2742329219529482, 0.009326496131142224],
      venus: [0.4228501738023033, 0.5852965432546771, -0.01635474321913021],
      earth: [0.6980065523764718, 0.7033680315656204, -0.00004761108307144484],
      mars: [-0.3803548960049689, 1.555361863138156, 0.04192095066905015],
      jupiter: [-3.704869589854907, 3.816084275360042, 0.06703955657933161],
      saturn: [9.20531288243589, 1.973932130985622, -0.4008050245906088],
      uranus: [8.796393679089622, 17.32963178364433, -0.04969413484915876],
      neptune: [29.83082737434598, 1.499908409751931, -0.718332582375432]
    }
  }
];

// JPL's published 3000 BCE–3000 CE nominal errors for Table 2a/2b.
// The 1.5x margin below is a regression guard, not a claim that the JPL
// nominal figures are hard upper bounds for every epoch and coordinate.
const nominalErrors = {
  mercury: { longitudeArcsec: 20, latitudeArcsec: 15, distanceKm: 1_000 },
  venus: { longitudeArcsec: 40, latitudeArcsec: 30, distanceKm: 8_000 },
  earth: { longitudeArcsec: 40, latitudeArcsec: 15, distanceKm: 15_000 },
  mars: { longitudeArcsec: 100, latitudeArcsec: 40, distanceKm: 30_000 },
  jupiter: { longitudeArcsec: 600, latitudeArcsec: 100, distanceKm: 1_000_000 },
  saturn: { longitudeArcsec: 1_000, latitudeArcsec: 100, distanceKm: 4_000_000 },
  uranus: { longitudeArcsec: 2_000, latitudeArcsec: 30, distanceKm: 8_000_000 },
  neptune: { longitudeArcsec: 400, latitudeArcsec: 15, distanceKm: 4_000_000 }
};

function norm(vector) {
  return Math.hypot(...vector);
}

function longitudeDegrees(vector) {
  return Math.atan2(vector[1], vector[0]) * 180 / Math.PI;
}

function latitudeDegrees(vector) {
  return Math.asin(vector[2] / norm(vector)) * 180 / Math.PI;
}

test("JPL Table 2a/2b positions remain near Horizons DE441 at three TDB epochs", () => {
  assert.equal(ephemerisElements.length, 8);
  const tested = [];

  for (const epoch of horizonsSnapshots) {
    const T = julianCenturiesFromJ2000(epoch.jdTdb);

    for (const body of ephemerisElements) {
      const expected = epoch.vectors[body.slug];
      assert.ok(expected, "Missing Horizons snapshot for " + body.slug);

      const actual = positionAt(body, T);
      const expectedDistance = norm(expected);
      const radialErrorKm = Math.abs(actual.distance - expectedDistance) * AU_KM;
      const longitudeErrorArcsec = Math.abs(
        wrapSigned(actual.longitude - longitudeDegrees(expected)) * 3600
      );
      const latitudeErrorArcsec = Math.abs(
        (actual.latitude - latitudeDegrees(expected)) * 3600
      );
      const limits = nominalErrors[body.slug];

      assert.ok(radialErrorKm <= limits.distanceKm * 1.5,
        epoch.label + " " + body.name + " radial error " + radialErrorKm.toFixed(1) + " km");
      assert.ok(longitudeErrorArcsec <= limits.longitudeArcsec * 1.5,
        epoch.label + " " + body.name + " longitude error " + longitudeErrorArcsec.toFixed(2) + " arcsec");
      assert.ok(latitudeErrorArcsec <= limits.latitudeArcsec * 1.5,
        epoch.label + " " + body.name + " latitude error " + latitudeErrorArcsec.toFixed(2) + " arcsec");

      tested.push({ epoch: epoch.label, body: body.slug });
    }
  }

  assert.equal(tested.length, 24, "All eight planet/EMB positions must be checked at all three epochs.");
});

test("JDTDB-to-century conversion is anchored at J2000", () => {
  assert.equal(julianCenturiesFromJ2000(2451545.0), 0);
  assert.ok(Math.abs(julianCenturiesFromJ2000(2488070.0) - 1) < 1e-12);
  assert.throws(() => julianCenturiesFromJ2000(Number.NaN), RangeError);
});
