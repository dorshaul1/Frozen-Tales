import { waterSpans,banks } from './river';
// Hand-placed composition anchors; never consume the trip RNG.
export const ECOLOGY_LANDMARKS=[
 {name:'Glacier falls',y:4350,side:-1,variant:0},
 {name:'Split ice arch',y:4820,side:1,variant:1},
 {name:'Gorge cave',y:5260,side:-1,variant:2},
 {name:'Old landing',y:730,side:1,variant:-1},
 {name:'Frozen cascade',y:1900,side:-1,variant:0},
 {name:'Blue arch',y:2610,side:1,variant:1},
 {name:'Drift cave',y:3510,side:-1,variant:2},
];
let cached: (typeof ECOLOGY_LANDMARKS[number] & {x:number;width:number;height:number})[]|undefined;
export function landmarkBounds(){return cached ??= ECOLOGY_LANDMARKS.map(l=>{
 const edges=[0,24,48,72,96].map(d=>{const main=banks(l.y+d),center=(main[0]+main[1])/2;const span=waterSpans(l.y+d).find(([a,b])=>center>=a&&center<=b)??main;return l.side<0?span[0]:span[1];});
 return {...l,x:l.side<0?Math.min(...edges)-145:Math.max(...edges)+32,width:112,height:96};
});}
