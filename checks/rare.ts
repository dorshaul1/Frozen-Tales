import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { FISH, chooseFish, type FishId } from '../src/game/fishing/data';
import { eligibleRare, selectEncounter, rareClue, RARE_FISH, type EncounterMemory } from '../src/game/fishing/rareFish';
import { FishFight } from '../src/game/fishing/FishFight';
import { FishStruggle } from '../src/game/fishing/FishStruggle';
import { AREA_SPAWNS } from '../src/game/world/spawnRules';
import { validWater } from '../src/game/world/DynamicWorld';
import { Cargo } from '../src/game/player/Cargo';
import { SaveStore } from '../src/game/player/SaveStore';
import { Kayak } from '../src/game/entities/Kayak';
import { Home } from '../src/game/home/Home';
import { visitNpc, boardKayak } from './hub-helper';
import type { Conditions } from '../src/game/world/conditions';
const output:string[]=[];
const check=(ok:boolean,message:string)=>{output.push(`${ok?'PASS':'FAIL'} ${message}`);document.querySelector('#result')!.textContent=output.join('\n');if(!ok)throw Error(message);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const until=async(fn:()=>boolean,limit=25000)=>{const start=performance.now();while(!fn()){if(performance.now()-start>limit)throw Error('Timed out');await wait(20);}};
const key=(down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:69,which:69,bubbles:true}));
const seedRandom=(seed:number)=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const keyName='arctic-drift.check-rare';
localStorage.removeItem(keyName);
const scene=new RiverScene(keyName),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
try {
 const night:Conditions={phase:'night',weather:'clear'},day:Conditions={phase:'day',weather:'clear'};
 check(eligibleRare({y:2500},night).join()==='grayling','Grayling only appears in Blue Ice Bend at night');
 check(!eligibleRare({y:2500},day).length&&!eligibleRare({y:1200},night).length,'Wrong time and starting area retain normal fish');
 check(eligibleRare({y:3500},{phase:'day',weather:'light-snow'}).join()==='burbot','Burbot follows lake snowfall');
 check(eligibleRare({y:3500},night).join()==='crown'&&eligibleRare({y:3500},{phase:'night',weather:'aurora'}).includes('crown'),'Legendary conditions are lake + night + stars or aurora');
 check(!eligibleRare({y:3500},{phase:'night',weather:'windy'}).length,'Legendary is unavailable under incompatible weather');
 for(const[id,y,conditions]of [['grayling',2500,night],['burbot',3500,{phase:'day',weather:'heavy-snow'}],['crown',3500,night]] as [FishId,number,Conditions][]){
  const memory:EncounterMemory={};let result:FishId='whitefish';
  for(let i=1;i<=5;i++){result=selectEncounter(AREA_SPAWNS.lake.fish,{y},conditions,memory,0,()=>.99999);check((i===5)===(result===id),`${id}: guaranteed on fifth valid attempt, never earlier with unlucky rolls`);}
  check(selectEncounter(AREA_SPAWNS.lake.fish,{y},conditions,memory,0,()=>0)!==id,`${id}: encounter cooldown prevents immediate repeat`);
  const before=JSON.stringify(memory);selectEncounter(AREA_SPAWNS.starting.fish,{y:1200},day,memory,0,()=>.5);check(JSON.stringify(memory)===before,`${id}: wrong conditions do not consume pity`);
 }
 const memory:EncounterMemory={},rng=seedRandom(33),counts:Record<string,number>={};
 for(let i=0;i<1000;i++){const id=selectEncounter(AREA_SPAWNS.starting.fish,{y:1200},day,memory,0,rng);counts[id]=(counts[id]??0)+1;}
 check(Object.keys(counts).every(id=>['whitefish','char','salmon'].includes(id))&&counts.whitefish>550,'Normal starting fish distribution remains intact');
 check(chooseFish({},0,()=>1)==='whitefish','Empty table fallback cannot leak legendary fish');
 check(rareClue('crown',{})!==rareClue('crown',{trout:4})&&rareClue('crown',{trout:4})!.includes('Frozen Lake'),'Related discoveries clarify journal clues without exposing formulas');
 const traces=new Set<string>();
 for(const id of ['pike','trout','grayling','burbot','crown'] as FishId[]){
  const s=new FishStruggle(FISH[id].fight,()=>.4),trace:number[]=[];for(let i=0;i<360;i++){s.update(1/60);if(i%20===0)trace.push(Math.round(s.force*100));}traces.add(trace.join());
  for(const fps of [30,60,120])for(let seed=1;seed<=12;seed++){
   const f=new FishFight(FISH[id].fight,seedRandom(seed));let reel=false;
   while(f.outcome==='fighting'&&f.elapsed<25){if(f.tension<.44)reel=true;if(f.tension>.55)reel=false;f.update(1/fps,reel);}
   if(f.outcome!=='landed')throw Error(`${id} not fair at ${fps} FPS seed ${seed}`);
  }
 }
 check(traces.size===5,'Five distinct force rhythms; every hard fish catchable without upgrades at 30/60/120 FPS');
 for(const held of [false,true]){const fight=new FishFight(FISH.crown.fight,()=>.5);for(let i=0;i<1200&&fight.outcome==='fighting';i++)fight.update(1/60,held);check(fight.outcome===(held?'snapped':'escaped'),'Legendary requires active tension control');}
 const cargo=new Cargo(100),catchRandom=seedRandom(45);for(let i=0;i<100;i++)cargo.add('burbot',0,catchRandom);const weights=cargo.entries.map(f=>f.weightKg);check(Math.max(...weights)/Math.min(...weights)>1.8,'Rare catches have noticeably wider weight variation');
 await until(()=>!!Reflect.get(scene,'home'));
 scene.equipment.levels.rod=1;scene.equipment.levels.line=1;scene.equipment.levels.reel=1;
 check(scene.equipment.fightFor('crown').safeTensionWidth>FISH.crown.fight.safeTensionWidth&&scene.equipment.fightFor('crown').progressRequired<FISH.crown.fight.progressRequired,'Existing upgrades visibly help legendary control and fight duration');
 const cues:string[]=[];scene.events.on('river-cue',(id:string)=>cues.push(id));
 const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 for(const[id,area,elapsed,weather]of [['grayling','bend',550,'clear'],['burbot','lake',210,'light-snow'],['crown','lake',550,'aurora']] as const){
  (kayak.body as Phaser.Physics.Arcade.Body).reset(674,1216);await wait(700);
  scene.cargo.encounters[id]={misses:4,cooldown:0};
  Object.assign(scene.environment,{state:{elapsed,weather,remaining:180,seed:19}});
  scene.dynamicWorld.conditions=scene.environment.conditions;
  scene.dynamicWorld.newDay(79,Reflect.get(scene,'home').player,scene.cameras.main.worldView);
  await until(()=>scene.dynamicWorld.spots.some(s=>s.area===area&&s.visitor===id&&!s.retired));
  const spot=scene.dynamicWorld.spots.find(s=>s.area===area&&s.visitor===id&&!s.retired)!;
  check(validWater(spot),'Rare opportunities reuse valid water placements');
  (kayak.body as Phaser.Physics.Arcade.Body).reset(spot.x+20,spot.y);
  await wait(400);
  check(cues.includes(id==='crown'?'legendary-near':'rare-near'),'Assigned opportunity emits its unique nearby audio cue');
  check(Reflect.get(scene.fishing,'shadows').some((s:Phaser.GameObjects.Image)=>s.visible&&s.frame.name.startsWith(`water-shadow/`)),'World signal is readable without revealing the assigned species');
  key(true);await wait(60);key(false);
  await until(()=>scene.fishing.state==='hooked');check(Reflect.get(scene.fishing,'hookedFish')===id,`${id}: condition and pity selected the actual bite`);
  let held=false;
  while(scene.fishing.state==='hooked'){const f=scene.fishing.fight!;const next:boolean=f.tension<.44?true:f.tension>.55?false:held;if(next!==held){held=next;key(held);}await wait(20);}key(false);
  check(scene.cargo.entries.some(f=>f.type===id),`${id}: real minigame stores value, rarity, weight and record`);
  check(cues.includes(id==='crown'?'legendary-catch':'rare-catch'),'Successful catch emits its unique audio cue');
  if(id==='crown')check(Reflect.get(scene.fishing,'legendaryCard').visible,'Legendary catch has its dedicated compact specimen card');
  check(Reflect.get(scene.fishing,'result').includes(id==='crown'?'LEGEND OF THE LAKE':'RARE DISCOVERY'),'First catch has a special presentation');
  await until(()=>scene.fishing.state==='idle');
 }
 const store=new SaveStore(keyName),saved=store.load();check(!!saved.records.crown&&saved.cargo.some(f=>f.type==='crown')&&Object.entries(scene.cargo.encounters).every(([id,value])=>JSON.stringify(saved.encounters?.[id as FishId])===JSON.stringify(value)),'Legendary record, exact cargo and encounter cooldown persist');
 visitNpc(scene,'cargo');const home=Reflect.get(scene,'home') as Home,total=scene.cargo.totalValue,balance=scene.wallet.balance;home.sell();
 check(scene.wallet.balance===balance+total&&scene.cargo.count===0,'Existing merchant sells rare and legendary fish for exact values');
 check(!!store.load().records.crown,'Legendary discovery remains permanently in journal after selling');
 visitNpc(scene,'journal');scene.harborPanel.open('journal');Reflect.set(scene.harborPanel,'selection',7);Reflect.set(scene.harborPanel,'detailOpen',true);Reflect.get(scene.harborPanel,'refresh').call(scene.harborPanel);
 const loaded=new RiverScene(keyName);check(loaded.cargo.records.crown===scene.cargo.records.crown&&loaded.wallet.balance===scene.wallet.balance,'Reload reconstructs journal and money');
 const controls=document.createElement('div');document.body.prepend(controls);
 const button=(label:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=action;controls.append(b);};
 button('Legendary card',()=>{boardKayak(scene);const card=Reflect.get(scene.fishing,'legendaryCard');card.show(saved.cargo.find(f=>f.type==='crown'),true);card.update(kayak.x,kayak.y,4);scene.cameras.main.stopFollow().centerOn(kayak.x,kayak.y-45);scene.scene.pause();scene.audio.play('legendary-catch',.4);});
 button('Legendary signal',()=>{scene.scene.resume();boardKayak(scene);Object.assign(scene.environment,{state:{elapsed:550,weather:'clear',remaining:180,seed:79}});scene.dynamicWorld.conditions=scene.environment.conditions;scene.cargo.encounters.crown={misses:4,cooldown:0};scene.dynamicWorld.newDay(555,{x:674,y:1216},{left:420,right:920,top:1000,bottom:1400});const s=scene.dynamicWorld.spots.find(s=>s.visitor==='crown')!;(kayak.body as Phaser.Physics.Arcade.Body).reset(s.x+70,s.y);scene.cameras.main.startFollow(kayak,true);});
 check(true,`Complete rare fishing loop passed · ${Math.round(game.loop.actualFps)} FPS`);
}catch(e){output.push(String(e));document.querySelector('#result')!.textContent=output.join('\n');}finally{key(false);}
