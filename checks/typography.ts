import Phaser from 'phaser';
import { pixelText } from '../src/game/ui/PixelText';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home,HUB } from '../src/game/home/Home';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
const scene=new RiverScene(null,true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:800,height:600,pixelArt:true,roundPixels:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
for(const size of [6,7,8,10,14]){const t=pixelText(scene,10.5,20.4,'',{fontSize:size+'px',color:'#ffffff'});t.setText('Fish $123 · ↑↓→✓×');const data=t.context.getImageData(0,0,t.canvas.width,t.canvas.height).data;check(Array.from(data).every((v,i)=>i%4!==3||v===0||v===255),'Size '+size+' has binary alpha only');check(Number.isFinite(t.originX)&&Number.isInteger(t.x)&&t.width>0,'Dynamic labels have valid integer position');t.destroy();}
const home=Reflect.get(scene,'home') as Home;home.walking=true;scene.cargo.add('salmon');scene.cargo.add('trout');
for(const [label,action] of Object.entries({Gear:()=>{home.fisherman.setPosition(HUB.merchant.x,HUB.merchant.y);scene.harborPanel.open('gear');},Journal:()=>{home.fisherman.setPosition(HUB.keeper.x,HUB.keeper.y);scene.harborPanel.open('journal');const p=scene.harborPanel as any;p.selection=2;p.detailOpen=true;p.refresh();},Audio:()=>{scene.harborPanel.close();(scene.audioPanel as any).open();},Native:()=>game.scale.resize(440,600),Double:()=>game.scale.resize(900,650)})){const b=document.createElement('button');b.textContent=label;b.onclick=action;document.body.prepend(b);}
home.fisherman.setPosition(HUB.merchant.x,HUB.merchant.y);scene.harborPanel.open('gear');
const guide=document.createElement('button');guide.textContent='Guide';guide.onclick=()=>{scene.harborPanel.close();scene.audioPanel.open();(scene.audioPanel as any).showHelp(0);};document.body.prepend(guide);
scene.harborPanel.close();scene.audioPanel.open();(scene.audioPanel as any).showHelp(0);check(scene.audioPanel.isOpen,'Help keeps pause active');(scene.audioPanel as any).showHelp(1);(scene.audioPanel as any).showHelp(-1);check(scene.audioPanel.isOpen,'Back to settings stays paused');scene.audioPanel.close();check(!scene.audioPanel.isOpen,'Closing restores play');
