import {remoteNpcArt} from './remote-npc-art.mjs';
import {navigationSignArt} from './navigation-sign-art.mjs';
import {arcticWildlifeArt} from './arctic-wildlife-art.mjs';
import {villageLightArt} from './village-lights-art.mjs';
import {villageExpansionArt} from './village-expansion-art.mjs';
import {rosterArt} from './roster-art.mjs';
import {corgiArt} from './corgi-art.mjs';
import {ecosystemFish} from './ecosystem-fish-art.mjs';
import {villageYardArt} from './village-yard-art.mjs';
import {explorationArt} from './exploration-art.mjs';
import {modulesArt} from './modules-art.mjs';
import {toolsArt} from './tools-art.mjs';
import {traversalArt} from './traversal-art.mjs';
import { wildlifePoses } from './wildlife-poses.mjs';
import { iceMaterial } from './ice-material.mjs';
import { environmentArt, microLandmark } from './environment.mjs';
import { ecologyLandmark } from './ecology.mjs';
// Original authored pixel-cluster recipes. Individual frames, never sheets.
import { Pixels, random } from './pixels.mjs';

function kayak(p, frame) {
  const r = (x, y, w, h, c) => p.rect(x, y, w, h, c);
  p.poly([[16,1],[20,7],[22,16],[21,29],[16,38],[11,30],[10,16],[12,7]], 'ink');
  p.poly([[16,2],[19,8],[21,16],[20,29],[16,36],[12,29],[11,16],[13,8]], 'rustDark');
  p.poly([[16,3],[18,8],[20,16],[19,29],[16,35],[13,28],[12,16],[14,8]], 'rust');
  p.line(16,3,13,13,'rustEdge'); p.line(12,16,13,28,'rustLight'); p.line(13,29,16,34,'rustLight');
  p.line(18,8,19,14,'rustLight'); p.line(16,5,16,12,'rustLight');
  p.line(14,9,18,12,'woodDark'); p.line(18,9,14,12,'woodDark');
  p.dot(14,9,'fur'); p.dot(18,9,'fur');
  p.ellipse(16,22,4,9,'rustDark'); p.ellipse(16,21,3,8,'ink');
  r(14,28,5,3,'woodShade'); p.line(14,28,18,30,'furDark'); p.line(18,28,14,30,'furDark');
  r(14,31,4,1,'rustEdge'); r(15,33,2,1,'woodDark');
  if (!frame.id.includes('empty')) {
  const tilt = frame.animation === 'paddle' ? [-2, 0, 2][frame.index] : 0;
  p.line(3,22-tilt,28,22+tilt,'woodDark');
  p.line(3,21-tilt,28,21+tilt,'woodLight');
  p.poly([[1,20-tilt],[5,19-tilt],[7,21-tilt],[5,23-tilt],[1,23-tilt]],'wood');
  p.line(1,20-tilt,5,20-tilt,'woodEdge');
  p.poly([[25,20+tilt],[29,20+tilt],[30,23+tilt],[26,24+tilt],[24,22+tilt]],'wood');
  p.line(26,21+tilt,29,21+tilt,'woodEdge');
  // Oversized fur hood, rounded shoulders, mittens and seams viewed from above.
  p.ellipse(16,21,6,5,'parkaDark'); p.ellipse(15,20,5,5,'parka');
  r(11,19,2,4,'parkaLight'); r(14,22,1,3,'parkaLight');
  r(15,21,1,5,'parkaDark'); r(17,24,2,1,'parkaLight');
  r(10,21,2,2,'furDark'); r(21,21,2,2,'furDark');
  p.ellipse(16,15,5,5,'furDark'); p.ellipse(15,14,5,4,'fur');
  p.line(12,11,16,10,'furLight'); p.line(11,12,11,15,'furLight');
  p.ellipse(16,14,3,3,'parkaDark'); p.ellipse(15,13,2,2,'parka');
  p.dot(14,12,'parkaLight'); p.dot(12,17,'furLight'); p.dot(19,15,'furLight');
  } else {
    p.line(20,9,20,28,'woodDark');p.line(19,9,19,28,'woodLight');p.rect(18,25,3,5,'wood');
  }
  if(frame.id.includes('upgraded')) {
    r(12,27,9,6,'woodDark');r(13,27,7,5,'wood');
    r(13,27,7,1,'woodEdge');r(13,29,7,1,'woodLight');
    r(15,27,1,5,'furDark');r(18,27,1,5,'furDark');
    p.dot(13,31,'woodShade');p.dot(19,31,'woodShade');
  }
}

function water(p) {
  const rnd = random(430);
  p.rect(0,0,128,128,'water');
  // Wrap quiet cluster shapes at tile boundaries rather than leaving a seam.
  const wrap = (x,y,w,h,c) => { for(let j=0;j<h;j++) for(let i=0;i<w;i++) p.dot((x+i+128)%128,(y+j+128)%128,c); };
  for (let i=0;i<25;i++) {
    const x=Math.floor(rnd()*128), y=Math.floor(rnd()*128), w=5+Math.floor(rnd()*16);
    wrap(x,y,w,2,i%3?'waterShade':'waterLight');
    wrap(x+3,y+2,w-4,2,i%3?'waterShade':'waterLight');
  }
  for(let i=0;i<16;i++) {
    const x=Math.floor(rnd()*128),y=Math.floor(rnd()*128),w=3+Math.floor(rnd()*6);
    wrap(x,y,w,1,'waterLight'); wrap(x+2,y+1,Math.max(1,w-4),1,'wave');
    if(i%5===0) wrap(x-2,y+3,3,1,'waterLight');
  }
}

function snow(p) {
  const rnd=random(720); p.rect(0,0,128,128,'snow');
  const wrap=(x,y,w,h,c)=> { for(let j=0;j<h;j++) for(let i=0;i<w;i++) p.dot((x+i+128)%128,(y+j+128)%128,c); };
  for(let i=0;i<4;i++) {
    const x=Math.floor(rnd()*128), y=Math.floor(rnd()*128),w=4+Math.floor(rnd()*10);
    wrap(x,y,w,1,'snowShade'); wrap(x+2,y+1,w-2,1,'snowShade');
    wrap(x-1,y-1,w+2,1,'snowLight');
    if(i%4===0) {wrap(x+3,y+2,3,1,'snowDeep');wrap(x-2,y-2,4,1,'snowLight');}
  }
  for(let i=0;i<2;i++) {
    const x=Math.floor(rnd()*128),y=Math.floor(rnd()*128);
    wrap(x,y,2,1,'snowLight');wrap(x+5,y+3,1,1,'snowShade');
  }
}

function shore(p, frame) {
  const rnd=random(19+frame.index*83);
  const rock=frame.id==='shore-rock',blue=frame.id==='shore-blue';
  // x=20 is the exact collision bank. Left snow, right open water.
  for(let y=0;y<16;y++) {
    const step=Math.floor(y/4), shift=[0,1,-1,0][(step+frame.index)%4];
    p.rect(0,y,8+shift,1,'snow'); p.rect(7+shift,y,4,1,'snowLight');
    p.rect(11+shift,y,4,1,rock?'rock':blue?'ice':'iceLight'); p.rect(15+shift,y,4,1,rock?'rockDark':blue?'iceShade':'ice');
    p.rect(19+shift,y,3,1,'iceShade'); p.rect(22+shift,y,3,1,'iceDark');
    p.rect(25+shift,y,3,1,'wave'); p.rect(28+shift,y,4-shift,1,'waterLight');
    if(y%4===0) p.rect(17+shift,y,3,1,'iceLight');
  }
  p.line(13,2,15,6,'snowLight'); p.line(15,6,15,10,'iceShade');
  p.line(15,10,18,12,'iceShade');
  for(let i=0;i<6;i++) p.dot(23+Math.floor(rnd()*6),Math.floor(rnd()*16),'iceDark');
}

function cabin(p) {
  p.rect(7,10,60,55,'snowDeep');
  p.rect(5,7,60,56,'woodDark'); p.rect(7,9,56,51,'wood');
  // Timber eaves with tiny joinery, snow on the western roof plane.
  p.rect(9,11,25,46,'woodShade'); p.rect(35,11,25,46,'woodShade');
  for(let y=12;y<57;y+=5) {
    p.line(10,y,32,y,'wood');p.line(36,y,59,y,'wood');
    p.line(11,y+1,30,y+1,'woodLight');p.line(39,y+1,57,y+1,'wood');
    p.dot(13,y+3,'woodDark');p.dot(54,y+2,'woodDark');
  }
  p.rect(33,10,3,48,'woodDark');p.line(33,10,33,57,'woodEdge');
  p.poly([[8,9],[32,9],[32,20],[29,20],[29,29],[26,29],[26,38],[20,38],[20,46],[9,46]],'snowShade');
  p.poly([[8,8],[31,8],[31,18],[28,18],[28,27],[25,27],[25,35],[18,35],[18,42],[8,42]],'snow');
  p.line(9,9,30,9,'snowLight');p.line(9,10,9,38,'snowLight');
  p.rect(20,27,6,2,'snowLight');p.rect(10,39,5,2,'snowLight');p.rect(27,18,3,2,'snowLight');
  p.poly([[38,10],[60,10],[60,23],[55,23],[55,19],[49,19],[49,16],[38,16]],'snowShade');
  p.poly([[37,9],[60,9],[60,21],[56,21],[56,17],[49,17],[49,14],[37,14]],'snow');
  p.line(38,9,59,9,'snowLight');
  // Chimney and warm skylight read as roof details, not a facade.
  p.rect(42,22,10,11,'woodDark');p.rect(43,23,8,8,'rockDark');
  p.rect(43,23,7,2,'rockLight');p.rect(45,25,4,4,'ink');p.dot(44,29,'rock');
  p.rect(40,40,13,11,'woodDark');p.rect(41,41,11,8,'amberDark');
  p.rect(42,42,9,6,'amber');p.rect(42,42,8,2,'lamp');
  p.line(46,41,46,49,'woodShade');p.line(41,45,52,45,'woodShade');
  p.line(7,58,63,58,'woodEdge');p.line(7,7,63,7,'woodEdge');
  for(const x of [7,61]) for(const y of [8,58]) {p.rect(x,y,3,3,'woodDark');p.dot(x,y,'woodLight');}
  p.rect(38,61,21,7,'woodDark');p.rect(39,61,19,5,'wood');p.line(40,62,56,62,'woodLight');
  p.rect(44,60,10,2,'lamp');
  // Small fuel bundle and snow patch beside the porch.
  p.rect(8,62,16,6,'woodShade'); for(let x=9;x<24;x+=4){p.rect(x,62,3,5,'wood');p.dot(x,62,'woodEdge');}
  p.line(10,64,22,64,'furDark');
}

