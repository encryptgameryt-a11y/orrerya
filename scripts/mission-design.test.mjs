import test from "node:test";
import assert from "node:assert/strict";
import { hohmannTransfer } from "../src/lib/mission-design.js";

test("Earth-to-Mars ideal Hohmann transfer is within standard reference scale", () => {
  const result = hohmannTransfer(1.00000018, 1.52371243);
  // JPL's orbital-mechanics reference gives approximately 2.945 km/s and
  // 2.649 km/s for the two ideal transfer impulses, with a ~259 day coast.
  assert.ok(result.departureDeltaVKmS > 2.90 && result.departureDeltaVKmS < 3.00);
  assert.ok(result.arrivalDeltaVKmS > 2.60 && result.arrivalDeltaVKmS < 2.70);
  assert.ok(result.transferTimeDays > 250 && result.transferTimeDays < 270);
  assert.ok(result.synodicPeriodDays > 770 && result.synodicPeriodDays < 790);
  assert.ok(result.departurePhaseAngleDeg > 35 && result.departurePhaseAngleDeg < 55);
});

test("Hohmann transfer is symmetric in total delta-v and time when reversed", () => {
  const outward = hohmannTransfer(1, 1.5237);
  const inward = hohmannTransfer(1.5237, 1);
  assert.ok(Math.abs(outward.totalDeltaVKmS - inward.totalDeltaVKmS) < 1e-12);
  assert.ok(Math.abs(outward.transferTimeDays - inward.transferTimeDays) < 1e-9);
});

test("Hohmann transfer rejects invalid or identical orbits", () => {
  assert.throws(() => hohmannTransfer(0, 1), RangeError);
  assert.throws(() => hohmannTransfer(1, -1), RangeError);
  assert.throws(() => hohmannTransfer(Number.NaN, 1), RangeError);
  assert.throws(() => hohmannTransfer(1, 1), RangeError);
  assert.throws(() => hohmannTransfer(1, 2, 0), RangeError);
});
