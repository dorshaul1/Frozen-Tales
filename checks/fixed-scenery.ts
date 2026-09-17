import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
scene.scene.pause();const kayak=Reflect.get(scene,'kayak'),nav=Reflect.get(scene,'navigation'),home=Reflect.get(scene,'home');
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
const scenery=scene.children.list.filter(o=>o instanceof Phaser.GameObjects.Image&&(/^(tree|cave|blue-ice|broken-glacier|rock)/.test(o.frame.name)||o.texture.key==='river')) as Phaser.GameObjects.Image[];
const positions=scenery.map(o=>[o.x,o.y]);
for(let i=0;i<300;i++){scene.cameras.main.setScroll(i*.5,1000+i*.3);nav.update(i*16.67,16.67);home.update(16.67,true,.5);}
check(scenery.every((o,i)=>o.x===positions[i][0]&&o.y===positions[i][1]),'All tree/cave/glacier images and baked world remain at fixed world coordinates');
const floes=Reflect.get(nav,'floes');check(floes.length>0,'Drifting-fragment fixture exists');
for(const f of floes){
 check(f.image.scaleX===1&&f.image.frame.name.startsWith('ice-fragment/'),'Only native small fragments drift');
 const x=f.image.x,y=f.image.y;
 for(const zone of f.bodies){
  check(zone.body instanceof Phaser.Physics.Arcade.StaticBody,'Fragment collision cannot transfer kayak velocity');
  const bx=zone.x,by=zone.y;kayak.body.reset(bx,by);kayak.setVelocity(120,0);scene.physics.collide(kayak,zone,nav.hit);
  check(zone.x===bx&&zone.y===by&&f.image.x===x&&f.image.y===y,'Contact moves neither obstacle nor its visual');
 }
}
out.textContent+='ALL FIXED SCENERY CHECKS PASSED';
