import {AREA_EVENTS,generateEvents,setEventDay,readEventDay,activeEvent,eventFishTable,eventQuality,eventWildlife,eventFlow,type EventDay} from '../src/game/world/areaEvents';
import {SaveStore} from '../src/game/player/SaveStore';
import {eligibleRare} from '../src/game/fishing/rareFish';
const out=document.querySelector('#result')!,check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
let previous:EventDay|undefined;const seen=new Set<string>();let count=0;
for(let day=0;day<300;day++){const next=generateEvents(day,day*773+23,previous);if(next.events.length>2)throw Error('Too many events');for(const e of next.events){if(!(AREA_EVENTS[e.id].areas as readonly string[]).includes(e.area))throw Error('Wrong region');if(previous?.recent.some(r=>r.id===e.id&&r.area===e.area&&day-r.day<=3))throw Error('Repeated event');seen.add(e.id);count++;}previous=next;}
check(seen.size===7&&count<400,'300 days: varied valid regional events, uncommon frequency, three-day cooldown');
const base:EventDay={day:2,events:[{id:'salmon',area:'starting',start:180,end:540}],recent:[]};
setEventDay(base,179);check(!activeEvent(700,900),'Event inactive before start');setEventDay(base,180);check(eventFishTable({salmon:10,whitefish:90},700,900).salmon===25,'Salmon Run boosts eligible Salmon without injecting species');setEventDay(base,540);check(!activeEvent(700,900),'Event expires at exact boundary');
base.events[0].id='trophy';setEventDay(base,200);check(eventQuality(700,900)>1,'Trophy event increases existing specimen quality');
base.events[0].id='calm';check(eventFlow(700,900)<1,'Calm Waters reduces real current force');
base.events[0].id='gathering';check(eventWildlife(700,900)===1.5,'Wildlife gathering boosts existing spawn probability');
base.events[0].id='cave';check(!activeEvent(700,900)&&!!activeEvent(265,2080),'Cave event only affects actual cave water');
check(!eligibleRare({x:265,y:2080},{phase:'day',weather:'clear'}).includes('ember'),'Events do not bypass rare time requirements');
const store=new SaveStore('arctic-drift.check-area-events');store.write({...store.load(),areaEvents:base});check(JSON.stringify(readEventDay(store.load().areaEvents))===JSON.stringify(base),'Saved schedule restores without rerolling');store.write({...store.load(),money:19});check(readEventDay(store.load().areaEvents)?.events[0].id==='cave','Other progression saves retain event state');
out.textContent+='ALL EVENT CHECKS PASSED';
