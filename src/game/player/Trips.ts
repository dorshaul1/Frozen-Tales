import type {CaughtFish} from './Cargo';
import {isTrophy} from '../fishing/specimens';
export interface Trip {start:number;caught:number;earnings:number;rare:number;records:number;freshness:number;biggest?:CaughtFish;valuable?:CaughtFish;valuablePrice:number}
export interface TripState {active?:Trip;lifetime:{caught:number;earnings:number;trips:number;rare:number;biggest?:CaughtFish}}
export class Trips {
 state:TripState;
 constructor(saved?:unknown){const s=saved as TripState|undefined;this.state=s&&s.lifetime&&Number.isFinite(s.lifetime.caught)?s:{lifetime:{caught:0,earnings:0,trips:0,rare:0}};}
 start(now:number){this.state.active??={start:now,caught:0,earnings:0,rare:0,records:0,freshness:0,valuablePrice:0};}
 catch(f:CaughtFish,now:number){this.start(now);const a=this.state.active!,l=this.state.lifetime,rare=isTrophy(f.size)||['rare','legendary'].includes(f.rarity);a.caught++;l.caught++;if(rare){a.rare++;l.rare++;}if(f.personalRecord)a.records++;if(!a.biggest||f.weightKg>a.biggest.weightKg)a.biggest=f;if(!l.biggest||f.weightKg>l.biggest.weightKg)l.biggest=f;}
 sell(fish:CaughtFish[],earned:number,empty:boolean,now:number,price:(f:CaughtFish)=>number,base:(f:CaughtFish)=>number){
  this.state.lifetime.earnings+=earned;const a=this.state.active;if(!a)return;
  a.earnings+=earned;
  for(const f of fish){const value=price(f);a.freshness+=value-base(f);if(value>a.valuablePrice){a.valuablePrice=value;a.valuable=f;}}
  if(!empty)return;
  this.state.lifetime.trips++;this.state.active=undefined;return {...a,duration:Math.max(0,now-a.start)};
 }
}
