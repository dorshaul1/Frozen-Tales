import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {waterSpans,waterAt,WORLD_WIDTH,WORLD_HEIGHT} from '../src/game/world/river';
import {REGIONAL_CONTENT,regionalContentAt} from '../src/game/world/regionalContent';
import {areaAt} from '../src/game/world/spawnRules';
import {MAP_MARKERS} from '../src/game/map/discovery';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:620,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!;out.textContent='';const check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';};
let h=2166136261;for(let y=0;y<WORLD_HEIGHT;y+=2)for(const n of [y,...waterSpans(y).flat()])h=Math.imul(h^n,16777619)>>>0;
check(WORLD_WIDTH===6100&&WORLD_HEIGHT===7800&&h===153035761,'Frozen layout with approved fragment cleanup');
for(const area of ['starting','bend','lake','gorge','estuary'])check(REGIONAL_CONTENT.filter(p=>p.area===area).length===4,'Four local compositions: '+area);
for(const p of REGIONAL_CONTENT){check(waterAt(p.x,p.y)&&areaAt(p.y,p.x)===p.area,'Valid regional water: '+p.id);check(regionalContentAt(p.x+p.radius+1,p.y)?.id!==p.id,'Smooth bounded influence: '+p.id);check(!MAP_MARKERS.some(m=>m.id===p.id),'No chart clutter: '+p.id);const b=document.createElement('button');b.textContent=p.id;b.onclick=()=>{scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1);scene.cameras.main.centerOn(p.x,p.y);};document.querySelector('#buttons')!.append(b);}
out.textContent+='\nPlacements '+JSON.stringify(scene.registry.get('regionalContent'));
