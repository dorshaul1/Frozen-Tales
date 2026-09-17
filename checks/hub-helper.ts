// Other system fixtures position actors directly; village.ts separately verifies real walking routes.
import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home, HUB, type HubInteraction } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { VILLAGE,WORKSHOP_BAY } from '../src/game/home/villageLayout';
export function visitNpc(scene: RiverScene, view: HubInteraction) {
  scene.harborPanel.close();
  const home=Reflect.get(scene,'home') as Home;
  const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
  if(view==='gear'){home.walking=false;home.fisherman.setVisible(false);kayak.setOccupied(true);(kayak.body as Phaser.Physics.Arcade.Body).reset(WORKSHOP_BAY.x,WORKSHOP_BAY.y);home.setMovementEnabled(true);return;}
  if(!home.walking){(kayak.body as Phaser.Physics.Arcade.Body).reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();}
  const npc=view==='cargo'?HUB.seller:view==='tools'?VILLAGE.npcs.tools:HUB.keeper;
  home.fisherman.setPosition(npc.x+25,npc.y);
  if(view==='cargo')home.fisherman.setPosition(npc.x,npc.y+26);
}
export function boardKayak(scene: RiverScene) {
  scene.harborPanel.close();
  const home=Reflect.get(scene,'home') as Home;
  if(home.walking){home.fisherman.setPosition(VILLAGE.dock.landX,VILLAGE.dock.landY);home.interactDock();}
}