function dock(p) {
  p.rect(4,10,96,24,'deep');p.rect(3,8,96,24,'woodDark');
  for(let x=4;x<98;x+=8){
    p.rect(x,9,7,21,'wood');p.line(x,9,x+6,9,'woodEdge');p.line(x,10,x,28,'woodLight');
    p.line(x+3,12,x+3,17,'woodShade');p.line(x+4,20,x+4,26,'woodShade');
    p.dot(x+2,11,'woodDark');p.dot(x+2,28,'woodDark');
  }
  p.line(3,30,98,30,'woodShade');
  for(const x of [8,90]) for(const y of [5,29]){
    p.rect(x,y,6,6,'woodDark');p.rect(x+1,y,4,4,'woodLight');p.dot(x+2,y+1,'woodEdge');
  }
  p.rect(87,3,6,5,'woodDark');p.rect(88,3,4,3,'amber');p.rect(89,3,2,2,'lamp');
  p.ellipse(80,20,4,4,'woodShade');p.ellipse(80,20,3,3,'furDark');p.ellipse(80,20,1,1,'woodShade');
  p.line(77,21,74,25,'furDark');
  p.rect(9,9,8,2,'snow');p.rect(9,10,4,2,'snowLight');
}

function ice(p, frame) {
  const w=p.image.width,h=p.image.height;
  const shapes=[
    [[.5,.02],[.73,.09],[.89,.28],[.97,.49],[.88,.71],[.68,.84],[.52,.98],[.29,.88],[.12,.7],[.03,.46],[.12,.22],[.3,.08]],
    [[.11,.3],[.34,.09],[.65,.03],[.89,.14],[.97,.37],[.85,.56],[.92,.69],[.64,.84],[.29,.96],[.08,.76],[.03,.5]],
    [[.2,.09],[.55,.03],[.76,.2],[.72,.33],[.96,.43],[.88,.73],[.59,.83],[.45,.98],[.2,.85],[.04,.62],[.14,.46],[.02,.24]],
  ];
  const shape=shapes[frame.index%3];
  const points=(scale,ox=0,oy=0)=>shape.map(([x,y])=>[Math.round(w/2+(x-.5)*(w-8)*scale+ox),Math.round(h/2+(y-.5)*(h-8)*scale+oy)]);
  p.poly(points(1,0,1),'iceDark');
  p.poly(points(1),'iceShade');
  p.poly(points(.91,-1,-1),'ice');
  p.poly(points(.76,-2,-2),'iceLight');
  p.poly(points(.66,-3,-3),'snow');
  const top=points(.65,-3,-3);
  for(let i=0;i<top.length;i++){
    const [x,y]=top[i],[xx,yy]=top[(i+1)%top.length];
    if(y<h*.42 && yy<h*.42)p.line(x,y,xx,yy,'snowLight');
  }
  if(w>30){
    const cx=Math.round(w*.53),cy=Math.round(h*.42);
    p.line(cx,cy,cx-2,cy+5,'iceShade');p.line(cx-2,cy+5,cx+3,cy+9,'iceShade');
    p.line(cx-2,cy+5,cx-6,cy+7,'iceLight');
    p.rect(Math.round(w*.3),Math.round(h*.46),4,1,'snowLight');
    p.rect(Math.round(w*.44),Math.round(h*.67),5,1,'snowShade');
    p.line(Math.round(w*.72),Math.round(h*.54),Math.round(w*.7),Math.round(h*.67),'iceLight');
  }
}

function rock(p,frame){
  const shift=frame.index*2;
  p.ellipse(13,18,10,5,'snowShade');
  p.poly([[4,11],[8,6],[17,5],[23,12],[21,21],[9,23],[3,18]],'rockDark');
  p.poly([[5,10],[9,6],[17,6],[20,12],[15,17],[5,17]],'rock');
  p.line(17,12,18,19,'ink');p.line(18,19,21,19,'rock');
  p.poly([[5,10],[9,5+shift],[16,5],[20,10],[18,13],[13,12],[10,15],[4,14]],'snowShade');
  p.poly([[5,9],[9,5],[16,5],[18,9],[17,11],[12,10],[9,13],[4,12]],'snow');
  p.line(8,6,15,6,'snowLight');p.dot(5,10,'snowLight');
  p.rect(7,19,3,2,'rockLight');p.dot(14,18,'rockLight');
  p.rect(24,21,3,2,'snowDeep');p.dot(25,20,'snowLight');
}

function shrub(p,frame){
  // One connected canopy from directly overhead. No upright triangular trees.
  // Long asymmetric boughs radiate from the crown with snow resting on them.
  p.ellipse(17,19,13,10,'snowShade');
  const outline=[[15,2],[18,5],[22,4],[22,8],[27,8],[25,12],[30,15],[26,18],[28,23],[23,23],[22,28],[18,26],[15,30],[12,26],[7,28],[8,23],[3,22],[6,18],[2,14],[7,12],[5,8],[11,8],[11,4]];
  p.poly(outline,'pineDark');
  p.poly([[15,4],[17,8],[21,6],[20,11],[25,10],[22,14],[27,15],[22,18],[25,21],[20,21],[20,26],[17,23],[15,27],[13,23],[9,25],[10,20],[5,20],[9,16],[5,14],[11,13],[8,10],[13,10]],'pine');
  // Broken needle highlights belong to broad joined branch shapes.
  p.line(15,7,15,24,'pineDark');
  p.line(15,15,7,12,'pineLight');p.line(14,17,7,19,'pineLight');
  p.line(17,16,23,13,'pineLight');p.line(17,20,22,22,'pineLight');
  p.line(11,22,10,24,'pineLight');p.line(21,10,24,10,'pineLight');
  // Two or three large coherent snow caps, rather than snow on every twig.
  p.poly([[13,5],[16,4],[18,8],[21,8],[20,12],[24,13],[20,16],[16,14],[13,16],[10,13],[8,13],[9,10],[12,10]],'snowDeep');
  p.poly([[13,4],[16,4],[17,8],[20,8],[19,11],[22,12],[19,14],[15,12],[12,14],[10,11],[12,9]],'snow');
  p.line(13,5,15,5,'snowLight');p.line(12,9,16,9,'snowLight');
  p.poly([[8,17],[12,16],[14,19],[12,21],[8,20],[6,19]],'snowDeep');
  p.poly([[8,16],[11,16],[12,18],[10,19],[6,18]],'snow');p.line(8,16,10,16,'snowLight');
  if(frame.index===0){
    p.poly([[18,21],[21,20],[24,23],[21,24],[18,23]],'snowDeep');
    p.line(18,21,21,21,'snow');p.dot(19,20,'snowLight');
  }else{
    p.poly([[12,22],[15,21],[17,25],[14,27],[11,25]],'snowDeep');
    p.line(12,22,14,22,'snow');p.line(13,23,15,24,'snow');
  }
}

function fishSpot(p){
  p.poly([[4,10],[7,7],[15,7],[20,10],[26,6],[24,11],[27,15],[20,12],[14,15],[7,13]],'deep');
  p.poly([[9,8],[13,5],[15,8]],'ink');p.line(11,13,14,16,'deep');
  p.line(6,9,13,8,'waterShade');p.line(8,11,16,11,'water');
  p.dot(6,10,'ink');p.line(18,10,21,11,'waterShade');
}

