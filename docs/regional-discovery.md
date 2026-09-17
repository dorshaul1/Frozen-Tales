# Regional discovery

`Discovery.regional` is the shared regional view of the existing River Chart discovery model. The existing `visitedAreas` and `landmarks` sets remain authoritative for geography; no second location-completion store exists. Region IDs are `starting`, `bend`, `lake`, `gorge`, and `estuary`.

`RegionalDiscovery.ts` classifies existing stable Chart marker IDs into landmarks, landings, caves/tunnels, meaningful shortcuts, and other authored optional places. Random activity spots, individual animal encounters, weather, temporary conditions and decorative props are not entries. Geography, collision, spawning and Journal weight/record logic are unchanged.

Exploration percentage counts the region visit and public permanent places. Secret routes are bonus discoveries and reveal no missing totals. Fish and wildlife observations appear as optional ecological counts; even ordinary RNG cannot prevent 100% exploration. Fish totals use existing regional fish tables and transitions, excluding Rare/Legendary species. Wildlife totals use non-rare regional spawn rules. Additional catches/sightings (including cave specialists and rare animals) appear as +N extras. These ratios are descriptive, not requirements. No rewards, quests or objective definitions were added.

Selecting a visited major region in the River Chart shows its compact summary in the existing sidebar. Only relevant categories appear, and caves/hidden routes show found counts without unknown names, coordinates or total counts. Existing discovery notices identify landmarks, landings and caves. The map stays the primary view.

New save data is `map.regional`, version 1, containing only distinct fish and wildlife IDs per stable region. Actual landed-fish events supply the fishing region. Wildlife observation events supply the animal's position, not the player's region, and require it to be visible nearby. Repeated encounters do not add duplicates or rewrite storage. Writes are rolled back on failure.

Old Chart discovery IDs are reused immediately. On first migration, global fish records are assigned only if the existing spawn definitions allow that species in exactly one already-visited region. The same rule applies to old globally recorded wildlife. Shared species have no recoverable historical region; their global Fish Journal records remain intact and regional provenance begins with the next catch/sighting. Moving a landmark does not erase its discovered ID.

Selectors: `regionVisited`, `regionsDiscoveredCount`, `landmarksDiscovered`, `cavesDiscovered`, `discovered(region, category)`, `fishSpeciesCaughtInRegion`, `wildlifeSpeciesObservedInRegion`, `allWildlifeObserved`, and `summary`. `regional-discovery-changed` is emitted with a stable region ID after regional ecological saves and when meaningful map discoveries change. The already-existing wildlife objective now reads the regional selector for new observations; it no longer writes a second new sighting history. Its old global history remains valid for its existing completion.

DEV console:
- `/region-progress <region>`: safe compact summary.
- `/region-discover <region>`: visit/reveal that region's marker.
- `/region-complete <region>`: complete public exploration. Never fabricates catches, rare animals or hidden secrets.
- `/region-reset <region>`: clear regional discovery and ecological provenance; leave the global Fish Journal and gameplay unlocks intact. Standing in that region naturally discovers it again on the next update.

Verification: `checks/regional-discovery.html` covers five-region completion/reset, no-RNG completion, secret privacy, deduplication, provenance, migration, save round trip/failure rollback, actual scene catch/wildlife events, Journal agreement, and DEV commands. Region buttons preview the real Chart summary in an isolated scene.
