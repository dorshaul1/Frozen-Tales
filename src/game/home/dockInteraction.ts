// Shared front / waterside approach envelope for every landing dock.
export type DockPoint={x:number;y:number;landX:number;landY:number};
export function dockApproach(dock:DockPoint,p:{x:number;y:number}){
 const dx=p.x-dock.x,dy=Math.abs(p.y-dock.y);
 return dx>=-44&&dx<=30&&dy<=42&&Math.hypot(Math.max(0,dx),Math.max(0,dy-12))<=30;
}
export function dockBoarding(dock:DockPoint,p:{x:number;y:number}){
 return Math.hypot(p.x-dock.landX,p.y-dock.landY)<=25;
}
