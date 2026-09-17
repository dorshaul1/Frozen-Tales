import {rideMomentum,NO_RIDE,type RideFlow} from '../world/flowRiding';
import { navigationFlow } from '../world/navigation';
import Phaser from 'phaser';
import { ANCHOR, TURBO, STARTER_LEVELS, UPGRADE_IDS, UPGRADES, MODULE_IDS, type EquipmentLevels, type UpgradeId } from '../upgrades/data';
import { ASSET_FRAMES } from '../assets/catalog';
import { ASSETS, ATLAS } from '../assets/textures';

import { MOVEMENT, MANEUVERS } from '../tuning';

export function kayakAttachmentFrame(id:typeof MODULE_IDS[number],level:number,pose=0){
 const frames=ASSET_FRAMES[`kayak-gear-${id}`],index=id==='speed'?(level-1)*5+pose:level-1;
 return frames[Math.min(index,frames.length-1)];
}
export class Kayak extends Phaser.Physics.Arcade.Sprite {
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private direction = new Phaser.Math.Vector2();
  private velocityChange = new Phaser.Math.Vector2();
  private movementEnabled = true;
  waterFlow?: {x:number;y:number;speed:number};
  rideFlow:RideFlow=NO_RIDE;
  flowMomentum=0;
  private recovery=0;
  braking=false;
  braceRemaining=0;
  braceCooldown=0;
  private braceStrength=0;
  private paddleFoam!:Phaser.GameObjects.Graphics;
  private paddleSoundAt=0;
  boostEnergy=1;
  boosting=false;
  private boostExhausted=false;
  anchored=false;
  private anchorPoint={x:0,y:0};
  private anchorRope!:Phaser.GameObjects.Graphics;
  private anchorFade=0;
  toggleAnchor(){
    if(!this.moduleValue('anchor')||!this.occupied)return false;
    if(!this.anchored&&(this.body as Phaser.Physics.Arcade.Body).velocity.length()>ANCHOR.maxDeploySpeed)return false;
    this.anchored=!this.anchored;this.anchorPoint={x:this.x,y:this.y};
    this.scene.events.emit('river-cue','hull-splash',.2);return true;
  }

  moduleValue: (id:'turbo'|'hull'|'anchor')=>number=()=>0;
  private boostMeter:Phaser.GameObjects.Graphics;

  collisionRecovery(){this.recovery=450;}
  private visualLevels: EquipmentLevels = {...STARTER_LEVELS};
  private attachments = new Map<UpgradeId,Phaser.GameObjects.Image>();
  private visualFlash = 0;
  private occupied = true;
  setOccupied(occupied: boolean) { this.occupied = occupied; this.anims.stop(); this.setFrame(this.idleFrame); }

