import {networkAt,WORLD_SIZE,NETWORK_ROUTES} from './regionNetwork';
import {WILDLIFE_SIZE} from './wildlifeSize';
import type { FishTable } from '../fishing/data';
import { AREAS } from './areas';
export type AreaId = 'starting' | 'bend' | 'lake' | 'gorge' | 'estuary';
export const AREA_SPAWNS: Record<AreaId, { name: string; minY: number; maxY: number; spots: number; fish: FishTable }> = {
  estuary:{name:'FROZEN ESTUARY',minY:1850,maxY:5000,spots:17,fish:{salmon:42,char:18,trout:8,whitebass:12,sturgeon:16,dolly:6}},
  starting: { name: 'STARTING RIVER', minY: 200, maxY: AREAS.bendStart - 70, spots: 11, fish: { dace:12,perch:10,whitefish: 45, smelt: 25, char: 22, salmon: 8 } },
  bend: { name: 'BLUE ICE BEND', minY: AREAS.bendStart + 70, maxY: 5400, spots: 10, fish: { chub:12,pickerel:10,sucker:8,perch:3,char: 10, salmon: 38, pike: 40, trout: 12 } },
  gorge: {name:'GLACIER GORGE',minY:AREAS.gorgeStart+60,maxY:WORLD_SIZE.height-180,spots:9,fish:{huchen:15,taimen:10,bream:3,dolly:52,lenok:38,trout:10}},
  lake: { name: 'FROZEN LAKE', minY: AREAS.lakeStart + 70, maxY: 7050, spots: 10, fish: { whitebass:14,bream:12,sucker:4,salmon: 10, pike: 25, trout: 45, sturgeon: 20 } },
};
export const AREA_TRANSITIONS: {area:AreaId;minY:number;name:string;fish:FishTable}[] = [{area:'starting',minY:1850,name:'Southern Starting River',fish:{pike:5}}];
export function areaFishPool(area:AreaId,y:number):FishTable { return Object.assign({...AREA_SPAWNS[area].fish},...AREA_TRANSITIONS.filter(t=>t.area===area&&y>t.minY).map(t=>t.fish)); }
export function areaAt(y:number,x?:number):AreaId {
 if(x!==undefined&&x>1550){

  if(x>1550&&x<2600&&y>2290&&y<3080)return 'starting';
  const route=networkAt(x,y);if(route)return route.route.area;
  if(x>2700)return 'estuary';
 }
 return y>=AREAS.gorgeStart?'gorge':y>=AREAS.lakeStart?'lake':y>=AREAS.bendStart?'bend':'starting';
}
export const DYNAMIC = {
  tick: 5, spacing: 155, homeExclusion: 170, recentDistance: 95, recentLifetime: 180,
  fishLifetime: [75, 150], fishCooldown: [25, 45], rareCooldown: 100,
  rareActivityChance: .035, trophyBonus: 1.22, wildlifeLimit: 96,
  tripHomeRadius: 140, tripLeaveRadius: 270,
};
const all: AreaId[] = ['starting', 'bend', 'lake', 'gorge', 'estuary'];
export const ANIMAL_RULES = {
 'musk-ox': {areas:['lake'] as AreaId[],terrain:'snow',rarity:'rare',group:[2,3],probability:.055,maxActive:3,playerDistance:220,homeDistance:250,cooldown:220,lifetime:150,radius:WILDLIFE_SIZE['musk-ox'].radius},
 wolf: {areas:['lake','gorge'] as AreaId[],terrain:'snow',rarity:'rare',group:[1,3],probability:.025,maxActive:3,playerDistance:210,homeDistance:250,cooldown:200,lifetime:120,radius:WILDLIFE_SIZE.wolf.radius},
 wolverine: {areas:['gorge'] as AreaId[],terrain:'snow',rarity:'rare',group:[1,1],probability:.012,maxActive:1,playerDistance:200,homeDistance:250,cooldown:240,lifetime:95,radius:WILDLIFE_SIZE.wolverine.radius},
 raven: {areas:['starting','bend','lake','gorge'] as AreaId[],terrain:'air',rarity:'uncommon',group:[1,2],probability:.25,maxActive:5,playerDistance:170,homeDistance:190,cooldown:38,lifetime:90,radius:WILDLIFE_SIZE.raven.radius},
  fox: { areas: all, terrain:'snow', rarity:'rare', group:[1,1], probability:.06, maxActive:2, playerDistance:180,homeDistance:190,cooldown:120,lifetime:90,radius:WILDLIFE_SIZE['fox'].radius },
  hare: { areas: all, terrain:'snow', rarity:'uncommon', group:[1,3], probability:.42, maxActive:8, playerDistance:160,homeDistance:170,cooldown:35,lifetime:110,radius:WILDLIFE_SIZE['hare'].radius },
  reindeer: { areas: ['starting','bend','lake'] as AreaId[], terrain:'snow', rarity:'uncommon', group:[2,5], probability:.23, maxActive:7, playerDistance:220,homeDistance:250,cooldown:90,lifetime:160,radius:WILDLIFE_SIZE['reindeer'].radius },
  otter: { areas: ['starting','bend'] as AreaId[], terrain:'snow', rarity:'uncommon', group:[1,2], probability:.28, maxActive:4, playerDistance:170,homeDistance:200,cooldown:50,lifetime:110,radius:WILDLIFE_SIZE['otter'].radius },
  owl: { areas: all, terrain:'air', rarity:'rare', group:[1,1], probability:.04, maxActive:1, playerDistance:180,homeDistance:190,cooldown:180,lifetime:24,radius:WILDLIFE_SIZE['owl'].radius },
  penguin: { areas: all, terrain: 'snow', rarity: 'common', group: [3, 7], probability: .90, maxActive: 24, playerDistance: 180, homeDistance: 185, cooldown: 12, lifetime: 160, radius:WILDLIFE_SIZE['penguin'].radius },
  seal: { areas: all, terrain: 'floe', rarity: 'uncommon', group: [1, 2], probability: .36, maxActive: 8, playerDistance: 180, homeDistance: 200, cooldown: 38, lifetime: 150, radius:WILDLIFE_SIZE['seal'].radius },
  'polar-bear': { areas: ['bend', 'lake', 'gorge'] as AreaId[], terrain: 'snow', rarity: 'rare', group: [1, 1], probability: .012, maxActive: 1, playerDistance: 240, homeDistance: 450, cooldown: 300, lifetime: 140, radius:WILDLIFE_SIZE['polar-bear'].radius },
  bird: { areas: all, terrain: 'air', rarity: 'common', group: [1, 3], probability: .55, maxActive: 10, playerDistance: 160, homeDistance: 180, cooldown: 16, lifetime: 65, radius:WILDLIFE_SIZE['bird'].radius },
} as const;
export type AnimalId = keyof typeof ANIMAL_RULES;