function vegetation(p, frame) {
  const w=p.image.width,h=p.image.height,cx=w/2,cy=h/2;
  const rnd=random(610+frame.index*37+w);
  if(frame.id==='dead-branch' || frame.id==='reeds' || frame.id==='tree-bare') {
    const r=Math.min(w,h)*.29;
    if(frame.id==='reeds') {
      for(let i=0;i<5;i++) {
        const x=cx-4+i*2, y=cy-5+(i%3)*3;
        p.line(cx,cy+4,x,y,'woodShade');p.line(x,y,x+1,y-3,'wood');
        p.dot(x,y-3,'woodLight');
      }
      p.line(cx-3,cy+4,cx+2,cy+4,'snow');return;
    }
    p.line(cx+1,cy+r,cx-2,cy-r,'woodDark');
    p.line(cx,cy+r,cx-3,cy-r,'woodLight');
    for(let i=0;i<6;i++) {
      const side=i%2?1:-1, by=cy+r*.6-i*r*.24;
      const x=cx+side*r*(.55+rnd()*.5),y=by-r*(.35+rnd()*.25);
      p.line(cx,by,x,y,'woodShade');p.line(cx-1,by-1,x-1,y-1,'wood');
      p.line((cx+x)/2,(by+y)/2,x-side*2,y-r*.28,'woodShade');
      p.line(x,y,x+side*2,y-2,'woodDark');
      if(i%3!==1)p.line(cx-1,by-2,(cx+x)/2-1,(by+y)/2-2,'snow');
    }
    p.line(cx-2,cy-r,cx-1,cy-r*.65,'snowLight');return;
  }
  if(frame.id==='snow-log') {
    p.poly([[3,9],[7,5],[28,11],[29,16],[24,19],[4,13]],'woodDark');
    p.line(6,7,26,13,'wood');p.line(6,9,25,15,'woodLight');
    p.poly([[5,6],[10,5],[26,10],[25,13],[19,12],[18,10],[9,9],[7,10],[3,8]],'snow');
    p.line(7,5,15,7,'snowLight');return;
  }
  // Overlapping branch whorls: broad lower boughs, exposed woody joins,
  // broken snow pillows and smaller upper shoots. No circular canopy stamp.
  const type=frame.id;
  const narrow=type==='tree-fir'||type==='tree-spire', sparse=type==='tree-weathered';
  const snowCover=type==='tree-snowbound'?1:type==='tree-pine'?.45:.84;
  const radius=Math.min(w,h)*.43;
  const crown=Array.from({length:18},(_,i)=>{
    const a=i*Math.PI/9, r=radius*(.62+rnd()*.16);
    return [Math.round(cx+Math.cos(a)*r*(type==='tree-spire'?.47:narrow?.72:1)),Math.round(cy+Math.sin(a)*r)];
  });
  p.poly(crown.map(([x,y])=>[x+1,y+1]),'snowShade');
  p.poly(crown,'pineDark');
  p.poly(crown.map(([x,y])=>[Math.round(cx+(x-cx)*.85),Math.round(cy+(y-cy)*.85)]),'pine');
  p.line(cx+1,cy-radius*.65,cx+2,cy+radius*.7,'woodDark');
  p.line(cx,cy-radius*.6,cx,cy+radius*.67,'woodLight');
  for(let layer=0;layer<(sparse?2:3);layer++) {
    const reach=radius*(1-layer*.23), arms=layer===2?4:type==='tree-spruce'?8:type==='tree-spire'?4:sparse?5:6;
    for(let i=0;i<arms;i++) {
      const angle=i/arms*Math.PI*2+frame.index*.39+layer*.55;
      const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx;
      const length=reach*(.8+rnd()*.2),width=reach*(type==='tree-pine'?.55:type==='tree-fir'?.31:.43);
      const point=(along,across)=>[Math.round(cx+(dx*along+nx*across)*(type==='tree-spire'?.47:narrow?.72:1)),Math.round(cy+dy*along+ny*across)];
      p.line(cx,cy,...point(length*.9,0),'woodShade');
      const branch=[[0,0],[length*.28,-width*.7],[length*.4,-width],[length*.53,-width*.65],[length*.72,-width*.8],[length*.7,-width*.25],[length,0],[length*.73,width*.25],[length*.8,width*.55],[length*.5,width*.65],[length*.4,width],[length*.23,width*.55]].map(([l,v])=>point(l,v));
      if(sparse&&i%3===0){p.line(cx,cy,...point(length,0),'wood');p.line(...point(length*.6,0),...point(length*.85,width*.5),'woodDark');continue;}
      p.poly(branch,'pineDark');
      p.poly(branch.map(([x,y])=>[x-1,y-1]),'pine');
      p.line(...point(length*.2,-1),...point(length*.8,-1),'pineLight');
      for(let j=0;j<2;j++) {
        const t=.3+j*.17;
        p.line(...point(length*t,0),...point(length*(t+.14),width*.45),'pineDark');
      }
      if(rnd()<snowCover) {
        const snow=[[length*.16,0],[length*.32,-width*.7],[length*.51,-width*.7],[length*.72,-width*.3],[length*.87,0],[length*.67,width*.18],[length*.57,width*.45],[length*.34,width*.3]].map(([l,v])=>point(l,v));
        p.poly(snow,'snowShade');p.poly(snow.map(([x,y])=>[x-1,y-1]),'snow');
        p.line(...point(length*.32,-width*.4),...point(length*.58,-width*.3),'snowLight');
      }
    }
  }
  p.line(cx-1,cy-3,cx+1,cy+2,'pineDark');p.dot(cx-1,cy-3,'snowLight');
}

function icon(p,frame){
  if(frame.id==='cargo-icon'){
    p.rect(2,6,12,8,'woodDark');p.rect(3,6,10,7,'wood');
    p.rect(4,8,8,1,'woodLight');p.rect(4,11,8,1,'woodLight');
    p.line(5,5,10,5,'furDark');p.line(5,5,4,7,'furDark');p.line(10,5,11,7,'furDark');
    p.line(4,3,9,3,'iceLight');p.rect(5,2,3,3,'ice');p.dot(9,3,'ink');
  }else{
    p.ellipse(8,8,6,6,'woodDark');p.ellipse(7,7,5,5,'amberDark');p.ellipse(7,6,4,4,'amber');
    p.line(5,3,8,3,'lamp');p.line(4,4,4,7,'lamp');p.line(8,5,6,8,'woodLight');
    p.line(6,8,9,8,'woodLight');p.dot(8,10,'woodLight');
  }
}

