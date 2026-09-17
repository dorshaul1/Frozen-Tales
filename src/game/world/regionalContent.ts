import type {AreaId} from './spawnRules';
import type {AssetId} from '../assets/catalog';
// Content overlays on revision-5 geography. These never contribute water spans,
// terrain collision, route access, discovery markers or world generation seeds.
export type LocalWater='eddy'|'deep'|'shelf'|'current';
export interface RegionalContent {id:string;area:AreaId;x:number;y:number;radius:number;bank:-1|1;look:'grove'|'ice'|'open'|'cliff'|'coast';water?:LocalWater;hint:string}
export const REGIONAL_CONTENT:readonly RegionalContent[]=[
 {id:'home-woods',area:'starting',x:2570,y:640,radius:240,bank:-1,look:'grove',hint:'Quiet forest banks · small river fish'},
 {id:'home-eddy',area:'starting',x:2660,y:1430,radius:125,bank:1,look:'grove',water:'eddy',hint:'Sheltered grove water · relaxed fish'},
 {id:'home-approach',area:'starting',x:2190,y:2050,radius:170,bank:-1,look:'grove',hint:'Familiar homewater · easy mixed catches'},
 {id:'willow-bank',area:'starting',x:455,y:1560,radius:95,bank:-1,look:'grove',water:'eddy',hint:'Calm willow bank · steady fishing'},
 {id:'blue-entry',area:'bend',x:1460,y:3120,radius:190,bank:1,look:'ice',hint:'Spruce gives way to exposed blue ice'},
 {id:'blue-crown',area:'bend',x:3290,y:4610,radius:180,bank:-1,look:'ice',water:'shelf',hint:'Ice-covered water · scan for activity'},
 {id:'blue-cove',area:'bend',x:2870,y:5160,radius:110,bank:1,look:'ice',water:'eddy',hint:'Sheltered ice cove · calmer pike and trout water'},
 {id:'blue-run',area:'bend',x:3270,y:5270,radius:150,bank:1,look:'ice',water:'current',hint:'Running glacial water · stronger fish'},
 {id:'lake-approach',area:'lake',x:1810,y:5410,radius:180,bank:-1,look:'open',hint:'Quiet lake approach · room to prepare'},
 {id:'lake-basin',area:'lake',x:2430,y:6060,radius:300,bank:1,look:'open',water:'deep',hint:'Deep lake basin · larger fish potential'},
 {id:'lake-isles',area:'lake',x:2550,y:6390,radius:190,bank:1,look:'ice',water:'shelf',hint:'Island ice shelves · a Fish Finder helps'},
 {id:'lake-lee',area:'lake',x:1780,y:6430,radius:160,bank:-1,look:'open',water:'eddy',hint:'Protected lake margin · calmer positioning'},
 {id:'gorge-falls',area:'gorge',x:810,y:4350,radius:150,bank:-1,look:'cliff',water:'current',hint:'Waterfall reach · strong running water'},
 {id:'gorge-basin',area:'gorge',x:1010,y:6870,radius:85,bank:1,look:'cliff',water:'eddy',hint:'Quiet basin between glacier currents'},
 {id:'gorge-flow-reach',area:'gorge',x:1060,y:6200,radius:140,bank:1,look:'cliff',water:'current',hint:'Glacier passage · keep control through the flow'},
 {id:'gorge-cave',area:'gorge',x:280,y:6700,radius:100,bank:-1,look:'cliff',water:'deep',hint:'Enclosed deep water · lantern and probe'},
 {id:'coast-entry',area:'estuary',x:2940,y:1950,radius:200,bank:1,look:'coast',hint:'Open coastal approach · watch the weather'},
 {id:'coast-isles',area:'estuary',x:4660,y:2780,radius:240,bank:-1,look:'coast',water:'shelf',hint:'Coastal ice fields · subtle underwater activity'},
 {id:'coast-sound',area:'estuary',x:4880,y:3700,radius:300,bank:1,look:'open',water:'deep',hint:'Exposed deep sound · large coastal fish'},
 {id:'coast-lee',area:'estuary',x:5670,y:4270,radius:130,bank:1,look:'coast',water:'eddy',hint:'Leeward cove · shelter from coastal wind'},
];
export const LOCAL_ART:Record<RegionalContent['look'],readonly AssetId[]>={
 grove:['tree-fir','tree-spruce','tree-young','shrub','snow-log','tree-fir','reeds'],
 ice:['blue-ice-outcrop','geology-rock','tree-spire','blue-ice-outcrop','dead-branch'],
 open:['snow-detail','geology-rock'],
 cliff:['broken-glacier','geology-rock','cave-formation','geology-rock'],
 coast:['blue-ice-outcrop','geology-rock','snow-detail','dead-branch'],
};
export function regionalContentAt(x:number,y:number){
 let best:(RegionalContent&{strength:number})|undefined;
 for(const p of REGIONAL_CONTENT){const t=Math.max(0,1-Math.hypot(x-p.x,y-p.y)/p.radius),strength=t*t*(3-2*t);if(strength>0&&(!best||strength>best.strength))best={...p,strength};}return best;
}
export const REGION_ATMOSPHERE:Record<AreaId,{cold:number;wind:number;wildlifeDistance:number}>={
 starting:{cold:.05,wind:.72,wildlifeDistance:0},bend:{cold:.2,wind:.95,wildlifeDistance:25},lake:{cold:.13,wind:1.05,wildlifeDistance:110},gorge:{cold:.32,wind:1,wildlifeDistance:65},estuary:{cold:.11,wind:1.18,wildlifeDistance:80},
};
