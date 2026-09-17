import {ATLAS,ASSETS} from '../src/game/assets/catalog';
import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {VILLAGE,canWalk} from '../src/game/home/villageLayout';import {VILLAGE_FIXTURES} from '../src/game/home/villageFixtures';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:innerWidth,height:innerHeight,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const home=Reflect.get(scene,'home'),obstacles=Reflect.get(home.fisherman,'obstacles'),lights=home.lighting,emitters=Reflect.get(lights,'emitters');const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
for(const f of VILLAGE_FIXTURES.filter(f=>f.post))for(const b of VILLAGE.buildings){const frame=scene.textures.getFrame(ATLAS,ASSETS[b.asset]);check(!(f.x<b.x+frame.realWidth&&f.x+16>b.x&&f.y<b.y+frame.realHeight&&f.y+24>b.y),'Freestanding post clear of buildings');}
for(const f of VILLAGE_FIXTURES.filter(f=>f.post))check(!canWalk(f.x+8,f.baseY,obstacles),'Post base blocks walking');
let clear=true;for(const path of VILLAGE.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=d;t+=4)clear&&=canWalk(a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d,obstacles);}
check(clear,'All village paths remain clear');
for(let i=0;i<120;i++)lights.update(50,1,1200);check(lights.strength>.99&&emitters.every((e:any)=>e.image.alpha>.9),'Night panes illuminate');const identities=emitters.map((e:any)=>e.image);
for(let i=0;i<120;i++){scene.cameras.main.setScroll(i*2,850+i);lights.update(50,0,1200);}check(lights.strength<.01&&emitters.every((e:any)=>e.image.alpha<.01),'Day fades lanterns out');check(identities.every((e:any,i:number)=>e===emitters[i].image),'Camera movement reuses fixtures');
check(VILLAGE_FIXTURES.every(f=>f.radius<=24),'Restrained local light radii');
scene.environment.advanceToPhase('night');scene.environment.setWeather('clear');scene.cameras.main.stopFollow().setZoom(1).centerOn(365,1180);
document.querySelector('#night')!.addEventListener('click',()=>scene.environment.advanceToPhase('night'));document.querySelector('#day')!.addEventListener('click',()=>scene.environment.advanceToPhase('day'));
for(const [label,x,y]of [['Square',365,1155],['Home',270,970],['Market',215,1200],['Harbor',510,1318]] as const){const b=document.createElement('button');b.textContent=label;b.onclick=()=>scene.cameras.main.stopFollow().setZoom(2).centerOn(x,y);document.querySelector('#ui')!.append(b);}
out.textContent+='ALL LIGHTING CHECKS PASSED';
