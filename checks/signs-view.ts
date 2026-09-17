import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { WATER_SIGNS,type WaterSign } from '../src/game/fishing/spotReading';
const scene=new RiverScene('arctic-drift.check-signs',true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
while(!scene.fishing)await wait(100);
const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
(kayak.body as Phaser.Physics.Arcade.Body).reset(892,1200);
const spot=Reflect.get(scene.fishing,'spots')[0];
for(const sign of Object.keys(WATER_SIGNS) as WaterSign[]){const b=document.createElement('button');b.textContent=sign;b.onclick=()=>{spot.sign=sign;};document.body.prepend(b);}
const b=document.createElement('button');b.textContent='Narrow';b.onclick=()=>game.scale.resize(440,680);document.body.prepend(b);
document.querySelector('#result')!.textContent='Water signals · use buttons to compare. E casts using the normal minigame.';
