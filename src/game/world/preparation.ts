import {type AreaId,areaAt} from './spawnRules';
import {locationAt} from './sideRoutes';
import {RODS,type ModuleId,type EquipmentLevels} from '../upgrades/data';
export const AREA_PREPARATION:Record<AreaId,{identity:string;rod:number;tip:string;modules:readonly ModuleId[]}>={
 estuary:{identity:'Open ice sounds · salmon runs · exposed water',rod:2,tip:'Stabilizer or Anchor for exposed water; Storage for the long loop.',modules:['speed','anchor','cargo']},
 starting:{identity:'Calm water · dependable small catches',rod:0,tip:'Learn the river; save for a Reinforced Rod.',modules:['cargo','mount','cover']},
 bend:{identity:'Pike runs · short currents · better hauls',rod:1,tip:'A stabilizer steadies the bends.',modules:['cargo','speed','mount']},
 lake:{identity:'Deep trout water · longer fishing fights',rod:2,tip:'Bring a finder and room for the return trip.',modules:['cargo','mount','cover']},
 gorge:{identity:'Powerful fish · tight current passages',rod:3,tip:'Turbo crosses surges; hull helps recovery.',modules:['turbo','speed','hull']},
};
export function preparationAt(x:number,y:number){
 const area=AREA_PREPARATION[areaAt(y,x)],place=locationAt(x,y);
 if(place?.interior)return {identity:'Dark pools · specialized cave fish',rod:Math.max(1,area.rod),tip:'Personal lantern; Icebreaker for sealed ice.',modules:['icebreaker','turbo','cargo'] as readonly ModuleId[]};
 return area;
}
export function preparationHint(x:number,y:number,rod:number,levels:EquipmentLevels,loadout:readonly (ModuleId|null)[]){
 const p=preparationAt(x,y);
 if(locationAt(x,y)?.interior&&!levels.lantern)return 'Dark water ahead · a Personal Lantern helps.';
 if(rod<p.rod)return `${RODS[p.rod].name} recommended for these fish.`;
 if(areaAt(y,x)==='gorge'&&!loadout.includes('speed')&&!loadout.includes('turbo'))return 'Strong currents · fit a Stabilizer or Turbo.';
 return p.tip;
}

export const FISH_ROD_ADVICE:Record<string,number>={veryEasy:0,easy:0,medium:1,hard:2,extreme:3,legendary:3};
