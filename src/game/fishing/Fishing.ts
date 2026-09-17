import {interactionAt} from '../world/interactionSpots';
import {eventFishTable,eventQuality,activeEvent} from '../world/areaEvents';
import { rollSpecimen,specimenFight,isTrophy,SPECIMENS } from './specimens';
import type { CaughtFish } from '../player/Cargo';
import { pocketAt } from '../world/sideRoutes';
import { pixelText } from '../ui/PixelText';
import { waterDepth } from '../world/depth';
import { FIGHT } from './fightBalance';
import { validWater } from '../world/DynamicWorld';
import { RARE_FISH } from './rareFish';
import { LegendaryCatchCard } from './LegendaryCatchCard';
import type { AssetId } from '../assets/catalog';
import { WATER_SIGNS, type WaterSign } from './spotReading';
import { animalActivity } from '../world/conditions';
import { ASSET_FRAMES } from '../assets/catalog';
import { catchQuality, conditionFishTable } from '../world/conditions';
import Phaser from 'phaser';
import { DynamicWorld, type Activity } from '../world/DynamicWorld';
import { areaAt, DYNAMIC } from '../world/spawnRules';
import { Kayak } from '../entities/Kayak';
import { FISHING } from '../tuning';
import { CATCH_BALANCE, RARITIES, chooseFish, FISH, FISHING_SPOTS, type FishId } from './data';
import { FishFight } from './FishFight';
import { FishingUI } from './FishingUI';
import { Cargo } from '../player/Cargo';
import { Equipment } from '../upgrades/Equipment';
import { ASSETS, ATLAS } from '../assets/textures';

type State = 'idle' | 'aiming' | 'casting' | 'waiting' | 'hooked' | 'result';
type Spot = { visitor?: FishId; sign?: WaterSign; school?: Activity['school'] } & typeof FISHING_SPOTS[number] & { availableAt: number; retired?: boolean; kind?: Activity['kind']; required?: FishId };

export class Fishing {
  private phase: State = 'idle';
  private aimAngle=0;
  private charge=0;
  private castPoint={x:0,y:0};
  private fishPoint={x:0,y:0};
  private opponent:Phaser.GameObjects.Image;
  private controls:Record<string,Phaser.Input.Keyboard.Key>;
  private escape:Phaser.Input.Keyboard.Key;
  private count = 0;
  private legendaryCard: LegendaryCatchCard;
  private announced = new WeakSet<Spot>();
  private resultPortrait: Phaser.GameObjects.Image;
  private resultDuration = CATCH_BALANCE.resultDuration;
  private currentFight?: FishFight;
  private hookedFish?: FishId;
  private specimen?:CaughtFish;
  private conditionQuality = 1;
  private ui: FishingUI;
  private struggleSplashTime = 0;
  private clock = 0;
  private deadline = 0;
  private target?: Spot;
  private result = '';
  private resultColor = '#edf7f4';
  private graphics: Phaser.GameObjects.Graphics;
  private hint: Phaser.GameObjects.Text;
  private splashes: { x: number; y: number; age: number; color: number; strength: number }[] = [];
  private catchFlash?: { x: number; y: number; age: number; color: number };
  weatherClarity=1;
  lanternStrength = 0;
  showIdleHint = true;
  get elapsed() { return this.clock; }
  private shadows: Phaser.GameObjects.Image[] = [];
  private activityGulls: Phaser.GameObjects.Image[] = [];
  readonly spots: Spot[];
  get protectedSpot() { return this.active ? this.target : undefined; }

  get state(): State { return this.phase; }
  get fight() { return this.currentFight; }
  get caughtFishCount() { return this.count; }
  get active() { return this.phase === 'aiming' || this.phase === 'casting' || this.phase === 'waiting' || this.phase === 'hooked'; }

