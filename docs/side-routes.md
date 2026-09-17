# Optional river routes

`world/sideRoutes.ts` contains four fixed authored centerlines: Willow Cove, Ice Cut, Stillwater Hollow and Glacier Sluice. The latter two current-bearing passages are downstream shortcuts, not teleporters. The main river still follows its original bank function. `waterSpans` merges optional channels for rendering, collision, habitat sampling, map shading, and animal/fishing validity.

The two cut-throughs have visible current flecks and calm pockets. They remain accessible with starter gear; speed upgrades make opposing their current less demanding. The route graph's idealized downstream travel estimates improve by about 4% for Ice Cut and 13% for Glacier Sluice, excluding acceleration/steering. The calmer main route remains a good return option.

Pocket bonuses are restrained: 8–15% catch quality, 1.3× weight for larger species already in the area's pool, and 1.5× the existing low hotspot chance. Fish and special visitors remain dynamic, condition-based and governed by existing cooldowns/pity. No species is permanently placed. World generation samples pockets probabilistically; some visits are quiet.

Route markers require entering within 48 world pixels of the pocket and persist through the existing map save. Existing terrain/floe/shore art is reused with contour rendering. No new assets, quests, collectible state or progression system is introduced.

`checks/routes.html` checks hull-clear connectivity to every pocket, downstream travel estimates, map discovery persistence, twenty days of fishing placement, and actual scene static-body clearance. The existing map icons remain visible for all discovered places; the text legend is bounded to the available panel space.
