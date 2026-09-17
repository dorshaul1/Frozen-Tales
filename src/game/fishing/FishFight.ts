import { TENSION } from '../tuning';
import type { FishDifficulty } from './difficulty';
import { FishStruggle } from './FishStruggle';
import { FIGHT,FIGHT_TIERS,FIGHT_PROFILES } from './fightBalance';
export class FishFight {
 readonly struggle:FishStruggle;
 readonly safeLow:number; readonly safeHigh:number;
 readonly maxStamina:number;
 stamina:number; distance:number;
 tension=TENSION.startingTension;
 progress=0; looseTime=0;snapTime=0;elapsed=0;
 windTime=0;
 controlAngle=0;
 landingTime=0; secondWind=false;
 outcome:'fighting'|'landed'|'escaped'|'snapped'='fighting';
 constructor(readonly data:FishDifficulty,random:()=>number=Math.random,readonly recoveryRate=TENSION.dangerRecovery){
  this.struggle=new FishStruggle(data,random);this.safeLow=.5-data.safeTensionWidth/2;this.safeHigh=.5+data.safeTensionWidth/2;
  this.maxStamina=FIGHT_TIERS[data.difficulty].stamina*(data.staminaMultiplier??1);this.stamina=this.maxStamina;this.distance=FIGHT_TIERS[data.difficulty].distance;
 }
 get progressRatio(){return 1-this.stamina/this.maxStamina;}
 get readyToLand(){return this.stamina<=.01&&this.distance<=FIGHT.landDistance;}
 get running(){return this.struggle.phase==='pull'||this.struggle.phase==='burst';}
 update(delta:number,reeling:boolean,following=0,land=false){
  if(this.outcome!=='fighting')return;
  if(this.readyToLand&&land){this.outcome='landed';return;}
  let remaining=Math.min(delta,.1);
  while(remaining>0&&this.outcome==='fighting'){
   const dt=Math.min(remaining,1/120);remaining-=dt;this.elapsed+=dt;this.windTime=Math.max(0,this.windTime-dt);
   this.struggle.update(dt);
   if(this.readyToLand){this.landingTime+=dt;if(this.landingTime>FIGHT.landingWindow){this.distance=24;this.stamina=this.maxStamina*.08;this.landingTime=0;}continue;}
   const profile=FIGHT_PROFILES[this.data.personality??'rhythmic'],tier=FIGHT_TIERS[this.data.difficulty];
   const energy=.25+.75*this.stamina/this.maxStamina,force=this.struggle.force*energy;
   const follow=Math.max(-1,Math.min(1,following));
   const pressure=reeling?FIGHT.reelPressure+force*(this.running?1.8:.5)-follow*FIGHT.followRelief:-FIGHT.releasePressure+force*.3;
   this.tension=Math.max(0,Math.min(1,this.tension+pressure*dt));
   const low=this.tension<this.safeLow,high=this.tension>this.safeHigh;
   this.looseTime=low?this.looseTime+dt:Math.max(0,this.looseTime-dt*this.recoveryRate);
   this.snapTime=high?this.snapTime+dt:Math.max(0,this.snapTime-dt*this.recoveryRate);
   if(!low&&!high){
    this.stamina=Math.max(0,this.stamina-dt*tier.tire*(.85+Math.max(0,follow)*.45)*(this.running&&reeling?.55:1));
    const efficiency=this.running?Math.max(.12,1-force*3):1;
    const reelBonus=1+(this.recoveryRate/TENSION.dangerRecovery-1)*.3;
    if(reeling)this.distance-=dt*FIGHT.baseReel*efficiency*profile.reel*reelBonus*(1+Math.max(0,follow)*.35);
   }
   if(this.running)this.distance+=dt*FIGHT.runDistance*force*profile.run*(1-Math.max(0,follow)*.35);
   this.distance=Math.max(10,Math.min(105,this.distance));
   if(!this.secondWind&&profile.secondWind>0&&this.stamina<this.maxStamina*.35){this.secondWind=true;this.windTime=1.2;this.stamina+=this.maxStamina*profile.secondWind;this.distance=Math.min(105,this.distance+8);}
   this.progress=this.progressRatio*this.data.progressRequired;
   if(this.looseTime>=this.data.escapeTolerance)this.outcome='escaped';
   else if(this.snapTime>=this.data.snapTolerance)this.outcome='snapped';
  }
 }
}
