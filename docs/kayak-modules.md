# Player tools and kayak modules

The existing upgrade IDs and levels remain the ownership source. Equipment gates module effects using its three-slot loadout; there is no second purchase system. Personal rod, line, reel and bait always work and never occupy a slot.

Modules: cargo (Storage Rack), speed (Current Stabilizer), icebreaker (Reinforced Bow), finder (Fish Finder), lantern (Navigation Lantern), cover (Weather Canopy), mount (Rod Mount). Catalog prices, levels and effect values remain in upgrades/data.ts.

Mara's workshop is now at the riverbank south of the village landing. Enter the open right side of the three-sided service dock and slow down. E opens the workshop while remaining in the kayak. Module changes are allowed only within this berth. Edda still sells personal tackle on foot.

Workshop controls:
- Up/down: browse modules; mouse arrows also browse.
- Left/right or click: select one of three slots.
- E: buy an unowned module, or fit an owned one.
- B / buy button: buy or upgrade ownership.
- R / remove button: put the selected slot's module into storage.
- Escape: return to paddling.

Fitting into an occupied slot replaces it; fitting an already-installed part swaps positions. Stored parts retain all levels but have no gameplay effect or kayak attachment. All active visuals and the panel preview use the same frame selector. Navigation lantern works only from the kayak. Rod Mount widens safe tension and reduces sustained pull through the existing fight data.

Storage removal is rejected when fish exceed the resulting capacity. No fish are silently deleted. Cargo capacity immediately follows the installed rack. Corrupt/inconsistent saves preserve fish even if temporarily over capacity.

SaveStore retains version 2 and the current key. The additional loadout field is validated to exactly three unique, owned module IDs or null. Missing fields migrate up to three owned modules, prioritizing storage, stabilizer, then bow. All other owned modules and all personal levels are retained. Existing opened passages, journal, currency, cargo, map and day data persist. Empty loadouts are intentional and remain empty across saves.

Art:
- scripts/assets/modules.mjs: service slip, module card skin, rod mount/icon.
- existing kayak-gear-speed recipe adds visible stabilizer skegs while preserving paddling poses.
- workshop building/sign, tools NPC/cards and other attachments reuse the established asset pipeline.

checks/modules.html uses an isolated save and tests migration, service-bay entry via keyboard, purchase versus fit, three-slot limits, swaps/removal, cargo safety, ownership persistence, active effects, heading alignment, dock collisions, exit, remote fitting rejection, scene reload, personal tools and village accessibility. Preview buttons inspect the bay, workshop, tools, night and compact UI.
