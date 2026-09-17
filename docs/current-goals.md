# Progression Objectives

Open with **O** or click the compact **Objectives (N)** button beneath Pause. The button shows the number of unfinished objectives in the Active tab (excluding background long-term goals); no objective list or collapse control appears on the HUD. It keeps a 12-pixel gap below Pause. The full screen retains Active, Long-term and Completed tabs and three cards per page. Escape closes it; gameplay input is suspended while open.

`src/game/goals/Goals.ts` is the permanent objective catalog and lifecycle. Nineteen named objectives form parallel fishing, exploration, equipment and NPC branches. Prerequisites hide future objectives; long-term milestones never expire, reroll or hold up other branches. Core Missions still own feature unlocks. Daily Village Requests retain their independent board, definitions, rewards and daily lifecycle.

Reward balance is centralized: $10 base + $15 per estimated effort unit + $20 per progression stage + $25 per rarity unit, rounded to $5. Current rewards range from $10 onboarding to $370 for twenty unique species. All objective rewards are one-time money awards. Completion checks off briefly, counts up the reward in pinned HUD entries, and uses the existing small completion message/audio. No extra currencies or major unlocks.

Progress comes from actual records, Trophy counts, discoveries, installed loadout, Core Mission state and journal/dialogue events. The remote-NPC milestone counts the four defined important residents. Region and landing totals derive from the existing definitions. Wildlife is recorded only when visible nearby, not when spawned offscreen. Species observations are retained; the old game did not store historical wildlife sightings, so unrecorded past sightings cannot be reconstructed.

Version 1 goals migrate to version 2. Completed starter IDs are grandfathered without re-awarding them. Other already-demonstrated actions count immediately; newly introduced historical milestones receive their one-time money reward. Completion IDs and money are saved together before crediting the live wallet. Failed writes roll back; reload cannot pay again. Repeatable old pool goals are retired in favor of permanent objectives. No day-reset hook exists.

DEV `/goals` lists objectives; `/goal-complete <id>` completes without its reward. `/goal-reset` reconciles facts without wiping completion history. `/goal-reroll` explains that permanent objectives cannot reroll; use pins instead.

`checks/goals.html` exercises fresh and advanced contexts, reward scaling, parallel branches, hidden future entries, legacy migration, reload, failed writes, pinning, real fish-record/wallet integration and keyboard modal behavior. It uses an isolated scene and never writes the player's save.
