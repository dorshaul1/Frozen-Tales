import {VILLAGE_FIXTURES,fixtureSource} from './villageFixtures';
import Phaser from 'phaser';
import { ASSETS, ATLAS, type AssetId } from '../assets/catalog';
import { VILLAGE } from './villageLayout';

export const VILLAGE_LIGHTING = { lampRadius: 23, fireRadius: 27, fadeRate: 3, lampBaseRadius: 4, fireRadiusCollision: 11 };
export class VillageLighting {
  private pools: Phaser.GameObjects.Graphics;
  private details: Phaser.GameObjects.Graphics;
  private emitters: { image: Phaser.GameObjects.Image; x: number; y: number; radius: number; baseY?: number }[] = [];
  private fires = VILLAGE.props.filter(p=>p[0]==='village-firepit');
  private clock=0;
  strength=0;
  homeWarmth=0;
  constructor(private scene: Phaser.Scene) {
    this.pools=scene.add.graphics().setDepth(2.5);
    this.details=scene.add.graphics().setDepth(3);
    // Register once; the existing per-frame light pools handle dusk/dawn and camera motion.
    for(const b of VILLAGE.buildings){
      const id=`${b.asset}-lights` as AssetId;
      const image=scene.add.image(b.x,b.y,ATLAS,ASSETS[id]).setOrigin(0).setDepth(1.1).setAlpha(0).setData('emissive',true);
      // Keep windows in the original roof pixels; only the light mask is self-lit.
      this.emitters.push({image,x:b.x+b.lights[0][0],y:b.y+b.lights[0][1],radius:15,baseY:b.y+Math.max(...b.bodies.map(r=>r[1]+r[3]))});
    }
    for(const f of VILLAGE_FIXTURES){
      const image=scene.add.image(f.x,f.y,ATLAS,ASSETS[`${f.id}-light`]).setOrigin(0).setDepth(1.1).setAlpha(0).setData('emissive',true);
      this.emitters.push({image,...fixtureSource(f),radius:f.radius,baseY:f.baseY});
    }
    for(const[id,x,y]of VILLAGE.props)if(id==='village-beacon'){
      const image=scene.add.image(x,y,ATLAS,ASSETS['village-beacon-lights']).setOrigin(0).setDepth(1.1).setAlpha(0).setData('emissive',true);
      this.emitters.push({image,x:x+28,y:y+35,radius:36,baseY:y+64});
    }
    for(const[id,x,y]of VILLAGE.props)if(id==='village-lamp'){
      const image=scene.add.image(x,y,ATLAS,ASSETS['village-lamp-light']).setOrigin(0).setDepth(1.1).setAlpha(0).setData('emissive',true);
      this.emitters.push({image,x:x+12,y:y+21,radius:VILLAGE_LIGHTING.lampRadius,baseY:y+22});
    }
  }
  private pool(x:number,y:number,radius:number,strength:number){
    // Four low-opacity pixel bands give gentle falloff without blur or bloom.
    for(const[scale,alpha]of [[1,.025],[.74,.035],[.46,.06],[.22,.08]]){
      const r=Math.round(radius*scale);
      this.pools.fillStyle(0xe7b664,alpha*strength);
      for(let row=-r;row<=r;row+=2){const width=Math.floor(Math.sqrt(r*r-row*row));this.pools.fillRect(Math.round(x)-width,Math.round(y)+row,width*2+1,2);}
    }
  }
  update(delta:number,night:number,playerY:number){
    const dt=Math.min(delta,50)/1000;this.clock+=dt;
    const target=Phaser.Math.Clamp((night-.1)/.8,0,1);
    this.strength+=(target-this.strength)*(1-Math.exp(-dt*VILLAGE_LIGHTING.fadeRate));
    this.pools.clear();this.details.clear();
    for(const e of this.emitters){
      const flicker=.97+Math.sin(this.clock*1.7+e.x)*.02;
      const warmth=e === this.emitters[0] ? Math.max(this.strength,this.homeWarmth) : this.strength;
      e.image.setAlpha(warmth*flicker);
      if(e.baseY!==undefined)e.image.setDepth(playerY<e.baseY?2.21:1.1);
      this.pool(e.x,e.y,e.radius,warmth*flicker);
    }
    // The igloo tunnel spills onto the snow at its actual entrance.
    const igloo=VILLAGE.buildings[0];this.pool(igloo.x+89,igloo.y+47,16,Math.max(this.strength,this.homeWarmth)*.8);
    for(const fire of this.fires){
    const fx=fire[1]+14,fy=fire[2]+14;
    const flicker=.85+Math.sin(this.clock*5.3)*.07+Math.sin(this.clock*9.7)*.04;
    this.pool(fx,fy,VILLAGE_LIGHTING.fireRadius,flicker*(.2+.8*this.strength));
    // Three tiny embers, staggered and bounded. No particle emitter grows over time.
    for(let i=0;i<3;i++){
      const age=(this.clock*.65+i/3)%1;
      this.details.fillStyle(i%2?0xe7b664:0xcc8154,(1-age)*.65);
      this.details.fillRect(Math.round(fx+Math.sin(i*2+age*3)*4+age*3),Math.round(fy-5-age*14),1,1);
    }
    }
    for(const b of VILLAGE.buildings)if(b.smoke)for(let i=0;i<3;i++){
      const age=(this.clock*.22+i/3+b.x*.001)%1,x=b.x+b.smoke[0]+Math.round(age*14),y=b.y+b.smoke[1]-Math.round(age*22);
      this.details.fillStyle(0xbdcfd8,(1-age)*(.16+this.strength*.06));
      this.details.fillRect(x,y,3+Math.floor(age*3),3);this.details.fillRect(x-1,y+1,3,2);
    }
    // Small warm reflections just beyond the dock boards.
    for(let i=0;i<3;i++){
      this.details.fillStyle(0xe7b664,this.strength*(.12+Math.sin(this.clock*1.3+i)*.025));
      this.details.fillRect(VILLAGE.dock.x-17+i*2,VILLAGE.dock.y-13+i*6+Math.round(Math.sin(this.clock+i)),3-i%2,1);
    }
  }
}
