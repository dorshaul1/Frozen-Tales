import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Home } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { VILLAGE } from '../src/game/home/villageLayout';
const scene=new RiverScene(null,true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:600,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms)),results:string[]=[];
const check=(ok:boolean,message:string)=>{results.push(`${ok?'PASS':'FAIL'} ${message}`);document.querySelector('#result')!.textContent=results.join('\n');if(!ok)throw Error(message);};
const key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
for(const frame of ['n-idle-0','ne-idle-0','e-walk-1','se-idle-0','s-idle-0','sw-idle-0','w-walk-1','nw-idle-0']){
 const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');image.src=`/assets/source/fisherman/${frame}.png`;caption.textContent=frame;figure.append(image,caption);document.querySelector('#frames')!.append(figure);
}
try{
 while(!Reflect.get(scene,'home'))await wait(100);
 const home=Reflect.get(scene,'home') as Home,kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 (kayak.body as Phaser.Physics.Arcade.Body).reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();
 const player=home.fisherman;
 for(const[direction,codes]of [['N',[87]],['NE',[87,68]],['E',[68]],['SE',[83,68]],['S',[83]],['SW',[83,65]],['W',[65]],['NW',[87,65]],['S',[40]]] as [string,number[]][]){
  player.setPosition(389,1170);codes.forEach(c=>key(c,true));await wait(220);
  check(player.anims.currentAnim?.key===`fisherman/${direction}/walk`,`${direction}: keyboard movement selects matching walk frames`);
  check(player.rotation===0&&player.scaleX===1&&player.width===32&&player.height===32,`${direction}: native scale and anchor; no sprite rotation`);
  codes.forEach(c=>key(c,false));await wait(80);
  check(player.anims.currentAnim?.key===`fisherman/${direction}/idle`,`${direction}: release returns to matching idle`);
 }
 player.setPosition(389,1170);
 check(scene.anims.get('fisherman/S/walk').frames.length===4&&scene.anims.get('fisherman/S/idle').frames.length===2,'South uses four walk and two idle frames from rebuilt atlas');
 check(true,`Direction transitions passed · ${Math.round(game.loop.actualFps)} FPS`);
}catch(e){results.push(String(e));document.querySelector('#result')!.textContent=results.join('\n');}finally{[87,65,83,68,40].forEach(c=>key(c,false));}
