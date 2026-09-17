import Phaser from 'phaser';
import { DailyMarket } from '../src/game/market/DailyMarket';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { SaveStore } from '../src/game/player/SaveStore';
import { HUB, Home } from '../src/game/home/Home';
const out=document.querySelector('#result')!;const check=(ok:boolean,s:string)=>{out.textContent+='\n'+(ok?'PASS ':'FAIL ')+s;if(!ok)throw Error(s);};
const m=new DailyMarket(),records={whitefish:1,salmon:3,pike:4,char:2};let previous='';
for(let day=1;day<=12;day++){
 m.newDay(day,records,()=>.2);const high=Object.keys(m.state.rates).find(id=>m.state.rates[id as keyof typeof records]!>1)!;
 check(high!==previous,'Day '+day+' changes high demand');previous=high;
 check(Object.values(m.state.rates).every(v=>v>=.9&&v<=1.3),'Modest prices');
 const saved=JSON.stringify(m.state);m.newDay(day,records,()=>.9);check(JSON.stringify(m.state)===saved,'Same day does not reroll');
 check(JSON.stringify(new DailyMarket(JSON.parse(saved)).state)===saved,'Market restores exactly');
}
const key='arctic-drift.check-market';localStorage.removeItem(key);const scene=new RiverScene(key,true);
new Phaser.Game({type:Phaser.AUTO,parent:'test',width:1000,height:700,pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
scene.cargo.add('salmon');scene.cargo.add('whitefish');scene.cargo.add('pike');
scene.environment.sleepUntilMorning();Reflect.get(scene,'refreshRequests').call(scene);
check(scene.market.state.day===scene.environment.day,'Sleep morning refreshes market');
const fish=scene.cargo.entries[0],price=scene.market.price(fish);
check(scene.cargo.marketValue(fish)===price,'Cargo uses current quote');
const expected=scene.cargo.totalValue,before=scene.wallet.balance;
const home=Reflect.get(scene,'home') as Home;home.walking=true;home.fisherman.setPosition(HUB.seller.x,HUB.seller.y);
scene.harborPanel.open('cargo');const panel=scene.harborPanel as any;panel.selection=0;panel.activate();
check(scene.cargo.count===0&&scene.wallet.balance===before+expected,'Sell all pays exact current prices');
const reload=new SaveStore(key).load();check(JSON.stringify(new DailyMarket(reload.market).state)===JSON.stringify(scene.market.state),'Selling preserves saved daily market');
scene.cargo.add('salmon');scene.cargo.add('whitefish');scene.cargo.add('pike');panel.refresh();
check(!Object.keys(scene.market.state.rates).includes('crown'),'Market never reveals unknown fish');

const one=scene.cargo.entries[0],onePrice=scene.cargo.marketValue(one),balance=scene.wallet.balance;panel.selection=1;panel.activate();check(scene.wallet.balance===balance+onePrice,'Individual sale matches cargo quote');
panel.close();home.fisherman.setPosition(HUB.keeper.x,HUB.keeper.y);panel.open('journal');panel.selection=2;panel.detailOpen=true;panel.refresh();
const texts=panel.cards.list.filter((o:any)=>typeof o.text==='string').map((o:any)=>o.text).join(' ');check(texts.includes('Base $')&&texts.includes('Today $'),'Discovered journal shows base and current price');
panel.close();home.fisherman.setPosition(HUB.seller.x,HUB.seller.y);panel.open('cargo');