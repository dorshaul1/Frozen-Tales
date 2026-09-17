import type { EnvironmentSave } from '../world/conditions';
import { Cargo } from '../player/Cargo';
import { Wallet } from '../player/Wallet';
import { SaveStore } from '../player/SaveStore';
import { FISH, type FishId } from '../fishing/data';
import type { FishDifficulty } from '../fishing/difficulty';
import { TENSION } from '../tuning';
import { TOOL_IDS, toolbelt, type BeltItem, type ToolId, RODS, playerGear, type PlayerGear, UPGRADES, capacityAt, moduleLoadout, isModule, MODULE_SLOTS, UPGRADE_IDS, type ModuleLoadout, type ModuleId, type EquipmentLevels, type UpgradeId } from './data';

export class Equipment {
  private installed:ModuleLoadout;
  readonly gear:PlayerGear;
  canConfigure=()=>false;
  onChange=()=>{};
  constructor(private cargo: Cargo, private wallet: Wallet, private store: SaveStore, readonly levels: EquipmentLevels, loadout?:ModuleLoadout) { this.gear=playerGear(store.load().playerGear,levels);this.installed=moduleLoadout(loadout,levels);this.syncCapacity(); }
  next(id: UpgradeId) { if(id==='line'||id==='reel')return undefined;return UPGRADES[id].levels[this.levels[id]]; }
  get traversalProgress(){return {icebreaker:this.value('icebreaker')>0,openedPassages:this.store.load().openedPassages??[]};}
  get loadout(){return [...this.installed];}
  equipped(id:ModuleId){return this.installed.includes(id);}
  get kayakLevels():EquipmentLevels{return Object.fromEntries(UPGRADE_IDS.map(id=>[id,isModule(id)&&this.equipped(id)?this.levels[id]:0])) as EquipmentLevels;}
  value(id: UpgradeId) { if(id==='rod')return RODS[this.gear.rod].control;if(id==='line')return RODS[this.gear.rod].line;if(id==='reel')return RODS[this.gear.rod].reel;if((id==='lantern'||id==='finder')&&this.gear.disabled.includes(id))return 0;return isModule(id)&&!this.equipped(id)?0:UPGRADES[id].levels[this.levels[id] - 1]?.value ?? 0; }
  private syncCapacity(){this.cargo.setCapacity(capacityAt(this.equipped('cargo')?this.levels.cargo:0));}
  setSlot(slot:number,id:ModuleId|null){
    if(!this.canConfigure())return 'workshop-only';
    return this.install(slot,id);
  }
  private install(slot:number,id:ModuleId|null){
    if(!Number.isInteger(slot)||slot<0||slot>=MODULE_SLOTS||id!==null&&(!isModule(id)||this.levels[id]<1))return 'unowned';
    const next=this.loadout,old=next[slot],other=id===null?-1:next.indexOf(id);
    if(other>=0&&other!==slot)next[other]=old;
    next[slot]=id;
    if(this.cargo.count>capacityAt(next.includes('cargo')?this.levels.cargo:0))return 'cargo-full';
    this.installed=next;this.syncCapacity();this.onChange();
    return this.save()?'changed':'save-unavailable';
  }
  devModule(id:ModuleId,remove=false){
    if(!import.meta.env.DEV)throw new Error('Development only');
    const slot=this.loadout.indexOf(id);
    if(remove){if(slot<0)return 'Already removed; ownership retained.';const result=this.install(slot,null);if(result!=='changed')throw new Error(result);return 'Removed; ownership retained.';}
    if(slot>=0)return 'Already installed.';
    const empty=this.loadout.indexOf(null);if(empty<0)throw new Error('All 3 slots are full. Remove a module first.');
    if(!this.levels[id]&&this.grant(id)==='save-unavailable')throw new Error('Owned, but saving failed.');
    const result=this.install(empty,id);if(result!=='changed')throw new Error(result);return `Installed in slot ${empty+1}.`;
  }
  get ownedTools(){return TOOL_IDS.filter(id=>this.levels[id]>0);}
  get baitLevel(){return Math.min(this.levels.bait,this.gear.baitModel??this.levels.bait);}
  get belt(){return toolbelt(this.gear.belt,this.levels);}
  setBeltSlot(slot:number,id:BeltItem|null){
    if(!Number.isInteger(slot)||slot<0||slot>=5||id!==null&&id!=='rod'&&!this.ownedTools.includes(id))return false;
    const belt=this.belt,other=id===null?-1:belt.indexOf(id),old=belt[slot];
    if(other>=0&&other!==slot)belt[other]=old;
    belt[slot]=id;this.gear.belt=belt;
    if(this.gear.selectedTool&&!belt.includes(this.gear.selectedTool))this.gear.selectedTool=belt.find(i=>i!==null)??undefined;
    this.onChange();return this.save();
  }
  selectBeltSlot(slot:number){const id=this.belt[slot];if(id)this.selectTool(id);}
  selectTool(id:BeltItem){
    if(id!=='rod'&&!this.levels[id])return false;
    if(!this.belt.includes(id)){const empty=this.belt.indexOf(null);this.setBeltSlot(empty<0?4:empty,id);}
    this.gear.selectedTool=id;this.onChange();return this.save();
  }
  cycleTool(step=1){const tools=this.belt.filter((id):id is BeltItem=>id!==null);if(!tools.length)return;this.selectTool(tools[(tools.indexOf(this.gear.selectedTool!)+step+tools.length)%tools.length]);}
  equipRod(model:number){
    if(!Number.isInteger(model)||model<0||model>this.levels.rod)return false;
    this.gear.rod=model;this.onChange();return this.save();
  }
  toggleTool(id:'lantern'|'finder'){
    if(!this.levels[id])return false;
    const i=this.gear.disabled.indexOf(id);if(i<0)this.gear.disabled.push(id);else this.gear.disabled.splice(i,1);
    this.onChange();return this.save();
  }
  get recoveryRate() { return TENSION.dangerRecovery * (1 + this.gear.rod * .5); }
  fightFor(id: FishId): FishDifficulty {
    const base = FISH[id].fight;
    return { ...base, struggleStrength:base.struggleStrength*(1-this.value('mount')), safeTensionWidth: Math.min(.9, base.safeTensionWidth + this.value('rod') + this.value('mount')),
      snapTolerance: base.snapTolerance + this.value('line'),
      progressRequired: base.progressRequired / (1 + this.value('reel')) };
  }
  save(environment?: EnvironmentSave, world?: unknown) { return this.store.write({ version: 2, equipmentVersion:1, playerGear:this.gear, loadout:this.loadout, money: this.wallet.balance, levels: this.levels, cargo: [...this.cargo.entries], records: this.cargo.records, trophies:this.cargo.trophies, encounters: this.cargo.encounters }, environment, world); }
  purchase(id: UpgradeId): 'purchased' | 'insufficient' | 'maxed' | 'save-unavailable' {
    const next = this.next(id);
    if (!next) return 'maxed';
    if (!this.wallet.spend(next.cost)) return 'insufficient';
    return this.grant(id);
  }
  /** Shared ownership path for purchases and development grants. */
  grant(id: UpgradeId): 'purchased' | 'maxed' | 'save-unavailable' {
    if(!this.next(id))return 'maxed';
    this.levels[id]++;
    if(id==='rod')this.gear.rod=this.levels.rod;
    if(id==='bait')this.gear.baitModel=this.levels.bait;
    if((TOOL_IDS as readonly string[]).includes(id)){const belt=this.belt,empty=belt.indexOf(null);if(empty>=0){belt[empty]=id as ToolId;this.gear.belt=belt;this.gear.selectedTool=id as ToolId;}}
    this.syncCapacity();this.onChange();
    return this.save() ? 'purchased' : 'save-unavailable';
  }
}
