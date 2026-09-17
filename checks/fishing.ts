import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { FISHING } from '../src/game/tuning';
import { checkFightModel } from './fight-model';

const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 900, height: 620, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(null, true)] });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const held = new Set<number>();
const key = (code: number, down: boolean) => {
  if (held.has(code) === down) return;
  if (down) held.add(code); else held.delete(code);
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code, bubbles: true }));
};
const tap = async (code: number) => { key(code, true); await wait(50); key(code, false); await wait(30); };
const results: string[] = [];
const report = () => { document.querySelector('#result')!.textContent = results.join('\n'); };
const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); results.push('PASS ' + message); report(); };
const until = async (predicate: () => boolean, timeout = 5000) => {
  const start = performance.now();
  while (!predicate()) {
    if (performance.now() - start > timeout) throw new Error('Timed out awaiting fishing state');
    await wait(20);
  }
};
try {
  results.push(...checkFightModel()); report();
  await wait(900);
  const scene = game.scene.getScene('river') as RiverScene;
  const fishing = scene.fishing;
  const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
  const body = kayak.body as Phaser.Physics.Arcade.Body;
  const approach = (index: number) => {
    const spot = fishing.spots[index];
    body.reset(spot.x - 35, spot.y);
  };
  body.reset(800, 1320);
  await tap(69);
  check(fishing.state === 'idle', 'Cannot fish outside interaction range');
  approach(0);
  key(68, true);
  await wait(200);
  await tap(69);
  check(fishing.state === 'idle', 'Cannot cast while paddling too fast');
  key(68, false);
  await wait(1100);

  // Catch three times, using both controls and checking a held movement key.
  for (let i = 0; i < 3; i++) {
    approach(i);
    await tap(i === 1 ? 32 : 69);
    check(fishing.state === 'casting' || fishing.state === 'waiting', `Cast ${i + 1} starts`);
    const position = new Phaser.Math.Vector2(kayak.x, kayak.y);
    key(65, true);
    await until(() => fishing.state === 'hooked');
    check(position.distance(kayak) < .1 && body.velocity.length() === 0, `Cast ${i + 1} locks movement`);
    const code = i === 1 ? 32 : 69;
    let reeling = false;
    while (fishing.state === 'hooked') {
      if (fishing.fight!.tension < .35) reeling = true;
      if (fishing.fight!.tension > .65) reeling = false;
      key(code, reeling); await wait(20);
    }
    key(code, false);
    check(fishing.fight?.outcome === 'landed', `Catch ${i + 1} rewards responsive tension control`);
    check(fishing.caughtFishCount === i + 1 && fishing.state === 'result', `Catch ${i + 1} succeeds and increments count once`);
    await wait(200);
    check(body.velocity.x < -20, `Catch ${i + 1} immediately restores controls`);
    key(65, false);
    await until(() => fishing.state === 'idle');
    approach(i);
    await tap(69);
    check(fishing.state === 'idle', `Caught spot ${i + 1} is inactive`);
  }
  // Wait for a real respawn rather than reducing production timings for tests.
  approach(0);
  await wait(FISHING.spotRespawnTime * 1000);
  await tap(69);
  check(fishing.state === 'casting' || fishing.state === 'waiting', 'Fishing spot returns after cooldown');
  await until(() => fishing.state === 'hooked');
  key(69, true);
  await until(() => fishing.state === 'result');
  key(69, false);
  check(fishing.fight?.outcome === 'snapped' && fishing.caughtFishCount === 3, 'Continuous holding snaps the line without awarding fish');
  key(68, true); await wait(200);
  check(body.velocity.x > 20, 'Snapped line restores controls');
  key(68, false); await until(() => fishing.state === 'idle');
  for (let attempt = 0; attempt < 2; attempt++) {
    approach(0); await tap(32);
    await until(() => fishing.state === 'hooked');
    await until(() => fishing.state === 'result');
    check(fishing.fight?.outcome === 'escaped' && fishing.caughtFishCount === 3, `Release-only attempt ${attempt + 1} loses the fish`);
    key(83, true); await wait(200);
    check(body.velocity.y > 20, `Loose-line failure ${attempt + 1} restores movement`);
    key(83, false); await until(() => fishing.state === 'idle');
  }
  approach(0);
  await tap(32);
  await until(() => fishing.state === 'hooked');
  game.events.emit(Phaser.Core.Events.BLUR);
  check(fishing.state === 'idle', 'Focus loss cancels fishing safely');
  key(68, true);
  await wait(200);
  check(body.velocity.x > 20, 'Focus cancellation restores movement');
  results.push('All tension fishing checks passed.');
  report();
} catch (error) {
  results.push('FAIL ' + error);
  report();
} finally {
  for (const code of [69, 32, 87, 65, 83, 68]) key(code, false);
  game.destroy(true);
}
