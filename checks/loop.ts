import { visitNpc, boardKayak } from './hub-helper';
import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { FISH, type FishId } from '../src/game/fishing/data';
import { HOME } from '../src/game/tuning';
import { UPGRADES } from '../src/game/upgrades/data';
import { checkProgressionModel } from './progression-model';

const keyName = 'arctic-drift.check-progression.v2';
const reloadKey = keyName + '.reload';
const expected = sessionStorage.getItem(reloadKey);
if (!expected) localStorage.removeItem(keyName);
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 1040, height: 700, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(keyName, true)] });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const held = new Set<number>();
const key = (code: number, down: boolean) => {
  if (held.has(code) === down) return;
  if (down) held.add(code); else held.delete(code);
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code, bubbles: true }));
};
const tap = async (code: number) => { key(code, true); await wait(65); key(code, false); await wait(65); };
const results: string[] = [];
const report = () => { document.querySelector('#result')!.textContent = results.join('\n'); };
const check = (ok: boolean, text: string) => { if (!ok) throw new Error(text); results.push('PASS ' + text); report(); };
const until = async (predicate: () => boolean, timeout = 10000) => {
  const start = performance.now(); while (!predicate()) { if (performance.now() - start > timeout) throw new Error('Timed out awaiting fishing'); await wait(20); }
};
try {
  results.push(...checkProgressionModel()); report(); await wait(900);
  const scene = game.scene.getScene('river') as RiverScene;
  const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
  const body = kayak.body as Phaser.Physics.Arcade.Body;
  if (expected) {
    const saved = JSON.parse(expected);
    check(scene.wallet.balance === saved.money && scene.equipment.levels.rod === 1, 'Browser refresh restores money and rod level');
    check(scene.cargo.count === 1 && Object.entries(JSON.parse(saved.fish)).every(([key, value]) => (scene.cargo.entries[0] as unknown as Record<string, unknown>)[key] === value), 'Browser refresh restores the exact individual fish');
    check(Object.entries(JSON.parse(saved.records)).every(([key, value]) => scene.cargo.records[key as FishId] === value) && Object.keys(scene.cargo.records).length === Object.keys(JSON.parse(saved.records)).length, 'Browser refresh restores the fishing journal');
    sessionStorage.removeItem(reloadKey);
    results.push('Complete early progression loop passed.'); report();
  } else {
    const paddle = async (x: number, y: number) => {
      const start = performance.now();
      while (Phaser.Math.Distance.Between(kayak.x, kayak.y, x, y) > 10) {
        if (performance.now() - start > 15000) throw new Error(`Route blocked toward ${x}, ${y}`);
        const dx = x - kayak.x, dy = y - kayak.y;
        key(65, dx < -6); key(68, dx > 6); key(87, dy < -6); key(83, dy > 6); await wait(20);
      }
      for (const code of [65, 68, 87, 83]) key(code, false); await wait(850);
    };
    const catchAt = async (index: number, x: number, y: number, upgraded = false) => {
      await paddle(x, y); await until(() => scene.fishing.spots[index].availableAt <= (scene.fishing as unknown as { clock: number }).clock, 20000);
      const before = scene.cargo.count;
      await tap(69); check(scene.fishing.active, 'Nearby spot begins a fishing attempt');
      await until(() => scene.fishing.state === 'hooked');
      const species = (scene.fishing as unknown as { hookedFish: FishId }).hookedFish;
      if (upgraded) check(scene.fishing.fight!.data.safeTensionWidth > FISH[species].fight.safeTensionWidth, 'Purchased rod widens the NEXT real fishing fight');
      let reeling = false;
      while (scene.fishing.state === 'hooked') {
        if (scene.fishing.fight!.tension < .38) reeling = true;
        if (scene.fishing.fight!.tension > .61) reeling = false;
        key(69, reeling); await wait(20);
      }
      key(69, false);
      check(scene.cargo.count === before + 1, 'Successful minigame stores a fish');
      const fish = scene.cargo.entries[scene.cargo.count - 1];
      check(fish.weightKg > 0 && fish.value > 0 && fish.rarity === FISH[fish.type].rarity && !!scene.cargo.records[fish.type], 'Catch has species, weight, rarity, value and journal record');
      await until(() => scene.fishing.state === 'idle');
    };
    check(scene.cargo.count === 0 && scene.wallet.balance === 0, 'Fresh progression starts empty');
    visitNpc(scene, 'gear'); await tap(69); check(scene.harborPanel.isOpen && scene.harborPanel.tab === 'gear', 'Merchant NPC below the dock opens visual equipment cards');
    await tap(9); check(scene.harborPanel.tab === 'gear', 'Tab cannot switch NPC interfaces');
    await tap(69); check(scene.equipment.levels.rod === 0 && scene.wallet.balance === 0, 'Cannot buy a rod without funds');
    const origin = new Phaser.Math.Vector2(kayak.x, kayak.y); key(68, true); await wait(250); key(68, false);
    check(origin.distance(kayak) < .1, 'Trading pauses kayak movement'); await tap(27);
    visitNpc(scene, 'journal'); await tap(69);
    check(scene.harborPanel.tab === 'journal' && Object.keys(scene.cargo.records).length === 0, 'Journal keeper opens undiscovered fish gallery');
    await tap(69); check(scene.harborPanel.isOpen, 'Selecting a fish opens its detail view');
    await tap(27); check(!scene.harborPanel.isOpen, 'Escape closes details and restores control');
    boardKayak(scene); await paddle(HOME.spawnX, HOME.spawnY);
    await catchAt(0, 800, 1200); await catchAt(1, 885, 1080); await catchAt(3, 900, 870);
    await paddle(900, 1080); await paddle(850, 1250); await paddle(620, 1340);
    await catchAt(2, 620, 1410); await catchAt(4, 660, 1510);
    check(scene.cargo.full && scene.cargo.count === 5, 'Five catches fill the starter hold');
    await paddle(620, 1340); await paddle(800, 1200); await tap(69);
    check(!scene.fishing.active && scene.cargo.count === 5, 'Full hold prevents another cast');
    await tap(73); await tap(74); check(!scene.harborPanel.isOpen, 'I and J no longer open any interface');
    check(scene.wallet.balance === 0 && scene.cargo.count === 5, 'Fish remain aboard until returning to the dock');
    boardKayak(scene); await paddle(HOME.spawnX, HOME.spawnY); visitNpc(scene, 'cargo'); await tap(69);
    const total = scene.cargo.totalValue, individual = scene.cargo.entries[0].value;
    await tap(40); await tap(69);
    check(scene.cargo.count === 4 && scene.wallet.balance === individual, 'Individual sale pays the stored fish value exactly');
    await tap(38); await tap(32);
    check(scene.cargo.count === 0 && scene.wallet.balance === total, 'Sell all clears remaining fish and pays exact total');
    await tap(32); check(scene.wallet.balance === total, 'Empty sell cannot duplicate currency');
    await tap(27); visitNpc(scene, 'gear'); await tap(69);
    check(scene.harborPanel.tab === 'gear', 'Returning to Mara opens the upgrade cards');
    await tap(69);
    check(scene.equipment.levels.rod === 1 && scene.wallet.balance === total - UPGRADES.rod.levels[0].cost, 'Earned currency purchases Rod quality I');
    await tap(27); boardKayak(scene); await catchAt(0, 800, 1200, true);
    visitNpc(scene, 'journal'); await tap(69); check(scene.harborPanel.tab === 'journal' && Object.keys(scene.cargo.records).length > 0, 'Journal keeper retains discovered species after selling'); await tap(27);
    sessionStorage.setItem(reloadKey, JSON.stringify({ money: scene.wallet.balance, fish: JSON.stringify(scene.cargo.entries[0]), records: JSON.stringify(scene.cargo.records) }));
    results.push('Refreshing to check progression persistence…'); report(); location.reload();
  }
} catch (error) { results.push('FAIL ' + error); report(); }
finally { for (const code of [...held]) key(code, false); game.destroy(true); }
