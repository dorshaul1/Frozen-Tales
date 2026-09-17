import {ICE_PASSAGES} from './traversalData';
import Phaser from 'phaser';
import {ATLAS,ASSET_FRAMES} from '../assets/catalog';
import { SIDE_ROUTES,routeSpan,caveStrength,locationAt } from './sideRoutes';
import type { EnvironmentView } from './EnvironmentView';
import type { Equipment } from '../upgrades/Equipment';
import type { Point } from './DynamicWorld';

/** Local cave shade and small physical water details, independent of trip generation. */
export class ExplorationView {
 private shade:Phaser.GameObjects.Container;
 private masks:Phaser.GameObjects.Container[]=[];
 private details:Phaser.GameObjects.Graphics;
 private nextDraw=0;
 private nextSound=0;
 constructor(private scene:Phaser.Scene,private environment:EnvironmentView,private equipment:Equipment){
  this.shade=scene.add.container(0,0).setDepth(3.4);
  // Bake both native-pixel light masks once. The mask and its surrounding shade
  // share one world-space transform with the player; camera movement costs nothing.
  for(const radius of [44,155]){
   const half=Math.ceil(radius/4)*4,size=half*2,key=`cave-light-${radius}`;
   if(!scene.textures.exists(key)){
    const texture=scene.textures.createCanvas(key,size,size)!;const ctx=texture.context;
    for(let y=0;y<size;y+=4)for(let x=0;x<size;x+=4){
     const distance=Math.hypot(x+2-half,y+2-half),light=Math.sqrt(Math.max(0,1-distance/radius));
     ctx.fillStyle=`rgba(7,21,34,${1-light*.98})`;ctx.fillRect(x,y,4,4);
    }texture.refresh();
   }
   const outside=scene.add.graphics().fillStyle(0x071522,1);
   outside.fillRect(-10000,-10000,20000,10000-half);
   outside.fillRect(-10000,half,20000,10000-half);
   outside.fillRect(-10000,-half,10000-half,size);
   outside.fillRect(half,-half,10000-half,size);
   const mask=scene.add.container(0,0,[outside,scene.add.image(0,0,key)]);
   this.shade.add(mask);this.masks.push(mask);
  }
  this.details=scene.add.graphics().setDepth(3.5);
  for(const route of SIDE_ROUTES){
   if(!route.interior&&!route.archY)continue;
   const gate=ICE_PASSAGES.find(g=>g.route===route.id);
   const y=route.archY??Math.max(route.interior![0]-25,gate?gate.y+48:0),span=routeSpan(route,y);if(!span)continue;
   scene.add.image(Math.round((span[0]+span[1])/2),y,ATLAS,ASSET_FRAMES['cave-mouth'][route.kind==='blue-cave'?1:route.kind==='frozen-tunnel'?2:0]).setDepth(2.3);
  }

 }
 update(time:number,p:Point){
  const strength=caveStrength(p.x,p.y);
  this.environment.cave=strength;
  const lantern=!!this.equipment.levels.lantern&&!!this.equipment.gear.lanternLit;
  const room=locationAt(p.x,p.y),darkness=room?.kind==='blue-cave'?.86:room?.kind==='frozen-tunnel'?.8:.94;
  this.shade.setPosition(p.x,p.y).setAlpha(strength*darkness).setVisible(strength>0);
  this.masks[0].setVisible(!lantern);this.masks[1].setVisible(lantern);
  if(time<this.nextDraw)return;this.nextDraw=time+80;
  this.details.clear();
  const view=this.scene.cameras.main.worldView;

  for(const route of SIDE_ROUTES){
   if(route.jet){
    const [start,length]=route.jet;
    if(start>view.bottom||start+length<view.top)continue;
    for(let i=0;i<12;i++){
     const y=Math.round(start+(i*13+time/75)%length),span=routeSpan(route,y)!;
     const x=Math.round(span[0]+(span[1]-span[0])*(.22+(i%3)*.28));
     this.details.lineStyle(1,0x8cbccc,.38).lineBetween(x,y,x,y+8);
    }
   }
   if(!route.interior)continue;
   const[a,b]=route.interior;
   if(a>view.bottom||b<view.top)continue;
   for(let i=0;i<4;i++){
    const y=a+55+i*(b-a-90)/4,span=routeSpan(route,y)!;
    const x=i%2?span[1]-9:span[0]+9;
    this.details.fillStyle(0x74bed0,.25+.1*Math.sin(time/1700+i)).fillRect(Math.round(x),Math.round(y),2,5);
    const phase=(time/2200+i*.37)%1;
    if(phase<.22)this.details.fillStyle(0xa5ced7,.55).fillRect(Math.round(x+(i%2?-12:12)),Math.round(y+phase*30),1,2);
    else if(phase<.55)this.details.lineStyle(1,0x7dabbc,(.55-phase)*.8).strokeEllipse(Math.round(x+(i%2?-12:12)),Math.round(y+8),Math.round(phase*18),Math.round(phase*9));
   }
  }
  if(strength>.5&&time>this.nextSound){this.nextSound=time+9000;this.scene.events.emit('river-cue',Math.floor(time/9000)%3?'cave-drip':'ice',.09);}
 }
}
