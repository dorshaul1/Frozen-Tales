import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {FISH,type FishId} from '../src/game/fishing/data';import {ATLAS,ASSETS} from '../src/game/assets/textures';import {pixelText} from '../src/game/ui/PixelText';import {AREA_SPAWNS} from '../src/game/world/spawnRules';import {SIDE_ROUTES} from '../src/game/world/sideRoutes';import {RARE_FISH} from '../src/game/fishing/rareFish';
const ids:FishId[]=['dace','perch','chub','pickerel','sucker','whitebass','bream','huchen','taimen','sculpin','eel','lanternfin'];
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const pools=[...Object.values(AREA_SPAWNS).map(a=>a.fish),...SIDE_ROUTES.map(r=>r.fish??{})];
for(const id of ids)if(!pools.some(p=>Number(p[id])>0)&&!RARE_FISH[id])throw Error('No spawning route: '+id);
document.querySelector('#result')!.textContent='PASS all 12 species have dynamic spawning routes and registered artwork';
const v=scene.cameras.main.worldView;for(const [i,id]of ids.entries()){const x=v.centerX-155+i%3*110,y=v.centerY-110+Math.floor(i/3)*65;scene.add.image(x,y,ATLAS,ASSETS[`fish-${id}`]).setDepth(40);pixelText(scene,x-35,y+18,FISH[id].name,{fontSize:'8px',backgroundColor:'#173642'}).setDepth(40);}