  // Compatibility for older fixtures; production always supplies all purchased levels.
  setStorageVisual(upgraded: boolean) { this.setEquipmentVisual({...this.visualLevels,cargo:upgraded?Math.max(1,this.visualLevels.cargo):0}); }
  setEquipmentVisual(levels: EquipmentLevels, highlight = false) {
    for(const id of UPGRADE_IDS)this.visualLevels[id]=Math.max(0,Math.min(UPGRADES[id].levels.length,levels[id]??0));
    if(highlight)this.visualFlash=450;
    this.syncAttachments();
  }
  private get idleFrame() { return this.occupied ? ASSETS.kayak : ASSETS['kayak-empty']; }
  private syncAttachments(_time = 0, delta = 0) {
    if(!this.moduleValue('anchor')||!this.occupied)this.anchored=false;
    this.anchorFade=Phaser.Math.Linear(this.anchorFade,this.anchored?1:0,Math.min(1,delta/180));
    this.anchorRope.clear();
    if(this.anchorFade>.01){const x=Math.round(this.x+10),y=Math.round(this.y+8),ax=Math.round(this.anchorPoint.x+16),ay=Math.round(this.anchorPoint.y+18);
      this.anchorRope.lineStyle(1,0x9dc5cc,this.anchorFade*.8).lineBetween(x,y,ax,ay).lineBetween(ax,ay,ax,ay+6).lineBetween(ax-4,ay+3,ax,ay+6).lineBetween(ax,ay+6,ax+4,ay+3);}
    this.visualFlash=Math.max(0,this.visualFlash-delta);
    const pose=!this.occupied?4:this.anims.isPlaying&&this.frame.name.includes('/paddle/')?Number(this.frame.name.split('/').pop())+1:0;
    for(const id of MODULE_IDS){
      const level=this.visualLevels[id];let image=this.attachments.get(id);
      if(!image&&level){image=this.scene.add.image(this.x,this.y,ATLAS,ASSET_FRAMES[`kayak-gear-${id}`][0]);this.attachments.set(id,image);}
      if(!image)continue;
      image.setVisible(this.visible&&level>0).setPosition(this.x,this.y).setRotation(this.rotation).setScale(this.scaleX,this.scaleY).setOrigin(this.originX,this.originY).setDepth(this.depth+.01).setAlpha(this.alpha);
      if(level)image.setFrame(kayakAttachmentFrame(id,level,pose));
      image.setTint(this.visualFlash>0?0xffe5a6:this.tintTopLeft);
    }
  }

  setMovementEnabled(enabled: boolean) {
    this.movementEnabled = enabled;
    if (!enabled) {
      this.setVelocity(0, 0);
      this.boosting=false;this.braking=false;this.braceRemaining=0;this.braceStrength=0;this.paddleFoam.clear();this.boostMeter.clear();
      this.anims.stop();
      this.setFrame(this.idleFrame);
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number, private speedMultiplier: () => number = () => 1) {
    super(scene, x, y, ATLAS, ASSETS.kayak);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(2);
    this.anchorRope=scene.add.graphics().setDepth(1.9);this.once('destroy',()=>this.anchorRope.destroy());
    this.paddleFoam=scene.add.graphics().setDepth(1.9);this.once('destroy',()=>this.paddleFoam.destroy());
    this.boostMeter=scene.add.graphics().setDepth(3);this.once('destroy',()=>this.boostMeter.destroy());
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE,this.syncAttachments,this);
    this.once('destroy',()=>{scene.events.off(Phaser.Scenes.Events.POST_UPDATE,this.syncAttachments,this);this.attachments.forEach(image=>image.destroy());});
    this.setScale(MOVEMENT.spriteScale);
    // A circular hull avoids snagging as the sprite rotates against riverbanks.
    const radius = MOVEMENT.hullRadius;
    (this.body as Phaser.Physics.Arcade.Body).setCircle(radius, this.width / 2 - radius, this.height / 2 - radius);
    this.setCollideWorldBounds(true);
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,K,C') as typeof this.keys;
    scene.input.keyboard!.addCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,K,C');
    scene.game.events.on(Phaser.Core.Events.BLUR, this.resetMovement, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.game.events.off(Phaser.Core.Events.BLUR, this.resetMovement, this));
  }

  private currentVelocity = new Phaser.Math.Vector2();

  private resetMovement() {
    this.scene.input.keyboard?.resetKeys();
    this.setVelocity(0, 0);
  }

