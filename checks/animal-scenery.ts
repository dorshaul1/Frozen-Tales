import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {sceneryFootprints,sceneryBlocked,sceneryPathClear,addSceneryFootprint} from '../src/game/world/sceneryCollision';import {validSnow} from '../src/game/world/DynamicWorld';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
check(sceneryFootprints.length>100,'Authored world decorations register ground footprints');
for(const prefix of ['tree-','geology-rock','snow-log','frozen-bush','cave-formation']){
 const objects=sceneryFootprints.filter(p=>p.asset.startsWith(prefix));check(objects.length>0&&objects.every(p=>sceneryBlocked(p.x,p.y,6)&&!validSnow(p,6)),prefix+' blocks animal spawning and movement');
}
addSceneryFootprint({x:120,y:600,radius:12,asset:'test-rock'});
check(!sceneryPathClear(80,600,160,600,8),'Swept movement cannot tunnel across rock');
check(sceneryPathClear(80,560,160,560,8),'Clear route around rock stays usable');
const world=Reflect.get(scene,'dynamicWorld'),ambience=Reflect.get(scene,'ambience');world.encounters.splice(0,world.encounters.length,{id:89999,species:'fox',points:[{x:80,y:600}],expiresAt:99999,heading:0});
Reflect.get(ambience,'syncEncounters').call(ambience);const goal=Reflect.get(ambience,'groups').get(89999);goal.action='travel';goal.target={x:160,y:600};goal.timer=30;
scene.cameras.main.centerOn(120,600);scene.cameras.main.preRender();let clear=true;
for(let i=0;i<300;i++){ambience.update(i*16.67,16.67,{x:700,y:600});const p=world.encounters[0].points[0];clear&&=!sceneryBlocked(p.x,p.y,8);}
check(clear,'Moving fox never overlaps rock during 300 updates');check(world.encounters[0].points[0].x>81,'Animal still moves instead of globally freezing');out.textContent+='ALL SCENERY CHECKS PASSED';
