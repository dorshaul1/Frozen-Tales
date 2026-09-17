import {FRESHNESS} from './freshness';
import { rollSpecimen,isTrophy,type SpecimenSize } from '../fishing/specimens';
import { type EncounterMemory } from '../fishing/rareFish';
import { CARGO } from '../tuning';
import { type FishId, type Rarity } from '../fishing/data';

export interface CaughtFish {
  caughtAt?:number; freshAge?:number; freshnessAt?:number;
  readonly size?: SpecimenSize;
  readonly type: FishId;
  readonly weightKg: number;
  readonly rarity: Rarity;
  readonly value: number;
  readonly personalRecord: boolean;
}
export type CatchRecords = Partial<Record<FishId, number>>;

export class Cargo {
  clock=()=>0;
  age(now:number,insulated:boolean){for(const fish of this.fish){fish.caughtAt??=now;fish.freshAge=(fish.freshAge??0)+Math.max(0,now-(fish.freshnessAt??now))*(insulated?FRESHNESS.insulatedRate:1);fish.freshnessAt=now;}}
  constructor(private slots = CARGO.capacity, private fish: CaughtFish[] = [], readonly records: CatchRecords = {}, readonly encounters: EncounterMemory = {}, readonly trophies:Partial<Record<FishId,number>> = {}) {}
  get capacity() { return this.slots; }
  setCapacity(capacity:number) { this.slots = capacity; }
  expand(capacity: number) { this.slots = Math.max(this.slots, capacity); }
  get entries(): readonly CaughtFish[] { return this.fish; }
  get count() { return this.fish.length; }
  get full() { return this.count >= this.capacity; }
  marketValue = (fish: CaughtFish) => fish.value;
  get totalValue() { return this.fish.reduce((sum, fish) => sum + this.marketValue(fish), 0); }

  add(type: FishId, bait = 0, random = Math.random, quality = 1): boolean {
    if (this.full) return false;
    this.fish.push(this.createCatch(type, bait, random, quality));
    return true;
  }

  store(fish: CaughtFish) { if(this.full) return false; this.fish.push(fish); return true; }

  createCatch(type: FishId, bait = 0, random = Math.random, quality = 1): CaughtFish {
    return this.land(rollSpecimen(type,bait,random,quality));
  }
  land(fish:CaughtFish):CaughtFish {
    const personalRecord=fish.weightKg>(this.records[fish.type]??0);
    if(personalRecord)this.records[fish.type]=fish.weightKg;
    if(isTrophy(fish.size))this.trophies[fish.type]=(this.trophies[fish.type]??0)+1;
    return {...fish,personalRecord,caughtAt:this.clock(),freshnessAt:this.clock(),freshAge:0};
  }

  remove(index: number): CaughtFish[] {
    return Number.isInteger(index) && index >= 0 && index < this.count ? this.fish.splice(index, 1) : [];
  }
  unload(): CaughtFish[] { const sold = this.fish; this.fish = []; return sold; }
}
