import {RARE_FISH} from '../fishing/rareFish';
import {MAP,MAP_MARKERS,type Discovery} from './discovery';
import {AREA_SPAWNS,AREA_TRANSITIONS,ANIMAL_RULES,areaAt,type AreaId,type AnimalId} from '../world/spawnRules';
import {FISH,type FishId} from '../fishing/data';
import {SIDE_ROUTES} from '../world/sideRoutes';
import {landings} from '../home/Landings';
export type RegionalSave={version:1;fish:Partial<Record<AreaId,string[]>>;wildlife:Partial<Record<AreaId,string[]>>};
export type DiscoveryCategory='landmarks'|'landings'|'caves'|'shortcuts'|'places';
export interface RegionalSummary {region:AreaId;visited:boolean;percent:number;landmarks:{found:number;total:number};landings:{found:number;total:number};caves:number;shortcuts:number;places:number;fish:{found:number;total:number;bonus:number};wildlife:{found:number;total:number;bonus:number}}
/** Location facts are the Chart's existing sets. Only regional biological provenance is new. */
export class RegionalDiscovery {
 private data:RegionalSave={version:1,fish:{},wildlife:{}};
 onChange:(region:AreaId)=>boolean=()=>true;
 readonly catalog: {id:string;region:AreaId;category:DiscoveryCategory;optional:boolean}[];
 constructor(private discovery:Discovery,raw?:unknown){
  const landingIds=new Set(landings().map(l=>l.id));
  this.catalog=MAP_MARKERS.filter(m=>m.kind==='landmark'&&!['dock'].includes(m.id)).map(m=>{const route=SIDE_ROUTES.find(r=>r.id===m.id);const category:DiscoveryCategory=landingIds.has(m.id)?'landings':route?(['dark-cave','blue-cave','frozen-tunnel'].includes(route.kind??'')?'caves':!route.deadEnd?'shortcuts':'places'):['home-north','lake-return','gorge-crossing'].includes(m.id)?'shortcuts':'landmarks';return {id:m.id,region:areaAt(m.y,m.x),category,optional:!!route};});
  const v=raw as Partial<RegionalSave>|undefined;
  if(v?.version===1)for(const region of Object.keys(AREA_SPAWNS) as AreaId[])for(const kind of ['fish','wildlife'] as const){const values=v[kind]?.[region];if(Array.isArray(values))this.data[kind][region]=[...new Set(values.filter(id=>typeof id==='string'&&Object.hasOwn(kind==='fish'?FISH:ANIMAL_RULES,id)))];}
 }
 /** Infer only unambiguous provenance; a global record cannot identify a shared habitat. */
 inferLegacy(records:Partial<Record<FishId,number>>,wildlife:string[]=[]){
  for(const species of Object.keys(records) as FishId[]){const regions=(Object.keys(AREA_SPAWNS) as AreaId[]).filter(region=>Object.hasOwn(AREA_SPAWNS[region].fish,species)||AREA_TRANSITIONS.some(t=>t.area===region&&Object.hasOwn(t.fish,species))||SIDE_ROUTES.some(r=>areaAt(r.pocket.y,r.pocket.x)===region&&r.fish&&Object.hasOwn(r.fish,species))||RARE_FISH[species]?.areas.includes(region));if(regions.length===1&&this.regionVisited(regions[0]))this.data.fish[regions[0]]=[...new Set([...(this.data.fish[regions[0]]??[]),species])];}
  for(const species of wildlife){const rule=ANIMAL_RULES[species as AnimalId];if(rule?.areas.length===1&&this.regionVisited(rule.areas[0]))this.data.wildlife[rule.areas[0]]=[...new Set([...(this.data.wildlife[rule.areas[0]]??[]),species])];}
 }
 snapshot():RegionalSave{return structuredClone(this.data);}
 regionVisited(region:AreaId){return this.discovery.visitedAreas.has(region);}
 regionsDiscoveredCount(){return this.discovery.visitedAreas.size;}
 discovered(region:AreaId,category:DiscoveryCategory){return this.catalog.filter(p=>p.region===region&&p.category===category&&this.discovery.landmarks.has(p.id)).map(p=>p.id);}
 landmarksDiscovered(region:AreaId){return this.discovered(region,'landmarks');}
 cavesDiscovered(region:AreaId){return this.discovered(region,'caves');}
 fishSpeciesCaughtInRegion(region:AreaId){return [...(this.data.fish[region]??[])];}
 wildlifeSpeciesObservedInRegion(region:AreaId){return [...(this.data.wildlife[region]??[])];}
 allWildlifeObserved(){return [...new Set(Object.values(this.data.wildlife).flat())];}
 recordFish(region:AreaId,species:FishId){return this.record('fish',region,species);}
 observeWildlife(region:AreaId,species:AnimalId){return this.record('wildlife',region,species);}
 private record(kind:'fish'|'wildlife',region:AreaId,species:string){if(!Object.hasOwn(AREA_SPAWNS,region)||!Object.hasOwn(kind==='fish'?FISH:ANIMAL_RULES,species))return false;const values=this.data[kind][region]??[];if(values.includes(species))return false;this.data[kind][region]=[...values,species];if(!this.onChange(region)){this.data[kind][region]=values;return false;}return true;}
 summary(region:AreaId):RegionalSummary {
  const places=this.catalog.filter(p=>p.region===region),publicPlaces=places.filter(p=>!p.optional);
  const count=(category:DiscoveryCategory)=>({found:publicPlaces.filter(p=>p.category===category&&this.discovery.landmarks.has(p.id)).length,total:publicPlaces.filter(p=>p.category===category).length});
  const normalFish=Object.keys(Object.assign({},AREA_SPAWNS[region].fish,...AREA_TRANSITIONS.filter(t=>t.area===region).map(t=>t.fish))).filter(id=>!['rare','legendary'].includes(FISH[id as FishId].rarity));
  const normalAnimals=Object.entries(ANIMAL_RULES).filter(([,r])=>r.areas.includes(region)&&r.rarity!=='rare').map(([id])=>id);
  const bio=(found:string[],normal:string[])=>({found:found.filter(id=>normal.includes(id)).length,total:normal.length,bonus:found.filter(id=>!normal.includes(id)).length});
  const visited=this.regionVisited(region),done=publicPlaces.filter(p=>this.discovery.landmarks.has(p.id)).length+Number(visited);
  return {region,visited,percent:Math.floor(done/(publicPlaces.length+1)*100),landmarks:count('landmarks'),landings:count('landings'),caves:this.cavesDiscovered(region).length,shortcuts:this.discovered(region,'shortcuts').length,places:this.discovered(region,'places').length,fish:bio(this.fishSpeciesCaughtInRegion(region),normalFish),wildlife:bio(this.wildlifeSpeciesObservedInRegion(region),normalAnimals)};
 }
 /** UI reports only found secrets. No secret names, totals or coordinates leak. */
 chartLines(region:AreaId){const s=this.summary(region);if(!s.visited)return [];return [`Explored ${s.percent}%`,...(s.landmarks.total?[`Landmarks ${s.landmarks.found}/${s.landmarks.total}`]:[]),...(s.landings.total?[`Landings ${s.landings.found}/${s.landings.total}`]:[]),...(s.caves?[`Caves ${s.caves} found`]:[]),...(s.shortcuts?[`Shortcuts ${s.shortcuts} found`]:[]),`Fish ${s.fish.found}/${s.fish.total}${s.fish.bonus?' +'+s.fish.bonus:''}`,`Wildlife ${s.wildlife.found}/${s.wildlife.total}${s.wildlife.bonus?' +'+s.wildlife.bonus:''}`,'Places % · life extra'];}
 dev(action:'discover'|'complete'|'reset',region:AreaId){if(!import.meta.env.DEV)throw Error('Development only');if(!Object.hasOwn(AREA_SPAWNS,region))throw Error('Unknown region');const before={areas:[...this.discovery.visitedAreas],marks:[...this.discovery.landmarks],cells:[...this.discovery.regions],data:this.snapshot()};
  if(action==='reset'){this.discovery.visitedAreas.delete(region);this.discovery.landmarks.delete(region);for(const p of this.catalog.filter(p=>p.region===region))this.discovery.landmarks.delete(p.id);for(const cell of this.discovery.regions){const[x,y]=cell.split(',').map(Number);if(areaAt((y+.5)*MAP.chunk,(x+.5)*MAP.chunk)===region)this.discovery.regions.delete(cell);}delete this.data.fish[region];delete this.data.wildlife[region];}
  else {this.discovery.visitedAreas.add(region);const ids=[region,...(action==='complete'?this.catalog.filter(p=>p.region===region&&!p.optional).map(p=>p.id):[])];for(const id of ids){const m=MAP_MARKERS.find(m=>m.id===id);if(m){this.discovery.landmarks.add(id);this.discovery.reveal(m.x,m.y);}}}
  if(!this.onChange(region)){this.discovery.visitedAreas.clear();before.areas.forEach(id=>this.discovery.visitedAreas.add(id));this.discovery.landmarks.clear();before.marks.forEach(id=>this.discovery.landmarks.add(id));this.discovery.regions.clear();before.cells.forEach(id=>this.discovery.regions.add(id));this.data=before.data;throw Error('Regional discovery could not be saved');}
 }
}
