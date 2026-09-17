import Phaser from 'phaser';
import { journalGuide } from '../src/game/fishing/journalGuide';
import { FISH,type FishId } from '../src/game/fishing/data';
import { eligibleRare,RARE_FISH } from '../src/game/fishing/rareFish';
import { PHASES,WEATHER,type WeatherId } from '../src/game/world/conditions';
import { AREA_SPAWNS } from '../src/game/world/spawnRules';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { visitNpc } from './hub-helper';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
try{
 for(const id of Object.keys(FISH) as FishId[])for(const phase of PHASES)for(const weather of Object.keys(WEATHER) as WeatherId[]){const c={phase,weather};const g=journalGuide(id,c,1200,0);if(RARE_FISH[id]){const expected=Object.values(AREA_SPAWNS).some(a=>eligibleRare({y:(a.minY+a.maxY)/2},c).includes(id));if(expected!==g.available)throw Error(id+' availability mismatch');}else if(!g.available)throw Error('Preference incorrectly blocks '+id);}
 check(true,'All 160 fish/time/weather combinations agree with actual eligibility');
 check(journalGuide('crown',{phase:'day',weather:'clear'},3500,0).reason.includes('Night'),'Legendary clearly requires night');check(journalGuide('crown',{phase:'night',weather:'clear'},3500,0).available,'Clear nights remain valid, not aurora-only');check(journalGuide('burbot',{phase:'day',weather:'clear'},3500,0).reason.includes('Snow'),'Snow requirement is actionable before discovery');
 const p=journalGuide('pike',{phase:'day',weather:'clear'},1200,0);check(p.rows[0].text.includes('Southern Starting River')&&p.rows[0].state==='unmet','Transition-only Pike habitat is accurate');check(journalGuide('pike',{phase:'day',weather:'clear'},1900,0).rows[0].state==='met','Pike area check follows shared transition rule');
 const scene=new RiverScene('arctic-drift.check-journal-guide',true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.harborPanel)await wait(100);await wait(150);visitNpc(scene,'journal');scene.harborPanel.open('journal');
 const show=(id:FishId)=>{Reflect.set(scene.harborPanel,'selection',Object.keys(FISH).indexOf(id));Reflect.set(scene.harborPanel,'detailOpen',true);Reflect.get(scene.harborPanel,'refresh').call(scene.harborPanel);};show('crown');
 const texts=()=> (Reflect.get(scene.harborPanel,'cards') as Phaser.GameObjects.Container).list.filter(o=>o instanceof Phaser.GameObjects.Text).map(o=>(o as Phaser.GameObjects.Text).text).join('\n');
 check(texts().includes('???')&&texts().includes('Frozen Lake')&&texts().includes('Night')&&texts().includes('NOT AVAILABLE'),'Uncaught legendary silhouette has practical requirements');
 Object.assign(scene.environment,{state:{elapsed:550,weather:'clear',remaining:120,seed:4}});await wait(100);check(texts().includes('AVAILABLE NOW')&&!texts().includes('NOT AVAILABLE'),'Open journal updates live when conditions change');
 for(const id of Object.keys(FISH) as FishId[]){const b=document.createElement('button');b.textContent=id;b.onclick=()=>show(id);document.body.prepend(b);}
 const n=document.createElement('button');n.textContent='Narrow';n.onclick=()=>game.scale.resize(440,680);document.body.prepend(n);check(true,'Journal discovery checks passed');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
