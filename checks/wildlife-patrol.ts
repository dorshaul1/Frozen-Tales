import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
import { banks } from '../src/game/world/river';
import { validSnow, validFloe } from '../src/game/world/DynamicWorld';
import { ANIMAL_RULES } from '../src/game/world/spawnRules';
const scene=new RiverScene(null);
const game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
let approached=false,frames=0,invalid=false;
setTimeout(()=>{
 const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 const body=kayak.body as Phaser.Physics.Arcade.Body;
 scene.events.on('update',()=>{
  const encounters=scene.dynamicWorld.encounters;
  const penguins=encounters.find(e=>e.species==='penguin'&&e.expiresAt>scene.dynamicWorld.clock+30);
  if(!approached&&penguins){const p=penguins.points[0],[l,r]=banks(p.y);body.reset(p.x<l?l+60:r-60,p.y);approached=true;}
  if(approached)frames++;
  for(const e of encounters){const rule=ANIMAL_RULES[e.species];for(const p of e.points){if(rule.terrain==='snow'&&!validSnow(p,rule.radius)||rule.terrain==='floe'&&!validFloe(p,rule.radius))invalid=true;}}
  const counts=Object.keys(ANIMAL_RULES).map(id=>`${id}: ${encounters.filter(e=>e.species===id).reduce((n,e)=>n+e.points.length,0)}`).join(' · ');
  document.querySelector('#result')!.textContent=`${invalid?'FAIL':'PASS'} live wildlife placement and walking terrain. ${counts}\nApproached a natural penguin encounter: ${approached}; ${frames} frames inspected; ${Math.round(game.loop.actualFps)} FPS.`;
 });
},900);
