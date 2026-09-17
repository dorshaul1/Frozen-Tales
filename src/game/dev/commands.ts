import type {RegionalDiscovery} from '../map/RegionalDiscovery';
import type {AreaId} from '../world/spawnRules';
import type {Goals} from '../goals/Goals';
import {CORE_QUESTS,FEATURES,type QuestId,type Feature} from '../progression/coreData';
import type {CoreQuests} from '../progression/CoreQuests';
import {Registry,command,id,integer} from './registry';
import {FISH,type FishId} from '../fishing/data';
import {PHASES,WEATHER,type Environment,type TimePhase,type WeatherId} from '../world/conditions';
import {TOOL_IDS,MODULE_IDS,type UpgradeId,type ModuleId} from '../upgrades/data';
import {ANIMAL_RULES,type AnimalId,AREA_SPAWNS} from '../world/spawnRules';
import {ICE_PASSAGES} from '../world/traversalData';
import {MAP_MARKERS} from '../map/discovery';
import type {Equipment} from '../upgrades/Equipment';
import type {Cargo} from '../player/Cargo';
import type {Wallet} from '../player/Wallet';
export interface Context { regional?:RegionalDiscovery; goals?:Goals; core?:CoreQuests;
 environment:Environment;equipment:Equipment;cargo:Cargo;wallet:Wallet;
 save:()=>boolean;timeChanged:()=>void;teleport:(location:string)=>string;
 gate:(area:string,open:boolean)=>void;spawn:(species:AnimalId,count:number)=>void;
}
export const slug=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const locations=()=>[...new Set(MAP_MARKERS.flatMap(m=>[m.id,slug(m.name)]))];
export function createRegistry(ctx:Context){
 const r=new Registry(),saved=(text:string)=>{if(!ctx.save())throw new Error(text+' Saving failed; use /save to retry.');return text;};
 r.add(command('help','List commands or explain one.',[id('command',()=>[...r.commands.keys()],true)],name=>{
  const c=r.commands.get(name);return c?`${r.usage(c)} — ${c.description}${c.arguments.map(a=>a.kind==='id'?`\n${a.name}: ${a.options().join(', ')}`:`\n${a.name}: ${a.min}–${a.max}`).join('')}`:[...r.commands.values()].map(c=>`${r.usage(c)} — ${c.description}`).join('\n');
 }));
 r.add(command('set-time','Advance to the next occurrence of this time.',[id('time',()=>PHASES)],phase=>{ctx.environment.advanceToPhase(phase as TimePhase);ctx.timeChanged();return saved(`Time: ${phase} · day ${ctx.environment.day}.`);}));
 r.add(command('set-weather','Set real weather and this forecast window.',[id('weather',()=>Object.keys(WEATHER))],weather=>{ctx.environment.setWeather(weather as WeatherId);ctx.timeChanged();return saved(`Weather: ${weather}.`);}));
 r.add(command('set-day','Advance day; backwards jumps are rejected.',[integer('day',0,10000)],day=>{ctx.environment.advanceToDay(day);ctx.timeChanged();return saved(`Day: ${ctx.environment.day}.`);}));
 r.add(command('give-money','Credit the real wallet.',[integer('amount',1,1000000)],amount=>{if(ctx.wallet.balance+amount>10000000)throw new Error('Wallet limit: $10,000,000.');ctx.wallet.credit(amount);return saved(`Added $${amount}.`);}));
 r.add(command('give-fish','Add catches with real weight, records and slot limits.',[id('species',()=>Object.keys(FISH)),integer('amount',1,20,true)],(species,amount=1)=>{if(ctx.cargo.count+amount>ctx.cargo.capacity)throw new Error(`Only ${ctx.cargo.capacity-ctx.cargo.count} free fish slots.`);for(let i=0;i<amount;i++)ctx.cargo.add(species as FishId);return saved(`Added ${amount} ${FISH[species as FishId].name}.`);}));
 r.add(command('clear-inventory','Release fish cargo; retain tools and records.',[],()=>{const count=ctx.cargo.unload().length;return saved(`Released ${count} fish.`);}));
 r.add(command('give-tool','Grant the next owned tool/rod model.',[id('tool',()=>['rod',...TOOL_IDS])],tool=>{const result=ctx.equipment.grant(tool as UpgradeId);if(result!=='purchased')throw new Error(result);return saved(`Granted ${tool}.`);}));
 r.add(command('give-module','Own and install a module in a free slot.',[id('module',()=>MODULE_IDS)],module=>saved(ctx.equipment.devModule(module as ModuleId))));
 r.add(command('remove-module','Uninstall a module; retain ownership.',[id('module',()=>MODULE_IDS)],module=>saved(ctx.equipment.devModule(module as ModuleId,true))));
 const areas=()=>[...Object.keys(AREA_SPAWNS),...ICE_PASSAGES.map(p=>p.route)];
 for(const [name,open] of [['unlock-area',true],['lock-area',false]] as const)r.add(command(name,'Open/close optional ice gates. Main river areas have no locks.',[id('area',areas)],area=>{ctx.gate(area,open);return saved(`${area}: ${open?'opened':'blocked by thin ice'}.`);}));
 r.add(command('teleport','Move the kayak to safe water near a world location.',[id('location',locations)],location=>ctx.teleport(location)));
 r.add(command('spawn-animal','Spawn in nearby valid habitat, within population limits.',[id('species',()=>Object.keys(ANIMAL_RULES)),integer('amount',1,24,true)],(species,amount=1)=>{ctx.spawn(species as AnimalId,amount);return `Spawned ${amount} ${species}.`;}));
 r.add(command('save','Save through the existing save system.',[],()=>saved('Game saved.')));
 if(ctx.core){const core=ctx.core;for(const action of ['start','complete','reset'] as const)r.add(command('quest-'+action,'Test a core quest through its real state.',[id('quest',()=>Object.keys(CORE_QUESTS))],quest=>{if(action==='start')core.start(quest as QuestId,true);else if(action==='complete')core.complete(quest as QuestId,true);else core.reset(quest as QuestId);return `${quest}: ${core.status(quest as QuestId)}`;}));for(const [name,on] of [['unlock-feature',true],['lock-feature',false]] as const)r.add(command(name,'Set a core feature for development.',[id('feature',()=>FEATURES.map(f=>f.toLowerCase()))],feature=>{core.setFeature(FEATURES.find(f=>f.toLowerCase()===feature) as Feature,on);return `${feature}: ${on?'unlocked':'locked'}`;}));}
 if(ctx.goals){const goals=ctx.goals;r.add(command('goals','Show persistent progression objectives.',[],()=>goals.state.current.map(g=>`${g.id}: ${g.detail} ${g.progress}/${g.target}`).join('\n')));for(const action of ['complete','reroll'] as const)r.add(command('goal-'+action,'Test goals without granting money.',[id('goal',()=>goals.state.current.map(g=>g.id))],goal=>{goals.dev(action,goal);return 'Goal updated';}));r.add(command('goal-reset','Reconcile objectives with game state; preserve completions.',[],()=>{goals.dev('reset');return 'Objectives reconciled';}));}
 if(ctx.regional){const regional=ctx.regional;r.add(command('region-progress','Show regional discovery; life sightings are optional.',[id('region',()=>Object.keys(AREA_SPAWNS))],region=>regional.chartLines(region as AreaId).join('\n')||'Region not visited'));for(const action of ['discover','complete','reset'] as const)r.add(command('region-'+action,action==='complete'?'Complete public exploration only; does not fabricate fish, wildlife or secrets.':'Update this region through its discovery state.',[id('region',()=>Object.keys(AREA_SPAWNS))],region=>{regional.dev(action,region as AreaId);return `${region}: ${regional.summary(region as AreaId).percent}% explored`;}));}
 return r;
}
