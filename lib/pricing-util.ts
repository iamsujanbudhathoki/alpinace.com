export interface GroupPricingTier {
  id?: string;
  minTravelers: number;
  maxTravelers: number;
  pricePerPerson: number;
}

export interface PricingResult {
  pricePerPerson: number;
  totalPrice: number;
  applicableTier: GroupPricingTier | null;
  error?: string;
}

/**
 * Validates group pricing tiers on the client:
 * - minTravelers must be >= 1
 * - maxTravelers must be >= minTravelers
 * - pricePerPerson must be > 0
 * - Continuous coverage: Tier 1 starts at 1, each subsequent tier starts at previousTier.maxTravelers + 1
 * - No overlaps or duplicates
 */
export function validateGroupPricingTiers(
  tiers?: GroupPricingTier[] | null,
  enabled?: boolean,
): { valid: boolean; error?: string } {
  if (!enabled) {
    return { valid: true };
  }

  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return {
      valid: false,
      error: "Group pricing is enabled, but at least one pricing tier is required.",
    };
  }

  const sorted = [...tiers].sort((a, b) => Number(a.minTravelers) - Number(b.minTravelers));

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const min = Number(tier.minTravelers);
    const max = Number(tier.maxTravelers);
    const price = Number(tier.pricePerPerson);

    if (!Number.isInteger(min) || min < 1) {
      return {
        valid: false,
        error: `Tier ${i + 1}: Minimum travelers must be an integer of at least 1.`,
      };
    }

    if (!Number.isInteger(max) || max < min) {
      return {
        valid: false,
        error: `Tier ${i + 1}: Maximum travelers (${max}) must be greater than or equal to minimum travelers (${min}).`,
      };
    }

    if (isNaN(price) || price <= 0) {
      return {
        valid: false,
        error: `Tier ${i + 1}: Price per person must be greater than 0.`,
      };
    }
  }

  if (Number(sorted[0].minTravelers) !== 1) {
    return {
      valid: false,
      error: `The first pricing tier must start at 1 traveler (currently starts at ${sorted[0].minTravelers}).`,
    };
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const prevMin = Number(prev.minTravelers);
    const prevMax = Number(prev.maxTravelers);
    const currMin = Number(curr.minTravelers);
    const currMax = Number(curr.maxTravelers);

    if (prevMin === currMin && prevMax === currMax) {
      return {
        valid: false,
        error: `Duplicate pricing range detected: [${currMin}–${currMax}].`,
      };
    }

    if (currMin <= prevMax) {
      return {
        valid: false,
        error: `Overlapping pricing tiers detected: [${prevMin}–${prevMax}] and [${currMin}–${currMax}]. Ranges must not overlap.`,
      };
    }

    if (currMin > prevMax + 1) {
      return {
        valid: false,
        error: `Gap in pricing coverage detected between [${prevMin}–${prevMax}] and [${currMin}–${currMax}]. Tiers must provide continuous coverage.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculates applicable price per person and total for the selected traveler count.
 * Returns an error message if the traveler count falls outside configured group pricing bounds.
 */
export function calculateApplicablePrice(
  product: {
    priceUSD: number;
    groupPricingEnabled?: boolean;
    groupPricing?: GroupPricingTier[] | null;
  },
  travelerCount: number,
): PricingResult {
  const count = Number(travelerCount);
  if (isNaN(count) || count < 1) {
    return {
      pricePerPerson: 0,
      totalPrice: 0,
      applicableTier: null,
      error: "Traveler count must be at least 1.",
    };
  }

  const basePrice = Number(product.priceUSD) || 0;

  if (!product.groupPricingEnabled || !product.groupPricing || product.groupPricing.length === 0) {
    return {
      pricePerPerson: basePrice,
      totalPrice: Math.round(basePrice * count),
      applicableTier: null,
    };
  }

  const sorted = [...product.groupPricing].sort(
    (a, b) => Number(a.minTravelers) - Number(b.minTravelers),
  );

  const matchedTier = sorted.find(
    (t) => count >= Number(t.minTravelers) && count <= Number(t.maxTravelers),
  );

  if (!matchedTier) {
    const minConfigured = Number(sorted[0].minTravelers);
    const maxConfigured = Number(sorted[sorted.length - 1].maxTravelers);
    const errorMsg = `Group pricing is configured for ${minConfigured} to ${maxConfigured} travelers. Direct booking is not available for ${count} travelers. Please send an inquiry for custom group arrangements.`;
    return {
      pricePerPerson: 0,
      totalPrice: 0,
      applicableTier: null,
      error: errorMsg,
    };
  }

  const unitPrice = Number(matchedTier.pricePerPerson);
  return {
    pricePerPerson: unitPrice,
    totalPrice: Math.round(unitPrice * count),
    applicableTier: matchedTier,
  };
}

/**
 * Convenience method matching backend signature that throws on out-of-range bounds.
 */
export function calculateApplicablePriceOrThrow(
  product: {
    priceUSD: number;
    groupPricingEnabled?: boolean;
    groupPricing?: GroupPricingTier[] | null;
  },
  travelerCount: number,
): PricingResult {
  const result = calculateApplicablePrice(product, travelerCount);
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

/**
 * Returns the maximum travelers supported for direct group booking.
 */
export function getMaxGroupTravelers(
  product: {
    groupPricingEnabled?: boolean;
    groupPricing?: GroupPricingTier[] | null;
  },
  fallbackMax = 20,
): number {
  if (product.groupPricingEnabled && product.groupPricing && product.groupPricing.length > 0) {
    const maxTiers = product.groupPricing
      .map((t) => Number(t.maxTravelers))
      .filter((m) => !isNaN(m) && m > 0);
    if (maxTiers.length > 0) {
      return Math.max(...maxTiers);
    }
  }
  return fallbackMax;
}

/**
 * Returns the lowest per-person price among group pricing tiers, for the "Price from:" badge.
 */
export function getLowestGroupPrice(
  tiers?: GroupPricingTier[] | null,
  fallbackBasePrice?: number,
): number {
  if (!tiers || tiers.length === 0) {
    return fallbackBasePrice || 0;
  }
  const prices = tiers.map((t) => Number(t.pricePerPerson)).filter((p) => p > 0);
  if (prices.length === 0) return fallbackBasePrice || 0;
  return Math.min(...prices);
}
