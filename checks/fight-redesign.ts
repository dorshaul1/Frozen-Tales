import Phaser from 'phaser';
import { FishFight } from '../src/game/fishing/FishFight';
import { FISH,type FishId } from '../src/game/fishing/data';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { Cargo } from '../src/game/player/Cargo';
import { Wallet } from '../src/game/player/Wallet';
import { Equipment } from '../src/game/upgrades/Equipment';
import { SaveStore } from '../src/game/player/SaveStore';
import { STARTER_LEVELS } from '../src/game/upgrades/data';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
const rng=(seed:number)=>()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const gear=(level:number)=>new Equipment(new Cargo(),new Wallet(),new SaveStore(null),{...STARTER_LEVELS,rod:level,line:level,reel:level});
function simulate(id:FishId,level=0,following=1,policy='smart',fps=60,seed=23){const e=gear(level),f=new FishFight(e.fightFor(id),rng(seed),e.recoveryRate);for(let i=0;i<fps*90&&f.outcome==='fighting';i++)f.update(1/fps,policy==='hold'||policy==='smart'&&f.tension<.52,following,f.readyToLand);return f;}
try{
 for(const id of Object.keys(FISH) as FishId[]){const times:number[]=[];for(const fps of [30,60,120])for(let seed=1;seed<=5;seed++){const f=simulate(id,0,1,'smart',fps,seed);if(f.outcome!=='landed')throw Error(id+' skilled fight failed '+f.outcome);times.push(f.elapsed);}check(true,id+': fair at 30/60/120 FPS, '+Math.min(...times).toFixed(1)+'–'+Math.max(...times).toFixed(1)+' sec');check(simulate(id,0,0,'hold').outcome==='snapped',id+': constant reel snaps');check(simulate(id,0,0,'release').outcome==='escaped',id+': permanent slack loses fish');}
 for(const id of Object.keys(FISH) as FishId[]){const e=gear(0),f=new FishFight(e.fightFor(id),rng(81),e.recoveryRate);let held=false;for(let i=0;i<5400&&f.outcome==='fighting';i++){if(i%12===0)held=f.tension<.49;f.update(1/60,held,.8,f.readyToLand);}check(f.outcome==='landed',id+': forgiving with 200ms decisions and imperfect directional control');}
 const a=simulate('crown'),b=simulate('crown',3),c=simulate('crown',0,0);check(b.elapsed<a.elapsed,'Reel/rod/line upgrades improve effective fight time');check(a.elapsed<c.elapsed,'Following directions makes a measurable difference');check(a.secondWind,'Legendary changes phase with second wind');
 const ready=new FishFight(FISH.whitefish.fight);ready.stamina=0;ready.distance=12;ready.update(.1,true);check(ready.outcome==='fighting'&&ready.readyToLand,'Landing requires a deliberate new press');for(let i=0;i<31;i++)ready.update(.1,false);check(!ready.readyToLand&&ready.outcome==='fighting','Missed landing window gives another fair chance');
 const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
 localStorage.removeItem('arctic-drift.check-fight-redesign');
 const scene=new RiverScene('arctic-drift.check-fight-redesign',true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
 while(!scene.fishing)await wait(100);await wait(150);const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;const body=kayak.body as Phaser.Physics.Arcade.Body;
 for(const id of ['whitefish','salmon','crown'] as FishId[]){const spot=scene.fishing.spots[0];Object.assign(spot,{x:832,y:1200,availableAt:0,retired:false,weights:{[id]:1}});body.reset(892,1200);await wait(100);const before=scene.cargo.count;key(69,true);await wait(280);check(scene.fishing.state==='aiming','Hold charges directional cast');key(69,false);await wait(200);check(scene.fishing.active,'Release casts into assisted school');
 const until=performance.now()+60000;while(scene.fishing.state!=='hooked'&&performance.now()<until)await wait(30);check(!!scene.fishing.fight,id+': bite creates in-world opponent');
 while(scene.fishing.state==='hooked'&&performance.now()<until){const f=scene.fishing.fight!;key(69,f.tension<.52&&!f.readyToLand);const angle=f.controlAngle;key(68,Math.cos(angle)>.4);key(65,Math.cos(angle)<-.4);key(83,Math.sin(angle)>.4);key(87,Math.sin(angle)<-.4);if(f.readyToLand){key(69,false);await wait(30);key(69,true);}await wait(16);}
 for(const code of [69,65,68,83,87])key(code,false);check(scene.cargo.count===before+1,id+': cast → fight → tire → reel → land reaches existing inventory');await wait(4800);}
 const preview=document.createElement('button');preview.textContent='Fight preview';preview.onclick=()=>{body.reset(892,1200);const target=scene.fishing.spots[0];Reflect.set(scene.fishing,'phase','hooked');Reflect.set(scene.fishing,'target',target);Reflect.set(scene.fishing,'hookedFish','crown');Reflect.set(scene.fishing,'castPoint',{x:832,y:1200});Reflect.set(scene.fishing,'fishPoint',{x:832,y:1200});Reflect.set(scene.fishing,'currentFight',new FishFight(scene.equipment.fightFor('crown')));scene.fishing.fight!.controlAngle=Math.PI;scene.fishing.update(0,false,false);scene.scene.pause();};document.body.prepend(preview);
 const narrow=document.createElement('button');narrow.textContent='Narrow';narrow.onclick=()=>game.scale.resize(440,680);document.body.prepend(narrow);
 check(true,'Complete fishing redesign loop passed · '+Math.round(game.loop.actualFps)+' FPS');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
