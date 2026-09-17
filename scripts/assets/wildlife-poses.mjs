// Authored screen-space poses. No angle transform, canvas rotation or sprite mirroring.
// Profile, front, rear and quarter views have different anatomy and occlusion.
export function wildlifePoses(p,f){
 const cx=p.image.width/2,cy=p.image.height/2;
 const side=/E|W/.test(f.direction),sign=f.direction.includes('W')?-1:1;
 const front=f.direction.includes('S'),back=f.direction.includes('N'),quarter=side&&(front||back);
 const moving=['walk','swim'].includes(f.animation),rest=f.animation==='rest',forage=f.animation==='forage',alert=f.animation==='alert';
 const step=moving?[0,1,0,-1][f.index%4]:0;
 const blink=!moving&&f.index===1;
 const oval=(x,y,rx,ry,c)=>p.ellipse(cx+x,cy+y,rx,ry,c);
 const line=(x,y,a,b,c)=>p.line(cx+x,cy+y,cx+a,cy+b,c);
 const poly=(v,c)=>p.poly(v.map(([x,y])=>[cx+x,cy+y]),c);
 const dot=(x,y,c)=>p.dot(cx+x,cy+y,c);
 const eye=(x,y)=>{if(blink)line(x-1,y,x+1,y,'rockDark');else dot(x,y,'ink');};
 const id=f.id;
 if(id==='penguin'){
  const sway=step+(alert?1:0),headX=side?sign*(quarter?1:2):0;
  oval(-3+step,9,2,1,'amberDark');oval(3-step,9,2,1,'amberDark');
  poly([[-4,-3],[-7,1+sway],[-7,5+sway],[-4,3]],'ink');poly([[4,-3],[7,1-sway],[7,5-sway],[4,3]],'ink');
  oval(0,1,side?4:5,8,'ink');oval(-1,0,side?3:4,7,'deep');
  if(front||side&&!back){oval(side?sign:0,2,side&&!quarter?2:3,5,'snow');line(-1,0,-1,5,'snowLight');}
  else {line(-3,-1,-3,4,'rockDark');line(3,1,2,6,'snowShade');}
  oval(headX,-6,4,4,'ink');line(headX-2,-8,headX,-9,'rockDark');
  if(side){poly([[headX+sign*3,-7],[headX+sign*6,-5],[headX+sign*3,-4]],'amberDark');eye(headX+sign*2,-7);line(headX+sign,-3,headX+sign*2,-2,'snow');}
  else if(front){poly([[-1,-5],[0,-3],[2,-5]],'amberDark');eye(-2,-6);eye(2,-6);line(-3,-3,-2,-2,'snow');line(2,-2,3,-3,'snow');}
  else {line(-2+(blink?1:0),-9,1,-9,'rockDark');line(-2,-3,2,-3,'snowShade');}
  return;
 }
 // Small native gull: white head/breast, gray folded wings, dark flight tips.
 // The existing walk action is the airborne bird pose; no new behavior or frames.
 if(id==='bird'){
  if(moving){
   const flap=step*2;
   if(side){
    poly([[-3,0],[-6,-5-flap],[-2,-10-flap],[2,-7],[4,-1]],'snowShade');
    poly([[-2,1],[-6,6+flap],[0,10+flap],[3,6],[4,1]],'snow');
    line(-3,-8-flap,-2,-10-flap,'ink');line(-2,8+flap,0,10+flap,'rockDark');
   }else for(const wing of [-1,1]){
    poly([[wing*2,-2],[wing*6,-5-flap],[wing*11,flap],[wing*9,4+flap],[wing*4,3]],'snowShade');
    line(wing*3,-2,wing*7,-3-flap,'snow');line(wing*10,flap,wing*9,3+flap,'rockDark');
   }
  }else {line(-2,7,-2,9,'amberDark');line(2,7,3,9,'amberDark');}
  oval(0,1,side?5:3,side?3:5,'rockLight');oval(-1,0,side?4:2,side?2:4,'snow');
  if(!moving){poly(side?[[-3,-1],[2,0],[3,3],[-3,3],[-5,1]]:[[-2,0],[2,0],[2,5],[0,7],[-2,4]],'rockLight');line(side?-4:-1,side?2:4,side?-3:0,side?3:6,'rockDark');}
  const hx=side?sign*4:0,hy=side?-2:front?-2:-4;
  oval(hx,hy,3,3,'snowShade');oval(hx,hy-1,2,2,'snow');line(hx-1,hy-2,hx+1,hy-2,'snowLight');
  if(side){poly([[hx+sign*2,hy],[hx+sign*5,hy+1],[hx+sign*2,hy+2]],'amberDark');eye(hx+sign,hy-1);}
  else if(front){eye(-1,hy);eye(1,hy);dot(0,hy+2,'amberDark');}
  return;
 }
 if(id==='owl'||id==='bird'){
  const owl=id==='owl',span=owl?16:11,flap=step*(owl?5:3),body=owl?5:3;
  if(moving){
   if(side){poly([[-4,-1],[-7,-7-flap],[0,-(owl?13:8)-flap],[4,-6],[6,0]],owl?'snowShade':'rockDark');poly([[-2,1],[-8,7+flap],[2,(owl?12:8)+flap],[5,5],[6,0]],owl?'snow':'rock');line(-3,6,1,(owl?10:7)+flap,'snowLight');}
   else {for(const s of [-1,1]){poly([[s*3,-3],[s*9,-5-flap],[s*span,1+flap],[s*(span-3),6+flap],[s*5,4]],owl?'snowShade':'rockDark');line(s*6,-1,s*(span-2),2+flap,'snow');for(let i=0;i<3;i++)line(s*(span-5+i),3+flap,s*(span-4+i),5+flap,owl?'rockLight':'rock');}}
  }
  oval(0,2,side?body+3:body,side?body:body+3,owl?'snowShade':'rockDark');oval(-1,0,side?body+2:body-1,side?body-1:body+2,owl?'snow':'snowShade');
  const hx=side?sign*(owl?6:4):0,hy=side?-2:front?-3:-5;
  oval(hx,hy,owl?5:3,owl?5:3,owl?'snowLight':'rock');
  if(!back){if(!side||quarter){oval(hx-2,hy,2,2,'snow');eye(hx-2,hy);}
   oval(hx+(side?sign*2:2),hy,owl?2:1,2,owl?'snow':'rockLight');eye(hx+(side?sign*2:2),hy);dot(hx+(side?sign*5:0),hy+2,'amberDark');}
  else line(hx-2,hy-2+(blink?1:0),hx+1,hy-2,'snow');
  if(owl)for(const [x,y]of [[-2,2],[2,4],[-1,6]])line(x,y,x+1,y,'rockLight');
  if(!moving){line(-2,8,-3,10,'woodShade');line(2,8,3,10,'woodShade');}
  return;
 }
 if(id==='seal'||id==='otter'){
  const otter=id==='otter',base=otter?'woodDark':'rock',shade=otter?'woodShade':'rockDark',light=otter?'wood':'rockLight';
  if(side){
   const hx=sign*(otter?11:9),hy=quarter?(front?1:-5):-3;
   if(otter)poly([[-sign*6,1],[-sign*13,4],[-sign*19,7+step],[-sign*15,8+step],[-sign*8,5]],shade);
   else poly([[-sign*6,1],[-sign*15,3+step],[-sign*18,1],[-sign*15,7+step],[-sign*8,5]],shade);
   oval(-sign*2,1,otter?10:11,otter?5:6,shade);oval(-sign*2,-1,9,4,base);line(-7,-3,5,-4,light);
   if(otter){oval(sign*5,5+step,2,3,base);oval(-sign*6,5-step,2,3,base);}else poly([[sign*3,2],[sign*6,8+step],[sign*2,7],[0,3]],shade);
   oval(hx,hy,4,4,light);oval(hx+sign*3,hy+1,3,2,otter?'furDark':'snowShade');dot(hx+sign*5,hy,'ink');eye(hx+sign,hy-1);
   line(hx+sign*3,hy+2,hx+sign*6,hy+3,'snowShade');
  }else{
   const hy=front?7:-9+(blink?1:0);
   if(otter)poly([[-2,-hy*.8],[-3,-hy*1.6],[0,-hy*2],[2,-hy*1.4],[2,-hy*.8]],shade);
   else poly([[-3,-hy*.8],[-8,-hy*1.4+step],[-3,-hy*1.4],[0,-hy],[4,-hy*1.5-step],[8,-hy*1.4],[3,-hy*.8]],shade);
   oval(0,0,otter?5:7,10,shade);oval(-1,-1,otter?4:6,9,base);oval(-2,-3,2,6,light);
   for(const s of [-1,1]){if(otter){oval(s*5,step*s,2,3,shade);oval(s*4,5-step*s,2,3,shade);}else poly([[s*4,0],[s*10,3+step*s],[s*8,6],[s*4,3]],shade);}
   oval(0,hy,4,4,light);if(front){oval(0,hy+2,3,2,otter?'furDark':'snowShade');eye(-2,hy);eye(2,hy);dot(0,hy+2,'ink');line(-1,hy+3,-5,hy+4,'snow');line(1,hy+3,5,hy+4,'snow');}
  }
  if(!otter)for(const [x,y]of [[-3,0],[2,3],[-2,5],[4,-1]])dot(x,y,'rockDark');
  return;
 }
 // Quadruped poses share only pen primitives; silhouette/limb/head/tail anatomy is species-specific.
 const bear=id==='polar-bear',deer=id==='reindeer',hare=id==='hare';
 const fur=deer?'wood':bear?'fur':'snow',shade=deer?'woodDark':bear?'furDark':'snowDeep',light=deer?'woodLight':bear?'furLight':'snowLight';
 if(side){
  const length=(bear?14:deer?13:hare?7:10)*(quarter?.82:1),thick=bear?9:deer?7:hare?6:5;
  const ground=thick+(rest?0:bear?1:5);
  const hx=sign*(bear?14:deer?14:hare?7:11),hy=(quarter?(front?-1:-7):bear?-5:deer?-10:-5)+(forage?5+(f.index%2):alert?(hare?0:-2):0);
  // Far legs are partially occluded by the flank. Near paws alternate on the ground.
  for(const [x,phase]of [[-length+4,-step],[length-4,step]]){poly([[x-(bear?2:1),2],[x+2,2],[x+phase*2+2,ground],[x+phase*2-(bear?2:1),ground]],shade);oval(x+phase*2,ground,bear?3:2,2,shade);}
  if(!bear&&!deer&&!hare){poly([[-sign*6,0],[-sign*15,-1-step],[-sign*20,3],[-sign*17,7],[-sign*10,6],[-sign*5,3]],shade);poly([[-sign*15,1],[-sign*19,3],[-sign*17,6],[-sign*14,5]],light);}
  if(hare)oval(-sign*7,3,3,3,light);
  oval(0,0,length,thick,shade);oval(-1,-2,length-1,thick-2,fur);oval(-3,-3,length-5,thick-3,light);
  if(bear)oval(sign*7,-4,7,7,fur);
  if(deer){poly([[sign*8,0],[sign*10,-11],[sign*16,-13],[sign*15,1]],fur);oval(-sign*10,0,3,5,'fur');}
  for(const [x,phase]of [[-length+3,step],[length-3,-step]]){poly([[x-(bear?2:1),2],[x+2,2],[x+phase*2+2,ground],[x+phase*2-(bear?2:1),ground]],fur);oval(x+phase*2,ground,bear?3:2,2,deer?'ink':shade);line(x-1,4,x+phase*2-1,ground-2,light);}
  oval(hx,hy,bear?6:4,bear?5:4,fur);
  if(bear||deer){oval(hx+sign*4,hy+2,bear?5:4,2,fur);dot(hx+sign*(bear?8:7),hy+2,'ink');oval(hx-sign*2,hy-4,2,2,shade);}
  else {poly([[hx,hy-1],[hx+sign*6,hy+2],[hx+sign*2,hy+4]],fur);dot(hx+sign*6,hy+2,'ink');}
  if(!bear){for(const [dx,dy]of [[-2,-1],[2,0]]){poly([[hx+dx-1,hy-2],[hx+dx-sign,hy-(hare?10:7)+dy],[hx+dx+2,hy-2]],shade);line(hx+dx,hy-3,hx+dx,hy-(hare?8:5),'fur');}}
  eye(hx+sign*2,hy);line(hx-2,hy-3,hx,hy-3,light);
  if(deer){for(const offset of [-2,3]){line(hx+offset,hy-4,hx+offset-sign*4,hy-13,'woodShade');line(hx+offset-sign*2,hy-9,hx+offset+sign*3,hy-12,'woodShade');line(hx+offset-sign*4,hy-13,hx+offset-sign*7,hy-14,'woodLight');}}
 }else{
  const rx=bear?9:deer?7:hare?5:5,ry=bear?13:deer?12:hare?7:9;
  for(const [x,y,k]of [[-rx,-4,step],[rx,-4,-step],[-rx+1,ry-2,-step],[rx-1,ry-2,step]])oval(x,y+k*2,bear?3:2,bear?4:3,shade);
  if(!bear&&!deer&&!hare){poly([[-2,front?-9:7],[-5,front?-15:14],[-2,front?-20:19],[3,front?-17:17],[3,front?-9:8]],shade);oval(-1,front?-17:17,2,2,light);}
  oval(0,0,rx,ry,shade);oval(-1,-2,rx-1,ry-1,fur);oval(-2,-4,rx-3,ry-4,light);
  const hy=(front?(bear?6:deer?3:3):-(ry-1)+(blink?1:0))+(forage?2:0);
  oval(0,hy,bear?7:hare?4:5,bear?6:5,fur);
  const earY=hy-(bear?4:4);for(const s of [-1,1]){
   if(bear)oval(s*5,earY,2,2,shade);
   else {poly([[s*2,earY+2],[s*(hare?4:6),earY-(hare?9:4)],[s*5,earY+3]],shade);line(s*3,earY,s*(hare?4:5),earY-(hare?6:2),light);}
  }
  if(front){oval(0,hy+3,bear?4:2,bear?3:2,light);eye(-3,hy);eye(3,hy);dot(0,hy+4,'ink');line(-1,hy+5,1,hy+5,shade);}
  else line(-2,hy-2,1,hy-3,light);
  if(deer)for(const s of [-1,1]){line(s*3,earY,s*9,earY-8,'woodShade');line(s*9,earY-8,s*12,earY-12,'woodShade');line(s*7,earY-5,s*13,earY-5,'woodShade');line(s*9,earY-8,s*6,earY-12,'woodLight');}
  if(hare||deer)oval(0,front?-ry:ry-1,2,2,light);
 }
}