function hubNpc(p,frame) {
  const keeper=frame.id==='journal-keeper', gesture=[0,1,0,-1][frame.index];
  const coat=keeper?'parka':'rust', dark=keeper?'parkaDark':'rustDark', light=keeper?'parkaLight':'rustLight';
  p.ellipse(17,19,10,9,'snowShade');
  const stride=frame.animation==='walk'?gesture:0;
  p.rect(11,23+stride,4,4,'woodDark');p.rect(18,23-stride,4,4,'woodDark');
  p.poly([[10,12],[7,16],[9,22],[12,25],[21,25],[25,21],[24,15],[21,12]],dark);
  p.poly([[11,13],[9,17],[12,23],[20,24],[23,20],[22,14]],coat);
  p.line(12,16,12,21,light);p.line(14,22,19,23,light);p.line(16,17,17,24,dark);
  p.ellipse(8,19+gesture,3,3,'furDark');p.ellipse(24,19-gesture,3,3,'furDark');
  p.ellipse(16,11,9,8,'furDark');p.ellipse(15,10,8,7,'fur');p.ellipse(15,9,6,5,'furLight');
  p.ellipse(16,10,5,4,dark);p.ellipse(15,9,4,3,coat);p.line(13,8,16,7,light);
  p.line(11,14,13,16,'furLight');p.line(19,15,21,13,'fur');
  if(keeper){
    p.rect(18,20-gesture,10,7,'woodDark');p.rect(19,20-gesture,8,5,'snowLight');
    p.line(23,20-gesture,23,24-gesture,'wood');p.line(20,22-gesture,21,22-gesture,'rock');
    p.line(25,21-gesture,26,21-gesture,'rust');
  } else {
    p.line(6,24+gesture,27,17-gesture,'woodDark');p.line(7,23+gesture,27,16-gesture,'woodLight');
    p.ellipse(18,20,2,2,'ice');p.dot(18,20,'ink');
  }
}
function mapArt(p,frame){
  if(frame.id==='map-frame'){
    p.rect(2,2,416,276,'woodDark');p.rect(4,4,412,272,'wood');p.rect(7,7,406,266,'parkaDark');
    p.line(5,4,414,4,'woodEdge');p.line(5,274,414,274,'woodShade');
    p.line(9,28,410,28,'woodLight');p.line(9,258,410,258,'woodLight');
    for(const x of [4,412])for(const y of [4,272])p.rect(x,y,3,3,'amber');
    p.line(291,33,291,252,'woodShade');
  }else{
    const i=frame.index;
    if(i===0){p.poly([[1,3],[4,1],[6,3],[6,6],[1,6]],'woodEdge');p.rect(3,4,2,2,'woodDark');}
    if(i===1){p.ellipse(4,3,2,2,'amber');p.rect(2,5,4,2,'fur');}
    if(i===2){p.poly([[4,1],[6,4],[4,6],[1,4]],'ice');p.dot(3,3,'snowLight');}
    if(i===3){p.line(1,5,4,2,'furLight');p.line(4,2,6,5,'furLight');p.line(4,2,4,6,'woodLight');}
  }
}
function fishPortrait(p,frame){
  if(['fish-dolly','fish-lenok','fish-sleeper'].includes(frame.id)){
    const sleeper=frame.id==='fish-sleeper',lenok=frame.id==='fish-lenok';
    p.poly(sleeper?[[3,11],[11,7],[25,10],[34,11],[40,9],[42,17],[36,21],[24,20],[9,20],[3,16]]:[[3,14],[10,9],[24,8],[33,12],[41,6],[39,14],[41,22],[31,17],[18,20],[7,18]],'ink');
    p.poly([[5,13],[11,10],[24,11],[34,14],[29,17],[12,18],[5,16]],sleeper?'rockDark':lenok?'parka':'pine');
    p.line(9,12,27,13,sleeper?'rockLight':lenok?'iceLight':'snowShade');
    p.poly([[15,10],[17,sleeper?7:3],[24,6],[27,11]],sleeper?'rock':lenok?'parkaDark':'rust');
    p.poly([[16,18],[19,23],[25,21],[25,17]],sleeper?'rock':lenok?'parkaDark':'rust');
    for(const [x,y]of [[12,14],[16,12],[20,15],[24,13],[27,15]])p.dot(x,y,sleeper?'rock':lenok?'ink':'rustLight');
    if(sleeper){p.line(6,18,4,23,'rockLight');p.line(4,23,7,23,'rockLight');p.line(31,15,39,16,'rockLight');}
    else p.line(12,17,26,17,lenok?'snowShade':'rustLight');
    p.dot(8,12,'ink');p.dot(8,11,'snowLight');p.line(4,15,8,15,'ink');return;
  }

  if(frame.id==='fish-grayling') {
    p.poly([[4,14],[9,10],[16,9],[27,11],[32,13],[40,7],[38,14],[40,21],[31,17],[22,19],[12,19],[5,16]],'ink');
    p.poly([[6,14],[12,11],[22,11],[32,14],[27,17],[13,17],[7,16]],'ice');
    p.poly([[13,10],[16,3],[21,2],[26,5],[27,11]],'parkaDark');
    p.poly([[15,9],[18,4],[22,4],[25,7],[25,10]],'iceLight');
    for(let x=18;x<26;x+=3)p.line(x,5,x-1,10,'parka');
    p.line(9,12,25,13,'snowLight');p.line(13,16,28,15,'parka');
    p.poly([[17,17],[21,23],[25,20],[24,17]],'parkaDark');p.line(34,14,38,10,'ice');
    p.dot(8,13,'ink');p.dot(8,12,'snowLight');p.line(5,15,9,15,'parkaDark');return;
  }
  if(frame.id==='fish-burbot') {
    p.poly([[3,12],[8,8],[16,9],[25,11],[32,11],[38,8],[41,12],[40,18],[34,20],[23,20],[13,19],[6,18],[3,15]],'ink');
    p.poly([[5,12],[9,10],[16,11],[25,13],[36,11],[39,13],[38,16],[30,18],[17,17],[7,16]],'pine');
    p.poly([[16,10],[23,6],[30,7],[35,11]],'pineDark');p.poly([[12,17],[16,23],[21,20],[20,17]],'pineDark');
    p.line(7,12,16,12,'fur');p.line(18,13,35,14,'snowShade');
    for(const[x,y]of[[12,14],[17,12],[22,15],[27,14],[31,16],[35,12]])p.rect(x,y,2,2,'pineDark');
    p.dot(7,12,'ink');p.line(5,16,5,21,'fur');p.line(5,21,7,22,'fur');return;
  }
  if(frame.id==='fish-crown') {
    p.poly([[2,14],[9,11],[16,8],[28,10],[33,13],[41,3],[39,14],[41,20],[33,17],[26,20],[15,19],[8,16]],'ink');
    p.poly([[4,14],[14,11],[20,10],[29,12],[34,15],[27,18],[17,17],[10,15]],'snowShade');
    p.poly([[15,11],[16,4],[21,7],[22,11]],'rockDark');p.poly([[17,17],[20,24],[25,21],[24,17]],'rockDark');
    p.line(10,13,29,14,'snowLight');p.line(15,16,27,17,'ice');
    for(let x=13;x<30;x+=4){p.poly([[x,11],[x+1,9],[x+3,12]],'woodLight');p.dot(x+1,11,'furLight');}
    p.line(34,14,39,7,'snowLight');p.line(35,16,39,18,'ice');p.dot(9,13,'ink');p.dot(9,12,'furLight');
    p.line(6,15,7,18,'snowShade');p.line(9,16,10,19,'snowShade');return;
  }
  if(frame.id==='fish-pike') {
    p.poly([[2,13],[10,9],[26,10],[32,13],[40,6],[38,14],[41,22],[31,16],[11,18],[3,16]],'pineDark');
    p.poly([[3,13],[12,11],[28,12],[32,14],[27,16],[12,16],[4,15]],'pine');
    p.line(5,13,27,13,'snowShade');p.poly([[23,11],[27,6],[30,10]],'pine');
    for(let x=13;x<28;x+=4){p.line(x,14,x+1,15,'fur');}p.dot(7,12,'ink');p.line(2,15,8,15,'ink');return;
  }
  const char=frame.id==='fish-char' ,salmon=frame.id==='fish-salmon';
  const mid=char?'rust':salmon?'parka':'rockLight', light=char?'rustEdge':salmon?'snowShade':'snowLight';
  const dark=char?'rustDark':salmon?'parkaDark':'rockDark';
  const tail=salmon?[[31,12],[39,7],[40,11],[37,14],[40,18],[39,21],[31,16]]:[[30,12],[40,6],[37,14],[40,22],[30,16]];
  p.poly(tail,'ink');p.poly(tail.map(([x,y])=>[x-1,y]),dark);
  p.poly([[15,10],[20,5],[23,6],[23,11]],dark);p.poly([[14,17],[20,23],[23,22],[22,17]],dark);
  p.poly([[3,13],[7,9],[13,7],[22,8],[29,11],[34,13],[34,16],[28,18],[20,21],[11,20],[6,17]],'ink');
  p.poly([[5,13],[8,10],[14,9],[22,10],[29,12],[32,14],[28,17],[20,19],[12,18],[7,16]],mid);
  p.poly([[7,12],[14,10],[23,11],[29,13],[24,14],[12,13],[7,14]],light);
  p.line(9,15,25,16,char?'fur':'ice');p.line(11,16,22,17,dark);
  p.line(10,10,9,15,dark);p.dot(7,12,'ink');p.dot(7,11,'snowLight');
  p.line(4,14,7,15,dark);
  if(char)for(const [x,y]of[[14,12],[18,13],[22,12],[16,15],[24,15]])p.dot(x,y,'furLight');
  if(frame.id==='fish-trout'){ for(const [x,y]of[[12,11],[16,12],[20,11],[24,13],[14,15],[19,16],[25,15]])p.dot(x,y,'iceLight');p.line(12,18,22,19,'pineDark'); }
  if(salmon){p.line(5,16,8,17,'rustLight');for(const [x,y]of[[13,10],[17,11],[21,11],[25,12]])p.dot(x,y,'ink');}
}
function blueIce(p){
  p.poly([[5,23],[17,8],[35,5],[47,14],[68,10],[78,28],[72,49],[51,56],[33,48],[12,54],[4,39]],'iceShade');
  p.poly([[7,22],[19,10],[34,7],[47,17],[66,12],[74,28],[62,41],[45,44],[29,38],[12,46]],'ice');
  p.poly([[9,23],[20,11],[33,9],[44,18],[31,24],[17,32]],'iceLight');
  p.poly([[39,23],[49,18],[65,14],[71,27],[59,34],[48,33]],'snowShade');
  p.line(35,19,31,33,'water');p.line(31,33,40,40,'water');p.line(55,37,61,45,'water');
  p.poly([[17,11],[32,7],[41,14],[29,18],[17,24],[10,24]],'snowLight');
}
function gearIcon(p,frame){
  if(frame.id==='gear-speed'){
    p.line(5,20,19,4,'woodDark');p.line(6,20,20,4,'woodLight');
    p.poly([[3,18],[6,15],[10,18],[7,22],[3,22]],'rustDark');
    p.poly([[4,18],[6,16],[8,18],[6,21],[4,21]],'rustLight');
    p.poly([[16,3],[19,2],[22,3],[22,6],[19,9],[16,6]],'wood');
    p.line(18,3,21,3,'woodEdge');
    p.line(3,8,10,8,'iceLight');p.line(7,5,10,8,'iceLight');p.line(7,11,10,8,'iceLight');
    p.line(13,17,21,17,'ice');p.line(18,14,21,17,'ice');p.line(18,20,21,17,'ice');
  }else if(frame.id==='gear-rod'){
    p.line(4,21,19,3,'woodDark');p.line(5,21,20,3,'woodLight');p.line(4,20,8,15,'rust');
    p.line(20,3,21,13,'fur');p.line(21,13,18,17,'fur');p.ellipse(9,15,3,3,'iceShade');p.dot(9,15,'ink');
  }else if(frame.id==='gear-line'){
    p.ellipse(10,11,7,8,'woodDark');p.ellipse(10,10,6,7,'iceShade');p.ellipse(10,10,4,5,'iceLight');
    p.ellipse(10,10,2,3,'wood');p.line(15,12,20,15,'snow');p.line(20,15,20,20,'snow');p.line(20,20,17,20,'woodLight');
  }else if(frame.id==='gear-reel'){
    p.ellipse(10,11,8,8,'ink');p.ellipse(10,10,7,7,'rock');p.ellipse(10,10,5,5,'iceLight');p.ellipse(10,10,3,3,'wood');
    p.line(10,10,17,16,'woodLight');p.rect(17,15,5,3,'woodDark');p.line(8,4,12,4,'snowLight');
  }else if(frame.id==='gear-bait'){
    p.poly([[5,6],[18,6],[20,20],[3,20]],'woodDark');p.rect(5,7,13,12,'wood');p.rect(5,4,13,3,'woodLight');
    p.line(7,11,14,10,'rustEdge');p.line(14,10,15,14,'rustEdge');p.line(15,14,9,17,'rustLight');p.dot(7,11,'ink');
    p.line(6,8,16,8,'woodEdge');
  }else{
    p.rect(3,7,18,14,'woodDark');p.rect(4,8,16,12,'wood');
    for(let y=10;y<20;y+=3)p.line(5,y,19,y,'woodLight');
    p.line(8,8,8,19,'woodShade');p.line(15,8,15,19,'woodShade');
    p.line(7,6,17,6,'fur');p.line(7,6,5,9,'fur');p.line(17,6,19,9,'fur');
  }
}
function hubProp(p,frame){
  const id=frame.id;
  if(id==='journal-hut'){
    p.rect(4,4,48,48,'woodDark');p.rect(6,5,43,44,'wood');
    for(let x=7;x<49;x+=5)p.line(x,6,x,46,'woodShade');
    p.poly([[5,5],[49,5],[49,15],[44,18],[45,23],[38,20],[35,15],[28,17],[22,12],[14,16],[5,14]],'snowShade');
    p.poly([[5,4],[49,4],[49,12],[43,16],[36,12],[28,14],[22,10],[13,12],[5,11]],'snow');
    p.line(6,4,47,4,'snowLight');p.rect(19,29,17,13,'woodDark');p.rect(21,31,13,9,'pineDark');
    p.poly([[22,35],[26,33],[30,35],[32,33],[32,38],[29,36],[26,38]],'iceLight');
    p.rect(45,39,5,7,'amberDark');p.rect(46,40,3,4,'lamp');
  }else if(id==='hub-platform'){
    p.rect(2,2,60,32,'woodDark');
    for(let y=3;y<33;y+=5){p.rect(3,y,58,4,'wood');p.line(5,y,58,y,'woodLight');}
    for(const[x,y]of[[4,4],[58,4],[4,30],[58,30]]){p.rect(x-1,y-1,3,3,'woodShade');p.dot(x,y,'woodEdge');}
  }else if(id==='hub-crate'){
    p.rect(3,3,18,18,'woodDark');p.rect(4,4,16,15,'wood');
    for(let x=7;x<20;x+=4)p.line(x,4,x,19,'woodShade');
    p.line(5,5,18,18,'woodLight');p.line(5,18,18,5,'woodLight');p.dot(5,5,'ink');p.dot(18,18,'ink');
  }else if(id==='hub-barrel'){
    p.ellipse(12,13,10,9,'woodDark');p.ellipse(11,11,9,9,'wood');p.ellipse(11,11,7,7,'woodLight');
    for(let x=7;x<17;x+=4)p.line(x,6,x,16,'woodShade');
    p.line(5,6,17,6,'rockDark');p.line(5,16,17,16,'rockDark');p.ellipse(11,10,2,2,'woodDark');
  }else if(id==='hub-net'){
    p.poly([[3,6],[24,3],[29,18],[8,21]],'woodShade');
    for(let x=4;x<25;x+=5){p.line(x,6,x+4,19,'woodEdge');p.line(x,7,Math.min(28,x+9),15,'furDark');}
    p.line(3,6,24,3,'fur');p.line(24,3,29,18,'fur');p.line(29,18,8,21,'fur');p.line(8,21,3,6,'fur');
  }else if(id==='hub-lantern'){
    p.rect(4,4,8,12,'woodDark');p.rect(5,6,6,8,'amberDark');p.rect(6,7,4,5,'amber');p.rect(7,7,2,3,'lamp');
    p.line(6,3,9,3,'rock');p.line(7,2,8,2,'rock');p.line(5,16,10,16,'woodLight');
  }else if(id==='tackle-rack'){
    p.rect(3,6,33,3,'woodDark');p.rect(3,21,33,3,'woodDark');
    for(let i=0;i<3;i++){p.line(6+i*10,25,13+i*10,3,'woodLight');p.ellipse(9+i*10,18,2,2,'ice');p.dot(9+i*10,18,'ink');}
    p.rect(25,10,10,7,'pineDark');p.rect(26,11,8,4,'pine');p.dot(30,15,'amber');
  }
}
function uiSkin(p,frame){
  const w=p.image.width,h=p.image.height,active=frame.index===1,max=frame.index===3;
  const rim=max?'amberDark':active?'woodLight':frame.index===2?'rockDark':'woodShade';
  p.rect(2,2,w-4,h-4,'woodDark');p.rect(3,3,w-6,h-7,rim);p.rect(5,5,w-10,h-11,'ink');
  p.line(6,5,w-7,5,active||max?'woodEdge':'woodShade');
  for(const[x,y]of[[3,3],[w-4,3],[3,h-5],[w-4,h-5]])p.dot(x,y,'woodEdge');
  if(frame.id==='hub-panel'){
    p.line(8,45,w-9,45,'woodShade');p.line(8,h-35,w-9,h-35,'woodShade');
    p.line(2,h-3,w-3,h-3,'woodDark');
  }
}

