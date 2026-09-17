import { DynamicWorld, validWater } from '../src/game/world/DynamicWorld';
import { banks, createFloes } from '../src/game/world/river';
import { SaveStore } from '../src/game/player/SaveStore';
import { RARE_FISH } from '../src/game/fishing/rareFish';
const lines:string[]=[];
const check=(ok:boolean,text:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${text}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(text);};
const geometry=()=>JSON.stringify([Array.from({length:75},(_,i)=>banks(150+i*50)),createFloes()]);
const before=geometry(),player={x:674,y:1216},view={left:420,right:920,top:1000,bottom:1400};
try{
 const positions=new Set<string>();let opportunityCount=0;
 const world=new DynamicWorld(9);world.conditions={phase:'night',weather:'clear'};
 for(let day=1;day<=12;day++){
  world.newDay(day*71,player,view);
  for(let i=0;i<110;i++)world.update(50,player,view);
  const visitors=world.spots.filter(s=>world.visitorAt(s));opportunityCount+=visitors.length;
  check(world.spots.every(s=>validWater(s)),'Day '+day+': all dynamic activity stays in valid water');
  visitors.forEach(s=>positions.add(`${s.visitor}:${s.x},${s.y}`));
  check(visitors.every(s=>RARE_FISH[s.visitor!]!.areas.includes(s.area)),'Day '+day+': rare visitors preserve area identity');
 }
 check(opportunityCount>3&&positions.size>3,'Same conditions across twelve days create different rare opportunities');
 check(before===geometry(),'Banks, floes and geography are byte-identical across days');
 const tripPositions=new Set<string>();
 for(let trip=0;trip<8;trip++){
  world.newTrip(501+trip*37,player,view);
  for(let i=0;i<110;i++)world.update(50,player,view);
  tripPositions.add(JSON.stringify(world.spots.map(s=>[s.x,s.y,s.visitor])));
 }
 check(tripPositions.size>3,'Separate trips vary fishing activity without remaking geography');
 world.memory.crown={misses:4,cooldown:0};world.newDay(302,player,view);
 const rare=world.spots.find(s=>s.visitor==='crown')!;check(!!rare,'Pity produces a real signaled legendary spot before casting');
 const snapshot=world.snapshot(),copy=new DynamicWorld();copy.memory=JSON.parse(JSON.stringify(world.memory));copy.conditions=world.conditions;
 check(copy.restore(JSON.parse(JSON.stringify(snapshot))),'Saved dynamic state restores');
 const fingerprint=(w:DynamicWorld)=>JSON.stringify([w.snapshot().state,w.clock,w.trip,w.spots.map(s=>[s.x,s.y,s.visitor,s.rareChecked,s.kind,!!s.retired,s.availableAt,s.expiresAt,s.weights])]);
 check(fingerprint(copy)===fingerprint(world),'Reload preserves exact spot assignments, clock and RNG state');
 const store=new SaveStore('arctic-drift.check-dynamic-rares'),progress=store.load();
 store.write({...progress,encounters:world.memory},undefined,world.snapshot());
 world.onChange=()=>{store.write({...store.load(),encounters:world.memory},undefined,world.snapshot());};
 check(world.commit(rare)==='crown','Cast commits the species advertised by the shadow');
 const reloaded=new DynamicWorld();reloaded.conditions=world.conditions;reloaded.restore(store.loadWorld());
 check(!reloaded.spots.some(s=>reloaded.visitorAt(s)==='crown'),'Reload during cast cannot reroll or replay the legendary opportunity');
 check(store.load().encounters?.crown?.cooldown===3,'Pity/cooldown persists atomically with the consumed opportunity');
 const audio=store.loadAudio();store.writeAudio(audio);store.writeEnvironment(store.loadEnvironment());
 check(JSON.stringify(store.loadWorld())===JSON.stringify(world.snapshot()),'Audio, clock and regular saves preserve dynamic encounter state');
 world.conditions={phase:'day',weather:'windy'};
 check(world.spots.every(s=>!world.visitorAt(s)),'Invalid conditions remove rare signals and eligibility');
 check(world.requestOpportunity('salmon','lake'),'Normal quest opportunity hook remains available');
 check(before===geometry(),'Fixed geography remains unchanged after trips and reloads');
 check(true,'Dynamic rare integration complete');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
