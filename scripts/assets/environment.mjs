// Original material studies, using the production palette and native pixel clusters.
import { random } from './pixels.mjs';
export function environmentArt(p,f){
 const k=f.index,r=random(493+k*113),w=p.image.width,h=p.image.height;
 if(f.id==='snow-detail'){
  for(let i=0;i<(k===2?4:7);i++){
   const x=10+r()*68,y=10+r()*44,n=5+r()*14;
   if(k===2){p.poly([[x,y],[x+n,y-2],[x+n+5,y+3],[x+4,y+6]],'snowShade');p.line(x+2,y,x+n,y-1,'iceLight');}
   else if(k===3){p.rect(x,y,2,3,'snowShade');p.rect(x+5,y+5,2,3,'snowShade');}
   else {p.line(x,y,x+n,y-(k===1?3:1),'snowShade');p.line(x-1,y-1,x+n-2,y-(k===1?4:2),'snowLight');if(k===4)p.line(x+2,y+2,x+n-3,y+1,'snowDeep');}
  }return;
 }
 const shapes=[[[4,17],[9,7],[24,4],[34,11],[39,24],[28,34],[12,32]],[[5,23],[17,4],[28,10],[38,30],[22,35],[11,30]],[[3,18],[12,11],[30,10],[39,20],[32,28],[14,30]],[[8,8],[24,4],[36,15],[30,32],[17,35],[5,24]],[[4,20],[13,5],[21,11],[29,6],[39,22],[30,34],[9,30]],[[7,12],[24,7],[36,17],[32,29],[19,34],[4,25]]];
 const pts=shapes[k%6],ice=k===3||k===4;
 p.poly(pts,ice?'iceDark':'rockDark');
 p.poly(pts.map(([x,y])=>[21+(x-21)*.87,19+(y-19)*.83]),ice?'ice':'rock');
 p.poly([[9,15],[16,8],[24,8],[22,19],[13,24],[7,22]],ice?'iceLight':'rockLight');
 p.poly([[22,19],[30,12],[34,21],[29,29],[19,30]],ice?'iceShade':'rockDark');
 p.line(22,12,20,21,ice?'iceDark':'ink');p.line(20,21,25,26,ice?'iceDark':'rock');
 if(k!==1){p.poly([[8,13],[15,7],[24,6],[29,12],[24,15],[18,13],[13,19],[7,18]],'snow');p.line(13,9,22,7,'snowLight');}
 if(k===2||k===5){p.poly([[5,25],[14,26],[23,24],[34,27],[31,33],[13,34]],'snowShade');p.line(9,27,20,27,'snow');}
}

export function microLandmark(p,f){
 if(f.id==='fractured-ground'){
  p.poly([[5,29],[27,9],[52,14],[77,5],[104,26],[97,55],[72,79],[38,72],[12,60]],'snowShade');
  p.poly([[10,29],[30,16],[51,20],[77,12],[98,28],[90,52],[69,71],[39,65],[17,55]],'iceLight');
  for(const points of [[[20,27],[40,36],[48,53],[67,60]],[[40,36],[57,29],[74,34],[91,28]],[[48,53],[31,57]],[[74,34],[70,49],[82,58]]])for(let i=1;i<points.length;i++){p.line(...points[i-1],...points[i],'iceShade');p.line(points[i-1][0],points[i-1][1]-1,points[i][0],points[i][1]-1,'snow');}
  p.poly([[9,28],[29,11],[51,16],[39,24],[26,22],[17,34]],'snow');return;
 }

 if(f.id==='abandoned-shelter'){
  // Collapsed roof seen from above, exposed rafters and a snow-filled work apron.
  p.poly([[10,21],[57,12],[76,29],[68,61],[22,69],[7,48]],'snowShade');
  p.poly([[15,19],[57,15],[67,49],[24,59]],'woodDark');
  for(let i=0;i<6;i++){p.line(19+i*7,20,26+i*6,55,'wood');p.line(20+i*7,21,27+i*6,54,'woodLight');}
  p.poly([[15,18],[55,14],[57,28],[46,26],[40,38],[21,36]],'snow');p.line(18,19,49,16,'snowLight');
  p.line(22,42,59,28,'woodDark');p.line(22,43,59,29,'woodLight');
  p.poly([[44,46],[69,51],[74,58],[49,56]],'snow');
  p.rect(12,62,17,3,'woodDark');p.line(16,60,24,59,'snowLight');return;
 }
 // A split glacier slab: three disjoint, angular plates and exposed dark seams.
 for(const [x,y,w,h]of [[8,20,30,53],[37,8,28,61],[66,29,23,47]]){
  p.poly([[x,y+7],[x+w-8,y],[x+w,y+13],[x+w-5,y+h],[x+3,y+h-5]],'rockDark');
  p.poly([[x+2,y+7],[x+w-9,y+2],[x+w-3,y+13],[x+w-8,y+h-6],[x+5,y+h-9]],'ice');
  p.poly([[x+2,y+7],[x+w-9,y+2],[x+w-5,y+12],[x+10,y+18],[x+3,y+16]],'snow');
  p.line(x+10,y+22,x+15,y+39,'iceDark');p.line(x+15,y+39,x+11,y+47,'iceLight');
 }
}
