import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: 1040, height: 700, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(null, true)] });
setTimeout(() => {
  const scene = game.scene.getScene('river') as RiverScene;
  const inspect = scene as unknown as {
    audio: { manager: {context:AudioContext}; settings: {master:{muted:boolean}}; setMute(channel: 'master', value:boolean): void };
    ambience: { tracks: { age: number }[]; falling: unknown[]; animals: { sprite: Phaser.GameObjects.Sprite }[] };
  };
  const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
  const body = kayak.body as Phaser.Physics.Arcade.Body;
  const result = document.querySelector('#result')!;
  const button = (name: string, action: () => void) => {
    const b = document.createElement('button'); b.textContent = name; b.onclick = action;
    document.querySelector('#controls')!.append(b);
  };
  button('Penguin tracks', () => { body.reset(1130, 540); scene.cameras.main.centerOn(1130, 540); });
  button('Sound sample', () => {
    ['cast', 'bite', 'catch', 'snap', 'step', 'bird', 'ice'].forEach((cue, i) => scene.time.delayedCall(i * 450, () => scene.events.emit('river-cue', cue, .4)));
  });
  button('Toggle sound', () => inspect.audio.setMute('master', !inspect.audio.settings.master.muted));
  button('Fishing spot', () => { body.reset(810, 1200); scene.cameras.main.centerOn(810, 1200); });
  let maximumTracks = 0, maximumSnow = 0;
  scene.events.on('update', () => {
    maximumTracks = Math.max(maximumTracks, inspect.ambience.tracks.length);
    maximumSnow = Math.max(maximumSnow, inspect.ambience.falling.length);
    const tracksSafe = inspect.ambience.tracks.length <= 90 && inspect.ambience.tracks.every(t => t.age < 24);
    result.textContent = `${tracksSafe ? 'PASS' : 'FAIL'} bounded fading tracks: ${inspect.ambience.tracks.length}, peak ${maximumTracks}; branch snow peak ${maximumSnow}.\nAudio: ${inspect.audio.manager.context?.state ?? 'waiting for real input'}, muted=${inspect.audio.settings.master.muted}.\nFPS ${Math.round(game.loop.actualFps)}. Animals use directional frames, not runtime rotation: ${inspect.ambience.animals.every(a => a.sprite.rotation === 0)}.`;
  });
}, 900);
