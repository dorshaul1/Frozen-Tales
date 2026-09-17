# Regional network — geography revision 2

The fixed world is now 4200 × 5600 native world pixels. The village moves as one intact local layout by (+1500,+1500), putting home near the center of the region. Existing western areas, species, caves, services and landing IDs remain present.

## Routes

- Homewater Fork returns northwest to Starting River.
- Sprucewater Crossing reaches Blue Ice Bend independently, forming a loop with Homewater Fork.
- Lakeward Reach connects home directly to Frozen Lake, shortening repeat journeys.
- West Glacier Traverse reaches Needle Race and Glacier Gorge from the southern homeward route.
- Northern Outlet and Southern Ice Passage reach Frozen Estuary from different directions.
- Outer Ice Sound loops around the estuary's fixed islands, offering an exposed alternative to the inner bays.
- Lantern Hollow has a second opening into Blue Ice Bend. All five existing thin-ice gates retain single-entry pockets; Echo Vault's approach is widened to provide hull clearance.

`world/regionNetwork.ts` is the authored source for connector geometry and flow. No day seed or weather state changes geography. `waterSpans` is the shared cached contour used by terrain, collision, depth, chart and spawning. Island banks have restrained irregularity rather than exact ellipses.

## Estuary

Frozen Estuary is a lateral open-water region with salmon, char, trout, white bass, sturgeon and dolly varden drawn from existing fish definitions. It uses existing habitat/time/weather rules, activities, journal, economy and events. Seals and gulls dominate its sparse wildlife weights. Broad exposed flows favor stabilization, anchoring or carrying more cargo; none is a hard admission requirement.

Coastal Beacon and Ice Bay Landing use the shared remote dock/walking system. Existing landing spots remain. No new services or rewards are introduced.

## Persistence

Map snapshots include `worldRevision: 2`. Legacy discoveries retain stable place IDs. The old village's local discovery cells are retired and known places reveal their current positions. Other previously explored cells remain valid because the western geography is retained. All new routes and coastal stops begin undiscovered.

Equipment, money, cargo, records, opened gate IDs and permanent progression use their existing save architecture. Player positions are not stored in existing saves: returning sessions spawn at the relocated home dock. Dynamic school validation uses the current world width, and the activity restore limit accommodates the expanded regional roster.

## Validation

- `checks/region-network.html`: hull-clear connectivity from home to every region and seven docks; closed/open gate reachability; spatial area classification; five dynamic trips and reloads; geometry invariance; isolated-key progression/discovery migration.
- `checks/landings.html`: seven land/board transitions, physical dock collisions, local trail clearance, storm berth protection, discovery and focal props.
- `checks/village-routines.html`: relocated services and local NPC movement through four times of day and three weather states.

The River Chart uses the same fixed contours, shows full world width, and retains vertical pan and discovery fog. No replacement map or separate progression framework is introduced.

## Navigation identity

The lateral bank family now follows spatial region identity: fir/young trees near home, grouped spruce with blue ice toward the bend, open ice/rock near the lake, rocky glacier banks to the west, and spare weathered vegetation on the coast. Grouped banks alternate with quiet reaches; the existing shorter lakeward and western connections remain unchanged.

Four fixed, original-resolution landmarks anchor these choices: Old Fork Spruce, Bluewater Bluffs, Lakeward Arch and Westwater Falls. Their native assets are resolved against the local bank, reserved from incidental decoration, and registered with normal scenery collision. Existing caves, coastal beacon, island silhouettes and seven landing spots remain the other major anchors. No new geography or gameplay progression is added.

Discovery now records `visitedAreas` by stable area ID and announces first entry from any approach. Old known-area IDs migrate automatically; repeated visits and reloads stay quiet. Direct chart labels use only charted water in the relevant region, so a lateral approach cannot reveal an unexplored canonical marker or secret cave. Labels are bounded and avoid one another. The compact sidebar remains available for selecting known places.

`checks/navigation-identity.html` verifies landmark placement/collision, unique IDs, lateral discovery, repeat suppression, save migration and hidden caves, with native-scale landmark and chart previews.

## Natural contours (world revision 3)

Regional connectors now follow continuous cubic bends through their fixed authored
control points, with gradual width changes. Flow direction follows those same
curves. Side waterways use monotone bank interpolation rather than restarting an
S-curve at every node. Glacier Sluice's chamber sits farther west to retain a solid
bank behind its ice gate.

A one-time 48-unit contour closing rounds sharp land tips at confluences. It only
adds corner water, preserves the village waterfront and cave approach envelopes,
and feeds the same cached contours to terrain, collision, spawning and the chart.
It does not run during camera movement or daily updates. Original native art and
nearest-neighbor rendering are unchanged.

Revision-2 chart discoveries are retained without repeating the old village
relocation migration. Stable landmark IDs reveal their current bank positions.
Validation: region-network (all regions, five gates, five dynamic days, saves),
landings (seven docks), navigation-identity, and terrain-transitions checks.

## Regional expansion (world revision 4)