  constructor(private scene: Phaser.Scene, private kayak: Kayak, private cargo: Cargo, private equipment: Equipment, private world?: DynamicWorld) {
    this.controls=scene.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as typeof this.controls;
    this.escape=scene.input.keyboard!.addKey('ESC');
    this.opponent=scene.add.image(0,0,ATLAS,ASSET_FRAMES['water-shadow'][0]).setDepth(1.1).setVisible(false);
    this.clock = world?.clock ?? 0;
    this.legendaryCard = new LegendaryCatchCard(scene);
    this.spots = world ? world.spots : FISHING_SPOTS.map(spot => ({ ...spot, availableAt: 0 }));
    this.ui = new FishingUI(scene);
    this.resultPortrait = scene.add.image(0, 0, ATLAS, ASSETS['fish-crown']).setDepth(5).setVisible(false);
    this.shadows = [];
    this.graphics = scene.add.graphics().setDepth(1);
    this.hint = pixelText(scene,0, 0, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#edf7f4',
      backgroundColor: '#173642', padding: { x: 4, y: 3 },
    }).setOrigin(.5, 1).setDepth(4);
    // Losing focus cancels the cast, rather than returning to a missed bite or
    // a locked kayak. No timers/listeners survive a scene restart.
    scene.game.events.on(Phaser.Core.Events.BLUR, this.cancel, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.game.events.off(Phaser.Core.Events.BLUR, this.cancel, this);
      this.kayak.setMovementEnabled(true);
      this.graphics.destroy();this.opponent.destroy();
      this.hint.destroy();
      this.shadows.forEach(shadow => shadow.destroy());this.activityGulls.forEach(bird=>bird.destroy());
      this.legendaryCard.destroy(); this.ui.destroy(); this.resultPortrait.destroy();
    });
  }

  private cancel() {
    this.phase = 'idle';this.opponent.setVisible(false);this.graphics.clear();
    this.resultPortrait.setVisible(false); this.legendaryCard.hide();
    this.target = undefined;
    this.currentFight = undefined;
    this.hookedFish = undefined;this.specimen=undefined;
    this.ui.draw(undefined, 0, 0);
    this.kayak.setMovementEnabled(true);
  }

  private finish(caught: boolean, message = '') {
    this.phase = 'result';
    this.resultDuration = CATCH_BALANCE.resultDuration;
    this.deadline = this.clock + this.resultDuration;
    this.resultPortrait.setVisible(false);
    this.kayak.setMovementEnabled(true);
    this.resultColor = '#edf7f4';
    if (caught && this.target && this.hookedFish) {
      const type = this.hookedFish;
      const firstDiscovery = !this.cargo.records[type];
      const caught = this.cargo.land(this.specimen ?? rollSpecimen(type));
      const stored = this.cargo.store(caught);
      const fish = FISH[type];
      this.count++;
      if (this.world) this.world.caught(this.target as Activity);
      else this.target.availableAt = this.clock + FISHING.spotRespawnTime;

      this.scene.events.emit('fish-landed',{fish:caught,area:areaAt(this.target.y,this.target.x),conditions:this.world?.conditions ?? {phase:'day',weather:'clear'},large:this.target.sign==='large'||this.target.kind==='trophy'});
      this.result = `${fish.name} · ${caught.weightKg.toFixed(2)} kg\n${caught.size&&caught.size!=='normal'?SPECIMENS[caught.size].name+' · ':''}${RARITIES[caught.rarity].name} · $${caught.value} · Fresh${caught.personalRecord ? '\nNEW RECORD!' : ''}`;
      if (firstDiscovery && RARE_FISH[type]) {
        this.result = `${fish.rarity === 'legendary' ? 'LEGEND OF THE LAKE' : 'RARE DISCOVERY'}\n${this.result}`;
        this.resultDuration = fish.rarity === 'legendary' ? 4.5 : 3.2;
        this.deadline = this.clock + this.resultDuration;
        this.resultPortrait.setFrame(ASSETS[`fish-${type}` as AssetId]).setVisible(true);

      }
      if (!this.equipment.save()) this.result += '\nSave unavailable';
      this.resultColor = '#f3d49a';
      this.splash(this.target, 0xc0dce0, isTrophy(caught.size)?2:1.6);
      this.catchFlash = { x: this.fishPoint.x, y: this.fishPoint.y, age: 0, color: fish.color };
      const exceptional = !!RARE_FISH[type];
      this.scene.events.emit('river-cue', fish.rarity === 'legendary' ? 'legendary-catch' : exceptional||isTrophy(caught.size) ? 'rare-catch' : 'catch', exceptional ? .5 : .65);
      if (fish.rarity === 'legendary') { this.resultDuration=4; this.deadline=this.clock+4; this.resultPortrait.setVisible(false); this.legendaryCard.show(caught,firstDiscovery); }
      this.scene.cameras.main.shake(85, .0008);
      if(fish.rarity!=='legendary'&&(isTrophy(caught.size)||caught.personalRecord)){this.resultDuration=3;this.deadline=this.clock+3;this.resultPortrait.setVisible(false);this.legendaryCard.show(caught,firstDiscovery);}
      if (!stored) this.scene.events.emit("cargo-overflow", caught);
    } else {
      if (this.world && this.target) this.world.caught(this.target as Activity, false);
      this.result = message;
      const snapped = this.currentFight?.outcome === 'snapped';
      this.resultColor = snapped ? '#cc8154' : '#c0dce0';
      this.scene.events.emit('river-cue', snapped ? 'snap' : 'escape', .4);
      if (this.target) this.splash(this.target, snapped ? 0xcc8154 : 0x8bbbc3, snapped ? 1.5 : .7);
    }
  }

  private splash(point: { x: number; y: number }, color = 0xc4e2de, strength = 1) {
    this.splashes.push({ x: point.x, y: point.y, age: 0, color, strength });
  }

  update(delta: number, pressed: boolean, held: boolean) {
    const dt = Math.min(delta, 50) / 1000;
    const k=this.controls,dx=Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),dy=Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown);
    if(this.active&&Phaser.Input.Keyboard.JustDown(this.escape)){this.cancel();this.opponent.setVisible(false);return;}
    this.clock += dt;
    if (this.phase === 'result' && this.clock >= this.deadline) {
      this.phase = 'idle';
      this.resultPortrait.setVisible(false); this.legendaryCard.hide();
      this.target = undefined;
      this.currentFight = undefined;
      this.hookedFish = undefined;this.specimen=undefined;
    }
    if (this.phase === 'idle') {
      this.target = this.spots.filter(spot => !spot.retired && spot.availableAt <= this.clock)
        .filter(spot => Phaser.Math.Distance.BetweenPoints(spot, this.kayak) <= FIGHT.castMax)
        .sort((a, b) => Phaser.Math.Distance.BetweenPoints(a, this.kayak) - Phaser.Math.Distance.BetweenPoints(b, this.kayak))[0];
      if (pressed && this.target && this.kayak.body!.velocity.length() <= FISHING.maxStartSpeed) {
        this.kayak.setMovementEnabled(false);
        this.phase='aiming';this.charge=0;this.castPoint={x:this.target.x,y:this.target.y};
        this.aimAngle=Math.atan2(this.target.y-this.kayak.y,this.target.x-this.kayak.x);
      }
    } else if(this.phase==='aiming'){
      this.charge=Math.min(1,this.charge+dt/FIGHT.chargeSeconds);
      if(dx||dy)this.aimAngle=Math.atan2(dy,dx);
      const range=FIGHT.castMin+(FIGHT.castMax-FIGHT.castMin)*this.charge;
      this.castPoint={x:this.kayak.x+Math.cos(this.aimAngle)*range,y:this.kayak.y+Math.sin(this.aimAngle)*range};
      if(!held){
        const target=this.spots.filter(s=>!s.retired&&s.availableAt<=this.clock&&Math.hypot(s.x-this.castPoint.x,s.y-this.castPoint.y)<FIGHT.assistRadius&&Math.hypot(s.x-this.kayak.x,s.y-this.kayak.y)<=FIGHT.castMax)
          .sort((a,b)=>Math.hypot(a.x-this.castPoint.x,a.y-this.castPoint.y)-Math.hypot(b.x-this.castPoint.x,b.y-this.castPoint.y))[0];
        if(!validWater(this.castPoint,8)||!target){this.phase='result';this.result='Quiet water · try nearer the ripples';this.resultDuration=1.2;this.deadline=this.clock+1.2;this.kayak.setMovementEnabled(true);}
        else {
          this.target=target;this.castPoint={x:target.x,y:target.y};this.fishPoint={...this.castPoint};
          this.hookedFish=this.world?this.world.commit(target as Activity)??chooseFish(conditionFishTable(eventFishTable(target.weights,target.x,target.y),this.world.conditions),this.equipment.baitLevel,this.world.random):target.required??chooseFish(target.weights,this.equipment.baitLevel);
          this.phase='casting';this.deadline=this.clock+FISHING.castDuration;this.scene.events.emit('river-cue','cast',.45);
        }
      }
    } else if (this.phase === 'casting' || this.phase === 'waiting') {
      if (this.clock >= this.deadline) {
        if (this.phase === 'casting') {
          this.phase = 'waiting';
          this.deadline = this.clock + (FISHING.minBiteDelay + (this.world?.random() ?? Math.random()) * (FISHING.maxBiteDelay - FISHING.minBiteDelay)) * (this.target?.kind === 'busy' ? .55 : 1);
          this.splash(this.target!);
        } else {
          this.phase = 'hooked';
          this.conditionQuality = this.world ? catchQuality(this.hookedFish!, this.world.conditions) * (waterDepth(this.target!.x,this.target!.y)==='deep'?1.12:1) : 1;
          this.specimen=rollSpecimen(this.hookedFish!,this.equipment.baitLevel,this.world?.random??Math.random,eventQuality(this.target!.x,this.target!.y)*(pocketAt(this.target!.x,this.target!.y)?.quality??1)*this.conditionQuality*WATER_SIGNS[this.target!.sign??'calm'].quality*(this.target!.kind==='trophy'?DYNAMIC.trophyBonus:1));
          const interaction=interactionAt(this.target!.x,this.target!.y);
          const fight=specimenFight(this.equipment.fightFor(this.hookedFish!),this.specimen.size);
          // Bounded pressure: shelter remains valuable without changing fight rules mid-catch.
          const flow=this.kayak.waterFlow;
          if(flow&&!this.kayak.anchored&&interaction?.type!=='eddy')fight.struggleStrength*=1+Math.min(.1,Math.hypot(flow.x,flow.y)/600);
          if(interaction?.type==='eddy'){fight.struggleStrength*=1-.12*interaction.strength;fight.snapTolerance+=.15*interaction.strength;}
          if(activeEvent(this.target!.x,this.target!.y)?.id==='calm'){fight.struggleStrength*=.9;fight.snapTolerance+=.15;}
          this.currentFight = new FishFight(fight, this.world?.random ?? Math.random, this.equipment.recoveryRate);
          this.currentFight.distance=Math.max(24,Math.min(105,Math.hypot(this.castPoint.x-this.kayak.x,this.castPoint.y-this.kayak.y)));
          this.struggleSplashTime = 0;
          this.splash(this.target!, 0xc0dce0, 1.4);
          this.scene.events.emit('river-cue', 'bite', .6);
        }
      }
    } else if (this.phase === 'hooked') {
      const fight = this.currentFight!;
      const previousPhase = fight.struggle.phase;
      fight.controlAngle=Math.atan2(this.fishPoint.y-this.kayak.y,this.fishPoint.x-this.kayak.x);
      const follow=dx||dy?Math.cos(Math.atan2(dy,dx)-fight.controlAngle):0;
      fight.update(dt,held,follow,pressed);
      const base=Math.atan2(this.castPoint.y-this.kayak.y,this.castPoint.x-this.kayak.x);
      const angle=base+Math.sin(fight.struggle.angle)*.55;
      const next={x:this.kayak.x+Math.cos(angle)*fight.distance,y:this.kayak.y+Math.sin(angle)*fight.distance};
      if(validWater(next,8,false))this.fishPoint=next;
      this.kayak.rotation+=Phaser.Math.Angle.Wrap(angle+Math.PI/2-this.kayak.rotation)*dt*.5;

      if (fight.tension > fight.safeHigh) this.scene.events.emit('river-cue', 'warning', .3);
      this.struggleSplashTime += dt;
      const burst = fight.struggle.phase === 'burst';
      if ((burst && previousPhase !== 'burst') || (fight.struggle.phase === 'pull' && this.struggleSplashTime > .65)) {
        this.splash(this.fishPoint, 0x9dc5cc, burst ? 1.6 : .7);
        this.struggleSplashTime = 0;
      }
      if (fight.outcome === 'landed') this.finish(true);
      else if (fight.outcome === 'escaped') this.finish(false, 'Line loose · fish escaped');
      else if (fight.outcome === 'snapped') this.finish(false, 'Line snapped');
    }
    this.draw(dt);
  }

  private draw(dt: number) {
    const g = this.graphics.clear();
    while (this.shadows.length < this.spots.length * 5) this.shadows.push(this.scene.add.image(0, 0, ATLAS, ASSETS['fish-spot']).setDepth(1).setAlpha(.9));
    while (this.shadows.length > this.spots.length * 5) this.shadows.pop()!.destroy();
    this.activityGulls.forEach(bird=>bird.setVisible(false));let gullCount=0;
    for (const [index, spot] of this.spots.entries()) {
      const visitor = this.world?.visitorAt(spot as Activity);
      const sign = spot.sign ?? 'calm', signal = WATER_SIGNS[sign];
      const school=spot.school, count=school?.count??1;
      const lit=this.lanternStrength>0&&Math.hypot(spot.x-this.kayak.x,spot.y-this.kayak.y)<this.equipment.value('lantern');
      const phase=school&&school.pause<=0?Math.floor(this.clock*4*signal.speed)%3:1;
      for(let fish=0;fish<5;fish++){
        const shadow=this.shadows[index*5+fish];
        shadow.setVisible(!spot.retired&&spot.availableAt<=this.clock&&fish<count);
        if(fish>=count)continue;
        const angle=school?.heading??0, spread=school?.spread??0;
        const along=fish===0?0:-8-Math.floor((fish-1)/2)*13;
        const side=fish===0?0:(fish%2?1:-1)*(10+spread*2);
        const dx=along*Math.cos(angle)-side*Math.sin(angle),dy=along*Math.sin(angle)+side*Math.cos(angle);
        shadow.setFrame(ASSET_FRAMES['water-shadow'][signal.frame*3+(phase+fish)%3]).clearTint().setAlpha(interactionAt(spot.x,spot.y)?.type==='shelf'?.38:lit?1:waterDepth(spot.x,spot.y)==='shallow'?.9:waterDepth(spot.x,spot.y)==='deep'?.65:.8)
          .setAlpha(shadow.alpha*(lit?Math.max(.8,this.weatherClarity):this.weatherClarity)).setScale(1).setRotation(angle).setPosition(Math.round(spot.x+dx),Math.round(spot.y+dy));
      }
      if(spot.retired||spot.availableAt>this.clock)continue;
      if ((visitor || sign === 'shimmer') && Math.hypot(spot.x-this.kayak.x,spot.y-this.kayak.y)<130 && !this.announced.has(spot)) {
        this.announced.add(spot); this.scene.events.emit('river-cue',visitor && FISH[visitor].rarity==='legendary'?'legendary-near':'rare-near',.22);
      }
      const sway = Math.round(Math.sin(this.clock * (signal?.speed ?? 1.4) + spot.x) * (signal?.sway ?? 2));

      if (sign === 'shimmer') {
        const spread=14+Math.floor((Math.sin(this.clock*signal.speed)+1)*5);
        g.fillStyle(0xc0dce0,.38);
        g.fillRect(spot.x-spread,spot.y+7,5,1);g.fillRect(spot.x+spread-3,spot.y+6,5,1);
        g.fillRect(spot.x-6+sway,spot.y+4,7,1);
      }
      if (sign === 'birds' && (!this.world || animalActivity('bird',this.world.conditions) > .2)) {
        // Proper native gull flight frames, on broad uneven passes rather than
        // little rectangular wing marks rotating around a fishing marker.
        for(let b=0;b<2;b++){
          const t=this.clock*.38+b*2.4+spot.x*.01;
          const x=spot.x+Math.cos(t)*48,y=spot.y-28+Math.sin(t*2)*13;
          const heading=Math.atan2(26*Math.cos(t*2),-48*Math.sin(t));
          const dirs=['E','SE','S','SW','W','NW','N','NE'];
          const direction=dirs[(Math.round(heading/(Math.PI/4))+8)%8];
          let bird=this.activityGulls[gullCount];
          if(!bird){bird=this.scene.add.image(x,y,ATLAS,ASSETS.bird).setDepth(2.6);this.activityGulls.push(bird);}
          gullCount++;
          bird.setFrame(`bird/${direction}/walk/${Math.floor(this.clock*6+b)%4}`)
            .setPosition(Math.round(x),Math.round(y)).setRotation(0).setScale(1).setAlpha(.9).setVisible(true);
        }
      }
      for (let i = 0; i < (signal?.bubbles ?? (spot.kind === 'busy' ? 5 : 3)); i++) {
        const cycle = (this.clock * .55 + i / 3) % 1;
        g.fillStyle(0x9cc6cd, (1 - cycle) * .72);
        const bx = spot.x - (signal.bubbles-1)*4 + i * 8, by = spot.y - Math.floor(cycle * 12);
        g.fillRect(bx, by, 2, 2);
        // Broken pixel arcs spread from surfacing bubbles, never a marker ring.
        const radius = 3 + Math.floor(cycle * 9);
        g.fillStyle(0x72a4b3, (1 - cycle) * .38);
        g.fillRect(bx - radius, by + 2, 3, 1);
        g.fillRect(bx + radius - 2, by + 1, 3, 1);
        g.fillRect(bx - 2, by + Math.floor(radius * .45), 4, 1);
      }
    }
    if(this.phase==='aiming'){
      const x=Math.round(this.castPoint.x),y=Math.round(this.castPoint.y);
      g.fillStyle(validWater(this.castPoint,8)?0xc0dce0:0xcc8154,.7).fillRect(x-3,y,7,1).fillRect(x,y-3,1,7);
      g.lineStyle(1,0xc0dce0,.3).lineBetween(this.kayak.x,this.kayak.y,x,y);
    }
    this.opponent.setVisible(this.phase==='hooked');
    if(this.phase==='hooked'){this.opponent.setPosition(Math.round(this.fishPoint.x),Math.round(this.fishPoint.y)).setRotation(this.currentFight!.struggle.angle).setFrame(ASSET_FRAMES['water-shadow'][((FISH[this.hookedFish!].baseKg>4||isTrophy(this.specimen?.size))?3:0)+Math.floor(this.clock*5)%3]).setAlpha(.9);}
    const active = this.phase === 'casting' || this.phase === 'waiting' || this.phase === 'hooked';
    if (active && this.target) {
      const progress = this.phase === 'casting' ? 1 - (this.deadline - this.clock) / FISHING.castDuration : 1;
      const fight = this.phase === 'hooked' ? this.currentFight : undefined;
      const rodAngle = Math.atan2(this.target.y - this.kayak.y, this.target.x - this.kayak.x);
      const bend = fight ? fight.tension * 3 : 0;
      const handX = this.kayak.x + this.kayak.displayWidth * 5 / 32, handY = this.kayak.y - this.kayak.displayHeight * 5 / 40;
      const fromX = Math.round(handX + Math.cos(rodAngle) * (14 - bend));
      const fromY = Math.round(handY + Math.sin(rodAngle) * (14 - bend));
      const rodMidX = Math.round((handX + fromX) / 2 - Math.sin(rodAngle) * bend);
      const rodMidY = Math.round((handY + fromY) / 2 + Math.cos(rodAngle) * bend);
      g.lineStyle(1, [0xb08d63, 0xcc8154, 0x9dc5cc, 0xf5d990][this.equipment.gear.rod], 1).lineBetween(handX, handY, rodMidX, rodMidY).lineBetween(rodMidX, rodMidY, fromX, fromY);
      // A fitted reel and grip distinguish the carried rod models in the world.
      if(this.equipment.gear.rod){
        g.fillStyle(this.equipment.gear.rod===3?0xf5d990:0x9dc5cc).fillRect(Math.round(handX)-2,Math.round(handY)+1,3,3);
        g.fillStyle(0x233e49).fillRect(Math.round(handX)-1,Math.round(handY)+2,1,1);
      }
      const pull = fight ? Math.min(6, fight.struggle.force * 35) : 0;
      const x = Math.round(Phaser.Math.Linear(fromX, fight?this.fishPoint.x:this.castPoint.x, progress) + Math.cos(fight?.struggle.angle ?? 0) * pull);
      const y = Math.round(Phaser.Math.Linear(fromY, fight?this.fishPoint.y:this.castPoint.y, progress) - Math.sin(progress * Math.PI) * 12 + Math.sin(fight?.struggle.angle ?? 0) * pull);
      const slack = fight ? (1 - fight.tension) * 12 : 3;
      const midX = Math.round((fromX + x) / 2), midY = Math.round((fromY + y) / 2 + slack);
      const lineColor = fight && fight.tension > fight.safeHigh ? 0xcc8154 : this.equipment.gear.rod ? 0xc0dce0 : 0xd0c7a8;
      g.lineStyle(1, lineColor, .8).lineBetween(Math.round(fromX), Math.round(fromY), midX, midY).lineBetween(midX, midY, x, y);
      const dip = this.phase === 'hooked' ? 3 : Math.round(Math.sin(this.clock * 5));
      g.fillStyle(this.phase === 'hooked' ? 0xefb56c : 0xe1eeeb).fillRect(x - 1, y - 2 + dip, 3, 3);
      g.fillStyle(0xc47551).fillRect(x - 1, y + 1 + dip, 3, 2);
    }
    this.splashes = this.splashes.filter(splash => splash.age < .4);
    for (const splash of this.splashes) {
      splash.age += dt;
      const radius = 3 + splash.age * 22 * splash.strength;
      g.fillStyle(splash.color, Math.max(0, 1 - splash.age / .4));
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const arc = Math.sin(splash.age / .4 * Math.PI) * 3;
        g.fillRect(Math.round(splash.x + Math.cos(angle) * radius), Math.round(splash.y + Math.sin(angle) * radius * .6 - arc), 2, 2);
      }
    }
    if (this.catchFlash) {
      const flash = this.catchFlash; flash.age += dt;
      const t = Math.min(1, flash.age / .55);
      const x = Math.round(Phaser.Math.Linear(flash.x, this.kayak.x, t));
      const y = Math.round(Phaser.Math.Linear(flash.y, this.kayak.y, t) - Math.sin(t * Math.PI) * 14);
      g.fillStyle(flash.color, 1 - t * .6).fillRect(x - 4, y - 1, 8, 3);
      g.fillRect(x + 4, y - 2, 2, 5);
      g.fillStyle(0xf1f1df, 1 - t).fillRect(x - 2, y - 1, 3, 1);
      if (t === 1) this.catchFlash = undefined;
    }
    let label = '';
    if (this.phase === 'result' && !this.legendaryCard.visible) label = this.result;

    else if (this.phase === 'idle' && this.target && this.showIdleHint) {
      label = this.kayak.body!.velocity.length() > FISHING.maxStartSpeed ? 'Slow down to fish' : 'Hold E / SPACE · aim & cast';
    }
    if(this.phase==='aiming')label=`Arrows / WASD · aim · release to cast ${Math.round(this.charge*100)}%`;
    this.hint.setText(label).setVisible(!!label)
      .setColor(this.phase === 'result' ? this.resultColor : '#edf7f4')
      .setPosition(Math.round(this.kayak.x), Math.round(this.kayak.y - 26 - (this.phase === 'result' ? (1 - (this.deadline - this.clock) / this.resultDuration) * 5 : 0)));
    this.legendaryCard.update(this.kayak.x,this.kayak.y,Math.max(0,this.deadline-this.clock));
    this.resultPortrait.setPosition(Math.round(this.kayak.x), this.hint.y - this.hint.height - 19);
    this.ui.draw(this.phase === 'hooked' ? this.currentFight : undefined, this.kayak.x, this.kayak.y);
  }
}
