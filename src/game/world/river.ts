import {navigationSigns,signReserved} from './navigationSigns';
import {clearTerrainFragments} from './terrainFragments';
import {REGIONAL_CONTENT,LOCAL_ART,REGION_ATMOSPHERE} from './regionalContent';
import {NAVIGATION_LANDMARKS,REGIONAL_BANKS} from './navigationIdentity';
import {areaAt} from './spawnRules';
import {terrainDistance,terrainField} from './terrainTransitions';
import {networkSpans,islandSpans,ESTUARY_ISLANDS,WORLD_SIZE} from './regionNetwork';
import {clearSceneryCollision,addSceneryFootprint,sceneryFootprints} from './sceneryCollision';
import {landingReserved,landings,landingInterior} from '../home/Landings';
import { MICRO_BIOMES } from './microBiomes';
import { ENVIRONMENT_ART,artArea,shoreMaterial } from './environmentArt';
import { SIDE_ROUTES,routeSpan,caveStrength,locationAt } from './sideRoutes';
import { landmarkBounds } from './ecologyLandmarks';
import { depthValue,bedRocks } from './depth';
import { villageReserved } from '../home/villageLayout';
import Phaser from 'phaser';
import { assetCanvas, assetPattern, paintAsset as drawAsset } from '../assets/textures';
import palette from '../../../assets/palette.json';
import { ASSET_FRAMES, ATLAS, COLLISION_MASKS, type AssetId } from '../assets/catalog';
import { FISHING_SPOTS } from '../fishing/data';
import { HOME } from '../tuning';

export const WORLD_WIDTH = WORLD_SIZE.width;
export const WORLD_HEIGHT = WORLD_SIZE.height;
const CONTOUR_STEP = 2;

// A handful of fixed obstacles near the starting area, with room to go around.
export const ICE_CHUNKS = [
  { x: 700, y: 1090, width: 48, height: 32, asset: 'ice-small' as const, variant: 0, scale: 1 },
  { x: 780, y: 990, width: 64, height: 40, asset: 'ice-wide' as const, variant: 1, scale: 1 },
  { x: 700, y: 1410, width: 56, height: 40, asset: 'ice-medium' as const, variant: 2, scale: 1 },
];

export function banks(y: number) {
  y = Math.floor(y / CONTOUR_STEP) * CONTOUR_STEP;
  let center = 800 + Math.sin(y / 340) * 150 + Math.sin(y / 150) * 35;
  const narrows = 110 * Math.exp(-(((y - 780) / 150) ** 2))
    + 100 * Math.exp(-(((y - 1620) / 150) ** 2));
  let halfWidth = 235 + Math.sin(y / 220) * 45 - narrows;
  if (y > 1900) {
    const t = Math.min(1, (y - 1900) / 350), blend = t * t * (3 - 2 * t);
    const lake = Math.max(0, Math.min(1, (y - 3250) / 250));
    center += blend * ((800 + Math.sin((y - 2150) / 160) * 155 * (1 - lake)) - center);
    halfWidth += blend * ((175 + Math.sin(y / 135) * 32 + lake * 240) - halfWidth);
  }
  if(y>3780){
    const t=Math.min(1,(y-3780)/360),blend=t*t*(3-2*t);
    const gorgeCenter=800+Math.sin((y-4000)/210)*140+Math.sin((y-4000)/93)*24;
    const gorgeWidth=132+Math.sin(y/170)*26+45*Math.exp(-(((y-4630)/130)**2))+38*Math.exp(-(((y-5260)/140)**2));
    center+=(gorgeCenter-center)*blend;halfWidth+=(gorgeWidth-halfWidth)*blend;
  }
  const end = y < 144 ? (y - 144) / 80 : y > WORLD_HEIGHT-144 ? (y-(WORLD_HEIGHT-144))/80 : 0;
  const cap = Math.sqrt(Math.max(0, 1 - end * end));
  // Independent low-amplitude variation creates coves and promontories without
  // moving the established river route or its broad/narrow stretches.
  const leftDetail = Math.sin(y / 47) * 7 + Math.sin(y / 19 + 1) * 2.5;
  const rightDetail = Math.sin(y / 61 + 2) * 9 + Math.sin(y / 27) * 3;
  return [Math.floor(center + (-halfWidth + leftDetail) * cap), Math.ceil(center + (halfWidth + rightDetail) * cap)];
}

