export function ecologyLandmark(p,frame){
 const kind=frame.index;
 // Broken radial shelves and snow caps use different asymmetric contours.
 const silhouettes=[[[5,27],[19,13],[43,10],[59,18],[85,12],[104,30],[98,65],[77,83],[36,78],[12,60]],[[8,35],[24,13],[50,5],[76,11],[103,34],[105,61],[86,78],[53,89],[22,76]],[[4,38],[17,18],[38,9],[72,13],[96,28],[107,54],[87,77],[59,85],[28,79],[8,60]]];
 p.poly(silhouettes[kind],'rockDark');
 p.poly([[8,25],[23,12],[43,12],[58,21],[85,15],[100,31],[91,57],[70,70],[32,69],[13,53]],'iceDark');
 p.poly([[12,23],[25,15],[42,15],[58,25],[83,18],[97,31],[84,45],[66,58],[31,57],[16,44]],'ice');
 p.poly([[12,23],[25,13],[42,14],[58,22],[83,16],[97,29],[81,29],[67,35],[40,29],[22,33]],'snow');
 p.line(24,18,42,18,'snowLight');p.line(67,25,81,22,'snowLight');
 if(kind===0){ // Frozen cascade, seen overhead: blue ribbons over a rock lip.
  for(let i=0;i<5;i++){const x=29+i*10;p.poly([[x,34],[x+6,33],[x+4,65+i%2*7],[x-2,76],[x-4,60]],i%2?'iceLight':'ice');p.line(x+1,38,x-1,64,'snowLight');}
  p.ellipse(49,78,26,9,'iceDark');p.ellipse(47,76,22,6,'ice');p.line(32,74,58,75,'iceLight');
 }else if(kind===1){ // Deep crevasse inside a massive exposed ice arch.
  p.poly([[36,37],[56,31],[77,40],[74,62],[52,71],[33,60]],'deep');
  p.poly([[32,35],[40,28],[61,29],[80,38],[78,46],[61,36],[42,36],[33,48]],'iceLight');
  p.line(38,39,35,56,'ice');p.line(52,68,67,60,'iceDark');
 }else{ // Wind-carved cave and a drift spilling out of its mouth.
  p.poly([[31,46],[42,37],[64,40],[78,51],[66,67],[40,68]],'ink');
  p.poly([[24,45],[37,32],[64,34],[82,48],[76,55],[63,44],[42,43],[31,53]],'snow');
  p.poly([[38,66],[64,64],[72,77],[49,88],[24,80]],'snowShade');p.line(37,72,60,71,'snowLight');
 }
 for(const [x,y]of [[17,43],[83,52],[22,58]]){p.line(x,y,x+7,y+6,'iceDark');p.line(x+7,y+6,x+5,y+11,'iceLight');}
}
