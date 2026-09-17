import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {MAP_MARKERS} from '../src/game/map/discovery';
const scene=new RiverScene('arctic-drift.check-map',true);
new Phaser.Game({type:Phaser.AUTO,parent:'test',width:440,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.map)await new Promise(r=>setTimeout(r,100));
const ok=MAP_MARKERS.every(m=>scene.map.discovery.landmarks.has(m.id)&&scene.map.discovery.known(m.x,m.y));
document.querySelector('#result')!.textContent=ok?'PASS Fresh page restores discovered landmarks and river sections':'FAIL Saved discovery missing';
scene.map.open();
