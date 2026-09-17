import {activeEvent} from '../world/areaEvents';
import {locationAt,caveStrength} from '../world/sideRoutes';
import { habitatAffinity } from '../world/depth';
import { FISH, chooseFish, type FishId, type FishTable } from './data';
import { conditionFishTable, type Conditions, type TimePhase, type WeatherId } from '../world/conditions';
import { areaAt, type AreaId } from '../world/spawnRules';

interface RareRule {
  signal: { color: number; bubbles: number; sway: number; speed: number };
  locations?:string[]; areas: AreaId[]; phases?: TimePhase[]; weather?: WeatherId[];
  chance: number; increase: number; guarantee: number; cooldown: number;
  weightRange: readonly [number, number]; related: FishId[]; clue: string; learned: string;
}
export const RARE_FISH: Partial<Record<FishId, RareRule>> = {
 lanternfin:{locations:['echo-vault'],areas:['gorge'],phases:['night'],signal:{color:0xf3d49a,bubbles:3,sway:2,speed:.6},chance:.12,increase:.1,guarantee:5,cooldown:3,weightRange:[.6,1.8],related:['eel','sculpin'],clue:'A pale fin lights the deepest vault after dusk.',learned:'Seek Echo Vault at night, in deep cave water.'},
 ember:{signal:{color:0xdca575,bubbles:3,sway:2,speed:1.5},areas:['starting'],phases:['evening'],weather:['clear'],chance:.16,increase:.1,guarantee:5,cooldown:2,weightRange:[.6,1.8],related:['smelt','char'],clue:'Copper fins stir near the village river as daylight fades.',learned:'Return to rocky shallows of the Starting River during a clear evening.'},
 veil:{locations:['echo-vault'],signal:{color:0xbccfe3,bubbles:4,sway:1,speed:.45},areas:['gorge'],chance:.18,increase:.13,guarantee:4,cooldown:2,weightRange:[.6,1.8],related:['glasschar','trout'],clue:'A pale barbel drifts in the far glacier’s echoing vault.',learned:'Find Echo Vault in Glacier Gorge. Its deep cave water shelters this hunter at any time.'},
  sleeper:{signal:{color:0x8bbbc3,bubbles:3,sway:1,speed:.55},areas:['gorge'],phases:['evening','night'],chance:.14,increase:.10,guarantee:5,cooldown:2,weightRange:[.55,1.8],related:['lenok','dolly'],clue:'Beyond the lake, a patient hunter stirs at dusk.',learned:'Deep rocky pockets of Glacier Gorge shelter the sleeper during evening and night.'},
  grayling: { signal: { color: 0xc0dce0, bubbles: 4, sway: 3, speed: 1.8 }, areas: ['bend'], phases: ['night'], chance: .16, increase: .10, guarantee: 5, cooldown: 2, weightRange: [.65,1.65], related: ['char','salmon'],
    clue: 'A silver sail follows the river into darkness.', learned: 'Beyond the starting river, Blue Ice Bend shelters a silver hunter after nightfall.' },
  burbot: { signal: { color: 0xa7c7a7, bubbles: 2, sway: 1, speed: .65 }, areas: ['lake'], weather: ['light-snow','heavy-snow'], chance: .14, increase: .10, guarantee: 5, cooldown: 2, weightRange: [.6,1.7], related: ['pike','trout'],
    clue: 'A mottled sleeper waits beneath falling snow.', learned: 'Seek the deep Frozen Lake while snow falls. Its stillness can be deceptive.' },
  crown: { signal: { color: 0xf3d49a, bubbles: 5, sway: 3, speed: .85 }, areas: ['lake'], phases: ['night'], weather: ['clear','aurora'], chance: .08, increase: .09, guarantee: 5, cooldown: 3, weightRange: [.75,1.55], related: ['grayling','burbot','trout'],
    clue: 'An old lake story: a pale crown beneath a sky full of light.', learned: 'Frozen Lake keeps its oldest visitor for clear, starry nights and auroras. Broad shadows stir when it hunts.' },
};
export type EncounterMemory = Partial<Record<FishId, { misses: number; cooldown: number }>>;
export interface RareSpot { x?:number; y: number; kind?: 'normal' | 'busy' | 'trophy' }
export function eligibleRare(spot: RareSpot, conditions: Conditions): FishId[] {
  return (Object.keys(RARE_FISH) as FishId[]).filter(id => {
    const rule = RARE_FISH[id]!;
    return (!rule.locations||spot.x!==undefined&&rule.locations.includes(locationAt(spot.x,spot.y)?.id??'')&&caveStrength(spot.x,spot.y)>.35) && rule.areas.includes(areaAt(spot.y,spot.x)) && (!rule.phases || rule.phases.includes(conditions.phase)) && (!rule.weather || rule.weather.includes(conditions.weather));
  });
}
export function rareClue(id: FishId, records: Partial<Record<FishId, number>>) {
  const rule = RARE_FISH[id];
  return rule ? (records[id] || rule.related.some(other => records[other]) ? rule.learned : rule.clue) : undefined;
}
/** Count only dynamic spawn evaluations in valid conditions; failed fights still get future opportunities.
 * Counters survive trips, sleep and reload. A single rare roll never empties the normal pool. */
export function selectEncounter(weights: FishTable, spot: RareSpot, conditions: Conditions, memory: EncounterMemory, bait: number, random: () => number): FishId {
  for (const id of eligibleRare(spot, conditions)) {
    const rule = RARE_FISH[id]!, state = memory[id] ??= { misses: 0, cooldown: 0 };
    if (state.cooldown > 0) { state.cooldown--; continue; }
    state.misses++;
    const hotspotBonus = spot.kind === 'trophy' ? .10 : spot.kind === 'busy' ? .05 : 0;
    if (state.misses >= rule.guarantee || random() < (spot.x!==undefined&&activeEvent(spot.x,spot.y)?.id==='cave'?1.25:1)*(rule.chance + rule.increase * (state.misses - 1) + hotspotBonus + bait * .025) * (spot.x===undefined?1:habitatAffinity(FISH[id].habitat,spot.x,spot.y))) {
      state.misses = 0; state.cooldown = rule.cooldown;
      return id;
    }
  }
  return chooseFish(conditionFishTable(weights, conditions), bait, random);
}
