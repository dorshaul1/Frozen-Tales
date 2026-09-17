import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {SaveStore} from '../src/game/player/SaveStore';
import {WORKSHOP_BAY} from '../src/game/home/villageLayout';
import {checkProgressionModel} from './progression-model';
const key='arctic-drift.check-items',saved=new SaveStore(key).load(),scene=new RiverScene(key,true);
const small=new URLSearchParams(location.search).has('small');
const game=new Phaser.Game({type:Phaser.AUTO,width:small?560:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));game.events.off(Phaser.Core.Events.BLUR);
const out=document.querySelector('#result')!,check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
check(JSON.stringify(scene.equipment.loadout)===JSON.stringify(saved.loadout),'Fresh browser page restores exact loadout');
check(scene.equipment.gear.rod===3&&scene.equipment.value('finder')>0&&scene.equipment.value('lantern')>0,'Equipped rod and personal utilities survive page reload');
check(scene.cargo.count===6&&scene.cargo.capacity===12,'Cargo and installed storage survive page reload');
for(const line of checkProgressionModel())out.textContent+='\n'+line;
const home=Reflect.get(scene,'home'),kayak=Reflect.get(scene,'kayak'),layers=Reflect.get(kayak,'attachments') as Map<string,Phaser.GameObjects.Image>;
check([...layers.entries()].filter(([,image])=>image.visible).map(([id])=>id).sort().join(',')==='cargo,hull,turbo','Only fitted parts appear after reload');
const preview=(tools:boolean)=>{
 scene.harborPanel.close();home.walking=tools;home.fisherman.setVisible(tools).setPosition(349,1206);kayak.setOccupied(!tools);home.setMovementEnabled(true);
 (kayak.body as Phaser.Physics.Arcade.Body).reset(WORKSHOP_BAY.x,WORKSHOP_BAY.y);
 scene.cameras.main.stopFollow();scene.cameras.main.centerOn(tools?349:WORKSHOP_BAY.x,tools?1206:WORKSHOP_BAY.y);
 scene.harborPanel.open(tools?'tools':'gear');
};
for(const tools of [true,false]){const button=document.createElement('button');button.textContent=tools?'Player Gear preview':'Workshop preview';button.onclick=()=>preview(tools);document.body.prepend(button);}
preview(true);
check(scene.harborPanel.isOpen,'Restored player can interact with Edda');
out.textContent+='\nALL RELOAD CHECKS PASSED';
