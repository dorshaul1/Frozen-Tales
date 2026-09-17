# Pixel text

`src/game/ui/PixelText.ts` contains the original narrow 4×7 bitmap alphabet and Phaser Text-compatible renderer. Text uses solid fillRect pixels instead of browser font rasterization. Body text is native 8px line height; larger headings use exact 2× cells. Numeric font-size styles remain compatible with existing UI calls but never produce fractional glyph scaling. Camera zoom remains integer. HUD labels use the same alphabet at 2×.

The renderer retains Phaser wrapping, alignment, padding, hit areas and dynamic updates. It temporarily replaces only its own canvas context's text measuring/drawing methods during update, restoring them immediately. It does not patch Phaser globally. Empty labels preserve finite origins. Tests in `checks/typography.html` validate binary alpha, dynamic labels and native/double views. Original glyph source is code-native art, not an external font.

Pause's Controls & How to Play pages live in `src/game/ui/help.ts`; inventory opens by clicking the top-right fish count. No extra gameplay hotkeys were introduced.
