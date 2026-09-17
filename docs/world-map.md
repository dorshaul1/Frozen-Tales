# River chart

The native 420×280 timber frame dedicates 272 pixels to the chart and 110 to secondary contents. The chart uses one uniform world-pixel scale, rather than stretching the full 1600×5600 river into a short rectangle. It opens around the player. Up/down, the small header arrows, or the wheel follow the river; Space / YOU recentres. Selecting a contents entry centres its one map marker. Off-screen contents have an up/down cue.

Areas, Sights and Home are three compact contents filters. Only permanently discovered, revealed places appear. Each marker ID is unique; there is one rendering path for known markers. Ordinary random fish/wildlife are never included. Unknown terrain is quiet dark ink; explored snow and water use restrained chart colors. The player's cream diamond remains distinct from landmark/service marks.

Progression is read from the existing live Equipment and Traversal state. This build has no hard area unlock gates, so the chart does not invent any. Thin-ice crossings come from ICE_PASSAGES, at their actual passage bounds:
- unbroken without icebreaker: crossing closed; tool required
- unbroken with icebreaker: crossing still iced; a running start can break it
- opened: no closed-crossing mark

A blocked crossing does not falsely label the entire side pocket inaccessible: these channels also have another entrance. Unknown markers remain hidden, including route names. The same permanent discovered regions and landmark IDs remain in SaveStore. No new map save schema or duplicate upgrade state.

Map frame regeneration: node scripts/assets/map.mjs, then the standard asset build/validation. checks/map.html verifies discovery, projection, uniform scale, pan/recentre, contents uniqueness, actual crossing/tool states, input restoration, persistence and unchanged geography. Fresh/explored/closed-crossing and narrow/wide previews are available in the isolated fixture.
