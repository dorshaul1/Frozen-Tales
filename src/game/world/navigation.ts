import {networkFlow} from './regionNetwork';
import {landings} from '../home/Landings';
import {VILLAGE,WORKSHOP_BAY} from '../home/villageLayout';
import {eventFlow} from './areaEvents';
import {interactionAt} from './interactionSpots';
import {riverConditionAt,RIVER_STATES,dailyCurrent} from './riverConditions';
import { currentAt } from './areas';
import { caveStrength,routeFlow,pocketAt,locationAt,sideRouteAt,routeSpan } from './sideRoutes';
import { depthValue } from './depth';
import { banks,waterSpans } from './river';
import type { WeatherId } from './conditions';
// Short, soft-edged sections. Existing routes and geographic banks never change.
export const NAVIGATION={
 weather:{wind:27,downstream:16,iceSpeed:1.8},
 whirlpool:{interval:18000,chance:.5,maxActive:2,minY:2200,lifetime:100,fadeIn:8,fadeOut:12,pull:24,swirl:20},
 sections:[{y:520,length:130,cross:3},{y:2460,length:180,cross:16},{y:3590,length:220,cross:-8},{y:4540,length:170,cross:25},{y:5000,length:160,cross:-21}],
 drift:[{y:550,side:1,speed:2},{y:2520,side:-1,speed:3.5},{y:3640,side:1,speed:2.5},{y:4580,side:-1,speed:4}],
 streamSpeed:24,maxFlow:55,playerClearance:95,fishClearance:95,centerClearance:85,collisionCooldown:900,
};
// Calm service water: no current in the berth, smoothly returning outside approach.
export function dockFlowScale(x:number,y:number){
 const distance=Math.min(...[VILLAGE.dock,WORKSHOP_BAY,...landings()].map(d=>Math.hypot(x-d.x,y-d.y)));
 const t=Math.max(0,Math.min(1,(distance-65)/75));return t*t*(3-2*t);
}
export function navigationFlow(x:number,y:number,weather:WeatherId='clear'){
 const [l,r]=waterSpans(y).find(([l,r])=>x>=l&&x<=r)??banks(y),edge=Math.max(0,Math.min(x-l,r-x));
 const shelter=pocketAt(x,y)?0:Math.min(1,edge/(locationAt(x,y)?.jet?38:70));
 const section=x<1550?NAVIGATION.sections.find(s=>y>s.y&&y<s.y+s.length):undefined;
 const wind=weather==='windy'?1.7:weather==='heavy-snow'?1.55:weather==='rain'?1.35:1;
 const condition=riverConditionAt(x,y),multiplier=(condition?RIVER_STATES[condition].flow:1)*eventFlow(x,y);
 const xFlow=(section?section.cross*Math.sin((y-section.y)/section.length*Math.PI):0)*shelter*wind*multiplier;
 const yFlow=((x<1550?currentAt(y):0)+routeFlow(x,y)+dailyCurrent(x,y))*shelter*wind*multiplier;
 const maxFlow=locationAt(x,y)?.jet?150:NAVIGATION.maxFlow;
 const spot=interactionAt(x,y),calm=spot?.type==='eddy'?1-spot.strength*.9:1;
 const pocketFlow=spot?.type==='current'?26*spot.strength:0;
 const route=sideRouteAt(x,y);
 let streamX=0,streamY=0;
 if(route){
  const span=routeSpan(route,y)!,before=routeSpan(route,y-8),after=routeSpan(route,y+8);
  if(before&&after){
   const center=(span[0]+span[1])/2,half=(span[1]-span[0])/2;
   const core=Math.max(0,1-Math.abs(x-center)/Math.max(1,half-17));
   const ends=Math.min(1,(y-route.points[0][1])/50,(route.points.at(-1)![1]-y)/70);
   const slope=((after[0]+after[1])-(before[0]+before[1]))/32;
   const speed=NAVIGATION.streamSpeed*core*ends*multiplier*(spot?.type==='eddy'?.12:1);
   streamY=speed/Math.hypot(slope,1);streamX=streamY*slope;
  }
 }
 const cap=Math.min(1,maxFlow/(Math.hypot(xFlow,yFlow)||1));
 const dockScale=dockFlowScale(x,y),regional=networkFlow(x,y);
 streamX+=regional.x*wind*shelter;streamY+=regional.y*wind*shelter;
 return {x:(xFlow*cap*calm+streamX)*dockScale,y:((yFlow*cap+pocketFlow)*calm+streamY)*dockScale,
 speed:1-.1*Math.max(0,(.3-depthValue(x,y))/.3)};
}

// Smooth protection from existing authored coves, cliff pockets and cave mouths.
export function shelterAt(x:number,y:number){
 const spot=interactionAt(x,y);
 const natural=Math.max(caveStrength(x,y),pocketAt(x,y)?.65:0,spot?.type==='eddy'?spot.strength*.9:0);
 return Math.min(.95,Math.max(0,natural));
}
