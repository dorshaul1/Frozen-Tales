import {areaAt} from './spawnRules';
import {REGION_ATMOSPHERE} from './regionalContent';
import {ridingFlow} from './flowRiding';
import {caveStrength} from './sideRoutes';
import { driftingIce } from './driftingIce';
import Phaser from 'phaser';
import {ASSET_FRAMES,ATLAS,COLLISION_MASKS} from '../assets/catalog';
import {banks,waterSpans} from './river';
import {validWater,type DynamicWorld,type Point} from './DynamicWorld';
import {NAVIGATION,navigationFlow,shelterAt,dockFlowScale} from './navigation';
import type {Kayak} from '../entities/Kayak';
type Drifter={image:Phaser.GameObjects.Image;bodies:Phaser.GameObjects.Zone[];colliders:Phaser.Physics.Arcade.Collider[];origin:Point;phase:number;index:number;trip:number};
export class NavigationView{
 private vortices:{x:number;y:number;radius:number;age:number;strength:number}[]=[];private vortexCheck=0;private shelter=0;
 private floes:Drifter[]=[];private graphics:Phaser.GameObjects.Graphics;private seed=Math.floor(Math.random()*100000);private hitAt=-1000;private soundAt=0;private iceAt=5000;
 constructor(private scene:Phaser.Scene,private kayak:Kayak,private world:DynamicWorld,private cover:()=>number=()=>0,private weatherState:()=>{storm:number;rain:number;gust:number}=()=>({storm:0,rain:0,gust:0})){this.graphics=scene.add.graphics().setDepth(1);scene.events.once('shutdown',()=>{for(const f of this.floes){const i=driftingIce.indexOf(f.image);if(i>=0)driftingIce.splice(i,1);}});}
 hit=()=>{
  const now=this.scene.time.now;if(now-this.hitAt<NAVIGATION.collisionCooldown)return;this.hitAt=now;
  this.kayak.collisionRecovery();this.scene.events.emit('river-cue','hull-splash',.15);
  const g=this.scene.add.graphics().setDepth(3);g.lineStyle(1,0xb8d7dd,.55).strokeEllipse(this.kayak.x,this.kayak.y,32,16);
  this.scene.tweens.add({targets:g,alpha:0,duration:450,onComplete:()=>g.destroy()});
 };
 private clear(p:Point,player=true){const[l,r]=banks(p.y);return dockFlowScale(p.x,p.y)===1&&validWater(p,32,false,true)&&Math.abs(p.x-(l+r)/2)>NAVIGATION.centerClearance&&this.world.spots.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>NAVIGATION.fishClearance)&&(!player||Math.hypot(p.x-this.kayak.x,p.y-this.kayak.y)>NAVIGATION.playerClearance);}
 update(time:number,delta:number){
  const view=this.scene.cameras.main.worldView;
  const conditions=this.weatherState(),rough=Math.max(conditions.storm,conditions.gust,conditions.rain*.65);
  const dt=Math.min(delta,50)/1000,whirl=NAVIGATION.whirlpool;
  if(time>this.vortexCheck){
   this.vortexCheck=time+whirl.interval;
   if(rough>.4&&this.vortices.length<whirl.maxActive&&this.world.random()<whirl.chance){
    const y=this.kayak.y+(this.world.random()>.5?1:-1)*260,[l,r]=banks(y),radius=45+this.world.random()*18;
    const x=(l+r)/2+(this.world.random()>.5?1:-1)*(radius+38);
    if(dockFlowScale(x,y)===1&&y>whirl.minY&&caveStrength(x,y)<.05&&!view.contains(x,y)&&validWater({x,y},radius+25,false,true))this.vortices.push({x,y,radius,age:0,strength:0});
   }
  }
  for(const v of this.vortices){v.age+=dt;v.strength=Math.min(1,v.age/whirl.fadeIn,Math.max(0,(whirl.lifetime-v.age)/whirl.fadeOut))*rough;}
  this.vortices=this.vortices.filter(v=>v.age<whirl.lifetime);

  NAVIGATION.drift.forEach((rule,index)=>{
   let f=this.floes.find(f=>f.index===index);
   if(f&&f.trip!==this.world.trip&&!view.contains(f.image.x,f.image.y)){driftingIce.splice(driftingIce.indexOf(f.image),1);f.image.destroy();f.colliders.forEach(c=>c.destroy());f.bodies.forEach(b=>b.destroy());this.floes.splice(this.floes.indexOf(f),1);f=undefined;}
   if(!f){
    const phase=((this.seed+this.world.trip*131+index*71)%997)/997*Math.PI*2;let p:Point|undefined;
    for(let attempt=0;attempt<24;attempt++){
      const y=rule.y+Math.round(Math.sin(phase+attempt*.6)*90),[l,r]=banks(y),q={x:rule.side<0?l+62+(attempt%3)*8:r-62-(attempt%3)*8,y};
      if(!view.contains(q.x,q.y)&&this.clear(q)){p=q;break;}
    }
    if(!p)return;
    const key=ASSET_FRAMES['ice-fragment'][(index+this.world.trip)%3];
    const image=this.scene.add.image(p.x,p.y,ATLAS,key).setScale(1).setDepth(1.1).setData('driftingFragment',true);
    driftingIce.push(image);
    const colliders:Phaser.Physics.Arcade.Collider[]=[];
    const bodies=COLLISION_MASKS[key].map(([x,y,w,h])=>{const zone=this.scene.add.zone(p.x-image.width/2+x+w/2,p.y-image.height/2+y+h/2,w,h);this.scene.physics.add.existing(zone,true);colliders.push(this.scene.physics.add.collider(this.kayak,zone,this.hit));return zone;});
    f={image,bodies,colliders,origin:{x:p.x-Math.sin(phase)*6,y:p.y-Math.sin(phase*.65)*23},phase,index,trip:this.world.trip};this.floes.push(f);
   }
   const phase=f.phase+Math.min(delta,50)/1000*rule.speed/24*(1+rough*NAVIGATION.weather.iceSpeed);
   const p={x:f.origin.x+Math.sin(phase)*6,y:f.origin.y+Math.sin(phase*.65)*23};
   if(this.clear(p,false)&&Math.hypot(p.x-this.kayak.x,p.y-this.kayak.y)>42){
    const dx=p.x-f.image.x,dy=p.y-f.image.y;f.image.setPosition(p.x,p.y);f.bodies.forEach(b=>{b.setPosition(b.x+dx,b.y+dy);(b.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();});f.phase=phase;
    const distance=Math.hypot(p.x-this.kayak.x,p.y-this.kayak.y);if(time>this.iceAt&&distance<220){this.iceAt=time+16000;this.scene.events.emit('river-cue','ice-drift',.08*(1-distance/220));}
   }
  });
  this.graphics.clear();
  this.drawRideLanes(time,rough);
  for(const section of NAVIGATION.sections){if(section.y>view.bottom||section.y+section.length<view.top)continue;
   for(let i=0;i<6;i++){const y=section.y+(i*31+time/1000*13)%section.length,[l,r]=banks(y),x=l+(r-l)*(.2+(i%3)*.3),flow=navigationFlow(x,y,this.world.conditions.weather);if(!validWater({x,y},8,false))continue;
    this.graphics.lineStyle(1,0x90bac5,.2*(1-shelterAt(x,y))*dockFlowScale(x,y)).lineBetween(Math.round(x),Math.round(y),Math.round(x+flow.x*.2),Math.round(y+3+flow.y*.12));}
  }
  const flow=navigationFlow(this.kayak.x,this.kayak.y,this.world.conditions.weather);const protection=this.cover(),weather=this.world.conditions.weather;
  const penalty=conditions.storm*.09+conditions.rain*.04+conditions.gust*.07;
  const exposed=validWater({x:this.kayak.x,y:this.kayak.y},65,false,true)&&this.kayak.y>650&&caveStrength(this.kayak.x,this.kayak.y)<.05;
  const region=areaAt(this.kayak.y,this.kayak.x),scale=(region==='starting'?.3:region==='bend'?.65:1)*REGION_ATMOSPHERE[region].wind;
  if(exposed){flow.x+=conditions.gust*NAVIGATION.weather.wind*scale*(.8+.2*Math.sin(time/7000));flow.y+=rough*NAVIGATION.weather.downstream*scale;}
  for(const v of this.vortices){
   for(let ring=0;ring<3;ring++)for(let i=0;i<15;i++){
    const angle=i*Math.PI*2/15+time/1000*(.55+ring*.15),r=v.radius*(.35+ring*.28);
    const x=Math.round(v.x+Math.cos(angle)*r),y=Math.round(v.y+Math.sin(angle)*r);
    this.graphics.lineStyle(1,0x90bac5,v.strength*.65).lineBetween(x,y,Math.round(x-Math.sin(angle)*5),Math.round(y+Math.cos(angle)*5));
   }
   const dx=v.x-this.kayak.x,dy=v.y-this.kayak.y,d=Math.hypot(dx,dy),power=Math.max(0,1-d/v.radius)*v.strength;
   if(d>1){flow.x+=(dx/d*whirl.pull-dy/d*whirl.swirl)*power;flow.y+=(dy/d*whirl.pull+dx/d*whirl.swirl)*power;}
  }
  const calm=navigationFlow(this.kayak.x,this.kayak.y,'clear');
  flow.x+=(calm.x-flow.x)*protection;flow.y+=(calm.y-flow.y)*protection;
  this.shelter+=(shelterAt(this.kayak.x,this.kayak.y)-this.shelter)*(1-Math.exp(-Math.min(delta,50)/600));
  flow.x*=1-this.shelter;flow.y*=1-this.shelter;
  const ride=ridingFlow(this.kayak.x,this.kayak.y,rough);
  flow.x+=ride.x*ride.strength*12*(1-this.shelter);flow.y+=ride.y*ride.strength*12*(1-this.shelter);
  const limit=Math.min(1,80/(Math.hypot(flow.x,flow.y)||1));flow.x*=limit;flow.y*=limit;
  const dockScale=dockFlowScale(this.kayak.x,this.kayak.y);flow.x*=dockScale;flow.y*=dockScale;
  flow.speed*=1-penalty*(1-protection);this.kayak.waterFlow=flow;
  this.kayak.rideFlow={...ride,strength:ride.strength*dockScale*(1-this.shelter),boost:ride.boost*dockScale*(1-this.shelter)};
  if(time>this.soundAt&&(Math.hypot(flow.x,flow.y)>23||this.kayak.flowMomentum>15)){this.soundAt=time+9000;this.scene.events.emit('river-cue','current',.08+Math.min(.08,this.kayak.flowMomentum/800));}
 }
 private drawRideLanes(time:number,rough:number){
  const view=this.scene.cameras.main.worldView;
  // Fixed-count native foam strokes, sampled only in the visible water.
  for(let row=Math.floor((view.top-30)/34);row<Math.ceil((view.bottom+30)/34);row++){
   const y=row*34;
   for(const [l,r]of waterSpans(y))for(const offset of [-.63,-.12,.1,.63]){
    const x=(l+r)/2+(r-l)/2*(offset+Math.sin(y/180)*rough*.06);
    const flow=ridingFlow(x,y,rough),calm=dockFlowScale(x,y)*(1-shelterAt(x,y));
    if(flow.strength<.12||calm<.1||!validWater({x,y},12,false))continue;
    const phase=(time/1000*(14+flow.boost*.35)+row*7)%30;
    const px=x+flow.x*(phase-15),py=y+flow.y*(phase-15);
    if(!validWater({x:px,y:py},8,false))continue;
    const alpha=Math.sin(phase/30*Math.PI)*.28*flow.strength*calm;
    this.graphics.lineStyle(1,0x9dc5cc,alpha).lineBetween(Math.round(px),Math.round(py),Math.round(px-flow.x*7),Math.round(py-flow.y*7));
    this.graphics.fillStyle(0xc0dce0,alpha*.7).fillRect(Math.round(px+3),Math.round(py),1,1);
   }
  }
 }

}
