# Core progression

New saves begin with basic fishing, selling, collection Journal and all normal weather/navigation. The first sale makes Mara's survey available. Survey unlocks River Chart; Forecast follows; Ranger and Old Fisher then become available through their existing dialogue. Only one compact objective is displayed. No map geometry, currency, XP, reputation or random quests are added.

Stable quests and existing targets:
- `survey`: visit the northern Starting River headwater bend and the existing broad floe south of Lookout, then return to Mara. Unlock `riverChart` (M and existing map button).
- `weather`: spend six seconds at the existing beacon-path observation point, then return to Sela. Unlock `weatherForecast` at the board and chart. Weather simulation never stops or depends on this flag.
- `ranger`: visit the two existing inland forest clearings, then return to Iver. Unlock `corgiCompanion`; relocate the single existing corgi to the village, preserving animation/behavior.
- `knowledge`: catch one Arctic Char, Northern Pike or Dolly Varden after acceptance, then return to Eirik. No fish is consumed, no rare species/weather/equipment required. Unlock `advancedFishingKnowledge` in the existing Journal and Field Guide. Basic species collection, artwork, records and areas remain visible beforehand.

`coreData.ts` contains definitions and validated versioned save data. `CoreQuests` owns acceptance, automatic observations, return state, completion and feature grants; mutations roll back on save failure. Availability derives from prerequisites. Objective completion moves to `return`; completion and feature grant happen only through the NPC's explicit dialogue action. `CoreQuestView` resolves existing observation points and produces short dialogue/tracker messages. Feature guards protect actual existing entry points rather than replacing features.

Saves without a core-progress field retain chart, forecast and advanced knowledge. An existing village-home corgi is also retained; otherwise the ranger introduction remains available. Save writes preserve core state and corgi home, and dog reward state is saved together with the feature grant.

DEV registry commands: `/quest-start survey`, `/quest-complete weather`, `/quest-reset ranger`, `/unlock-feature riverchart`, `/lock-feature weatherforecast`. IDs autocomplete from definitions; feature input is case-insensitive. They remain behind the existing DEV-only console.

Verification: isolated fresh-save progression, both survey observations, return requirement, real map and forecast gates, actual observation coordinates, six-second reading, same-object dog relocation, valid village dog bounds, knowledge catch filter, legacy migration, persistence, save-failure rollback, DEV commands, real dialogue acceptance, unchanged contour fingerprint `153035761`. QA: `checks/core-progression.html`. No live player save is used by the checks.
