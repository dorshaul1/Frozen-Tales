import {RegionalDiscovery,type RegionalSave} from './RegionalDiscovery';
import {areaAt,AREA_SPAWNS,type AreaId} from '../world/spawnRules';
import {WORLD_REVISION,NETWORK_ROUTES,REGION_CORES} from '../world/regionNetwork';
import {landings} from '../home/Landings';
import { landmarkBounds } from '../world/ecologyLandmarks';
import { SIDE_ROUTES } from '../world/sideRoutes';
import { banks, bankLandmarkX, navigationLandmarks, WORLD_WIDTH, WORLD_HEIGHT } from '../world/river';
import { AREAS } from '../world/areas';
import { VILLAGE } from '../home/villageLayout';
export const MAP = { chunk:128, revealRadius:210, width:272, height:218 };
export type MarkerKind='village'|'npc'|'landmark'|'entrance';
export interface MapMarker { id:string; name:string; x:number; y:number; kind:MarkerKind; radius:number; notify?:boolean }
const formation=(name:string)=>{const l=landmarkBounds().find(l=>l.name===name)!;return {x:l.x+l.width/2,y:l.y+l.height/2};};
const center=(y:number)=>{const[l,r]=banks(y);return(l+r)/2;};
export const MAP_MARKERS:MapMarker[]=[
 ...navigationLandmarks().map(c=>({id:c.id,name:c.name,x:c.x+c.width/2,y:c.y+c.height/2,kind:'landmark' as const,radius:180,notify:true})),
 {id:'estuary',name:'Frozen Estuary',...REGION_CORES.estuary,kind:'entrance',radius:240,notify:true},
 ...NETWORK_ROUTES.filter(r=>['home-north','lake-return','gorge-crossing'].includes(r.id)).map(r=>({id:r.id,name:r.name,x:r.points[2][0],y:r.points[2][1],kind:'landmark' as const,radius:90,notify:true})),
 ...landings().map(s=>({id:s.id,name:s.name,x:s.x,y:s.y,kind:'landmark' as const,radius:65,notify:true})),
 ...SIDE_ROUTES.filter(r=>!['grove-eddy','basin-shelf','lake-deeps','longwater-rest','outer-shelter'].includes(r.id)).map(r=>({id:r.id,name:r.name,x:r.pocket.x,y:r.pocket.y,kind:'landmark' as const,radius:48,notify:true})),
 {id:'village',name:'Home Village',x:VILLAGE.square.x,y:VILLAGE.square.y,kind:'village',radius:280},
 {id:'dock',name:'Village Dock',...VILLAGE.dock,kind:'landmark',radius:100},
 ...Object.entries(VILLAGE.npcs).map(([id,n])=>({id,name:id==='seller'?'Fish Market':id==='merchant'?'Kayak Workshop':id==='tools'?'Tools Shop':'Fish Journal',x:n.x,y:n.y,kind:'npc' as const,radius:75})),
 {id:'starting',name:'Starting River',...REGION_CORES.starting,kind:'entrance',radius:140,notify:true},
 {id:'bend',name:'Blue Ice Bend',...REGION_CORES.bend,kind:'entrance',radius:130,notify:true},
 {id:'shelf',name:'Blue Ice Shelf',x:bankLandmarkX(2280,-1)+48,y:2320,kind:'landmark',radius:210,notify:true},
 {id:'stones',name:'Split Stones',x:bankLandmarkX(2800,1)+48,y:2840,kind:'landmark',radius:210,notify:true},
 {id:'pine',name:'Fallen Pine',x:bankLandmarkX(3220,-1)-10,y:3305,kind:'landmark',radius:230,notify:true},
 {id:'gorge',name:'Glacier Gorge',...REGION_CORES.gorge,kind:'entrance',radius:150,notify:true},
 {id:'glacier-falls',name:'Glacier Falls',...formation('Glacier falls'),kind:'landmark',radius:210,notify:true},
 {id:'gorge-arch',name:'Split Ice Arch',...formation('Split ice arch'),kind:'landmark',radius:210,notify:true},
 {id:'lake',name:'Frozen Lake',...REGION_CORES.lake,kind:'entrance',radius:130,notify:true},
];
export interface MapSave { regional?:RegionalSave; worldRevision?:number; visitedAreas?:string[]; regions:string[]; landmarks:string[] }
export class Discovery {
 readonly regional:RegionalDiscovery;
 readonly visitedAreas=new Set<AreaId>();
 readonly regions=new Set<string>();readonly landmarks=new Set<string>();
 constructor(raw?:unknown){
  const saved=raw as Partial<MapSave>|undefined;
  for(const key of (Array.isArray(saved?.regions)?saved.regions:[]).slice(0,Math.ceil(WORLD_WIDTH/MAP.chunk)*Math.ceil(WORLD_HEIGHT/MAP.chunk)))if(typeof key==='string'){
   const [x,y]=key.split(',').map(Number);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<Math.ceil(WORLD_WIDTH/MAP.chunk)&&y>=0&&y<Math.ceil(WORLD_HEIGHT/MAP.chunk))this.regions.add(`${x},${y}`);
  }
  for(const id of Array.isArray(saved?.landmarks)?saved.landmarks:[])if(MAP_MARKERS.some(m=>m.id===id))this.landmarks.add(id);
  for(const id of Array.isArray(saved?.visitedAreas)?saved.visitedAreas:Array.isArray(saved?.landmarks)?saved.landmarks:[])if(Object.hasOwn(AREA_SPAWNS,id))this.visitedAreas.add(id as AreaId);
  // The home chart is already familiar; the river beyond remains unknown.
  if(!saved?.worldRevision||saved.worldRevision<2){
   // Geography outside the old village is retained. Stable known-place IDs reveal moved services.
   for(const key of this.regions){const [x,y]=key.split(',').map(Number);if(x*MAP.chunk<800&&y*MAP.chunk>750&&y*MAP.chunk<1600)this.regions.delete(key);}
   for(const id of this.landmarks){const marker=MAP_MARKERS.find(m=>m.id===id);if(marker)this.reveal(marker.x,marker.y);}
  }
  if(saved?.worldRevision!==WORLD_REVISION)for(const id of this.landmarks){const m=MAP_MARKERS.find(m=>m.id===id);if(m)this.reveal(m.x,m.y);}
  this.reveal(VILLAGE.square.x,VILLAGE.square.y);this.landmarks.add('village');
  this.regional=new RegionalDiscovery(this,saved?.regional);
 }
 known(x:number,y:number){return this.regions.has(`${Math.floor(x/MAP.chunk)},${Math.floor(y/MAP.chunk)}`);}
 reveal(x:number,y:number){
  const before=this.regions.size;
  for(let cy=Math.max(0,Math.floor((y-MAP.revealRadius)/MAP.chunk));cy<Math.min(Math.ceil(WORLD_HEIGHT/MAP.chunk),Math.ceil((y+MAP.revealRadius)/MAP.chunk));cy++)
   for(let cx=Math.max(0,Math.floor((x-MAP.revealRadius)/MAP.chunk));cx<Math.min(Math.ceil(WORLD_WIDTH/MAP.chunk),Math.ceil((x+MAP.revealRadius)/MAP.chunk));cx++)
    if(Math.hypot((cx+.5)*MAP.chunk-x,(cy+.5)*MAP.chunk-y)<=MAP.revealRadius)this.regions.add(`${cx},${cy}`);
  // Always include the cell under the player, even at the edge of the world.
  if(x>=0&&x<WORLD_WIDTH&&y>=0&&y<WORLD_HEIGHT)this.regions.add(`${Math.floor(x/MAP.chunk)},${Math.floor(y/MAP.chunk)}`);
  return this.regions.size!==before;
 }
 visit(x:number,y:number){
  let changed=this.reveal(x,y);const found:MapMarker[]=[];
  const area=areaAt(y,x);if(!this.visitedAreas.has(area)){this.visitedAreas.add(area);changed=true;found.push({id:area,name:AREA_SPAWNS[area].name,x,y,kind:'entrance',radius:0,notify:true});}
  for(const m of MAP_MARKERS)if(!this.landmarks.has(m.id)&&Math.hypot(x-m.x,y-m.y)<=m.radius){
   this.landmarks.add(m.id);this.reveal(m.x,m.y);changed=true;if(m.kind!=='entrance')found.push(m);
  }
  return {changed,found};
 }
 snapshot():MapSave{return {regional:this.regional.snapshot(),worldRevision:WORLD_REVISION,visitedAreas:[...this.visitedAreas],regions:[...this.regions],landmarks:[...this.landmarks]};}
}