const waterContourCache=new Map<number,number[][]>();
function rawWaterSpans(y:number):number[][] {
 y=Math.floor(y/2)*2;const cached=waterContourCache.get(y);if(cached)return cached;
 const h=banks(y-1500),cap=Math.sqrt(Math.max(0,1-(y<2390?((y-2390)/90)**2:y>3020?((y-3020)/90)**2:0))),center=(h[0]+h[1])/2+1500,half=(h[1]-h[0])/2*cap;
 const home=y>=2300&&y<=3110?[[Math.floor(center-half),Math.ceil(center+half)]]:[];
 const spans=[banks(y),...home,...networkSpans(y),...SIDE_ROUTES.map(r=>routeSpan(r,y)).filter((s):s is [number,number]=>!!s)].sort((a,b)=>a[0]-b[0]);
 const merged:number[][]=[];for(const s of spans){const last=merged[merged.length-1];if(last&&s[0]<=last[1])last[1]=Math.max(last[1],s[1]);else merged.push([...s]);}
 let result=merged;for(const [l,r] of islandSpans(y))result=result.flatMap(([a,b])=>r<=a||l>=b?[[a,b]]:[[a,Math.max(a,l)],[Math.min(b,r),b]].filter(([x,z])=>z>x));waterContourCache.set(y,result);return result;
}
export let removedTerrainFragments=0;
let roundedContours:Map<number,number[][]>|undefined;
export function waterSpans(y:number):number[][]{
 if(!roundedContours){
  // A small closing rounds concave fork tips without replacing the authored
  // geography. It only adds shallow corner water; it never pinches a route.
  const radius=48,initial=terrainDistance(WORLD_WIDTH,WORLD_HEIGHT,rawWaterSpans),expanded=new Map<number,number[][]>();
  const scan=(test:(x:number,y:number)=>boolean,y:number)=>{const spans:number[][]=[];let start=-1;for(let x=0;x<WORLD_WIDTH;x+=2){const wet=test(x,y);if(wet&&start<0)start=x;if(!wet&&start>=0){spans.push([start,x-1]);start=-1;}}if(start>=0)spans.push([start,WORLD_WIDTH-1]);return spans;};
  for(let row=0;row<WORLD_HEIGHT;row+=2)expanded.set(row,scan((x,y)=>initial(x,y)>-radius,row));
  const dilated=terrainDistance(WORLD_WIDTH,WORLD_HEIGHT,y=>expanded.get(Math.floor(y/2)*2)??[]);
  const protectedCaves=SIDE_ROUTES.filter(r=>r.deadEnd||r.interior).map(r=>({left:Math.min(...r.points.map(p=>p[0]-p[2]))-40,right:Math.max(...r.points.map(p=>p[0]+p[2]))+40,top:r.points[0][1]-60,bottom:r.points.at(-1)![1]+60}));
  const allowed=(x:number,y:number)=>!(x>1500&&x<2260&&y>2290&&y<3060)&&!protectedCaves.some(r=>x>r.left&&x<r.right&&y>r.top&&y<r.bottom);
  roundedContours=new Map();
  for(let row=0;row<WORLD_HEIGHT;row+=2){const spans=[...rawWaterSpans(row),...scan((x,y)=>initial(x,y)<0&&dilated(x,y)>radius&&allowed(x,y),row)].sort((a,b)=>a[0]-b[0]),merged:number[][]=[];
   for(const s of spans){const last=merged.at(-1);if(last&&s[0]<=last[1]+1)last[1]=Math.max(last[1],s[1]);else merged.push([...s]);}roundedContours.set(row,merged);
  }
  removedTerrainFragments=clearTerrainFragments(roundedContours,WORLD_HEIGHT,(x,y)=>!allowed(x,y)||islandSpans(y).some(([l,r])=>x>=l&&x<=r));
 }
 return roundedContours.get(Math.floor(y/2)*2)??rawWaterSpans(y);
}
export function waterAt(x:number,y:number){return waterSpans(y).some(([l,r])=>x>=l&&x<=r);}

