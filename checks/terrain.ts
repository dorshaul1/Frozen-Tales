import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { banks, waterSpans, createFloes, ICE_CHUNKS } from '../src/game/world/river';
import { ASSET_FRAMES, COLLISION_MASKS } from '../src/game/assets/catalog';
import { MOVEMENT } from '../src/game/tuning';

const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 1040, height: 700, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(null, true)] });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const key = (code: number, down: boolean) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code, bubbles: true }));
const results: string[] = [];
const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); results.push('PASS ' + message); document.querySelector('#result')!.textContent = results.join('\n'); };
try {
  await wait(900);
  const scene = game.scene.getScene('river') as RiverScene;
  const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
  const body = kayak.body as Phaser.Physics.Arcade.Body;
  const floes = createFloes();
  check(JSON.stringify(floes) === JSON.stringify(createFloes()), 'Floe placement is deterministic');
  check(floes.length >= 8 && new Set(floes.map(f => f.variant)).size === 3, 'Multiple irregular shapes and scattered fragments');
  let gridAligned = 0;
  for (let y = 200; y < 2200; y += 2) if (banks(y)[0] % 16 === 0) gridAligned++;
  check(gridAligned < 150, 'Shoreline is not aligned to the former 16px cells');
  for (const floe of floes) {
    const spans = COLLISION_MASKS[ASSET_FRAMES[floe.asset][floe.variant]];
    for (const [x, y, w, h] of spans) for (let row = 0; row < h * floe.scale; row++) {
      const wy = floe.y - 4 * floe.scale + y * floe.scale + row, [left, right] = banks(wy);
      const wx = floe.x - 4 * floe.scale + x * floe.scale;
      if (wx < left || wx + w * floe.scale > right) throw new Error('Floe overlaps land');
    }
  }
  // Keep the output compact after exhaustive pixel-mask placement checks.
  results.splice(3); results.push('PASS Every generated floe pixel is in water');
  // Two-pixel contour steps plus one physics-step separation can leave up to 4px clearance.
  const bankDistance = (side: 'left' | 'right') => {
    let distance = Infinity;
    for (let y = Math.floor(kayak.y / 2) * 2 - 24; y <= kayak.y + 24; y += 2) {
      const [left, right] = banks(y);
      const dx = side === 'left' ? Math.max(0, kayak.x - left) : Math.max(0, right - kayak.x);
      const dy = kayak.y - Phaser.Math.Clamp(kayak.y, y, y + 2);
      distance = Math.min(distance, Math.hypot(dx, dy));
    }
    return distance;
  };
  for (const sampleY of [350, 780, 1200, 1620, 2080]) {
    let y = sampleY === 1200 ? 1460 : sampleY; // Clear of the waterfront workshop rails (1274–1398), including hull radius.
    while (floes.some(floe => y > floe.y - 24 && y < floe.y + floe.height + 24)) y += 34;
    // A branch mouth is open water, not the old main-river bank. Test solid shoreline.
    while(Array.from({length:21},(_,i)=>y-20+i*2).some(yy=>{const [l,r]=banks(yy);return !waterSpans(yy).some(([a,b])=>a===l&&b===r);}))y+=30;
    const [left, right] = banks(y);
    body.reset(left + 38, y); key(65, true); await wait(850); key(65, false);
    check(bankDistance('left') >= MOVEMENT.hullRadius - .5 && bankDistance('left') <= MOVEMENT.hullRadius + 4, `Left contour blocks kayak at y=${y} (distance ${bankDistance('left').toFixed(1)}, position ${kayak.x.toFixed(1)},${kayak.y.toFixed(1)}, body ${body.center.x.toFixed(1)},${body.center.y.toFixed(1)}, r${body.radius})`);
    body.reset(right - 38, y); key(68, true); await wait(850); key(68, false);
    check(bankDistance('right') >= MOVEMENT.hullRadius - .5 && bankDistance('right') <= MOVEMENT.hullRadius + 4, `Right contour blocks kayak at y=${y} (distance ${bankDistance('right').toFixed(1)})`);
  }
  for (const floe of ICE_CHUNKS) {
    body.reset(floe.x + floe.width / 2, floe.y + floe.height + 40);
    key(87, true); await wait(1000); key(87, false);
    let closest = Infinity;
    const spans = COLLISION_MASKS[ASSET_FRAMES[floe.asset][floe.variant]];
    for (const [x, y, w, h] of spans) {
      const rx = floe.x - 4 + x, ry = floe.y - 4 + y;
      const dx = kayak.x - Phaser.Math.Clamp(kayak.x, rx, rx + w), dy = kayak.y - Phaser.Math.Clamp(kayak.y, ry, ry + h);
      closest = Math.min(closest, Math.hypot(dx, dy));
      if (dx * dx + dy * dy < (MOVEMENT.hullRadius - .5) ** 2) throw new Error('Kayak overlaps visible floe pixels');
    }
    check(closest <= MOVEMENT.hullRadius + 2, `Natural floe collision at ${floe.x}, ${floe.y}`);
  }
  check(true, 'Collision masks prevent entering visible floe pixels');
  for (const [name, y] of [['Home', 1200], ['Upper bend', 780], ['Lower narrows', 1620], ['Headwater', 200]] as const) {
    const button = document.createElement('button'); button.textContent = name;
    button.onclick = () => { const [l, r] = banks(y); body.reset((l + r) / 2, y); scene.cameras.main.centerOn(kayak.x, kayak.y); };
    document.querySelector('#views')!.append(button);
  }
  const [l, r] = banks(1200); body.reset((l + r) / 2, 1200);
  results.push('Terrain checks passed. Buttons inspect different river sections.');
  document.querySelector('#result')!.textContent = results.join('\n');
} catch (error) { results.push('FAIL ' + error); document.querySelector('#result')!.textContent = results.join('\n'); }
finally { for (const code of [65, 68, 87]) key(code, false); }
