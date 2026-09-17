import {interactionAt} from './interactionSpots';
import { SIDE_ROUTES,routeSpan,locationAt,caveStrength } from './sideRoutes';
import { waterSpans,banks,createFloes } from './river';
import type { Depth,HabitatFeature,FishHabitat } from '../fishing/habitatData';
// Fixed bedforms: never seeded from trips, catches or weather.
export const BED_POCKETS=[{y:590,offset:-45},{y:1460,offset:65},{y:2440,offset:-55},{y:2980,offset:40},{y:3650,offset:100},{y:4530,offset:0},{y:5190,offset:0}];
export function depthValue(x:number,y:number,visual=false){
 const place=locationAt(x,y);if(!visual&&place?.interior&&caveStrength(x,y)>.3){const span=routeSpan(place,y)!;const edge=Math.min(x-span[0],span[1]-x);return Math.min(.94,Math.max(.15,edge/65));}

 const spans=waterSpans(y);
 const base=Math.max(...spans.map(([l,r],i)=>{
 const width=r-l,edge=Math.max(0,Math.min(x-l,r-x));
 const channel=(l+r)/2+Math.sin(y/185)*width*.1;
 let d=.12+.76*Math.max(0,1-Math.abs(x-channel)/(width*.5));
 d+=Math.sin(y/103+x/91)*.045;
 for(const p of BED_POCKETS){const [a,b]=banks(p.y);d+=.2*Math.exp(-(((x-(a+b)/2-p.offset)/80)**2)-((y-p.y)/125)**2);}
 return Math.max(0,Math.min(1,Math.min(d,edge/(i===0?((y>4060?54:100)+Math.sin(y/135)*15):Math.min(65,width*.3)+Math.sin(y/135)*8)*.38)));
 }));
 if(visual&&place?.interior){const span=routeSpan(place,y)!,edge=Math.min(x-span[0],span[1]-x),cave=Math.min(.94,Math.max(.15,edge/65));const t=caveStrength(x,y),blend=t*t*(3-2*t);return base+(cave-base)*blend;}
 const spot=interactionAt(x,y);return spot?.type==='deep'?base+(.85-base)*spot.strength:base;
}
export function waterDepth(x:number,y:number):Depth{const d=depthValue(x,y);return d<.3?'shallow':d>.65?'deep':'normal';}
export function bedRocks(){return BED_POCKETS.map((p,i)=>{const[l,r]=banks(p.y+55);return{x:i%2?l+62:r-64,y:p.y+55};});}
let floes:ReturnType<typeof createFloes>|undefined;
export function habitatAt(x:number,y:number){
 const features:HabitatFeature[]=[];
 if(bedRocks().some(p=>Math.hypot(p.x-x,p.y-y)<100))features.push('rocks');
 floes??=createFloes();if(floes.some(f=>Math.hypot(f.x+f.width/2-x,f.y+f.height/2-y)<Math.max(f.width,f.height)/2+90))features.push('ice');
 return {depth:waterDepth(x,y),features};
}
export function habitatAffinity(rule:FishHabitat,x:number,y:number){const h=habitatAt(x,y);return rule.depths[h.depth]*(rule.near&&h.features.includes(rule.near)?rule.affinity??1:1);}
