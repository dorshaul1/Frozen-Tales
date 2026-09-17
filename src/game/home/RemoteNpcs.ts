import type {DialoguePage} from './remoteNpcData';
import {VILLAGE,canWalk} from './villageLayout';
import Phaser from 'phaser';import {REMOTE_NPCS} from './remoteNpcData';import {landings,landingWalk} from './Landings';import {sceneryBlocked} from '../world/sceneryCollision';import {ATLAS,ASSETS} from '../assets/catalog';import {pixelText} from '../ui/PixelText';import {Dialogue} from '../ui/Dialogue';import {VillageCorgi} from './VillageCorgi';import type {Home} from './Home';
export class RemoteNpcs {
 dialoguePages?:(npc:string)=>readonly DialoguePage[]|undefined;
 readonly dialogue:Dialogue;readonly dog:VillageCorgi;
 readonly people=REMOTE_NPCS.map(data=>({data,site:landings().find(s=>s.id===data.location)!,sprite:null as unknown as Phaser.GameObjects.Sprite,home:{x:0,y:0},timer:0,target:{x:0,y:0}}));
 private hint:Phaser.GameObjects.Text;
 constructor(private scene:Phaser.Scene,private home:Home,corgiHome:'ranger'|'village'='ranger'){
  this.dialogue=new Dialogue(scene,locked=>home.setMovementEnabled(!locked));this.hint=pixelText(scene,0,0,'E · Talk',{fontSize:'9px',color:'#f3d49a',backgroundColor:'#173642'}).setDepth(4).setOrigin(.5,1).setVisible(false);
  for(const p of this.people){const c=p.site.clearings[0];let point={x:c.x,y:c.y};for(let i=0;i<30;i++){const q={x:c.x+(i%5-2)*5,y:c.y+(Math.floor(i/5)-2)*5};if(landingWalk(p.site,q.x,q.y)&&!sceneryBlocked(q.x,q.y,9)){point=q;break;}}p.home=point;p.target={...point};p.sprite=scene.add.sprite(point.x,point.y,ATLAS,ASSETS[p.data.asset]).setDepth(2).play(`${p.data.asset}/S/idle`);}
  const ranger=this.people[1];this.dog=new VillageCorgi(scene,[],()=>home.player,corgiHome==='ranger'?{home:{x:ranger.home.x+14,y:ranger.home.y+10},valid:(x,y)=>Math.hypot(x-ranger.home.x,y-ranger.home.y)<95&&landingWalk(ranger.site,x,y)&&!sceneryBlocked(x,y,7),neighbor:()=>ranger.sprite}:undefined);if(corgiHome==='village')this.moveDog('village');
 }
 moveDog(home:'ranger'|'village'){const ranger=this.people[1];this.dog.relocate(home==='village'?{home:{...VILLAGE.corgiHome},valid:(x,y)=>canWalk(x,y)&&!sceneryBlocked(x,y,9)}:{home:{x:ranger.home.x+14,y:ranger.home.y+10},valid:(x,y)=>Math.hypot(x-ranger.home.x,y-ranger.home.y)<95&&landingWalk(ranger.site,x,y)&&!sceneryBlocked(x,y,7),neighbor:()=>ranger.sprite});}
 blocks(x:number,y:number){return this.people.some(p=>Math.hypot(x-p.sprite.x,y-p.sprite.y)<17)||Math.hypot(x-this.dog.sprite.x,y-this.dog.sprite.y-4)<17;}
 update(delta:number,pressed:boolean,available:boolean){
  const player=this.home.player;let near:typeof this.people[number]|undefined;
  for(const p of this.people){const s=p.sprite,d=Math.hypot(player.x-s.x,player.y-s.y);if(this.home.walking&&d<42&&(!near||d<Math.hypot(player.x-near.sprite.x,player.y-near.sprite.y)))near=p;
   p.timer-=Math.min(delta,50)/1000;if(d>55&&!this.dialogue.isOpen){if(p.timer<=0){p.timer=4+Math.random()*5;const q={x:p.home.x+(Math.random()-.5)*18,y:p.home.y+(Math.random()-.5)*18};p.target=landingWalk(p.site,q.x,q.y)&&!sceneryBlocked(q.x,q.y,9)?q:{...p.home};s.setData('ambient',p.data.ambient[Math.floor(Math.random()*p.data.ambient.length)]);}
    const dx=p.target.x-s.x,dy=p.target.y-s.y,len=Math.hypot(dx,dy),step=Math.min(len,delta*.009);const x=s.x+dx/(len||1)*step,y=s.y+dy/(len||1)*step;if(landingWalk(p.site,x,y)&&!sceneryBlocked(x,y,9))s.setPosition(x,y);const dir=len>1?(Math.abs(dx)>Math.abs(dy)?dx>0?'E':'W':dy>0?'S':'N'):(s.getData('ambient')==='inspect'?'E':s.getData('ambient')==='look'?'W':'S');s.play(`${p.data.asset}/${dir}/${len>1?'walk':'idle'}`,true);
   }else s.play(`${p.data.asset}/S/idle`,true);s.setDepth(player.y<s.y?2.05:1.95);
  }
  this.hint.setVisible(!!near&&available&&!this.dialogue.isOpen);if(near)this.hint.setPosition(Math.round(near.sprite.x),Math.round(near.sprite.y)-20);
  if(near&&available&&pressed){this.dialogue.open(near.data.name,near.data.asset,this.dialoguePages?.(near.data.id)??near.data.pages);this.hint.setVisible(false);return true;}this.dialogue.update();return this.dialogue.isOpen;
 }
}
