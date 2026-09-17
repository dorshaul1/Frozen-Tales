import { visitNpc, boardKayak } from './hub-helper';
import Phaser from 'phaser';
import { DynamicWorld, validWater, validSnow, validFloe, outside, type View } from '../src/game/world/DynamicWorld';
import { AREA_SPAWNS, ANIMAL_RULES, DYNAMIC, areaAt } from '../src/game/world/spawnRules';
import { banks, createFloes } from '../src/game/world/river';
import { chooseFish, FISH, type FishId } from '../src/game/fishing/data';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
const results:string[]=[];
const check=(ok:boolean,s:string)=>{results.push((ok?'PASS ':'FAIL ')+s);document.querySelector('#result')!.textContent=results.join('\n');if(!ok)throw Error(s);};
const viewAt=(p:{x:number;y:number}):View=>({left:p.x-250,right:p.x+250,top:p.y-175,bottom:p.y+175});
const advance=(w:DynamicWorld,seconds:number,p={x:686,y:1216})=>{for(let i=0;i<seconds*20;i++)w.update(50,p,viewAt(p));};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const held=new Set<number>();
function key(code:number,on:boolean){if(held.has(code)===on)return;if(on)held.add(code);else held.delete(code);window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));}
const tap=async(code:number)=>{key(code,true);await wait(70);key(code,false);await wait(100);};
try {
 const geometry=JSON.stringify([Array.from({length:100},(_,i)=>banks(100+i*38)),createFloes()]);
 const signatures=new Set<string>(),animals=new Set<string>(),species=new Set<FishId>();
 let rare=0,total=0,peak=0;
 for(let seed=1;seed<=80;seed++) {
  const world=new DynamicWorld(seed),player={x:800,y:2700},view=viewAt(player);
  world.newTrip(seed,player,view);
  signatures.add(JSON.stringify(world.spots.map(s=>[s.x,s.y])));
  if(world.spots.some(s=>!validWater(s)||!outside(s,view)))throw Error('Invalid initial activity');
  if(world.spots.some((a,i)=>world.spots.some((b,j)=>i!==j&&Math.hypot(a.x-b.x,a.y-b.y)<DYNAMIC.spacing)))throw Error('Activity spacing');
  for(const spot of world.spots){
   if(Object.keys(spot.weights).some(id=>!(AREA_SPAWNS[spot.area].fish[id as FishId]??0)&&!(spot.area==='starting'&&spot.y>1850&&id==='pike')))throw Error('Fish escaped its area pool');
   species.add(chooseFish(spot.weights,0,world.random));
  }
  const seen=new Set<number>();
  for(let tick=0;tick<2400;tick++) {
   world.update(50,player,view);
   peak=Math.max(peak,world.encounters.reduce((n,e)=>n+e.points.length,0));
   for(const e of world.encounters)if(!seen.has(e.id)){
    seen.add(e.id);total++;if(e.species==='polar-bear')rare++;
    animals.add(JSON.stringify([e.species,e.points]));
    const r=ANIMAL_RULES[e.species];
    if(e.points.length<r.group[0]||e.points.length>r.group[1])throw Error('Invalid group size');
    if(e.points.some(p=>!outside(p,view,90)||!r.areas.includes(areaAt(p.y))||(r.terrain==='snow'&&!validSnow(p,r.radius))||(r.terrain==='floe'&&!validFloe(p,r.radius))))throw Error('Invalid wildlife spawn');
    if(world.encounters.filter(a=>a.species===e.species).reduce((n,a)=>n+a.points.length,0)>r.maxActive)throw Error('Species limit');
   }
  }
 }
 check(signatures.size===80&&animals.size>50,'80 seeds produce different valid fishing activity and wildlife groups');
 check(species.size===Object.keys(FISH).length,'Catches vary while each area retains its fish identity');
 check(rare>0&&rare/total<.08,'Polar bears remain rare and solitary');
 check(peak<=DYNAMIC.wildlifeLimit,'Wildlife stays within global and species caps');
 check(geometry===JSON.stringify([Array.from({length:100},(_,i)=>banks(100+i*38)),createFloes()]),'All seeds leave geography, floes and routes identical');
 const w=new DynamicWorld(103),home={x:686,y:1216};w.newTrip(103,home,viewAt(home));
 const old=w.spots.map(s=>({...s}));const caught=w.spots[0];w.caught(caught);advance(w,20);
 check(caught.retired===true&&caught.availableAt>w.clock,'Caught activity stays inactive during cooldown');
 advance(w,160);
 check(w.spots.some(s=>!old.some(o=>o.x===s.x&&o.y===s.y)),'Long trips replace activity at new positions');
 check(w.requestOpportunity('trout','lake')&&!w.requestOpportunity('trout','starting'),'Quest hook accepts only appropriate-area fish');advance(w,35);
 check(w.spots.some(s=>s.required==='trout'&&s.area==='lake'&&validWater(s)),'Required species receives a guaranteed bite opportunity within bounded time');
 w.newTrip(200,home,viewAt(home));advance(w,10);
 check(w.trip===2,'Leaving home can create a new trip seed without rebuilding the map');
 const scene=new RiverScene(null);
 const game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
 await wait(1100);const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,body=kayak.body as Phaser.Physics.Arcade.Body;
 check(scene.fishing.spots===scene.dynamicWorld.spots&&scene.fishing.spots.length>=10,'Live fishing uses dynamic activity with bounded sprite count');
 const spot=scene.dynamicWorld.spots.find(s=>s.area==='starting'&&s.y>1300)??scene.dynamicWorld.spots[0];
 body.reset(spot.x+25,spot.y);await wait(800);const trip=scene.dynamicWorld.trip;
 await tap(69);check(scene.fishing.active,'A procedurally placed activity starts the existing minigame');
 let reel=false;const start=performance.now();while(scene.fishing.state!=='result'&&performance.now()-start<15000){const f=scene.fishing.fight;if(f){if(f.tension<.4)reel=true;if(f.tension>.58)reel=false;key(69,reel);}await wait(20);}key(69,false);
 check(scene.cargo.count===1&&spot.retired===true,'Dynamic catch stores a fish and retires activity without moving the target');
 await wait(2600);visitNpc(scene,'cargo');await wait(500);await tap(69);const value=scene.cargo.totalValue;await tap(69);
 check(scene.wallet.balance===value&&scene.cargo.count===0,'Dynamic catch sells through the existing dock');await tap(27);
 boardKayak(scene);body.reset(800,1650);await wait(500);check(scene.dynamicWorld.trip===trip+1,'Returning home then leaving begins a distinct trip');
 for(const y of [2200,2050,2200]){const[l,r]=banks(y);body.reset((l+r)/2,y);await wait(150);}
 const label=scene.children.list.find(c=>c instanceof Phaser.GameObjects.Text&&c.text==='BLUE ICE BEND') as Phaser.GameObjects.Text;
 check(!!label&&label.alpha<.9,'Area-name reveal restarts on re-entry');
 check(scene.children.list.filter(c=>c instanceof Phaser.GameObjects.Image&&String(c.frame.name).startsWith('fish-spot/')).length<=14,'Fishing shadow sprites stay bounded after trips');
 check(true,`Dynamic loop complete; ${Math.round(game.loop.actualFps)} FPS`);
}catch(e){results.push(String(e));document.querySelector('#result')!.textContent=results.join('\n');}finally{for(const c of [...held])key(c,false);}
