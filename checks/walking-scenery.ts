import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {addSceneryFootprint,sceneryFootprints} from '../src/game/world/sceneryCollision';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!;function check(v:boolean,s:string){out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);}
const f=Reflect.get(scene,'home').fisherman;f.walkable=()=>true;f.blockedByWildlife=()=>false;f.setMovementEnabled(true);const keys=Reflect.get(f,'keys');
// Isolated test ground avoids authored boundaries; the actual Fisherman update is exercised.
addSceneryFootprint({asset:'rock',x:1800,y:600,radius:20});f.setPosition(1750,600);keys.D.isDown=true;for(let i=0;i<120;i++)f.update(50);keys.D.isDown=false;
check(f.x<=1772&&f.x>1750,'Walking stops at the rock ground footprint');
keys.S.isDown=true;for(let i=0;i<25;i++)f.update(50);keys.S.isDown=false;keys.D.isDown=true;for(let i=0;i<50;i++)f.update(50);keys.D.isDown=false;check(f.x>1828,'Player can walk around the rock without sticking');
const ice=sceneryFootprints.find(p=>p.asset==='wilderness-formation'||p.asset==='blue-ice-outcrop');check(!!ice,'Authored ice formations have shared physical footprints');
if(ice){f.setPosition(ice.x-ice.radius-20,ice.y);keys.D.isDown=true;for(let i=0;i<80;i++)f.update(50);keys.D.isDown=false;check(Math.hypot(f.x-ice.x,f.y-ice.y)>=ice.radius+7.9,'Actual authored formation blocks walking');}
out.textContent+='ALL WALKING SCENERY CHECKS PASSED';
