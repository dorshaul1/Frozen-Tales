import { Cargo } from '../src/game/player/Cargo';
import { Wallet } from '../src/game/player/Wallet';
import { SaveStore } from '../src/game/player/SaveStore';
import { Equipment } from '../src/game/upgrades/Equipment';
import { STARTER_LEVELS, UPGRADES, UPGRADE_IDS, capacityAt } from '../src/game/upgrades/data';
import { adjustedFishTable, FISH } from '../src/game/fishing/data';
import { FishFight } from '../src/game/fishing/FishFight';

export function checkProgressionModel() {
  const results: string[] = [];
  const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); results.push('PASS ' + message); };
  const cargo = new Cargo();
  cargo.add('whitefish', 0, () => .7); cargo.add('whitefish', 0, () => .95); cargo.add('whitefish', 0, () => .3);
  check(cargo.entries[0].weightKg !== cargo.entries[1].weightKg && cargo.entries[0].value !== cargo.entries[1].value, 'Weights and values vary within one species');
  check(cargo.entries[0].personalRecord && cargo.entries[1].personalRecord && !cargo.entries[2].personalRecord, 'Personal records only advance for a heavier catch');
  const record = cargo.records.whitefish;
  cargo.remove(1); cargo.unload();
  check(cargo.records.whitefish === record, 'Selling preserves journal records');
  for (let i = 0; i < 5; i++) cargo.add('char');
  check(!cargo.add('salmon') && cargo.count === 5, 'Capacity rejects extra catches');

  const wallet = new Wallet(10000), equipment = new Equipment(cargo, wallet, new SaveStore(null), { ...STARTER_LEVELS });
  const base = equipment.fightFor('salmon');
  let spent = 0;
  for (const id of UPGRADE_IDS.filter(id=>id!=='line'&&id!=='reel')) for (const level of UPGRADES[id].levels) {
    check(equipment.purchase(id) === 'purchased', `${id}: next level purchases once`); spent += level.cost;
  }
  equipment.canConfigure=()=>true;equipment.setSlot(0,'cargo');
  check(wallet.balance === 10000 - spent && cargo.capacity === capacityAt(4), 'All prices deduct exactly; fitted storage expands to 20');
  check(UPGRADE_IDS.every(id => equipment.purchase(id) === 'maxed') && wallet.balance === 10000 - spent, 'Maxed tracks cannot charge again');
  const improved = equipment.fightFor('salmon');
  check(improved.safeTensionWidth > base.safeTensionWidth && improved.snapTolerance > base.snapTolerance
    && improved.progressRequired < base.progressRequired, 'Rod, line and reel change actual fight parameters');
  const weakLine = new FishFight(base, () => .5), strongLine = new FishFight(improved, () => .5, equipment.recoveryRate);
  for (let i = 0; i < 1200 && strongLine.outcome === 'fighting'; i++) { weakLine.update(1 / 120, true); strongLine.update(1 / 120, true); }
  check(strongLine.elapsed > weakLine.elapsed, 'Stronger line provides real extra reaction time before a snap');
  const slowRecovery = new FishFight(base, () => .5), fastRecovery = new FishFight(improved, () => .5, equipment.recoveryRate);
  slowRecovery.looseTime = fastRecovery.looseTime = .6;
  slowRecovery.update(.05, true); fastRecovery.update(.05, true);
  check(fastRecovery.looseTime < slowRecovery.looseTime, 'Better reel clears accumulated danger faster during real updates');
  const table = { whitefish: 75, char: 20, salmon: 5 }, bait = adjustedFishTable(table, 3);
  check(bait.salmon / bait.whitefish > table.salmon / table.whitefish && bait.char > table.char, 'Bait changes rare and uncommon encounter chances');
  const poor = new Equipment(new Cargo(), new Wallet(0), new SaveStore(null), { ...STARTER_LEVELS });
  check(poor.purchase('rod') === 'insufficient' && poor.levels.rod === 0, 'Insufficient funds leave equipment untouched');

  const key = 'arctic-drift.check-migration.v2', store = new SaveStore(key);
  try {
    localStorage.setItem(key, JSON.stringify({ version: 1, money: 68, upgrades: ['kayak-storage-1'], cargoCapacity: 8 }));
    const migrated = store.load();
    check(migrated.money === 68 && migrated.levels.cargo === 1, 'Existing money and storage migrate without loss');
    store.write({ version: 2, money: wallet.balance, levels: equipment.levels, cargo: [...cargo.entries], records: cargo.records });
    const restored = store.load();
    check(restored.cargo.length === 5 && restored.levels.rod === 3 && restored.records.whitefish === record, 'Inventory, gear and journal serialize together');
    localStorage.setItem(key, '{broken'); check(store.load().money === 0, 'Corrupt save falls back safely');
  } finally { localStorage.removeItem(key); }
  check(FISH.whitefish.weight > FISH.salmon.weight, 'Starter water favors easy common fish');
  return results;
}
