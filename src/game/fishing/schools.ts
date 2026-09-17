import { WORLD_HEIGHT, WORLD_WIDTH } from '../world/river';
import { FISH,type FishId,type FishTable } from './data';
import type { WaterSign } from './spotReading';
export const SCHOOL_RULES = {
 calm:{chance:.75,min:2,max:5,speed:4,pause:1.6}, strong:{chance:.85,min:2,max:4,speed:6,pause:1},
 large:{chance:1,min:1,max:1,speed:3,pause:2}, erratic:{chance:1,min:1,max:3,speed:9,pause:.6},
 birds:{chance:.9,min:3,max:5,speed:6,pause:1}, shimmer:{chance:1,min:1,max:2,speed:4,pause:2},
} as const;
export const SCHOOL={roam:48,fastApproach:65,reactDistance:90,calmDistance:85,fleeSpeed:13,fleeDuration:1.2,cooldown:9,spacing:95};
export interface School { originX:number;originY:number;heading:number;target:number;turnIn:number;pause:number;flee:number;cooldown:number;spread:number;count:number;speed:number;pauseLength:number }
export function makeSchool(x:number,y:number,sign:WaterSign,pool:FishTable,random:()=>number):School|undefined {
 const r=SCHOOL_RULES[sign];if(random()>r.chance)return;
 const entries=Object.entries(pool) as [FishId,number][],total=entries.reduce((n,[,w])=>n+w,0)||1;
 const temperament=entries.reduce((n,[id,w])=>n+w*FISH[id].fight.struggleSpeed,0)/total;
 const heading=random()*Math.PI*2;
 return {originX:x,originY:y,heading,target:heading,turnIn:2+random()*3,pause:random()*2,flee:0,cooldown:0,spread:0,count:r.min+Math.floor(random()*(r.max-r.min+1)),speed:r.speed*Math.max(.7,temperament),pauseLength:r.pause};
}
export function restoreSchool(raw:unknown):School|undefined {
 const s=raw as School;if(!s||Object.values(s).some(v=>!Number.isFinite(v)))return;
 if(!['originX','originY','heading','target','turnIn','pause','flee','cooldown','spread','count','speed','pauseLength'].every(k=>Number.isFinite(s[k as keyof School])))return;
 if(s.count<1||s.count>5||!Number.isInteger(s.count)||s.speed<1||s.speed>20||s.originX<0||s.originX>WORLD_WIDTH||s.originY<0||s.originY>WORLD_HEIGHT)return;
 return {...s,turnIn:Math.min(6,s.turnIn),pause:Math.min(3,s.pause),flee:Math.min(1.2,s.flee),cooldown:Math.min(9,s.cooldown),spread:Math.max(0,Math.min(1,s.spread))};
}
export function moveSchool(spot:{x:number;y:number;school?:School},dt:number,player:{x:number;y:number},speed:number,random:()=>number,valid:(p:{x:number;y:number})=>boolean){
 const s=spot.school;if(!s)return;
 const distance=Math.hypot(spot.x-player.x,spot.y-player.y);
 s.cooldown=Math.max(0,s.cooldown-dt);s.flee=Math.max(0,s.flee-dt);s.pause=Math.max(0,s.pause-dt);s.turnIn-=dt;
 if(speed>SCHOOL.fastApproach&&distance<SCHOOL.reactDistance&&s.cooldown===0){s.target=Math.atan2(spot.y-player.y,spot.x-player.x);s.flee=SCHOOL.fleeDuration;s.cooldown=SCHOOL.cooldown;s.pause=0;}
 if(s.turnIn<=0&&s.flee===0){s.target=s.heading+(random()-.5)*1.8;s.turnIn=2+random()*4;if(random()<.4)s.pause=s.pauseLength;}
 s.spread+=(Number(s.flee>0)-s.spread)*Math.min(1,dt*2);
 const angle=Math.atan2(Math.sin(s.target-s.heading),Math.cos(s.target-s.heading));s.heading+=angle*Math.min(1,dt*2);
 // Calm approach lets the player park and cast without chasing a drifting target.
 if(s.pause>0||distance<SCHOOL.calmDistance&&speed<20&&s.flee===0)return;
 const travel=(s.flee>0?SCHOOL.fleeSpeed:s.speed)*dt;
 const next={x:spot.x+Math.cos(s.heading)*travel,y:spot.y+Math.sin(s.heading)*travel};
 if(Math.hypot(next.x-s.originX,next.y-s.originY)>SCHOOL.roam||!valid(next)){s.target=Math.atan2(s.originY-spot.y,s.originX-spot.x);s.pause=.4;return;}
 spot.x=next.x;spot.y=next.y;
}
