import { FISH,CATCH_BALANCE,type FishId } from './data';
import { RARE_FISH } from './rareFish';
import type { FishDifficulty } from './difficulty';
export const SPECIMENS={
 normal:{name:'Normal',chance:.80,min:.8,max:1.18,value:1,pull:1,stamina:1},
 large:{name:'Large',chance:.16,min:1.2,max:1.48,value:1.05,pull:1.06,stamina:1.07},
 trophy:{name:'Trophy',chance:.035,min:1.5,max:1.78,value:1.2,pull:1.14,stamina:1.16},
 record:{name:'Record-size',chance:.005,min:1.8,max:2,value:1.35,pull:1.22,stamina:1.24},
} as const;
export type SpecimenSize=keyof typeof SPECIMENS;
export function rollSpecimen(type:FishId,bait=0,random=Math.random,quality=1){
 const boost=Math.min(.25,Math.max(0,quality-1)+bait*.015),roll=random();
 let size:SpecimenSize='normal',remaining=roll;
 for(const candidate of ['record','trophy','large'] as const){remaining-=SPECIMENS[candidate].chance*(1+boost);if(remaining<0){size=candidate;break;}}
 const tier=SPECIMENS[size],min=size==='normal'?(RARE_FISH[type]?.weightRange[0]??tier.min):tier.min;
 const ratio=Math.min(tier.max,min+random()*(tier.max-min)+Math.max(0,quality-1)*.05+bait*.005);
 const weightKg=Math.round(FISH[type].baseKg*ratio*100)/100;
 const value=Math.max(1,Math.round(FISH[type].value*weightKg/FISH[type].baseKg*tier.value*(1+(random()*2-1)*CATCH_BALANCE.valueVariation)));
 return {type,size,weightKg,value,rarity:FISH[type].rarity,personalRecord:false};
}
export function specimenFight(base:FishDifficulty,size:SpecimenSize='normal'):FishDifficulty {
 const tier=SPECIMENS[size];return {...base,struggleStrength:base.struggleStrength*tier.pull,burstStrength:base.burstStrength*tier.pull,staminaMultiplier:tier.stamina};
}
export function isTrophy(size?:SpecimenSize){return size==='trophy'||size==='record';}