// Authored front / front-quarter views: no rotation of the rear-facing artwork.
function fishermanFront(p, frame) {
  const side=frame.direction==='SE'?1:frame.direction==='SW'?-1:0;
  const stride=frame.animation==='walk'?[0,2,0,-2][frame.index]:0;
  const breath=frame.animation==='idle'&&frame.index===1?1:0;
  // Boots and sleeves alternate beneath a stable hood/shoulder anchor.
  p.rect(11+side,23+stride,4,4,'woodDark');p.rect(18+side,23-stride,4,4,'woodDark');
  p.line(11+side,25+stride,13+side,25+stride,'woodShade');
  p.line(18+side,25-stride,20+side,25-stride,'woodShade');
  p.ellipse(16,19,8,6,'parkaDark');p.ellipse(15,18,7,6,'parka');
  p.ellipse(8,18-stride,3,4,'parkaDark');p.ellipse(23,18+stride,3,4,'parkaDark');
  p.ellipse(8,19-stride,2,3,'furDark');p.ellipse(23,19+stride,2,3,'furDark');
  p.line(7,18-stride,8,18-stride,'fur');p.line(22,18+stride,23,18+stride,'fur');
  p.line(10,18,11,22,'parkaLight');p.line(16+side,18,16+side,24,'furDark');
  p.rect(11,21,3,2,'parkaDark');p.rect(19,21,3,2,'parkaDark');
  p.line(11,21,13,21,'parkaLight');p.line(19,21,21,21,'parkaLight');
  // The existing red pack peeks out behind the shoulders, never across the chest.
  p.dot(9,16,'rustDark');p.dot(23,16,'rustDark');
  p.ellipse(16,11,8,7,'furDark');p.ellipse(15,10,8,6,'fur');
  p.ellipse(14,9,6,5,'furLight');
  p.poly([[11,8],[14,5],[19,6],[22,10],[22,13],[11,13]],'parkaDark');
  p.poly([[12,8],[15,6],[19,7],[21,10],[12,10]],'parka');
  p.line(13,7,16,7,'parkaLight');
  const fx=16+side;
  p.rect(fx-4,11,8,5,'woodShade');p.rect(fx-3,11,6,5,'woodEdge');
  p.line(fx-2,11,fx+1,11,'fur');
  p.dot(fx-2,13,'ink');p.dot(fx+2,13,'ink');p.dot(fx,14,'woodShade');
  p.line(fx-1,16,fx+1,16,'woodDark');
  p.dot(10,12,'furLight');p.dot(11,15,'furLight');p.dot(21,15,'fur');
  p.line(13,17,19,17,'fur');p.dot(15+side,19+breath,'woodEdge');
}
// Side and rear-quarter poses are drawn in screen space, including face placement,
// hood volume, backpack and foot overlap. No rotated or mirrored source pixels.
function fishermanSide(p,frame) {
  const east=frame.direction==='E'||frame.direction==='NE';
  const rear=frame.direction==='NE'||frame.direction==='NW';
  const step=frame.animation==='walk'?[0,2,0,-2][frame.index]:0;
  const idle=frame.animation==='idle'?frame.index%2:0;
  const hip=east?17:15, face=east?21:10, pack=east?9:22;
  p.rect(hip-4+step,23,4,4,'woodDark');p.rect(hip+1-step,24,4,4,'woodDark');
  p.line(hip-4+step,25,hip-2+step,25,'woodShade');
  p.line(hip+1-step,26,hip+3-step,26,'woodShade');
  p.ellipse(16,19,7,6,'parkaDark');p.ellipse(east?17:14,18,6,6,'parka');
  p.line(east?20:11,18,east?20:11,23,'parkaLight');
  p.rect(pack-2,15,5,8,'rustDark');p.rect(pack-1,16,3,5,'rust');
  p.line(pack-1,16,pack+1,16,'rustEdge');
  // Far arm tucked behind the coat; near mitten swings along the travel axis.
  p.ellipse(east?20:11,18-step,2,3,'furDark');
  p.ellipse(16-step,20,3,4,'parkaDark');p.ellipse(16-step,22,2,2,'fur');
  p.line(15-step,19,16-step,20,'parkaLight');
  p.ellipse(16,11,8,7,'furDark');p.ellipse(15,10,8,6,'fur');
  p.ellipse(14,9,6,5,'furLight');
  p.ellipse(east?14:17,10,5,5,'parkaDark');p.ellipse(east?13:16,9,4,4,'parka');
  p.line(12,6,16,6,'parkaLight');
  if(!rear){
    p.rect(face-2,11,4,5,'woodShade');p.rect(face-1,11,3,4,'woodEdge');
    p.dot(east?face:face-1,12,'ink');
    p.rect(east?face+2:face-3,13,2,2,'woodEdge');
    p.dot(east?face+1:face-1,16,'woodDark');
    p.line(east?19:12,16,east?21:10,17,'fur');
  }else{
    // A turned-away hood rim and cheek sliver, not a sideways whole body.
    p.line(face-1,11,face-1,14,'fur');p.dot(face,14,'woodEdge');
    p.rect(east?10:18,19,5,4,'rustDark');p.line(east?11:19,19,east?13:21,19,'rust');
  }
  p.dot(east?19:12,19+idle,'furDark');
}
// Village characters share the native hood/body proportions of the original villagers.
function villagePerson(target, frame) {
  if(frame.id==='fisherman'){
    if(['S','SE','SW'].includes(frame.direction)){fishermanFront(target,frame);return;}
    if(['E','W','NE','NW'].includes(frame.direction)){fishermanSide(target,frame);return;}
    // North is the original directly authored rear view (angle zero below).
  }
  const p = new Pixels(32,32);
  const angle = ['N','NE','E','SE','S','SW','W','NW'].indexOf(frame.direction) * Math.PI / 4;
  const point = (x,y) => [x,y];
  const dot = (x,y,c) => p.dot(...point(x,y),c);
  const rect = (x,y,w,h,c) => {for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)dot(xx,yy,c);};
  const ellipse=(x,y,rx,ry,c)=>{for(let yy=y-ry;yy<=y+ry;yy++)for(let xx=x-rx;xx<=x+rx;xx++)if(((xx-x)/rx)**2+((yy-y)/ry)**2<=1)dot(xx,yy,c);};
  const line=(x,y,xx,yy,c)=>p.line(...point(x,y),...point(xx,yy),c);
  const seller=frame.id==='fish-seller', walk=frame.animation==='walk';
  const stride=walk?[0,2,0,-2][frame.index]:0, gesture=walk?stride:frame.index%2;
  const coat=seller?'pine':'parka',dark=seller?'pineDark':'parkaDark',light=seller?'pineLight':'parkaLight';
  rect(11,22+stride,4,4,'woodDark');rect(18,22-stride,4,4,'woodDark');
  rect(11,22+stride,3,1,'woodLight');rect(18,22-stride,3,1,'woodLight');
  ellipse(16,18,8,7,dark);ellipse(15,17,7,6,coat);
  line(10,16,11,21,light);line(15,18,16,24,dark);line(17,22,20,21,light);
  ellipse(7,18-gesture,2,3,'furDark');ellipse(24,18+gesture,2,3,'furDark');
  ellipse(16,11,8,7,'furDark');ellipse(15,10,8,6,'fur');ellipse(14,9,6,5,'furLight');
  ellipse(16,10,5,4,dark);ellipse(15,9,4,3,coat);line(13,7,16,7,light);
  dot(10,13,'furLight');dot(20,13,'furLight');
  if(seller){rect(12,20,9,4,'wood');line(12,20,20,20,'woodLight');line(13,22,18,22,'iceLight');dot(19,22,'ink');}
  else {rect(13,21,6,3,'rustDark');line(14,21,17,21,'rust');}
  // Inverse nearest-pixel sampling keeps diagonal silhouettes solid, with no pinholes.
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    const sx=Math.round(16+(x-16)*Math.cos(angle)+(y-16)*Math.sin(angle));
    const sy=Math.round(16-(x-16)*Math.sin(angle)+(y-16)*Math.cos(angle));
    if(sx>=0&&sy>=0&&sx<32&&sy<32)target.image.data.set(p.image.data.subarray((sy*32+sx)*4,(sy*32+sx)*4+4),(y*32+x)*4);
  }
}
function villageProp(p,frame) {
  const id=frame.id;
  if(id==='village-snowbank') {
    const rnd=random(591+frame.index*791),points=[];
    for(let i=0;i<18;i++){const a=i*Math.PI/9,r=.82+rnd()*.18;points.push([Math.round(32+Math.cos(a)*27*r),Math.round(23+Math.sin(a)*18*r)]);}
    p.poly(points.map(([x,y])=>[x+1,y+2]),'snowShade');p.poly(points,'snow');
    p.poly(points.map(([x,y])=>[Math.round(30+(x-32)*.84),Math.round(21+(y-23)*.74)]),'snow');
    p.poly(points.slice(8,17).map(([x,y])=>[x-1,y-1]).concat([[32,20],[18,21]]),'snowLight');
    p.line(12,29,19,32,'snowShade');p.line(19,32,32,33,'snowShade');
    if(frame.index%2){p.line(41,15,49,17,'snowShade');p.line(47,29,50,27,'snowShade');}
  } else if(id==='village-workshop'||id==='village-market'||id==='village-research') {
    cabin(p);
    // Distinct rooftop material and work apron, with clear overhead silhouettes.
    if(id==='village-market') {
      p.rect(9,49,53,15,'woodDark');
      for(let x=10;x<61;x+=8)p.rect(x,49,7,10,x%16<8?'rustDark':'furDark');
      p.line(10,49,60,49,'woodLight');p.rect(11,60,48,3,'wood');
      for(let x=14;x<56;x+=12){p.ellipse(x,61,4,1,'iceLight');p.dot(x+3,61,'ink');}
    }
    if(id==='village-workshop') {
      p.rect(9,51,22,12,'woodDark');p.rect(10,52,20,9,'wood');
      for(let x=13;x<29;x+=5)p.line(x,53,x,61,'woodShade');
      p.line(39,51,59,60,'woodLight');p.poly([[56,56],[61,58],[61,62],[57,61]],'woodEdge');
    }
    if(id==='village-research') {
      p.rect(9,49,22,14,'woodDark');p.rect(11,51,18,9,'pineDark');
      p.poly([[13,55],[19,53],[24,55],[27,53],[26,58],[23,56],[18,58]],'ice');
      p.rect(39,53,13,9,'woodDark');p.rect(40,53,11,7,'snowLight');p.line(45,53,45,59,'wood');
    }
  } else if(id.startsWith('village-sign')) {
    p.rect(11,5,3,19,'woodDark');p.rect(12,6,1,17,'woodLight');
    p.rect(3,3,20,16,'woodDark');p.rect(4,4,18,13,'wood');p.line(5,4,21,4,'woodEdge');
    if(id.endsWith('coin')) {p.ellipse(13,10,5,5,'amberDark');p.ellipse(12,9,4,4,'amber');p.line(11,6,11,11,'lamp');p.dot(14,12,'woodLight');}
    if(id.endsWith('rod')) {p.line(7,14,17,6,'woodEdge');p.line(17,6,19,12,'ice');p.ellipse(10,12,2,2,'rockDark');p.dot(10,12,'iceLight');}
    if(id.endsWith('book')) {p.rect(7,6,12,8,'woodDark');p.rect(8,6,10,7,'snowLight');p.line(13,7,13,12,'wood');p.line(9,9,11,9,'iceDark');p.line(15,8,17,8,'iceDark');}
  } else if(id==='village-woodpile') {
    for(let row=0;row<3;row++)for(let i=0;i<3;i++) {
      const x=3+i*9+row%2,y=4+row*6;
      p.rect(x,y,8,5,'woodDark');p.rect(x+1,y,6,3,'wood');p.line(x+1,y,x+6,y,'woodLight');p.dot(x+6,y+2,'woodEdge');
    }
    p.poly([[3,3],[29,3],[28,6],[22,7],[17,5],[10,6],[3,5]],'snow');
  } else if(id==='village-fish-crate') {
    p.rect(3,3,25,19,'woodDark');p.rect(4,4,23,15,'woodShade');
    for(let y=5;y<19;y+=4)p.line(5,y,26,y,'wood');
    for(let y=7;y<18;y+=5){p.ellipse(14,y,7,2,'ice');p.line(9,y-1,17,y-1,'iceLight');p.dot(9,y,'ink');p.poly([[20,y],[24,y-2],[24,y+2]],'wave');}
    p.line(4,4,26,4,'woodLight');p.line(4,20,26,20,'woodLight');
  }
}

