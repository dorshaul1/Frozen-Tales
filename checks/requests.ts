import Phaser from 'phaser';
import { DailyRequests,REQUESTS } from '../src/game/requests/DailyRequests';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { Environment } from '../src/game/world/conditions';
import { SaveStore } from '../src/game/player/SaveStore';
import { Home } from '../src/game/home/Home';
import { BOARD } from '../src/game/requests/RequestBoard';
import { SLEEP } from '../src/game/home/Sleep';
import { visitNpc } from './hub-helper';
const lines:string[]=[];const check=(ok:boolean,s:string)=>{lines.push(`${ok?'PASS':'FAIL'} ${s}`);document.querySelector('#result')!.textContent=lines.join('\n');if(!ok)throw Error(s);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));const key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));const tap=async(c:number)=>{key(c,true);await wait(75);key(c,false);await wait(75);};
const saveKey='arctic-drift.check-requests';localStorage.removeItem(saveKey);
const scene=new RiverScene(saveKey),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:680,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
try {
 const model=new DailyRequests(undefined);let seed=1;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);let previous:string[]=[];
 for(let day=0;day<20;day++){model.newDay(day,{}, {phase:'morning',weather:'clear'},new Set(),rng);const ids=model.state.active.map(r=>r.id);check(ids.length>=2&&ids.length<=3&&ids.every(id=>!previous.includes(id)),'Day '+day+': 2–3 achievable varied requests, no consecutive repeats');check(ids.every(id=>!['pike','salmon','bend','lake','snow'].includes(id)),'Fresh player avoids undiscovered hard fish/areas and unavailable weather');previous=ids;}
 const fish={type:'char' as const,weightKg:2,value:11,rarity:'uncommon' as const,personalRecord:true};
 for(const d of REQUESTS){model.state.active=[{id:d.id,progress:0,claimed:false}];model.catch({...fish,type:d.fish??'char'},d.area??'starting',{phase:'night',weather:'light-snow'},true);if(d.kind==='sale')model.sale(40);check(model.state.active[0].progress>0,d.id+' objective tracks relevant event');model.state.active[0].progress=d.target;check(model.claim(0)===d.reward&&model.claim(0)===0,d.id+' pays exact reward once');}
 const clock=new Environment({elapsed:719,day:4});clock.update(2);check(clock.day===5&&clock.phase==='morning','Natural midnight advances day');clock.update(550);clock.sleepUntilMorning();check(clock.day===6&&clock.phase==='morning','Sleep advances to next morning');
 while(!scene.requestBoard)await wait(100);await wait(150);
 const home=Reflect.get(scene,'home') as Home;check(!scene.requestBoard.near,'Board cannot be used from kayak');visitNpc(scene,'cargo');home.fisherman.setPosition(BOARD.x,BOARD.y+27);scene.harborPanel.close();await tap(69);check(scene.requestBoard.isOpen,'Nearby walking interaction opens board');const y=home.player.y;key(83,true);await wait(180);key(83,false);check(home.player.y===y,'Board pauses walking');await tap(27);check(!scene.requestBoard.isOpen,'Escape closes board');key(83,true);await wait(180);key(83,false);check(home.player.y>y,'Walking restores');
 home.fisherman.setPosition(BOARD.x,BOARD.y+35);key(87,true);await wait(700);key(87,false);check(home.fisherman.y>=BOARD.y+20,'Board footing blocks walking through its visible base');
 scene.daily.state.active=[{id:'char',progress:0,claimed:false}];scene.events.emit('fish-landed',{fish,area:'starting',conditions:{phase:'day',weather:'clear'},large:false});check(scene.daily.state.active[0].progress===1,'Real catch event tracks without activating a request');
 let store=new SaveStore(saveKey);check(new DailyRequests(store.load().daily).state.active[0].progress===1,'Same-day progress persists');scene.equipment.save();store.writeMap({regions:[],landmarks:[]});store.writeAudio(store.loadAudio());store.writeEnvironment(scene.environment.snapshot());check(new DailyRequests(store.load().daily).state.active[0].progress===1,'Other save writers preserve requests');
 scene.events.emit('fish-landed',{fish,area:'starting',conditions:{phase:'day',weather:'clear'},large:false});home.fisherman.setPosition(BOARD.x,BOARD.y+27);const money=scene.wallet.balance;await tap(69);await tap(69);check(scene.wallet.balance===money+25&&scene.daily.state.active[0].claimed,'Board credits exact reward');await tap(69);check(scene.wallet.balance===money+25,'Repeated claim pays nothing');check(store.load().money===money+25&&new DailyRequests(store.load().daily).state.active[0].claimed,'Reward and claimed state persist together');await tap(27);
 const oldDay=scene.daily.state.day;Object.assign(scene.environment,{state:{elapsed:600,day:oldDay,weather:'clear',remaining:120,seed:13}});home.fisherman.setPosition(SLEEP.outside.x,SLEEP.outside.y);await tap(69);check(scene.sleep.active,'Existing igloo starts sleep');await wait(3700);check(scene.daily.state.day===oldDay+1&&scene.daily.state.active.every(r=>r.progress===0&&!r.claimed),'Sleep generates fresh daily requests');check(scene.wallet.balance===money+25,'Sleep preserves earnings');check(new DailyRequests(store.load().daily).state.day===oldDay+1,'New day persists');
 home.fisherman.setPosition(BOARD.x,BOARD.y+27);await tap(69);check(true,'Complete request loop passed · '+Math.round(game.loop.actualFps)+' FPS');
}catch(e){lines.push(String(e));document.querySelector('#result')!.textContent=lines.join('\n');}
