# Gentle river navigation

`world/navigation.ts` centralizes short cross-current sections, drifter areas, safety margins and the 55px/s combined-flow cap. Existing downstream currents and side routes are reused; banks, fixed floes, landmarks and unlocks are unchanged. Sheltered pockets reduce current and existing shallow depth adds at most 10% drag. Wind modestly strengthens flow within the same cap.

`NavigationView` owns up to four small original ice-fragment sprites. Their bounded slow drift varies per trip; relocation happens outside view. Native atlas opacity masks supply their moving static colliders. They stay at least 85px from the main channel center and freeze within 95px of the kayak or fish activity. Existing fixed obstacles remain static. `driftingIce.ts` shares only their positions with water validation so fish/schools cannot spawn or move underneath them. Scene shutdown and trip refresh clean up references and colliders.

Existing speed upgrades improve paddling, acceleration, angular response, resistance to current and acceleration immediately after contact. Contact has a cooldown-limited ripple/SFX, stronger flow subtly strengthens wake, and current/ice sounds are quiet short cues through AudioManager. No continuous ambience or new settings.

`checks/navigation.html` checks the flow cap, more than a minute of real moving-collider updates, central-lane clearance, fish exclusions, trip variation, freeze-near-player behavior, keyboard paddling, upgrade benefit, actual collision and recovery. It uses an isolated unsaved scene. Reused asset silhouettes are unchanged.
