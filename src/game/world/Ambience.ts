import {sceneryPathClear} from './sceneryCollision';
import {WILDLIFE_SIZE} from './wildlifeSize';
import {caveStrength} from './sideRoutes';
import { AnimalGoal,ANIMAL_BEHAVIOR,swimmingWater,formationTarget } from './animalBehavior';
import type { EnvironmentView } from './EnvironmentView';
import Phaser from 'phaser';
import { ASSETS, ATLAS } from '../assets/catalog';
import { banks,waterSpans } from './river';
import { DynamicWorld, validSnow, validWater, validFloe, type Encounter, type Point } from './DynamicWorld';
import { ANIMAL_RULES, ANIMAL_SPEED, type AnimalId } from './spawnRules';

export const ATMOSPHERE = { trackLifetime: 24, maxTracks: 90, snowflakes: 12, shedInterval: 9, birdInterval: 48 };

export function onSnow(x: number, y: number, radius: number) { return validSnow({ x, y }, radius); }

type Animal = { sprite: Phaser.GameObjects.Sprite; homeX: number; homeY: number; group: number; species: AnimalId; point: Point; encounter: Encounter;
  submerged?:boolean; obstacle?:Phaser.GameObjects.Zone; radius: number; speed: number; timer: number; walking: boolean; heading: number; facing: number; trackX: number; trackY: number; foot: number };
export class Ambience {
  private animals: Animal[] = [];
  readonly collisionBodies:Phaser.Physics.Arcade.StaticGroup;
  blocks(x:number,y:number,radius:number){
    return this.animals.some(a=>{const b=a.obstacle?.body as Phaser.Physics.Arcade.StaticBody|undefined;
      return b?.enable&&Math.hypot(x-b.center.x,y-b.center.y)<radius+b.radius;
    });
  }
  private groups = new Map<number, AnimalGoal>();
  private seed = 7621;
  private flecks: Phaser.GameObjects.Graphics;
  private snow: Phaser.GameObjects.Graphics;
  private tracks: { x: number; y: number; age: number; size: number }[] = [];
  private falling: { x: number; y: number; age: number }[] = [];
  private shedTimer = 3;
  private callTimer = 17;
  private windTravel = 0;
  private waterTravel = 0;
  private jumpTimer = 35;

