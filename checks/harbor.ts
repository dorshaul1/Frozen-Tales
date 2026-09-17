import { visitNpc, boardKayak } from './hub-helper';
import Phaser from 'phaser';
import { Kayak } from '../src/game/entities/Kayak';
import { RiverScene } from '../src/game/scenes/RiverScene';
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'test', width: location.search.includes('small') ? 400 : 900, height: 620, pixelArt: true, physics: { default: 'arcade' }, scene: [new RiverScene(null, true)] });
setTimeout(() => {
 const scene = game.scene.getScene('river') as RiverScene;
 // Only this isolated visual fixture receives money/fish; the user's save is never used.
 scene.wallet.credit(1000);
 for (let i = 0; i < 3; i++) scene.equipment.purchase('cargo');
 for (let i = 0; i < 12; i++) scene.cargo.add(i % 2 ? 'char' : 'whitefish', 0, () => .1 + i * .06);
 for (const tab of ['cargo', 'gear', 'journal'] as const) {
   const button = document.createElement('button'); button.textContent = tab;
   button.onclick = () => {
     visitNpc(scene,tab); scene.harborPanel.open(tab);
   }; document.querySelector('#views')!.append(button);
 }
 const catchButton = document.createElement('button'); catchButton.textContent = 'catch card';
 catchButton.onclick = async () => {
   boardKayak(scene); scene.cargo.unload();
   for (const key of Object.keys(scene.cargo.records)) delete scene.cargo.records[key as keyof typeof scene.cargo.records];
   const kayak = scene.children.list.find(child => child instanceof Kayak) as Kayak;
   (kayak.body as Phaser.Physics.Arcade.Body).reset(797, 1200);
   const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
   let held = false;
   const reel = (down: boolean) => {
     if (held === down) return; held = down;
     window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: 69, which: 69, bubbles: true }));
   };
   await wait(100); reel(true); await wait(80); reel(false);
   const start = performance.now();
   while (scene.fishing.state !== 'result' && performance.now() - start < 10000) {
     if (scene.fishing.fight) {
       if (scene.fishing.fight.tension < .38) reel(true);
       if (scene.fishing.fight.tension > .61) reel(false);
     }
     await wait(20);
   }
   reel(false); await wait(100); game.loop.stop();
 };
 document.querySelector('#views')!.append(catchButton);
 const hub = document.createElement('button'); hub.textContent = 'show hub';
 hub.onclick = () => scene.harborPanel.close(); document.querySelector('#views')!.append(hub);
 visitNpc(scene,'cargo'); scene.harborPanel.open('cargo');
 scene.events.on('update', () => { document.querySelector('#result')!.textContent = `Visual fixture: ${scene.cargo.count}/${scene.cargo.capacity} fish, $${scene.wallet.balance}. Keyboard ↑↓ selects / scrolls, E sells or buys, Esc restores walking.`; });
}, 900);