The fixed canvas is now 6100 × 7800 world pixels (previously 4200 × 5600).
This is an authored network expansion, not a transform of sprites or old geography.
The village and its service waterfront stay intact. Existing regional waters become
approaches and useful connecting routes to larger interiors:

- Starting River: Homewater Groves, a northern loop around a wooded land mass,
  with Alderwater Eddy and the Homewater Elder.
- Blue Ice Bend: Spruce Shelf Reach leads to the Blue Ice Basin and parallel
  Blue Ice Shelves, with Crown of Blue Ice and a fish-finder shelf.
- Frozen Lake: Quietwater Reach opens into Great Lake Water, two islands,
  Lakewatch Deeps and an alternate Windward Crossing toward Blue Ice Bend.
- Glacier Gorge: Lower Glacier Narrows, Cliffside Return, a lake connection,
  Longwater Falls and a relocated/larger Echo Vault behind its existing ice gate.
- Frozen Estuary: Outer Coastal Bays, Eastern Ice Isles and Leeward Coast Passage;
  four additional coastal islands, a sheltered cove and an outer beacon.

Fisher's Rest occupies a broad lake-approach bank at y=5560. Frozen Grove is at
7110; Coastal Beacon is on an outer island at 3800; Ice Bay Landing is at 4270.
Their stable IDs, walking footprints and service-free roles are retained. Echo
Vault and its sheet also retain IDs. Revision-3 discoveries reveal moved locations
by ID; old discovered cells and player progression are retained.

The chart preserves its previous world-to-chart scale and adds east/west panning,
recentring in both axes and directional off-screen indicators. It does not shrink
its text to fit the larger world. Region labels use the new core locations.

Dynamic activity uses the existing region/habitat pools and random generator, with
more activity distributed between old approaches, new reaches and nearby water.
Animal budgets stay unchanged. Regional current vectors follow new centerlines;
legacy latitude-only current strips stay confined to the original western river.
Terrain is still baked once at native resolution, never rebuilt on camera motion.

Checks: `checks/world-expansion.html` covers regional water area, core identity,
eight days of fish placement, immutable contour ordering and moved discoveries.
The region-network, landings, navigation-identity and terrain-transition checks
cover connectivity, gates, physical landing footprints, landmarks and pixel rendering.

## Composition refinement (world revision 5)

The final network keeps the expanded footprint but removes seven redundant
connector definitions (21 to 14, a one-third reduction): the duplicate Sprucewater
Crossing, southern estuary outlet, inner outer-coast strip, Blue Ice Shelves loop,
and three parallel gorge connections. Blue Ice Basin is an open curved reach,
not a closed small loop. Glacier Gorge follows the long original spine with
quiet basins and one meaningful lake connection. `gorge-crossing` retains its
stable ID as Waterfall Passage, now joining the lake and lower gorge.

Caves, fishing pockets and landing routes remain. Broad lake/coast interiors are
separated by larger land masses. The chart continues to list important stable
locations rather than adding every new reach to its contents. Longwater's existing
current/flow data provides short navigational beats separated by calm stretches.

## Frozen-geography regional content pass

Revision 5 geography remains frozen: 6100 × 7800; the two-pixel-row water-span fingerprint is `3260040533`. No route, dock, gate, island, landmark position or save revision changes in this pass.

`regionalContent.ts` defines four local compositions per major region. It overlays existing water and banks, never creates terrain. Existing native assets form sparse bank clusters; landing reservations, village access and dry-footprint checks take priority. The waterfall and cave already contain enough fixed scenery and deliberately reject extra overlapping decoration.

Local eddy/deep/shelf/current treatments reuse `interactionAt`, so habitat weighting, fishing relief, tool readings and shelter use the same rules. Existing named interactions take priority. Fish remain dynamically selected under the existing time/weather/bait/species constraints. Estuary weights favor salmon and sturgeon over inland trout; Starting River favors small wildlife; lake wildlife stays sparse and appears farther away. Regional wind exposure now follows actual regions rather than latitude, keeping homewater forgiving and coast exposed.

Water tint is smoothly sampled by actual region during the existing one-time terrain bake. No camera-driven rebaking or new high-resolution rendering. Local compositions add no River Chart markers or save state.

Verification: `checks/regional-content.html` checks frozen geometry, 20 valid regional water anchors, bounded influence and no additional chart entries. Eight-day regional spawn regression and all seven dock land/board checks pass. Native-scale representative views reviewed in all five regions; asset validation and production build pass.

### Navigation fragment cleanup

The subsequent approved cleanup removes 376 small enclosed contour fragments (including single-pixel slivers). `terrainFragments.ts` operates once on shared water spans, so rendering, water tests and terrain collision agree. Components must fit within 180 × 180 world pixels and 9,000 square pixels; exterior banks, authored islands and protected cave/gate boundaries are excluded. Existing corner smoothing remains unchanged. No route centerlines, region positions or intentional ice assets move. Updated contour fingerprint: `153035761`.

Synthetic fragment/protection checks and full region-network regression pass, including all five closed/open gates, seven landing locations and five days of dynamic spawn/save tests.