function settlementBuilding(p,frame) {
  const roof=(x,y,w,h,color='wood')=>{
    p.rect(x+2,y+3,w,h,'snowDeep');p.rect(x,y,w,h,'woodDark');p.rect(x+2,y+2,w-4,h-4,color);
    for(let row=y+5;row<y+h-3;row+=5){p.line(x+3,row,x+w-4,row,'woodShade');p.line(x+4,row-1,x+w-6,row-1,'woodLight');}
    p.line(x+Math.floor(w*.52),y+2,x+Math.floor(w*.52),y+h-3,'woodDark');
    p.poly([[x+1,y+1],[x+w-3,y+1],[x+w-3,y+7],[x+w-12,y+11],[x+w-19,y+8],[x+w-27,y+14],[x+14,y+10],[x+2,y+16]],'snowShade');
    p.poly([[x+1,y],[x+w-3,y],[x+w-4,y+5],[x+w-12,y+8],[x+w-20,y+6],[x+w-27,y+11],[x+14,y+7],[x+1,y+13]],'snow');
    p.line(x+2,y,x+w-5,y,'snowLight');
  };
  const light=(x,y,w=12,h=9)=>{p.rect(x,y,w,h,'woodDark');p.rect(x+2,y+2,w-4,h-4,'iceDark');p.rect(x+2,y+2,w-5,2,'ice');p.line(x+w/2,y+1,x+w/2,y+h-2,'woodShade');};
  const chimney=(x,y)=>{p.rect(x+2,y+2,10,12,'woodDark');p.rect(x,y,10,11,'rockDark');p.rect(x+2,y+2,6,6,'ink');p.line(x+1,y,x+8,y,'snowLight');};
  if(frame.id==='village-igloo'){
    // Circular roof seen straight down. Radial snow blocks and a short entry tunnel.
    p.ellipse(39,37,33,30,'snowDeep');p.ellipse(37,34,33,29,'snowShade');p.ellipse(36,32,31,27,'snow');
    p.ellipse(32,27,24,20,'snowLight');
    for(const radius of [11,21,29])for(let i=0;i<36;i++){
      const a=i*Math.PI/18;
      if(i%9!==0)p.dot(37+Math.cos(a)*radius,33+Math.sin(a)*radius*.87,'snowShade');
    }
    for(let i=0;i<12;i++){const a=i*Math.PI/6;p.line(37+Math.cos(a)*22,33+Math.sin(a)*19,37+Math.cos(a)*29,33+Math.sin(a)*25,'snowShade');}
    p.poly([[61,37],[87,41],[90,58],[60,58]],'snowDeep');p.poly([[60,36],[86,39],[88,55],[59,54]],'snow');
    p.line(64,37,65,53,'snowShade');p.line(72,38,73,53,'snowShade');p.line(80,40,81,53,'snowShade');
    p.rect(85,43,4,9,'woodDark');p.rect(85,45,2,5,'woodShade');
    p.rect(42,14,6,7,'iceDark');p.rect(43,15,4,4,'iceDark');p.dot(43,15,'ice');
    p.ellipse(29,31,3,3,'snowShade');p.ellipse(28,30,2,2,'snow');
  }else if(frame.id==='village-market'){
    // A low fish shack with a broad striped canvas market canopy and open work yard.
    roof(7,7,55,48);chimney(43,13);light(17,31,17,10);
    p.rect(63,15,25,35,'woodDark');p.rect(65,17,21,30,'pineDark');
    for(let y=20;y<46;y+=6)p.line(66,y,84,y,'pine');
    p.rect(6,47,86,22,'woodDark');
    for(let x=8;x<91;x+=7)p.rect(x,48,6,15,Math.floor(x/7)%2?'rustDark':'furDark');
    p.line(8,48,88,48,'woodLight');p.line(8,63,88,63,'woodDark');
    p.rect(9,65,78,5,'wood');p.line(10,65,86,65,'woodEdge');
    for(let x=16;x<81;x+=14){p.ellipse(x,67,5,1,'iceLight');p.dot(x-4,67,'ink');}
    for(const x of [7,88]){p.rect(x,64,3,9,'woodDark');p.dot(x,64,'snowLight');}
  }else if(frame.id==='village-workshop'){
    // Long asymmetric workshop with an attached tool lean-to and exposed workbench.
    roof(7,8,79,43);roof(7,47,31,25);chimney(62,15);light(43,32,24,11);
    p.rect(42,53,48,13,'woodDark');p.rect(44,54,44,9,'wood');p.line(44,54,87,54,'woodEdge');
    for(let x=48;x<83;x+=11){p.line(x,55,x+5,61,'rockDark');p.dot(x+5,61,'iceLight');}
    p.line(82,17,86,42,'woodLight');p.poly([[83,32],[88,34],[89,44],[85,42]],'woodEdge');
    p.rect(13,53,18,9,'pineDark');p.line(14,54,28,58,'woodLight');p.line(16,59,27,54,'ice');
  }else if(frame.id==='village-research'){
    // Offset archive cabin and glazed specimen annex give Ivo a distinct L footprint.
    roof(8,8,48,59,'pine');roof(53,29,36,32);
    p.rect(60,34,22,16,'woodDark');p.rect(62,36,18,12,'iceDark');p.line(62,36,77,36,'iceLight');
    p.line(70,36,70,47,'woodLight');p.line(62,42,79,42,'woodLight');chimney(39,14);light(17,41,16,10);
    p.rect(15,61,39,10,'woodDark');p.rect(17,62,35,6,'wood');
    for(let x=20;x<48;x+=8){p.rect(x,63,5,4,'snowLight');p.line(x+2,63,x+2,66,'wood');}
    p.rect(64,57,17,12,'woodDark');p.rect(66,59,13,7,'pineDark');p.poly([[67,62],[71,60],[75,62],[77,60],[77,65],[74,63],[70,64]],'ice');
  }
}
function settlementDetail(p,frame){
 const id=frame.id;
 if(id==='village-lamp'||id==='village-lamp-light'){
  if(id==='village-lamp'){
    // Snow-dusted octagonal footing, timber shaft, iron bracket and lantern cap.
    p.poly([[9,18],[15,18],[17,21],[15,25],[9,25],[7,22]],'rockDark');p.line(9,18,14,18,'snow');
    p.rect(10,12,4,10,'woodDark');p.line(10,13,10,20,'woodLight');p.rect(6,11,12,3,'rockDark');
    p.poly([[8,4],[15,4],[18,7],[18,13],[15,16],[8,16],[5,13],[5,7]],'ink');
    p.rect(7,6,9,8,'rockDark');p.rect(8,7,7,6,'iceDark');p.rect(10,6,2,9,'woodDark');p.rect(7,9,9,2,'woodDark');
    p.line(8,4,14,4,'snowLight');p.dot(6,6,'snow');p.rect(10,3,3,2,'woodDark');
  }else{
    for(const[x,y]of[[8,7],[12,7],[8,11],[12,11]]){p.rect(x,y,3,2,'amber');p.dot(x,y,'lamp');}
  }
 }else if(id==='village-bench'){
  p.rect(5,5,30,3,'woodDark');p.rect(7,6,3,13,'woodDark');p.rect(29,6,3,13,'woodDark');
  for(let y=8;y<17;y+=4){p.rect(4,y,32,3,'wood');p.line(5,y,34,y,'woodLight');}p.rect(5,7,11,1,'snow');
 }else if(id==='village-sled'){
  p.line(5,5,41,5,'woodDark');p.line(5,23,41,23,'woodDark');p.line(3,8,5,5,'woodLight');p.line(3,20,5,23,'woodLight');
  for(let x=10;x<39;x+=5)p.rect(x,6,3,17,'wood');p.rect(15,8,18,13,'pineDark');p.rect(16,9,16,11,'pine');
  p.line(14,10,34,18,'furDark');p.line(16,18,33,10,'furDark');p.rect(17,9,10,2,'snow');
 }else if(id==='village-drying-rack'||id==='village-fabric-line'){
  const right=id==='village-fabric-line'?51:43;
  p.rect(3,4,3,20,'woodDark');p.rect(right,4,3,20,'woodDark');p.line(5,9,right,11,'furDark');
  if(id==='village-fabric-line')for(let i=0;i<3;i++){const x=10+i*13;p.poly([[x,10],[x+10,11],[x+9,22],[x+2,20]],i%2?'parkaDark':'rust');p.line(x+2,12,x+2,17,'furDark');}
  else for(let i=0;i<5;i++){const x=10+i*7;p.ellipse(x,16,2,5,i%2?'ice':'furDark');p.line(x,11,x,20,'woodShade');p.dot(x,13,'ink');}
  p.line(3,4,5,4,'snowLight');p.line(right,4,right+2,4,'snowLight');
 }else if(id==='village-firepit'){
  p.ellipse(14,14,11,10,'snowDeep');p.ellipse(14,14,8,7,'woodDark');
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9;p.ellipse(14+Math.cos(a)*9,14+Math.sin(a)*8,3,2,'rock');p.dot(13+Math.cos(a)*9,13+Math.sin(a)*8,'rockLight');}
  p.line(9,10,19,18,'wood');p.line(9,18,19,10,'woodLight');
  p.ellipse(14,14,6,5,'rustDark');
  const sway=[0,1,2,0,-1,-2][frame.index%6];
  p.poly([[8,17],[9,12],[11+sway,7],[12+sway,12],[15,10],[18-sway,6],[18,12],[21,15],[18,19],[12,20]],'rust');
  p.poly([[10,16],[12+sway,10],[14,14],[17-sway,9],[18,16],[15,19]],'rustLight');
  p.poly([[12,16],[13,12],[15,15],[17,13],[17,17],[14,19]],'amber');
  p.line(13,16,14,18,'lamp');p.dot(17,11+frame.index%2,'amber');
 }else if(id==='village-rope'){
  for(const r of [8,5,2]){p.ellipse(11,11,r,r,'woodDark');p.ellipse(11,10,r-1,r-1,'furDark');if(r>2)p.ellipse(11,10,r-2,r-2,'woodShade');}p.line(17,13,20,20,'fur');
 }else if(id==='village-cart'){
  p.rect(6,5,24,22,'woodDark');p.rect(8,7,20,17,'wood');for(let x=10;x<28;x+=5)p.line(x,7,x,23,'woodShade');
  p.rect(3,8,3,6,'rockDark');p.rect(3,19,3,6,'rockDark');p.rect(30,8,3,6,'rockDark');p.rect(30,19,3,6,'rockDark');
  p.line(29,9,37,7,'woodLight');p.line(29,23,37,25,'woodLight');p.rect(10,8,8,5,'snow');
 }else if(id==='village-storage'){
  p.rect(4,5,39,30,'woodDark');p.rect(6,7,35,25,'woodShade');for(let y=9;y<32;y+=5)p.line(7,y,40,y,'wood');
  p.poly([[5,5],[41,5],[41,14],[35,17],[28,12],[21,15],[16,11],[5,13]],'snow');p.line(6,5,39,5,'snowLight');p.rect(28,22,10,10,'woodDark');p.dot(30,26,'amber');
 }
}

