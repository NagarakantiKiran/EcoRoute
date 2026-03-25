// Emission factors: grams of CO₂ per kilometre
// Source: IPCC / Our World in Data
// Do not change these values without updating the source reference above.
export const EMISSION_FACTORS = {
  walking: 0,    // human-powered — zero direct emissions
  cycling: 0,    // human-powered — zero direct emissions
  driving: 120,  // average petrol car (IPCC global average)
  ev: 40,        // average EV on mixed grid (IPCC, varies by country)
  transit: 89,   // bus, per passenger km
} as const;

export type EmissionMode = keyof typeof EMISSION_FACTORS;
