import { CARGO } from '../tuning';
export const RODS = [
 {name:'Basic Rod',cost:0,control:0,line:0,reel:0,detail:'Forgiving starter tackle'},
 {name:'Reinforced Rod',cost:60,control:.06,line:.55,reel:.18,detail:'Pike-ready · steadier line and recovery'},
 {name:'Arctic Rod',cost:180,control:.12,line:1.1,reel:.36,detail:'Deep-lake tackle · controls long trout fights'},
 {name:'Expedition Rod',cost:420,control:.18,line:1.65,reel:.54,detail:'Gorge and rare-fish tackle · strong recovery'},
] as const;

// Prices and absolute effects at each purchased level. Level zero is the starter kit.
export const UPGRADES = {
  rod: { shop: 'tools', name: 'Fishing rod', description: 'A forgiving, wider green tension zone.', levels: RODS.slice(1).map(rod=>({cost:rod.cost,value:rod.control,detail:rod.detail}))  },
  // Import-only legacy records: never offered for purchase or applied as separate effects.
  line: { shop: 'tools', name: 'Line strength', description: 'More time to ease off before a snap.', levels: [
    { cost: 30, value: .55, detail: 'Snap buffer +0.55 seconds' },
    { cost: 85, value: 1.1, detail: 'Snap buffer +1.10 seconds' },
    { cost: 190, value: 1.65, detail: 'Snap buffer +1.65 seconds' },
  ] },
  reel: { shop: 'tools', name: 'Reel speed', description: 'Land fish sooner; recover from mistakes faster.', levels: [
    { cost: 40, value: .18, detail: 'Faster catch · 1.5× recovery' },
    { cost: 100, value: .36, detail: 'Faster catch · 2× recovery' },
    { cost: 230, value: .54, detail: 'Faster catch · 2.5× recovery' },
  ] },
  bait: { shop: 'tools', name: 'Bait pouch', description: 'Attract rarer fish and slightly larger catches.', levels: [
    { cost: 55, value: 1, detail: 'Rare fish attraction ×2.6' },
    { cost: 140, value: 2, detail: 'Rare fish attraction ×4.2' },
    { cost: 300, value: 3, detail: 'Rare fish attraction ×5.8' },
  ] },
  cargo: { shop: 'gear', name: 'Storage rack', description: 'A larger hold for longer fishing trips.', levels: [
    { cost: 120, value: 8, detail: '8 fish slots · strapped basket' },
    { cost: 240, value: 12, detail: '12 fish slots' },
    { cost: 420, value: 16, detail: '16 fish slots' },
    { cost: 680, value: 20, detail: '20 fish slots · expedition hold' },
  ] },
  speed: { shop: 'gear', name: 'Current stabilizer', description: 'Steady current control for river bends; Turbo is faster for short surges.', levels: [
    { cost: 60, value: .08, detail: 'Faster strokes · current control I' },
    { cost: 150, value: .16, detail: 'Faster strokes · current control II' },
    { cost: 320, value: .24, detail: 'Faster strokes · current control III' },
  ] },
  lantern: { shop: 'tools', name: 'Personal lantern', description: 'Warm light reveals nearby water at night.', levels: [
    { cost: 75, value: 105, detail: 'Night light · clearer nearby fish shadows' },
  ] },
  finder: { shop: 'tools', name: 'Handheld finder', description: 'Read depth and nearby activity, never exact catches.', levels: [
    { cost: 110, value: 160, detail: 'Read depth + nearby fish activity' },
  ] },
  icebreaker: { shop: 'gear', name: 'Icebreaker bow', description: 'A fitted steel bow cracks thin channel ice.', levels: [
    { cost: 180, value: 1, detail: 'Break thin ice with a running start' },
  ] },
  cover: { shop: 'gear', name: 'Weather canopy', description: 'A spray deck shelters you from wind and snow.', levels: [
    { cost: 110, value: .7, detail: 'Shelter from snow · resist weather drag' },
  ] },
  mount: { shop: 'gear', name: 'Rod mount', description: 'A braced rod rest steadies the line during a fight.', levels: [
    { cost: 95, value: .07, detail: 'Braced line · wider safe tension' },
    { cost: 210, value: .12, detail: 'Firm brace · calmer sustained pulls' },
  ] },
  binoculars: {shop:'tools',name:'Binoculars',description:'Look farther ahead to inspect wildlife and landmarks.',levels:[{cost:85,value:180,detail:'Inspect the distant river'}]},
  probe: {shop:'tools',name:'Depth probe',description:'Cast a sounding line into water ahead.',levels:[{cost:45,value:85,detail:'Read targeted water depth'}]},
  guide: {shop:'tools',name:'Field guide',description:'Read local habitat and known fish preferences.',levels:[{cost:65,value:1,detail:'Contextual habitat notes'}]},
  turbo: { shop: 'gear', name: 'Turbo motor', description: 'Hold Shift to surge forward; release to recharge.', levels: [{cost:220,value:1,detail:'3 second boost · 6 second recharge'}] },
  insulated: {shop:'gear',name:'Insulated storage',description:'Keeps fish fresh over three times longer · one module slot.',levels:[{cost:140,value:1,detail:'70% slower freshness loss · same slot capacity'}]},
  anchor: {shop: 'gear',name: 'Anchor',description: 'K deploy/retrieve while slow · hold exposed fishing water.',levels:[{cost:100,value:1,detail:'Hold position · uses one module slot'}]},
  hull: { shop: 'gear', name: 'Reinforced hull', description: 'Protective rails help regain steering after a collision.', levels: [{cost:130,value:1,detail:'Braced recovery · steadier collision turns'}] },
} as const;
export type UpgradeId = keyof typeof UPGRADES;
export type EquipmentLevels = Record<UpgradeId, number>;
export const UPGRADE_IDS = Object.keys(UPGRADES) as UpgradeId[];
export const STARTER_LEVELS: EquipmentLevels = { rod: 0, line: 0, reel: 0, bait: 0, cargo: 0, speed: 0, lantern: 0, finder: 0, icebreaker: 0, cover: 0, mount: 0, turbo: 0, hull: 0, anchor:0, insulated:0, binoculars:0, probe:0, guide:0 };
export const capacityAt = (level: number) => UPGRADES.cargo.levels[level - 1]?.value ?? CARGO.capacity;

