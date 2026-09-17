import Phaser from 'phaser';
import { DynamicWorld,validSnow,validFloe } from '../src/game/world/DynamicWorld';
import { ANIMAL_RULES, DYNAMIC, type AnimalId } from '../src/game/world/spawnRules';
import { banks,createFloes } from '../src/game/world/river';
import { landmarkBounds } from '../src/game/world/ecologyLandmarks';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { ASSETS,ATLAS } from '../src/game/assets/textures';
import { pixelText } from '../src/game/ui/PixelText';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
const fixed=JSON.stringify([banks(2400),createFloes(),landmarkBounds()]);const counts:Record<string,number>={},positions=new Set<string>();
for(let trip=0;trip<20;trip++){
 const w=new DynamicWorld(789+trip*71);w.conditions={phase:trip%2?'night':'morning',weather:'clear'};const seen=new Set<number>();
 for(let tick=0;tick<6000;tick++){
  const y=500+(tick*.65)%3100,[l,r]=banks(y),p={x:(l+r)/2,y},view={left:p.x-200,right:p.x+200,top:y-140,bottom:y+140};
  w.update(1000,p,view);
  checkSilent(w.encounters.reduce((s,e)=>s+e.points.length,0)<=DYNAMIC.wildlifeLimit,'population cap');
  for(const e of w.encounters){const rule=ANIMAL_RULES[e.species];for(const pt of e.points)checkSilent(rule.terrain==='air'||(rule.terrain==='snow'?validSnow(pt,rule.radius):validFloe(pt,rule.radius)),'terrain '+e.species);if(!seen.has(e.id)){seen.add(e.id);counts[e.species]=(counts[e.species]??0)+1;positions.add(JSON.stringify(e.points));}}
 }
}
function checkSilent(ok:boolean,s:string){if(!ok)throw Error(s);}
out.textContent+='\n'+JSON.stringify(counts);
check(['fox','hare','reindeer','owl','otter'].every(id=>counts[id]>0),'All new species encounterable across trips');
check((counts['polar-bear']??0)<counts.penguin&&counts.fox<counts.hare,'Rare sightings remain less common');
check(positions.size>25,'Encounters change positions between trips');
check(fixed===JSON.stringify([banks(2400),createFloes(),landmarkBounds()]),'Landmarks and geography remain fixed');
check(true,'All encounter terrain and population checks pass');out.textContent+='\n'+JSON.stringify(counts);
const scene=new RiverScene(null,true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1).setScroll(0,0);
const gallery=scene.add.container(0,0).setScrollFactor(0).setDepth(100);
scene.events.on('postupdate',()=>{const c=scene.cameras.main;gallery.setPosition(c.width*(1-1/c.zoom)/2,c.height*(1-1/c.zoom)/2);});gallery.add(scene.add.rectangle(250,170,470,290,0x253d49));
(['fox','hare','reindeer','otter','owl'] as AnimalId[]).forEach((id,i)=>{gallery.add(pixelText(scene,35,45+i*49,id,{color:'#edf7f4',fontSize:'8px'}));for(const [j,dir]of ['N','E','S','W'].entries()){const sprite=scene.add.sprite(160+j*80,50+i*49,ATLAS,ASSETS[id]);sprite.play(`${id}/${dir}/walk`);gallery.add(sprite);}});
const b=document.createElement('button');b.textContent='River';b.onclick=()=>gallery.setVisible(false);document.body.prepend(b);
for(const l of landmarkBounds()){const b=document.createElement('button');b.textContent=l.name;b.onclick=()=>{gallery.setVisible(false);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(l.x+55,l.y+48);};document.body.prepend(b);}
