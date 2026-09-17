import type {FishTable} from '../fishing/data';
export interface SideRoute {id:string;name:string;points:readonly (readonly [number,number,number])[];pocket:{x:number;y:number};quality:number;flow:number;deadEnd?:boolean;archY?:number;kind?:'canyon'|'frozen-tunnel'|'channel'|'dark-cave'|'blue-cave'|'deep-pool'|'rapids';interior?:readonly [number,number];fish?:FishTable;jet?:readonly [number,number,number]}
// Authored centerlines, never generated from a trip seed. Widths are half-widths.
export const SIDE_ROUTES:readonly SideRoute[]=[
 {id:'willow-cove',name:'Willow Cove',points:[[620,1430,48],[455,1560,70],[595,1710,48]],pocket:{x:455,y:1560},quality:1.08,flow:0},
 {id:'ice-cut',name:'Ice Cut',points:[[800,2280,48],[670,2390,48],[645,2450,38],[645,2530,38],[470,2650,84],[440,2710,84],[420,2810,0]],pocket:{x:450,y:2690},quality:1.1,flow:15,kind:'frozen-tunnel',deadEnd:true,interior:[2520,2810]},
 {id:'stillwater',name:'Stillwater Hollow',points:[[1160,3470,48],[1320,3600,85],[1180,3740,48]],pocket:{x:1320,y:3600},quality:1.15,flow:0},
 {id:'glacier-sluice',name:'Glacier Sluice',points:[[810,4160,48],[665,4280,48],[650,4340,38],[625,4420,38],[510,4530,85],[500,4590,82],[490,4700,0]],pocket:{x:510,y:4550},quality:1.12,flow:40,kind:'canyon',deadEnd:true},
 {id:'rime-channel',name:'Rime Channel',points:[[1210,440,46],[1320,530,45],[1340,580,38],[1340,650,38],[1400,740,78],[1400,790,78],[1380,890,0]],pocket:{x:1400,y:760},quality:1.06,flow:0,kind:'channel',deadEnd:true,fish:{whitefish:65,char:30,salmon:5}},
 {id:'lantern-hollow',name:'Lantern Hollow',points:[[440,1750,48],[340,1870,42],[330,1950,36],[265,2060,92],[265,2120,92],[285,2170,65],[285,2240,38],[450,2310,48],[720,2390,72]],pocket:{x:265,y:2080},quality:1.12,flow:0,kind:'dark-cave',deadEnd:false,interior:[1910,2240],fish:{sculpin:20,cisco:60,char:28,whitefish:12}},
 {id:'blueglass',name:'Blueglass Cavern',points:[[1070,2380,48],[1200,2520,44],[1210,2580,36],[1210,2650,36],[1330,2760,102],[1340,2840,105],[1420,2920,55],[1420,3000,0]],pocket:{x:1335,y:2800},quality:1.16,flow:0,kind:'blue-cave',deadEnd:true,interior:[2650,3000],fish:{eel:5,sculpin:10,glasschar:52,trout:25,salmon:23}},
 {id:'underlake',name:'Underlake Pool',points:[[735,3260,80],[340,3460,76],[260,3530,40],[260,3610,36],[180,3730,100],[200,3810,65],[200,3880,0]],pocket:{x:180,y:3730},quality:1.22,flow:0,kind:'deep-pool',deadEnd:true,interior:[3600,3880],fish:{trout:65,pike:25,glasschar:10}},
 {id:'needle-race',name:'Needle Race',points:[[970,4130,72],[1210,4350,44],[1320,4520,95],[1040,4740,82],[720,4950,72]],pocket:{x:1320,y:4520},quality:1.15,flow:20,kind:'rapids',archY:4350,jet:[4300,120,148],fish:{lenok:55,dolly:25,salmon:20}},
 {id:'echo-vault',name:'Echo Vault',points:[[665,6240,62],[460,6390,58],[440,6460,38],[440,6540,38],[270,6670,115],[280,6750,120],[345,6830,75],[310,6910,0]],pocket:{x:280,y:6700},quality:1.25,flow:0,kind:'dark-cave',deadEnd:true,interior:[6550,6910],fish:{eel:12,sculpin:8,glasschar:40,trout:40,lenok:20}},
 {id:'grove-eddy',name:'Alderwater Eddy',points:[[2490,1330,65],[2660,1430,95],[2750,1580,60]],pocket:{x:2660,y:1430},quality:1.05,flow:0},
 {id:'basin-shelf',name:'Blue Crown Shelf',points:[[3400,4700,90],[3600,4820,100],[3500,4990,95]],pocket:{x:3600,y:4820},quality:1.1,flow:12},
 {id:'lake-deeps',name:'Lakewatch Deeps',points:[[2560,5830,110],[2810,6010,180],[2790,6220,145],[2680,6370,120]],pocket:{x:2810,y:6080},quality:1.16,flow:0},
 {id:'longwater-rest',name:'Longwater Rest',points:[[1140,6770,70],[1010,6870,85],[1130,7010,75]],pocket:{x:1010,y:6870},quality:1.1,flow:0},
 {id:'outer-shelter',name:'Leeward Ice Cove',points:[[5410,4040,130],[5670,4270,150],[5430,4500,120]],pocket:{x:5670,y:4270},quality:1.12,flow:0},
];
export function routeSpan(route:typeof SIDE_ROUTES[number],y:number):[number,number]|undefined {
 const p=route.points;
 // Rounded end caps share the collision contour: no flat cuts at authored endpoints.
 if(y<p[0][1]||y>p[p.length-1][1]){
  const end=y<p[0][1]?p[0]:p[p.length-1],dy=y-end[1];
  if(end[2]<=0||Math.abs(dy)>=end[2])return;
  const width=Math.sqrt(end[2]*end[2]-dy*dy);
  return [Math.floor(end[0]-width+Math.sin(y/29)*2),Math.ceil(end[0]+width+Math.sin(y/37)*2)];
 }
 for(let i=1;i<p.length;i++)if(y<=p[i][1]){
  const a=p[i-1],b=p[i],t=(y-a[1])/(b[1]-a[1]),smooth=t*t*(3-2*t);
  const interpolate=(axis:0|2)=>{
   const slope=(j:number)=>(p[j+1][axis]-p[j][axis])/(p[j+1][1]-p[j][1]);
   const tangent=(j:number)=>{if(j===0)return slope(0);if(j===p.length-1)return slope(j-1);const l=slope(j-1),r=slope(j);return l*r<=0?0:2*l*r/(l+r);};
   const dy=b[1]-a[1];return (2*t*t*t-3*t*t+1)*a[axis]+(t*t*t-2*t*t+t)*dy*tangent(i-1)+(-2*t*t*t+3*t*t)*b[axis]+(t*t*t-t*t)*dy*tangent(i);
  };
  const x=interpolate(0),w=interpolate(2);
  if(w<1)return;
  return [Math.floor(x-w+Math.sin(y/29)*2),Math.ceil(x+w+Math.sin(y/37)*2)];
 }
}
export function sideRouteAt(x:number,y:number){return SIDE_ROUTES.find(r=>{const s=routeSpan(r,y);return s&&x>s[0]&&x<s[1];});}
export function pocketAt(x:number,y:number){return SIDE_ROUTES.find(r=>Math.hypot(x-r.pocket.x,y-r.pocket.y)<85);}
export function routeFlow(x:number,y:number){const r=sideRouteAt(x,y);if(!r)return 0;if(r.jet&&y>r.jet[0]&&y<r.jet[0]+r.jet[1])return r.jet[2]*Math.sin((y-r.jet[0])/r.jet[1]*Math.PI);const lo=r.points[0][1],hi=r.points[r.points.length-1][1];return r.flow*Math.min(1,Math.max(0,(Math.hypot(x-r.pocket.x,y-r.pocket.y)-55)/80))*Math.sin((y-lo)/(hi-lo)*Math.PI);}

export function locationAt(x:number,y:number){return SIDE_ROUTES.find(r=>{if(!r.kind)return false;const s=routeSpan(r,y);return !!s&&x>s[0]&&x<s[1];});}
export function caveStrength(x:number,y:number){const r=locationAt(x,y);if(!r?.interior)return 0;const[a,b]=r.interior;return Math.max(0,Math.min(1,(y-a)/65,r.deadEnd?1:(b-y)/65));}
export function locationPool(x:number,y:number,fallback:FishTable):FishTable{const r=locationAt(x,y);return r?.fish&&(!r.interior||caveStrength(x,y)>.35)?r.fish:fallback;}
export function fishLocations(id:string){return SIDE_ROUTES.filter(r=>(r.fish as Record<string,number>|undefined)?.[id]);}
