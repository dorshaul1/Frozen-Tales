import Phaser from 'phaser';
import {generateRiverDay,readRiverDay,setRiverDay,riverDay,dailyFishAffinity} from '../src/game/world/riverConditions';
import {SIDE_ROUTES} from '../src/game/world/sideRoutes';
import {waterSpans} from '../src/game/world/river';
import {navigationFlow} from '../src/game/world/navigation';
import {SaveStore} from '../src/game/player/SaveStore';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {ICE_PASSAGES} from '../src/game/world/traversalData';
import {FISH} from '../src/game/fishing/data';
const out=document.querySelector('#result')!,check=(ok:boolean,label:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+label;if(!ok)throw Error(label);};
const geo=JSON.stringify(Array.from({length:560},(_,i)=>waterSpans(i*10)));
let previous;const patterns=new Set<string>();
for(let day=0;day<100;day++){
 const state=generateRiverDay(day,day*7919,day%2?'heavy-snow':'clear',previous);setRiverDay(state);
 if(previous&&SIDE_ROUTES.some(r=>state.routes[r.id]===previous!.routes[r.id]))throw Error('Repeated local condition');
 if(Object.values(state.routes).filter(s=>s==='ice').length>2)throw Error('Too many gates');
 if(JSON.stringify(Array.from({length:560},(_,i)=>waterSpans(i*10)))!==geo)throw Error('Geography changed');
 if(JSON.stringify(readRiverDay(JSON.parse(JSON.stringify(state))))!==JSON.stringify(state))throw Error('Restore changed state');
 patterns.add(JSON.stringify(state.routes));previous=state;
}
check(patterns.size>80,'100 varied days, no consecutive repeated branch state; at most two temporary ice gates');
check(true,'Permanent geography identical for every day; day state round-trips without rerolls');
const r=SIDE_ROUTES.find(r=>r.id==='lantern-hollow')!,y=r.points[1][1]+60,x=335;
riverDay!.routes[r.id]='surge';const strong=navigationFlow(x,y);riverDay!.routes[r.id]='calm';const calm=navigationFlow(x,y);
check(Math.hypot(strong.x,strong.y)>Math.hypot(calm.x,calm.y)+5,'Short surge visibly stronger than calm water');
const p=r.pocket;riverDay!.routes[r.id]='calm';check(dailyFishAffinity(p.x,p.y,FISH.whitefish)>dailyFishAffinity(p.x,p.y,FISH.pike),'Calm water favors calmer valid fish');
const key='arctic-drift.check-river-days',store=new SaveStore(key);localStorage.removeItem(key);
const initial=generateRiverDay(1,19,'clear');for(const p of ICE_PASSAGES)initial.routes[p.route]='open';initial.routes.blueglass='ice';
store.write({...store.load(),openedPassages:ICE_PASSAGES.map(p=>p.id),riverDay:initial});
const scene=new RiverScene(key,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
// Align to the actual saved environment's day and refresh traversal once.
initial.day=Reflect.get(scene,'environment').day;setRiverDay(initial);store.write({...store.load(),riverDay:initial});const traversal=Reflect.get(scene,'traversal');traversal.refresh();
check(Reflect.get(traversal,'sheets').length===1,'Fresh ice recloses one previously opened optional entrance');
Reflect.get(traversal,'breakIce').call(traversal,'blueglass-sheet');
check(readRiverDay(store.load().riverDay)!.broken.includes('blueglass'),'Temporary break persists in current daily state');
traversal.refresh();check(Reflect.get(traversal,'sheets').length===0,'Broken daily gate stays open after reconstruction');
store.write({...store.load(),money:71});check(readRiverDay(store.load().riverDay)!.broken.includes('blueglass'),'Other save writes preserve daily openings');
const env=Reflect.get(scene,'environment'),home=Reflect.get(scene,'home'),kayak=Reflect.get(scene,'kayak');kayak.setPosition(r.pocket.x,r.pocket.y);env.sleepUntilMorning();const before=riverDay!.day;Reflect.get(scene,'refreshRiverDay').call(scene);
check(riverDay!.day===before,'Day rollover cannot close a branch around the player');
kayak.setPosition(800,1200);Reflect.get(scene,'refreshRiverDay').call(scene);
check(riverDay!.day===env.day&&riverDay!.day!==before,'Morning generates a new state after safe return');
check(store.load().money===71,'Daily change preserves permanent progression');
out.textContent+='\nALL DAILY RIVER CHECKS PASSED';
for(const mode of ['ice','surge','calm'] as const){const button=document.createElement('button');button.textContent=mode+' preview';button.onclick=()=>{riverDay!.routes.blueglass=mode;riverDay!.broken=[];traversal.refresh();kayak.setPosition(1210,2570);kayak.body.reset(1210,2570);scene.cameras.main.stopFollow();scene.cameras.main.centerOn(1210,2615);};document.body.prepend(button);}
