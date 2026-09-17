# Optional thin-ice traversal

Two authored sheets occupy the Ice Cut and Glacier Sluice bypasses. `world/traversalData.ts` defines their positions and required impact speed (85 and 135 world pixels/second). Main-river travel remains open: the Ice Cut sheet spans a separate channel, while the gorge sheet occupies only the side bypass. Existing paddle upgrades help build momentum; assisting current can help too. There is no level check or additional upgrade tree.

`Traversal` owns only these two collision zones. Its collision process tests perpendicular impact velocity before separation; sufficient momentum removes that zone, shows branching cracks/fragments, and plays a short AudioManager cue. It never modifies permanent terrain. Texture strips use native pixels, cropped/repeated to channel width. Nearby prompts describe the material and run-up rather than showing upgrade levels.

Opened IDs persist in `SaveStore.openedPassages`, preserved by ordinary economy/audio/map/environment writes. Fish water validation excludes closed sheets and automatically allows cleared water. Existing map discovery identifies the routes when visited; no new navigation markers or rewards were added.

Small drifting floes can be nudged gently at most once per 150ms. They retain the navigation safety checks, central travel-lane exclusion, matching mask colliders and trip lifetime; pushes are temporary.

Assets: `node scripts/assets/traversal.mjs`. Verification: `checks/traversal.html` checks slow/fast keyboard impacts, permanent collider survival, clear-water restoration and save/reconstruction. `checks/navigation.html` continues covering movable ice, recovery, current fairness and upgrade benefit.
