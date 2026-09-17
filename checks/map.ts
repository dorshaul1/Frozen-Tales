import Phaser from 'phaser';
import { Discovery,MAP,MAP_MARKERS } from '../src/game/map/discovery';
import { CHART } from '../src/game/map/WorldMap';
import { crossingAccess,placeGroup } from '../src/game/map/access';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { SaveStore } from '../src/game/player/SaveStore';
import { Home } from '../src/game/home/Home';
import { Kayak } from '../src/game/entities/Kayak';
import { banks,createFloes,WORLD_WIDTH,WORLD_HEIGHT } from '../src/game/world/river';
import { VILLAGE } from '../src/game/home/villageLayout';
import { ICE_PASSAGES } from '../src/game/world/traversalData';
const keyName='arctic-drift.check-map';localStorage.removeItem(keyName);
const results:string[]=[],check=(ok:boolean,text:string)=>{results.push(`${ok?'PASS':'FAIL'} ${text}`);document.querySelector('#result')!.textContent=results.join('\n');if(!ok)throw Error(text);};
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms)),key=(code:number,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{keyCode:code,which:code,bubbles:true}));
const tap=async(code:number)=>{key(code,true);await wait(70);key(code,false);await wait(90);};
const scene=new RiverScene(keyName,true),game=new Phaser.Game({type:Phaser.AUTO,parent:'test',width:800,height:650,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
try{
 const fresh=new Discovery();check(fresh.regions.size<20&&fresh.landmarks.size===1,'Fresh chart reveals only the home region');
 check(!fresh.known(800,3500)&&!fresh.landmarks.has('lake'),'Unknown area names stay hidden');
 const geometry=JSON.stringify([banks(2400),createFloes()]);
 fresh.visit(800,2500);check(fresh.known(800,2500)&&!fresh.known(800,3100),'Discovery remains local');
 check(!fresh.visit(800,2500).changed,'Revisits do not duplicate discoveries');
 check(JSON.stringify(new Discovery(fresh.snapshot()).snapshot())===JSON.stringify(fresh.snapshot()),'Discovery round-trips without loss');
 check(new Set(MAP_MARKERS.map(m=>m.id)).size===MAP_MARKERS.length&&new Set(MAP_MARKERS.map(m=>m.name)).size===MAP_MARKERS.length,'Catalog has unique places and IDs');
 const ice=MAP_MARKERS.find(m=>m.id==='ice-cut')!;
 check(crossingAccess(ice,{icebreaker:false,openedPassages:[]}).state==='blocked','Known crossing requires the real icebreaker capability');
 check(crossingAccess(ice,{icebreaker:true,openedPassages:[]}).state==='breakable','Owning the tool does not falsely mark unbroken ice as open');
 check(crossingAccess(ice,{icebreaker:false,openedPassages:['ice-cut-sheet']}).state==='open','Previously opened passage stays accessible');
 check(MAP_MARKERS.filter(m=>m.kind==='entrance').every(m=>crossingAccess(m,{icebreaker:false,openedPassages:[]}).state==='open'),'No invented area level locks: main river remains reachable');
 while(!Reflect.get(scene,'map'))await wait(100);await wait(150);game.events.off(Phaser.Core.Events.BLUR);
 const home=Reflect.get(scene,'home') as Home,kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,body=kayak.body as Phaser.Physics.Arcade.Body,map=scene.map;
 await tap(77);check(map.isOpen,'M opens chart');const x=kayak.x;key(68,true);await wait(180);key(68,false);check(kayak.x===x,'Map pauses movement');
 check(MAP.width>CHART.sidebarWidth*2.4,'Chart is over 2.4 times the sidebar width');
 const list=Reflect.get(map,'list') as Phaser.GameObjects.Container;
 const strings=()=>list.list.filter(o=>o instanceof Phaser.GameObjects.Text).map(o=>(o as Phaser.GameObjects.Text).text);
 check(!strings().some(t=>t.includes('Frozen Lake')),'Fresh contents do not leak undiscovered places');
 const p=Reflect.get(map,'point').call(map,kayak.x,kayak.y),top=Reflect.get(map,'top');
 check(p.x===CHART.left+Math.round(kayak.x*CHART.scale)&&p.y===CHART.top+Math.round((kayak.y-top)*CHART.scale),'Player projection uses world position and pan offset');
 const a=Reflect.get(map,'point').call(map,400,1200),b=Reflect.get(map,'point').call(map,500,1300);
 check(Math.abs((b.x-a.x)-(b.y-a.y))<=1,'Chart preserves geographic proportions in both axes');
 await tap(40);check(Reflect.get(map,'top')>top,'Down scrolls along the river');await tap(32);check(Math.abs(Reflect.get(map,'top')-top)<1,'Space recentres on player');
 await tap(27);check(!map.isOpen,'Escape closes chart');key(68,true);await wait(180);key(68,false);check(kayak.x>x,'Kayak controls restore');
 body.reset(VILLAGE.dock.x,VILLAGE.dock.y);home.interactDock();home.fisherman.setPosition(389,1170);await wait(100);await tap(77);
 const y=home.fisherman.y;key(83,true);await wait(150);key(83,false);check(home.fisherman.y===y,'Map pauses village walking');await tap(77);key(83,true);await wait(150);key(83,false);check(home.fisherman.y>y,'M closes and restores walking');
 map.open();scene.audioPanel.open();check(!map.isOpen&&scene.audioPanel.isOpen,'Settings preserve exclusive input locks');scene.audioPanel.close();
 for(const m of MAP_MARKERS)map.discovery.visit(m.x,m.y);
 const store=new SaveStore(keyName);store.writeMap(map.discovery.snapshot());const snapshot=JSON.stringify(store.loadMap());scene.equipment.save();store.writeAudio(store.loadAudio());store.writeEnvironment(store.loadEnvironment());
 check(JSON.stringify(store.loadMap())===snapshot,'Equipment/audio/time saves preserve map state');
 const restored=new Discovery(store.loadMap());check(MAP_MARKERS.every(m=>restored.landmarks.has(m.id)),'Known places survive save/load');
 map.open();
 for(const group of ['areas','landmarks','services']){
  Reflect.set(map,'group',group);Reflect.get(map,'renderList').call(map);
  const groupPlaces=MAP_MARKERS.filter(m=>placeGroup(m)===group);
  check(groupPlaces.every(m=>strings().filter(t=>t===m.name||t==='≋ '+m.name).length===1),'Each '+group+' place appears once');
 }
 Reflect.set(map,'group','landmarks');Reflect.set(map,'selected','ice-cut');Reflect.get(map,'center').call(map,2510);
 check(strings().includes('Ice crossing closed.\nFit an icebreaker bow.\nPocket may be reached\nfrom the other end.'),'Closed crossing has explicit actionable status, not unexplored');
 scene.equipment.levels.icebreaker=1;Reflect.set(scene.equipment,'installed',['icebreaker',null,null]);Reflect.get(map,'renderList').call(map);check(strings().some(t=>t.includes('Use your icebreaker')),'Map reads live equipment state');
 Reflect.get(Reflect.get(scene,'traversal'),'opened').add('ice-cut-sheet');Reflect.get(map,'renderList').call(map);check(!strings().some(t=>t.includes('Ice crossing closed')||t.includes('Use your icebreaker')),'Live traversal opening clears map warning');
 check(JSON.stringify([banks(2400),createFloes()])===geometry,'Map never changes fixed geography');
 check(map.temporaryMarkers.length===0,'No random fish or wildlife clutter');
 for(const[label,action]of [
  ['Fresh',()=>{map.close();map.discovery.regions.clear();map.discovery.landmarks.clear();const d=new Discovery();d.regions.forEach(k=>map.discovery.regions.add(k));d.landmarks.forEach(k=>map.discovery.landmarks.add(k));map.open();}],
  ['Explored',()=>{map.close();for(let y=100;y<WORLD_HEIGHT;y+=100){const[l,r]=banks(y);map.discovery.visit((l+r)/2,y);}MAP_MARKERS.forEach(m=>map.discovery.visit(m.x,m.y));map.open();}],
  ['Ice crossing',()=>{map.close();map.discovery.visit(ice.x,ice.y);Reflect.get(Reflect.get(scene,'traversal'),'opened').delete('ice-cut-sheet');scene.equipment.levels.icebreaker=0;Reflect.set(scene.equipment,'installed',[null,null,null]);map.open();Reflect.set(map,'group','landmarks');Reflect.set(map,'selected','ice-cut');Reflect.get(map,'center').call(map,2510);}],
  ['Narrow',()=>{game.scale.resize(440,400);}],
  ['Wide',()=>{game.scale.resize(880,650);}],
 ] as [string,()=>void][]){const button=document.createElement('button');button.textContent=label;button.onclick=action;document.querySelector('#views')!.append(button);}
 check(true,'Map redesign verification complete');
}catch(e){results.push(String(e));document.querySelector('#result')!.textContent=results.join('\n');}finally{[77,27,68,83,40,32].forEach(c=>key(c,false));}
