import Phaser from 'phaser';import {loadAssets,createTextures,ATLAS,ASSETS} from '../src/game/assets/textures';import {WILDLIFE_SIZE} from '../src/game/world/wildlifeSize';
class Review extends Phaser.Scene{
 preload(){loadAssets(this);}
 create(){createTextures(this);this.cameras.main.setZoom(2);this.cameras.main.setBackgroundColor('#dde7e5');this.cameras.main.centerOn(210,155);
 const ids=Object.keys(WILDLIFE_SIZE) as (keyof typeof WILDLIFE_SIZE)[],sprites:Phaser.GameObjects.Sprite[]=[];let d=0,moving=false;
 for(const [i,id]of ids.entries()){const s=this.add.sprite(60+(i%5)*76,110+Math.floor(i/5)*84,ATLAS,ASSETS[id]).setScale(WILDLIFE_SIZE[id].scale);sprites.push(s);this.add.text(s.x,s.y+29,id.replace('village-',''),{fontFamily:'monospace',fontSize:'8px',color:'#223c50'}).setOrigin(.5);}
 this.add.image(120,245,ATLAS,ASSETS.fisherman);this.add.image(180,245,ATLAS,ASSETS.kayak);this.add.image(245,245,ATLAS,ASSETS['tree-mature']);this.add.image(305,245,ATLAS,ASSETS['hub-crate']);
 const pose=()=>sprites.forEach((s,i)=>s.play(`${ids[i]}/${['E','S','W','N'][d]}/${moving?'walk':'idle'}`));pose();document.querySelector('#turn')!.addEventListener('click',()=>{d=(d+1)%4;pose();});document.querySelector('#walk')!.addEventListener('click',()=>{moving=!moving;pose();});
 document.querySelector('#result')!.textContent='Native source frames unchanged. Mixed species at 2× gameplay zoom.\nReferences: fisherman · kayak · mature tree · crate';
 }
}
new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,roundPixels:true,scene:[Review]});
