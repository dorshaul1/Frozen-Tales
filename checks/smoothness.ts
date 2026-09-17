import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {landings} from '../src/game/home/Landings';
import {VILLAGE} from '../src/game/home/villageLayout';
import {dockApproach,dockBoarding} from '../src/game/home/dockInteraction';
const scene=new RiverScene(null,true);
new Phaser.Game({type:Phaser.AUTO,width:1000,height:700,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
const out=document.querySelector('#result')!,check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
const kayak=Reflect.get(scene,'kayak'),home=Reflect.get(scene,'home'),camera=scene.cameras.main;
for(const d of [VILLAGE.dock,...landings()]){
 check(dockApproach(d,{x:d.x,y:d.y})&&dockApproach(d,{x:d.x-35,y:d.y+38})&&dockApproach(d,{x:d.x-35,y:d.y-38}),`Front and both sides: ${'name'in d?d.name:'Village'}`);
 check(!dockApproach(d,{x:d.x+80,y:d.y})&&!dockBoarding(d,{x:d.landX-80,y:d.landY}),'No distant interactions');
 kayak.body.reset(d.x,d.y);kayak.setVelocity(0,0);camera.setScroll(123.25,456.75);
 check(home.interactDock()&&home.walking,'Land');check(camera.scrollX===123.25&&camera.scrollY===456.75,'Landing preserves camera scroll');
 check(home.interactDock()&&!home.walking,'Board');check(camera.scrollX===123.25&&camera.scrollY===456.75,'Boarding preserves camera scroll');
}
// Exercise production movement directly at identical initial states.
scene.scene.pause();const key=Reflect.get(kayak,'keys').S, speeds:number[]=[];
for(let run=0;run<2;run++){
 kayak.setMovementEnabled(true);kayak.setVelocity(0,0);kayak.waterFlow={x:0,y:0,speed:1};kayak.rideFlow={x:0,y:1,strength:0,boost:0};key.isDown=true;
 for(let f=0;f<15;f++)kayak.update(f*1000/60,1000/60);
 speeds.push(kayak.body.velocity.length());key.isDown=false;
}
check(speeds.every(s=>s>=120)&&Math.abs(speeds[0]-speeds[1])<.01,'First and subsequent launches reach cruise within 250ms');
check(!camera.roundPixels,'Camera retains fractional follow state (no floor feedback)');
const texture=scene.textures.get('river'),source=texture.source[0];
for(let i=0;i<300;i++){camera.setScroll(100+i*.23,1000+i*.47);camera.preRender();}
check(scene.textures.get('river')===texture&&texture.source[0]===source,'300 camera frames preserve baked terrain texture');
scene.scene.resume();out.textContent+='ALL SMOOTHNESS CHECKS PASSED\n';
