import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
import {VILLAGE} from '../src/game/home/villageLayout';
import {ATLAS,ASSETS} from '../src/game/assets/catalog';
import {positionPanel,panelPoint} from '../src/game/ui/panelPosition';
import {banks} from '../src/game/world/river';
const scene=new RiverScene(null,true);
const game=new Phaser.Game({type:Phaser.AUTO,width:1040,height:700,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const out=document.querySelector('#result')!;
const check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
const home=Reflect.get(scene,'home'),camera=scene.cameras.main;
const objects=Reflect.get(home,'occluders') as {image:Phaser.GameObjects.Image;baseY:number}[];
for(const o of objects){home.walking=true;home.fisherman.y=o.baseY-1;home.update(0,false);check(o.image.depth>2,'Behind occlusion '+o.image.frame.name);home.fisherman.y=o.baseY+1;home.update(0,false);if(o.image.depth>=2)throw Error('Front occlusion');}
for(const b of VILLAGE.buildings){
 const base=b.y+Math.max(...b.bodies.map(r=>r[1]+r[3]));home.lighting.update(16,1,base-1);
 const light=scene.children.list.find(o=>o instanceof Phaser.GameObjects.Image&&o.frame.name===ASSETS[`${b.asset}-lights`]) as Phaser.GameObjects.Image;
 check(light.depth>2,'Window follows roof depth '+b.asset);
}
const panel=scene.add.container();
for(const [w,h]of [[440,650],[880,600],[1040,700],[1920,1080]])for(const zoom of [1,2,3]){
 camera.setSize(w,h).setZoom(zoom).setScroll(153.5,2077.3);positionPanel(scene,panel,420,280);
 const scale=panel.scaleX*zoom;
 check(Number.isInteger(scale)&&420*scale<=w&&280*scale<=h&&panel.scrollFactorX===0,`Chart fits ${w}×${h} zoom ${zoom}`);
 const point=panelPoint(scene,panel,{x:w/2+40*scale,y:h/2+20*scale} as Phaser.Input.Pointer);
 if(Math.abs(point.x-40)>.001||Math.abs(point.y-20)>.001)throw Error('Pointer transform');
}
panel.destroy();camera.setSize(1040,700).setZoom(2);home.walking=false;home.fisherman.setVisible(false);
const kayak=Reflect.get(scene,'kayak');camera.startFollow(kayak);
const button=(name:string,fn:()=>void)=>{const b=document.createElement('button');b.textContent=name;b.onclick=fn;document.querySelector('#controls')!.append(b);};
const close=()=>{scene.harborPanel.close();scene.audioPanel.close();Reflect.get(scene,'map').close();};
button('Cargo',()=>{close();scene.harborPanel.openCargo();});button('Pause',()=>{close();scene.audioPanel.open();});button('Chart',()=>{close();Reflect.get(scene,'map').open();});button('Close',close);
button('Journal',()=>{close();home.walking=true;home.fisherman.setPosition(VILLAGE.npcs.keeper.x-24,VILLAGE.npcs.keeper.y);scene.harborPanel.open('journal');});
button('Tools',()=>{close();home.walking=true;home.fisherman.setPosition(VILLAGE.npcs.tools.x+24,VILLAGE.npcs.tools.y);scene.harborPanel.open('tools');});
button('Narrow',()=>game.scale.resize(440,650));button('Wide',()=>game.scale.resize(1040,700));
for(const [name,y]of [['River',1200],['Bend',2200],['Lake',3400],['Gorge',4900]] as const)button(name,()=>{close();const [l,r]=banks(y);kayak.body.reset((l+r)/2,y);});
out.textContent+='ALL INTEGRITY CHECKS PASSED\n';
