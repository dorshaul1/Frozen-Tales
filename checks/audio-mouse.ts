import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
const scene=new RiverScene(null,true);
new Phaser.Game({type:Phaser.AUTO,width:900,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.audioPanel)await new Promise(r=>setTimeout(r,100));
scene.audioPanel.open();
setInterval(()=>{document.querySelector('#result')!.textContent=['master','music','sfx'].map(id=>`${id}: ${Math.round(scene.audio.settings[id as 'master'].volume*100)}%`).join(' | ')+` | help: ${Reflect.get(scene.audioPanel,'helpPage')} | open: ${scene.audioPanel.isOpen}`;},100);
