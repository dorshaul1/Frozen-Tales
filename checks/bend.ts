import { visitNpc, boardKayak } from './hub-helper';
import Phaser from 'phaser';
import { checkFightModel } from './fight-model';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { banks, createFloes } from '../src/game/world/river';
import { FISH, FISHING_SPOTS, type FishId } from '../src/game/fishing/data';
import { FishFight } from '../src/game/fishing/FishFight';
import { SaveStore } from '../src/game/player/SaveStore';
const scene = new RiverScene(null, true);
const game = new Phaser.Game({type:Phaser.AUTO,parent:'test',width:location.search.includes('small')?440:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const log:string[]=[];
const check=(ok:boolean,label:string)=>{log.push((ok?'PASS ':'FAIL ')+label);document.querySelector('#result')!.textContent=log.join('\n');if(!ok)throw Error(label);};
const held=new Set<number>();
function key(code:number,on:boolean){if(held.has(code)===on)return;if(on)held.add(code);else held.delete(code);window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));}
const tap=async(code:number)=>{key(code,true);await wait(70);key(code,false);await wait(100);};
try {
await wait(1000);
log.push(...checkFightModel());
const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,body=kayak.body as Phaser.Physics.Arcade.Body;
for(const y of [1216,2280,2520,2800,3220,3570]){const b=document.createElement('button');b.textContent=String(y);b.onclick=()=>{scene.harborPanel.close();const [l,r]=banks(y);body.reset((l+r)/2,y);};document.querySelector('#views')!.append(b);}
if(location.search.includes('visual')) await new Promise(()=>{});
check(kayak.displayWidth===48 && body.width===34,'Fisherman and kayak enlarged with scaled hull');
check(FISHING_SPOTS.every(s=>{const[l,r]=banks(s.y);return s.x>l+30&&s.x<r-30;}),'All fishing spots remain in open water');
check(createFloes().some(f=>f.width>100),'Large irregular floes integrated');
for(const id of ['pike','trout'] as FishId[])for(const fps of [30,60,120])for(let seed=1;seed<=20;seed++){
 let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
 const fight=new FishFight(FISH[id].fight,random);let reel=false;
 while(fight.outcome==='fighting'&&fight.elapsed<15){if(fight.tension<.4)reel=true;if(fight.tension>.58)reel=false;fight.update(1/fps,reel);}
 if(fight.outcome!=='landed')throw Error(`${id} seed ${seed} ${fps} FPS failed`);
}
check(true,'Pike and trout catchable at 30/60/120 FPS across 20 seeds each');
const paddle=async(x:number,y:number)=>{const start=performance.now();while(Math.hypot(kayak.x-x,kayak.y-y)>12){if(performance.now()-start>15000)throw Error(`Blocked route ${x},${y} at ${kayak.x},${kayak.y}`);key(65,kayak.x>x+6);key(68,kayak.x<x-6);key(87,kayak.y>y+6);key(83,kayak.y<y-6);await wait(20);}for(const c of [...held])key(c,false);};
// Travel the continuous centre channel, retaining the actual keyboard/physics path.
await paddle(800,1250); await paddle(650,1500);
for(let y=1600;y<=2800;y+=70){const[l,r]=banks(y);await paddle((l+r)/2,y);}
check(kayak.y>2700,'Starting River to Blue Ice Bend is navigable with the larger kayak');
for(const [id,index] of [['pike',6],['trout',7]] as const){
 const spot=scene.fishing.spots[index];spot.weights={[id]:1};
 const[l,r]=banks(spot.y);await paddle((l+r)/2,spot.y);await paddle(spot.x+28,spot.y);await wait(1100);
 await tap(69);check(scene.fishing.active,`${id} cast begins`);const start=performance.now();let reel=false;
 while(scene.fishing.state!=='result'&&performance.now()-start<15000){const f=scene.fishing.fight;if(f){if(f.tension<.4)reel=true;if(f.tension>.58)reel=false;key(69,reel);}await wait(20);}key(69,false);
 check(scene.cargo.entries.some(f=>f.type===id),`${id} caught through the real minigame with weight, value and record`);await wait(2700);
}
for(let y=2800;y>=1600;y-=70){const[l,r]=banks(y);await paddle((l+r)/2,y);}
await paddle(650,1500);await paddle(620,1340);await paddle(686,1216);visitNpc(scene,'cargo');await wait(1000);await tap(69);
const total=scene.cargo.totalValue;await tap(69);check(scene.cargo.count===0&&scene.wallet.balance===total&&total>40,'Return home and sell new species for exact, better rewards');await tap(27);
visitNpc(scene,'gear');await wait(1000);await tap(69);await tap(69);
check(scene.equipment.levels.rod===1&&scene.wallet.balance===total-20,'Earned rewards purchase a rod from Mara');await tap(27);
check(scene.equipment.fightFor('trout').safeTensionWidth>FISH.trout.fight.safeTensionWidth,'Upgrade widens Lake Trout fight safe range');
check(!!scene.cargo.records.pike&&!!scene.cargo.records.trout,'Both journal records survive selling');
const store=new SaveStore('arctic-drift.check-bend');scene.cargo.add('trout');store.write({version:2,money:scene.wallet.balance,levels:{...scene.equipment.levels},cargo:[...scene.cargo.entries],records:scene.cargo.records});
check(store.load().cargo[0]?.type==='trout'&&!!store.load().records.pike,'New fish persist through the existing save store');localStorage.removeItem('arctic-drift.check-bend');
check(true,'Complete wilderness fishing / selling / upgrade loop passed');
}catch(e){log.push(String(e));document.querySelector('#result')!.textContent=log.join('\n');}finally{for(const c of [...held])key(c,false);}