  update(_time: number, delta: number) {
    if (!this.movementEnabled){this.boosting=false;this.flowMomentum=0;this.anims.timeScale=1;this.boostMeter.clear();return;}
    const k = this.keys;
    const dt = Math.min(delta, 50) / 1000;
    this.braceCooldown=Math.max(0,this.braceCooldown-dt);
    this.braceRemaining=Math.max(0,this.braceRemaining-dt);
    if(Phaser.Input.Keyboard.JustDown(k.C)&&!this.anchored&&this.braceCooldown===0){
      this.braceRemaining=MANEUVERS.braceDuration;this.braceCooldown=MANEUVERS.braceCooldown;
      this.scene.events.emit('river-cue','paddle',.24);
    }
    this.braceStrength+=((this.braceRemaining>0?1:0)-this.braceStrength)*(1-Math.exp(-dt*MANEUVERS.braceBlend));
    this.paddleFoam.clear();
    if(Phaser.Input.Keyboard.JustDown(k.K))this.toggleAnchor();
    this.direction.set(Number(k.D.isDown || k.RIGHT.isDown) - Number(k.A.isDown || k.LEFT.isDown), Number(k.S.isDown || k.DOWN.isDown) - Number(k.W.isDown || k.UP.isDown)).normalize();
    const body = this.body as Phaser.Physics.Arcade.Body;
    const active = this.direction.lengthSq() > 0;
    if(this.anchored){
      this.flowMomentum=0;this.anims.timeScale=1;
      const flow=this.waterFlow??{x:0,y:0};
      const dx=this.anchorPoint.x-this.x,dy=this.anchorPoint.y-this.y;
      body.velocity.set(flow.x*ANCHOR.flowResistance+dx*ANCHOR.spring,flow.y*ANCHOR.flowResistance+dy*ANCHOR.spring);
      this.boosting=false;this.anims.stop();this.setFrame(this.idleFrame);return;
    }
    const speed=body.velocity.length();
    const opposing=active&&speed>30&&this.direction.dot(body.velocity)/speed<-.35;
    this.braking=k.C.isDown||opposing;
    const holdingBrake=k.C.isDown;
    const slowControl=1+(MANEUVERS.slowControl-1)*Math.max(0,1-speed/MANEUVERS.slowSpeed);
    const turbo=!!this.moduleValue('turbo'),hull=this.moduleValue('hull');
    if(!k.SHIFT.isDown&&this.boostEnergy>=.3)this.boostExhausted=false;
    const wasBoosting=this.boosting;
    this.boosting=turbo&&active&&!this.braking&&k.SHIFT.isDown&&!this.boostExhausted&&this.boostEnergy>0;
    if(this.boosting){this.boostEnergy=Math.max(0,this.boostEnergy-dt/TURBO.duration);if(this.boostEnergy===0)this.boostExhausted=true;}
    else if(!k.SHIFT.isDown||!active)this.boostEnergy=Math.min(1,this.boostEnergy+dt/TURBO.recharge);
    if(this.boosting&&!wasBoosting)this.scene.events.emit('river-cue','current',.35);
    this.boostMeter.clear();
    if(turbo&&this.visible){this.boostMeter.fillStyle(0x233e49,.8).fillRect(Math.round(this.x)-13,Math.round(this.y)+36,26,4);this.boostMeter.fillStyle(this.boosting?0xf3d49a:0x9dc5cc,.9).fillRect(Math.round(this.x)-12,Math.round(this.y)+37,Math.round(24*this.boostEnergy),2);}
    this.flowMomentum=rideMomentum(this.flowMomentum,this.rideFlow,active?this.direction.x*body.velocity.length():body.velocity.x,active?this.direction.y*body.velocity.length():body.velocity.y,dt);
    const upgrade=this.speedMultiplier(),flow=this.waterFlow??navigationFlow(this.x,this.y);
    if(this.braking)this.flowMomentum*=Math.exp(-dt*MANEUVERS.brakeDrag);
    const resistance=(1-this.braceStrength*MANEUVERS.braceResistance)/(1+(upgrade-1)*5);
    // Smooth the force, not the position: weather/zone changes retain hull momentum.
    const blend=1-Math.exp(-dt*5);
    this.currentVelocity.x+=(flow.x*resistance*1.12-this.currentVelocity.x)*blend;
    this.currentVelocity.y+=(flow.y*resistance*1.12-this.currentVelocity.y)*blend;
    const fx=this.currentVelocity.x,fy=this.currentVelocity.y;
    const waterDrag=this.flowMomentum>8?1.35:MOVEMENT.drag;
    this.recovery=Math.max(0,this.recovery-delta);
    if(holdingBrake){
      const brakeBlend=1-Math.exp(-MANEUVERS.brakeDrag*dt);
      body.velocity.x+=(fx-body.velocity.x)*brakeBlend;
      body.velocity.y+=(fy-body.velocity.y)*brakeBlend;
    } else if (active) {
      // Steer velocity toward the requested direction with bounded acceleration.
      // This also brakes reversals quickly without instantly erasing momentum.
      this.velocityChange.copy(this.direction).scale((MOVEMENT.maxSpeed * upgrade * flow.speed + this.flowMomentum) * (this.boosting?TURBO.speed:1));
      this.velocityChange.x+=fx;this.velocityChange.y+=fy;
      this.velocityChange.subtract(body.velocity);
      this.velocityChange.limit(MOVEMENT.acceleration * slowControl * (opposing?MANEUVERS.reverseAcceleration:1) * (1+this.braceStrength*.25) * upgrade * (1+(upgrade-1)*this.rideFlow.strength*2) * (this.recovery>0?1+(upgrade-1)*.6+hull*1.4:1) * (this.boosting?TURBO.acceleration:1) * dt);
      body.velocity.add(this.velocityChange);
    } else {
      body.velocity.scale(Math.exp(-waterDrag * dt));
      if (Math.hypot(fx,fy) === 0 && body.velocity.length() < MOVEMENT.stopSpeed) body.velocity.set(0, 0);
    }
    // Flow is a gentle downstream velocity target; paddling can overpower it.
    if (!active&&!holdingBrake) {const blend=1-Math.exp(-waterDrag*dt);body.velocity.x+=fx*blend;body.velocity.y+=fy*blend;}
    // Face travel rather than raw input: turns and released-input drift agree
    // with where the hull is actually going. Retain heading at rest.
    if (body.velocity.length() > MOVEMENT.facingMinSpeed || active) {
      const angle = (active&&speed<MANEUVERS.slowSpeed?this.direction.angle():body.velocity.angle()) + Math.PI / 2;
      this.rotation += Phaser.Math.Angle.Wrap(angle - this.rotation) * (1 - Math.exp(-MOVEMENT.turnResponsiveness * slowControl * (1+(upgrade-1)*.8+(this.recovery>0?hull*.9:0)) * dt));
    }
    this.anims.timeScale=1+Math.min(.65,this.flowMomentum/100);
    if(this.braking&&speed>12){
      if(this.anims.isPlaying&&this.anims.forward)this.anims.stop();
      this.anims.playReverse('kayak/N/paddle',true);
    } else if (active && body.velocity.length() > 20){
      if(this.anims.isPlaying&&!this.anims.forward)this.anims.stop();
      this.play('kayak/N/paddle',true);
    }
    else { this.anims.stop(); this.setFrame(this.idleFrame); }
    if(this.braceRemaining>0&&!this.braking){this.anims.stop();this.setFrame(ASSET_FRAMES.kayak[1]);}
    if((this.braking&&speed>12)||this.braceRemaining>0){
      // Local paddle wash rotates with the hull, never with camera coordinates.
      const g=this.paddleFoam;g.setPosition(this.x,this.y).setRotation(this.rotation);
      const phase=(_time%360)/360,alpha=(1-phase)*.55;
      for(const side of [-1,1]){
        g.lineStyle(1,0xb8d7dd,alpha).lineBetween(side*17,-2+phase*10,side*(22+phase*5),phase*10);
        g.fillStyle(0xc7e2e4,alpha).fillRect(side*24,Math.round(phase*14),2,2);
      }
      if(_time>this.paddleSoundAt){this.paddleSoundAt=_time+420;this.scene.events.emit('river-cue','paddle',.2);}
    }
  }
}
