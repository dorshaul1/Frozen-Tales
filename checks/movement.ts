// Browser integration check: run via /checks/movement.html on the Vite server.
import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { banks, ICE_CHUNKS } from '../src/game/world/river';
import { MOVEMENT } from '../src/game/tuning';

const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 640, height: 480, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(null, true)] });
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const results: string[] = [];
const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); results.push('PASS ' + message); };
const key = (code: number, down: boolean) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code, bubbles: true }));
try {
  await wait(1000);
  const scene = game.scene.getScene('river');
  const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
  const body = kayak.body as Phaser.Physics.Arcade.Body;
  const initialX = kayak.x;
  key(68, true);
  await wait(250);
  check(body.speed > 20 && body.speed < 100, 'Acceleration ramps up');
  await wait(700);
  check(kayak.x > initialX + 40, 'WASD moves the kayak');
  const straight = body.speed;
  key(87, true);
  await wait(700);
  check(Math.abs(body.speed - straight) < 8, 'Diagonal speed stays normalized');
  check(Math.abs(scene.cameras.main.midPoint.x - kayak.x) < 50, 'Camera follows kayak');
  key(68, false); key(87, false);
  await wait(150);
  check(body.speed > 10 && body.speed < straight, 'Release coasts and decelerates');
  await wait(2100);
  check(body.speed < 1, 'Kayak settles to rest');
  key(39, true);
  await wait(3400);
  const [left, right] = banks(kayak.y);
  check(kayak.x > left && kayak.x <= right - 10, 'Arrow input cannot cross land');
  check(body.blocked.right, 'Right bank registers collision');
  key(39, false);
  key(37, true);
  await wait(500);
  check(body.velocity.x < -50, 'Kayak can move away from bank');
  key(37, false);
  // Reset between headings so each keyboard test has the same open-water runway.
  const headings = [
    [87], [87, 68], [68], [68, 83], [83], [83, 65], [65], [65, 87],
  ];
  for (let i = 0; i < headings.length; i++) {
    body.reset(800, 1250);
    for (const code of headings[i]) key(code, true);
    await wait(450);
    check(Math.abs(body.velocity.length() - MOVEMENT.maxSpeed) < 2, `Direction ${i + 1}/8 reaches normalized cruise speed`);
    await wait(100);
    const facingError = Math.abs(Phaser.Math.Angle.Wrap(kayak.rotation - body.velocity.angle() - Math.PI / 2));
    check(facingError < .12, `Direction ${i + 1}/8 faces travel`);
    for (const code of headings[i]) key(code, false);
  }
  body.reset(800, 1250);
  key(68, true);
  await wait(450);
  const heading = kayak.rotation;
  key(68, false); key(87, true);
  await wait(70);
  check(body.velocity.x > 50 && body.velocity.y < 0, 'Turning preserves some sideways momentum');
  check(Math.abs(Phaser.Math.Angle.Wrap(kayak.rotation - heading)) < .6, 'Heading turns smoothly instead of snapping');
  await wait(550);
  key(87, false);
  const driftStart = new Phaser.Math.Vector2(kayak.x, kayak.y);
  await wait(1100);
  const driftDistance = driftStart.distance(kayak);
  check(driftDistance > 15 && driftDistance < 40 && body.velocity.length() === 0, 'Release has a short natural drift (15–40 pixels)');
  const ice = ICE_CHUNKS[0];
  body.reset(ice.x + ice.width / 2, ice.y + ice.height + 75);
  key(38, true);
  await wait(1200);
  check(body.blocked.up && kayak.y >= ice.y + ice.height + MOVEMENT.hullRadius - 1, 'Ice chunk blocks the hull');
  key(38, false); key(40, true);
  await wait(400);
  check(body.velocity.y > 80, 'Kayak can paddle away from ice');
  key(40, false);
  // Controlled delta checks catch accidental frame-dependent steering changes.
  const accelerationSpeeds: number[] = [];
  const driftSpeeds: number[] = [];
  for (const fps of [30, 60, 120]) {
    body.reset(800, 1250);
    key(68, true);
    for (let i = 0; i < fps / 5; i++) kayak.update(0, 1000 / fps);
    accelerationSpeeds.push(body.velocity.length());
    key(68, false);
    body.velocity.set(MOVEMENT.maxSpeed, 0);
    for (let i = 0; i < fps / 2; i++) kayak.update(0, 1000 / fps);
    driftSpeeds.push(body.velocity.length());
  }
  check(Math.max(...accelerationSpeeds) - Math.min(...accelerationSpeeds) < .01, 'Acceleration consistent at 30/60/120 FPS');
  check(Math.max(...driftSpeeds) - Math.min(...driftSpeeds) < .01, 'Drag consistent at 30/60/120 FPS');
  document.querySelector('#result')!.textContent = results.join('\n');
} catch (error) {
  document.querySelector('#result')!.textContent = results.join('\n') + '\nFAIL ' + error;
} finally {
  for (const code of [87, 65, 83, 68, 37, 38, 39, 40]) key(code, false);
  game.destroy(true);
}
