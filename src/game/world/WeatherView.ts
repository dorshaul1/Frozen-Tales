import Phaser from 'phaser';
import type {EnvironmentView} from './EnvironmentView';
import {caveStrength} from './sideRoutes';
import {waterAt} from './river';
import type {AudioManager} from '../audio/AudioManager';
// Reusable native-pixel sprites. Camera-space precipitation never trails a camera pan.
export class WeatherView {
 private particles:{image:Phaser.GameObjects.Image;x:number;y:number;layer:number}[]=[];
 private haze:Phaser.GameObjects.Image[]=[];
 private splashes:Phaser.GameObjects.Image[]=[];
 private elapsed=0;
 constructor(private scene:Phaser.Scene,private env:EnvironmentView,private audio:AudioManager){
  const make=(key:string,w:number,h:number,draw:(g:Phaser.GameObjects.Graphics)=>void)=>{
   if(scene.textures.exists(key))return;const g=scene.make.graphics({x:0,y:0});draw(g);g.generateTexture(key,w,h);g.destroy();
  };
  make('weather-dot',1,1,g=>g.fillStyle(0xe7edf0).fillRect(0,0,1,1));
  make('weather-flake',3,3,g=>g.fillStyle(0xe7edf0).fillRect(1,0,1,3).fillRect(0,1,3,1));
  make('weather-rain',3,10,g=>g.fillStyle(0xa9c5d4,.6).fillRect(2,0,1,4).fillRect(1,4,1,3).fillRect(0,7,1,3));
  make('weather-splash',9,3,g=>g.fillStyle(0xa9c5d4,.6).fillRect(0,1,2,1).fillRect(7,1,2,1).fillRect(2,2,5,1));
  make('weather-haze',128,48,g=>{for(let y=0;y<48;y+=4)for(let x=0;x<128;x+=4){const d=((x-64)/64)**2+((y-24)/24)**2;if(d<1)g.fillStyle(0xa9becd,(1-d)*.18).fillRect(x,y,4,4);}});
  for(let i=0;i<660;i++)this.particles.push({image:scene.add.image(0,0,'weather-flake').setScrollFactor(0).setDepth(4.2).setVisible(false),x:((i*137)%997)/997,y:((i*313)%991)/991,layer:i%3});
  for(let i=0;i<12;i++)this.haze.push(scene.add.image(0,0,'weather-haze').setScrollFactor(0).setDepth(4.1).setVisible(false));
  for(let i=0;i<32;i++)this.splashes.push(scene.add.image(0,0,'weather-splash').setScrollFactor(0).setDepth(1.2).setVisible(false));
 }
 update(delta:number,player:{x:number;y:number},lantern:boolean){
  const dt=Math.min(delta,50)/1000;this.elapsed+=dt;
  const e=this.env,c=this.scene.cameras.main,w=c.width/c.zoom,h=c.height/c.zoom,left=(c.width-w)/2,top=(c.height-h)/2;
  const shelter=1-Math.min(1,e.cave*2),rain=e.rain;
  const area=Math.max(.8,w*h/(440*300)),snowCount=Math.min(420,(e.flakes*1.6+e.gust*16)*area)*shelter,rainCount=Math.min(240,rain*240*area)*shelter;
  const gust=e.wind*(.85+.25*Math.sin(this.elapsed*.65));
  this.particles.forEach((p,i)=>{
   const rainy=i>=420,count=rainy?rainCount:snowCount,index=rainy?i-420:i;
   p.x=(p.x+dt*gust*(.65+p.layer*.35)/w+1)%1;p.y=(p.y+dt*(rainy?150+p.layer*30:12+p.layer*15)/h)%1;
   const x=left+p.x*w,y=top+p.y*h,wx=c.scrollX+x,wy=c.scrollY+y;
   const visible=index<count&&shelter>.01&&caveStrength(wx,wy)<.15;
   p.image.setVisible(visible);if(!visible)return;
   const near=Math.hypot(wx-player.x,wy-player.y)<85,alpha=(.3+p.layer*.16)*(near&&lantern?.45:1)*Math.min(1,count-index);
   p.image.setTexture(rainy?'weather-rain':p.layer===2?'weather-flake':'weather-dot').setPosition(Math.round(x),Math.round(y)).setAlpha(alpha).setScale(1);
  });
  this.haze.forEach((image,i)=>{
   const x=left+((i*97+this.elapsed*gust*.18)%(w+128))-64,y=top+(i*71%Math.max(1,h));
   const distance=Math.hypot(c.scrollX+x-player.x,c.scrollY+y-player.y);
   image.setVisible(shelter>.01).setPosition(Math.round(x),Math.round(y)).setAlpha((e.storm+rain*.3)*shelter*Math.min(1,distance/(lantern?190:100))).setScale(2);
  });
  this.splashes.forEach((image,i)=>{const x=left+(i*83%w),y=top+(i*127%h),phase=(this.elapsed*1.8+i*.37)%1;
   image.setVisible(rain>.02&&shelter>.01&&phase<.4&&waterAt(c.scrollX+x,c.scrollY+y)&&caveStrength(c.scrollX+x,c.scrollY+y)<.15).setPosition(Math.round(x),Math.round(y)).setAlpha(rain*(1-phase/.4)*.4);
  });
  this.audio.setWeatherMix(e.gust*shelter,rain*shelter);
 }
}
