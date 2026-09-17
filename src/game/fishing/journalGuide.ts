import {FISH_ROD_ADVICE} from '../world/preparation';
import {RODS} from '../upgrades/data';
import {ICE_PASSAGES} from '../world/traversalData';
import type {MapProgress} from '../map/access';
import {fishLocations,SIDE_ROUTES,locationAt,caveStrength} from '../world/sideRoutes';
import { FISH,RARITIES,type FishId } from './data';
import { RARE_FISH } from './rareFish';
import { FISH_CONDITIONS,WEATHER,type Conditions,type TimePhase,type WeatherId } from '../world/conditions';
import { AREA_SPAWNS,AREA_TRANSITIONS,areaFishPool,areaAt,type AreaId } from '../world/spawnRules';
export type GuideRow={label:string;text:string;state:'met'|'unmet'|'neutral'};
const title=(s:string)=>s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
export function journalGuide(id:FishId,c:Conditions,y:number,bait:number,x?:number,progress?:MapProgress){
 const rare=RARE_FISH[id],preference=FISH_CONDITIONS[id];
 const habitat=FISH[id].habitat as import('./habitatData').FishHabitat;
 const preferred=Object.entries(habitat.depths).filter(([,n])=>n>1).map(([d])=>title(d)+' water');
 const locations=rare?.locations?SIDE_ROUTES.filter(r=>rare.locations!.includes(r.id)):fishLocations(id);
 const areas:AreaId[]=rare?.areas??(Object.keys(AREA_SPAWNS) as AreaId[]).filter(a=>(AREA_SPAWNS[a].fish[id]??0)>0||AREA_TRANSITIONS.some(t=>t.area===a&&(t.fish[id]??0)>0));
 const exclusive=!!rare?.locations||areas.length===0;
 const inLocation=x===undefined?undefined:locations.some(r=>r.id===locationAt(x,y)?.id)&&caveStrength(x,y)>.35;
 const times=rare?.phases??Object.entries(preference.time??{}).filter(([,n])=>n>1).map(([t])=>t as TimePhase);
 const weather=rare?.weather??Object.entries(preference.weather??{}).filter(([,n])=>n>1).map(([w])=>w as WeatherId);
 const timeMet=!rare?.phases||rare.phases.includes(c.phase),weatherMet=!rare?.weather||rare.weather.includes(c.weather);
 const accessible=!exclusive||!progress||locations.some(r=>{const gate=ICE_PASSAGES.find(g=>g.route===r.id);return !gate||progress.openedPassages.includes(gate.id)||progress.icebreaker;});
 const available=accessible&&(areas.length>0||locations.length>0)&&timeMet&&weatherMet;
 const rows:GuideRow[]=[
  {label:'Area',text:(exclusive?locations.map(r=>r.name).join(' / '):areas.map(a=>!rare&&!(AREA_SPAWNS[a].fish[id]??0)?AREA_TRANSITIONS.filter(t=>t.area===a&&(t.fish[id]??0)>0).map(t=>t.name).join(' / '):title(AREA_SPAWNS[a].name)).join(' / ')),state:exclusive?(inLocation===undefined?'neutral':inLocation?'met':'unmet'):(rare?areas.includes(areaAt(y,x)):(areaFishPool(areaAt(y,x),y)[id]??0)>0)?'met':'unmet'},
  {label:rare?.phases?'Time · required':'Time · preferred',text:times.length?times.map(title).join(' / '):'Any time',state:times.length?(times.includes(c.phase)?'met':'unmet'):'neutral'},
  {label:rare?.weather?'Weather · required':'Weather · preferred',text:weather.length?weather.map(w=>WEATHER[w].name).join(' / '):'Any weather',state:weather.length?(weather.includes(c.weather)?'met':'unmet'):'neutral'},
  {label:'Habitat · preferred',text:preferred.join(' / ')+(habitat.near?' · near '+(habitat.near==='ice'?'ice formations':'submerged rocks'):''),state:'neutral'},
  {label:'Bait',text:RARITIES[FISH[id].rarity].baitAttraction>0?'Bait quality helps · never required':'Any bait quality',state:RARITIES[FISH[id].rarity].baitAttraction>0?(bait>0?'met':'neutral'):'neutral'},
 ];
 const missing=[...(!accessible?['Fit an Icebreaker Bow to open the cave entrance']:[]),...(!timeMet?['Time: '+times.map(title).join(' / ')]:[]),...(!weatherMet?['Weather: '+weather.map(w=>WEATHER[w].name).join(' / ')]:[])];
 return {available,rows,status:available?'AVAILABLE NOW':'NOT AVAILABLE NOW',reason:available?'Conditions allow encounters; sightings are not guaranteed.':missing.join(' · '),special:`${RODS[FISH_ROD_ADVICE[FISH[id].fight.difficulty]??0].name} recommended, not required. `+(exclusive?(locations.some(r=>ICE_PASSAGES.some(g=>g.route===r.id))?'Some entrances are sealed by thin ice. Icebreaker Bow opens them; a personal lantern reveals the chamber.':'Inside the cave water. A personal lantern helps you read the river.'):rare?'Watch broad shadows or unusual ripples. Keep exploring while conditions hold.':'Preferences improve odds; other times and weather still work.'),difficulty:FISH[id].fight.difficulty==='veryEasy'?'Very easy':title(FISH[id].fight.difficulty)};
}
