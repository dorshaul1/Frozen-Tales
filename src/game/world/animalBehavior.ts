import { validSnow,validWater,type Point,type Encounter } from './DynamicWorld';
import {caveStrength} from './sideRoutes';
import {WILDLIFE_SIZE} from './wildlifeSize';
import { waterSpans,WORLD_HEIGHT,WORLD_WIDTH } from './river';
import { ANIMAL_RULES,type AnimalId } from './spawnRules';
import type { Conditions } from './conditions';
export type AnimalAction='travel'|'rest'|'forage'|'inspect'|'social'|'perch'|'alert'|'swim';
type Profile={activities:readonly AnimalAction[];pause:readonly[number,number];range:number;reaction:'flee'|'gather'|'notice'|'dive'|'fly';distance:number;speed:number;habitat:'cover'|'shore'|'open'|'air'|'ice'};
export const ANIMAL_BEHAVIOR:Record<AnimalId,Profile>={
 'musk-ox':{activities:['forage','rest','inspect','rest'],pause:[14,24],range:95,reaction:'gather',distance:105,speed:.85,habitat:'open'},
 wolf:{activities:['inspect','rest','inspect'],pause:[7,14],range:210,reaction:'notice',distance:120,speed:1.5,habitat:'open'},
 wolverine:{activities:['forage','inspect','rest'],pause:[5,10],range:120,reaction:'flee',distance:85,speed:1.4,habitat:'cover'},
 raven:{activities:['perch','inspect'],pause:[8,16],range:190,reaction:'fly',distance:80,speed:1.2,habitat:'air'},
 penguin:{activities:['social','rest','inspect'],pause:[7,14],range:85,reaction:'gather',distance:60,speed:1.1,habitat:'shore'},
 seal:{activities:['rest','inspect'],pause:[12,22],range:85,reaction:'dive',distance:70,speed:1,habitat:'ice'},
 fox:{activities:['forage','inspect'],pause:[4,8],range:120,reaction:'flee',distance:100,speed:1.9,habitat:'cover'},
 hare:{activities:['forage','rest'],pause:[5,10],range:75,reaction:'flee',distance:85,speed:1.8,habitat:'cover'},
 reindeer:{activities:['forage','rest'],pause:[9,17],range:150,reaction:'flee',distance:115,speed:1.35,habitat:'open'},
 'polar-bear':{activities:['inspect','rest'],pause:[12,22],range:130,reaction:'notice',distance:110,speed:1,habitat:'shore'},
 otter:{activities:['forage','inspect'],pause:[5,9],range:90,reaction:'flee',distance:70,speed:1.5,habitat:'shore'},
 owl:{activities:['perch'],pause:[6,11],range:210,reaction:'fly',distance:100,speed:1.15,habitat:'air'},
 bird:{activities:['perch'],pause:[4,8],range:150,reaction:'fly',distance:75,speed:1.3,habitat:'air'},
};
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function swimmingWater(p:Point,r=7){return p.y>100&&p.y<WORLD_HEIGHT-100&&waterSpans(p.y).some(([l,h])=>p.x-r>l+12&&p.x+r<h-12);}
export function snowPath(a:Point,b:Point,r:number){const n=Math.ceil(dist(a,b)/8);for(let i=1;i<=n;i++)if(!validSnow({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},r))return false;return true;}
// Formation follows the shared travel heading; individuals retain their own gait and pace.
export function formationTarget(goal:AnimalGoal,index:number):Point {
 const e=goal.encounter,n=e.points.length;if(n===1)return {...goal.target};
 const center={x:e.points.reduce((s,p)=>s+p.x,0)/n,y:e.points.reduce((s,p)=>s+p.y,0)/n};
 const heading=Math.atan2(goal.target.y-center.y,goal.target.x-center.x),spacing=WILDLIFE_SIZE[e.species].spacing;
 const trail=e.species==='wolf'||e.species==='reindeer';
 const across=trail?(index%2-.5)*spacing:(index-(n-1)/2)*spacing*(goal.reaction?.8:1);
 const behind=trail?-Math.floor(index/2)*spacing:Math.sin(index*2.4)*spacing*.45;
 return {x:goal.target.x+Math.cos(heading)*behind-Math.sin(heading)*across,y:goal.target.y+Math.sin(heading)*behind+Math.cos(heading)*across};
}
export class AnimalGoal{
 action:AnimalAction;target:Point;timer:number;cooldown=0;cycle=0;reaction=false;revision=0;
 overWater=false;groundTarget=false;private fish:Point[]=[];private recent:Point[]=[];private random:()=>number;
 constructor(readonly encounter:Encounter){let seed=(encounter.id*997+Math.round(encounter.points[0].x*31+encounter.points[0].y))>>>0;this.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};this.target={...encounter.points[0]};const profile=ANIMAL_BEHAVIOR[encounter.species];this.action=profile.activities[Math.floor(this.random()*profile.activities.length)];this.timer=profile.habitat==='air'?0:profile.pause[0]+this.random()*(profile.pause[1]-profile.pause[0]);}
 update(dt:number,player:Point,conditions:Conditions,trees:Point[],expired:boolean,fish:Point[]=[]){
  this.fish=fish;
  const e=this.encounter,p=ANIMAL_BEHAVIOR[e.species],air=p.habitat==='air',ice=p.habitat==='ice';
  const center={x:e.points.reduce((s,a)=>s+a.x,0)/e.points.length,y:e.points.reduce((s,a)=>s+a.y,0)/e.points.length};
  this.timer-=dt;this.cooldown-=dt;
  const frightened=this.cooldown<=0&&e.points.some(a=>dist(a,player)<p.distance);
  if(frightened){this.cooldown=12;this.reaction=true;this.revision++;
   if(p.reaction==='notice'){this.action='alert';this.timer=5;return;}
   if(p.reaction==='gather'){this.target={...center};this.action='travel';this.timer=5;return;}
   if(e.species==='otter'&&this.waterEscape(center)){this.action='swim';this.timer=18;return;}
   this.choose(center,trees,player,true,conditions);this.action=ice?'swim':'travel';this.timer=ice?14:20;return;
  }
  if(e.species==='otter'&&this.action==='swim'){if(this.timer<=0)e.departed=true;return;}
  if(ice){if(this.action==='swim'){if(this.timer<=0)e.departed=true;return;}if(expired||this.timer<=0&&this.cycle>0){this.choose(center,trees,player,false,conditions);this.action='swim';this.timer=18;this.revision++;}else if(this.timer<=0){this.action='inspect';this.timer=8;this.cycle++;}return;}
  if(this.action==='travel'){
   const arrived=e.points.filter(a=>dist(a,this.target)<(e.points.length>1?45:12)).length>=Math.ceil(e.points.length*.75);
   if((arrived&&this.timer<22)||this.timer<=0){
    if(expired){this.choose(center,trees,player,false,conditions);this.timer=24;return;}
    this.action=p.activities[this.cycle++%p.activities.length];
    if(air&&this.overWater){this.action='inspect';this.timer=4;this.reaction=false;return;}
    // Flying wildlife only settles on an actual selected perch.
    if(air&&!this.groundTarget&&!trees.some(t=>dist(t,this.target)<2)){this.timer=0;this.choose(center,trees,player,false,conditions);this.action='travel';this.timer=12;return;}
    if(air&&this.groundTarget)this.action='forage';
    this.timer=p.pause[0]+this.random()*(p.pause[1]-p.pause[0]);this.reaction=false;
    if(conditions.weather==='heavy-snow'||conditions.phase==='night'&&e.species!=='owl')this.timer*=1.25;
   }
  }else if(this.timer<=0||expired){this.choose(center,trees,player,false,conditions);this.action='travel';this.timer=24;this.reaction=false;this.revision++;}
 }
 private waterEscape(center:Point){
  for(let radius=30;radius<=110;radius+=10)for(let i=0;i<24;i++){const q={x:center.x+Math.cos(i*Math.PI/12)*radius,y:center.y+Math.sin(i*Math.PI/12)*radius};if(validWater(q,8,false)&&caveStrength(q.x,q.y)<.1){this.target=q;return true;}}return false;
 }
 private choose(center:Point,trees:Point[],player:Point,away:boolean,conditions:Conditions){
  const e=this.encounter,p=ANIMAL_BEHAVIOR[e.species],r=ANIMAL_RULES[e.species].radius;
  this.overWater=false;this.groundTarget=false;
  if(e.species==='raven'&&!away&&this.random()<.45){const ground=trees.map(t=>({x:t.x+30,y:t.y+24})).find(q=>dist(q,center)<p.range&&validSnow(q,8));if(ground){this.target=ground;this.groundTarget=true;return;}}
  if(p.habitat==='air'&&!away&&this.random()<.25){const fish=this.fish.find(q=>dist(q,center)<p.range*2&&validWater(q,8,false));if(fish){this.target={...fish};this.overWater=true;return;}}
  const nearby=trees.filter(t=>dist(t,center)<p.range*2&&dist(t,center)>35);
  const choices:Point[]=[];
  if(p.habitat==='air')choices.push(...nearby);
  if(p.habitat==='cover')choices.push(...nearby.map(t=>({x:t.x+45,y:t.y+30})));
  for(let i=0;i<18;i++){
   const angle=away?Math.atan2(center.y-player.y,center.x-player.x)+(this.random()-.5):this.random()*Math.PI*2;
   const range=p.range*(.45+this.random()*.55);const q={x:Math.round(center.x+Math.cos(angle)*range),y:Math.round(center.y+Math.sin(angle)*range)};
   if(p.habitat==='shore'&&!away&&i<10){const spans=waterSpans(q.y);const edges=spans.flat();const edge=edges.reduce((best,x)=>Math.abs(x-center.x)<Math.abs(best-center.x)?x:best,edges[0]);q.x=edge+(center.x<edge?-1:1)*(r+28+this.random()*35);}
   choices.push(q);
  }
  const valid=choices.filter(q=>q.x>25&&q.x<WORLD_WIDTH-25&&q.y>120&&q.y<WORLD_HEIGHT-120&&(p.habitat==='air'?caveStrength(q.x,q.y)<.1:p.habitat==='ice'?swimmingWater(q)&&validWater(q,8,false):snowPath(center,q,r)));
  valid.sort((a,b)=>{
   const score=(q:Point)=>(this.recent.some(t=>dist(t,q)<40)?200:0)+(away?-dist(q,player):Math.abs(dist(q,center)-p.range*.65))+(p.habitat==='air'&&!nearby.includes(q)?300:0)+(conditions.weather==='heavy-snow'&&p.habitat==='cover'?Math.min(...nearby.map(t=>dist(q,t)),200)*.2:0);
   return score(a)-score(b);
  });
  this.target=valid[0]??{...center};this.recent.push({...this.target});this.recent=this.recent.slice(-3);
 }
}
