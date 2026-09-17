export type Depth='shallow'|'normal'|'deep';
export type HabitatFeature='rocks'|'ice';
export interface FishHabitat { depths:Record<Depth,number>; near?:HabitatFeature; affinity?:number }
// Positive weights are preferences, never habitat locks.
export const FISH_HABITATS = {
 dace:{depths:{shallow:1.8,normal:1.2,deep:0.5},near:'rocks',affinity:1.3},
 perch:{depths:{shallow:1.8,normal:1.2,deep:0.5},near:'rocks',affinity:1.3},
 chub:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'rocks',affinity:1.3},
 pickerel:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'rocks',affinity:1.3},
 sucker:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'rocks',affinity:1.3},
 whitebass:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'ice',affinity:1.3},
 bream:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'ice',affinity:1.3},
 huchen:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'rocks',affinity:1.3},
 taimen:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'rocks',affinity:1.3},
 sculpin:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'ice',affinity:1.3},
 eel:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'ice',affinity:1.3},
 lanternfin:{depths:{shallow:0.3,normal:1.2,deep:1.8},near:'ice',affinity:1.3},

 smelt:{depths:{shallow:2,normal:1.2,deep:.3}},
 ember:{depths:{shallow:1.5,normal:1.4,deep:.4},near:'rocks',affinity:1.25},
 sturgeon:{depths:{shallow:.2,normal:.8,deep:2},near:'rocks',affinity:1.35},
 cisco:{depths:{shallow:.45,normal:1.1,deep:1.7},near:'ice',affinity:1.2},
 glasschar:{depths:{shallow:.2,normal:1,deep:2},near:'ice',affinity:1.3},
 veil:{depths:{shallow:.1,normal:.7,deep:2},near:'rocks',affinity:1.4},
 dolly:{depths:{shallow:.8,normal:1.6,deep:1.2},near:'rocks',affinity:1.3},
 lenok:{depths:{shallow:.35,normal:1.1,deep:1.9},near:'ice',affinity:1.35},
 sleeper:{depths:{shallow:.2,normal:.8,deep:2},near:'rocks',affinity:1.5},
 whitefish:{depths:{shallow:1.8,normal:1.2,deep:.55}},
 char:{depths:{shallow:1.1,normal:1.5,deep:.8},near:'rocks',affinity:1.35},
 salmon:{depths:{shallow:.65,normal:1.2,deep:1.6}},
 pike:{depths:{shallow:.7,normal:1.2,deep:1.6},near:'rocks',affinity:1.3},
 trout:{depths:{shallow:.4,normal:1,deep:2},near:'ice',affinity:1.4},
 grayling:{depths:{shallow:.8,normal:1.6,deep:1.1},near:'rocks',affinity:1.3},
 burbot:{depths:{shallow:.4,normal:1,deep:1.8},near:'rocks',affinity:1.4},
 crown:{depths:{shallow:.35,normal:.8,deep:2},near:'ice',affinity:1.5},
} satisfies Record<string,FishHabitat>;
