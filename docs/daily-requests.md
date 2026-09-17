# Daily village favors

The small board beside the central village lane offers two or three optional favors each morning. Approach on foot and press E/Space; arrows select, E/Space claims, Escape closes. Clicking a card also claims it. Completed favors remain until claimed or the next morning. Money rewards are bonuses on top of normal fish sales; no new currency or supplies inventory exists.

`src/game/requests/DailyRequests.ts` contains the short objective/reward definitions, eligibility, recent-history selection and capped progress. Starter requests use local easy fish. Salmon/Pike requests require a discovery, area requests require discovered map markers, and snow requests only generate in snow. Rare and legendary fish are never required. Two recent days are de-prioritized, with the previous day's requests avoided whenever enough eligible alternatives exist.

The existing environment clock now persists a small day number, incremented on night→morning and by sleep. No calendar/offline simulation. The same SaveStore payload retains active favors, progress, claimed flags and recent history under `daily`. Money and claimed state write together; failed reward saves roll back the live credit. All normal save writers preserve daily state.

Fishing emits a semantic `fish-landed` event only after Cargo accepts the catch; existing `cargo-sold` events update sale goals. Neither minigame nor prices change. The board uses the existing timber panel, fish/coin art and a generated snow-capped board asset. The footing collider is narrow and located off the main path.

Generate board art: `node scripts/assets/requests.mjs`.
Browser verification: `checks/requests.html` (isolated test save) covers twenty days, eligibility/history, every objective/reward, clock/sleep rollover, interaction/input locks, collision, same-day persistence and double-claim prevention.
