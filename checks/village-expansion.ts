import {ATLAS,ASSETS} from '../src/game/assets/catalog';
import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {VILLAGE,canWalk,WORKSHOP_BAY} from '../src/game/home/villageLayout';import {SLEEP} from '../src/game/home/Sleep';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:innerWidth,height:innerHeight,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const home=Reflect.get(scene,'home'),kayak=Reflect.get(scene,'kayak'),obstacles=Reflect.get(home.fisherman,'obstacles');
scene.cameras.main.stopFollow().setZoom(1).centerOn(375,1185);
const out=document.querySelector('#result')!,check=(ok:boolean,label:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+label+'\n';};
const valid=(x:number,y:number)=>canWalk(x,y,obstacles);
const start=[630,1216],queue=[start],visited=new Set([start.join(',')]),parents=new Map<string,string>();
for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of[[4,0],[-4,0],[0,4],[0,-4]]){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(!visited.has(key)&&valid(nx,ny)){visited.add(key);parents.set(key,`${x},${y}`);queue.push([nx,ny]);}}}
const targets=[['home',SLEEP.outside.x,SLEEP.outside.y,20],['requests',VILLAGE.requestBoard.x,VILLAGE.requestBoard.y,30],['forecast',VILLAGE.forecastBoard.x,VILLAGE.forecastBoard.y,28],...Object.entries(VILLAGE.npcs).filter(([id])=>id!=='merchant').map(([id,p])=>[id,p.x,p.y,35]),['communal',302,1390,20],['utility',238,1430,20]];
for(const [name,x,y,r]of targets)check(queue.some(p=>Math.hypot(p[0]-Number(x),p[1]-Number(y))<Number(r)),`Dock → ${name} reachable`);
check(queue.length>4000,`${queue.length*16} square pixels connected walkable space`);
let bad=0;for(const path of VILLAGE.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=d;t+=4)if(!valid(a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d)){bad++;const px=a[0]+(b[0]-a[0])*t/d,py=a[1]+(b[1]-a[1])*t/d;out.textContent+=JSON.stringify(obstacles.filter((r:any)=>r.radius!==undefined?Math.hypot(px-r.x,py-r.y)<10+r.radius:Math.hypot(px-Math.max(r.x,Math.min(px,r.x+r.width)),py-Math.max(r.y,Math.min(py,r.y+r.height)))<10))+' ';out.textContent+=`Blocked path ${Math.round(a[0]+(b[0]-a[0])*t/d)},${Math.round(a[1]+(b[1]-a[1])*t/d)}\n`;}}
check(bad===0,'Authored path centerlines clear');
kayak.body.reset(VILLAGE.dock.x,VILLAGE.dock.y);kayak.setVelocity(0,0);check(home.interactDock()&&home.walking,'Main dock landing');check(home.interactDock()&&!home.walking,'Main dock boarding');kayak.body.reset(WORKSHOP_BAY.x,WORKSHOP_BAY.y);check(home.canInteract('gear'),'Water-accessible workshop');
// Drive the real walking controller along each checked route, including turns.
kayak.body.reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();
const keys=Reflect.get(home.fisherman,'keys');let walked=0;
for(const [name,x,y,r]of targets){
 const end=queue.find(p=>Math.hypot(p[0]-Number(x),p[1]-Number(y))<Number(r));if(!end)continue;
 const route:number[][]=[];let cursor=end.join(',');while(cursor!==start.join(',')){route.push(cursor.split(',').map(Number));cursor=parents.get(cursor)!;}route.reverse();
 home.fisherman.setPosition(...start);let okay=true;
 for(const [x,y]of route){const dx=x-home.fisherman.x,dy=y-home.fisherman.y;for(const key of Object.values(keys) as any[])key.isDown=false;keys.D.isDown=dx>.1;keys.A.isDown=dx<-.1;keys.S.isDown=dy>.1;keys.W.isDown=dy<-.1;home.fisherman.update(1000*4/VILLAGE.walkSpeed);if(Math.hypot(home.fisherman.x-x,home.fisherman.y-y)>.2){okay=false;break;}walked++;}
 check(okay,`Actual walking controller → ${name}`);
 const service={seller:'cargo',tools:'tools',keeper:'journal'}[String(name) as 'seller'|'tools'|'keeper'];if(service)check(home.canInteract(service),`${name} interaction works at new position`);
}
for(const key of Object.values(keys) as any[])key.isDown=false;
home.fisherman.setPosition(SLEEP.outside.x,SLEEP.outside.y);scene.environment.advanceToPhase('night');check(scene.sleep.begin(),'Sleep begins at relocated home');for(let i=0;i<75;i++)scene.sleep.update(50,false);check(!scene.sleep.active&&valid(home.fisherman.x,home.fisherman.y),'Sleep returns to clear outside space');
home.fisherman.setPosition(...start);home.interactDock();out.textContent+=`Walked ${walked*4} world pixels through districts.\n`;
const visual=[...VILLAGE.buildings.map(b=>({id:b.asset,x:b.x,y:b.y})),...VILLAGE.props.filter(([id])=>id!=='harbor-landing').map(([id,x,y])=>({id,x,y})),...Object.values(VILLAGE.npcs).map(n=>({id:n.asset,x:n.x-16,y:n.y-16}))].map(p=>{const f=scene.textures.getFrame(ATLAS,ASSETS[p.id]);return {...p,w:f.realWidth,h:f.realHeight};});
let overlaps=0;for(let i=0;i<visual.length;i++)for(let j=i+1;j<visual.length;j++){const a=visual[i],b=visual[j];if(a.x+2<b.x+b.w-2&&a.x+a.w-2>b.x+2&&a.y+2<b.y+b.h-2&&a.y+a.h-2>b.y+2){overlaps++;out.textContent+=`Visual overlap: ${a.id} (${a.x},${a.y}) / ${b.id} (${b.x},${b.y})\n`;}}
check(overlaps===0,'Building and prop silhouettes do not overlap');
scene.environment.setWeather('clear');scene.environment.advanceToPhase('day');
document.querySelector('#night')!.addEventListener('click',()=>scene.environment.advanceToPhase('night'));document.querySelector('#day')!.addEventListener('click',()=>scene.environment.advanceToPhase('day'));
document.querySelector('#walk')!.addEventListener('click',()=>{kayak.body.reset(VILLAGE.dock.x,VILLAGE.dock.y);kayak.setVelocity(0,0);if(!home.walking)home.interactDock();scene.cameras.main.setZoom(2).startFollow(home.fisherman,false);});

scene.cameras.main.stopFollow().setZoom(1).centerOn(365,1180);

for(const [label,x,y]of [['Square',365,1155],['Home',270,970],['Market',215,1200],['Research',480,987],['Harbor',510,1318],['Social',270,1385]] as const){const button=document.createElement('button');button.textContent=label;button.onclick=()=>scene.cameras.main.stopFollow().setZoom(2).centerOn(x,y);document.querySelector('#ui')!.append(button);}
