import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {WORLD_WIDTH,WORLD_HEIGHT,waterAt,waterSpans,navigationLandmarks} from '../src/game/world/river';
import {NETWORK_ROUTES,REGION_CORES} from '../src/game/world/regionNetwork';
import {areaAt,type AreaId} from '../src/game/world/spawnRules';
import {DynamicWorld,validWater} from '../src/game/world/DynamicWorld';
import {landings} from '../src/game/home/Landings';
import {Discovery} from '../src/game/map/discovery';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const out=document.querySelector('#result')!;out.textContent='';const check=(v:boolean,label:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+label+'\n';if(!v)throw Error(label);};
check(WORLD_WIDTH*WORLD_HEIGHT>4200*5600*2,'World footprint more than doubled without scaling sprites');
const water:Record<AreaId,number>={starting:0,bend:0,lake:0,gorge:0,estuary:0};for(let y=160;y<WORLD_HEIGHT-160;y+=20)for(const[l,r]of waterSpans(y))for(let x=l+10;x<r;x+=20)water[areaAt(y,x)]+=400;
for(const[id,p]of Object.entries(REGION_CORES) as [AreaId,{x:number;y:number}][]){check(waterAt(p.x,p.y)&&areaAt(p.y,p.x)===id,'Correct core identity '+id);check(water[id]>400000,`${id}: ${Math.round(water[id]/10000)/100} million water pixels`);check(id==='gorge'||NETWORK_ROUTES.filter(r=>r.area===id).length>=2,'Multiple reaches '+id);}
check(water.estuary>water.lake&&water.lake>1000000,'Estuary is widest; lake has a substantial open basin');
check(navigationLandmarks().length===9,'All nine landmarks have valid bank placements: '+navigationLandmarks().map(l=>l.id).join(','));
const before=JSON.stringify(Array.from({length:WORLD_HEIGHT/2},(_,i)=>waterSpans(i*2)));
const localCoverage=new Set<string>();for(let day=1;day<=8;day++)for(const[id,p]of Object.entries(REGION_CORES)){
 const w=new DynamicWorld(day*991);w.newDay(day*991,p,{left:p.x-200,right:p.x+200,top:p.y-150,bottom:p.y+150});
 check(w.spots.every(s=>validWater(s)&&areaAt(s.y,s.x)===s.area),'Valid fish placement '+id+' day '+day);
 if(w.spots.some(s=>s.area===id&&Math.hypot(s.x-p.x,s.y-p.y)<1000))localCoverage.add(id);
}
check(localCoverage.size===5,'Every expanded core receives nearby dynamic activity');
check(before===JSON.stringify(Array.from({length:WORLD_HEIGHT/2},(_,i)=>waterSpans(i*2))),'Trips never mutate fixed contour ordering');
const old=new Discovery({worldRevision:3,regions:['3,9'],landmarks:['old-dock','grove','beacon-rest','shelter-bay','lake'],visitedAreas:['lake']});for(const s of landings().filter(s=>old.landmarks.has(s.id)))check(old.known(s.x,s.y),'Stable-ID migration follows moved '+s.id);
const kayak=Reflect.get(scene,'kayak'),map=Reflect.get(scene,'map');for(const[id,p]of Object.entries(REGION_CORES)){
 const b=document.createElement('button');b.textContent=id;b.onclick=()=>{map.close();kayak.body.reset(p.x,p.y);scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1);scene.cameras.main.centerOn(p.x,p.y);};document.querySelector('#buttons')!.append(b);
}
const chart=document.createElement('button');chart.textContent='Chart at outer coast';chart.onclick=()=>{kayak.body.reset(5500,4000);for(let y=180;y<WORLD_HEIGHT;y+=100)for(let x=120;x<WORLD_WIDTH;x+=100)if(waterAt(x,y))map.discovery.visit(x,y);map.open();};document.querySelector('#buttons')!.append(chart);
out.textContent+='ALL EXPANSION CHECKS PASSED';
