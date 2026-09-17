import { DynamicWorld,validWater } from '../src/game/world/DynamicWorld';
import { WATER_SIGNS,chooseWaterSign,signFishTable,learnedWaterSign,type WaterSign } from '../src/game/fishing/spotReading';
import { FISH,chooseFish,type FishId } from '../src/game/fishing/data';
import { AREA_SPAWNS } from '../src/game/world/spawnRules';
import { banks,createFloes } from '../src/game/world/river';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
let seed=381;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const pool=AREA_SPAWNS.bend.fish,stats:Record<string,number>={};
for(let n=0;n<12000;n++){const sign=chooseWaterSign(pool,2500,{phase:'day',weather:'clear'},random);stats[sign]=(stats[sign]??0)+1;}
check(stats.calm>stats.large&&stats.strong>stats.birds&&!stats.shimmer,'Quiet water dominates; bird patches uncommon; no daytime rare signal in bend');
const averages:Record<string,{kg:number;pull:number;value:number}>={};
for(const sign of Object.keys(WATER_SIGNS) as WaterSign[]){let kg=0,pull=0,value=0;const types=new Set<FishId>();for(let i=0;i<10000;i++){const id=chooseFish(signFishTable(pool,sign),0,random);types.add(id);kg+=FISH[id].baseKg*WATER_SIGNS[sign].quality;pull+=FISH[id].fight.burstChance;value+=FISH[id].value;}averages[sign]={kg:kg/10000,pull:pull/10000,value:value/10000};check(types.size===Object.keys(pool).length,sign+': every area fish remains possible');}
check(averages.large.kg>averages.calm.kg*1.2,'Broad shadows correlate with noticeably heavier catches');
check(averages.erratic.pull>averages.calm.pull,'Darting shadows correlate with aggressive pulls');
check(averages.strong.value>averages.calm.value,'Strong activity has better average rewards');
const world=new DynamicWorld(51),player={x:674,y:1216},view={left:420,right:920,top:1000,bottom:1400};const terrain=JSON.stringify([banks(2400),createFloes()]);const locations=new Set<string>();let shimmer=0,total=0;
for(let day=1;day<=20;day++){world.conditions={phase:'night',weather:'clear'};world.newDay(day*29,player,view);check(world.spots.every(s=>validWater(s)&&!!s.sign),'Day '+day+': all signs belong to valid dynamic water');for(const s of world.spots){total++;if(s.sign==='shimmer')shimmer++;locations.add(`${s.x},${s.y}`);}const restored=new DynamicWorld();check(restored.restore(world.snapshot())&&restored.snapshot().state===world.snapshot().state&&JSON.stringify(restored.spots.map(s=>[s.x,s.y,s.sign,s.weights,s.visitor]))===JSON.stringify(world.spots.map(s=>[s.x,s.y,s.sign,s.weights,s.visitor])),'Day '+day+': sign, odds and RNG restore exactly');}
check(locations.size>80&&JSON.stringify([banks(2400),createFloes()])===terrain,'Many different encounters, identical geography');check(shimmer/total<.2,'Shimmer remains uncommon even across favorable nights');
check(!learnedWaterSign('whitefish',{})&&learnedWaterSign('whitefish',{whitefish:1}).includes('Calm'),'Journal teaches water signs through existing discoveries');
check(true,'All water reading checks passed');
