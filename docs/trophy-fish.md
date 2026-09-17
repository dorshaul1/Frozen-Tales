# Exceptional specimens

`fishing/specimens.ts` centralizes size frequencies, weight bands, sale bonuses and fight modifiers. All species use their existing base weight (rare species retain their natural minimum) and remain the same species/rarity. Base mix: 80% Normal, 16% Large, 3.5% Trophy, 0.5% Record-size. Habitat, activity quality and bait modestly improve exceptional odds; at maximum quality at least 75% remain Normal. No fixed trophy locations exist.

Size is rolled at the bite before FishFight is constructed. Larger specimens retain the existing personality, gain 6–22% pull/burst strength and 7–24% stamina. The same prepared specimen is recorded only after landing. Failed/cancelled fights do not update records or trophy counts. Landed fish count even when released from full cargo, consistent with existing catch records and requests.

Sale value remains weight-based, plus a specimen premium (Large 5%, Trophy 20%, Record-size 35%). Daily market demand applies once to that catch value. The existing two-times-base weight and three-times-base value save limits remain valid. One fish always occupies one slot.

Trophy/record catches reuse the world-anchored catch card with emphasized weight and the existing rare-catch audio cue. Cargo carries its size tag. The Journal retains best weight and adds a count of Trophy/Record-size catches. Historical best weights survive migration; old saves have no reconstructed historical trophy count. Trophy counters and cargo tags persist through SaveStore.

`checks/trophies.html` samples 20,000 catches, tests all species at each exceptional size, verifies one-slot storage, record/counter save/load and actual merchant payouts. `checks/trophy-fight.html` drives a controlled Trophy Salmon through cast, fight and landing to ensure the prepared specimen is the one stored.
