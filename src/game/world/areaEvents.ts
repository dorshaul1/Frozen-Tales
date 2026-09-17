import {areaAt,type AreaId} from './spawnRules';
import {FISH,type FishTable,type FishId} from '../fishing/data';
import {locationAt} from './sideRoutes';
export const AREA_EVENTS={
 salmon:{name:'Salmon Run',flow:1,areas:['starting','bend'],species:{salmon:2.5},large:1,quality:1,animals:1,sign:'strong'},
 trophy:{name:'Trophy Waters',flow:1,areas:['starting','lake','estuary'],species:{},large:1.15,quality:1.22,animals:1,sign:'large'},
 predator:{name:'Predator Activity',flow:1,areas:['bend','gorge'],species:{},large:1,quality:1,animals:1,sign:'erratic'},
 calm:{name:'Calm Waters',flow:.55,areas:['starting','bend','lake'],species:{},large:1,quality:1,animals:1,sign:'calm'},
 gathering:{name:'Wildlife Gathering',flow:1,areas:['starting','bend','lake'],species:{},large:1,quality:1,animals:1.5,sign:'birds'},
 deep:{name:'Deep Water Surge',flow:1.2,areas:['lake','gorge','estuary'],species:{},large:1.4,quality:1.08,animals:1,sign:'large'},
 cave:{name:'Cave Activity',flow:1,areas:['starting','bend','lake','gorge'],species:{},large:1.1,quality:1.1,animals:1,sign:'strong'},
} as const;
export type AreaEventId=keyof typeof AREA_EVENTS;
export interface EventDay{day:number;events:{area:AreaId;id:AreaEventId;start:number;end:number}[];recent:{area:AreaId;id:AreaEventId;day:number}[]}
export let eventDay:EventDay|undefined;let clock=0;
export function setEventDay(state:EventDay|undefined,elapsed:number){eventDay=state;clock=elapsed;}
export function readEventDay(raw:unknown):EventDay|undefined{
 const s=raw as EventDay;if(!s||!Number.isSafeInteger(s.day)||s.day<0||!Array.isArray(s.events)||!Array.isArray(s.recent))return;
 const valid=(e:EventDay['events'][number])=>e&&Object.hasOwn(AREA_EVENTS,e.id)&&(AREA_EVENTS[e.id].areas as readonly string[]).includes(e.area);
 return {day:s.day,events:s.events.filter(e=>valid(e)&&Number.isFinite(e.start)&&Number.isFinite(e.end)&&e.start>=0&&e.end>e.start&&e.end<=720).slice(0,2),recent:s.recent.filter(e=>valid({...e,start:0,end:720})&&Number.isSafeInteger(e.day)).slice(-12)};
}
export function generateEvents(day:number,seed:number,previous?:EventDay):EventDay{
 let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const recent=(previous?.recent??[]).filter(e=>day-e.day<=3),events:EventDay['events']=[];
 const areas:AreaId[]=['starting','bend','lake','gorge','estuary'];
 // Shuffle before limiting, so southern regions have an equal chance.
 for(let i=areas.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[areas[i],areas[j]]=[areas[j],areas[i]];}
 for(const area of areas){if(events.length>=2||random()>.32)continue;
  const pool=(Object.keys(AREA_EVENTS) as AreaEventId[]).filter(id=>(AREA_EVENTS[id].areas as readonly string[]).includes(area)&&!recent.some(e=>e.area===area&&e.id===id));
  if(!pool.length)continue;const id=pool[Math.floor(random()*pool.length)],start=random()<.5?0:180,end=random()<.5?540:720;
  events.push({area,id,start,end});recent.push({area,id,day});
 }return {day,events,recent};
}
export function activeEvent(x:number,y:number){const e=eventDay?.events.find(e=>e.area===areaAt(y,x)&&clock>=e.start&&clock<e.end);return e&&(e.id!=='cave'||locationAt(x,y)?.interior)?e:undefined;}
export function eventName(x:number,y:number){const e=activeEvent(x,y);return e?AREA_EVENTS[e.id].name:'';}
export function eventFishTable(table:FishTable,x:number,y:number):FishTable{
 const e=activeEvent(x,y);if(!e)return table;const rule=AREA_EVENTS[e.id];
 return Object.fromEntries(Object.entries(table).map(([id,w])=>{const f=FISH[id as FishId];return[id,w*((rule.species as Partial<Record<FishId,number>>)[id as FishId]??1)*(f.baseKg>=3?rule.large:1)*(e.id==='predator'&&f.fight.burstChance>=.45?1.5:e.id==='calm'&&f.fight.struggleStrength<.15?1.5:1)];}));
}
export function eventQuality(x:number,y:number){const e=activeEvent(x,y);return e?AREA_EVENTS[e.id].quality:1;}
export function eventWildlife(x:number,y:number){const e=activeEvent(x,y);return e?AREA_EVENTS[e.id].animals:1;}

export function eventFlow(x:number,y:number){const e=activeEvent(x,y);return e?AREA_EVENTS[e.id].flow:1;}
