# Daily fish market

`src/game/market/DailyMarket.ts` owns demand and quoting. Each day selects up to one high-demand species (+20% or +30%), and has a 35% chance of one low-demand species (-10%). All others keep base value. The last two high-demand species are avoided when alternatives exist; a lone known species gets quiet days between bonuses.

Demand uses discovered fish from the existing ordinary area pools. All current areas are reachable without unlock gates. Undiscovered and condition-locked rare/legendary species are never advertised; they still sell at normal value. The seller's small cards quote the standard specimen; actual inventory prices retain each fish's existing weight/value variation and round once per fish. Sell All sums those exact quotes.

The existing day refresh (including sleep) generates and saves the market. SaveStore preserves its day, rates, and recent history across all existing writers. Reloading during a day cannot reroll it. Cargo retains original catch values; a market quote never compounds or overwrites fish data. Journal prices only appear after discovery.

`checks/market.html` tests twelve days, bounded bonuses, non-repetition, same-day restoration, sleep/day refresh, cargo quotes, seller payouts and journal text with an isolated save.
