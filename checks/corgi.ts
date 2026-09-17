import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {ATLAS,ASSET_FRAMES} from '../src/game/assets/textures';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
scene.cameras.main.stopFollow();scene.cameras.main.centerOn(390,1180);
const out=document.querySelector('#result')!;out.textContent='Corgi directional animation review';
for(const [i,d]of ['N','S','E','W'].entries())scene.add.sprite(340+i*42,1190,ATLAS,ASSET_FRAMES['village-corgi'][0]).setDepth(10).play(`village-corgi/${d}/walk`);
const home=Reflect.get(scene,'home'),{VillageCorgi}=await import('../src/game/home/VillageCorgi');
const dog=new VillageCorgi(scene,[...Reflect.get(home.fisherman,'obstacles')].filter(r=>!(r.radius===8)),()=>home.player);
let valid=true;const states=new Set();
for(let i=0;i<12000;i++){Reflect.get(dog,'update').call(dog,i*50,50);valid&&=dog.valid(dog.sprite.x,dog.sprite.y);states.add(Reflect.get(dog,'state'));}
out.textContent+=` · ${valid?'PASS':'FAIL'} 10 simulated minutes valid terrain · ${states.size} behaviors`;
dog.sprite.setVisible(false);

const {canWalk}=await import('../src/game/home/villageLayout');
const obstacles=Reflect.get(home.fisherman,'obstacles');const body=obstacles.find((r:any)=>r.radius===8);
if(!body||canWalk(body.x,body.y,obstacles))throw Error('Dog collision missing');
out.textContent+=' · PASS player blocked at dog body';
