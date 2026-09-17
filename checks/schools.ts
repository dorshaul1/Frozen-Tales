import Phaser from 'phaser';
import { DynamicWorld,validWater } from '../src/game/world/DynamicWorld';
import { makeSchool,moveSchool } from '../src/game/fishing/schools';
import { AREA_SPAWNS,areaAt } from '../src/game/world/spawnRules';
import { banks,createFloes } from '../src/game/world/river';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const world=new DynamicWorld(43),home={x:674,y:1216},view={left:420,right:920,top:1000,bottom:1400};
try{
 world.newDay(43,home,view);const geometry=JSON.stringify([banks(2500),createFloes()]);let positions=new Set<string>();
 for(let trip=0;trip<4;trip++){world.newDay(43+trip*29,home,view);const before=world.spots.map(s=>[s.x,s.y]);for(let tick=0;tick<800;tick++)world.update(50,home,view);check(world.spots.every(s=>validWater(s)&&areaAt(s.y)===s.area),'Trip '+trip+': schools remain in valid water and correct area');check(world.spots.some((s,i)=>s.school&&Math.hypot(s.x-before[i][0],s.y-before[i][1])>1),'Trip '+trip+': schools wander');world.spots.forEach(s=>positions.add(`${Math.round(s.x)},${Math.round(s.y)}`));}
 check(positions.size>25&&JSON.stringify([banks(2500),createFloes()])===geometry,'Trips vary encounters without changing geography');
 const spot={x:800,y:1500,school:makeSchool(800,1500,'large',AREA_SPAWNS.starting.fish,()=>.5)!};spot.school.pause=0;
 moveSchool(spot,.1,{x:760,y:1500},0,()=>.5,()=>true);check(spot.x===800&&spot.y===1500,'Slow approach lets school settle for a cast');
 for(let i=0;i<10;i++)moveSchool(spot,.1,{x:760,y:1500},120,()=>.5,()=>true);check(spot.school.spread>0&&spot.school.cooldown>0&&Math.hypot(spot.x-760,spot.y-1500)>40,'Fast approach gently shifts and spreads school');
 const p=world.spots.find(s=>s.school)!;const x=p.x,y=p.y;for(let i=0;i<40;i++)world.update(50,home,view,p,120);check(p.x===x&&p.y===y,'Cast target remains stable throughout fishing');
 const restored=new DynamicWorld();restored.restore(world.snapshot());check(JSON.stringify(restored.spots.map(s=>s.school))===JSON.stringify(world.spots.map(s=>s.school)),'Movement state restores through existing world snapshot');
 const scene=new RiverScene('arctic-drift.check-schools'),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
 while(!scene.fishing)await wait(100);await wait(150);
 const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 const live=scene.dynamicWorld.spots.find(s=>s.school&&s.school.count>1)!;
 (kayak.body as Phaser.Physics.Arcade.Body).reset(live.x+65,live.y);await wait(200);
 const shadows=Reflect.get(scene.fishing,'shadows') as Phaser.GameObjects.Image[];
 const i=scene.dynamicWorld.spots.indexOf(live)*5;check(shadows.slice(i,i+5).filter(s=>s.visible).length===live.school!.count,'Live activity renders its actual 2–5 fish school');
 const b=document.createElement('button');b.textContent='Narrow';b.onclick=()=>game.scale.resize(440,650);document.body.prepend(b);
 check(true,'School movement verification passed');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
