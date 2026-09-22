import assert from "assert";
import {
  validateGroupPricingTiers,
  calculateApplicablePrice,
  calculateApplicablePriceOrThrow,
  getLowestGroupPrice,
  getMaxGroupTravelers,
} from "../lib/pricing-util.ts";

console.log("==================================================");
console.log("  AlpineAce Frontend Group Pricing Test Suite     ");
console.log("==================================================\n");

const tiers = [
  { minTravelers: 1, maxTravelers: 1, pricePerPerson: 1299 },
  { minTravelers: 2, maxTravelers: 4, pricePerPerson: 1250 },
  { minTravelers: 5, maxTravelers: 7, pricePerPerson: 1230 },
  { minTravelers: 8, maxTravelers: 10, pricePerPerson: 1195 },
];

const mockTrip = {
  priceUSD: 1350,
  groupPricingEnabled: true,
  groupPricing: tiers,
};

// 1. Lowest Price Detection
console.log("1. Testing getLowestGroupPrice...");
const lowest = getLowestGroupPrice(tiers, 1350);
assert.strictEqual(lowest, 1195, "Lowest group price must be 1195");
console.log("  ✓ Lowest group price correctly resolved to $1195");

// 2. Pricing Calculations
console.log("\n2. Testing calculateApplicablePrice across traveler counts...");
const p1 = calculateApplicablePrice(mockTrip, 1);
assert.strictEqual(p1.pricePerPerson, 1299);
assert.strictEqual(p1.totalPrice, 1299);
console.log("  ✓ 1 pax -> $1299 / person, total $1299");

const p3 = calculateApplicablePrice(mockTrip, 3);
assert.strictEqual(p3.pricePerPerson, 1250);
assert.strictEqual(p3.totalPrice, 3750);
console.log("  ✓ 3 pax -> $1250 / person, total $3750");

const p6 = calculateApplicablePrice(mockTrip, 6);
assert.strictEqual(p6.pricePerPerson, 1230);
assert.strictEqual(p6.totalPrice, 7380);
console.log("  ✓ 6 pax -> $1230 / person, total $7380");

const p9 = calculateApplicablePrice(mockTrip, 9);
assert.strictEqual(p9.pricePerPerson, 1195);
assert.strictEqual(p9.totalPrice, 10755);
console.log("  ✓ 9 pax -> $1195 / person, total $10,755");

// 3. Validation
console.log("\n3. Testing validateGroupPricingTiers...");
const valid = validateGroupPricingTiers(tiers, true);
assert.strictEqual(valid.valid, true);
console.log("  ✓ Valid tiers accepted");

const overlap = validateGroupPricingTiers(
  [
    { minTravelers: 1, maxTravelers: 4, pricePerPerson: 1000 },
    { minTravelers: 3, maxTravelers: 6, pricePerPerson: 900 },
  ],
  true
);
assert.strictEqual(overlap.valid, false);
console.log("  ✓ Overlapping tiers rejected");

const gap = validateGroupPricingTiers(
  [
    { minTravelers: 1, maxTravelers: 4, pricePerPerson: 1000 },
    { minTravelers: 6, maxTravelers: 8, pricePerPerson: 900 },
  ],
  true
);
assert.strictEqual(gap.valid, false);
console.log("  ✓ Coverage gap rejected");

// 4. Regression / Disabled
console.log("\n4. Testing Disabled Group Pricing...");
const disabledTrip = {
  priceUSD: 850,
  groupPricingEnabled: false,
  groupPricing: tiers,
};
const pDisabled = calculateApplicablePrice(disabledTrip, 5);
assert.strictEqual(pDisabled.pricePerPerson, 850);
assert.strictEqual(pDisabled.totalPrice, 4250);
console.log("  ✓ Disabled group pricing correctly uses base price ($850 * 5 = $4250)");

// 5. Out of bounds error handling (Parity with backend)
console.log("\n5. Testing Out-of-Bounds Handling & Parity...");
const outOfBoundsResult = calculateApplicablePrice(mockTrip, 12);
assert.strictEqual(outOfBoundsResult.pricePerPerson, 0);
assert.ok(outOfBoundsResult.error && outOfBoundsResult.error.includes("configured for 1 to 10 travelers"));
console.log(`  ✓ 12 pax out-of-bounds flagged with error: "${outOfBoundsResult.error}"`);

assert.throws(
  () => calculateApplicablePriceOrThrow(mockTrip, 12),
  /Direct booking is not available for 12 travelers/,
);
console.log("  ✓ calculateApplicablePriceOrThrow correctly throws exception on out-of-bounds count");

// 6. Max group travelers helper
console.log("\n6. Testing getMaxGroupTravelers helper...");
const maxGroupTravelers = getMaxGroupTravelers(mockTrip, 20);
assert.strictEqual(maxGroupTravelers, 10, "Max group travelers should resolve to highest tier max (10)");
console.log(`  ✓ getMaxGroupTravelers correctly resolved to ${maxGroupTravelers} travelers`);

const maxDisabled = getMaxGroupTravelers(disabledTrip, 20);
assert.strictEqual(maxDisabled, 20, "Disabled group pricing should fallback to default (20)");
console.log("  ✓ Disabled trip correctly falls back to 20 travelers");

console.log("\n==================================================");
console.log("  ALL FRONTEND GROUP PRICING TESTS PASSED!        ");
console.log("==================================================\n");
