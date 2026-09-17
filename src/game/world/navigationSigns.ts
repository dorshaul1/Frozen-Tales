import {waterSpans,landDecorationFits,navigationLandmarks} from './river';
import {villageReserved} from '../home/villageLayout';
import {landingReserved} from '../home/Landings';
// Route waypoints establish directions, never straight-line bearings to distant
// destinations. Only public routes: no caves, secret pockets or new chart entries.
export const DIRECTION_SIGNS=[
 {id:'home-outlet-sign',x:2430,y:2170,variant:0,arrows:[{name:'Coast',dx:220,dy:-40},{name:'Home',dx:0,dy:180}]},
 {id:'lake-approach-sign',x:1550,y:3580,variant:1,arrows:[{name:'Lake',dx:-50,dy:330},{name:'Blue Ice',dx:210,dy:-240}]},
 {id:'blue-lake-sign',x:2870,y:5160,variant:2,arrows:[{name:'Lake',dx:210,dy:340},{name:'Blue Ice',dx:400,dy:110}]},
 {id:'waterfall-crossing-sign',x:1060,y:6200,variant:3,arrows:[{name:'Gorge',dx:-340,dy:-90},{name:'Lake',dx:330,dy:180}]},
] as const;
let places:({id:string;x:number;y:number;variant:number})[]|undefined;
export function navigationSigns(){return places??=DIRECTION_SIGNS.flatMap(sign=>{
 const candidates:{x:number;y:number;score:number}[]=[];
 for(let dy=-180;dy<=180;dy+=12)for(let dx=-240;dx<=240;dx+=12){const x=sign.x+dx-37,y=sign.y+dy-18;
  if(x<0||villageReserved(x,y,45)||landingReserved(x,y)||!landDecorationFits(x,y,74,36))continue;
  if(navigationLandmarks().some(p=>x<p.x+p.width+12&&x+74>p.x-12&&y<p.y+p.height+12&&y+36>p.y-12))continue;
  const spans=waterSpans(y+18),edge=Math.min(...spans.flatMap(([l,r])=>[Math.abs(x+37-l),Math.abs(x+37-r)]));
  if(edge<42||edge>90)continue;candidates.push({x,y,score:dx*dx+dy*dy+edge*edge});
 }
 candidates.sort((a,b)=>a.score-b.score);const p=candidates[0];return p?[{id:sign.id,x:p.x,y:p.y,variant:sign.variant}]:[];
});}
export function signReserved(x:number,y:number,w:number,h:number){return navigationSigns().some(p=>x<p.x+84&&x+w>p.x-10&&y<p.y+46&&y+h>p.y-10);}
