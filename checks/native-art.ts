import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {ASSET_FRAMES,ATLAS,ANIMATIONS} from '../src/game/assets/catalog';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const out=document.querySelector('#result')!;function check(v:boolean,s:string){out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);}
const terrain=scene.textures.get('river').getSourceImage() as HTMLCanvasElement;
check(terrain.width===1600&&terrain.height===5600,'Native world canvas 1600×5600');
for(const [id,w,h]of [['kayak',48,60],['fisherman',32,32],['penguin',32,32],['polar-bear',56,56],['bird',28,28],['village-igloo',96,80]] as const){const f=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][0]);check(f.cutWidth===w&&f.cutHeight===h&&f.realWidth===w&&f.realHeight===h,id+' original native size');}
const kayak=Reflect.get(scene,'kayak');check(kayak.body.radius===17&&kayak.scaleX===1,'Original hull footprint');
check(ANIMATIONS.every(a=>scene.anims.exists(a.key)),'All original animation mappings registered');
scene.cameras.main.stopFollow();scene.cameras.main.centerOn(380,1160);
for(let i=0;i<4;i++){const d=['N','S','E','W'][i];scene.add.sprite(345+i*30,1180,ATLAS,`bird/${d}/idle/0`).setDepth(40).play(`bird/${d}/idle`);scene.add.sprite(345+i*30,1210,ATLAS,`bird/${d}/walk/0`).setDepth(40).play(`bird/${d}/walk`);}
out.textContent+='Native atlas and animation checks complete.';
