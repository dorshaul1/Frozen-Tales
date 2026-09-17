import { SIDE_ROUTES, sideRouteAt } from './sideRoutes';
import type { WeatherId } from './conditions';
export const RIVER_STATES={
 open:{name:'Open water',flow:1,large:1.12},
 calm:{name:'Sheltered water',flow:.35,large:1.08},
 surge:{name:'Strong flow',flow:1.4,large:1.05},
 ice:{name:'Fresh thin ice',flow:.7,large:1},
} as const;
export type RiverCondition=keyof typeof RIVER_STATES;
export interface RiverDay {day:number;seed:number;routes:Record<string,RiverCondition>;broken:string[]}
// Only established single-entrance ice necks may freeze. No terrain is generated.
export const FREEZABLE=['ice-cut','glacier-sluice','blueglass','echo-vault','rime-channel'];
export let riverDay:RiverDay|undefined;
export function setRiverDay(value:RiverDay|undefined){riverDay=value;}
export function readRiverDay(raw:unknown):RiverDay|undefined{
 const v=raw as RiverDay;if(!v||!Number.isSafeInteger(v.day)||v.day<0||!Number.isInteger(v.seed)||!v.routes)return;
 const routes:RiverDay['routes']={};
 for(const r of SIDE_ROUTES){const state=v.routes[r.id];if(!Object.hasOwn(RIVER_STATES,state)||state==='ice'&&!FREEZABLE.includes(r.id))return;routes[r.id]=state;}
 return {day:v.day,seed:v.seed>>>0,routes,broken:Array.isArray(v.broken)?v.broken.filter(id=>FREEZABLE.includes(id)):[]};
}
export function generateRiverDay(day:number,seed:number,weather:WeatherId,previous?:RiverDay):RiverDay{
 let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const routes:RiverDay['routes']={};let iceCount=0;
 for(const r of SIDE_ROUTES){
  const options:RiverCondition[]=['open','open','calm','surge'];
  if(FREEZABLE.includes(r.id)&&iceCount<2)options.push('ice',...(weather==='heavy-snow'||weather==='light-snow'?['ice' as const]:[]));
  const choices=options.filter(s=>s!==previous?.routes[r.id]);
  const state=choices[Math.floor(random()*choices.length)];routes[r.id]=state;if(state==='ice')iceCount++;
 }
 return {day,seed:seed>>>0,routes,broken:[]};
}
export function riverConditionAt(x:number,y:number){const route=sideRouteAt(x,y);return route&&riverDay?riverDay.routes[route.id]:undefined;}
export function riverReading(x:number,y:number){const c=riverConditionAt(x,y);return c?RIVER_STATES[c].name:'';}

export function dailyCurrent(x:number,y:number){
 const r=sideRouteAt(x,y);if(!r||riverDay?.routes[r.id]!=='surge')return 0;
 const start=r.points[1][1];return y>start&&y<start+120?38*Math.sin((y-start)/120*Math.PI):0;
}
export function dailyFishAffinity(x:number,y:number,fish:{baseKg:number;fight:{burstChance:number}}){
 const c=riverConditionAt(x,y);if(!c)return 1;
 return (fish.baseKg>=3?RIVER_STATES[c].large:1)*(c==='surge'&&fish.fight.burstChance>=.45?1.2:c==='calm'&&fish.fight.burstChance<.45?1.2:1);
}
