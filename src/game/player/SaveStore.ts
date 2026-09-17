import {readGoals,type GoalState} from '../goals/Goals';
import {coreState,type CoreState} from '../progression/coreData';
import {ICE_PASSAGES} from '../world/traversalData';
import { SPECIMENS,type SpecimenSize } from '../fishing/specimens';
import { RARE_FISH, type EncounterMemory } from '../fishing/rareFish';
import { environmentSave, type EnvironmentSave } from '../world/conditions';
import { audioSettings, type AudioSettings } from '../audio/settings';
import { FISH, type FishId } from '../fishing/data';
import { playerGear, type PlayerGear, STARTER_LEVELS, UPGRADES, UPGRADE_IDS, capacityAt, moduleLoadout, type ModuleLoadout, type EquipmentLevels } from '../upgrades/data';
import type { CaughtFish, CatchRecords } from './Cargo';

// Retain the original key so existing money/storage upgrades migrate in place.
export const SAVE_KEY = 'arctic-drift.save.v1';
export interface SaveData { goals?:GoalState; core?:CoreState; corgiHome?:'ranger'|'village'; trips?:unknown; equipmentVersion?:1; playerGear?:PlayerGear; loadout?: ModuleLoadout; openedPassages?: string[]; version: 2; money: number; levels: EquipmentLevels; cargo: CaughtFish[]; records: CatchRecords; encounters?: EncounterMemory; areaEvents?: unknown; riverDay?: unknown; daily?: unknown; market?: unknown; trophies?: Partial<Record<FishId,number>> }
export class SaveStore {
  constructor(private key: string | null = SAVE_KEY) {}
  load(): SaveData {
    const fresh: SaveData = { core:coreState(undefined), version: 2, money: 0, levels: { ...STARTER_LEVELS }, cargo: [], records: {}, encounters: {}, loadout:[null,null,null] };
    if (!this.key) return fresh;
    try {
      const value = JSON.parse(localStorage.getItem(this.key) ?? 'null');
      if (![1, 2].includes(value?.version) || !Number.isSafeInteger(value.money) || value.money < 0) return fresh;
      fresh.goals=readGoals(value.goals);
      fresh.core=coreState(value.core,value.core===undefined);if(value.core===undefined&&value.corgiHome==='village')fresh.core.features.push('corgiCompanion');
      fresh.corgiHome=value.corgiHome==='village'?'village':'ranger';
      fresh.openedPassages=Array.isArray(value.openedPassages)?value.openedPassages.filter((id:unknown)=>ICE_PASSAGES.some(p=>p.id===id)):[];
      fresh.trips=value.trips;fresh.areaEvents=value.areaEvents; fresh.riverDay=value.riverDay; fresh.money = value.money; fresh.daily=value.daily; fresh.market=value.market;
      if (value.version === 1) {
        fresh.levels.cargo = Array.isArray(value.upgrades) && value.upgrades.includes('kayak-storage-1') ? 1 : 0;
        fresh.loadout=moduleLoadout(undefined,fresh.levels);return fresh;
      }
      for (const id of UPGRADE_IDS) {
        const level = value.levels?.[id];
        if (Number.isInteger(level)) fresh.levels[id] = Math.max(0, Math.min(UPGRADES[id].levels.length, level));
      }
      // Consolidate the strongest previously purchased component into a complete rod.
      if(value.equipmentVersion!==1)fresh.levels.rod=Math.max(fresh.levels.rod,fresh.levels.line,fresh.levels.reel);
      fresh.levels.line=0;fresh.levels.reel=0;
      fresh.equipmentVersion=1;fresh.playerGear=playerGear(value.playerGear,fresh.levels);
      fresh.loadout=moduleLoadout(value.loadout,fresh.levels);
      for (const id of Object.keys(RARE_FISH) as FishId[]) {
        const item = value.encounters?.[id], rule = RARE_FISH[id]!;
        if (Number.isInteger(item?.misses) && Number.isInteger(item?.cooldown)) fresh.encounters![id] = {
          misses: Math.max(0, Math.min(rule.guarantee - 1, item.misses)), cooldown: Math.max(0, Math.min(rule.cooldown, item.cooldown)) };
      }
      for (const id of Object.keys(FISH) as FishId[]) {
        const best = value.records?.[id];
        if (Number.isFinite(best) && best > 0 && best <= FISH[id].baseKg * 2) fresh.records[id] = best;
        const count=value.trophies?.[id];if(Number.isSafeInteger(count)&&count>=0)(fresh.trophies??={})[id]=Math.min(count,1000000);
      }
      if (Array.isArray(value.cargo)) for (const entry of value.cargo.slice(0, capacityAt(fresh.levels.cargo))) {
        if (!entry || !Object.hasOwn(FISH, entry.type)) continue;
        const type = entry.type as FishId;
        if (!Number.isFinite(entry.weightKg) || entry.weightKg <= 0 || entry.weightKg > FISH[type].baseKg * 2
          || !Number.isSafeInteger(entry.value) || entry.value < 1 || entry.value > FISH[type].value * 3) continue;
        fresh.cargo.push({ caughtAt:Number.isFinite(entry.caughtAt)?Math.max(0,entry.caughtAt):undefined,freshnessAt:Number.isFinite(entry.freshnessAt)?Math.max(0,entry.freshnessAt):undefined,freshAge:Number.isFinite(entry.freshAge)?Math.max(0,entry.freshAge):0, size:Object.hasOwn(SPECIMENS,entry.size??'')?entry.size as SpecimenSize:'normal', type, weightKg: entry.weightKg, value: entry.value, rarity: FISH[type].rarity, personalRecord: entry.personalRecord === true });
        fresh.records[type] = Math.max(fresh.records[type] ?? 0, entry.weightKg);
      }
      return fresh;
    } catch { return fresh; }
  }
  loadMap(): unknown {
    try { return this.key ? JSON.parse(localStorage.getItem(this.key) ?? 'null')?.map : undefined; } catch { return undefined; }
  }
  writeMap(map: unknown): boolean {
    if(!this.key)return true;
    try { localStorage.setItem(this.key,JSON.stringify({...this.load(),world:this.loadWorld(),environment:this.loadEnvironment(),audio:this.loadAudio(),map}));return true; } catch { return false; }
  }
  loadWorld(): unknown {
    try { return this.key ? JSON.parse(localStorage.getItem(this.key) ?? 'null')?.world : undefined; } catch { return undefined; }
  }
  loadEnvironment(): EnvironmentSave {
    try { return environmentSave(this.key ? JSON.parse(localStorage.getItem(this.key) ?? 'null')?.environment : undefined); }
    catch { return environmentSave(); }
  }
  writeEnvironment(environment: EnvironmentSave): boolean {
    if (!this.key) return true;
    try { localStorage.setItem(this.key, JSON.stringify({ ...this.load(), map:this.loadMap(), world: this.loadWorld(), audio: this.loadAudio(), environment })); return true; } catch { return false; }
  }
  loadAudio(): AudioSettings {
    try { return audioSettings(this.key ? JSON.parse(localStorage.getItem(this.key) ?? 'null')?.audio : undefined); }
    catch { return audioSettings(); }
  }
  writeAudio(settings: AudioSettings): boolean {
    if (!this.key) return true;
    try { localStorage.setItem(this.key, JSON.stringify({ ...this.load(), map:this.loadMap(), world: this.loadWorld(), environment: this.loadEnvironment(), audio: audioSettings(settings) })); return true; } catch { return false; }
  }
  write(data: SaveData, environment = this.loadEnvironment(), world = this.loadWorld()): boolean {
    if (!this.key) return true;
    try { localStorage.setItem(this.key, JSON.stringify({ ...data, goals:data.goals??this.load().goals, core:data.core??this.load().core, corgiHome:data.corgiHome??this.load().corgiHome??'ranger', trips:data.trips??this.load().trips, equipmentVersion:1, playerGear:playerGear(data.playerGear??this.load().playerGear,data.levels), loadout:moduleLoadout(data.loadout??this.load().loadout,data.levels), openedPassages:data.openedPassages??this.load().openedPassages, areaEvents:data.areaEvents ?? this.load().areaEvents, riverDay:data.riverDay ?? this.load().riverDay, daily:data.daily ?? this.load().daily, market:data.market ?? this.load().market, trophies:data.trophies ?? this.load().trophies, environment, world, map:this.loadMap(), audio: this.loadAudio() })); return true; } catch { return false; }
  }
}
