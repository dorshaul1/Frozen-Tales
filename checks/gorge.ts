import { ASSET_FRAMES,COLLISION_MASKS } from '../src/game/assets/catalog';
import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { banks,createFloes,WORLD_HEIGHT } from '../src/game/world/river';
import { DynamicWorld,validWater } from '../src/game/world/DynamicWorld';
import { areaAt,AREA_SPAWNS } from '../src/game/world/spawnRules';
import { eligibleRare } from '../src/game/fishing/rareFish';
import { journalGuide } from '../src/game/fishing/journalGuide';
import { FISH } from '../src/game/fishing/data';
import { Cargo } from '../src/game/player/Cargo';
import { SaveStore } from '../src/game/player/SaveStore';
import { STARTER_LEVELS } from '../src/game/upgrades/data';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
// Conservative water graph includes clearance for hull and floes. Prove connected return route.
const floes=createFloes();
const navigable=(x:number,y:number)=>Array.from({length:16},(_,i)=>({x:x+Math.cos(i*Math.PI/8)*18,y:y+Math.sin(i*Math.PI/8)*18})).every(p=>{const[l,r]=banks(p.y);return p.x>l&&p.x<r&&!floes.some(f=>COLLISION_MASKS[ASSET_FRAMES[f.asset][f.variant]].some(([xx,yy,w,h])=>{const ox=f.x-4*f.scale+xx*f.scale,oy=f.y-4*f.scale+yy*f.scale;return p.x>=ox&&p.x<=ox+w*f.scale&&p.y>=oy&&p.y<=oy+h*f.scale;}));});
const step=16,nx=100,ny=Math.floor((WORLD_HEIGHT-160)/step),valid=new Set<number>();
for(let iy=10;iy<ny;iy++){const y=iy*step,[l,r]=banks(y);for(let ix=Math.ceil(l/step);ix<r/step;ix++)if(navigable(ix*step,y))valid.add(iy*nx+ix);}
const start=[...valid].find(k=>Math.abs(Math.floor(k/nx)*step-1216)<20&&Math.abs(k%nx*step-760)<60)!;
const seen=new Set([start]),queue=[start];for(let i=0;i<queue.length;i++){const k=queue[i];for(const n of [k-1,k+1,k-nx,k+nx,k-nx-1,k-nx+1,k+nx-1,k+nx+1])if(valid.has(n)&&!seen.has(n)){seen.add(n);queue.push(n);}}
check([...seen].some(k=>Math.floor(k/nx)*step>5320),'Continuous navigable route from village to far gorge and back');
check(areaAt(4200)==='gorge'&&AREA_SPAWNS.gorge.spots===4,'Gorge uses existing area system');
check(eligibleRare({y:4650},{phase:'night',weather:'clear'}).includes('sleeper')&&!eligibleRare({y:4650},{phase:'day',weather:'clear'}).includes('sleeper'),'Rare fish conditions match data');
const shape=JSON.stringify([createFloes(),banks(4500)]),positions=new Set<string>();
for(let d=0;d<8;d++){const w=new DynamicWorld(43+d*51);w.newDay(d*37+71,{x:800,y:4500},{left:600,right:1000,top:4350,bottom:4650});const spots=w.spots.filter(s=>s.area==='gorge');check(spots.length>0&&spots.every(s=>validWater(s)&&!!s.weights.dolly&&!!s.weights.lenok),'Day '+d+' has valid gorge activity');spots.forEach(s=>positions.add(s.x+','+s.y));}
check(positions.size>8&&shape===JSON.stringify([createFloes(),banks(4500)]),'Trips vary encounters, not terrain');
const cargo=new Cargo();for(const id of ['dolly','lenok','sleeper'] as const){cargo.add(id);check(journalGuide(id,{phase:'night',weather:'clear'},4500,1).rows.some(r=>r.text.toLowerCase().includes('gorge')),'Journal habitat: '+id);}
const store=new SaveStore('arctic-drift.check-gorge');store.write({version:2,money:0,levels:{...STARTER_LEVELS},cargo:[...cargo.entries],records:cargo.records});check(store.load().cargo.length===3&&!!store.load().records.sleeper,'New species survive inventory/record save');
check(FISH.lenok.value>FISH.trout.value&&FISH.dolly.value>FISH.pike.value,'Rewards exceed regular lake fish');
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
for(const [name,y]of [['Entrance',4100],['Falls',4390],['Arch',4860],['Cave',5300]] as const){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{scene.cameras.main.stopFollow();const[l,r]=banks(y);scene.cameras.main.centerOn((l+r)/2,y);};document.body.prepend(b);}
const home=Reflect.get(scene,'home');home.walking=true;home.fisherman.setPosition(490,1189);
for(const id of ['dolly','lenok','sleeper'] as const)scene.cargo.add(id);
const quoted=scene.cargo.totalValue,balance=scene.wallet.balance;
const sold=home.sell();check(sold.count===3&&sold.earnings===quoted&&scene.wallet.balance===balance+quoted,'Existing seller pays correct values for all gorge fish');
home.walking=false;
