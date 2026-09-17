import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {ANIMAL_RULES,areaAt,type AnimalId} from '../src/game/world/spawnRules';
import {ANIMAL_BEHAVIOR,AnimalGoal} from '../src/game/world/animalBehavior';
import {DynamicWorld,validSnow,validFloe} from '../src/game/world/DynamicWorld';
import {WILDLIFE_SIZE} from '../src/game/world/wildlifeSize';
import {ATLAS} from '../src/game/assets/catalog';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:600,height:580,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!;out.textContent='';
function check(v:boolean,s:string){out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);}
const ids=Object.keys(ANIMAL_RULES) as AnimalId[];
for(const id of ids){for(const dir of ['N','NE','E','SE','S','SW','W','NW'])for(const action of ['walk',...ANIMAL_BEHAVIOR[id].activities.map(a=>a==='social'?'inspect':a)])check(scene.anims.exists(`${id}/${dir}/${action}`),`${id} ${dir} ${action}`);}
out.textContent='PASS All species activity/direction animations registered\n';
const seen=new Set<string>();let valid=true,total=0;const signatures=new Set<string>();
for(let day=0;day<20;day++)for(const y of [1700,2750,3700,4650]){
 const w=new DynamicWorld(17+day*197+y);w.conditions={phase:day%2?'evening':'morning',weather:day%3?'clear':'light-snow'};
 const player={x:700,y},view={left:350,right:1050,top:y-240,bottom:y+240};
 for(let tick=0;tick<50;tick++){
  w.clock+=5;w.update(50,player,view);
  for(const e of w.encounters){seen.add(e.species);for(const p of e.points){const r=ANIMAL_RULES[e.species];valid&&=(r.areas as readonly string[]).includes(areaAt(p.y))&&(r.terrain==='air'||(r.terrain==='floe'?validFloe(p,r.radius):validSnow(p,r.radius)));total++;}}
 }
 signatures.add(w.encounters.map(e=>`${e.species}:${Math.round(e.points[0].x)}`).join('|'));
}
check(valid&&total>100,'Multiple-day spawning respects every area and terrain rule');check(signatures.size>20,'Encounter composition/positions vary across trips');check(seen.has('musk-ox')&&seen.has('wolf')&&seen.has('wolverine')&&seen.has('raven'),'All new species can spawn naturally');
const e={id:555,species:'musk-ox' as const,points:[{x:150,y:3700},{x:200,y:3700}],expiresAt:9999,heading:0};const goal=new AnimalGoal(e);
check(goal.timer>=14,'Herd starts with a substantial species activity');goal.update(.1,{x:155,y:3700},{phase:'day',weather:'clear'},[],false);check(goal.reaction&&goal.action==='travel'&&goal.target.x===175,'Disturbed musk ox herd regroups around its center');
check(WILDLIFE_SIZE['polar-bear'].radius>WILDLIFE_SIZE['musk-ox'].radius&&WILDLIFE_SIZE.wolf.radius>WILDLIFE_SIZE.otter.radius,'Large/small wildlife scale hierarchy remains coherent');
const runtime=Reflect.get(scene,'dynamicWorld'),ambience=Reflect.get(scene,'ambience');
scene.cameras.main.stopFollow();
for(const species of ['musk-ox','wolf','wolverine','otter'] as AnimalId[]){
 let point:{x:number;y:number}|undefined;const base=species==='otter'?1700:species==='wolverine'?4500:3600;
 for(let y=base;y<base+200&&!point;y+=20)for(let x=50;x<1200;x+=20)if(validSnow({x,y},ANIMAL_RULES[species].radius)){point={x,y};break;}
 check(!!point,'Valid movement start '+species);if(!point)continue;
 runtime.encounters.splice(0,runtime.encounters.length,{id:99000+ids.indexOf(species),species,points:[point],expiresAt:99999,heading:0});
 Reflect.get(ambience,'syncEncounters').call(ambience);scene.cameras.main.centerOn(point.x,point.y);scene.cameras.main.preRender();
 let safe=true;const start={...point};for(let i=0;i<1800;i++){ambience.update(i*33,33,{x:point.x+500,y:point.y});safe&&=validSnow(point,ANIMAL_RULES[species].radius);}
 check(safe,'60 seconds of terrain-safe routines: '+species);check(Math.hypot(point.x-start.x,point.y-start.y)>1,'Resting animal resumes purposeful movement: '+species);
}
let shore:{x:number;y:number}|undefined;
for(let y=1600;y<1900&&!shore;y+=10)for(let x=100;x<1100;x+=5){if(!validSnow({x,y},9))continue;const g=new AnimalGoal({id:818,species:'otter',points:[{x,y}],expiresAt:9999,heading:0});g.update(.1,{x:x+10,y},{phase:'day',weather:'clear'},[],false);if(g.action==='swim'){shore={x,y};break;}}
check(!!shore,'Otter can select nearby safe swimming water');
if(shore){runtime.encounters.splice(0,runtime.encounters.length,{id:918,species:'otter',points:[shore],expiresAt:9999,heading:0});Reflect.get(ambience,'syncEncounters').call(ambience);scene.cameras.main.centerOn(shore.x,shore.y);scene.cameras.main.preRender();const observer={x:shore.x-10,y:shore.y};for(let i=0;i<480;i++)ambience.update(i*33,33,observer);const animal=Reflect.get(ambience,'animals')[0];check(animal.submerged&&animal.sprite.anims.currentAnim.key.endsWith('/swim'),'Otter crosses shoreline and uses swimming frames');}
runtime.encounters.length=0;Reflect.get(ambience,'syncEncounters').call(ambience);
out.textContent+='ALL CHECKS PASSED — '+total+' sampled animals; '+seen.size+' species\nNative-scale art below (penguin and bear are unchanged references).';
// Isolated art comparison: no save writes or game-world placement changes.
scene.cameras.main.stopFollow();scene.cameras.main.removeBounds();scene.cameras.main.setZoom(1).setScroll(0,0);const panel=scene.add.rectangle(450,320,900,640,0x9bafb1).setDepth(9000);
const gallery=['penguin','polar-bear','musk-ox','wolf','wolverine','raven','otter'] as AnimalId[];
const sprites:Phaser.GameObjects.Sprite[]=[];let dir='E',action='walk';
gallery.forEach((id,i)=>{const x=75+(i%4)*145,y=180+Math.floor(i/4)*140;scene.add.text(x-48,y-45,id,{fontFamily:'monospace',fontSize:'13px',color:'#172f3d'}).setDepth(9002);sprites.push(scene.add.sprite(x,y,ATLAS,`${id}/E/walk/0`).setScale(WILDLIFE_SIZE[id].scale).setDepth(9002));});
function apply(){sprites.forEach((s,i)=>{const id=gallery[i],key=`${id}/${dir}/${action}`;s.play(scene.anims.exists(key)?key:`${id}/${dir}/idle`);});}
for(const d of ['N','NE','E','SE','S','SW','W','NW','idle','walk','rest','forage','inspect']){const b=document.createElement('button');b.textContent=d;b.onclick=()=>{if(d.length<=2)dir=d;else action=d;apply();};document.querySelector('#controls')!.append(b);}
apply();let last=performance.now();function animate(now:number){const dt=Math.min(50,now-last);last=now;sprites.forEach(s=>s.anims.update(now,dt));requestAnimationFrame(animate);}requestAnimationFrame(animate);void panel;
