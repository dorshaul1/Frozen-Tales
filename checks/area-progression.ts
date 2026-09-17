import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {AREA_SPAWNS,type AreaId} from '../src/game/world/spawnRules';
import {AREA_PREPARATION,preparationHint} from '../src/game/world/preparation';
import {FISH,type FishId} from '../src/game/fishing/data';
import {SaveStore} from '../src/game/player/SaveStore';
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
let previous=0;for(const area of ['starting','bend','lake','gorge'] as AreaId[]){const table=AREA_SPAWNS[area].fish,entries=Object.entries(table) as [FishId,number][];const mean=entries.reduce((n,[id,w])=>n+FISH[id].value*w,0)/entries.reduce((n,[,w])=>n+w,0);check(mean>previous,area+' expected base catch value $'+mean.toFixed(1));previous=mean;check(new Set(AREA_PREPARATION[area].modules).size===3,area+' suggests three distinct existing modules');}
const key='arctic-drift.check-area-progression';localStorage.removeItem(key);const store=new SaveStore(key),scene=new RiverScene(key,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
const e=scene.equipment,c=scene.cargo,w=Reflect.get(scene,'wallet'),home=Reflect.get(scene,'home');
home.walking=true;Reflect.get(home,'fisherman').setPosition(490,1210);
check(e.purchase('rod')==='insufficient','Fresh player cannot buy gear without fishing income');
const base=e.fightFor('pike');let trips=0;
while(w.balance<60){for(let i=0;i<5;i++)c.add(i<3?'whitefish':'char',0,()=>.6);home.sell();trips++;if(trips>4)throw Error('Starter grind');}
check(e.purchase('rod')==='purchased'&&trips>=2,'Starter catches and existing seller fund Reinforced Rod in '+trips+' trips');
check(e.fightFor('pike').safeTensionWidth>base.safeTensionWidth&&e.fightFor('pike').snapTolerance>base.snapTolerance,'Purchase immediately improves Pike control and tolerance');
// Continue using increasingly valuable catches to fund the next rods.
for(const [species,cost] of [['pike',180],['trout',420]] as const){let trips=0;while(w.balance<cost){for(let i=0;i<5;i++)c.add(species,0,()=>.6);home.sell();if(++trips>5)throw Error('Excessive grind');}check(e.purchase('rod')==='purchased',species+' income funds next named rod within '+trips+' trips');}
e.canConfigure=()=>true;w.credit(1000);for(const id of ['cargo','mount','speed','turbo','hull','icebreaker'] as const)e.purchase(id);
e.setSlot(0,'cargo');e.setSlot(1,'mount');e.setSlot(2,'speed');const fishing=e.fightFor('trout').safeTensionWidth;
check(c.capacity===8&&e.value('turbo')===0,'Fishing build gains storage and brace, sacrifices Turbo');
e.setSlot(0,'turbo');e.setSlot(1,'speed');e.setSlot(2,'hull');check(c.capacity===5&&e.fightFor('trout').safeTensionWidth<fishing&&e.value('turbo')>0,'Current build trades storage and fishing brace for motor and hull');
e.save();check(store.load().loadout?.join(',')==='turbo,speed,hull'&&store.load().levels.rod===3,'Save retains rods, ownership and chosen three-slot build');
check(preparationHint(265,2080,3,e.levels,e.loadout).includes('Lantern'),'Cave advice checks personal equipment independently');
out.textContent+='ALL AREA PROGRESSION CHECKS PASSED';
const preview=document.createElement('button');preview.textContent='Preview preparation chart';preview.onclick=()=>{const map=Reflect.get(scene,'map');for(const y of [1200,2400,3550,4300])map.discovery.visit(800,y);map.open();Reflect.set(map,'selected',map.discovery.landmarks.values().next().value);Reflect.get(map,'renderList').call(map);};document.body.prepend(preview);
