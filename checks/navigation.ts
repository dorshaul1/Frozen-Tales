import type {Kayak} from '../src/game/entities/Kayak';
import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {navigationFlow,NAVIGATION} from '../src/game/world/navigation';import {banks} from '../src/game/world/river';import {validWater} from '../src/game/world/DynamicWorld';import {driftingIce} from '../src/game/world/driftingIce';import {MOVEMENT} from '../src/game/tuning';
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+='\n'+(v?'PASS ':'FAIL ')+s;if(!v)throw Error(s);};
let max=0;for(let y=180;y<5400;y+=8){const[l,r]=banks(y);for(const x of [l+40,(l+r)/2,r-40]){const f=navigationFlow(x,y,'windy');max=Math.max(max,Math.hypot(f.x,f.y));checkSilent(Math.hypot(f.x,f.y)<MOVEMENT.maxSpeed*f.speed);}}function checkSilent(v:boolean){if(!v)throw Error('Flow overpowers starter kayak');}check(true,`Starter can overpower strongest tested flow (${max.toFixed(1)}px/s)`);
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:1000,height:700,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const kayak=Reflect.get(scene,'kayak') as Kayak;const nav=(scene as any).navigation;scene.dynamicWorld.spots.length=0;scene.cameras.main.worldView.setTo(0,0,50,50);nav.update(0,16);
check(driftingIce.length>=2,'Sparse drifting floes spawned');
const before=driftingIce.map(f=>({x:f.x,y:f.y}));for(let i=0;i<3600;i++){nav.update(i*16,16);for(const f of driftingIce){checkSilent(validWater(f,32,false,true));const[l,r]=banks(f.y);checkSilent(Math.abs(f.x-(l+r)/2)>NAVIGATION.centerClearance);}}
check(driftingIce.some((f,i)=>Math.hypot(f.x-before[i].x,f.y-before[i].y)>2),'Ice actually drifts');check(true,'One-minute drift remains valid and preserves central travel lane');
check(driftingIce.every(f=>!validWater(f,10,false)),'Fish spawning excludes moving ice');
const f=driftingIce[0];kayak.setPosition(f.x+65,f.y);const start={x:f.x,y:f.y};for(let i=0;i<100;i++)nav.update(i*16,16);check(Math.hypot(f.x-start.x,f.y-start.y)<.01,'Ice stops before approaching kayak');
for(const rule of NAVIGATION.drift){const b=document.createElement('button');b.textContent='River '+rule.y;b.onclick=()=>{scene.cameras.main.stopFollow();const[l,r]=banks(rule.y);kayak.setPosition((l+r)/2,rule.y);scene.cameras.main.centerOn((l+r)/2,rule.y);};document.body.prepend(b);}
const oldPositions=JSON.stringify(driftingIce.map(f=>({x:f.x,y:f.y})));kayak.setPosition(800,1200);scene.dynamicWorld.trip++;scene.cameras.main.worldView.setTo(0,0,50,50);nav.update(60000,16);check(JSON.stringify(driftingIce.map(f=>({x:f.x,y:f.y})))!==oldPositions,'Next trip changes drifting ice while keeping geography fixed');
kayak.setPosition(800,3500);
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms)),key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
// Isolated fixture: background-tab focus changes must not cancel synthetic held keys.
scene.game.events.off(Phaser.Core.Events.BLUR);
const body=kayak.body as Phaser.Physics.Arcade.Body;
async function upstream(level:number){scene.equipment.levels.speed=level;Reflect.set(scene.equipment,'installed',level?['speed',null,null]:[null,null,null]);const[l,r]=banks(4300);body.reset((l+r)/2,4300);key(87,true);await wait(450);const speed=-body.velocity.y;key(87,false);await wait(200);return speed;}
const base=await upstream(0),better=await upstream(3);check(better>base*1.2,'Paddle upgrades noticeably improve upstream control');scene.equipment.levels.speed=0;
scene.dynamicWorld.spots.length=0;const ice=driftingIce[0],iceBefore={x:driftingIce[0].x,y:driftingIce[0].y};body.reset(ice.x+75,ice.y);const hitBefore=nav.hitAt;key(65,true);await wait(1000);key(65,false);check(nav.hitAt>hitBefore,'Keyboard approach collides with moving-ice hull');check(kayak.x>ice.x,'Kayak stays outside ice rather than passing through');check(Math.hypot(ice.x-iceBefore.x,ice.y-iceBefore.y)>.1&&Math.hypot(ice.x-iceBefore.x,ice.y-iceBefore.y)<15,'Small ice gently yields to contact');
key(68,true);await wait(600);key(68,false);check(kayak.x>ice.x+45,'Kayak can paddle away after contact');
check(true,'Keyboard navigation and collision recovery complete');