// Resolve each authored landmark against its local bank, never the farthest
// edge of the entire widened world. All placements are fixed across trips.
let navigationPlaces:({id:string;name:string;x:number;y:number;width:number;height:number;asset:AssetId;variant:number})[]|undefined;
export function navigationLandmarks(){return navigationPlaces??=NAVIGATION_LANDMARKS.flatMap(c=>{
 for(const offset of [0,-24,24,-48,48]){const y=c.y+offset;
  const edges=Array.from({length:Math.ceil(c.height/2)+1},(_,i)=>{const spans=waterSpans(y+i*2);return spans.reduce((a,b)=>Math.abs((a[0]+a[1])/2-c.x)<Math.abs((b[0]+b[1])/2-c.x)?a:b);});
  const x=c.side<0?Math.min(...edges.map(s=>s[0]))-c.width-20:Math.max(...edges.map(s=>s[1]))+20;
  if(Math.hypot(x+c.width/2-c.x,y+c.height/2-c.y)<300&&!villageReserved(x,y,60)&&!landingReserved(x,y)&&landDecorationFits(x,y,c.width,c.height))return [{...c,x,y}];
 }
 // Wide forks can merge several horizontal spans. Search nearby dry banks
 // around the junction rather than placing its cue beyond the far outer shore.
 const candidates=[];for(let dy=-264;dy<=264;dy+=24)for(let dx=-264;dx<=264;dx+=24)if(Math.hypot(dx,dy)<300)candidates.push({x:c.x+dx-c.width/2,y:c.y+dy-c.height/2,score:dx*dx+dy*dy+(Math.sign(dx)!==c.side?2400:0)});
 candidates.sort((a,b)=>a.score-b.score);for(const {x,y} of candidates)if(!villageReserved(x,y,60)&&!landingReserved(x,y)&&landDecorationFits(x,y,c.width,c.height))return [{...c,x,y}];
 return [];
});}

export interface Floe { x: number; y: number; width: number; height: number; asset: AssetId; variant: number; scale: number }

export function createFloes(): Floe[] {
  const floes: Floe[] = ICE_CHUNKS.map(floe => ({ ...floe }));
  let seed = 318;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let attempt = 0; attempt < 100 && floes.length < 12; attempt++) {
    const y = Math.round(180 + random() * 2020), scale = random() < .28 ? 2 : 1;
    const width = 16 * scale, height = 12 * scale;
    const [left, right] = banks(y);
    const x = Math.round(random() < .5 ? left + 28 + random() * 24 : right - width - 28 - random() * 24);
    if (Math.hypot(x - HOME.dockX, y - HOME.dockY) < 145) continue;
    if (FISHING_SPOTS.some(spot => Math.hypot(x + width / 2 - spot.x, y + height / 2 - spot.y) < 90)) continue;
    if (floes.some(f => x < f.x + f.width + 28 && x + width + 28 > f.x && y < f.y + f.height + 28 && y + height + 28 > f.y)) continue;
    let fits = true;
    for (let yy = y - 4 * scale; yy <= y + height + 4 * scale; yy += 2) {
      const [l, r] = banks(yy);
      if (x - 4 * scale < l + 12 || x + width + 4 * scale > r - 12) fits = false;
    }
    if (fits) floes.push({ x, y, width, height, asset: 'ice-fragment', variant: Math.floor(random() * 3), scale });
  }
  for (const [y, side, variant] of [[5800,-1,1],[6510,1,2],[7160,-1,0],[4370,-1,1],[4720,1,2],[5130,-1,0],[2300, -1, 0], [2520, 1, 1], [2820, -1, 2], [3160, 1, 0], [3550, -1, 1], [3690, 1, 2]]) {
    const [left, right] = banks(y);
    const x = side < 0 ? left + 35 : right - 147;
    if ([y - 8, y + 88].every(yy => { const [l, r] = banks(yy); return x - 8 > l + 12 && x + 120 < r - 12; }))
      floes.push({ x, y, width: 112, height: 80, asset: 'ice-medium', variant, scale: 2 });
  }
  for(const [x,y] of [[3020,2350],[3760,2700],[3300,3400],[3560,2140],[2770,720],[2920,1120],[3190,4650],[3420,5010],[2130,5800],[2720,6220],[2160,6730],[1120,5800],[1300,7010],[4380,2890],[4670,3550],[5220,4180],[5480,3660],[4380,4360]])if([y-8,y+48].every(yy=>waterSpans(yy).some(([l,r])=>x-8>l+12&&x+64<r-12)))floes.push({x,y,width:56,height:40,asset:'ice-medium',variant:1,scale:1});
  return floes;
}

export function microBiomePlacements(){
 return MICRO_BIOMES.map(p=>{
  const edges=Array.from({length:181},(_,i)=>waterSpans(p.y-180+i*2));
  const edge=p.side<0?Math.min(...edges.flat().map(s=>s[0])):Math.max(...edges.flat().map(s=>s[1]));
  const x=p.side<0?edge-180:edge+45;
  return {...p,x,objects:p.pieces.map(([dx,dy,asset,variant])=>({x:x+dx,y:p.y+dy,asset,variant}))};
 });
}


