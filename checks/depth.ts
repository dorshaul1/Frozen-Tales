import Phaser from 'phaser';
import { waterDepth,habitatAt,habitatAffinity,depthValue } from '../src/game/world/depth';
import { banks,createFloes } from '../src/game/world/river';
import { DynamicWorld,validWater } from '../src/game/world/DynamicWorld';
import { FISH } from '../src/game/fishing/data';
import { journalGuide } from '../src/game/fishing/journalGuide';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Kayak } from '../src/game/entities/Kayak';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
try{
 const geometry=JSON.stringify([banks(2500),createFloes()]);const depths=new Set<string>();const samples:{x:number;y:number}[]=[];
 for(let y=200;y<3800;y+=30){const[l,r]=banks(y);for(let x=l+58;x<r-58;x+=20)if(validWater({x,y})){depths.add(waterDepth(x,y));samples.push({x,y});}}
 check(depths.size===3,'All three depths have valid fishing locations');
 const shallow=samples.find(p=>waterDepth(p.x,p.y)==='shallow')!,deep=samples.find(p=>waterDepth(p.x,p.y)==='deep')!;
 check(habitatAffinity(FISH.whitefish.habitat,shallow.x,shallow.y)>habitatAffinity(FISH.whitefish.habitat,deep.x,deep.y),'Whitefish favor shallow water');check(habitatAffinity(FISH.trout.habitat,deep.x,deep.y)>habitatAffinity(FISH.trout.habitat,shallow.x,shallow.y),'Trout favor deeper water');
 check(Object.values(FISH).every(f=>Object.values(f.habitat.depths).every(n=>n>0)),'Habitat preferences never hard-lock ordinary fishing');
 const w=new DynamicWorld(71),view={left:420,right:920,top:1000,bottom:1400},home={x:674,y:1216},locations=new Set<string>();
 const bed=JSON.stringify(samples.map(p=>depthValue(p.x,p.y)));
 for(let d=0;d<8;d++){w.newDay(80+d*47,home,view);check(w.spots.every(s=>validWater(s)&&Object.values(s.weights).every(n=>n!>0)),'Day '+d+': valid habitat-weighted fishing activity');w.spots.forEach(s=>locations.add(`${s.x},${s.y}`));}
 check(locations.size>30&&bed===JSON.stringify(samples.map(p=>depthValue(p.x,p.y)))&&geometry===JSON.stringify([banks(2500),createFloes()]),'Trips vary fish activity, never depth or geography');
 check(journalGuide('trout',{phase:'day',weather:'clear'},1200,0).rows[3].text.includes('Deep water')&&journalGuide('trout',{phase:'day',weather:'clear'},1200,0).rows[3].text.includes('ice'),'Journal uses actual depth/feature data');
 const scene=new RiverScene('arctic-drift.check-depth'),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);await wait(150);const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak;
 for(const[label,y]of [['Starting',1450],['Bend',2440],['Lake',3650]] as const){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{const[l,r]=banks(y);(kayak.body as Phaser.Physics.Arcade.Body).reset((l+r)/2,y);};document.body.prepend(b);}
 check(true,'Depth/habitat checks passed');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
