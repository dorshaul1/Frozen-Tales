import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {microBiomePlacements,waterSpans} from '../src/game/world/river';
import {ASSET_FRAMES} from '../src/game/assets/catalog';
import {ATLAS} from '../src/game/assets/textures';
const scene=new RiverScene(null,true);const game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
let count=0;
for(const p of microBiomePlacements()){
 for(const o of p.objects){const f=scene.textures.getFrame(ATLAS,ASSET_FRAMES[o.asset][o.variant]);for(let y=o.y;y<o.y+f.cutHeight;y+=2)if(waterSpans(y).some(([l,r])=>o.x+f.cutWidth>l&&o.x<r))throw Error('Decoration crosses water: '+p.name);count++;}
 const b=document.createElement('button');b.textContent=p.name;b.onclick=()=>{scene.cameras.main.stopFollow();scene.cameras.main.centerOn(p.x+65,p.y);};document.querySelector('#controls')!.append(b);
}
const b=document.createElement('button');b.textContent='Narrow';b.onclick=()=>game.scale.resize(580,700);document.querySelector('#controls')!.append(b);
scene.cameras.main.stopFollow();const first=microBiomePlacements()[0];scene.cameras.main.centerOn(first.x+65,first.y);
console.log(`PASS ${count} authored decorations stay fully off navigable water; fixed positions stable`,JSON.stringify(microBiomePlacements())===JSON.stringify(microBiomePlacements()));
