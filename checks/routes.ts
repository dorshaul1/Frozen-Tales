import { currentAt } from '../src/game/world/areas';
import { MOVEMENT } from '../src/game/tuning';
import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { banks,waterSpans,createFloes } from '../src/game/world/river';
import { SIDE_ROUTES,routeFlow } from '../src/game/world/sideRoutes';
import { DynamicWorld,validWater } from '../src/game/world/DynamicWorld';
import { Discovery } from '../src/game/map/discovery';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
// Shortest water paths with hull clearance, compared against the unchanged main river.
function path(route:typeof SIDE_ROUTES[number],branches:boolean,toPocket=false){
 const step=8,lo=route.points[0][1]-64,hi=route.points.at(-1)![1]+64,minY=Math.floor(lo/step),maxY=Math.ceil(hi/step),nx=200;
 const valid=new Set<number>();for(let iy=minY;iy<=maxY;iy++)for(let ix=35;ix<185;ix++){
 const x=ix*step,y=iy*step;
 if([-18,0,18].every(dy=>(branches?waterSpans(y+dy):[banks(y+dy)]).some(([l,r])=>x-18>l+5&&x+18<r-5)))valid.add(iy*nx+ix);
 }
 const key=(p:readonly number[])=>Math.round(p[1]/step)*nx+Math.round(p[0]/step);
 const start=key(route.points[0]),end=key(toPocket?[route.pocket.x,route.pocket.y]:route.points.at(-1)!);const dist=new Map([[start,0]]),q=[start];
 for(let i=0;i<q.length;i++){const k=q[i];for(const n of [k-1,k+1,k-nx,k+nx])if(valid.has(n)){const x=(k%nx)*step,y=Math.floor(k/nx)*step,dy=Math.floor(n/nx)-Math.floor(k/nx);const flow=currentAt(y)+(branches?routeFlow(x,y):0),cost=step/Math.max(10,MOVEMENT.maxSpeed+flow*dy),next=dist.get(k)!+cost;if(next<(dist.get(n)??Infinity)-.00001){dist.set(n,next);q.push(n);}}}
 return dist.get(end)??Infinity;
}
for(const r of SIDE_ROUTES){const before=path(r,false),after=path(r,true);check(Number.isFinite(after)&&Number.isFinite(path(r,true,true)),'Connected hull-clear route and pocket: '+r.name);out.textContent+=`\n${r.name}: ${before} → ${after}`;if(r.flow)check(after<before,'Downstream shortcut reduces travel time: '+r.name);check(routeFlow(r.pocket.x,r.pocket.y)===0,'Pocket is calm: '+r.name);}
const d=new Discovery();check(SIDE_ROUTES.every(r=>!d.landmarks.has(r.id)),'Routes unmarked before discovery');for(const r of SIDE_ROUTES)d.visit(r.pocket.x,r.pocket.y);check(new Discovery(d.snapshot()).landmarks.has('ice-cut'),'Discovery survives save/load');
let pockets=0;const positions=new Set<string>();for(let day=0;day<20;day++){const w=new DynamicWorld(day+71);w.newDay(day*931+21,{x:760,y:1200},{left:650,right:900,top:1100,bottom:1300});for(const s of w.spots){checkSilent(validWater(s));for(const r of SIDE_ROUTES)if(Math.hypot(s.x-r.pocket.x,s.y-r.pocket.y)<85){pockets++;positions.add(s.x+','+s.y);}}}function checkSilent(v:boolean){if(!v)throw Error('Invalid fishing spot');}
check(pockets>3&&positions.size>3,'Secret fishing varies across days');
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));for(const r of SIDE_ROUTES){const b=document.createElement('button');b.textContent=r.name;b.onclick=()=>{scene.cameras.main.stopFollow();scene.cameras.main.centerOn(r.pocket.x,r.pocket.y);};document.body.prepend(b);}
const statics=scene.physics.world.staticBodies.entries;
for(const r of SIDE_ROUTES){const p=r.pocket;check(!statics.some(b=>{const x=Math.max(b.left,Math.min(p.x,b.right)),y=Math.max(b.top,Math.min(p.y,b.bottom));return Math.hypot(p.x-x,p.y-y)<18;}),'Actual collision bodies leave pocket open: '+r.name);}
