import {addSceneryFootprint,sceneryBlocked} from '../world/sceneryCollision';
import Phaser from 'phaser';
import {banks,waterSpans,waterAt,landDecorationFits,landPlant} from '../world/river';
import {ASSETS,ASSET_FRAMES,ATLAS,type AssetId} from '../assets/catalog';
export interface Landing {id:string;name:string;x:number;y:number;landX:number;landY:number;paths:number[][][];clearings:{x:number;y:number;r:number}[];obstacles:{x:number;y:number;r:number}[]}
let sites:Landing[]|undefined;
export function landings(){return sites??=([['lookout','Lookout Point',640],['camp','Camp Clearing',2260],['forest','Spruce Forest Trail',3000],['old-dock','Old Fisher Dock',5560],['grove','Quiet Frozen Grove',7110],['beacon-rest','Coastal Beacon',3800],['shelter-bay','Ice Bay Landing',4270]] as const).map(([id,name,y])=>{
 const coastal=id==='beacon-rest'||id==='shelter-bay';
 const bank=coastal?waterSpans(y).filter(s=>s[1]>5000&&s[1]-s[0]>180).at(-1)![0]:id==='old-dock'?waterSpans(y).find(s=>s[1]>2000)![0]:banks(y)[0],x=bank+76,landX=x-44;
 const approach=[[landX,y],[bank-65,y]];
 const relative:Record<string,number[][][]>={
  'beacon-rest':[[[-65,0],[-100,-20],[-120,-50]]],
  'shelter-bay':[[[-65,0],[-100,20],[-130,25]]],
  lookout:[[[-65,0],[-102,-22],[-148,-64],[-183,-72]]],
  camp:[[[-65,0],[-105,-10],[-145,-28],[-182,-28]],[[-105,-10],[-112,24],[-151,42]]],
  forest:[[[-65,0],[-104,-22],[-140,-65],[-185,-104],[-175,-160],[-230,-205]],[[-185,-104],[-240,-92],[-268,-44]],[[-140,-65],[-90,-107],[-100,-158]],[[-175,-160],[-135,-180],[-100,-158]]],
  'old-dock':[[[-65,0],[-104,30],[-140,65]],[[-104,30],[-80,82]]],
  grove:[[[-65,0],[-104,-22],[-140,-18]],[[-104,-22],[-125,-59]]],
 };
 const branches=relative[id].map(path=>path.map(([dx,dy])=>[bank+dx,y+dy]));
 const paths=[[...approach,...branches[0].slice(1)],...branches.slice(1)];
 const pockets:Record<string,number[][]>={'beacon-rest':[[-110,-35,22]],'shelter-bay':[[-115,25,22]],lookout:[[-170,-70,26]],camp:[[-145,-28,30]],forest:[[-185,-104,27],[-230,-205,27],[-268,-44,24]],'old-dock':[[-140,65,26]],grove:[[-115,-20,24]]};
 const clearings=pockets[id].map(([dx,dy,r])=>({x:bank+dx,y:y+dy,r}));
 return {id,name:id==='old-dock'?"Old Fisher’s Rest":name,x,y,landX,landY:y,paths,clearings,obstacles:[]};
});}
function distance(x:number,y:number,a:number[],b:number[]){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
export function pathDistance(s:Landing,x:number,y:number){return Math.min(...s.paths.flatMap(p=>p.slice(1).map((b,i)=>distance(x,y,p[i],b))));}
export function landingReserved(x:number,y:number){return landings().some(s=>pathDistance(s,x,y)<80||s.clearings.some(c=>Math.hypot(x-c.x,y-c.y)<c.r+55));}
export function landingInterior(s:Landing,x:number,y:number){return Math.min(pathDistance(s,x,y)-19,...s.clearings.map(c=>Math.hypot(x-c.x,y-c.y)-c.r));}
export function onLandingDock(s:Landing,x:number,y:number){
 const center=s.x-76;
 return x>=center-42&&x<=center+42&&Math.abs(y-s.y)<=10;
}
export function landingWalk(s:Landing,x:number,y:number){if(onLandingDock(s,x,y))return true;return x>20&&landingInterior(s,x,y)<0&&!waterAt(x+10,y)&&!waterAt(x-10,y)&&!waterAt(x,y-10)&&!waterAt(x,y+10)&&s.obstacles.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+10);}
export class LandingsView {
 private occluders:{image:Phaser.GameObjects.Image;baseY:number}[]=[];
 private lights:Phaser.GameObjects.Graphics;private fires:{x:number;y:number}[]=[];
 constructor(private scene:Phaser.Scene,land:Phaser.Physics.Arcade.StaticGroup){
  this.lights=scene.add.graphics().setDepth(2.5);
  for(const s of landings()){
   s.obstacles=[];
   const dock=scene.add.image(s.x-76,s.y,ATLAS,ASSETS.dock).setDepth(.95);
   land.add(scene.add.zone(dock.x,dock.y,96,24));
   const g=scene.add.graphics().setDepth(.55);
   // Native snow-path clusters following authored routes; no perimeter ring.
   const points=s.paths.flat();
   for(let y=Math.floor(Math.min(...points.map(p=>p[1]))-40);y<Math.max(...points.map(p=>p[1]))+40;y+=2)
    for(let x=Math.floor(Math.min(...points.map(p=>p[0]))-40);x<Math.max(...points.map(p=>p[0]))+40;x+=2){
     const d=landingInterior(s,x,y)+19,edge=22+Math.sin(x/13+y/17)*1.5;
     if(d<edge&&!waterAt(x,y))g.fillStyle(0x9bb7c5,d>edge-3?.1:.23).fillRect(x,y,2,2);
    }
   const add=(id:AssetId,x:number,y:number,variant=0,r=9)=>{
    const frame=scene.textures.getFrame(ATLAS,ASSET_FRAMES[id][variant%ASSET_FRAMES[id].length]);
    if(!landDecorationFits(x-frame.realWidth/2,y-frame.realHeight/2,frame.realWidth,frame.realHeight))return;
    if(id.startsWith('tree-')&&sceneryBlocked(x,y,r+3)||waterAt(x,y)||landingInterior(s,x,y)<r+12||s.obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<r+o.r+3))return;
    const image=scene.add.image(x,y,ATLAS,ASSET_FRAMES[id][variant%ASSET_FRAMES[id].length]).setDepth(1).setData('landing',s.id).setData('asset',id);
    this.occluders.push({image,baseY:y+r});s.obstacles.push({x,y,r});addSceneryFootprint({asset:id,x,y,radius:r});
   };
   const bank=s.x-76;
   // Authored clusters leave working/observation aprons free for future use.
   const lamp=(dx:number,dy:number)=>{const x=bank+dx,y=s.y+dy;add('path-lantern',x,y,0,4);if(s.obstacles.some(o=>o.x===x&&o.y===y))this.fires.push({x,y:y-3});};
   if(s.id==='beacon-rest'){add('village-beacon',bank-185,s.y-105,0,22);add('village-bench',bank-120,s.y+30,0,12);lamp(-60,-40);}
   else if(s.id==='shelter-bay'){add('abandoned-shelter',bank-205,s.y+65,0,25);add('blue-ice-outcrop',bank-140,s.y-90,0,24);lamp(-60,45);}
   else if(s.id==='lookout'){
    add('village-bench',bank-191,s.y-120,0,12);add('research-instruments',bank-105,s.y-118,0,15);
    add('rock',bank-227,s.y-68,1,12);lamp(-60,-45);
   }else if(s.id==='camp'){
    const x=bank-98,y=s.y+56;scene.add.sprite(x,y,ATLAS,ASSETS['village-firepit']).play('village-firepit/none/idle').setDepth(1).setData('emissive',true);s.obstacles.push({x,y,r:12});addSceneryFootprint({asset:'village-firepit',x,y,radius:12});this.fires.push({x,y});
    add('abandoned-shelter',bank-190,s.y-85,0,25);add('snow-log',bank-215,s.y-130,0,12);add('hub-crate',bank-212,s.y+4,0,10);add('village-woodpile',bank-52,s.y+40,0,13);
   }else if(s.id==='old-dock'){
    add('abandoned-shelter',bank-205,s.y+73,0,25);add('hub-net',bank-50,s.y+129,0,10);add('hub-barrel',bank-93,s.y+132,0,10);add('hub-crate',bank-121,s.y+113,0,10);add('village-rope',bank-174,s.y+106,0,8);add('village-drying-rack',bank-211,s.y+137,0,18);lamp(-45,30);
   }else if(s.id==='grove'){
    add('village-bench',bank-125,s.y+38,0,12);add('blue-ice-outcrop',bank-165,s.y+80,1,24);add('tree-weathered',bank-77,s.y-80,0,12);add('rock',bank-130,s.y+108,1,12);lamp(-71,-42);
   }else{
    add('village-bench',bank-291,s.y+10,0,12);add('snow-log',bank-230,s.y-147,0,12);add('rock',bank-110,s.y-215,1,12);add('tree-ancient',bank-302,s.y-251,0,18);lamp(-63,-40);
   }
   const clusters=s.id==='forest'?[[bank-335,s.y-155],[bank-332,s.y-50],[bank-255,s.y-266],[bank-153,s.y-259],[bank-47,s.y-185],[bank-203,s.y+26],[bank-64,s.y-57],[bank-211,s.y-30],[bank-268,s.y-157],[bank-148,s.y-230],[bank-304,s.y-89]]:s.id==='lookout'?[[bank-82,s.y-113],[bank-234,s.y-122]]:s.id==='grove'?[[bank-210,s.y-179],[bank-241,s.y-69]]:[[bank-80,s.y-104],[bank-232,s.y-10]];
   const trees:AssetId[]=s.id==='grove'?['tree-weathered','tree-snowbound','tree-bare']:s.id==='forest'?['tree-spruce','tree-fir','tree-young']:['tree-pine','tree-young','tree-mature'];
   for(const[cx,cy]of clusters)for(let i=0;i<(s.id==='forest'?8:3);i++)add(trees[i%trees.length],cx+Math.sin(i*2.4)*33,cy+Math.cos(i*1.7)*30,i,10);

  }
 }
 update(night:number,time:number,playerY=Infinity){for(const o of this.occluders)o.image.setDepth(playerY<o.baseY?2.2:1);this.lights.clear();for(const f of this.fires)for(let r=24;r>0;r-=6)this.lights.fillStyle(0xe7b664,(.02+night*.025)*(1+Math.sin(time/180)*.05)).fillCircle(f.x,f.y,r);}
}
