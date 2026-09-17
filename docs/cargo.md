# Fish cargo

Every caught fish takes one slot, regardless of weight. Storage capacity and prices live in `src/game/upgrades/data.ts`: 5 starter slots, then 8 / 12 / 16 / 20. Existing saves retain their purchased level and gain the corresponding capacity. The last level shares the existing fully equipped cargo attachment to avoid visual clutter.

Click the HUD cargo count to inspect/release fish away from the merchant. Select a fish and confirm again to release it for no money. At capacity, fishing remains available: the catch opens this same visual cargo view. Release the new fish or select an existing fish to replace, with confirmation. Escape releases the pending new catch. Records and fishing request credit reflect catches even if released; only retained fish can be sold. Pending catches are not cargo and are released if the panel is closed or the game reloads.

The merchant retains selling actions, with no remote selling. Cargo edits use the existing Equipment/SaveStore save path. Fish art and cards reuse the generated atlas. Checks: `checks/cargo.html` covers slots, release, replacement, upgrades, persistence and merchant selling; `checks/cargo-fight.html` exercises a real cast/fight while full.
