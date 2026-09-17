import {landings} from '../src/game/home/Landings';
import {validWater} from '../src/game/world/DynamicWorld';
import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {FLOW_STRETCHES,ridingFlow,rideMomentum,NO_RIDE} from '../src/game/world/flowRiding';
import {banks,createFloes} from '../src/game/world/river';
import {dockFlowScale} from '../src/game/world/navigation';
const out=document.querySelector('#result')!,check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
for(const lane of FLOW_STRETCHES){
 const y=(lane.start+lane.end)/2,[l,r]=banks(y),x=(l+r)/2;
 const center=ridingFlow(x,y),edge=ridingFlow(x+(r-l)*.315,y);
 check(center.y>0&&center.boost>10&&edge.y<0&&edge.boost<center.boost,`Downstream lane / weaker upstream ribbon at ${y}`);
 let m=0;for(let i=0;i<180;i++)m=rideMomentum(m,center,center.x*125,center.y*125,1/60);
 check(m>center.boost*.9,'Aligned entry builds speed gradually');
 const coast=rideMomentum(m,NO_RIDE,0,125,1/60);check(coast<m&&coast>m*.98,'Exit preserves momentum without a speed jump');
 check(rideMomentum(0,center,-center.x*125,-center.y*125,1/60)===0,'Opposing a lane cannot earn riding speed');
}
const scene=new RiverScene(null,true),game=new Phaser.Game({type:Phaser.AUTO,width:1000,height:700,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
const kayak=Reflect.get(scene,'kayak'),nav=Reflect.get(scene,'navigation');
scene.game.events.off(Phaser.Core.Events.BLUR);
const keys=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
async function ride(direction:number,enabled=true,turbo=false,stabilizer=false){
 const y=direction>0?2250:2580,[l,r]=banks(y),x=(l+r)/2+(direction<0?(r-l)*.315:0);
 kayak.body.reset(x,y);kayak.flowMomentum=0;kayak.moduleValue=(id:string)=>id==='turbo'&&turbo?1:0;Reflect.set(kayak,'speedMultiplier',()=>stabilizer?1.24:1);
 let peak=0;const start=performance.now();
 while(performance.now()-start<3500){
  const [a,b]=banks(kayak.y),target=(a+b)/2+(direction<0?(b-a)*.315:0);
  keys(83,direction>0);keys(87,direction<0);keys(68,kayak.x<target-10);keys(65,kayak.x>target+10);keys(16,turbo);
  if(!enabled)kayak.rideFlow=NO_RIDE;
  peak=Math.max(peak,kayak.body.velocity.length());await wait(16);
 }
 for(const k of [83,87,68,65,16])keys(k,false);
 return {peak,distance:Math.abs(kayak.y-y),momentum:kayak.flowMomentum};
}
try{
 const down=await ride(1);check(down.peak>155&&down.momentum>5,`Live downstream riding reaches ${down.peak.toFixed(0)} px/s`);
 const up=await ride(-1);check(up.distance>200,`Live upstream ribbon navigable (${up.distance.toFixed(0)}px)`);
 const motor=await ride(1,true,true);check(motor.peak>down.peak*1.15,`Turbo stacks with flow (${motor.peak.toFixed(0)}px/s)`);
 const stable=await ride(1,true,false,true);check(stable.distance>250,'Stabilizer retains responsive river travel');
 const [l,r]=banks(2400);kayak.body.reset((l+r)/2,2400);kayak.setVelocity(0,0);kayak.flowMomentum=0;
 const count=scene.children.length;for(let i=0;i<300;i++)nav.update(i*16,16);check(scene.children.length===count,'Flow graphics do not allocate per-frame scene objects');
 check(dockFlowScale(674,1216)===0,'Dock approach remains calm');
 out.textContent+='LIVE FLOW CHECKS COMPLETE\n';
}catch(e){out.textContent+='FAIL '+e;}
for(const [name,y]of [['River',600],['Bend',2400],['Lake',3650],['Gorge',4400]] as const){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{const[l,r]=banks(y);kayak.body.reset((l+r)/2,y);};document.querySelector('#controls')!.append(b);}
const full=document.createElement('button');full.textContent='Full downstream + upstream trip';document.querySelector('#controls')!.append(full);
full.onclick=async()=>{
 document.querySelectorAll<HTMLButtonElement>('#controls button').forEach(b=>b.disabled=true);kayak.moduleValue=()=>0;Reflect.set(kayak,'speedMultiplier',()=>1);
 try{for(const direction of (new URLSearchParams(location.search).has('up')?[-1]:[1,-1])){
  const focused=new URLSearchParams(location.search).has('bendcheck');
  const startY=direction>0?(focused?3100:350):(focused?3400:5280),endY=direction>0?(focused?3400:5280):(focused?3100:350),[l,r]=banks(startY);kayak.body.reset((l+r)/2,startY);kayak.flowMomentum=0;
  const step=16,valid=new Map<string,boolean>(),id=(x:number,y:number)=>`${x},${y}`;
  const clear=(x:number,y:number)=>{const k=id(x,y);if(!valid.has(k))valid.set(k,validWater({x,y},12,false)&&landings().every(d=>Math.abs(x-(d.x-76))>69||Math.abs(y-d.y)>35));return valid.get(k)!;};
  const startCell={x:Math.round(kayak.x/step)*step,y:Math.round(startY/step)*step};
  const queue=[startCell],previous=new Map<string,{x:number;y:number}|null>([[id(startCell.x,startCell.y),null]]);let goal:{x:number;y:number}|undefined;
  for(let i=0;i<queue.length;i++){const p=queue[i];if(Math.abs(p.y-endY)<8){goal=p;break;}
   for(const [dx,dy]of [[0,step*direction],[step,0],[-step,0],[0,-step*direction]]){const n={x:p.x+dx,y:p.y+dy},k=id(n.x,n.y);if(previous.has(k)||!clear(n.x,n.y)||!clear((p.x+n.x)/2,(p.y+n.y)/2))continue;previous.set(k,p);queue.push(n);}
  }
  if(!goal)throw Error('No valid-water route; reached y='+Math.max(...queue.map(p=>p.y)));
  const path:{x:number;y:number}[]=[];let point:{x:number;y:number}|null=goal;while(point){path.unshift(point);point=previous.get(id(point.x,point.y))??null;}
  const start=performance.now();let lastReport=start,index=0;
  while(index<path.length&&performance.now()-start<150000){
   while(index<path.length&&Math.hypot(kayak.x-path[index].x,kayak.y-path[index].y)<20)index++;
   if(index===path.length)break;
   const target=path[index],dx=target.x-kayak.x,dy=target.y-kayak.y;
   keys(68,dx>6);keys(65,dx< -6);keys(83,dy>6);keys(87,dy< -6);
   if(performance.now()-lastReport>10000){out.textContent+=`Trip ${direction>0?'down':'up'}: y=${kayak.y.toFixed(0)} waypoint ${index}/${path.length}\n`;lastReport=performance.now();}
   await wait(16);
  }
  for(const k of [65,68,83,87])keys(k,false);
  check(direction*(endY-kayak.y)<=25,`Full ${direction>0?'downstream':'upstream'} trip without modules: ${((performance.now()-start)/1000).toFixed(1)}s`);
 }}catch(e){out.textContent+='FAIL '+e;}finally{for(const k of [65,68,83,87])keys(k,false);document.querySelectorAll<HTMLButtonElement>('#controls button').forEach(b=>b.disabled=false);}
};
if(new URLSearchParams(location.search).has('trip'))full.click();
