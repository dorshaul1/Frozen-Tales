import { FISH, type FishId } from '../fishing/data';
import type { CaughtFish, CatchRecords } from '../player/Cargo';
import { AREA_SPAWNS } from '../world/spawnRules';

export const MARKET = { high: [1.2, 1.3], low: .9, lowChance: .35, history: 2 };
export interface MarketState { day: number; rates: Partial<Record<FishId, number>>; recent: FishId[] }
// Only ordinary, discovered species enter demand. Special catches still sell normally.
const ordinary = new Set(Object.values(AREA_SPAWNS).flatMap(a=>Object.keys(a.fish)));
export class DailyMarket {
  state: MarketState = {day:0,rates:{},recent:[]};
  constructor(saved?:unknown) {
    const s=saved as MarketState|undefined;
    if(!s||!Number.isInteger(s.day)||s.day<1)return;
    this.state.day=s.day;
    for(const [id,rate] of Object.entries(s.rates??{}))if(id in FISH&&[1.2,1.3,.9].includes(rate))this.state.rates[id as FishId]=rate;
    this.state.recent=Array.isArray(s.recent)?s.recent.filter(id=>id in FISH).slice(-MARKET.history):[];
  }
  newDay(day:number,records:CatchRecords,random=Math.random) {
    if(day===this.state.day)return false;
    const eligible=(Object.keys(records) as FishId[]).filter(id=>records[id]&&ordinary.has(id));
    const fresh=eligible.filter(id=>!this.state.recent.includes(id));
    const choices=fresh.length?fresh:eligible.filter(id=>id!==this.state.recent.at(-1));
    const high=choices[Math.floor(random()*choices.length)];
    const rates:MarketState['rates']={};
    if(high)rates[high]=MARKET.high[Math.floor(random()*MARKET.high.length)];
    const lows=eligible.filter(id=>id!==high);
    if(lows.length&&random()<MARKET.lowChance)rates[lows[Math.floor(random()*lows.length)]]=MARKET.low;
    this.state={day,rates,recent:[...this.state.recent,...(high?[high]:[])].slice(-MARKET.history)};return true;
  }
  rate(id:FishId){return this.state.rates[id]??1;}
  price(fish:Pick<CaughtFish,'type'|'value'>){return Math.max(1,Math.round(fish.value*this.rate(fish.type)));}
  label(id:FishId){const r=this.rate(id);return r>1?`↑ High +${Math.round((r-1)*100)}%`:r<1?'↓ Low -10%':'– Normal';}
}
