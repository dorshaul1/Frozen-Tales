import { FISH_HABITATS,type FishHabitat } from './habitatData';
import type { FishDifficulty } from './difficulty';

export const RARITIES = {
  legendary: { name: 'Legendary', color: '#dac3e8', baitAttraction: 2 },
  common: { name: 'Common', color: '#c0dce0', baitAttraction: 0 },
  uncommon: { name: 'Uncommon', color: '#a7c7a7', baitAttraction: .7 },
  rare: { name: 'Rare', color: '#f3d49a', baitAttraction: 1.6 },
} as const;
export type Rarity = keyof typeof RARITIES;
export const CATCH_BALANCE = { minWeightRatio: .8, maxWeightRatio: 1.25, baitWeightBonus: .04, valueVariation: .05, resultDuration: 2.4 };

export const FISH = {
 dace:{habitat:FISH_HABITATS.dace,name:'Silver Dace',color:0x9dc5cc,value:7,weight:0,baseKg:0.7,rarity:'common',fight:{difficulty:'veryEasy',struggleStrength:.045,struggleSpeed:1.1,burstChance:.12,burstStrength:.035,directionChangeFrequency:.8,safeTensionWidth:.73,progressRequired:2.1,escapeTolerance:2,snapTolerance:1.9}},
 perch:{habitat:FISH_HABITATS.perch,name:'Yellow Perch',color:0x9dc5cc,value:10,weight:0,baseKg:1.2,rarity:'common',fight:{difficulty:'veryEasy',struggleStrength:.045,struggleSpeed:1.35,burstChance:.12,burstStrength:.035,directionChangeFrequency:1.3,safeTensionWidth:.73,progressRequired:2.1,escapeTolerance:2,snapTolerance:1.9}},
 chub:{habitat:FISH_HABITATS.chub,name:'River Chub',color:0x9dc5cc,value:16,weight:0,baseKg:2.1,rarity:'uncommon',fight:{difficulty:'medium',personality:'runner',struggleStrength:.18,struggleSpeed:1.15,burstChance:.55,burstStrength:.13,directionChangeFrequency:1.3,safeTensionWidth:.40,progressRequired:4.4,escapeTolerance:1.5,snapTolerance:1.4}},
 pickerel:{habitat:FISH_HABITATS.pickerel,name:'Chain Pickerel',color:0x9dc5cc,value:24,weight:0,baseKg:3.4,rarity:'uncommon',fight:{difficulty:'medium',personality:'burst',struggleStrength:.18,struggleSpeed:1.15,burstChance:.55,burstStrength:.13,directionChangeFrequency:1.3,safeTensionWidth:.40,progressRequired:4.4,escapeTolerance:1.5,snapTolerance:1.4}},
 sucker:{habitat:FISH_HABITATS.sucker,name:'Longnose Sucker',color:0x9dc5cc,value:29,weight:0,baseKg:4,rarity:'uncommon',fight:{difficulty:'hard',personality:'endurance',struggleStrength:.24,struggleSpeed:.65,burstChance:.2,burstStrength:.1,directionChangeFrequency:.5,safeTensionWidth:.38,progressRequired:6.2,escapeTolerance:1.6,snapTolerance:1.5}},
 whitebass:{habitat:FISH_HABITATS.whitebass,name:'Ice White Bass',color:0x9dc5cc,value:27,weight:0,baseKg:2.6,rarity:'uncommon',fight:{difficulty:'medium',personality:'erratic',struggleStrength:.15,struggleSpeed:1.1,burstChance:.35,burstStrength:.09,directionChangeFrequency:1.7,safeTensionWidth:.45,progressRequired:3.8,escapeTolerance:1.6,snapTolerance:1.5}},
 bream:{habitat:FISH_HABITATS.bream,name:'Northern Bream',color:0x9dc5cc,value:39,weight:0,baseKg:5.5,rarity:'uncommon',fight:{difficulty:'hard',personality:'endurance',struggleStrength:.24,struggleSpeed:.65,burstChance:.2,burstStrength:.1,directionChangeFrequency:.5,safeTensionWidth:.38,progressRequired:6.2,escapeTolerance:1.6,snapTolerance:1.5}},
 huchen:{habitat:FISH_HABITATS.huchen,name:'Glacier Huchen',color:0x9dc5cc,value:64,weight:0,baseKg:9,rarity:'uncommon',fight:{difficulty:'hard',personality:'burst',struggleStrength:.24,struggleSpeed:1.15,burstChance:.8,burstStrength:.17,directionChangeFrequency:1.2,safeTensionWidth:.32,progressRequired:6,escapeTolerance:1.4,snapTolerance:1.35}},
 taimen:{habitat:FISH_HABITATS.taimen,name:'River Taimen',color:0x9dc5cc,value:78,weight:0,baseKg:13,rarity:'uncommon',fight:{difficulty:'hard',personality:'endurance',struggleStrength:.24,struggleSpeed:.65,burstChance:.2,burstStrength:.1,directionChangeFrequency:.5,safeTensionWidth:.38,progressRequired:6.2,escapeTolerance:1.6,snapTolerance:1.5}},
 sculpin:{habitat:FISH_HABITATS.sculpin,name:'Cave Sculpin',color:0x9dc5cc,value:26,weight:0,baseKg:1.7,rarity:'uncommon',fight:{difficulty:'medium',personality:'erratic',struggleStrength:.15,struggleSpeed:1.1,burstChance:.35,burstStrength:.09,directionChangeFrequency:1.7,safeTensionWidth:.45,progressRequired:3.8,escapeTolerance:1.6,snapTolerance:1.5}},
 eel:{habitat:FISH_HABITATS.eel,name:'Blind Ice Eel',color:0x9dc5cc,value:69,weight:0,baseKg:4.8,rarity:'rare',fight:{difficulty:'hard',personality:'runner',struggleStrength:.22,struggleSpeed:1.25,burstChance:.6,burstStrength:.16,directionChangeFrequency:1.3,safeTensionWidth:.34,progressRequired:5.8,escapeTolerance:1.4,snapTolerance:1.35}},
 lanternfin:{habitat:FISH_HABITATS.lanternfin,name:'Lanternfin',color:0x9dc5cc,value:130,weight:0,baseKg:7,rarity:'rare',fight:{difficulty:'extreme',personality:'ambush',struggleStrength:.26,struggleSpeed:.75,burstChance:.9,burstStrength:.21,directionChangeFrequency:.75,safeTensionWidth:.28,progressRequired:7.8,escapeTolerance:1.45,snapTolerance:1.45}},
 smelt:{habitat:FISH_HABITATS.smelt,name:'River Smelt',color:0xc0dce0,value:6,weight:0,baseKg:.55,rarity:'common',fight:{difficulty:'veryEasy',struggleStrength:.045,struggleSpeed:1.1,burstChance:.12,burstStrength:.035,directionChangeFrequency:.8,safeTensionWidth:.73,progressRequired:2.1,escapeTolerance:2,snapTolerance:1.9}},
 ember:{habitat:FISH_HABITATS.ember,name:'Ember Dace',color:0xdca575,value:48,weight:0,baseKg:1.4,rarity:'rare',fight:{difficulty:'hard',personality:'erratic',struggleStrength:.16,struggleSpeed:1.35,burstChance:.6,burstStrength:.11,directionChangeFrequency:2,safeTensionWidth:.4,progressRequired:4.5,escapeTolerance:1.6,snapTolerance:1.5}},
 sturgeon:{habitat:FISH_HABITATS.sturgeon,name:'Lake Sturgeon',color:0x9dc5cc,value:46,weight:0,baseKg:9,rarity:'uncommon',fight:{difficulty:'hard',personality:'endurance',struggleStrength:.24,struggleSpeed:.65,burstChance:.2,burstStrength:.1,directionChangeFrequency:.5,safeTensionWidth:.38,progressRequired:6.2,escapeTolerance:1.6,snapTolerance:1.5}},
 cisco:{habitat:FISH_HABITATS.cisco,name:'Cave Cisco',color:0x9dc5cc,value:22,weight:0,baseKg:2.2,rarity:'uncommon',fight:{difficulty:'medium',personality:'erratic',struggleStrength:.15,struggleSpeed:1.1,burstChance:.35,burstStrength:.09,directionChangeFrequency:1.7,safeTensionWidth:.45,progressRequired:3.8,escapeTolerance:1.6,snapTolerance:1.5}},
 glasschar:{habitat:FISH_HABITATS.glasschar,name:'Glassfin Char',color:0x8bbbc3,value:52,weight:0,baseKg:5.2,rarity:'rare',fight:{difficulty:'hard',personality:'runner',struggleStrength:.22,struggleSpeed:1.25,burstChance:.6,burstStrength:.16,directionChangeFrequency:1.3,safeTensionWidth:.34,progressRequired:5.8,escapeTolerance:1.4,snapTolerance:1.35}},
 veil:{habitat:FISH_HABITATS.veil,name:'Veilfin Burbot',color:0xbdcfd8,value:155,weight:0,baseKg:11,rarity:'rare',fight:{difficulty:'extreme',personality:'ambush',struggleStrength:.26,struggleSpeed:.75,burstChance:.9,burstStrength:.21,directionChangeFrequency:.75,safeTensionWidth:.28,progressRequired:7.8,escapeTolerance:1.45,snapTolerance:1.45}},

  char: { habitat:FISH_HABITATS.char, name: 'Arctic Char', color: 0xdca575, value: 9, weight: 20, baseKg: 1.8, rarity: 'uncommon',
    fight: { difficulty: 'easy', struggleStrength: .08, struggleSpeed: 1, burstChance: .3, burstStrength: .07, directionChangeFrequency: .7, safeTensionWidth: .64, progressRequired: 2.65, escapeTolerance: 1.6, snapTolerance: 1.5 } },
  whitefish: { habitat:FISH_HABITATS.whitefish, name: 'Whitefish', color: 0xd6e7de, value: 5, weight: 75, baseKg: 1, rarity: 'common',
    fight: { difficulty: 'veryEasy', struggleStrength: .045, struggleSpeed: .85, burstChance: .15, burstStrength: .04, directionChangeFrequency: .5, safeTensionWidth: .72, progressRequired: 2.3, escapeTolerance: 1.9, snapTolerance: 1.8 } },
  salmon: { habitat:FISH_HABITATS.salmon, name: 'Salmon', color: 0xe09488, value: 14, weight: 5, baseKg: 3.2, rarity: 'rare',
    fight: { difficulty: 'medium', personality: 'runner', struggleStrength: .14, struggleSpeed: 1.15, burstChance: .45, burstStrength: .09, directionChangeFrequency: 1, safeTensionWidth: .48, progressRequired: 3.6, escapeTolerance: 1.5, snapTolerance: 1.4 } },
  pike: { habitat:FISH_HABITATS.pike, name: 'Northern Pike', color: 0xa7c7a7, value: 25, weight: 0, baseKg: 4.5, rarity: 'uncommon',
    fight: { difficulty: 'medium', personality: 'burst', struggleStrength: .19, struggleSpeed: 1.2, burstChance: .65, burstStrength: .15, directionChangeFrequency: 1.2, safeTensionWidth: .38, progressRequired: 4.3, escapeTolerance: 1.4, snapTolerance: 1.3 } },
  trout: { habitat:FISH_HABITATS.trout, name: 'Lake Trout', color: 0x8bbbc3, value: 38, weight: 0, baseKg: 6.2, rarity: 'rare',
    fight: { difficulty: 'hard', personality: 'steady', struggleStrength: .23, struggleSpeed: .85, burstChance: .3, burstStrength: .12, directionChangeFrequency: .7, safeTensionWidth: .34, progressRequired: 5.4, escapeTolerance: 1.4, snapTolerance: 1.3 } },
  grayling: { habitat:FISH_HABITATS.grayling, name: 'Moon Grayling', color: 0xbdcfd8, value: 65, weight: 0, baseKg: 2.8, rarity: 'rare',
    fight: { difficulty: 'hard', personality: 'erratic', struggleStrength: .20, struggleSpeed: 1.2, burstChance: .7, burstStrength: .17, directionChangeFrequency: 2.5, safeTensionWidth: .30, progressRequired: 6, escapeTolerance: 1.25, snapTolerance: 1.25 } },
  burbot: { habitat:FISH_HABITATS.burbot, name: 'Frost Burbot', color: 0xa7c7a7, value: 90, weight: 0, baseKg: 7, rarity: 'rare',
    fight: { difficulty: 'extreme', personality: 'ambush', struggleStrength: .24, struggleSpeed: .9, burstChance: 1, burstStrength: .20, directionChangeFrequency: .6, safeTensionWidth: .28, progressRequired: 7.2, escapeTolerance: 1.4, snapTolerance: 1.35 } },
  crown: { habitat:FISH_HABITATS.crown, name: 'The Pale Crown', color: 0xf3d49a, value: 240, weight: 0, baseKg: 18, rarity: 'legendary',
    fight: { difficulty: 'legendary', personality: 'endurance', struggleStrength: .29, struggleSpeed: .85, burstChance: .8, burstStrength: .17, directionChangeFrequency: .9, safeTensionWidth: .24, progressRequired: 10, escapeTolerance: 1.4, snapTolerance: 1.4 } },
  dolly:{habitat:FISH_HABITATS.dolly,name:'Dolly Varden',color:0xdca575,value:34,weight:0,baseKg:3.8,rarity:'uncommon',fight:{difficulty:'medium',personality:'runner',struggleStrength:.18,struggleSpeed:1.15,burstChance:.55,burstStrength:.13,directionChangeFrequency:1.3,safeTensionWidth:.40,progressRequired:4.4,escapeTolerance:1.5,snapTolerance:1.4}},
  lenok:{habitat:FISH_HABITATS.lenok,name:'Glacier Lenok',color:0x8bbbc3,value:58,weight:0,baseKg:7.5,rarity:'uncommon',fight:{difficulty:'hard',personality:'burst',struggleStrength:.24,struggleSpeed:1.15,burstChance:.8,burstStrength:.17,directionChangeFrequency:1.2,safeTensionWidth:.32,progressRequired:6,escapeTolerance:1.4,snapTolerance:1.35}},
  sleeper:{habitat:FISH_HABITATS.sleeper,name:'Gorge Sleeper',color:0xbdcfd8,value:125,weight:0,baseKg:10.5,rarity:'rare',fight:{difficulty:'extreme',personality:'ambush',struggleStrength:.25,struggleSpeed:.8,burstChance:.85,burstStrength:.2,directionChangeFrequency:.65,safeTensionWidth:.29,progressRequired:7.6,escapeTolerance:1.45,snapTolerance:1.4}},
} satisfies Record<string, { habitat:FishHabitat; name: string; color: number; value: number; weight: number; baseKg: number; rarity: Rarity; fight: FishDifficulty }>;
export type FishId = keyof typeof FISH;
export type FishTable = Partial<Record<FishId, number>>;

