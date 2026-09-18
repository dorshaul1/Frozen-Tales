# Boot cover

The initial HTML paints an opaque loading screen and hides gameplay/HUD before scripts arrive. `src/boot.ts` is a small entry bundle: it animates a 240×120 nearest-neighbor river canvas behind CSS-animated pipeline kayak frames, then imports the game. No full atlas or Phaser dependency is required to paint the cover.

`RiverScene.preload` begins each loading cycle, reports actual asset progress, and holds the cover through synchronous save restoration and terrain setup. After scene CREATE and two game POST_RENDER events, the cover can fade. Fast loads have a 900ms minimum presentation, followed by a 400ms fade. Input is blocked until the cover finishes. Failed loads keep the world concealed and offer reload.

The shared controller ignores stale completion callbacks from earlier cycles. Any future asynchronous critical setup must finish before calling `finishLoading`; do not dismiss on asset-loader completion alone.

Verification: production build; live initial boot; `/checks/loading.html` tests minimum duration, readiness, failure and overlapping cycles. No save schema or gameplay assets changed.

The initial HTML embeds the two native kayak PNG frames and a matching crisp SVG river base. These render without JavaScript or image requests; fixed 240×120 / 480×240 CSS dimensions prevent late module styles or image decoding from changing the layout.