function settlementLights(p,frame){
 const id=frame.id.replace('-lights','');
 const rects=id==='village-market'?[[17,31,17,10]]:id==='village-workshop'?[[43,32,24,11]]:id==='village-research'?[[17,41,16,10]]:[];
 for(const[x,y,w,h]of rects){p.rect(x+2,y+2,w-4,h-4,'amberDark');p.rect(x+2,y+2,w-5,2,'lamp');p.line(x+w/2,y+1,x+w/2,y+h-2,'woodShade');}
 if(id==='village-igloo'){p.rect(43,15,4,4,'amber');p.dot(43,15,'lamp');p.rect(85,45,2,5,'amber');p.dot(85,45,'lamp');}
}

function waterShadow(p,frame) {
 const shape=Math.floor(frame.index/3), tail=frame.index%3-1;
 const large=shape===1, fast=shape===2;
 const x=24,y=16,rx=large?14:fast?11:8,ry=large?5:3;
 p.ellipse(x,y,rx,ry,'deep');
 p.poly([[x-rx+2,y],[x-rx-5,y-4+tail],[x-rx-4,y+tail],[x-rx-5,y+4+tail]],'deep');
 p.poly([[x-2,y-ry+1],[x+3,y-ry-3],[x+4,y]],'deep');
 p.line(x-4,y-2,x+rx-3,y-1,'waterShade');
}

