import { visitNpc, boardKayak } from './hub-helper';
import Phaser from 'phaser';
import { Environment, PHASES, WEATHER, conditionFishTable, animalActivity, catchQuality, type WeatherId } from '../src/game/world/conditions';
import { DynamicWorld, validWater, validSnow, validFloe } from '../src/game/world/DynamicWorld';
import { AREA_SPAWNS, ANIMAL_RULES, DYNAMIC, type AreaId } from '../src/game/world/spawnRules';
import { banks, createFloes } from '../src/game/world/river';
import { chooseFish } from '../src/game/fishing/data';
import { SaveStore } from '../src/game/player/SaveStore';
import { Cargo } from '../src/game/player/Cargo';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { audioSettings } from '../src/game/audio/settings';
const results: string[] = [];
const check = (ok: boolean, label: string) => { results.push(`${ok ? 'PASS' : 'FAIL'} ${label}`); document.querySelector('#result')!.textContent = results.join('\n'); if (!ok) throw Error(label); };
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const player = { x: 800, y: 2700 }, view = { left: 550, right: 1050, top: 2525, bottom: 2875 };
const advance = (w: DynamicWorld, seconds: number) => { for (let i = 0; i < seconds * 20; i++) w.update(50, player, view); };
const held = new Set<number>();
function key(code: number, down: boolean) { if (held.has(code) === down) return; down ? held.add(code) : held.delete(code); window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code, bubbles: true })); }
const tap = async (code: number) => { key(code, true); await wait(70); key(code, false); await wait(100); };
try {
  const clock = new Environment({ elapsed: 0, seed: 42 });
  for (const phase of PHASES) { check(clock.phase === phase, `${phase} lasts three minutes`); clock.update(180); }
  check(clock.phase === 'morning', 'Clock wraps without a calendar');
  const restored = new Environment(clock.snapshot()); clock.update(1234); restored.update(1234);
  check(JSON.stringify(clock.snapshot()) === JSON.stringify(restored.snapshot()), 'Clock, weather duration and RNG restore deterministically');
  check(new Environment({ elapsed: 0, weather: 'aurora' }).weather !== 'aurora', 'Invalid daytime aurora is repaired');
  let nights = 0;
  for (let seed = 1; seed <= 1000; seed++) {
    const c = new Environment({ elapsed: 539, remaining: 250, seed: seed * 7919 }); c.update(1); if (c.weather === 'aurora') nights++;
    c.update(180); if (c.weather === 'aurora') throw Error('Aurora survived sunrise');
  }
  check(nights > 70 && nights < 170, `Aurora appears on ${nights}/1000 nights; ends at dawn`);
  const geometry = JSON.stringify([createFloes(), Array.from({ length: 100 }, (_, i) => banks(i * 39))]);
  let snowBirds = 0, calmBirds = 0, normalRare = 0, auroraRare = 0, peak = 0;
  for (const phase of PHASES) for (const weather of Object.keys(WEATHER) as WeatherId[]) {
    const conditions = { phase, weather };
    for (const area of Object.keys(AREA_SPAWNS) as AreaId[]) {
      const table = conditionFishTable(AREA_SPAWNS[area].fish, conditions);
      check(Object.entries(table).every(([, value]) => value > 0), `${phase}/${weather}/${area}: normal fish remain available`);
    }
    for (let seed = 1; seed <= 12; seed++) {
      const w = new DynamicWorld(seed * 171); w.conditions = conditions; w.newTrip(seed * 171, player, view);
      if (weather === 'clear') normalRare += w.spots.filter(s => s.kind !== 'normal').length;
      if (weather === 'aurora') auroraRare += w.spots.filter(s => s.kind !== 'normal').length;
      advance(w, 35);
      peak = Math.max(peak, w.encounters.reduce((n, e) => n + e.points.length, 0));
      for (const s of w.spots) if (!validWater(s)) throw Error('Weather placed fish on invalid water');
      for (const e of w.encounters) {
        const r = ANIMAL_RULES[e.species];
        if (e.points.some(p => r.terrain === 'snow' ? !validSnow(p, r.radius) : r.terrain === 'floe' && !validFloe(p, r.radius))) throw Error('Invalid wildlife terrain');
        if (e.species === 'bird') { if (weather === 'heavy-snow') snowBirds++; if (weather === 'clear') calmBirds++; }
      }
      w.requestOpportunity('trout', 'lake'); advance(w, 35);
      if (!w.spots.some(s => s.required === 'trout' && validWater(s))) throw Error('Quest guarantee lost under weather');
    }
  }
  check(snowBirds === 0 && calmBirds > 0, 'Actual bird spawns stop during heavy snow');
  normalRare = 0; auroraRare = 0;
  for (let seed = 1; seed <= 500; seed++) for (const weather of ['clear', 'aurora'] as const) {
    const w = new DynamicWorld(seed * 7919); w.conditions = { phase: 'night', weather }; w.newTrip(seed * 7919, player, view);
    const rare = w.spots.filter(s => s.kind !== 'normal').length;
    if (weather === 'clear') normalRare += rare; else auroraRare += rare;
  }
  check(auroraRare > normalRare, `Aurora creates more unusual spots (${auroraRare} vs ${normalRare})`);
  check(peak <= DYNAMIC.wildlifeLimit, 'Weather retains population caps and valid terrain');
  check(geometry === JSON.stringify([createFloes(), Array.from({ length: 100 }, (_, i) => banks(i * 39))]), 'Every combination preserves handcrafted geography');
  const distribution = (weather: WeatherId, phase: typeof PHASES[number]) => {
    const table = conditionFishTable(AREA_SPAWNS.bend.fish, { weather, phase });
    const random = new DynamicWorld(555).random; let trout = 0;
    for (let i = 0; i < 10000; i++) if (chooseFish(table, 0, random) === 'trout') trout++;
    return trout;
  };
  check(distribution('aurora', 'night') > distribution('clear', 'morning') * 2, '10,000 sampled catches show a meaningful trout distribution shift');
  check(animalActivity('seal', { phase: 'day', weather: 'clear' }) > animalActivity('seal', { phase: 'day', weather: 'windy' }), 'Calm conditions favor seals');
  const cargo = new Cargo(5); cargo.add('trout', 3, () => .999, catchQuality('trout', { phase: 'night', weather: 'aurora' }) * DYNAMIC.trophyBonus);
  const store = new SaveStore('arctic-drift.check-environment'); localStorage.removeItem('arctic-drift.check-environment');
  const save = store.load(); save.money = 57; save.cargo = [...cargo.entries]; save.records = cargo.records; store.write(save);
  store.writeEnvironment(clock.snapshot()); store.writeAudio(audioSettings()); store.write(store.load());
  check(store.load().cargo.length === 1 && store.load().money === 57 && JSON.stringify(store.loadEnvironment()) === JSON.stringify(clock.snapshot()), 'Large weather catches, money, audio and environment survive all save writers');
  localStorage.removeItem('arctic-drift.check-environment');
  const scene = new RiverScene(null);
  const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 1000, height: 600, pixelArt: true, physics: { default: 'arcade' }, scene: [scene] });
  await wait(1500);
  const kayak = scene.children.list.find(c => c instanceof Kayak) as Kayak, body = kayak.body as Phaser.Physics.Arcade.Body;
  const spot = scene.dynamicWorld.spots.find(s => s.area === 'starting')!;
  body.reset(spot.x + 25, spot.y); await wait(700); await tap(69);
  check(scene.fishing.active, 'Fishing starts with the live environment connected');
  let reel = false; const started = performance.now();
  while (scene.fishing.state !== 'result' && performance.now() - started < 15000) {
    const fight = scene.fishing.fight;
    if (fight) { if (fight.tension < .4) reel = true; if (fight.tension > .58) reel = false; key(69, reel); }
    await wait(20);
  }
  key(69, false); check(scene.cargo.count === 1, 'Existing minigame catches and stores condition-adjusted fish');
  await wait(2600); visitNpc(scene, 'cargo'); await wait(500); await tap(69); const value = scene.cargo.totalValue; await tap(69);
  check(scene.wallet.balance === value && scene.cargo.count === 0, 'Condition-adjusted fish sell normally'); await tap(27);
  boardKayak(scene); const startY = kayak.y; key(83, true); await wait(450); key(83, false); check(kayak.y > startY + 10, 'Movement restores after catching and selling');
  body.reset(686, 1216);
  for (const [label, elapsed, weather] of [['Morning', 30, 'clear'], ['Snowstorm', 220, 'heavy-snow'], ['Evening', 390, 'windy'], ['Aurora', 565, 'aurora']] as const) {
    const button = document.createElement('button'); button.textContent = label;
    button.onclick = () => { Object.assign(scene.environment, { state: { elapsed, weather, remaining: 170, seed: 7 } }); };
    document.querySelector('#views')!.append(button);
  }
  const bend = document.createElement('button'); bend.textContent = 'Blue Ice Bend'; bend.onclick = () => { const [l, r] = banks(2600); body.reset((l + r) / 2, 2600); }; document.querySelector('#views')!.append(bend);
  const narrow = document.createElement('button'); narrow.textContent = 'Narrow view'; narrow.onclick = () => game.scale.resize(440, 600); document.querySelector('#views')!.append(narrow);
  const home = document.createElement('button'); home.textContent = 'Home'; home.onclick = () => body.reset(686, 1216); document.querySelector('#views')!.append(home);
  check(true, `Live loop and all combinations complete; ${Math.round(game.loop.actualFps)} FPS. Preview buttons affect only this isolated fixture.`);
} catch (error) { results.push(String(error)); document.querySelector('#result')!.textContent = results.join('\n'); }
finally { for (const code of [...held]) key(code, false); }