const nearby: FishTable = { char: FISH.char.weight, whitefish: FISH.whitefish.weight, salmon: FISH.salmon.weight };
// Relative weights: farther water offers more char/salmon. All spots are
// beyond selling range; three nearby spots keep the first outing approachable.
export const FISHING_SPOTS = [
  { x: 832, y: 1200, weights: { ...nearby } },
  { x: 904, y: 1060, weights: { ...nearby, char: 40, salmon: 20 } },
  { x: 612, y: 1430, weights: { ...nearby, char: 40, salmon: 20 } },
  { x: 880, y: 850, weights: { char: 45, whitefish: 20, salmon: 35 } },
  { x: 660, y: 1530, weights: { char: 45, whitefish: 20, salmon: 35 } },
  { x: 760, y: 1920, weights: { whitefish: 45, char: 30, salmon: 20, pike: 5 } },
  { x: 950, y: 2400, weights: { char: 15, salmon: 40, pike: 38, trout: 7 } },
  { x: 720, y: 2770, weights: { char: 10, salmon: 35, pike: 43, trout: 12 } },
  { x: 750, y: 3060, weights: { salmon: 35, pike: 45, trout: 20 } },
  { x: 810, y: 3570, weights: { salmon: 30, pike: 40, trout: 30 } },
];

export function adjustedFishTable(weights: FishTable, bait = 0): Record<FishId, number> {
  return Object.fromEntries((Object.keys(FISH) as FishId[]).map(id =>
    [id, (weights[id] ?? 0) * (1 + bait * RARITIES[FISH[id].rarity].baitAttraction)])) as Record<FishId, number>;
}

export function chooseFish(weights: FishTable, bait = 0, random = Math.random): FishId {
  const entries = (Object.entries(adjustedFishTable(weights, bait)) as [FishId, number][]).filter(([, weight]) => Number.isFinite(weight) && weight > 0);
  let roll = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [id, weight] of entries) {
    roll -= weight;
    if (roll < 0) return id;
  }
  return entries[entries.length - 1]?.[0] ?? 'whitefish';
}
