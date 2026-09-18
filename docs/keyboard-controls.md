# Physical gameplay keys

`src/game/input/physicalKeyboard.ts` is the shared layout-independent boundary. RiverScene installs it before registering controls. The adapter translates `KeyboardEvent.code` into Phaser's existing numeric Key API without redispatching DOM events or changing native text events. Existing `isDown`, `JustDown`, and `keydown-I` consumers therefore all use physical keys.

Direct DOM shortcuts use `gameplayCode` / `slotNumber` from the same module. Gameplay ignores editable fields, IME composition, and Ctrl/Alt/Meta combinations. Shift remains usable; left/right Shift and digit/numpad equivalents are coalesced. Focus entering a text field and window blur clear held gameplay keys.

Console text, command history, and editing continue using native character/key handling. Slash opens the console by physical position, regardless of printed character. No character or legacy keyCode fallback is used for game shortcuts.

`checks/keyboard-layout.html` tests English/Hebrew event variants with deliberately absent legacy key codes, press/release, combined Shifts, numeric slots and editable-input isolation. This simulates OS-layout event differences; it does not change the user's OS keyboard settings. Existing historical QA scripts that synthesize only keyCode should provide code as well.
