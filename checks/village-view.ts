import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { VILLAGE } from '../src/game/home/villageLayout';
const scene=new RiverScene(null,true);
const game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const ready=setInterval(()=>{
 if(!scene.sys.isActive()||!Reflect.get(scene,'home'))return;
 clearInterval(ready);
 const home=Reflect.get(scene,'home') as Home,kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 (kayak.body as Phaser.Physics.Arcade.Body).reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();home.fisherman.setPosition(389,1180);
 const overview=()=>{scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1);scene.cameras.main.centerOn(420,1170);};
 overview();
 for(const[label,action]of [['Overview',overview],['Walk',()=>{scene.cameras.main.setZoom(2);scene.cameras.main.startFollow(home.fisherman,true);}],['Night',()=>Object.assign(scene.environment,{state:{elapsed:550,weather:'clear',remaining:180,seed:7}})],['Day',()=>Object.assign(scene.environment,{state:{elapsed:200,weather:'clear',remaining:180,seed:7}})],['Narrow',()=>{game.scale.resize(440,650);overview();}]] as const){const b=document.createElement('button');b.textContent=label;b.onclick=action;document.querySelector('#views')!.append(b);}
},50);
