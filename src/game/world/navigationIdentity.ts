import type {AssetId} from '../assets/catalog';
import type {AreaId} from './spawnRules';
// Palette/silhouette families for the lateral network. Quiet gaps are authored
// by the renderer; these do not affect fish pools, collision terrain or seeds.
export const REGIONAL_BANKS:Record<AreaId,readonly AssetId[]>={
 starting:['tree-fir','tree-young','tree-pine','rock'],
 bend:['tree-spruce','blue-ice-outcrop','tree-spruce','geology-rock'],
 lake:['blue-ice-outcrop','geology-rock','tree-weathered'],
 gorge:['geology-rock','blue-ice-outcrop','geology-rock'],
 estuary:['blue-ice-outcrop','geology-rock','tree-weathered'],
};
export const NAVIGATION_LANDMARKS=[
 {id:'fork-spruce',name:'Old Fork Spruce',x:1730,y:1770,side:-1,asset:'tree-ancient',width:80,height:80,variant:0},
 {id:'blue-bluffs',name:'Bluewater Bluffs',x:1600,y:2240,side:1,asset:'blue-ice-outcrop',width:84,height:64,variant:1},
 {id:'lakeward-arch',name:'Lakeward Arch',x:2010,y:3510,side:1,asset:'wilderness-formation',width:112,height:96,variant:1},
 {id:'westwater-falls',name:'Westwater Falls',x:1060,y:6200,side:-1,asset:'wilderness-formation',width:112,height:96,variant:0},
 {id:'home-grove',name:'Homewater Elder',x:2900,y:550,side:1,asset:'tree-ancient',width:80,height:80,variant:0},
 {id:'basin-crown',name:'Crown of Blue Ice',x:3440,y:4610,side:1,asset:'blue-ice-outcrop',width:84,height:64,variant:1},
 {id:'lake-watch',name:'Lakewatch Arch',x:2900,y:6460,side:1,asset:'wilderness-formation',width:112,height:96,variant:1},
 {id:'lower-falls',name:'Longwater Falls',x:900,y:7030,side:1,asset:'wilderness-formation',width:112,height:96,variant:0},
 {id:'outer-beacon',name:'Outer Sound Beacon',x:5550,y:4000,side:1,asset:'village-beacon',width:56,height:72,variant:0},
] as const;