const regionalShoreCache=new Map<string,AssetId>();
function edgeMaterial(x:number,y:number,side:number):AssetId {
 const kind=locationAt(x,y)?.kind;
 if(!kind&&x>1550){const key=`${Math.floor(x/64)},${Math.floor(y/96)}`;let material=regionalShoreCache.get(key);if(!material){const region=areaAt(y,x);material=region==='starting'?'shore':region==='gorge'?'shore-rock':'shore-blue';regionalShoreCache.set(key,material);}return material;}
 return kind==='canyon'||kind==='rapids'?'shore-rock':kind==='channel'||kind==='frozen-tunnel'?'shore-blue':shoreMaterial(y,side);
}

export function bankLandmarkX(y:number,side:number){
 const edges=Array.from({length:76},(_,i)=>waterSpans(y+i*2));
 return side<0?Math.min(...edges.flat().map(s=>s[0]))-150:Math.max(...edges.flat().map(s=>s[1]))+40;
}

// Check every contour row, including side channels: testing only the main bank
// or a plant's center lets shore vegetation appear in open water.
export function landDecorationFits(x:number,y:number,width:number,height:number){
 for(let row=Math.floor(y);row<=Math.ceil(y+height);row++)
  if(waterSpans(row).some(([l,r])=>x+width>l-2&&x<r+2))return false;
 return true;
}
export const landPlant=(id:string)=>id.startsWith('tree-')||['frozen-bush','shrub','reeds','dead-branch','snow-log'].includes(id);

function paintAsset(scene:Phaser.Scene,ctx:CanvasRenderingContext2D,id:AssetId,x:number,y:number,variant=0,waypoint=false){
 const source=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][variant]??ASSET_FRAMES[id][0]),transform=ctx.getTransform();
 if(!waypoint&&signReserved(transform.a*x+transform.e,transform.d*y+transform.f,source.realWidth,source.realHeight))return;
 if(!waypoint&&navigationLandmarks().some(c=>transform.a*x+transform.e<c.x+c.width+12&&transform.a*(x+source.realWidth)+transform.e>c.x-12&&transform.d*y+transform.f<c.y+c.height+12&&transform.d*(y+source.realHeight)+transform.f>c.y-12))return;
 if(landPlant(id)&&!landDecorationFits(transform.a*x+transform.e,transform.d*y+transform.f,source.realWidth*Math.abs(transform.a),source.realHeight*Math.abs(transform.d)))return;
 // Landing paths take precedence over decorative boulders/trees, never terrain or functional gates.
 if((id.startsWith('tree-')||['rock','geology-rock','blue-ice-outcrop','wilderness-formation','cave-formation','snow-log','frozen-bush'].includes(id))&&landings().some(site=>landingInterior(site,transform.a*(x+source.realWidth*.5)+transform.e,transform.d*(y+source.realHeight*.55)+transform.f)<Math.min(source.realWidth,source.realHeight)*.4+12))return;
 drawAsset(scene,ctx,id,x,y,variant);
 const tree=id.startsWith('tree-');
 if(!tree&&!/^(rock|geology-rock|blue-ice-outcrop|snow-log|frozen-bush|shrub|cave-formation|cave-falls|broken-glacier|wilderness-formation|abandoned-shelter|village-beacon)$/.test(id))return;
 const frame=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][variant]??ASSET_FRAMES[id][0]),t=ctx.getTransform();
 const px=x+frame.realWidth*.5,py=y+frame.realHeight*(tree?.64:.55);
 addSceneryFootprint({asset:id,x:t.a*px+t.c*py+t.e,y:t.b*px+t.d*py+t.f,
  radius:Math.max(4,Math.min(frame.realWidth,frame.realHeight)*(tree?.19:.38))*Math.max(Math.abs(t.a),Math.abs(t.d))});
}

