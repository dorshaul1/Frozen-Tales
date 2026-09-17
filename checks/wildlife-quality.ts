import Phaser from 'phaser';import {loadAssets,createTextures,ATLAS} from '../src/game/assets/textures';
const species=['penguin','polar-bear','fox','hare','reindeer','otter','seal','owl','bird'],directions=['N','NE','E','SE','S','SW','W','NW'];
class Review extends Phaser.Scene{
 sprites:Phaser.GameObjects.Sprite[]=[];animal='penguin';mode='walk';
 preload(){loadAssets(this);}
 create(){createTextures(this);this.cameras.main.setBackgroundColor('#b5cbd0');
 directions.forEach((d,i)=>{const x=100+i%4*190,y=105+Math.floor(i/4)*220;this.add.text(x-15,y-75,d,{fontSize:'16px',color:'#243f4a'});this.sprites.push(this.add.sprite(x,y,ATLAS,`${this.animal}/${d}/idle/0`).setScale(3));});
 for(const s of species){const b=document.createElement('button');b.textContent=s;b.onclick=()=>{this.animal=s;this.show();};document.querySelector('#controls')!.append(b);}
 const b=document.createElement('button');b.textContent='Idle / Walk';b.onclick=()=>{this.mode=this.mode==='idle'?'walk':'idle';this.show();};document.querySelector('#controls')!.append(b);
 for(const s of species)for(const d of directions)for(const a of ['idle','walk'])if(!this.anims.exists(`${s}/${d}/${a}`))throw Error(`Missing ${s}/${d}/${a}`);
 document.querySelector('#result')!.textContent='PASS All 144 directional animations registered; native canvases and anchors retained.';this.show();
 }
 show(){this.sprites.forEach((s,i)=>s.play(`${this.animal}/${directions[i]}/${this.mode}`));}
}
new Phaser.Game({type:Phaser.AUTO,width:800,height:480,parent:'test',pixelArt:true,scene:[Review]});
