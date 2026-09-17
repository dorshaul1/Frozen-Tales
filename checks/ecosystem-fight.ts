import {AREA_SPAWNS} from '../src/game/world/spawnRules';
import {eligibleRare,selectEncounter} from '../src/game/fishing/rareFish';
import {journalGuide} from '../src/game/fishing/journalGuide';
import {chooseWaterSign} from '../src/game/fishing/spotReading';
import { banks } from '../src/game/world/river';
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
 check(AREA_SPAWNS.starting.fish.smelt!>0&&!AREA_SPAWNS.bend.fish.smelt,'Smelt provides a Starting River identity');
 check(AREA_SPAWNS.lake.fish.sturgeon!>0&&!AREA_SPAWNS.gorge.fish.sturgeon,'Sturgeon remains a lake-specific return target');
 check(eligibleRare({x:700,y:900},{phase:'evening',weather:'clear'}).includes('ember')&&!eligibleRare({y:2400},{phase:'evening',weather:'clear'}).includes('ember')&&!eligibleRare({y:900},{phase:'day',weather:'clear'}).includes('ember'),'Ember Dace requires the correct area/time/weather');
 const memory={};let found=false;for(let i=0;i<5;i++)if(selectEncounter({whitefish:1},{x:700,y:900},{phase:'evening',weather:'clear'},memory,0,()=>.99)==='ember')found=true;
 check(found,'Starting River rare pity gives a bounded return opportunity');
 for(const id of ['smelt','ember','sturgeon'] as FishId[]){const g=journalGuide(id,{phase:'evening',weather:'clear'},900,0,700);check(g.rows[0].text.length>0&&g.rows[3].text.length>0,id+' Journal derives actionable area and habitat information');}
 const signs=(y:number)=>{const random=rng(77),counts:Record<string,number>={};for(let i=0;i<3000;i++){const s=chooseWaterSign({whitefish:1,trout:1},y,{phase:'day',weather:'clear'},random);counts[s]=(counts[s]??0)+1;}return counts;};
 const start=signs(900),lake=signs(3600);check(start.birds>lake.birds&&lake.large>start.large,'Area ecology changes signal distribution with the same fish pool');
 for(const id of Object.keys(FISH) as FishId[]){const times:number[]=[];for(const fps of [30,60,120])for(let seed=1;seed<=5;seed++){const f=simulate(id,0,1,'smart',fps,seed);if(f.outcome!=='landed')throw Error(id+' skilled fight failed '+f.outcome);times.push(f.elapsed);}check(true,id+': fair at 30/60/120 FPS, '+Math.min(...times).toFixed(1)+'–'+Math.max(...times).toFixed(1)+' sec');check(simulate(id,0,0,'hold').outcome==='snapped',id+': constant reel snaps');check(simulate(id,0,0,'release').outcome==='escaped',id+': permanent slack loses fish');}
 for(const id of Object.keys(FISH) as FishId[]){const e=gear(0),f=new FishFight(e.fightFor(id),rng(81),e.recoveryRate);let held=false;for(let i=0;i<5400&&f.outcome==='fighting';i++){if(i%12===0)held=f.tension<.49;f.update(1/60,held,.8,f.readyToLand);}check(f.outcome==='landed',id+': forgiving with 200ms decisions and imperfect directional control');}
 const a=simulate('crown'),b=simulate('crown',3),c=simulate('crown',0,0);check(b.elapsed<a.elapsed,'Reel/rod/line upgrades improve effective fight time');check(a.elapsed<c.elapsed,'Following directions makes a measurable difference');check(a.secondWind,'Legendary changes phase with second wind');
 const ready=new FishFight(FISH.whitefish.fight);ready.stamina=0;ready.distance=12;ready.update(.1,true);check(ready.outcome==='fighting'&&ready.readyToLand,'Landing requires a deliberate new press');for(let i=0;i<31;i++)ready.update(.1,false);check(!ready.readyToLand&&ready.outcome==='fighting','Missed landing window gives another fair chance');
 const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
 localStorage.removeItem('arctic-drift.check-ecosystem-fight');
 const scene=new RiverScene('arctic-drift.check-ecosystem-fight',true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
 while(!scene.fishing)await wait(100);await wait(150);scene.game.events.off(Phaser.Core.Events.BLUR,Reflect.get(scene.fishing,'cancel'),scene.fishing);const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;const body=kayak.body as Phaser.Physics.Arcade.Body;
 for(const id of ['smelt','ember','sturgeon'] as FishId[]){const cx=265;const spot=scene.fishing.spots[0];Object.assign(spot,{x:cx-50,y:2080,availableAt:0,retired:false,weights:{[id]:1}});body.reset(cx+10,2080);await wait(100);const before=scene.cargo.count;key(69,true);await wait(280);check(scene.fishing.state==='aiming','Hold charges directional cast');key(69,false);await wait(200);check(scene.fishing.active,'Release casts into assisted school');
 const until=performance.now()+60000;while(scene.fishing.state!=='hooked'&&performance.now()<until)await wait(30);check(!!scene.fishing.fight,id+': bite creates in-world opponent');
 while(scene.fishing.state==='hooked'&&performance.now()<until){const f=scene.fishing.fight!;key(69,f.tension<.52&&!f.readyToLand);const angle=f.controlAngle;key(68,Math.cos(angle)>.4);key(65,Math.cos(angle)<-.4);key(83,Math.sin(angle)>.4);key(87,Math.sin(angle)<-.4);if(f.readyToLand){key(69,false);await wait(30);key(69,true);}await wait(16);}
 for(const code of [69,65,68,83,87])key(code,false);check(scene.cargo.count===before+1, String(scene.fishing.fight?.outcome)+' '+scene.fishing.state+' '+Reflect.get(scene.fishing,'result')+' '+id+': cast → fight → tire → reel → land reaches existing inventory');await wait(4800);}
 const beforeMoney=scene.wallet.balance,total=scene.cargo.totalValue;
 const home=Reflect.get(scene,'home');home.walking=true;const {HUB}=await import('../src/game/home/Home');home.player.setPosition(HUB.seller.x,HUB.seller.y+18);
 const result=home.sell();check(result.count===3&&result.earnings===total&&scene.wallet.balance===beforeMoney+total,'New fish sell through existing seller at correct values');
 scene.equipment.save();const saved=new SaveStore('arctic-drift.check-ecosystem-fight').load();
 check(['smelt','ember','sturgeon'].every(id=>!!saved.records[id as FishId]),'New species records survive save/load');
 check(true,'Complete fishing redesign loop passed · '+Math.round(game.loop.actualFps)+' FPS');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