function requestBoard(p) {
 p.rect(6,20,4,10,'woodDark');p.rect(28,20,4,10,'woodDark');
 p.rect(3,5,32,20,'woodDark');p.rect(5,7,28,15,'wood');
 p.line(5,13,32,13,'woodShade');p.line(5,20,32,20,'woodShade');
 p.rect(2,3,34,3,'snowShade');p.rect(4,2,29,2,'snow');
 for(const[x,y]of [[8,9],[20,10]]){p.rect(x,y,9,11,'fur');p.rect(x+1,y+1,7,8,'furLight');p.dot(x+4,y,'amber');p.line(x+2,y+4,x+6,y+4,'woodShade');p.line(x+2,y+6,x+5,y+6,'woodShade');}
 p.rect(6,28,5,2,'snowShade');p.rect(28,28,5,2,'snowShade');
}

function kayakGear(p,frame) {
 const part=frame.id.replace('kayak-gear-',''),tier=part==='speed'?Math.floor(frame.index/5):frame.index;
 if(part==='cargo'){
  p.rect(18,41,13,9,'woodDark');p.rect(19,42,11,7,tier===0?'wood':'parka');
  p.line(19,42,29,42,tier===0?'woodEdge':'parkaLight');
  if(tier===0){p.line(19,45,29,45,'woodLight');p.line(19,47,29,47,'woodShade');}
  else {p.rect(20,43,9,4,tier===1?'wood':'parkaDark');p.line(20,43,28,43,'woodLight');}
  p.line(22,42,22,48,'furDark');p.line(27,42,27,48,'furDark');
  if(tier===2){p.rect(20,51,8,3,'parkaDark');p.line(21,51,26,51,'parkaLight');p.dot(24,52,'fur');}
 }
 if(part==='rod'){
  p.line(30,9,31,32,'woodDark');p.line(30,10,31,29,tier===0?'woodEdge':tier===1?'ice':'pineLight');
  p.rect(30,28,3,6,'woodDark');p.dot(30,14,'fur');if(tier>0)p.dot(30,20,'iceLight');
  if(tier===2){p.rect(30,29,3,3,'rockDark');p.dot(31,29,'iceLight');}
 }
 if(part==='line'){
  p.ellipse(21,12,3,2,'ink');p.ellipse(21,11,2,2,tier===0?'furDark':tier===1?'iceShade':'iceLight');p.dot(21,11,'woodDark');
  if(tier>0)p.line(18,10,18,14,'fur');if(tier===2)p.dot(23,10,'lamp');
 }
 if(part==='reel'){
  p.rect(30,35,4,4,'ink');p.rect(30,35,3,3,tier===0?'rockLight':tier===1?'woodEdge':'amber');p.dot(31,36,'woodDark');p.line(33,37,34,37,'wood');
  if(tier>0)p.dot(30,35,'iceLight');if(tier===2)p.dot(34,36,'lamp');
 }
 if(part==='bait'){
  p.rect(23,7,4,5,'woodDark');p.rect(24,8,2,3,tier===0?'wood':tier===1?'rustLight':'pineLight');p.line(23,7,26,7,'fur');
  if(tier>0)p.dot(24,9,'amber');if(tier===2)p.dot(25,10,'furLight');
 }
 if(part==='speed'){
  p.line(16,38,13,46,'woodDark');p.line(31,38,34,46,'woodDark');
  p.poly([[11,41],[13,39],[15,43],[14,50],[11,51]],'rockDark');p.line(11,42,11,48,'iceShade');
  p.poly([[33,42],[35,41],[37,45],[36,50],[33,49]],'rockDark');p.line(34,43,35,48,'iceShade');
  const pose=frame.index%5,tilt=[0,-2,0,2,0][pose],color=tier===0?'woodEdge':tier===1?'iceShade':'iceLight';
  if(pose===4){p.line(29,14,29,37,color);p.rect(27,38,4,5,color);p.line(27,38,30,38,'furLight');}
  else {
   p.rect(3,Math.round((20-tilt)*1.5),5,3,color);p.rect(40,Math.round((21+tilt)*1.5),4,3,color);
   if(tier>0){p.line(4,Math.round((20-tilt)*1.5),7,Math.round((20-tilt)*1.5),'furLight');p.dot(42,Math.round((21+tilt)*1.5),'furLight');}
  }
  if(tier>0){p.line(22,5,20,9,'rockLight');p.line(26,5,28,9,'rockDark');}
  if(tier===2){p.line(20,50,23,54,'iceShade');p.line(28,50,25,54,'rockLight');}
 }
}

export function render(definition, frame) {
  const p=new Pixels(...definition.frameSize);
  const functions={remoteNpcArt,navigationSignArt,arcticWildlifeArt,villageLightArt,villageExpansionArt,rosterArt,corgiArt,ecosystemFish,villageYardArt,explorationArt,modulesArt,toolsArt,traversalArt,microLandmark,environmentArt,ecologyLandmark,kayakGear,requestBoard,waterShadow,mapArt,kayak,water,snow,shore,cabin,dock,ice,rock,shrub,vegetation,wildlife:wildlifePoses,'fish-spot':fishSpot,icon,hubNpc,fishPortrait,blueIce,gearIcon,hubProp,uiSkin,villagePerson,villageProp,settlementBuilding,settlementDetail,settlementLights};
  const fn=functions[definition.renderer];
  if(!fn) throw new Error(`Unknown pixel renderer: ${definition.renderer}. Use provider agent/import for new artwork or author a renderer.`);
  if (definition.renderer === 'kayak' && definition.frameSize[0] === 48) {
    // Redraw at native pixel density, rather than enlarging pixels at runtime.
    const n = v => Math.round(v * 1.5);
    const pen = {
      rect: (x,y,w,h,c) => p.rect(n(x),n(y),n(x+w)-n(x),n(y+h)-n(y),c),
      dot: (x,y,c) => p.dot(n(x),n(y),c),
      line: (x,y,xx,yy,c) => p.line(n(x),n(y),n(xx),n(yy),c),
      ellipse: (x,y,rx,ry,c) => p.ellipse(n(x),n(y),n(rx),n(ry),c),
      poly: (points,c) => p.poly(points.map(([x,y])=>[n(x),n(y)]),c),
    };
    fn(pen,{...frame,id:definition.id});
  } else fn(p,{...frame,id:definition.id});
  if(['fish-seller','merchant','tools-keeper','journal-keeper'].includes(definition.id)){
    const g=frame.index%2;
    if(frame.animation==='warm'){
      p.ellipse(13,20,2,2,'fur');p.ellipse(18,20-g,2,2,'furDark');p.line(14,20,17,20-g,'furLight');
    }else if(frame.animation==='work'){
      if(definition.id==='journal-keeper'){p.rect(12,20,10,6,'woodDark');p.rect(13,20,8,5,'snowLight');p.line(17,20,17,24,'wood');p.line(20,20,22,17+g,'ink');}
      else if(definition.id==='fish-seller'){p.rect(10,20,13,5,'wood');p.line(11,20,21,20,'woodLight');p.line(13+g,22,19+g,22,'iceLight');p.dot(19+g,22,'ink');}
      else{p.line(12,22,20,20-g,'rockDark');p.rect(19,18-g,4,3,'iceShade');p.ellipse(12,22,2,2,'fur');}
    }
  }
  if(definition.renderer==='ice')iceMaterial(p.image,frame.index);
  return p.image;
}
