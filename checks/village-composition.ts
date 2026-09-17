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
 const keyName='arctic-drift.check-village-composition',store=new SaveStore(keyName);localStorage.removeItem(keyName);
 const saved=store.load(),cargo=new Cargo();cargo.add('salmon',0,()=>.5);cargo.add('char',0,()=>.5);saved.cargo=[...cargo.entries];saved.records=cargo.records;saved.money=8;store.write(saved);
 const scene=new RiverScene(keyName),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:800,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
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

 game.events.off(Phaser.Core.Events.BLUR);scene.cameras.main.setZoom(1);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(435,1190);
 for(const[label,action]of [['Overview',()=>{scene.cameras.main.setZoom(1);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(435,1190);}],['Village close',()=>{scene.cameras.main.setZoom(2);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(405,1155);}],['Workshop close',()=>{scene.cameras.main.setZoom(3);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(482,1317);}],['Night',()=>Object.assign(scene.environment,{state:{elapsed:560,weather:'clear',remaining:150,seed:7}})] ] as const){const b=document.createElement('button');b.textContent=label;b.onclick=action;document.querySelector('#views')!.append(b);}
 const run=document.createElement('button');run.textContent='Walk all destinations';run.onclick=async()=>{try{
 body.reset(VILLAGE.dock.x,VILLAGE.dock.y);await wait(200);await tap(69);check(home.walking,'Dock landing still works');
 for(const [name,point,view]of [['Market',HUB.seller,'cargo'],['Tools',VILLAGE.npcs.tools,'tools'],['Journal',HUB.keeper,'journal']] as const){
 await walkTo(point,30);await tap(69);check(scene.harborPanel.isOpen&&scene.harborPanel.tab===view,name+' reached on foot and existing UI opens');await tap(27);check(!scene.harborPanel.isOpen,'Escape restores walking');}
 const {SLEEP}=await import('../src/game/home/Sleep');await walkTo(SLEEP.outside,5);check(true,'Igloo entrance reachable');
 await walkTo(VILLAGE.requestBoard,28);check(true,'Request board reachable');
 await walkTo({x:469,y:1345},5);check(true,'Workshop platform reachable from village');
 await walkTo({x:310,y:1175},5);check(true,'Communal bench corner reachable');
 await walkTo({x:VILLAGE.dock.landX,y:VILLAGE.dock.landY},5);await tap(69);check(!home.walking,'Return to kayak and launch');
 const {WORKSHOP_BAY}=await import('../src/game/home/villageLayout');body.reset(WORKSHOP_BAY.x+90,WORKSHOP_BAY.y);key(65,true);await wait(600);key(65,false);await wait(400);
 check(body.x<WORKSHOP_BAY.x+90,'Service bay has open water access');body.reset(WORKSHOP_BAY.x,WORKSHOP_BAY.y);await wait(200);await tap(69);check(scene.harborPanel.isOpen&&scene.harborPanel.tab==='gear','Kayak workshop opens directly in water');await tap(27);
 check(true,'Full village traversal and interactions passed');
 }catch(e){result.textContent+='\nFAIL '+String(e);}finally{for(const c of [...held])key(c,false);}};document.querySelector('#views')!.append(run);
 // Inspect fixed path clearance. The radius-8 corgi is a moving resident, not a permanent path blockage.
 for(let pathIndex=0;pathIndex<VILLAGE.paths.length;pathIndex++){
 const path=VILLAGE.paths[pathIndex];let valid=true,bad='';
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<=length;d+=2){const x=a[0]+(b[0]-a[0])*d/length,y=a[1]+(b[1]-a[1])*d/length;if(!canWalk(x,y,obstacles.filter(o=>o.radius!==8))){valid=false;bad=` ${Math.round(x)},${Math.round(y)}`;break;}}}
 results.push((valid?'PASS ':'FAIL ')+`Painted path ${pathIndex+1} clear`+bad);
 }
 result.textContent=results.join('\n');
}catch(error){results.push(String(error));result.textContent=results.join('\n');}finally{for(const c of [...held])key(c,false);}
