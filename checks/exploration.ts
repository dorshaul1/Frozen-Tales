import {ICE_PASSAGES} from '../src/game/world/traversalData';
import {COLLISION_MASKS,ASSET_FRAMES} from '../src/game/assets/catalog';
import {thinIce} from '../src/game/world/driftingIce';
import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {SIDE_ROUTES,routeSpan,caveStrength,locationAt,locationPool} from '../src/game/world/sideRoutes';
import {waterSpans,banks,createFloes} from '../src/game/world/river';
import {DynamicWorld,validWater} from '../src/game/world/DynamicWorld';
import {eligibleRare,selectEncounter} from '../src/game/fishing/rareFish';
import {journalGuide} from '../src/game/fishing/journalGuide';
import {navigationFlow} from '../src/game/world/navigation';
import {Discovery} from '../src/game/map/discovery';
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+='\n'+(v?'PASS ':'FAIL ')+s;};
const scene=new RiverScene(null);new Phaser.Game({type:Phaser.AUTO,width:1100,height:760,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.game.events.off(Phaser.Core.Events.BLUR);
const kayak=Reflect.get(scene,'kayak'),body=kayak.body as Phaser.Physics.Arcade.Body;
const routes=SIDE_ROUTES.filter(r=>r.kind),outside={left:0,right:700,top:1000,bottom:1350};
for(const route of routes){
 const ends=[route.points[0],route.points[route.points.length-1]];
 check((route.deadEnd?ends.slice(0,1):ends).every(([x,y,w])=>{const[l,r]=banks(y);return x+w>l+25&&x-w<r-25;}),route.name+' connects to the main river');
 let clear=true;for(let y=ends[0][1]+20;y<(route.deadEnd?route.pocket.y:ends[1][1]-20);y+=8){const s=routeSpan(route,y)!,x=(s[0]+s[1])/2;for(let dy=-17;dy<=17;dy+=4)if(!waterSpans(y+dy).some(([l,r])=>x-Math.sqrt(289-dy*dy)>l&&x+Math.sqrt(289-dy*dy)<r))clear=false;}
 check(clear,route.name+' continuous hull clearance');
 check(validWater(route.pocket),route.name+' pocket supports dynamic fishing');
 const b=document.createElement('button');b.textContent=route.name;b.onclick=()=>{body.reset(route.pocket.x,route.pocket.y);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(route.pocket.x,route.pocket.y);};document.querySelector('#controls')!.append(b);
 if(route.interior){const entry=document.createElement('button');entry.textContent=route.name+' entrance';entry.onclick=()=>{const y=route.interior![0]-60,span=routeSpan(route,y)!;body.reset((span[0]+span[1])/2,y);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(body.center.x,body.center.y);};document.querySelector('#controls')!.append(entry);}
}
const lamp=document.createElement('button');lamp.textContent='Toggle lantern';lamp.onclick=()=>{scene.equipment.levels.lantern=1;scene.equipment.gear.lanternLit=!scene.equipment.gear.lanternLit;};document.querySelector('#controls')!.append(lamp);
const geometry=JSON.stringify(Array.from({length:280},(_,i)=>waterSpans(i*20)));
const seeds=[321,987,1527],signatures:string[]=[];
for(const seed of seeds){const world=new DynamicWorld(seed);world.newDay(seed,{x:700,y:1200},outside);signatures.push(JSON.stringify(world.spots.map(s=>[s.x,s.y])));check(routes.every(r=>world.spots.some(s=>locationAt(s.x,s.y)?.id===r.id)),seed+': activity in every new location; missing '+routes.filter(r=>!world.spots.some(s=>locationAt(s.x,s.y)?.id===r.id)).map(r=>r.id).join(','));check(world.spots.every(s=>validWater(s)),seed+': valid spawn terrain');check(JSON.stringify(Array.from({length:280},(_,i)=>waterSpans(i*20)))===geometry,'Fixed geography across seed '+seed);}
check(new Set(signatures).size===3,'Distinct encounters on three days');
const longTrip=new DynamicWorld(31);longTrip.newDay(31,{x:800,y:1200},outside);
let maximum=0;for(let tick=0;tick<80;tick++){longTrip.clock+=15;longTrip.update(50,{x:800,y:1200},outside);maximum=Math.max(maximum,longTrip.spots.length);}
check(maximum<=30,'Twenty-minute spawn lifecycle remains bounded: '+maximum+' spots');
const restoredWorld=new DynamicWorld(1);check(restoredWorld.restore(longTrip.snapshot())&&JSON.stringify(restoredWorld.spots.map(s=>[s.x,s.y,s.visitor]))===JSON.stringify(longTrip.spots.map(s=>[s.x,s.y,s.visitor])),'Reload preserves live encounter positions and rare opportunities');
const vault={x:280,y:6700},day={phase:'day',weather:'clear'} as const;
check(eligibleRare(vault,day).includes('veil')&&!eligibleRare({x:800,y:6700},day).includes('veil'),'Veilfin restricted to dynamic cave encounters');
const memory={};let seen=false;for(let i=0;i<4;i++)if(selectEncounter({trout:1},vault,day,memory,0,()=>.999)==='veil')seen=true;check(seen,'Cave rare encounter pity is bounded');
check(journalGuide('cisco',day,2080,0,265).rows[0].state==='met','Cave habitat journal uses live spawn location');
check(!journalGuide('trout',day,3700,0,250).rows[0].text.startsWith('Blueglass'),'Normal fish retain their normal area information');
const discovery=new Discovery();check(!discovery.landmarks.has('echo-vault'),'Cave hidden before discovery');discovery.visit(280,6700);check(new Discovery(discovery.snapshot()).landmarks.has('echo-vault'),'Discovered cave persists on chart');
const race=routes.find(r=>r.id==='needle-race')!,s=routeSpan(race,4360)!;check(navigationFlow((s[0]+s[1])/2,4360).y>120,'Short current benefits motor/stabilizer');
check(caveStrength(265,2080)===1&&caveStrength(800,1200)===0,'Cave visibility is local');
// Conservative navigation flood-fill includes floes, sheets and hull shoreline clearance.
const rects=createFloes().flatMap(f=>COLLISION_MASKS[ASSET_FRAMES[f.asset][f.variant]].map(([x,y,w,h])=>({x:f.x+(x-4)*f.scale,y:f.y+(y-4)*f.scale,w:w*f.scale,h:h*f.scale}))).concat(thinIce.map(f=>({x:f.x-f.width/2,y:f.y-f.height/2,w:f.width,h:f.height})));
const navigable=(x:number,y:number)=>{
 if(y<85||y>5515)return false;
 for(let dy=-17;dy<=17;dy+=3){const extent=Math.sqrt(17*17-dy*dy);if(!waterSpans(y+dy).some(([l,r])=>x-extent>=l&&x+extent<=r))return false;}
 return !rects.some(r=>Math.hypot(Math.max(r.x-x,0,x-r.x-r.w),Math.max(r.y-y,0,y-r.y-r.h))<17);
};
const step=10,width=Math.ceil(1600/step),height=Math.ceil(5600/step),seenNodes=new Set<number>(),queue:number[]=[];
const startX=Math.round(800/step),startY=Math.round(1200/step);queue.push(startY*width+startX);seenNodes.add(queue[0]);
for(let index=0;index<queue.length;index++){
 const node=queue[index],x=node%width,y=Math.floor(node/width);
 for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx<0||nx>=width||ny<0||ny>=height||seenNodes.has(n))continue;seenNodes.add(n);if(navigable(nx*step,ny*step))queue.push(n);}
}
const reached=new Set(queue);
for(const r of routes)check(reached.has(Math.round(r.pocket.y/step)*width+Math.round(r.pocket.x/step))===!ICE_PASSAGES.some(g=>g.route===r.id),r.name+': closed-gate access is correct');
rects.splice(createFloes().reduce((n,f)=>n+COLLISION_MASKS[ASSET_FRAMES[f.asset][f.variant]].length,0));
seenNodes.clear();queue.length=0;queue.push(startY*width+startX);seenNodes.add(queue[0]);
for(let index=0;index<queue.length;index++){const node=queue[index],x=node%width,y=Math.floor(node/width);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx<0||nx>=width||ny<0||ny>=height||seenNodes.has(n))continue;seenNodes.add(n);if(navigable(nx*step,ny*step))queue.push(n);}}
const openedReach=new Set(queue);for(const r of routes)check(openedReach.has(Math.round(r.pocket.y/step)*width+Math.round(r.pocket.x/step)),r.name+': reachable and escapable after opening ice');
check(!journalGuide('veil',day,6700,0,280,{icebreaker:false,openedPassages:[]}).available,'Journal explains sealed cave requirement');
check(journalGuide('veil',day,6700,0,280,{icebreaker:false,openedPassages:['vault-sheet']}).available,'Journal recognizes permanently opened entrance');
body.reset(265,2080);out.textContent+='\nREADY: preview buttons, WASD and Toggle lantern';
