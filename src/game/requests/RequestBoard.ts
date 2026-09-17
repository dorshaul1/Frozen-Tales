import {positionPanel} from '../ui/panelPosition';
import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { DailyRequests,REQUESTS } from './DailyRequests';
import { VILLAGE } from '../home/villageLayout';
import { Home } from '../home/Home';
import { ATLAS,ASSETS } from '../assets/textures';
export const BOARD=VILLAGE.requestBoard;
export class RequestBoard {
 isOpen=false;
 private panel:Phaser.GameObjects.Container;
 private hint:Phaser.GameObjects.Text;
 private keys:Phaser.Input.Keyboard.Key[];
 private selected=0;
 private rendered='';
 private message='';
 constructor(private scene:Phaser.Scene,private home:Home,readonly daily:DailyRequests,private claim:(index:number)=>boolean){
  scene.add.image(BOARD.x,BOARD.y,ATLAS,ASSETS['request-board']).setDepth(1);
  this.hint=pixelText(scene,BOARD.x,BOARD.y-26,'E — Village requests',{fontFamily:'monospace',fontSize:'10px',color:'#f3d49a',backgroundColor:'#173642',padding:{x:4,y:3}}).setOrigin(.5).setDepth(4).setVisible(false);
  this.panel=scene.add.container().setDepth(12).setVisible(false);
  this.keys=['ESC','UP','DOWN'].map(k=>scene.input.keyboard!.addKey(k));
  scene.game.events.on(Phaser.Core.Events.BLUR,this.close,this);
  scene.events.once('shutdown',()=>scene.game.events.off(Phaser.Core.Events.BLUR,this.close,this));
 }
 get near(){return this.home.walking&&Math.hypot(this.home.player.x-BOARD.x,this.home.player.y-BOARD.y)<BOARD.radius;}
 close(){if(!this.isOpen)return;this.isOpen=false;this.panel.setVisible(false);this.scene.input.keyboard?.resetKeys();this.home.setMovementEnabled(true);this.scene.events.emit('river-cue','ui-close',.25);}
 update(pressed:boolean,available:boolean){
  this.hint.setVisible(available&&!this.isOpen&&this.near);
  if(!this.isOpen){if(!available||!pressed||!this.near)return false;this.isOpen=true;this.selected=0;this.message='';this.home.setMovementEnabled(false);this.hint.setVisible(false);this.scene.events.emit('river-cue','ui-open',.3);}
  else {
   if(Phaser.Input.Keyboard.JustDown(this.keys[0])){this.close();return true;}
   if(Phaser.Input.Keyboard.JustDown(this.keys[1]))this.selected=(this.selected+this.daily.state.active.length-1)%this.daily.state.active.length;
   if(Phaser.Input.Keyboard.JustDown(this.keys[2]))this.selected=(this.selected+1)%this.daily.state.active.length;
   if(pressed)this.take();
  }
  this.home.setMovementEnabled(false);this.draw();return true;
 }
 private take(){const r=this.daily.state.active[this.selected],d=REQUESTS.find(d=>d.id===r?.id);if(!r||!d)return;
  if(r.claimed)this.message='Already thanked you today';else if(r.progress<d.target)this.message='Keep fishing — progress counts automatically';else this.message=this.claim(this.selected)?`Thank you! +$${d.reward}`:'Could not save reward — try again';
 }
 private text(x:number,y:number,s:string,size=10,color='#dde7e5'){return pixelText(this.scene,x,y,s,{fontFamily:'monospace',fontSize:`${size}px`,color});}
 private draw(){
  positionPanel(this.scene,this.panel,360,280);this.panel.setVisible(true);
  const signature=JSON.stringify([this.daily.state,this.selected,this.message]);if(signature===this.rendered)return;this.rendered=signature;
  this.panel.removeAll(true);
  this.panel.add(this.scene.add.image(0,0,ATLAS,ASSETS['hub-panel']));
  this.panel.add(this.scene.add.image(-146,-111,ATLAS,ASSETS['request-board']));
  this.panel.add(this.text(-117,-125,'VILLAGE REQUESTS',12,'#f3d49a'));
  this.panel.add(this.text(-117,-105,`Day ${this.daily.state.day+1} · optional favors`,9,'#9dc5cc'));
  this.daily.state.active.forEach((r,i)=>{const d=REQUESTS.find(d=>d.id===r.id)!,y=-72+i*54;
   const g=this.scene.add.graphics().fillStyle(i===this.selected?0x344c59:0x223c50).fillRect(-162,y,324,48);this.panel.add(g);
   this.panel.add(this.scene.add.image(-143,y+22,ATLAS,ASSETS[d.fish?`fish-${d.fish}` as const:'coin-icon']).setScale(d.fish?.65:1));
   this.panel.add(this.text(-121,y+7,d.label,10));
   this.panel.add(this.text(-121,y+25,`${d.kind==='sale'?'$':''}${r.progress} / ${d.target} · $${d.reward}`,9,'#f3d49a'));
   this.panel.add(this.text(69,y+25,r.claimed?'CLAIMED':r.progress>=d.target?'E · CLAIM':'IN PROGRESS',8,r.claimed?'#a7c7a7':'#9dc5cc'));
   const zone=this.scene.add.zone(0,y+24,324,48).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.selected=i;this.take();this.draw();});this.panel.add(zone);
  });
  this.panel.add(this.text(-162,101,this.message||'Unclaimed favors expire with the next morning.',8,'#f3d49a'));
  this.panel.add(this.text(-162,121,'↑ ↓ Choose · E / Space Claim · Esc Close',9,'#9dc5cc'));
 }
}
