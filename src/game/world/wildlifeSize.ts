// Gameplay-scale targets based on opaque side silhouettes, not padded canvas sizes.
// Sources and animation frames stay native. Penguin/corgi are unchanged references.
export const WILDLIFE_SIZE = {
 'musk-ox': {scale:1,radius:22,spacing:50,stride:9,track:2,stance:4},
 wolf: {scale:1,radius:16,spacing:38,stride:8,track:2,stance:3},
 wolverine: {scale:1,radius:12,spacing:30,stride:6,track:1,stance:2},
 raven: {scale:1,radius:8,spacing:24,stride:5,track:1,stance:1},
 'polar-bear': {scale:1.375,radius:29,spacing:64,stride:11,track:3,stance:5}, // 38 → 52px, heavy body
 reindeer: {scale:1.25,radius:25,spacing:56,stride:10,track:2,stance:4}, // 36 → 45px plus antlers
 seal: {scale:1,radius:17,spacing:40,stride:8,track:2,stance:3}, // 34px, broad low body
 penguin: {scale:1,radius:12,spacing:28,stride:7,track:2,stance:3}, // original 16×21px
 'village-corgi': {scale:1,radius:8,spacing:28,stride:7,track:2,stance:3},
 fox: {scale:.625,radius:12,spacing:30,stride:6,track:1,stance:2}, // 38 → 24px including tail
 otter: {scale:.5,radius:9,spacing:24,stride:5,track:1,stance:2}, // 37 → 19px including tail
 hare: {scale:.5,radius:7,spacing:20,stride:5,track:1,stance:1}, // 24 → 12px, ears still legible
 bird: {scale:1,radius:8,spacing:20,stride:5,track:1,stance:1},
 owl: {scale:.875,radius:10,spacing:24,stride:6,track:1,stance:2},
} as const;