export function createRiver(scene: Phaser.Scene) {
  clearSceneryCollision();
  const land = scene.physics.add.staticGroup();
  if (scene.textures.exists('river')) scene.textures.remove('river');
  const texture = scene.textures.createCanvas('river', WORLD_WIDTH, WORLD_HEIGHT)!;
  const ctx = texture.context;
  ctx.imageSmoothingEnabled = false;
  const coastDistance=terrainDistance(WORLD_WIDTH,WORLD_HEIGHT,waterSpans);
  const visualCold=terrainField(WORLD_WIDTH,WORLD_HEIGHT,(x,y)=>REGION_ATMOSPHERE[areaAt(y,x)].cold);
  const visualDepth=terrainField(WORLD_WIDTH,WORLD_HEIGHT,(x,y)=>depthValue(x,y,true));
  const snow = assetPattern(scene,ctx,'snow');
  const caveWater = [0,1,2].map(i=>assetPattern(scene,ctx,'cave-water',i));
  const water = assetPattern(scene,ctx,'water');
  ctx.fillStyle = snow;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  // Irregular, overlapping material islands fade through sparse clusters, never tile edges.
  let materialSeed=915;const materialRandom=()=>{materialSeed=(materialSeed*1664525+1013904223)>>>0;return materialSeed/4294967296;};
  for(let i=0;i<1150;i++){
    const x=Math.floor(materialRandom()*WORLD_WIDTH),y=Math.floor(materialRandom()*WORLD_HEIGHT);
    if(villageReserved(x,y)||Math.sin(x/190+y/270)<-.25)continue;
    const styles=ENVIRONMENT_ART[artArea(y)].snow;
    paintAsset(scene,ctx,'snow-detail',x,y,styles[Math.floor(materialRandom()*styles.length)]);
  }
  const wall = (x: number, y: number, w: number, h: number) => {
    if (w > 0 && h > 0) land.add(scene.add.zone(x + w / 2, y + h / 2, w, h));
  };
  // Coalesce identical neighboring contour spans to keep static body count low.
  const bankRuns: { x: number; y: number; w: number; h: number }[][] = [[], []];
  const addRun = (side: number, x: number, y: number, w: number) => {
    const list = bankRuns[side] ??= [], last = list[list.length - 1];
    if (last && last.x === x && last.w === w && last.y + last.h === y) last.h += CONTOUR_STEP;
    else list.push({ x, y, w, h: CONTOUR_STEP });
  };
  wall(0, 0, WORLD_WIDTH, 64); wall(0, WORLD_HEIGHT - 64, WORLD_WIDTH, 64);
  for (let y = 64; y < WORLD_HEIGHT - 64; y += CONTOUR_STEP) {
    const spans=waterSpans(y);let previous=0;
    spans.forEach(([l,r],i)=>{addRun(i,previous,y,l-previous);previous=r;});addRun(spans.length,previous,y,WORLD_WIDTH-previous);
    for(const [spanIndex,[left,right]] of spans.entries()){
    ctx.fillStyle = water;
    // Contours include both endpoints. Leaving the last pixel unpainted
    // exposes snow as dotted arcs inside otherwise continuous water.
    ctx.fillRect(left, y, right - left + 1, CONTOUR_STEP);
    for(let x=left+12;x<right-12;x+=4){
      ctx.fillStyle=`rgba(13,45,73,${visualCold(x,y)})`;ctx.fillRect(x,y,Math.min(4,right-12-x),CONTOUR_STEP);
      const d=Math.max(0,Math.min(visualDepth(x,y),coastDistance(x,y)/70)),alpha=Math.abs(d-.45)/4;
      ctx.fillStyle=d<.45?`rgba(114,164,179,${alpha})`:`rgba(16,36,58,${alpha})`;
      ctx.fillRect(x,y,Math.min(4,right-12-x),CONTOUR_STEP);
    }
    for(const route of SIDE_ROUTES){
      if(!route.interior)continue;const span=routeSpan(route,y);if(!span)continue;
      const strength=caveStrength((span[0]+span[1])/2,y);if(!strength)continue;
      const l=Math.max(left,span[0]),r=Math.min(right,span[1]);if(r<=l)continue;
      ctx.fillStyle=caveWater[route.kind==='blue-cave'?1:route.kind==='deep-pool'?2:0];
      for(let x=l;x<r;x+=4){
        const edge=Math.min(1,(x-l)/28,(r-x)/28);
        ctx.globalAlpha=strength*strength*(3-2*strength)*.9*Math.max(0,edge);
        ctx.fillRect(x,y,Math.min(4,r-x),CONTOUR_STEP);
      }ctx.globalAlpha=1;
    }
  }
  }
  // Sample native shore material perpendicular to the *whole* contour. This also
  // paints horizontal caps, island tips and fork interiors; row strips cannot.
  const profiles=new Map<string,ImageData>();
  for(const id of ['shore','shore-blue','shore-rock','shore-cave'] as AssetId[]){
   const canvas=assetCanvas(scene,id);const c=canvas.getContext('2d')!;
   profiles.set(id,c.getImageData(0,0,32,16));
  }
  const pixels=ctx.getImageData(0,0,WORLD_WIDTH,WORLD_HEIGHT),data=pixels.data;
  const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const colors=new Map<string,number[]>();const color=(hex:string)=>{let c=colors.get(hex);if(!c){const n=parseInt(hex.replace('#',''),16);c=[n>>16&255,n>>8&255,n&255];colors.set(hex,c);}return c;};
  for(let y=64;y<WORLD_HEIGHT-64;y++)for(let x=0;x<WORLD_WIDTH;x++){
   const d=coastDistance(x,y);if(d<=-110||d>=12)continue;
   const boundary=coastDistance.nearest(x,y),dx=boundary.x-x,dy=boundary.y-y,length=Math.hypot(dx,dy)||1,direction=d<0?1:-1;
   const nearX=boundary.x+dx/length*8*direction,nearY=boundary.y+dy/length*8*direction,place=locationAt(nearX,nearY);
   // Geological shelves share this distance field too: no later horizontal
   // ribbons overwriting a fork, a neighboring shoreline, or an existing prop.
   if(d<-14&&place?.kind){
    const interval=place.interior??[place.points[0][1]+80,place.points[place.points.length-1][1]-12];
    const fade=smooth(Math.min((nearY-interval[0])/55,(interval[1]-nearY)/55));
    const width=(78+Math.sin(nearY/47)*12+Math.sin(nearY/19)*5)*fade,depth=-d;
    if(depth<width){const rock=place.kind==='canyon'||place.kind==='rapids';
     const rgb=color(rock?(depth<32?palette.rockDark:depth<width-18?palette.rock:palette.snowShade):depth<26?palette.iceDark:depth<40?palette.iceShade:depth<width-15?palette.ice:palette.snowShade);
     const a=smooth((width-depth)/9)*smooth((depth-14)/7),target=(y*WORLD_WIDTH+x)*4;
     for(let c=0;c<3;c++)data[target+c]=Math.round(data[target+c]+(rgb[c]-data[target+c])*a);
    }
   }
   if(d<-20&&!place?.interior&&nearY>4020&&nearY<WORLD_HEIGHT-140&&nearX<1500){
    const [l,r]=banks(nearY),edge=Math.min(Math.abs(nearX-l),Math.abs(nearX-r));
    const fade=smooth(Math.min((nearY-4020)/120,(WORLD_HEIGHT-140-nearY)/130))*smooth((28-edge)/20);
    const width=(62+Math.sin(nearY/83)*10+Math.sin(nearY/31)*5)*fade,depth=-d;
    if(depth<width){const rgb=color(depth<30?palette.rockDark:depth<40?palette.iceDark:depth<width-9?palette.ice:palette.snow);
     const a=smooth((width-depth)/7)*smooth((depth-20)/7),target=(y*WORLD_WIDTH+x)*4;
     for(let c=0;c<3;c++)data[target+c]=Math.round(data[target+c]+(rgb[c]-data[target+c])*a);
    }
   }
   if(d<=-20)continue;
   const side=coastDistance(x+2,y)>coastDistance(x-2,y)?-1:1;
   const column=Math.max(0,Math.min(31,Math.round(20+d))),row=(x+y)%16,index=(row*32+column)*4;
   // Wide material cross-fades, independent of channel numbering or tile rows.
   const band=Math.floor(y/96)*96,t=smooth((y-band)/96);
   const ids=[edgeMaterial(x,band,side),edgeMaterial(x,band+96,side)];
   const weights=[1-t,t],rgb=[0,0,0];
   for(let k=0;k<2;k++){const profile=profiles.get(ids[k])??profiles.get('shore')!;for(let c=0;c<3;c++)rgb[c]+=profile.data[index+c]*weights[k];}
   const cave=smooth(caveStrength(nearX,nearY));const caveProfile=profiles.get('shore-cave')!;
   const alpha=smooth((d+20)/7)*smooth((12-d)/7),target=(y*WORLD_WIDTH+x)*4;
   for(let c=0;c<3;c++)data[target+c]=Math.round(data[target+c]+(rgb[c]*(1-cave)+caveProfile.data[index+c]*cave-data[target+c])*alpha);
  }
  ctx.putImageData(pixels,0,0);
  // Sparse original rock artwork beneath shallow water; no new collision.
  ctx.save();ctx.globalAlpha=.22;
  for(const p of bedRocks()){ctx.drawImage(assetCanvas(scene,'rock'),Math.round(p.x)-8,p.y-6,16,12);ctx.drawImage(assetCanvas(scene,'rock'),Math.round(p.x)+8,p.y+5,10,8);}
  ctx.restore();
  bankRuns.flat().forEach(run => wall(run.x, run.y, run.w, run.h));
  const treeCrowns: { x: number; y: number }[] = [];
  const pockets=microBiomePlacements();
  for(const pocket of pockets)for(const o of pocket.objects){
    paintAsset(scene,ctx,o.asset,o.x,o.y,o.variant);
    if(o.asset.startsWith('tree-'))treeCrowns.push({x:o.x+24,y:o.y+24});
  }
  let seed = 41;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 440; i++) {
    const y = i<340?Math.floor(random()*3920)+32:4000+Math.floor(random()*1450);
    const [left, right] = banks(y);
    const x = Math.floor(i % 2 ? left - 64 - random() * 240 : right + 44 + random() * 240);
    if (villageReserved(x, y)||landingReserved(x,y)) continue;
    if(pockets.some(p=>Math.abs(y-p.y)<155&&Math.abs(x-p.x)<230))continue;
    if([y,y+24,y+48].some(yy=>waterSpans(yy).some(([a,b])=>x+55>a-12&&x<b+12)))continue;
    // Keep the entire decorative cluster on snow around sharper little coves.
    if ([y, y + 16, y + 32].some(yy => { const [l, r] = banks(yy); return x + 55 > l - 12 && x < r + 12; })) continue;
    const kinds: AssetId[] = ['tree-mature', 'tree-young', 'shrub', 'tree-bare', 'frozen-bush', 'rock', 'dead-branch', 'snow-log'];
    if (y > 4060 && random() < .85) continue;
    if (y > 3370 && random() < .6) continue;
    if (y > 3370) kinds.splice(0, 3, 'tree-bare', 'rock', 'frozen-bush');
    let kind = kinds[Math.floor(random() * kinds.length)];
    const art=ENVIRONMENT_ART[artArea(y)];
    if(kind==='tree-mature'||kind==='shrub'||(kind==='tree-bare'&&y>2150&&y<3370)){const patch=Math.abs(Math.floor(x/180)+Math.floor(y/230)*3);kind=art.trees[patch%art.trees.length];}
    if (kind.startsWith('tree-') && kind!=='tree-bare') treeCrowns.push({ x: x + (kind === 'tree-mature' ? 24 : 16), y: y + 16 });
    const variant=Math.floor(random()*(kind==='rock'?2:3));
    if(kind==='rock')paintAsset(scene,ctx,'geology-rock',x,y,art.rocks[(Math.floor(y/79)+variant)%art.rocks.length]);
    else paintAsset(scene, ctx, kind, x, y, variant);
    if (i % 13 === 0) {
      const edgeX = i % 2 ? left - 30 : right + 18;
      if ([y, y + 24].every(yy => { const [l, r] = banks(yy); return edgeX + 16 < l || edgeX > r; }))
        paintAsset(scene, ctx, 'reeds', edgeX, y, i % 3);
    }
  }
  for(const l of landmarkBounds()){
    if(l.variant>=0)paintAsset(scene,ctx,'wilderness-formation',l.x,l.y,l.variant);
    else {paintAsset(scene,ctx,'snow-log',l.x+18,l.y+12,1);paintAsset(scene,ctx,'snow-log',l.x+24,l.y+39,0);paintAsset(scene,ctx,'dead-branch',l.x+54,l.y+25,1);paintAsset(scene,ctx,'rock',l.x+70,l.y+57,1);}
    for(const [dx,dy,kind] of [[-21,-13,'tree-young'],[99,73,'frozen-bush'],[16,92,'dead-branch']] as const)paintAsset(scene,ctx,kind,l.x+dx,l.y+dy,0);
  }
  // Three recognisable, quiet bank landmarks: blue shelf, split stones, fallen pine.
  for (const [y, side] of [[2280, -1], [2800, 1], [3220, -1]]) {
    const x = bankLandmarkX(y,side);
    paintAsset(scene, ctx, 'blue-ice-outcrop', x, y, 0);
    ctx.save(); ctx.translate(x + 48, y + 40); ctx.scale(2, 2);
    paintAsset(scene, ctx, 'rock', 0, 0, 1); ctx.restore();
    paintAsset(scene, ctx, 'snow-log', x - 10, y + 85, 1);
  }
  ctx.fillStyle = palette.snowShade;
  for (let i = 0; i < 5; i++) ctx.fillRect(516 + i * 6, 1240 + i % 2 * 2, 3, 1);
  for (const floe of createFloes()) {
    const ox = floe.x - 4 * floe.scale, oy = floe.y - 4 * floe.scale;
    ctx.save(); ctx.translate(ox, oy); ctx.scale(floe.scale, floe.scale);
    paintAsset(scene, ctx, floe.asset, 0, 0, floe.variant); ctx.restore();
    const key = ASSET_FRAMES[floe.asset][floe.variant];
    for (const [x, y, w, h] of COLLISION_MASKS[key]) wall(ox + x * floe.scale, oy + y * floe.scale, w * floe.scale, h * floe.scale);
  }
  // Authored cave-wall shelves stay entirely on solid land; the openings remain clear.
  for(const route of SIDE_ROUTES){
    if(!route.interior)continue;const [a,b]=route.interior;
    for(let y=a+45,i=0;y<b-25;y+=83+(i++%3)*19){
      const span=routeSpan(route,y)!;
      for(const side of [-1,1]){
        const x=side<0?span[0]-76:span[1]+76;
        if([y-32,y,y+32].some(yy=>waterSpans(yy).some(([l,r])=>x+32>l&&x-32<r)))continue;
        paintAsset(scene,ctx,i%5===0?'cave-falls':'cave-formation',x-32,y-32,i%5===0?0:i%3);
      }
    }
  }
  // Sparse coastal banks and island landmarks use the original native art library.
  for(let i=0;i<84;i++){
    if(i%9===5||i%9===6)continue; // Deliberate quiet reaches between clusters.
    const y=400+i*87+(i%3)*17;
    for(const [l,r] of waterSpans(y).filter(s=>s[1]>1650))for(const side of [-1,1]){
      const area=areaAt(y,(l+r)/2),family=REGIONAL_BANKS[area];
      const id:AssetId=family[i%family.length];
      const f=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][0]),x=side<0?l-f.realWidth-32:r+32;
      if(x<1550||x+f.realWidth>WORLD_WIDTH-40||villageReserved(x,y,90)||landings().some(s=>Math.hypot(x-s.x,y-s.y)<260)||landingReserved(x,y)||!landDecorationFits(x,y,f.realWidth,f.realHeight))continue;
      paintAsset(scene,ctx,id,x,y,i%ASSET_FRAMES[id].length);
      if((area==='starting'||area==='bend')&&id.startsWith('tree-'))for(const [dx,dy]of [[side*46,24],[side*84,-14],[side*53,68]]){
       const tx=x+dx,ty=y+dy;if(!villageReserved(tx,ty,60)&&!landingReserved(tx,ty)&&landDecorationFits(tx,ty,48,48)&&!sceneryFootprints.some(p=>Math.hypot(p.x-tx-24,p.y-ty-24)<p.radius+22))paintAsset(scene,ctx,area==='bend'?'tree-spruce':'tree-fir',tx,ty,0);
      }
    }
  }
  const contentPlaced:{id:string;count:number}[]=[];
  for(const p of REGIONAL_CONTENT){
   const family=LOCAL_ART[p.look],rows=[-80,-40,0,40,80,120].map(d=>{const spans=waterSpans(p.y+d);return spans.reduce((a,b)=>Math.abs((a[0]+a[1])/2-p.x)<Math.abs((b[0]+b[1])/2-p.x)?a:b);});
   const bank=p.bank<0?Math.min(...rows.map(r=>r[0])):Math.max(...rows.map(r=>r[1]));let count=0;
   const pattern=p.look==='grove'?[[32,-70],[82,-38],[24,0],[116,16],[66,53],[25,96],[108,111]]:p.look==='open'?[[46,-35],[92,75]]:[[40,-65],[95,-15],[35,50],[112,102]];
   for(let i=0;i<pattern.length;i++){const [out,dy]=pattern[i],id=family[i%family.length],frame=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][0]);
    const x=Math.round(p.bank<0?bank-out-frame.realWidth:bank+out),y=p.y+dy;
    if(x<20||x+frame.realWidth>WORLD_WIDTH-20||villageReserved(x,y,80)||landingReserved(x,y)||!landDecorationFits(x,y,frame.realWidth,frame.realHeight)||sceneryFootprints.some(s=>Math.hypot(s.x-x-frame.realWidth/2,s.y-y-frame.realHeight/2)<s.radius+22))continue;
    paintAsset(scene,ctx,id,x,y,i%ASSET_FRAMES[id].length);count++;
   }contentPlaced.push({id:p.id,count});
  }
  scene.registry.set('regionalContent',contentPlaced);
  for(const island of ESTUARY_ISLANDS){paintAsset(scene,ctx,'blue-ice-outcrop',island.x-44,island.y-38,1);paintAsset(scene,ctx,'tree-weathered',island.x+25,island.y+24,0);}
  for(const c of navigationLandmarks())paintAsset(scene,ctx,c.asset,c.x,c.y,c.variant,true);
  for(const p of navigationSigns()){drawAsset(scene,ctx,'river-direction-sign',p.x,p.y,p.variant);addSceneryFootprint({asset:'river-direction-sign',x:p.x+37,y:p.y+29,radius:5});}
  scene.registry.set('navigationSigns',navigationSigns());
  scene.registry.set('navigationLandmarks',navigationLandmarks());
  scene.registry.set('treeCrowns', sceneryFootprints.filter(p=>p.asset.startsWith('tree-')).map(p=>({x:p.x,y:p.y-8})));
  texture.refresh();
  scene.add.image(0, 0, 'river').setOrigin(0);
  return land;
}
