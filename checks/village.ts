import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home, HUB } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { canWalk, VILLAGE, villageReserved, type VillageRect } from '../src/game/home/villageLayout';
import { SaveStore } from '../src/game/player/SaveStore';
import { Cargo } from '../src/game/player/Cargo';
import { validSnow } from '../src/game/world/DynamicWorld';
import { banks } from '../src/game/world/river';
const results:string[]=[],result=document.querySelector('#result')!;
const check=(ok:boolean,s:string)=>{results.push((ok?'PASS ':'FAIL ')+s);result.textContent=results.join('\n');if(!ok)throw Error(s);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const held=new Set<number>();
function key(code:number,down:boolean){if(held.has(code)===down)return;down?held.add(code):held.delete(code);window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));}
const tap=async(code:number)=>{key(code,true);await wait(70);key(code,false);await wait(100);};
try {
 const keyName='arctic-drift.check-village',store=new SaveStore(keyName);localStorage.removeItem(keyName);
 const saved=store.load(),cargo=new Cargo();cargo.add('salmon',0,()=>.5);cargo.add('char',0,()=>.5);saved.cargo=[...cargo.entries];saved.records=cargo.records;saved.money=8;store.write(saved);
 const scene=new RiverScene(keyName),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:600,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
 await wait(1400);
 const home=Reflect.get(scene,'home') as Home,kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,body=kayak.body as Phaser.Physics.Arcade.Body,walker=home.fisherman;
 const obstacles=Reflect.get(walker,'obstacles') as VillageRect[];
 const pose=()=>({x:walker.x,y:walker.y});
 // Reach each NPC with actual keys through a grid route around the authored roofs and props.
 async function walkTo(target:{x:number;y:number},reach=4){
  const clear=(x:number,y:number)=>[[0,0],[-2.5,0],[2.5,0],[0,-2.5],[0,2.5]].every(([dx,dy])=>canWalk(x+dx,y+dy,obstacles));
  const step=6,start={x:Math.round(walker.x/step)*step,y:Math.round(walker.y/step)*step};
  const id=(p:{x:number;y:number})=>`${p.x},${p.y}`;
  const queue=[start],previous=new Map<string,{x:number;y:number}|null>([[id(start),null]]);let goal:{x:number;y:number}|undefined;
  for(let i=0;i<queue.length;i++){
   const p=queue[i];if(Math.hypot(p.x-target.x,p.y-target.y)<=reach){goal=p;break;}
   for(const[dx,dy]of[[step,0],[-step,0],[0,step],[0,-step]]){const n={x:p.x+dx,y:p.y+dy};if(previous.has(id(n))||!clear(n.x,n.y)||!clear((p.x+n.x)/2,(p.y+n.y)/2))continue;previous.set(id(n),p);queue.push(n);}
  }
  if(!goal)throw Error(`No village path to ${JSON.stringify(target)}`);
  const route:{x:number;y:number}[]=[];let p:{x:number;y:number}|null=goal;while(p){route.unshift(p);p=previous.get(id(p))??null;}
  const simple=route.filter((p,i)=>i===0||i===route.length-1||(route[i-1].x===p.x)!==(route[i+1].x===p.x));
  for(const point of simple){
   const started=performance.now();
   while(Math.hypot(walker.x-point.x,walker.y-point.y)>2.4){
    key(68,walker.x<point.x-1.6);key(65,walker.x>point.x+1.6);key(83,walker.y<point.y-1.6);key(87,walker.y>point.y+1.6);
    await wait(16);if(performance.now()-started>6000)throw Error(`Walking stuck at ${walker.x},${walker.y} toward ${point.x},${point.y}`);
   }
   for(const c of [65,68,83,87])key(c,false);
  }
 }
 body.reset(820,1500);await wait(300);await tap(69);check(!home.walking,'Cannot leave kayak away from the dock');
 body.reset(VILLAGE.dock.x,VILLAGE.dock.y);kayak.setVelocity(80,0);check(!home.canLand,'Dock requires low speed');
 body.reset(VILLAGE.dock.x,VILLAGE.dock.y);await wait(300);check(home.canLand,'Moored kayak offers landing');
 await tap(69);check(home.walking&&walker.visible&&!String(kayak.frame.name).includes('fisherman')&&String(kayak.frame.name).includes('empty'),'E lands with a separate fisherman and parked empty kayak');
 check(!home.canInteract('cargo')&&home.sell().count===0,'Dock no longer sells fish');
 const parked={x:kayak.x,y:kayak.y};
 await walkTo({x:538,y:1218});check(Math.hypot(kayak.x-parked.x,kayak.y-parked.y)<.1,'Kayak stays parked while walking');
 await walkTo(HUB.seller,30);await tap(69);check(scene.harborPanel.isOpen&&scene.harborPanel.tab==='cargo','Nessa opens existing selling cards');
 const frozen=pose();key(83,true);await wait(300);key(83,false);check(Math.hypot(walker.x-frozen.x,walker.y-frozen.y)<.1,'NPC menu locks walking');
 const balance=scene.wallet.balance,total=scene.cargo.totalValue;await tap(69);check(scene.cargo.count===0&&scene.wallet.balance===balance+total,'Selling preserves exact fish values and credits the existing wallet');await tap(27);
 await walkTo(VILLAGE.npcs.tools,30);await tap(69);check(scene.harborPanel.isOpen&&scene.harborPanel.tab==='tools','Edda opens personal equipment cards');
 const before=scene.wallet.balance;await tap(69);check(scene.equipment.levels.rod===1&&scene.wallet.balance===before-20,'Existing rod purchase applies its unchanged cost and effect');await tap(27);
 await walkTo(HUB.keeper,30);await tap(69);check(scene.harborPanel.isOpen&&scene.harborPanel.tab==='journal','Ivo opens existing fish gallery');await tap(69);
 check(scene.children.list.length>0&&!!scene.cargo.records.salmon,'Personal records survive the village transition');await tap(27);
 const beforePause=pose();scene.audioPanel.open();key(68,true);await wait(350);key(68,false);check(Math.hypot(walker.x-beforePause.x,walker.y-beforePause.y)<.1,'Settings pauses walking');await tap(27);check(!scene.audioPanel.isOpen,'Escape closes settings');
 // Test visible enclosure and solid buildings throughout the authored footprint.
 check(!canWalk(200,1200,obstacles)&&!canWalk(580,1300,obstacles)&&!canWalk(310,1060,obstacles),'Village navigation, river and building footprints block walking');
 for(const[id,x,y]of VILLAGE.scenery)if(id==='frozen-bush')check(!canWalk(x,y,obstacles),`Bush at ${x},${y} has solid collision`);
 check(!validSnow({x:350,y:1180},12)&&villageReserved(350,1180),'Random wildlife stays outside the village');
 await walkTo({x:260,y:1208});key(65,true);await wait(1000);key(65,false);check(walker.x>=246&&canWalk(walker.x,walker.y,obstacles),'Village navigation limit prevents wandering into wilderness');
 await walkTo({x:630,y:1218});await tap(69);check(!home.walking&&!walker.visible&&!String(kayak.frame.name).includes('empty'),'Returning to the dock boards the kayak');
 key(68,true);await wait(650);key(68,false);check(kayak.x>parked.x+30,'Launching restores normal kayak movement');
 const spot=scene.dynamicWorld.spots.find(s=>s.area==='starting')!;body.reset(spot.x+25,spot.y);await wait(650);await tap(69);check(scene.fishing.active,'Existing fishing still starts after leaving village');
 let reel=false;const started=performance.now();while(scene.fishing.state!=='result'&&performance.now()-started<16000){const f=scene.fishing.fight;if(f){if(f.tension<.4)reel=true;if(f.tension>.58)reel=false;key(69,reel);}await wait(20);}key(69,false);check(scene.cargo.count===1,'Fishing after village visit still stores a catch');
 const restored=new SaveStore(keyName).load();check(restored.levels.rod===1&&restored.money===scene.wallet.balance&&restored.cargo.length===1&&!!restored.records.salmon,'Existing save restores money, upgrade, cargo and records');
 await wait(2600);body.reset(VILLAGE.dock.x,VILLAGE.dock.y);await wait(200);await tap(69);await walkTo({x:404,y:1180});
 for(const[label,action]of [['Village overview',()=>{scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1);scene.cameras.main.centerOn(440,1180);}],['Follow fisherman',()=>{scene.cameras.main.setZoom(2);scene.cameras.main.startFollow(walker,true);}],['Night',()=>Object.assign(scene.environment,{state:{elapsed:560,weather:'clear',remaining:150,seed:7}})],['Narrow view',()=>game.scale.resize(440,600)]] as const){const button=document.createElement('button');button.textContent=label;button.onclick=action;document.querySelector('#views')!.append(button);}
 check(true,`Complete village loop passed; ${Math.round(game.loop.actualFps)} FPS. Test save is isolated.`);
}catch(error){results.push(String(error));result.textContent=results.join('\n');}finally{for(const c of [...held])key(c,false);}
