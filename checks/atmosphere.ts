import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { onSnow } from '../src/game/world/Ambience';
import { ASSETS, COLLISION_MASKS } from '../src/game/assets/catalog';
const game = new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1040,height:700,pixelArt:true,physics:{default:'arcade'},scene:[new RiverScene(null, true)]});
setTimeout(() => {
 const scene=game.scene.getScene('river') as RiverScene;
 const animals=scene.children.list.filter(o=>o instanceof Phaser.GameObjects.Sprite && /^(penguin|polar-bear)\//.test(o.frame.name)) as Phaser.GameObjects.Sprite[];
 const result=document.querySelector('#result')!;
 const kayak=scene.children.list.find(o=>o instanceof Kayak) as Kayak;
 const body=kayak.body as Phaser.Physics.Arcade.Body;
 let frames=0, failed=false;
 scene.events.on('update',()=>{
  frames++;
  if(animals.some(a=>!onSnow(a.x,a.y,a.frame.name.startsWith('polar-bear')?29:12))) failed=true;
  result.textContent=`${failed?'FAIL':'PASS'} ${animals.length} land animals stay on snow; ${frames} frames observed.\n${animals.filter(a=>a.frame.name.startsWith('polar-bear')).length} solitary bear. Decorative wildlife has no physics bodies. ${Math.round(game.loop.actualFps)} FPS.`;
 });
 const sealMask=COLLISION_MASKS[ASSETS['ice-wide'].replace('/0','/1')];
 if(!sealMask) throw new Error('Missing floe mask');
 for(const [label,x,y] of [['Home',686,1216],['Penguins north',1130,540],['Penguins south',580,1730],['Bear',940,2010],['Seal',810,1040]] as const){
  const button=document.createElement('button');button.textContent=label;
  button.onclick=()=>{body.reset(x,y);scene.cameras.main.centerOn(x,y);};document.querySelector('#views')!.append(button);
 }
},900);
