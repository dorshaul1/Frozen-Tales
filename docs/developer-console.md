# Developer console

Available only under Vite development (`npm run dev`). The production build excludes the console overlay, registry and command definitions through a DEV-guarded dynamic import. URL parameters cannot enable it.

Press `/` during exploration. Close other menus or finish fishing/sleeping first. The console pauses physics and normal gameplay input; weather/lighting presentation can still update for inspection. Enter executes, Escape closes, Up/Down recalls exact session history, Tab cycles matching completions. Suggestions come from live game definitions. State-changing commands save immediately; `/save` retries if storage is unavailable.

Example:

```
/set-time night
/set-weather heavy-snow
/give-module icebreaker
/teleport glacier-gorge
```

Use `/help` or `/help give-fish` for argument values. Names use definition IDs (`cargo`, `speed`, `finder`, etc.); teleport also accepts hyphenated location names such as `blue-ice-bend`.

- `/set-time` advances to the next occurrence; `/set-day` accepts the current day or a later day. Time never rewinds freshness or daily state. Daily events, markets, requests and dynamic encounters refresh through existing systems.
- Aurora requires night. Weather also updates the current forecast window.
- `/give-tool rod` grants and equips the next named rod. Other tools use the same ownership path as purchases.
- `/give-module` grants ownership and installs in an empty slot. `/remove-module` uninstalls and retains ownership. The three-slot limit and cargo capacity still apply.
- `/give-fish` creates normal randomized catches through Cargo, including records and freshness. It rejects an oversized batch before adding any fish. `/clear-inventory` releases fish cargo, retaining gear and records.
- Main river regions have no artificial area locks. `/unlock-area` and `/lock-area` control existing thin-ice route gates. Closing a route is rejected while inside an optional route.
- Teleport requires being aboard the kayak and finds safe water near authored map locations. Closed gated chambers remain inaccessible until their gate is opened. Teleport position is transient, like ordinary player position in the existing save system.
- Animal spawning respects population limits, species areas, ground/floe habitat and scenery collision. It can fail if no safe nearby habitat exists. Animals retain the normal temporary encounter lifecycle.

## Adding commands

Add a `command(name, description, argumentDefinitions, handler)` in `src/game/dev/commands.ts`. Typed `id` and `integer` definitions handle validation, help and autocomplete centrally. Supply ID options from game data. Handlers receive validated positional arguments and call typed `Context` APIs; add a game-system operation when necessary rather than editing unrelated private fields.

`checks/dev-console.html` exercises the real scene against an isolated save key, including keyboard isolation, completion/history, invalid arguments, wallet/cargo, equipment slots, time/weather, gates, animal habitat, teleport and save round-trip. `npm run build` validates types and the production build. Search built JS for `DEV CONSOLE`, `give-module` or `Unknown command:` to verify console exclusion.
