import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {Kayak} from '../src/game/entities/Kayak';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
const run=(fps:number,brake:boolean,flow=0,brace=false,upgrade=1)=>{
 const k=new Kayak(scene,800,1200,()=>upgrade),keys=Reflect.get(k,'keys');
 for(const key of Object.values(keys) as Phaser.Input.Keyboard.Key[])key.reset();
 k.waterFlow={x:flow,y:0,speed:1};k.setVelocity(0,160);keys.C.isDown=brake;keys.C._justDown=brace;
 const initial=k.body!.velocity.length();k.update(0,1000/fps);
 check(k.body!.velocity.length()>0&&k.body!.velocity.length()<=initial+1,'No instant stop or velocity snap');
 for(let i=1;i<fps/2;i++)k.update(i*1000/fps,1000/fps);
 const v={x:k.body!.velocity.x,y:k.body!.velocity.y};k.destroy();return v;
};
for(const fps of [30,60,120]){
 const coast=run(fps,false),brake=run(fps,true);
 check(brake.y<coast.y*.4,`${fps}fps: brake reduces momentum faster than coasting`);
}
const rough=run(60,false,70),braced=run(60,false,70,true),stabilized=run(60,false,70,true,1.2);
check(braced.x<rough.x*.6,'Brace reduces strong cross-current / whirlpool force');
check(stabilized.x<braced.x,'Current Stabilizer complements bracing');
const k=new Kayak(scene,800,1200),keys=Reflect.get(k,'keys');for(const key of Object.values(keys) as Phaser.Input.Keyboard.Key[])key.reset();k.waterFlow={x:0,y:0,speed:1};
keys.C._justDown=true;k.update(0,16.67);check(k.braceRemaining>0,'Tap starts brace');
for(let i=0;i<60;i++)k.update(i*16.67,16.67);check(k.braceRemaining===0&&k.braceCooldown>0,'Brace expires and leaves a short cooldown');
keys.C._justDown=true;k.update(1100,16.67);check(k.braceRemaining===0,'Repeated taps cannot sustain brace');
k.setVelocity(0,30);keys.D.isDown=true;k.update(1200,16.67);check(k.body!.velocity.x>10,'Low-speed steering responds immediately');
k.moduleValue=id=>id==='turbo'?1:0;keys.SHIFT.isDown=true;keys.C.isDown=true;k.update(1216,16.67);check(!k.boosting,'Brake safely overrides Turbo');
check(!k.anims.forward,'Braking reverses the paddle stroke');
keys.C.isDown=false;k.braceRemaining=0;k.setVelocity(80,0);k.update(1232,16.67);check(k.anims.forward,'Normal stroke resumes after brake');
k.setVelocity(0,0);keys.C.isDown=true;const before=k.rotation;k.update(1248,16.67);check(k.rotation!==before,'Brake plus steering pivots at rest');
k.setMovementEnabled(false);check(!k.braking&&k.braceRemaining===0,'Menus / walking clear active maneuvers');k.destroy();
scene.scene.resume();out.textContent+='ALL MANEUVER CHECKS PASSED\n';
