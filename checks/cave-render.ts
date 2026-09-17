import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
const scene=new RiverScene('arctic-drift.check-render',true);
new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
const view=Reflect.get(scene,'exploration'),shade=Reflect.get(view,'shade') as Phaser.GameObjects.Container;
const masks=Reflect.get(view,'masks') as Phaser.GameObjects.Container[];
const buffers=masks.map(m=>(m.list[0] as Phaser.GameObjects.Graphics).commandBuffer.length);
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
for(let frame=0;frame<300;frame++){
 const p={x:265+Math.sin(frame/12)*15,y:2050+frame/10};view.update(frame,p);
 if(shade.x!==p.x||shade.y!==p.y)throw Error('Mask lag');
 scene.cameras.main.setScroll(frame*.37,frame*.29);
}
check(true,'Light transform synchronized on all 300 frames, including frames below old 80ms interval');
check(masks.every((m,i)=>(m.list[0] as Phaser.GameObjects.Graphics).commandBuffer.length===buffers[i]),'No mask geometry rebuilt during camera/player movement');
scene.equipment.levels.lantern=1;scene.equipment.gear.lanternLit=true;view.update(301,{x:265,y:2080});check(masks[1].visible&&!masks[0].visible,'Lantern switches cached mask immediately');
view.update(302,{x:800,y:1200});check(!shade.visible,'Outside cave has no residual overlay');
const kayak=Reflect.get(scene,'kayak');kayak.body.reset(265,2080);scene.cameras.main.startFollow(kayak);scene.cameras.main.centerOn(265,2080);
out.textContent+='ALL RENDER CHECKS PASSED';
