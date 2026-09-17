import type {CaughtFish} from './Cargo';
// Game seconds: one full day stays fresh; no offline decay or spoiled fish.
export const FRESHNESS={freshSeconds:720,goodSeconds:1440,insulatedRate:.3,freshRate:1.05,goodRate:1,agingRate:.95};
export function freshness(fish:CaughtFish){const age=fish.freshAge??0;return age<FRESHNESS.freshSeconds?{name:'Fresh',rate:FRESHNESS.freshRate,color:0xa7c7a7}:age<FRESHNESS.goodSeconds?{name:'Good',rate:FRESHNESS.goodRate,color:0xf3d49a}:{name:'Aging',rate:FRESHNESS.agingRate,color:0xbda9a0};}
