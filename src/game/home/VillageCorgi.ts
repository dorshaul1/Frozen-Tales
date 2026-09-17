import {WILDLIFE_SIZE} from '../world/wildlifeSize';
import Phaser from 'phaser';
import {ATLAS,ASSETS} from '../assets/textures';
import {canWalk,VILLAGE,type VillageRect} from './villageLayout';
export class VillageCorgi {
 readonly sprite:Phaser.GameObjects.Sprite;
 private body:VillageRect;
 private timer=0;private state='sit';private facing='S';private target={...VILLAGE.corgiHome};private soundAt=0;private stepAt=0;
 constructor(private scene:Phaser.Scene,private obstacles:VillageRect[],private player:()=>{x:number;y:number},private habitat?:{home:{x:number;y:number};valid:(x:number,y:number)=>boolean;neighbor?:()=>{x:number;y:number}}){
  const home=habitat?.home??VILLAGE.corgiHome;this.target={...home};
  const playerObstacles=obstacles;this.obstacles=[...obstacles];
  this.body={x:home.x,y:home.y+4,width:0,height:0,radius:WILDLIFE_SIZE['village-corgi'].radius};
  playerObstacles.push(this.body);
  this.sprite=scene.add.sprite(home.x,home.y,ATLAS,ASSETS['village-corgi']).setScale(WILDLIFE_SIZE['village-corgi'].scale).setDepth(2);
  scene.events.on('update',this.update,this);scene.events.once('shutdown',()=>{scene.events.off('update',this.update,this);const i=playerObstacles.indexOf(this.body);if(i>=0)playerObstacles.splice(i,1);});
 }
 relocate(habitat:NonNullable<VillageCorgi['habitat']>){this.habitat=habitat;this.target={...habitat.home};this.sprite.setPosition(this.target.x,this.target.y);this.body.x=this.target.x;this.body.y=this.target.y+4;this.state='sit';this.timer=4;}
 valid(x:number,y:number){return this.habitat?this.habitat.valid(x,y):canWalk(x,y,this.obstacles)&&Object.values(VILLAGE.npcs).every(n=>Math.hypot(x-n.x,y-n.y)>36);}
 private route(x:number,y:number){const s=this.sprite,d=Math.hypot(x-s.x,y-s.y);for(let t=0;t<=d;t+=4)if(!this.valid(s.x+(x-s.x)*t/(d||1),s.y+(y-s.y)*t/(d||1)))return false;return this.valid(x,y);}
 private update(time:number,delta:number){
  const s=this.sprite,dt=Math.min(delta,50)/1000,p=this.player();this.timer-=dt;
  if(this.timer<=0){
   this.state=Phaser.Utils.Array.GetRandom(['sit','lie','wag','sniff','idle','walk','walk','run']);this.timer=3+Math.random()*6;
   if(this.state==='walk'||this.state==='run'){
    let found=false;
    for(let i=0;i<20;i++){
     const follow=i===0&&Math.hypot(p.x-s.x,p.y-s.y)<95&&Math.random()<.3;
     const neighbor=this.habitat?.neighbor?.()??Object.values(VILLAGE.npcs).filter(n=>n.view!=='gear'&&Math.hypot(n.x-s.x,n.y-s.y)<140)[0];
     const greet=i===0&&!follow&&neighbor&&Math.random()<.2;
     const x=greet?neighbor.x+42:follow?p.x-24:s.x+(Math.random()-.5)*110,y=greet?neighbor.y+8:follow?p.y+20:s.y+(Math.random()-.5)*110;
     if(this.route(x,y)){this.target={x,y};found=true;break;}
    }
    if(!found){this.state='sniff';this.timer=2;}
   }else if(Math.hypot(p.x-s.x,p.y-s.y)<80)this.face(p.x-s.x,p.y-s.y);
   if(time>this.soundAt&&Math.hypot(p.x-s.x,p.y-s.y)<120){this.soundAt=time+25000+Math.random()*30000;this.scene.events.emit('river-cue','corgi-bark',.12);}
  }
  if(this.state==='walk'||this.state==='run'){
   const dx=this.target.x-s.x,dy=this.target.y-s.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*(this.state==='run'?54:23));
   if(d<2){this.state='sniff';this.timer=2+Math.random()*3;}
   else{const x=s.x+dx/d*step,y=s.y+dy/d*step;
    if(this.valid(x,y)&&Math.hypot(p.x-x,p.y-(y+4))>=VILLAGE.playerRadius+8){s.setPosition(x,y);this.face(dx,dy);if(time>this.stepAt&&Math.hypot(p.x-x,p.y-y)<90){this.stepAt=time+900;this.scene.events.emit('river-cue','step',.035);}}else{this.state='idle';this.timer=.5;}
   }
  }
  this.body.x=s.x;this.body.y=s.y+4;
  s.setDepth(p.y<s.y+4?2.05:1.95).play(`village-corgi/${this.facing}/${this.state}`,true);
 }
 private face(dx:number,dy:number){this.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'E':'W':dy>0?'S':'N';}
}
