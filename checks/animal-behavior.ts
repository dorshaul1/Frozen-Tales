import Phaser from 'phaser';import {loadAssets,createTextures} from '../src/game/assets/textures';import {createRiver,createFloes,banks} from '../src/game/world/river';
import {DynamicWorld,validSnow,validFloe} from '../src/game/world/DynamicWorld';import {Ambience} from '../src/game/world/Ambience';import {ANIMAL_RULES,type AnimalId} from '../src/game/world/spawnRules';import {AnimalGoal,ANIMAL_BEHAVIOR,swimmingWater} from '../src/game/world/animalBehavior';
const out=document.querySelector('#result')!;
class Review extends Phaser.Scene{
 w=new DynamicWorld(41);a!:Ambience;selected=0;
 preload(){loadAssets(this);}
 create(){createTextures(this);createRiver(this);this.cameras.main.setZoom(2);let id=0;
 for(const species of Object.keys(ANIMAL_RULES) as AnimalId[]){const rule=ANIMAL_RULES[species];let point={x:300,y:2100+id*80};
 if(species==='seal'){const floe=createFloes().find(f=>validFloe({x:f.x+f.width/2,y:f.y+f.height/2},rule.radius))!;point={x:floe.x+floe.width/2,y:floe.y+floe.height/2};}
 else {for(let dy=0;dy<300;dy+=10){const y=2000+id*110+dy,x=banks(y)[0]-75;if(validSnow({x,y},rule.radius)){point={x,y};break;}}}
 const points=[point];if(['penguin','reindeer'].includes(species))for(let i=1;i<3;i++){const p={x:point.x-40*i,y:point.y+12*i};if(validSnow(p,rule.radius))points.push(p);}
 this.w.encounters.push({id:++id,species,points,heading:0,expiresAt:1000});
 const b=document.createElement('button');b.textContent=species;b.onclick=()=>{this.selected=id;const e=this.w.encounters.find(e=>e.species===species)!;this.selected=e.id;};document.body.prepend(b);
 }
 this.a=new Ambience(this,this.w);const starts=this.w.encounters.map(e=>({...e.points[0]})),states=new Map<number,Set<string>>();
 const started=performance.now();
 for(let i=0;i<2400;i++){
 this.cameras.main.worldView.setTo(0,0,1600,5600);this.w.clock+=.05;this.a.update(i*50,50,{x:1500,y:100});
 const goals=(this.a as any).groups as Map<number,{action:string}>;
 for(const e of this.w.encounters){const set=states.get(e.id)??new Set<string>();set.add(goals.get(e.id)!.action);states.set(e.id,set);for(const p of e.points){const r=ANIMAL_RULES[e.species];if(r.terrain==='snow'&&!validSnow(p,r.radius))throw Error('Invalid snow '+e.species);if(r.terrain==='floe'&&!validFloe(p,r.radius)&&!swimmingWater(p))throw Error('Seal left valid ice/water');}}
 }
 out.textContent='PASS 120 seconds of actual behavior updates: terrain remains valid.\n';
 this.w.encounters.forEach((e,i)=>{const distance=Math.hypot(e.points[0].x-starts[i].x,e.points[0].y-starts[i].y);if(distance<2)throw Error('No travel '+e.species);out.textContent+=`${e.species}: ${[...states.get(e.id)!].join(' → ')}; moved ${Math.round(distance)}px\n`;});
 for(const e of this.w.encounters){const goal=new AnimalGoal(e),p=e.points[0];goal.update(.05,{x:p.x+10,y:p.y},{phase:'night',weather:'light-snow'},this.registry.get('treeCrowns'),false);const reaction=ANIMAL_BEHAVIOR[e.species].reaction,expected=reaction==='notice'||reaction==='gather'?'alert':reaction==='dive'?'swim':'travel';if(goal.action!==expected)throw Error('Wrong reaction '+e.species);}
 out.textContent+=`PASS Species-specific proximity reactions; ${((performance.now()-started)/2400).toFixed(2)}ms per full-world simulation update.\n`;
 this.selected=1;
 }
 update(t:number,d:number){if(!this.a)return;const e=this.w.encounters.find(e=>e.id===this.selected)!;this.cameras.main.centerOn(e.points[0].x,e.points[0].y);this.w.clock+=d/1000;this.a.update(t,d,{x:1500,y:100});}
}
new Phaser.Game({type:Phaser.AUTO,width:1000,height:700,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[Review]});
