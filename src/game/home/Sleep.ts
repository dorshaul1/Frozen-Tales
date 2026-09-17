import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { Home } from './Home';
import { VILLAGE } from './villageLayout';
import { Environment } from '../world/conditions';
import { AudioManager } from '../audio/AudioManager';

const igloo = VILLAGE.buildings[0];
export const SLEEP = { outside: { x: igloo.x + 99, y: igloo.y + 47 }, distance: 23, duration: 3.4, dawnAt: 2.15 };

/** A small world transition, sharing the existing clock, home and save systems. */
export class Sleep {
  active = false;
  private elapsed = 0;
  private advanced = false;
  private start = { x: 0, y: 0 };
  private veil: Phaser.GameObjects.Graphics;
  private sky: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  private saved = true;
  constructor(private scene: Phaser.Scene, private home: Home, private environment: Environment, private audio: AudioManager, private newMorning: () => boolean) {
    const style = { fontFamily: 'monospace', fontSize: '10px', color: '#f3d49a', stroke: '#173642', strokeThickness: 3 };
    this.hint = pixelText(scene,SLEEP.outside.x, SLEEP.outside.y - 28, '', style).setOrigin(.5, 1).setDepth(5);
    this.veil = scene.add.graphics().setDepth(40);
    this.sky = scene.add.graphics().setDepth(41);
    this.label = pixelText(scene,0, 0, '', style).setOrigin(.5).setDepth(42).setVisible(false);
  }
  get near() { return this.home.walking && Phaser.Math.Distance.BetweenPoints(this.home.fisherman, SLEEP.outside) <= SLEEP.distance; }
  get canSleep() { return this.near && (this.environment.phase === 'evening' || this.environment.phase === 'night'); }
  updateHint(available: boolean) {
    this.hint.setVisible(available && this.near).setText(this.canSleep ? 'E — Sleep' : 'Too early to sleep');
  }
  begin() {
    if (this.active || !this.canSleep) return false;
    this.active = true; this.elapsed = 0; this.advanced = false;
    this.start = { x: this.home.fisherman.x, y: this.home.fisherman.y };
    this.home.setMovementEnabled(false); this.hint.setVisible(false);
    this.audio.play('sleep', .35);
    const button = document.getElementById('settings-button') as HTMLButtonElement | null;
    if (button) button.disabled = true;
    return true;
  }
  update(delta: number, skip: boolean) {
    if (!this.active) return;
    this.elapsed += Math.min(delta, 50) / 1000;
    if (skip && this.elapsed > .15 && this.elapsed < SLEEP.dawnAt) this.elapsed = SLEEP.dawnAt;
    const t = this.elapsed, player = this.home.fisherman;
    this.home.setMovementEnabled(false);
    if (t < .55) {
      const step = Phaser.Math.SmoothStep(t / .55, 0, 1);
      player.setPosition(Phaser.Math.Linear(this.start.x, igloo.x + 83, step), Phaser.Math.Linear(this.start.y, SLEEP.outside.y, step));
      player.play('fisherman/W/walk', true).setAlpha(1 - step);
    } else player.setVisible(false);
    if (t >= SLEEP.dawnAt && !this.advanced) {
      this.advanced = true; this.saved = this.newMorning();
      player.setPosition(SLEEP.outside.x, SLEEP.outside.y).setAlpha(1).play('fisherman/E/idle', true);
    }
    const darkness = t < 1.1 ? Phaser.Math.Clamp((t - .25) / .85, 0, 1) : t < SLEEP.dawnAt ? 1 : Phaser.Math.Clamp((SLEEP.duration - t) / (SLEEP.duration - SLEEP.dawnAt), 0, 1);
    this.audio.setSleepMix(darkness);
    this.home.lighting.homeWarmth = t < SLEEP.dawnAt ? 1 : darkness;
    if (this.advanced) player.setVisible(true);
    const view = this.scene.cameras.main.worldView, x = Math.round(view.centerX), y = Math.round(view.centerY);
    this.veil.clear().fillStyle(0x142b3c, darkness).fillRect(view.x - 20, view.y - 20, view.width + 40, view.height + 40);
    this.sky.clear();
    const skyAlpha = Phaser.Math.Clamp((t - .65) / .35, 0, 1) * (this.advanced ? darkness : 1);
    const progress = Phaser.Math.Clamp((t - 1.1) / 1.4, 0, 1);
    // Native pixel clusters: a drifting crescent and fading stars give way to dawn.
    this.sky.setAlpha(skyAlpha);
    const stars = [[-61,-34],[-39,-17],[-15,-44],[12,-29],[48,-40],[67,-13],[35,-7],[-70,-5],[3,-51]];
    for (const [i, [sx, sy]] of stars.entries()) {
      this.sky.fillStyle(0xdde7e5, (1 - progress) * (.65 + Math.sin(t * 2 + i) * .15)).fillRect(x + sx, y + sy, 1 + i % 2, 1 + i % 2);
    }
    const mx = x - 22 - Math.round(progress * 28), my = y - 23 + Math.round(progress * 8);
    this.sky.fillStyle(0xf3d49a, 1 - progress);
    for (let py = -8; py <= 8; py++) for (let px = -8; px <= 8; px++) {
      if (px * px + py * py <= 64 && (px - 4) ** 2 + (py + 3) ** 2 > 55) this.sky.fillRect(mx + px, my + py, 1, 1);
    }
    const sunrise = Phaser.Math.Clamp((progress - .3) / .7, 0, 1);
    this.sky.fillStyle(0xe7b664, sunrise).fillRect(x - 7, y - 14, 14, 8).fillRect(x - 4, y - 17, 8, 3);
    this.sky.fillStyle(0xbdcfd8, sunrise * .7).fillRect(x - 34, y - 5, 68, 2);
    this.label.setVisible(true).setPosition(x, y + 20).setAlpha(skyAlpha).setText(this.advanced ? 'A fresh morning' : 'Resting at home\nE / Space — skip');
    if (t >= SLEEP.duration) {
      this.active = false; this.veil.clear(); this.sky.clear(); this.label.setVisible(!this.saved).setAlpha(1).setText('Could not save · storage unavailable');
      if (!this.saved) this.scene.time.delayedCall(3500, () => this.label.setVisible(false));
      this.home.lighting.homeWarmth = 0; this.audio.setSleepMix(0);
      this.scene.input.keyboard?.resetKeys(); this.home.setMovementEnabled(true);
      const button = document.getElementById('settings-button') as HTMLButtonElement | null;
      if (button) button.disabled = false;
    }
  }
}
