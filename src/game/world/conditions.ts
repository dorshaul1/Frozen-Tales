import { FISH, type FishId, type FishTable } from '../fishing/data';
import type { AnimalId } from './spawnRules';

export const PHASES = ['morning', 'day', 'evening', 'night'] as const;
export type TimePhase = typeof PHASES[number];
export const WEATHER = {
  clear: { name: 'Clear', chance: 52, flakes: 0, wind: 2, water: 1, rare: 1, tint: 0xffffff },
  'light-snow': { name: 'Light Snow', chance: 27, flakes: 12, wind: 7, water: 1.1, rare: 1.15, tint: 0xf0f5ff },
  'heavy-snow': { name: 'Heavy Snow', chance: 7, flakes: 260, wind: 42, water: 1.5, rare: 1.3, tint: 0xd7e3f2 },
  rain: {name:'Rain',chance:8,flakes:0,wind:20,water:1.7,rare:1.1,tint:0xb5c3cf},
  windy: { name: 'Windy', chance: 14, flakes: 7, wind: 32, water: 1.9, rare: 1.1, tint: 0xebf2fa },
  aurora: { name: 'Aurora Night', chance: 0, flakes: 2, wind: 3, water: 1, rare: 3, tint: 0xd1ffe9 },
} as const;
export type WeatherId = keyof typeof WEATHER;
export interface Conditions { phase: TimePhase; weather: WeatherId }
export interface EnvironmentSave { forecast?: WeatherId[]; day?: number; elapsed: number; weather: WeatherId; remaining: number; seed: number }
export const ENVIRONMENT = { phaseSeconds: 180, transitionSeconds: 30, weatherDuration: [180, 300] as const, auroraChance: .12, saveInterval: 10, maxCatchQuality: 1.4 };
export const LIGHTING: Record<TimePhase, { tint: number; night: number }> = {
  morning: { tint: 0xfff1dc, night: .12 }, day: { tint: 0xffffff, night: 0 },
  evening: { tint: 0xdbb9bd, night: .45 }, night: { tint: 0x91aed7, night: 1 },
};
type Preference = { time?: Partial<Record<TimePhase, number>>; weather?: Partial<Record<WeatherId, number>> };
export const FISH_CONDITIONS: Record<FishId, Preference & { hint: string; weight?: Partial<Record<WeatherId, number>> }> = {
 dace:{time:{evening:1.3},hint:'Favors shallow banks.'},
 perch:{time:{morning:1.3},hint:'Favors shallow banks.'},
 chub:{time:{evening:1.3},hint:'Favors deeper water.'},
 pickerel:{time:{morning:1.3},hint:'Favors deeper water.'},
 sucker:{time:{evening:1.3},hint:'Favors deeper water.'},
 whitebass:{time:{morning:1.3},hint:'Favors deeper water.'},
 bream:{time:{evening:1.3},hint:'Favors deeper water.'},
 huchen:{time:{morning:1.3},hint:'Favors deeper water.'},
 taimen:{time:{evening:1.3},hint:'Favors deeper water.'},
 sculpin:{time:{morning:1.3},hint:'Favors deeper water.'},
 eel:{time:{evening:1.3},hint:'Favors deeper water.'},
 lanternfin:{time:{morning:1.3},hint:'Favors deeper water.'},

  smelt:{time:{morning:1.5,day:1.2},hint:'Schooling in the shallow Starting River at dawn.'},
  ember:{hint:'Rocky shallows of the Starting River on clear evenings.'},
  sturgeon:{time:{morning:1.2,evening:1.3},hint:'Deep rocky water beneath Frozen Lake.'},
  cisco:{time:{night:1.2},hint:'Lantern Hollow, beneath its dark ice roof.'},
  glasschar:{weather:{aurora:1.35},hint:'Blueglass Cavern and deep underground pools.'},
  veil:{hint:'Deep inside Echo Vault, in any weather or time.'},
  grayling: { hint: 'Blue Ice Bend after dark. Watch for silver ripples.' },
  burbot: { hint: 'Frozen Lake beneath falling snow. A quiet shadow can hide a sudden pull.' },
  crown: { hint: 'Frozen Lake, at night under clear stars or an aurora. Follow the broad wake; keep searching while conditions hold.' },
  whitefish: { time: { morning: 1.5, day: 1.2, night: .8 }, hint: 'Most active in the morning and daytime.' },
  char: { time: { evening: 1.4, night: 1.2 }, weather: { 'light-snow': 1.5, 'heavy-snow': 1.6 }, weight: { 'heavy-snow': 1.08 }, hint: 'Favors falling snow, especially toward evening.' },
  dolly:{time:{morning:1.4},hint:'Rocky gorge pockets at dawn are promising.'},
  lenok:{time:{evening:1.4},weather:{windy:1.3},hint:'Deep gorge channels, especially at dusk or in wind.'},
  sleeper:{time:{night:1.3},weather:{'light-snow':1.3},hint:'Glacier Gorge after dark. Watch its deep rock pockets.'},
  salmon: { time: { morning: 1.25, evening: 1.5 }, weather: { windy: 1.4 }, weight: { windy: 1.06 }, hint: 'Watch for salmon at dawn or dusk, and in wind.' },
  pike: { time: { evening: 1.4, night: 1.6 }, weather: { 'light-snow': 1.2 }, hint: 'Hunts more often at dusk and after nightfall.' },
  trout: { time: { night: 1.8 }, weather: { 'heavy-snow': 1.4, aurora: 1.8 }, weight: { aurora: 1.12 }, hint: 'Night and heavy snow draw trout. Aurora nights favor larger fish.' },
};
export const ANIMAL_CONDITIONS: Record<AnimalId, Preference> = {
 'musk-ox':{time:{morning:1.3,night:.35},weather:{'heavy-snow':.7}},
 wolf:{time:{day:.4,evening:1.4,night:1.5},weather:{'heavy-snow':.5}},
 wolverine:{time:{day:.5,evening:1.5,night:1.2},weather:{'heavy-snow':.4}},
 raven:{time:{morning:1.4,night:.1},weather:{'heavy-snow':.2,windy:.6}},
 fox:{time:{evening:1.5,night:1.3},weather:{'heavy-snow':.5}},
 hare:{time:{morning:1.4,night:.5},weather:{'heavy-snow':.4}},
 reindeer:{time:{morning:1.3,night:.4},weather:{'heavy-snow':.5,windy:.7}},
 otter:{time:{day:1.4,night:.4},weather:{clear:1.4,'heavy-snow':.2}},
 owl:{time:{day:.2,morning:.4,night:2,evening:1.5},weather:{'heavy-snow':0,windy:.4}},
  penguin: { time: { morning: 1.2, night: .8 }, weather: { 'heavy-snow': .7 } },
  seal: { time: { day: 1.2 }, weather: { clear: 1.5, aurora: 1.5, windy: .5, 'heavy-snow': .4 } },
  'polar-bear': { time: { evening: 1.4, night: 1.5 }, weather: { 'heavy-snow': 1.8, aurora: 1.3 } },
  bird: { time: { morning: 1.4, evening: .6, night: .1 }, weather: { 'heavy-snow': 0, windy: .4 } },
};
const preference = (rule: Preference, c: Conditions) => (rule.time?.[c.phase] ?? 1) * (rule.weather?.[c.weather] ?? 1);
export const animalActivity = (id: AnimalId, c: Conditions) => preference(ANIMAL_CONDITIONS[id], c);
export function conditionFishTable(table: FishTable, c: Conditions): FishTable {
  return Object.fromEntries(Object.entries(table).map(([key, value]) => {
    const id = key as FishId;
    const rarity = FISH[id].rarity === 'rare' && c.weather === 'aurora' ? 1.35 : 1;
    return [id, value * preference(FISH_CONDITIONS[id], c) * rarity];
  })) as FishTable;
}
export const catchQuality = (id: FishId, c: Conditions) => (FISH_CONDITIONS[id].weight?.[c.weather] ?? 1) * (c.weather === 'aurora' ? 1.06 : 1);
export function environmentSave(value?: Partial<EnvironmentSave>): EnvironmentSave {
  return {
    forecast: value?.forecast?.length===4 && value.forecast.every(id=>Object.hasOwn(WEATHER,id)) ? [...value.forecast] : undefined,
    day: Number.isSafeInteger(value?.day) && value!.day! >= 0 ? value!.day! : 0,
    elapsed: Number.isFinite(value?.elapsed) && value!.elapsed! >= 0 ? value!.elapsed! % (ENVIRONMENT.phaseSeconds * 4) : 90,
    weather: value?.weather && Object.hasOwn(WEATHER, value.weather) ? value.weather : 'clear',
    remaining: Number.isFinite(value?.remaining) && value!.remaining! > 0 ? Math.min(300, value!.remaining!) : 220,
    seed: Number.isInteger(value?.seed) ? value!.seed! >>> 0 : (Math.random() * 0xffffffff) >>> 0,
  };
}
// One small clock; no calendar or offline catch-up. Weather RNG survives refresh.
export class Environment {
  private state: EnvironmentSave;
  constructor(saved?: Partial<EnvironmentSave>) {
    this.state = environmentSave(saved);
    if(!this.state.forecast)this.makeForecast();
    if (this.state.weather === 'aurora' && this.phase !== 'night') this.state.weather = 'clear';
  }
  get totalSeconds(){return this.day*ENVIRONMENT.phaseSeconds*4+this.state.elapsed;}
  get day() { return this.state.day ?? 0; }
  get phase(): TimePhase { return PHASES[Math.floor(this.state.elapsed / ENVIRONMENT.phaseSeconds)]; }
  get weather() { return this.state.weather; }
  get conditions(): Conditions { return { phase: this.phase, weather: this.weather }; }
  get transition() { return Math.max(0, (this.state.elapsed % ENVIRONMENT.phaseSeconds - ENVIRONMENT.phaseSeconds + ENVIRONMENT.transitionSeconds) / ENVIRONMENT.transitionSeconds); }
  get nextPhase() { return PHASES[(PHASES.indexOf(this.phase) + 1) % 4]; }
  sleepUntilMorning() {
    this.update(ENVIRONMENT.phaseSeconds * 4 - this.state.elapsed + 30);
  }
  /** Advance the real clock; never rewind fish freshness or daily state. */
  advanceToPhase(phase:TimePhase){
    const target=PHASES.indexOf(phase)*ENVIRONMENT.phaseSeconds;
    if(target<0)throw new Error('Invalid time');
    this.update((target-this.state.elapsed+ENVIRONMENT.phaseSeconds*4)%(ENVIRONMENT.phaseSeconds*4));
    if(this.weather==='aurora'&&phase!=='night')this.setWeather('clear');
  }
  advanceToDay(day:number){
    if(!Number.isSafeInteger(day)||day<this.day||day>10000)throw new Error(`Day must be ${this.day}–10000; rewinding would invalidate daily saves.`);
    this.update((day-this.day)*ENVIRONMENT.phaseSeconds*4);
  }
  setWeather(weather:WeatherId){
    if(!Object.hasOwn(WEATHER,weather))throw new Error('Invalid weather');
    if(weather==='aurora'&&this.phase!=='night')throw new Error('Aurora requires night. Use /set-time night first.');
    this.state.weather=weather;this.state.forecast![PHASES.indexOf(this.phase)]=weather;this.state.remaining=999;
  }
  snapshot(): EnvironmentSave { return { ...this.state }; }
  private random() { this.state.seed = (this.state.seed * 1664525 + 1013904223) >>> 0; return this.state.seed / 4294967296; }
  get forecast(){return this.state.forecast!;}
  private makeForecast(){
    this.state.forecast=PHASES.map((phase)=>{
      if(phase==='night'&&this.random()<ENVIRONMENT.auroraChance)return 'aurora';
      const choices=(Object.keys(WEATHER) as WeatherId[]).filter(id=>WEATHER[id].chance>0);
      let roll=this.random()*choices.reduce((n,id)=>n+WEATHER[id].chance,0);
      return choices.find(id=>(roll-=WEATHER[id].chance)<0)??'clear';
    });
    this.state.forecast[PHASES.indexOf(this.phase)]=this.state.weather;
  }
  update(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    // Forecast windows share the clock. Timing can drift by up to 20 seconds,
    // but severe weather is never introduced outside its advertised window.
    while(seconds>0){
      const step=Math.min(seconds,ENVIRONMENT.phaseSeconds-this.state.elapsed%ENVIRONMENT.phaseSeconds);
      const before=this.phase;
      this.state.elapsed=(this.state.elapsed+step)%(ENVIRONMENT.phaseSeconds*4);seconds-=step;
      if(before!==this.phase){
        if(this.phase==='morning'){this.state.day=this.day+1;this.state.weather='clear';this.makeForecast();}
        this.state.remaining=8+this.random()*12;
      }else this.state.remaining-=step;
      if(this.state.remaining<=0){this.state.weather=this.forecast[PHASES.indexOf(this.phase)];this.state.remaining=999;}
    }
  }
}
