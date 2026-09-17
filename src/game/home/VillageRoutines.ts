import Phaser from 'phaser';
import {VILLAGE,canWalk,type VillageRect} from './villageLayout';
import {sceneryPathClear} from '../world/sceneryCollision';
import type {Conditions} from '../world/conditions';
type Role=keyof typeof VILLAGE.npcs;
// Small working aprons, never a village-wide schedule. Coordinates are relative to the service anchor.
export const NPC_ROUTINES:Record<Role,{stops:readonly (readonly[number,number])[];work:string}>={
 seller:{stops:[[0,0],[-22,-14],[-34,-5],[0,-20]],work:'sort'},
 tools:{stops:[[0,0],[-12,18],[-18,0],[0,-12]],work:'inspect'},
 merchant:{stops:[[0,0],[-15,0],[-10,8],[9,4]],work:'repair'},
 keeper:{stops:[[0,0],[-14,-12],[8,-16],[-4,9]],work:'write'},
};
export class VillageRoutines{
 readonly residents:{role:Role;sprite:Phaser.GameObjects.Sprite;target:{x:number;y:number};timer:number;state:string;cycle:number}[]=[];
 constructor(private scene:Phaser.Scene,private obstacles:VillageRect[]){}
 add(role:Role,sprite:Phaser.GameObjects.Sprite){const n=VILLAGE.npcs[role];this.residents.push({role,sprite,target:{x:n.x,y:n.y},timer:4+this.residents.length*3,state:'idle',cycle:this.residents.length});}
 valid(role:Role,x:number,y:number){
  const n=VILLAGE.npcs[role];if(Math.hypot(x-n.x,y-n.y)>40)return false;
  // The workshop's working platform is outside the village walking polygon.
  const ground=role==='merchant'?x>=n.x-18&&x<=n.x+12&&y>=n.y-5&&y<=n.y+12&&!this.obstacles.some(o=>o.radius!==undefined?Math.hypot(x-o.x,y-o.y)<o.radius+8:x>o.x-8&&x<o.x+o.width+8&&y>o.y-8&&y<o.y+o.height+8):canWalk(x,y,this.obstacles);
  return ground&&sceneryPathClear(x,y,x,y,8);
 }
 update(delta:number,player:{x:number;y:number},conditions:Conditions){
  const dt=Math.min(delta,50)/1000,shelter=conditions.weather==='rain'||conditions.weather==='heavy-snow',quiet=conditions.phase==='night'||conditions.phase==='evening';
  for(const r of this.residents){
   const n=VILLAGE.npcs[r.role],s=r.sprite,near=Math.hypot(player.x-n.x,player.y-n.y)<70||Math.hypot(player.x-s.x,player.y-s.y)<45||(r.role==='merchant'&&Math.hypot(player.x-(VILLAGE.npcs.merchant.x+22),player.y-(VILLAGE.npcs.merchant.y+44))<55);
   r.timer-=dt;
   if(near){r.target={x:n.x,y:n.y};r.state='serve';r.timer=4;}
   else if(r.timer<=0){
    r.cycle++;const stops=NPC_ROUTINES[r.role].stops;
    const offset=shelter||quiet?stops[r.cycle%2]:stops[r.cycle%stops.length];
    const q={x:n.x+offset[0],y:n.y+offset[1]};
    let safe=this.valid(r.role,q.x,q.y);const distance=Math.hypot(q.x-s.x,q.y-s.y);
    for(let t=0;t<distance&&safe;t+=3)safe=this.valid(r.role,s.x+(q.x-s.x)*t/distance,s.y+(q.y-s.y)*t/distance);
    r.target=safe?q:{x:n.x,y:n.y};r.state=quiet?'warm':NPC_ROUTINES[r.role].work;
    r.timer=(quiet?12:7)+(r.cycle%4)*2;
   }
   const dx=r.target.x-s.x,dy=r.target.y-s.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*(near?25:quiet?9:14));
   if(d>.5){const x=s.x+dx/d*step,y=s.y+dy/d*step;if(this.valid(r.role,x,y)&&Math.hypot(x-player.x,y-player.y)>19)s.setPosition(x,y);else{r.target={x:s.x,y:s.y};r.timer=Math.min(r.timer,2);}}
   const animation=near?'idle':d>.5?'walk':r.state==='warm'?'warm':'work';
   s.play(`${n.asset}/N/${animation}`,true);s.anims.timeScale=quiet?.65:1;
   s.setDepth(player.y<s.y?2.2:1);
  }
 }
}
