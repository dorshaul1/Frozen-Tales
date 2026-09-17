import Phaser from 'phaser';
import { SIDE_ROUTES,routeSpan } from './sideRoutes';
import {riverDay} from './riverConditions';
import {validWater} from './DynamicWorld';
import {navigationFlow} from './navigation';
// Reuse native ripple strokes and ice fragments: no extra entities or terrain.
export class RiverConditionView {
 private graphics:Phaser.GameObjects.Graphics;
 private last=-100;
 constructor(private scene:Phaser.Scene){
  this.graphics=scene.add.graphics().setDepth(1.15);
  // Habitat information comes from water depth and tools, without a glowing area marker.
 }
 update(time:number){
  if(time-this.last<80)return;this.last=time;this.graphics.clear();if(!riverDay)return;
  const view=this.scene.cameras.main.worldView,g=this.graphics;
  for(const route of SIDE_ROUTES){
   const state=riverDay.routes[route.id];
   if(state==='ice')continue; // Traversal owns the physical sheet and breaking feedback.
   const lo=route.points[0][1]+30,hi=route.points[route.points.length-1][1]-30;
   if(hi<=lo||lo>view.bottom||hi<view.top)continue;
   for(let i=0;i<12;i++){
    const y=lo+(i*47+time/(state==='surge'?65:220))%Math.max(1,hi-lo),span=routeSpan(route,y);if(!span)continue;
    const x=Math.round((span[0]+span[1])/2+Math.sin(i*13+riverDay.seed)*12);
    if(!view.contains(x,y)||!validWater({x,y},12,false))continue;
    const py=Math.round(y),flow=navigationFlow(x,y);
    g.lineStyle(1,0xa6cbd2,state==='surge'?.38:.22);
    if(Math.hypot(flow.x,flow.y)>4)g.lineBetween(x,py,x+Math.round(flow.x*.3),py+Math.round(flow.y*.3));
    else g.strokeEllipse(x,py,state==='calm'?12:7,3);
   }
  }
 }
}
