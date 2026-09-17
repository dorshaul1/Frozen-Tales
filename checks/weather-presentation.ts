import {navigationFlow,NAVIGATION} from '../src/game/world/navigation';
import {banks} from '../src/game/world/river';
import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {WEATHER,type WeatherId} from '../src/game/world/conditions';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));while(!scene.fishing)await wait(100);
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
const env=Reflect.get(scene,'environment'),view=Reflect.get(scene,'environmentView'),weather=Reflect.get(scene,'weatherView'),particles=Reflect.get(weather,'particles'),player=Reflect.get(scene,'home').player;
const set=(id:WeatherId)=>{Reflect.get(env,'state').weather=id;for(let i=0;i<600;i++)view.update(1/60);weather.update(16,player,false);};
set('clear');const before=view.storm;Reflect.get(env,'state').weather='heavy-snow';view.update(1/60);check(view.storm>before&&view.storm-before<.01,'Storm ramps gradually, not instantly');
set('heavy-snow');check(particles.filter((p:any)=>p.image.visible).length>180,'Storm fills the view with dense reusable layers');
const count=scene.children.length;for(let i=0;i<300;i++)weather.update(16,player,false);check(scene.children.length===count,'No per-frame particle/entity allocations');
set('rain');check(particles.filter((p:any)=>p.image.visible&&p.image.texture.key==='weather-rain').length>100,'Rain covers the viewport with continuous streaks');
view.cave=1;weather.update(16,player,false);check(particles.every((p:any)=>!p.image.visible),'Cave interior suppresses outdoor precipitation');view.cave=0;
check(particles.every((p:any)=>p.image.depth<5&&p.image.scrollFactorX===0),'Weather is camera-stable and behind fishing UI/HUD');
for(const id of Object.keys(WEATHER) as WeatherId[]){const button=document.createElement('button');button.textContent=id;button.onclick=()=>set(id);document.body.prepend(button);}
set('heavy-snow');out.textContent+='ALL WEATHER CHECKS PASSED';

const [left,right]=banks(2500),x=(left+right)/2;
const calm=navigationFlow(x,2500,'clear'),wet=navigationFlow(x,2500,'rain'),wind=navigationFlow(x,2500,'windy');
check(Math.hypot(wet.x,wet.y)>Math.hypot(calm.x,calm.y),'Rain strengthens river currents');
check(Math.hypot(wind.x,wind.y)>Math.hypot(wet.x,wet.y),'Wind creates stronger directional water');
check(Math.hypot(NAVIGATION.whirlpool.pull,NAVIGATION.whirlpool.swirl)+NAVIGATION.maxFlow+NAVIGATION.weather.wind+NAVIGATION.weather.downstream<140,'Whirlpool pull is bounded and escape remains possible');
