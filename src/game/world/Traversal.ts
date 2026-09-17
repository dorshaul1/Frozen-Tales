import {riverDay} from './riverConditions';
import {thinIce} from './driftingIce';
import Phaser from 'phaser';import {ICE_PASSAGES,passageBounds} from './traversalData';
import {ASSET_FRAMES,ASSETS,ATLAS} from '../assets/catalog';import {pixelText} from '../ui/PixelText';import type {Kayak} from '../entities/Kayak';import type {SaveStore} from '../player/SaveStore';
export class Traversal{
 private sheets:{id:string;image:Phaser.GameObjects.Image;zone:Phaser.GameObjects.Zone;momentum:number;collider:Phaser.Physics.Arcade.Collider}[]=[];
 private hint:ReturnType<typeof pixelText>;private opened:Set<string>;
 constructor(private scene:Phaser.Scene,private kayak:Kayak,private store:SaveStore,private hasIcebreaker:()=>boolean=()=>false){
  this.opened=new Set(store.load().openedPassages??[]);this.hint=pixelText(scene,0,0,'',{fontSize:'8px',color:'#f0f2da',backgroundColor:'#233e49',padding:{x:4,y:3}}).setOrigin(.5).setDepth(9);
  scene.events.once('shutdown',()=>{for(const s of this.sheets){const i=thinIce.indexOf(s.zone);if(i>=0)thinIce.splice(i,1);}});
  this.refresh();
 }
 refresh(){
  const scene=this.scene,kayak=this.kayak;
  for(const s of this.sheets){s.collider.destroy();const i=thinIce.indexOf(s.zone);if(i>=0)thinIce.splice(i,1);s.zone.destroy();s.image.destroy();}this.sheets=[];
  for(const p of ICE_PASSAGES){if(this.opened.has(p.id)&&!(riverDay?.routes[p.route]==='ice'&&!riverDay.broken.includes(p.route)))continue;const b=passageBounds(p);
   if(scene.textures.exists(`sheet-${p.id}`))scene.textures.remove(`sheet-${p.id}`);
   const texture=scene.textures.createCanvas(`sheet-${p.id}`,b.width,24)!;const source=scene.textures.getFrame(ATLAS,ASSET_FRAMES['thin-channel-ice'][p.momentum>100?1:0]);texture.context.imageSmoothingEnabled=false;
   // Clip/repeat native pixels to the authored channel width, never stretch sprite art.
   for(let x=0;x<b.width;x+=86)texture.context.drawImage(source.source.image as CanvasImageSource,source.cutX+5,source.cutY,86,24,x,0,86,24);texture.refresh();
   const image=scene.add.image(b.x,b.y-5,texture.key).setOrigin(0).setDepth(1.2),zone=scene.add.zone(b.x+b.width/2,b.y+7,b.width,14);scene.physics.add.existing(zone,true);thinIce.push(zone);
   const collider=scene.physics.add.collider(kayak,zone,undefined,()=>{
    const body=kayak.body as Phaser.Physics.Arcade.Body;
    if(this.hasIcebreaker()&&Math.abs(body.velocity.y)>=p.momentum){this.breakIce(p.id);return false;}
    image.setTint(0xc4e2eb);scene.time.delayedCall(180,()=>{if(image.active)image.clearTint();});return true;
   });this.sheets.push({id:p.id,image,zone,momentum:p.momentum,collider});
  }
 }
 get openedPassages(){return [...this.opened];}
 setPassageOpen(route:string,open:boolean){
  const passage=ICE_PASSAGES.find(p=>p.route===route);if(!passage)throw new Error('Main river areas are always accessible. Choose a thin-ice route.');
  if(open)this.opened.add(passage.id);else this.opened.delete(passage.id);
  if(riverDay){riverDay.broken=riverDay.broken.filter(id=>id!==route);if(open)riverDay.broken.push(route);}
  const saved=this.store.write({...this.store.load(),openedPassages:[...this.opened],riverDay:riverDay??undefined});
  this.refresh();if(!saved)throw new Error('Gate changed, but saving failed.');
 }
 private breakIce(id:string){
  const sheet=this.sheets.find(s=>s.id===id);if(!sheet)return;
  const route=ICE_PASSAGES.find(p=>p.id===id)!.route;
  if(riverDay?.routes[route]==='ice'){riverDay.broken.push(route);this.store.write({...this.store.load(),riverDay});}
  this.opened.add(id);this.store.write({...this.store.load(),openedPassages:[...this.opened]});sheet.collider.destroy();thinIce.splice(thinIce.indexOf(sheet.zone),1);sheet.zone.destroy();this.sheets=this.sheets.filter(s=>s!==sheet);
  this.scene.events.emit('river-cue','ice-break',.4);this.kayak.collisionRecovery();
  const x=sheet.image.x,y=sheet.image.y,w=sheet.image.width;
  const cracks=this.scene.add.graphics().setDepth(2);cracks.lineStyle(1,0x254e65,.9);for(let i=0;i<5;i++)cracks.lineBetween(x+i*w/5,y+4,x+(i+.6)*w/5,y+19);
  this.scene.tweens.add({targets:[sheet.image,cracks],alpha:0,duration:320,onComplete:()=>{sheet.image.destroy();cracks.destroy();}});
  for(let i=0;i<6;i++){const chip=this.scene.add.image(x+(i+.5)*w/6,y+10,ATLAS,ASSETS['ice-fragment']).setScale(1).setDepth(2);this.scene.tweens.add({targets:chip,x:chip.x+(i-2.5)*4,y:chip.y+(i%2?10:-10),alpha:0,duration:700+i*40,onComplete:()=>chip.destroy()});}
 }
 update(walking:boolean){const s=walking?undefined:this.sheets.find(s=>Math.hypot(s.zone.x-this.kayak.x,s.zone.y-this.kayak.y)<100);this.hint.setVisible(!!s);if(s)this.hint.setText(!this.hasIcebreaker()?(this.opened.has(s.id)&&riverDay?.routes[ICE_PASSAGES.find(p=>p.id===s.id)!.route]==='ice'?'FRESH ICE TODAY · ICEBREAKER OR RETURN TOMORROW':'THIN ICE · FIT AN ICEBREAKER BOW'):s.momentum>100?'PACKED ICE · A STRONGER RUN-UP':'THIN ICE · PADDLE THROUGH').setPosition(s.zone.x,s.zone.y-25);}
}