export const ECOLOGY:Record<AreaId,Partial<Record<AnimalId,number>>>={
 estuary:{penguin:.15,hare:0,reindeer:0,otter:0,bird:1.4,seal:1.3,fox:.3,owl:.3,'polar-bear':.2},
 gorge:{raven:1.6,penguin:0,hare:0,reindeer:0,otter:0,bird:.25,seal:1.1,fox:.7,owl:1.4,'polar-bear':.8},
 starting:{fox:1.35,hare:1.7,bird:1.5,otter:1.25,seal:.3,reindeer:.25,owl:.5},
 bend:{penguin:1.15,seal:1.6,reindeer:1.5,fox:1.3,otter:1.2,bird:.7},
 lake:{raven:.9,reindeer:.85,'polar-bear':1.05,penguin:.2,bird:.65,hare:.4,seal:1.1,fox:.35,owl:1.1},
};
export const ANIMAL_SPEED:Record<AnimalId,number>={'musk-ox':8,wolf:18,wolverine:16,raven:28,penguin:10,'polar-bear':7,seal:5,bird:32,owl:23,fox:17,hare:19,reindeer:11,otter:12};

// Authored water footprint supplies regional budgets; local caps preserve quiet screens.
export const WILDLIFE_DENSITY=Object.fromEntries((Object.keys(AREA_SPAWNS) as AreaId[]).map(area=>{
 const footprint=NETWORK_ROUTES.filter(r=>r.area===area).reduce((sum,r)=>sum+r.points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-r.points[i][0],p[1]-r.points[i][1])*(p[2]+r.points[i][2]),0),0);
 const scale=Math.min(3.2,1.8+footprint/6000000);return [area,{budget:Math.round(22*scale),scale}];
})) as Record<AreaId,{budget:number;scale:number}>;
