// Revision 5: fixed regional centerlines. Seeds and weather never enter geometry.
export const WORLD_REVISION=5;
export const VILLAGE_SHIFT={x:1500,y:1500};
export const WORLD_SIZE={width:6100,height:7800};
export type NetworkArea='starting'|'bend'|'lake'|'gorge'|'estuary';
type Node=readonly[number,number,number];
export const NETWORK_ROUTES:{id:string;name:string;area:NetworkArea;flow:number;points:readonly Node[]}[]=[
 {id:'home-north',name:'Homewater Fork',area:'starting',flow:10,points:[[2350,2350,145],[2190,2050,100],[1730,1770,95],[1240,1660,85],[890,1590,90]]},
 {id:'lake-return',name:'Lakeward Reach',area:'lake',flow:15,points:[[2340,2950,135],[2320,3240,125],[2010,3510,105],[1550,3580,100],[1150,3560,100]]},
 {id:'gorge-crossing',name:'Waterfall Passage',area:'gorge',flow:25,points:[[720,6110,110],[1060,6200,95],[1390,6380,95],[1770,6430,220]]},
 {id:'estuary-north',name:'Northern Outlet',area:'estuary',flow:25,points:[[2430,2330,115],[2650,2130,105],[2940,1950,170],[3250,1970,240],[3530,2260,280]]},
 {id:'estuary-bay',name:'Frozen Estuary',area:'estuary',flow:18,points:[[3460,2260,320],[3350,2670,490],[3400,3100,460],[3460,3480,300]]},
 // Local exploration reaches: entrances join the existing network; parallel
 // channels enclose dry land instead of enlarging every river uniformly.
 {id:'homewater-groves',name:'Homewater Groves',area:'starting',flow:9,points:[[2190,2050,100],[2230,1740,125],[2490,1440,170],[2350,1030,135],[2570,640,155],[2850,560,180],[3060,920,145],[2920,1320,135],[2830,1740,145],[2430,2170,125]]},
 {id:'blue-approach',name:'Spruce Shelf Reach',area:'bend',flow:14,points:[[920,3130,130],[1460,3120,110],[1760,3340,105],[1860,3770,120],[2260,4160,125],[2730,4380,130],[3020,4620,150]]},
 {id:'blue-inner',name:'Blue Ice Basin',area:'bend',flow:22,points:[[3020,4620,160],[3290,4610,150],[3500,4900,170],[3270,5270,160],[2870,5160,155]]},
 {id:'lake-approach',name:'Quietwater Reach',area:'lake',flow:9,points:[[1300,3580,105],[1500,3910,115],[1630,4410,110],[1550,4890,130],[1810,5410,180],[2070,5850,290]]},
 {id:'lake-basin',name:'Great Lake Water',area:'lake',flow:6,points:[[2070,5850,300],[2430,6060,470],[2550,6390,480],[2170,6650,410],[1780,6430,300],[1770,6040,240],[2070,5850,300]]},
 {id:'lake-blue-channel',name:'Windward Crossing',area:'lake',flow:17,points:[[2870,5160,155],[3080,5500,140],[3030,5760,140],[2720,6010,200],[2430,6060,380]]},
 {id:'outer-bays',name:'Outer Coastal Bays',area:'estuary',flow:17,points:[[3860,2850,145],[4290,2650,250],[4660,2780,420],[4960,3200,530],[4880,3700,570],[4520,4140,440],[4070,4240,260],[3660,3910,180],[3460,3480,300]]},
 {id:'coastal-isles',name:'Eastern Ice Isles',area:'estuary',flow:23,points:[[4960,3200,420],[5400,3100,230],[5570,3490,230],[5450,4050,240],[5100,4430,250],[4520,4140,360]]},
 {id:'coastal-return',name:'Leeward Coast Passage',area:'estuary',flow:16,points:[[4070,4240,210],[3900,4590,170],[3680,4900,145],[3500,4900,170]]},
];
export const REGION_CORES:Record<NetworkArea,{x:number;y:number}>={starting:{x:2570,y:1440},bend:{x:3290,y:4610},lake:{x:2430,y:6060},gorge:{x:700,y:6110},estuary:{x:4880,y:3700}};
export const ESTUARY_ISLANDS=[{x:3330,y:2570,rx:125,ry:170},{x:3540,y:3000,rx:150,ry:125},{x:3100,y:3200,rx:75,ry:100},{x:4710,y:3200,rx:160,ry:240},{x:5060,y:3800,rx:190,ry:155},{x:4580,y:4010,rx:90,ry:135},{x:5310,y:3430,rx:80,ry:120},{x:2330,y:6170,rx:130,ry:170},{x:2620,y:6480,rx:85,ry:105}];
// Smooth tangents through the authored control points. Radius interpolation is
// monotone, so narrow reaches do not acquire bulges or pinched joins.
const curves=NETWORK_ROUTES.map(route=>({route,samples:route.points.slice(1).flatMap((b,i)=>{
 const a=route.points[i],before=route.points[Math.max(0,i-1)],after=route.points[Math.min(route.points.length-1,i+2)],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/12);
 return Array.from({length:n},(_,k)=>{const t=k/n,t2=t*t,t3=t2*t,h00=2*t3-3*t2+1,h10=t3-2*t2+t,h01=-2*t3+3*t2,h11=t3-t2;
 return {x:h00*a[0]+h10*(b[0]-before[0])*.4+h01*b[0]+h11*(after[0]-a[0])*.4,y:h00*a[1]+h10*(b[1]-before[1])*.4+h01*b[1]+h11*(after[1]-a[1])*.4,r:a[2]+(b[2]-a[2])*(t2*(3-2*t))};});
}).concat([{x:route.points.at(-1)![0],y:route.points.at(-1)![1],r:route.points.at(-1)![2]}])}));
const discs=curves.flatMap(c=>c.samples);
const cache=new Map<number,number[][]>();
export function networkSpans(y:number){y=Math.floor(y/2)*2;const saved=cache.get(y);if(saved)return saved;const spans=discs.filter(d=>Math.abs(y-d.y)<d.r).map(d=>{const w=Math.sqrt(d.r*d.r-(y-d.y)**2);return [Math.floor(d.x-w),Math.ceil(d.x+w)];});cache.set(y,spans);return spans;}
export function islandSpans(y:number){return ESTUARY_ISLANDS.filter(i=>Math.abs(y-i.y)<i.ry).map(i=>{const t=(y-i.y)/i.ry, envelope=Math.sqrt(1-t*t),w=i.rx*envelope*(.88+.08*Math.cos(t*7)+.04*Math.sin(t*13)),center=i.x+envelope*(18*Math.sin(t*4)+8*Math.sin(t*9));return [Math.floor(center-w),Math.ceil(center+w)];});}
export function networkAt(x:number,y:number){
 let best:{route:typeof NETWORK_ROUTES[number];distance:number;dx:number;dy:number;width:number}|undefined;
 for(const {route,samples}of curves)for(let i=1;i<samples.length;i+=3){const a=samples[i-1],b=samples[Math.min(samples.length-1,i+2)];if(y<Math.min(a.y,b.y)-Math.max(a.r,b.r)-40||y>Math.max(a.y,b.y)+Math.max(a.r,b.r)+40)continue;const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1))),distance=Math.hypot(x-a.x-dx*t,y-a.y-dy*t),width=a.r+(b.r-a.r)*t;if(distance<width+40&&(!best||distance/width<best.distance/best.width))best={route,distance,dx,dy,width};}return best;
}
export function networkFlow(x:number,y:number){const n=networkAt(x,y);if(!n)return {x:0,y:0};const strength=n.route.flow*Math.max(0,1-n.distance/n.width),length=Math.hypot(n.dx,n.dy);return {x:n.dx/length*strength,y:n.dy/length*strength};}
