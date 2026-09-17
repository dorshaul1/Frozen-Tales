import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { VILLAGE, canWalk, type VillageRect } from '../src/game/home/villageLayout';
const results:string[]=[];
const check=(ok:boolean,text:string)=>{results.push(`${ok?'PASS':'FAIL'} ${text}`);document.querySelector('#result')!.textContent=results.join('\n');if(!ok)throw Error(text);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const scene=new RiverScene(null,true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:600,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
try{
 await wait(1600);const home=Reflect.get(scene,'home') as Home,kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 (kayak.body as Phaser.Physics.Arcade.Body).reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();
 const walker=home.fisherman,obstacles=Reflect.get(walker,'obstacles') as VillageRect[];
 for(const[id,x,y]of VILLAGE.props){
  if(id==='village-lamp')check(obstacles.some(o=>o.x===x+12&&o.y===y+22&&o.radius===4),'Lamp has an exact small base collider');
  if(id==='village-firepit')check(obstacles.some(o=>o.x===x+14&&o.y===y+14&&o.radius===11),'Firepit collision follows its stone ring');
 }
 for(const[id,x,y]of VILLAGE.scenery)if(id==='frozen-bush')check(obstacles.some(o=>o.x===x&&o.y===y&&o.radius===10),'Bush foliage has a matching collider');
 walker.setPosition(417,1324);check(canWalk(walker.x,walker.y,obstacles),'Bush approach begins on valid village snow');
 key(68,true);await wait(650);key(68,false);check(walker.x<428&&walker.x>420,'Actual keyboard movement stops against bush foliage');
 walker.setPosition(341,1188);check(canWalk(walker.x,walker.y,obstacles),'Fire approach begins on open snow');
 key(87,true);await wait(650);key(87,false);check(walker.y>=1177&&walker.y<1182,'Cannot walk into the burning firepit');
 walker.setPosition(434,1241);check(canWalk(walker.x,walker.y,obstacles),'Lamp approach begins on the clear path');
 key(87,true);await wait(650);key(87,false);check(walker.y>=1227&&walker.y<1232,'Lamp stops walking at its visible base');
 const lamp=scene.children.list.find(o=>o instanceof Phaser.GameObjects.Image&&o.frame.name==='village-lamp/none/idle/0'&&o.x===422) as Phaser.GameObjects.Image;
 walker.setPosition(411,1190);await wait(120);check(lamp.depth>walker.depth,'Lamp draws over player walking behind its base');
 walker.setPosition(434,1241);await wait(120);check(lamp.depth<walker.depth,'Player draws over lamp when walking in front');
 walker.setPosition(389,1180);
 check(home.lighting.strength<.01,'Daylight: lamp and window emission is off');
 Object.assign(scene.environment,{state:{elapsed:390,weather:'clear',remaining:180,seed:7}});await wait(1500);
 check(home.lighting.strength>.25&&home.lighting.strength<.6,'Evening lamps ease on automatically');
 Object.assign(scene.environment,{state:{elapsed:550,weather:'clear',remaining:180,seed:7}});await wait(1500);
 check(home.lighting.strength>.9,'Night activates warm village light pools');
 const masks=scene.children.list.filter(o=>o instanceof Phaser.GameObjects.Image&&o.getData('emissive')) as Phaser.GameObjects.Image[];
 check(masks.length===9&&masks.every(m=>m.alpha>.85),'All five lamp heads and four building light masks are lit');
 check(masks.every(m=>m.tintTopLeft===0xffffff),'Emissive windows retain warm tones under blue ambient lighting');
 Object.assign(scene.environment,{state:{elapsed:200,weather:'clear',remaining:180,seed:7}});await wait(1800);
 check(home.lighting.strength<.01,'Daylight fades the lights back off');
 check(true,`Lighting, bush, lamp and fire collisions pass; ${Math.round(game.loop.actualFps)} FPS`);
}catch(error){results.push(String(error));document.querySelector('#result')!.textContent=results.join('\n');}finally{key(68,false);key(87,false);}