  private random() { this.seed = (1664525 * this.seed + 1013904223) >>> 0; return this.seed / 4294967296; }
  constructor(private scene: Phaser.Scene, private world: DynamicWorld, private environment?: EnvironmentView, private cover:()=>number=()=>0) {
    this.collisionBodies=scene.physics.add.staticGroup();
    this.flecks = scene.add.graphics().setDepth(1);
    this.snow = scene.add.graphics().setDepth(3);
  }
  private syncEncounters() {
    const ids = new Set(this.world.encounters.map(e => e.id));
    this.animals = this.animals.filter(a => { if (ids.has(a.group)) return true; a.sprite.destroy();a.obstacle?.destroy(); return false; });
    for (const id of this.groups.keys()) if (!ids.has(id)) this.groups.delete(id);
    for (const encounter of this.world.encounters) {
      if (this.groups.has(encounter.id)) continue;
      this.groups.set(encounter.id, new AnimalGoal(encounter));
      for (const point of encounter.points) {
        const species = encounter.species, radius = ANIMAL_RULES[species].radius;
        const sprite = this.scene.add.sprite(point.x, point.y, ATLAS, ASSETS[species]).setScale(WILDLIFE_SIZE[species].scale).setDepth(ANIMAL_RULES[species].terrain === 'air' ? 3 : 2);
        let obstacle:Phaser.GameObjects.Zone|undefined;
        if(ANIMAL_RULES[species].terrain!=='air'){
          const r=Math.max(4,Math.round(WILDLIFE_SIZE[species].radius*.65));
          obstacle=this.scene.add.zone(point.x,point.y,r*2,r*2);this.collisionBodies.add(obstacle);
          (obstacle.body as Phaser.Physics.Arcade.StaticBody).setCircle(r);
        }
        this.animals.push({ sprite, obstacle, point, species, encounter, homeX: point.x, homeY: point.y, group: encounter.id, radius,
          speed: ANIMAL_SPEED[species] * (.8 + this.random() * .4), timer: .5 + this.random() * 4,
          walking: false, facing: 0, trackX: point.x, trackY: point.y, foot: 1, heading: encounter.heading });
      }
    }
  }
  update(time: number, delta: number, player: { x: number; y: number }) {
    const dt = Math.min(delta, 50) / 1000, view = this.scene.cameras.main.worldView;
    this.syncEncounters();
    const trees=(this.scene.registry.get('treeCrowns')??[]) as Point[];
    const active=(p:Point)=>p.x>view.left-100&&p.x<view.right+100&&p.y>view.top-100&&p.y<view.bottom+100;
    for(const goal of this.groups.values())if(goal.encounter.points.some(active)){
      const previous=goal.action;goal.update(dt,player,this.world.conditions,trees,this.world.clock>goal.encounter.expiresAt,this.world.spots.filter(p=>p.availableAt<=this.world.clock&&!p.retired));
      if(previous!==goal.action){
        const p=goal.encounter.points[0],volume=.16*Math.max(0,1-Math.hypot(p.x-player.x,p.y-player.y)/250);
        if(volume>0&&previous==='perch')this.scene.events.emit('river-cue','wings',volume);
      }
    }
    for(const a of this.animals){
      const s=a.sprite,goal=this.groups.get(a.group)!,profile=ANIMAL_BEHAVIOR[a.species];
      const air=profile.habitat==='air',swim=goal.action==='swim',near=active(a.point);
      s.setVisible(near);if(a.obstacle)(a.obstacle.body as Phaser.Physics.Arcade.StaticBody).enable=near&&s.alpha>.15;if(!near){s.anims.pause();continue;}s.anims.resume();a.timer-=dt;
      if(view.contains(s.x,s.y)&&s.alpha>.7&&Math.hypot(s.x-player.x,s.y-player.y)<100)this.scene.events.emit('wildlife-observed',a.species,s.x,s.y);
      const index=a.encounter.points.indexOf(a.point);
      // Stable loose slots and a small individual delay keep a herd together without marching in lockstep.
      let target=formationTarget(goal,index);
      if(air&&goal.action==='perch'){target={x:goal.target.x+(index-(a.encounter.points.length-1)/2)*WILDLIFE_SIZE[a.species].spacing,y:goal.target.y+(index%2)*3};s.x+=(target.x-s.x)*Math.min(1,dt*4);s.y+=(target.y-s.y)*Math.min(1,dt*4);Object.assign(a.point,{x:s.x,y:s.y});}
      const valid=(p:Point)=>air||swim?air||swimmingWater(p)||(a.species==='otter'&&validSnow(p,a.radius))||(a.species==='otter'&&caveStrength(p.x,p.y)<.1&&waterSpans(p.y).some(([l,r])=>p.x>l-65&&p.x<r+65)):onSnow(p.x,p.y,a.radius);
      if(!air&&!swim&&!valid(target))target={...goal.target};
      const circling=air&&goal.overWater&&goal.action==='inspect';
      if(circling)target={x:goal.target.x+Math.cos(time/2800+index)*65,y:goal.target.y+Math.sin(time/5600+index)*24};
      const travel=goal.action==='travel'||swim||circling;
      a.walking=travel&&a.timer<=0&&Math.hypot(target.x-s.x,target.y-s.y)>8;
      if(a.walking){
        const desired=Math.atan2(target.y-s.y,target.x-s.x);
        const speed=a.speed*(goal.reaction?profile.speed:1)*(swim?1.6:1);
        const amount=speed*dt;let moved=false;
        for(const turn of [0,.6,-.6,1.1,-1.1]){
          const heading=desired+turn,q={x:s.x+Math.cos(heading)*amount,y:s.y+Math.sin(heading)*amount};
          const crowded=!air&&!swim&&this.animals.some(b=>b!==a&&Math.hypot(q.x-b.point.x,q.y-b.point.y)<(a.radius+b.radius)*.72&&Math.hypot(q.x-b.point.x,q.y-b.point.y)<=Math.hypot(s.x-b.point.x,s.y-b.point.y));
          const playerRadius=('body' in player&&player.body?17:10);
          const r=a.obstacle?(a.obstacle.body as Phaser.Physics.Arcade.StaticBody).radius:0;
          const clearOfPlayer=air||Math.hypot(q.x-player.x,q.y-player.y)>=r+playerRadius||Math.hypot(q.x-player.x,q.y-player.y)>Math.hypot(s.x-player.x,s.y-player.y);
          if(valid(q)&&!crowded&&clearOfPlayer&&(air||sceneryPathClear(s.x,s.y,q.x,q.y,a.obstacle?(a.obstacle.body as Phaser.Physics.Arcade.StaticBody).radius:a.radius))){s.setPosition(q.x,q.y);Object.assign(a.point,q);a.heading=heading;moved=true;break;}
        }
        if(!moved)a.walking=false;
        a.facing=Phaser.Math.Angle.RotateTo(a.facing,a.heading+Math.PI/2,dt*3);
        if(!air&&!swim&&Math.hypot(s.x-a.trackX,s.y-a.trackY)>WILDLIFE_SIZE[a.species].stride){
          this.tracks.push({x:Math.round(s.x-Math.sin(a.heading)*WILDLIFE_SIZE[a.species].stance*a.foot),y:Math.round(s.y+Math.cos(a.heading)*WILDLIFE_SIZE[a.species].stance*a.foot),age:0,size:WILDLIFE_SIZE[a.species].track});
          a.foot*=-1;a.trackX=s.x;a.trackY=s.y;
          const distance=Math.hypot(s.x-player.x,s.y-player.y);if(distance<150)this.scene.events.emit('river-cue','step',.1*(1-distance/150));
        }
      }else if(goal.action==='alert'||goal.action==='social'||goal.action==='inspect'){
        const look=goal.action==='alert'?player:goal.action==='social'?goal.encounter.points[(index+1)%goal.encounter.points.length]:goal.target;
        a.facing=Phaser.Math.Angle.RotateTo(a.facing,Math.atan2(look.y-s.y,look.x-s.x)+Math.PI/2,dt*.8);
      }
      const expired=Math.max(0,this.world.clock-a.encounter.expiresAt-38);
      const submerged=swim&&swimmingWater(a.point)&&!validFloe(a.point,2);
      if(submerged&&!a.submerged){
        const volume=.16*Math.max(0,1-Math.hypot(s.x-player.x,s.y-player.y)/250);
        if(volume>0)this.scene.events.emit('river-cue','wild-splash',volume);
        const splash=this.scene.add.graphics().setDepth(3);splash.lineStyle(1,0xb6d4d9,.6).strokeEllipse(s.x,s.y,17,6);
        this.scene.tweens.add({targets:splash,alpha:0,duration:650,onComplete:()=>splash.destroy()});
      }
      a.submerged=submerged;
      s.setAlpha(submerged?Math.max(0,Math.min(.8,goal.timer/4)):Math.max(0,1-expired/7));
      if(a.obstacle){a.obstacle.setPosition(s.x,s.y);(a.obstacle.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();}
      const direction=['N','NE','E','SE','S','SW','W','NW'][(Math.round(a.facing/(Math.PI/4))+8)%8];
      let action=a.walking?(submerged?'swim':'walk'):goal.action==='travel'||swim&&!submerged?'idle':goal.action==='social'?'inspect':goal.action;
      const key=`${a.species}/${direction}/${action}`;
      const changed=s.anims.currentAnim?.key!==key;
      s.play(key,true);if(changed){s.anims.timeScale=.88+(index%4)*.09;s.anims.setProgress((index*.29)%1);}
    }
    this.jumpTimer-=dt;
    if(this.jumpTimer<=0){
      this.jumpTimer=45+this.random()*50;
      const spots=this.world.spots.filter(p=>view.contains(p.x,p.y)&&p.availableAt<=this.world.clock&&validWater(p,10,false));
      if(spots.length&&this.world.conditions.weather!=='heavy-snow'&&this.random()<.55){
        const p=spots[Math.floor(this.random()*spots.length)];
        const fish=this.scene.add.image(p.x,p.y,ATLAS,ASSETS['water-shadow']).setDepth(2).setTint(0x9dc5cc);
        this.scene.tweens.add({targets:fish,y:p.y-7,angle:18,duration:280,yoyo:true,onComplete:()=>fish.destroy()});
      }
    }
    const seconds = time / 1000;
    const weather = this.environment;
    this.windTravel += dt * (weather?.wind ?? 7);
    this.waterTravel += dt * 2 * (weather?.water ?? 1);
    this.callTimer -= dt;
    if (this.callTimer <= 0) {
      this.callTimer = 19 + this.random() * 15;
      const caller=this.animals.find(a=>['bird','owl','penguin','raven','musk-ox'].includes(a.species)&&view.contains(a.sprite.x,a.sprite.y));
      if(caller)this.scene.events.emit('river-cue',caller.species==='raven'?'raven-call':caller.species==='musk-ox'?'herd-snort':'wild-call',.1*Math.max(0,1-Math.hypot(caller.point.x-player.x,caller.point.y-player.y)/300));
    }
    this.flecks.clear();
    // Only a few slow, broken glints, restricted to water; no particle storm.
    for (let i = 0; i < 7; i++) {
      const y = view.top + ((i * 83 + this.waterTravel) % Math.max(1, view.height));
      const [left, right] = banks(y), x = left + (right - left) * (.15 + i * .113);
      this.flecks.fillStyle(0x8bbbc3, .12 + .08 * Math.sin(seconds + i));
      const spread = 3 + Math.floor((seconds * .3 + i / 7) % 1 * 9);
      this.flecks.fillRect(Math.round(x - spread), Math.round(y), 4, 1);
      this.flecks.fillRect(Math.round(x + spread), Math.round(y + 2), 3, 1);
    }
    // Sparse aurora reflections in open water: crisp broken cyan clusters, no sky overlay.
    if (weather && weather.aurora > .01 && weather.cave < .2) for (let band = 0; band < 3; band++) {
      for (let i = 0; i < 30; i++) {
        const y = Math.round(view.top + (i * 14 + band * 53) % Math.max(1, view.height));
        const [left, right] = banks(y);
        const x = Math.round(left + (right - left) * (.28 + band * .18) + Math.sin(y / 90 + seconds * .12 + band) * 12);
        if (!validWater({ x, y }, 8)) continue;
        this.flecks.fillStyle(band === 1 ? 0x96cbd4 : 0x79cba9, weather.aurora * .11 * (.5 + .5 * Math.sin(i * .3 + seconds * .3)));
        this.flecks.fillRect(x, y, 5 + i % 4, 2);
      }
    }
    this.tracks = this.tracks.filter(track => (track.age += dt) < ATMOSPHERE.trackLifetime).slice(-ATMOSPHERE.maxTracks);
    for (const track of this.tracks) {
      this.flecks.fillStyle(0x7b929c, .3 * (1 - track.age / ATMOSPHERE.trackLifetime));
      this.flecks.fillRect(track.x, track.y, track.size, track.size);
      this.flecks.fillStyle(0xf1f1df, .25 * (1 - track.age / ATMOSPHERE.trackLifetime));
      this.flecks.fillRect(track.x, track.y + track.size, Math.min(2,track.size), 1);
    }
    this.snow.clear();
    this.shedTimer -= dt;
    if (this.shedTimer <= 0) {
      this.shedTimer = ATMOSPHERE.shedInterval / (weather?.water ?? 1) + this.random() * 7;
      const trees = (this.scene.registry.get('treeCrowns') as { x: number; y: number }[]).filter(tree => view.contains(tree.x, tree.y));
      if (trees.length) {
        const tree = trees[Math.floor(this.random() * trees.length)];
        for (let i = 0; i < 5; i++) this.falling.push({ x: tree.x + (this.random() - .5) * 12, y: tree.y, age: -i * .09 });
      }
    }
    this.falling = this.falling.filter(particle => (particle.age += dt) < 1.6);
    for (const particle of this.falling) if (particle.age >= 0) {
      this.snow.fillStyle(0xf1f1df, .7 * (1 - particle.age / 1.6));
      this.snow.fillRect(Math.round(particle.x + particle.age * 5), Math.round(particle.y + particle.age * 10), 2, 2);
    }

  }
}
