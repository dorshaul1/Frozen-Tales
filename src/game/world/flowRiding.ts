import {networkAt} from './regionNetwork';
import {banks} from './river';
import {sideRouteAt,routeSpan,pocketAt} from './sideRoutes';

// Fixed stretches follow the authored banks; weather only shifts their water movement.
export const FLOW_STRETCHES=[
 {start:5580,end:6090,power:58,width:.28},
 {start:6530,end:7080,power:66,width:.27},
 {start:300,end:940,power:28,width:.27},
 {start:1440,end:1920,power:32,width:.26},
 {start:2190,end:2680,power:55,width:.3},
 {start:2800,end:3280,power:60,width:.28},
 {start:3530,end:3780,power:38,width:.24},
 {start:4170,end:4570,power:66,width:.3},
 {start:4700,end:5240,power:72,width:.27},
] as const;
export type RideFlow={x:number;y:number;strength:number;boost:number};
export const NO_RIDE:RideFlow={x:0,y:1,strength:0,boost:0};
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export function ridingFlow(x:number,y:number,rough=0):RideFlow{
 const regional=networkAt(x,y);if(regional&&(x>1550||y>5500)){const core=smooth(1-regional.distance/regional.width),length=Math.hypot(regional.dx,regional.dy);return {x:regional.dx/length,y:regional.dy/length,strength:core,boost:regional.route.flow*(1+rough*.2)*core};}
 const main=banks(y),route=x<main[0]||x>main[1]?sideRouteAt(x,y):undefined,stretch=FLOW_STRETCHES.find(s=>y>s.start&&y<s.end);
 if(!route&&!stretch||pocketAt(x,y))return NO_RIDE;
 const span=(yy:number)=>route?routeSpan(route,yy):banks(yy);
 const here=span(y),before=span(y-24),after=span(y+24);
 if(!here||!before||!after||x<here[0]+30||x>here[1]-30)return NO_RIDE;
 const start=route?route.points[0][1]:stretch!.start,end=route?route.points.at(-1)![1]:stretch!.end;
 const fade=smooth((y-start)/70)*smooth((end-y)/70);
 const half=(here[1]-here[0])/2,center=(here[0]+here[1])/2;
 const shift=Math.sin(y/180)*rough*.06,offset=(x-center)/half-shift;
 const core=1-smooth(Math.abs(offset)/(stretch?.width??.42));
 // Broad weak upstream ribbons leave an escape/upstream option on either side.
 const edge=1-smooth(Math.abs(Math.abs(offset)-.63)/.19);
 const upstream=edge>core,weight=upstream?edge*.55:core;
 const slope=((after[0]+after[1])-(before[0]+before[1]))/96;
 const direction=upstream?-1:1,length=Math.hypot(slope,1);
 const strength=weight*fade;
 return {x:slope/length*direction,y:direction/length,strength,boost:(route?30:stretch!.power)*(1+rough*.3)*strength};
}
/** Smooth stored momentum, with active counter-steering acting as a brake. */
export function rideMomentum(previous:number,flow:RideFlow,vx:number,vy:number,dt:number){
 const speed=Math.hypot(vx,vy),alignment=speed>12?(vx*flow.x+vy*flow.y)/speed:0;
 const target=flow.boost*smooth((alignment-.15)/.7)*smooth((speed-12)/50);
 const rate=target>previous?1.5:alignment<-.2?3:.8;
 return previous+(target-previous)*(1-Math.exp(-rate*Math.min(dt,.05)));
}
