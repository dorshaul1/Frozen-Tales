import {areaAt,type AreaId} from '../world/spawnRules';
import { FISH, type FishId, type FishTable } from './data';
import { animalActivity, conditionFishTable, type Conditions } from '../world/conditions';
import { eligibleRare } from './rareFish';

// Multipliers keep every existing pool entry possible. Signs describe odds, not species.
export const WATER_SIGNS = {
  calm: { chance: 120, bubbles: 2, speed: .7, sway: 2, frame: 0, quality: 1, hint: 'Calm bubbles often shelter gentler fish.' },
  strong: { chance: 23, bubbles: 5, speed: 1.2, sway: 4, frame: 0, quality: 1.06, hint: 'Overlapping ripples suggest active, richer water.' },
  large: { chance: 11, bubbles: 3, speed: .6, sway: 3, frame: 1, quality: 1.18, hint: 'Broad shadows often hide heavier fish.' },
  erratic: { chance: 8, bubbles: 3, speed: 2.4, sway: 8, frame: 2, quality: 1.03, hint: 'Darting shadows suggest sudden, stronger pulls.' },
  birds: { chance: 3, bubbles: 5, speed: 1.5, sway: 5, frame: 0, quality: 1.1, hint: 'Circling birds reveal a short-lived feeding patch.' },
  shimmer: { chance: 1, bubbles: 4, speed: .85, sway: 4, frame: 1, quality: 1.08, hint: 'Unusual surface flecks may hide a rare visitor.' },
} as const;
export type WaterSign = keyof typeof WATER_SIGNS;
// Local ecology changes the mix of existing signals; no species is guaranteed.
export const AREA_WATER_SIGNS:Record<AreaId,Partial<Record<WaterSign,number>>>={
 estuary:{large:1.3,birds:1.4,strong:1.2},
 starting:{calm:1.3,birds:1.6,large:.8},
 bend:{strong:1.35,erratic:1.3},
 lake:{large:1.5,calm:1.05,birds:.6},
 gorge:{strong:1.25,erratic:1.2,birds:.35},
};
export const isWaterSign = (value: unknown): value is WaterSign => typeof value === 'string' && Object.hasOwn(WATER_SIGNS,value);
export function signAffinity(sign: WaterSign, id: FishId) {
  const f=FISH[id];
  switch(sign) {
    case 'calm': return 1/(1+f.fight.struggleStrength*6);
    case 'strong': case 'birds': return 1+Math.min(f.value/20,2);
    case 'large': return 1+Math.min(f.baseKg/2,4);
    case 'erratic': return 1+f.fight.burstChance*3+f.fight.directionChangeFrequency;
    case 'shimmer': return f.rarity==='rare'||f.rarity==='legendary'?2:1;
  }
}
export function signFishTable(table: FishTable, sign: WaterSign): FishTable {
  return Object.fromEntries(Object.entries(table).map(([id,w])=>[id,w*signAffinity(sign,id as FishId)]));
}
export function chooseWaterSign(table: FishTable, y: number, conditions: Conditions, random:()=>number, x?:number): WaterSign {
  const pool=Object.entries(conditionFishTable(table,conditions)) as [FishId,number][];
  const total=pool.reduce((n,[,w])=>n+w,0)||1;
  const choices=(Object.keys(WATER_SIGNS) as WaterSign[]).map(sign=>{
    let weight=(AREA_WATER_SIGNS[areaAt(y,x)][sign]??1)*WATER_SIGNS[sign].chance*pool.reduce((n,[id,w])=>n+w*signAffinity(sign,id),0)/total;
    if(sign==='birds')weight*=animalActivity('bird',conditions);
    if(sign==='shimmer')weight*=eligibleRare({y,x},conditions).length?2:0;
    return {sign,weight};
  });
  let roll=random()*choices.reduce((n,c)=>n+c.weight,0);
  return choices.find(c=>(roll-=c.weight)<0)?.sign??'calm';
}
export function learnedWaterSign(id: FishId, records: Partial<Record<FishId,number>>) {
  if(!records[id])return '';
  const f=FISH[id];
  const sign:WaterSign=f.weight===0&&f.value>=65?'shimmer':f.baseKg>=5?'large':f.fight.burstChance>=.6?'erratic':f.fight.struggleStrength<.1?'calm':'strong';
  return WATER_SIGNS[sign].hint+' Signs are clues, never promises.';
}
