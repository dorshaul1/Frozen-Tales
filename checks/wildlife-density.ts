import {DynamicWorld} from '../src/game/world/DynamicWorld';
import {ANIMAL_RULES,WILDLIFE_DENSITY,areaAt,type AnimalId,type AreaId} from '../src/game/world/spawnRules';
import {NETWORK_ROUTES} from '../src/game/world/regionNetwork';
const out=document.querySelector('#result')!;out.textContent='';
let allBefore=0,allAfter=0;const start=performance.now();
for(const area of Object.keys(WILDLIFE_DENSITY) as AreaId[]){
 const density=WILDLIFE_DENSITY[area],original={...density};const totals:number[]=[];
 for(const boosted of [false,true]){Object.assign(density,boosted?original:{scale:1,budget:20});let total=0;
 for(let trip=1;trip<=8;trip++){
 const w=new DynamicWorld(trip*314159);w.conditions={phase:trip%3===0?'night':trip%2===0?'morning':'day',weather:trip%4===0?'heavy-snow':trip%3===0?'windy':'clear'};const routes=NETWORK_ROUTES.filter(r=>r.area===area);let last=0;
 for(let tick=0;tick<100;tick++){
 const route=routes[Math.floor(tick/20)%routes.length],point=route.points[Math.floor(tick/8)%route.points.length],p={x:point[0],y:point[1]};w.clock=tick*5;
 for(let i=w.encounters.length-1;i>=0;i--)if(w.encounters[i].expiresAt<w.clock)w.encounters.splice(i,1);
 for(const species of Object.keys(ANIMAL_RULES) as AnimalId[])Reflect.get(w,'spawnAnimal').call(w,species,p,{left:p.x-260,right:p.x+260,top:p.y-180,bottom:p.y+180});
 for(const e of w.encounters){if(e.id>last){total+=e.points.length;last=e.id;}const rule=ANIMAL_RULES[e.species];if(e.points.length>rule.group[1]||e.points.some(p=>!rule.areas.includes(areaAt(p.y,p.x))))throw Error('Invalid group/habitat');}
 if(w.encounters.reduce((n,e)=>n+e.points.length,0)>96)throw Error('Population cap');
 for(const species of Object.keys(ANIMAL_RULES) as AnimalId[])if(ANIMAL_RULES[species].rarity==='rare'&&w.encounters.filter(e=>e.species===species).reduce((n,e)=>n+e.points.length,0)>ANIMAL_RULES[species].maxActive)throw Error('Rare cap');
 }
 }totals.push(total);}
 Object.assign(density,original);allBefore+=totals[0];allAfter+=totals[1];out.textContent+=`${area}: ${totals[0]} → ${totals[1]} animals across 8 trips; budget ${density.budget}\n`;
}
if(allAfter<=allBefore)throw Error('Density did not increase');out.textContent+=`PASS population increased ${Math.round((allAfter/allBefore-1)*100)}%; groups, habitat and rare caps valid. ${Math.round(performance.now()-start)}ms\n`;
