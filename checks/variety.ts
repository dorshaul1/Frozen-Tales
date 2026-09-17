import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { banks } from '../src/game/world/river';
import { ASSET_FRAMES,COLLISION_MASKS } from '../src/game/assets/catalog';
const scene=new RiverScene(null,true);
const game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
for(const [label,y]of [['Starting River',1750],['Blue Ice Bend',2630],['Frozen Lake',3530],['Glacier Gorge',5290]] as const){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{scene.cameras.main.stopFollow();scene.cameras.main.centerOn(banks(y)[0]-30,y);};document.querySelector('#controls')!.append(b);}
const narrow=document.createElement('button');narrow.textContent='Narrow';narrow.onclick=()=>game.scale.resize(580,700);document.querySelector('#controls')!.append(narrow);
scene.cameras.main.stopFollow();scene.cameras.main.centerOn(banks(1750)[0]-30,1750);
console.log('Validated frames',Object.keys(ASSET_FRAMES).length,'collision masks',Object.keys(COLLISION_MASKS).length);
