import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { banks } from '../src/game/world/river';
import { currentAt } from '../src/game/world/areas';
const scene=new RiverScene(null, true);
new Phaser.Game({type:Phaser.AUTO,parent:'test',width:900,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const messages:string[]=[];
const check=(ok:boolean,s:string)=>{messages.push((ok?'PASS ':'FAIL ')+s);document.querySelector('#result')!.textContent=messages.join('\n');if(!ok)throw Error(s);};
const held=new Set<number>();function key(code:number,on:boolean){if(held.has(code)===on)return;if(on)held.add(code);else held.delete(code);window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));}
try{
await wait(900);const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,body=kayak.body as Phaser.Physics.Arcade.Body;
const reset=(y:number)=>{const[l,r]=banks(y);body.reset((l+r)/2,y);};
reset(2290);const start=kayak.y;await wait(950);check(kayak.y>start+8&&body.velocity.y<25,'Gentle current produces visible, bounded idle drift');
reset(2290);key(87,true);await wait(450);check(body.velocity.y<-90&&body.velocity.y>-120,'Upstream paddling remains easy but current affects speed');key(87,false);
reset(2230);key(83,true);await wait(600);check(body.velocity.y>135,'Downstream paddling receives a noticeable boost');key(83,false);
reset(2290);kayak.setMovementEnabled(false);const locked=kayak.y;await wait(600);check(Math.abs(kayak.y-locked)<.1,'Fishing/menu movement lock suppresses currents');kayak.setMovementEnabled(true);
check(currentAt(1300)===0&&currentAt(3570)===0,'Home and lake remain calm');
reset(2800);
for(let y=2850;y<=3550;y+=50){const[l,r]=banks(y),x=(l+r)/2-(y>=3100&&y<=3300?85:0),start=performance.now();while(Math.hypot(kayak.x-x,kayak.y-y)>12){if(performance.now()-start>8000)throw Error(`Blocked lake approach to ${x},${y} at ${kayak.x},${kayak.y}; velocity ${body.velocity.x},${body.velocity.y}`);key(65,kayak.x>x+5);key(68,kayak.x<x-5);key(87,kayak.y>y+5);key(83,kayak.y<y-5);await wait(20);}}
for(const c of [...held])key(c,false);
check(kayak.y>3500,'Blue Ice Bend connects continuously to Frozen Lake');
check(scene.children.list.some(c=>c instanceof Phaser.GameObjects.Text&&c.text==='FROZEN LAKE'),'Area entry reveal appears');
}catch(e){messages.push(String(e));document.querySelector('#result')!.textContent=messages.join('\n');}finally{for(const c of [...held])key(c,false);}
