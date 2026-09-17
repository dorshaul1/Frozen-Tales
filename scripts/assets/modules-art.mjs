export function modulesArt(p,f){
 if(f.id==='gear-insulated'||f.id==='kayak-gear-insulated'){
 const x=f.id==='gear-insulated'?4:17,y=f.id==='gear-insulated'?5:42;
 p.rect(x,y,15,11,'woodDark');p.rect(x+1,y+1,13,9,'fur');p.rect(x+2,y+3,11,5,'iceShade');p.line(x+1,y+2,x+13,y+2,'snow');p.rect(x+6,y+4,3,4,'woodDark');return;
 }
 if(f.id==='gear-anchor'||f.id==='kayak-gear-anchor'){
  const x=f.id==='gear-anchor'?12:34,y=f.id==='gear-anchor'?5:35;
  p.ellipse(x,y,3,3,'rockDark');p.ellipse(x,y,1,1,'iceLight');p.line(x,y+3,x,y+13,'iceShade');p.line(x-5,y+5,x+5,y+5,'iceLight');
  p.line(x-7,y+10,x-4,y+14,'rockDark');p.line(x-4,y+14,x,y+16,'iceShade');p.line(x,y+16,x+5,y+13,'iceLight');p.line(x+5,y+13,x+7,y+10,'iceShade');return;
 }
 if(f.id==='toolbelt'){
  p.rect(1,1,196,33,'woodDark');p.rect(2,2,194,31,'wood');p.rect(4,4,190,27,'parkaDark');p.line(5,4,192,4,'woodEdge');
  for(const x of [4,191]){p.rect(x,7,2,2,'amber');p.rect(x,26,2,2,'woodLight');}return;
 }
 if(f.id==='handheld-tools'){
  const n=Math.floor(f.index/2),y=f.index%2;
  p.rect(5,7+y,3,3,'fur');
  if(n===0){p.rect(7,3+y,5,7,'woodDark');p.rect(8,4+y,3,4,'lamp');p.line(8,2+y,10,2+y,'iceShade');}
  if(n===1){p.rect(6,3+y,7,7,'rockDark');p.rect(7,4+y,5,4,'pine');p.line(8,6+y,10,5+y,'iceLight');}
  if(n===2){p.rect(5,3+y,3,7,'rockDark');p.rect(10,3+y,3,7,'rockDark');p.line(7,6+y,11,6+y,'woodEdge');p.dot(6,3+y,'iceLight');p.dot(11,3+y,'iceLight');}
  if(n===3){p.line(7,3+y,7,11+y,'woodEdge');p.line(8,4+y,12,10+y,'fur');p.rect(11,10+y,2,3,'iceShade');}
  if(n===4){p.rect(6,4+y,7,7,'woodDark');p.rect(7,5+y,5,5,'rust');p.line(7,6+y,11,6+y,'fur');}
  if(n===5){p.rect(4,3+y,10,8,'woodDark');p.rect(5,4+y,8,6,'fur');p.line(9,4+y,9,9+y,'woodShade');p.dot(6,6+y,'pine');}return;
 }
 if(['gear-binoculars','gear-probe','gear-guide'].includes(f.id)){
  if(f.id==='gear-binoculars'){for(const x of [4,14]){p.rect(x,5,6,15,'ink');p.rect(x+1,6,4,12,'pine');p.ellipse(x+3,6,3,3,'rockDark');p.line(x+1,5,x+4,5,'iceLight');}p.rect(9,10,6,4,'woodShade');}
  if(f.id==='gear-probe'){p.ellipse(9,8,6,5,'woodDark');p.ellipse(9,8,4,3,'fur');p.ellipse(9,8,2,2,'wood');p.line(14,8,18,17,'fur');p.rect(16,17,5,5,'rockDark');p.line(17,18,19,18,'iceLight');}
  if(f.id==='gear-guide'){p.rect(3,4,18,17,'woodDark');p.rect(4,5,16,14,'fur');p.line(12,5,12,18,'woodShade');p.ellipse(8,10,3,2,'pine');p.line(15,8,18,8,'wood');p.line(15,11,18,11,'wood');p.line(15,14,17,14,'wood');}return;
 }

 if(f.id.startsWith('rod-model-')){
  const n=Number(f.id.at(-1)),shaft=['wood','rust','iceShade','pine'][n];
  p.line(5,20,18,3,'ink');p.line(6,20,19,3,shaft);p.line(7,17,9,13,'woodLight');
  p.line(18,3,21,10,'fur');p.line(21,10,20,13,'iceLight');
  p.rect(4,18,4,4,'woodDark');p.line(5,19,7,19,'woodEdge');
  p.ellipse(10,15,3,3,'rockDark');p.ellipse(10,14,2,2,n>1?'amber':'iceShade');p.dot(10,14,'snow');
  for(let i=0;i<n;i++)p.dot(12+i*2,10-i*3,'lamp');
  if(n>1){p.rect(3,6,4,5,'woodDark');p.rect(4,7,2,3,shaft);p.dot(4,6,'amber');}return;
 }
 if(f.id==='gear-turbo'){
  p.rect(6,6,12,11,'ink');p.rect(7,7,10,8,'rust');p.rect(9,8,6,2,'rust');
  p.rect(9,3,6,4,'rockDark');p.line(10,3,14,3,'iceLight');
  p.rect(10,16,4,5,'iceShade');p.line(5,20,18,20,'woodDark');p.rect(4,19,5,3,'iceShade');p.rect(15,19,5,3,'iceLight');return;
 }
 if(f.id==='gear-hull'){
  p.poly([[6,4],[12,2],[18,4],[19,15],[12,22],[5,15]],'rockDark');
  p.poly([[7,5],[12,3],[17,5],[17,14],[12,20],[7,14]],'iceShade');
  p.line(12,4,12,18,'iceLight');p.line(8,7,16,7,'woodDark');p.line(8,13,16,13,'woodDark');p.dot(9,9,'amber');p.dot(15,15,'amber');return;
 }
 if(f.id==='kayak-gear-turbo'){
  p.rect(20,47,9,8,'ink');p.rect(21,48,7,5,'rust');p.line(22,49,26,49,'woodEdge');
  p.rect(22,54,5,3,'iceShade');p.line(19,56,29,56,'iceLight');p.rect(18,55,4,2,'rockDark');p.rect(27,55,4,2,'rockDark');return;
 }
 if(f.id==='kayak-gear-hull'){
  for(const x of [10,36]){p.line(x,22,x,39,'rockDark');p.line(x+1,23,x+1,38,'iceShade');for(const y of [24,36])p.dot(x+1,y,'iceLight');}
  p.line(12,39,15,46,'rockDark');p.line(35,39,32,46,'iceShade');return;
 }

 if(f.id==='workshop-service-dock'){
  // Three-sided timber slip, open to the river on its right.
  for(const [x,y,w,h] of [[1,1,97,9],[1,64,97,10],[1,10,19,54]]){
   p.rect(x,y,w,h,'woodDark');p.rect(x+1,y+1,w-2,h-2,'wood');
   if(w>h)for(let xx=x+3;xx<x+w-2;xx+=8){p.line(xx,y+1,xx,y+h-2,'woodShade');p.line(xx+1,y+2,xx+1,y+h-3,'woodLight');}
   else for(let yy=y+4;yy<y+h-2;yy+=8){p.line(x+1,yy,x+w-2,yy,'woodShade');p.line(x+3,yy+1,x+12,yy+1,'woodLight');}
  }
  for(const [x,y]of[[3,3],[91,3],[3,66],[91,66]]){p.rect(x,y,5,5,'woodDark');p.rect(x+1,y,3,2,'woodEdge');}
  // Fenders and repair tools stay beside the berth.
  p.ellipse(25,8,4,3,'rockDark');p.line(24,5,27,5,'fur');
  p.ellipse(78,65,4,3,'rockDark');p.line(76,63,79,63,'fur');
  p.rect(4,23,11,15,'woodDark');p.rect(5,24,9,12,'pine');p.line(7,25,12,33,'iceLight');
  p.line(5,48,15,40,'woodEdge');p.rect(12,39,5,3,'iceShade');
  p.line(32,2,38,2,'snow');p.line(62,71,75,71,'snowShade');return;
 }
 if(f.id==='module-card'){
  p.rect(1,1,208,110,'woodDark');p.rect(2,2,206,108,'woodLight');p.rect(4,4,202,104,'parkaDark');
  p.line(4,4,205,4,'woodEdge');p.line(6,37,203,37,'woodShade');
  for(const x of [3,204])for(const y of [3,106])p.rect(x,y,2,2,'amber');return;
 }
 if(f.id==='gear-mount'){
  p.line(5,21,18,4,'woodEdge');p.line(18,4,21,10,'fur');p.rect(8,13,9,6,'rockDark');p.rect(9,14,7,3,'iceShade');
  p.line(11,16,11,21,'ink');p.line(9,21,17,21,'wood');p.dot(12,15,'lamp');return;
 }
 const level=f.index+1;
 p.rect(32,29,6,5,'woodDark');p.rect(33,30,4,3,'iceShade');
 p.line(35,29,35,12,'woodEdge');p.line(35,12,38,9,'woodLight');p.line(38,9,40,20,'fur');
 p.ellipse(34,28,2,2,'rockDark');p.dot(34,27,'iceLight');
 if(level>1){p.line(32,34,29,40,'iceShade');p.rect(29,38,3,3,'woodDark');}
}