export type UpgradeShop = 'gear' | 'tools';
export const shopUpgrades = (shop: UpgradeShop) => UPGRADE_IDS.filter(id => !['line','reel'].includes(id) && UPGRADES[id].shop === shop).sort((a,b) => Number(['rod','line','reel','bait'].includes(a)) - Number(['rod','line','reel','bait'].includes(b)));

export const MODULE_SLOTS = 3;
export const MODULE_IDS = ['cargo','speed','icebreaker','turbo','hull','insulated','anchor','cover','mount'] as const;
export type ModuleId = typeof MODULE_IDS[number];
export type ModuleLoadout = (ModuleId | null)[];
export const isModule = (id: string): id is ModuleId => (MODULE_IDS as readonly string[]).includes(id);
export function moduleLoadout(raw: unknown, levels: EquipmentLevels): ModuleLoadout {
  // Missing field is a legacy save: retain all ownership, fit up to three useful parts.
  const source: unknown[] = Array.isArray(raw) ? raw : MODULE_IDS.filter(id => levels[id] > 0).slice(0,MODULE_SLOTS);
  const used = new Set<string>();
  return Array.from({length:MODULE_SLOTS},(_,slot)=>{
    const id=source[slot];
    if(typeof id!=='string'||!isModule(id)||levels[id]<1||used.has(id))return null;
    used.add(id);return id;
  });
}

// Legacy component IDs remain import-only; the equipped rod supplies all fight effects.
export const ITEM_MODELS: Partial<Record<UpgradeId,readonly string[]>> = {
 cargo:['Basket Rack','Twin Basket Rack','Trail Storage Rack','Expedition Rack'],
 speed:['River Stabilizer','Arctic Stabilizer','Expedition Stabilizer'],
 bait:['River Bait Pouch','Arctic Bait Kit','Expedition Bait Kit'],
 mount:['Braced Rod Mount','Expedition Rod Mount'],
};
export const itemName=(id:UpgradeId,level:number)=>id==='rod'?RODS[level]?.name??RODS[0].name:ITEM_MODELS[id]?.[Math.max(0,level-1)]??UPGRADES[id].name;
export const TURBO={duration:3,recharge:6,speed:1.65,acceleration:1.8};
export const TOOL_IDS=['lantern','finder','binoculars','probe','bait','guide'] as const;
export type ToolId=typeof TOOL_IDS[number];
export type BeltItem=ToolId|'rod';
export const BELT_SLOTS=5;
export function toolbelt(raw:unknown,levels:EquipmentLevels):(BeltItem|null)[]{
 const items:BeltItem[]=['rod',...TOOL_IDS.filter(id=>levels[id]>0)];
 const source=Array.isArray(raw)?raw:items;const used=new Set<string>();
 return Array.from({length:BELT_SLOTS},(_,i)=>{const id=source[i];if(!items.includes(id)||used.has(id))return null;used.add(id);return id as BeltItem;});
}
export const TOOL_USE={cooldown: .6,scanDuration:3,inspectDuration:3,probeDistance:85};
export interface PlayerGear { belt?:(BeltItem|null)[]; selectedTool?:BeltItem; lanternLit?:boolean; baitModel?:number; rod:number; disabled:('lantern'|'finder')[] }
export function playerGear(raw:unknown,levels:EquipmentLevels):PlayerGear {
 const v=raw as Partial<PlayerGear>|undefined;
 const belt=toolbelt(v?.belt,levels);
 return {belt,selectedTool:belt.find(id=>id===v?.selectedTool)??belt.find(id=>id!==null)??undefined,lanternLit:v?.lanternLit===true,baitModel:Number.isInteger(v?.baitModel)?Math.max(0,Math.min(levels.bait,v!.baitModel!)):levels.bait,rod:Number.isInteger(v?.rod)?Math.max(0,Math.min(levels.rod,v!.rod!)):levels.rod,disabled:Array.isArray(v?.disabled)?v.disabled.filter((id,i,a)=>(id==='lantern'||id==='finder')&&a.indexOf(id)===i):[]};
}

export const ANCHOR={maxDeploySpeed:20,flowResistance:.04,leash:12,spring:2.5};
