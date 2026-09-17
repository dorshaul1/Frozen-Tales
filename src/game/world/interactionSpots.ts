import {regionalContentAt} from './regionalContent';
import {SIDE_ROUTES,sideRouteAt} from './sideRoutes';
export const INTERACTION_SPOTS={
 'grove-eddy':{type:'eddy',name:'Alderwater Eddy',hint:'Sheltered grove water · calm fishing',radius:90},
 'basin-shelf':{type:'shelf',name:'Blue Crown Shelf',hint:'Ice shelf · scan beneath the cover',radius:90},
 'lake-deeps':{type:'deep',name:'Lakewatch Deeps',hint:'Deep lake bed · larger fish potential',radius:150},
 'longwater-rest':{type:'eddy',name:'Longwater Rest',hint:'Quiet water between glacier currents',radius:78},
 'outer-shelter':{type:'eddy',name:'Leeward Ice Cove',hint:'Protected coastal water · shelter from wind',radius:130},
 'willow-cove':{type:'eddy',name:'Willow Eddy',hint:'Sheltered water · calmer fights',radius:70},
 stillwater:{type:'deep',name:'Stillwater Deep Pool',hint:'Deep pool · probe the bed, scan for larger fish',radius:72},
 'rime-channel':{type:'shelf',name:'Rime Under-Ice Shelf',hint:'Under-ice shadows · a Fish Finder helps',radius:64},
 'needle-race':{type:'current',name:'Needle Current Pocket',hint:'Running water · Turbo or Stabilizer helps',radius:80},
} as const;
export type InteractionKind='eddy'|'deep'|'shelf'|'current';
export function interactionAt(x:number,y:number){
 const local=regionalContentAt(x,y);
 const fallback=()=>local?.water?{type:local.water,name:local.id,hint:local.hint,radius:local.radius,strength:local.strength}:undefined;
 const route=sideRouteAt(x,y);if(!route)return fallback();
 const spot=INTERACTION_SPOTS[route.id as keyof typeof INTERACTION_SPOTS];
 if(!spot)return fallback();const distance=Math.hypot(x-route.pocket.x,y-route.pocket.y);
 if(distance>=spot.radius)return fallback();
 return {...spot,route,strength:Math.min(1,(spot.radius-distance)/20)};
}
export function interactionReading(x:number,y:number){return interactionAt(x,y)?.hint??'';}
export function interactionAffinity(x:number,y:number,fish:{baseKg:number;fight:{burstChance:number}}){
 const p=interactionAt(x,y);if(!p)return 1;
 const boost=p.type==='deep'&&fish.baseKg>=3?.25:p.type==='eddy'&&fish.fight.burstChance<.45?.3:p.type==='current'&&fish.fight.burstChance>=.45?.3:0;
 return 1+boost*p.strength;
}
export const FIXED_INTERACTIONS=SIDE_ROUTES.filter(r=>Object.hasOwn(INTERACTION_SPOTS,r.id));
