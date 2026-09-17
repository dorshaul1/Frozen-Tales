import Phaser from 'phaser';
import { FISH,type FishId } from '../src/game/fishing/data';
import { rollSpecimen,specimenFight,SPECIMENS } from '../src/game/fishing/specimens';
import { FishFight } from '../src/game/fishing/FishFight';
import { Cargo } from '../src/game/player/Cargo';
import { SaveStore } from '../src/game/player/SaveStore';
import { STARTER_LEVELS } from '../src/game/upgrades/data';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { LegendaryCatchCard } from '../src/game/fishing/LegendaryCatchCard';
import { HUB } from '../src/game/home/Home';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
let seed=421;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),counts={normal:0,large:0,trophy:0,record:0};
for(let i=0;i<20000;i++){const f=rollSpecimen('salmon',0,random);counts[f.size]++;if(f.value>42||f.weightKg>6.4)throw Error('Out of bounds');}
check(counts.normal>15000&&counts.normal<17000&&counts.trophy>500&&counts.trophy<900&&counts.record>50&&counts.record<160,'20,000 catches have fair frequencies');out.textContent+='\n'+JSON.stringify(counts);
for(const id of Object.keys(FISH) as FishId[])for(const size of ['large','trophy','record'] as const){const base=new FishFight(FISH[id].fight,random),data=specimenFight(FISH[id].fight,size),f=new FishFight(data,random);check(f.maxStamina>base.maxStamina&&data.personality===base.data.personality,'Same personality, stronger '+size+': '+id);for(let n=0;n<12000&&f.outcome==='fighting';n++)f.update(1/60,f.tension<.5,.9,f.readyToLand);check(f.outcome==='landed',size+' remains fair: '+id);}
const cargo=new Cargo(),specimen=rollSpecimen('salmon',0,()=>.01);check(!cargo.records.salmon,'Preparing specimen does not record an uncaught fish');const caught=cargo.land(specimen);cargo.store(caught);check(cargo.count===1&&cargo.trophies.salmon===1&&caught.personalRecord,'Trophy uses one slot and records once');
const store=new SaveStore('arctic-drift.check-trophies');store.write({version:2,money:0,levels:{...STARTER_LEVELS},cargo:[...cargo.entries],records:cargo.records,trophies:cargo.trophies});const saved=store.load();check(saved.cargo[0].size==='trophy'&&saved.trophies?.salmon===1&&saved.records.salmon===caught.weightKg,'Cargo, records and trophy counts persist');
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
scene.cargo.store(scene.cargo.land(specimen));const home=Reflect.get(scene,'home');home.walking=true;home.fisherman.setPosition(HUB.seller.x,HUB.seller.y);const quote=scene.cargo.totalValue,before=scene.wallet.balance;home.sell();check(scene.wallet.balance===before+quote&&scene.cargo.count===0,'Existing seller pays size bonus exactly');
const card=new LegendaryCatchCard(scene);card.show(caught,false);scene.events.on('postupdate',()=>card.update(home.player.x,home.player.y,3));scene.cameras.main.startFollow(home.player);
