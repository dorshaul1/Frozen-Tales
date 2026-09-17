import Phaser from 'phaser';
import {sceneryPathClear} from '../world/sceneryCollision';
import { ATLAS, ASSETS } from '../assets/textures';
import { VILLAGE, canWalk, type VillageRect } from '../home/villageLayout';

export class Fisherman extends Phaser.GameObjects.Sprite {
  blockedByWildlife:(x:number,y:number)=>boolean=()=>false;
  walkable?: (x:number,y:number)=>boolean;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private enabled = false;
  private facing = 'W';
  private stepDistance = 0;
  private foot = 1;
  private tracks: { x: number; y: number; age: number }[] = [];
  private footprints: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene, private obstacles: VillageRect[]) {
    super(scene, VILLAGE.dock.landX, VILLAGE.dock.landY, ATLAS, ASSETS.fisherman);
    scene.add.existing(this);this.setDepth(2).setVisible(false);
    this.footprints = scene.add.graphics().setDepth(1);
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as typeof this.keys;
    scene.game.events.on(Phaser.Core.Events.BLUR, this.resetInput, this);
    scene.events.once('shutdown', () => scene.game.events.off(Phaser.Core.Events.BLUR, this.resetInput, this));
  }
  private resetInput() { this.scene.input.keyboard?.resetKeys(); this.play(`fisherman/${this.facing}/idle`, true); }
  setMovementEnabled(enabled: boolean) { this.enabled = enabled; if(!enabled)this.play(`fisherman/${this.facing}/idle`, true); }
  update(delta: number) {
    const dt=Math.min(delta,50)/1000,k=this.keys;
    let dx=this.enabled?Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown):0;
    let dy=this.enabled?Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown):0;
    const length=Math.hypot(dx,dy),oldX=this.x,oldY=this.y;
    if(length){
      dx=dx/length*VILLAGE.walkSpeed*dt;dy=dy/length*VILLAGE.walkSpeed*dt;
      // Small, separate-axis steps slide along roofs/snowbanks without boat inertia.
      if(sceneryPathClear(this.x,this.y,this.x+dx,this.y,8)&&!this.blockedByWildlife(this.x+dx,this.y)&&(this.walkable?this.walkable(this.x+dx,this.y):canWalk(this.x+dx,this.y,this.obstacles)))this.x+=dx;
      if(sceneryPathClear(this.x,this.y,this.x,this.y+dy,8)&&!this.blockedByWildlife(this.x,this.y+dy)&&(this.walkable?this.walkable(this.x,this.y+dy):canWalk(this.x,this.y+dy,this.obstacles)))this.y+=dy;
      // South and its diagonals resolve to authored front-view atlas frames.
      this.facing=['N','NE','E','SE','S','SW','W','NW'][(Math.round((Math.atan2(dy,dx)+Math.PI/2)/(Math.PI/4))+8)%8];
    }
    const moved=Math.hypot(this.x-oldX,this.y-oldY);
    this.play(`fisherman/${this.facing}/${moved>.01?'walk':'idle'}`,true);
    this.stepDistance+=moved;
    if(this.stepDistance>9){
      this.stepDistance=0;this.foot*=-1;
      const angle=Math.atan2(dy,dx);
      // Dock boards do not accumulate snow tracks.
      if(this.x<VILLAGE.dock.x-124)this.tracks.push({x:Math.round(this.x-Math.sin(angle)*3*this.foot),y:Math.round(this.y+Math.cos(angle)*3*this.foot),age:0});
      this.scene.events.emit('river-cue','step',.18);
    }
    this.footprints.clear();this.tracks=this.tracks.filter(t=>(t.age+=dt)<24).slice(-80);
    for(const t of this.tracks)this.footprints.fillStyle(0x7b929c,.35*(1-t.age/24)).fillRect(t.x,t.y,2,2);
  }
}
