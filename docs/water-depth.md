# Fixed riverbed and fish habitats

`world/depth.ts` defines deterministic shallow margins, a meandering deeper channel and five fixed bed pockets. The field derives from the accepted bank contours; it never depends on the dynamic seed. Pixel-aligned stepped translucency preserves the existing water texture. A few submerged clusters reuse the original rock asset at low opacity. Existing floes provide ice habitat. No new collision, shore geometry, kayak handling or progression changes.

`fishing/habitatData.ts` supplies each fish definition's positive shallow/normal/deep probability weights and optional nearby-rock/ice affinity. Dynamic activity weights use these values before water-sign selection. Area, time/weather, bait and trip randomness still apply. Rare encounter chance uses the same affinity, while existing valid-condition pity still guarantees eventual opportunity. Habitat is preferred, never an undisclosed hard lock.

Deep-water catches receive a small 12% weight-quality boost through existing Cargo balance/clamps. School shadows are clearer in shallow water and more subdued in deep water. Schools retain their valid spawn pool while wandering locally. Journal habitat descriptions derive directly from the fish definitions, with preferred depths and nearby features; no duplicated species strings.

No extra save fields are needed for the fixed riverbed. Existing persisted dynamic pools remain intact and new activity receives habitat weighting through its normal trip/day/runtime replacement.

Verification: `checks/depth.html` confirms all three depths support valid activity, relative common/large fish affinities, positive weights, eight days of variable placements with identical geography/depth, and journal derivation. Existing fight checks cover the complete common-to-legendary casting/landing flow.
