// Authored profiles, front/rear and quarter silhouettes. No sprite rotation or image mirroring.
export function arcticWildlifeArt(p,f){
 const cx=p.image.width/2,cy=p.image.height/2,side=/[EW]/.test(f.direction),left=f.direction.includes('W'),s=left?-1:1,front=f.direction.includes('S'),back=f.direction.includes('N'),quarter=side&&(front||back);
 const moving=f.animation==='walk',rest=f.animation==='rest',feed=f.animation==='forage',alert=f.animation==='alert',step=moving?[0,1,0,-1][f.index%4]:0,blink=!moving&&f.index%2;
 const oval=(x,y,rx,ry,c)=>p.ellipse(cx+x,cy+y,rx,ry,c),line=(x,y,a,b,c)=>p.line(cx+x,cy+y,cx+a,cy+b,c),poly=(v,c)=>p.poly(v.map(([x,y])=>[cx+x,cy+y]),c),dot=(x,y,c)=>p.dot(cx+x,cy+y,c);
 const eye=(x,y)=>{if(!blink)dot(x,y,'ink');else line(x,y,x+1,y,'woodShade');};
 if(f.id==='raven'){
  if(moving){const flap=step*2;
   if(side){poly([[-3,0],[-8,-5-flap],[-3,-12-flap],[2,-8],[4,-1]],'ink');poly([[-2,1],[-8,6+flap],[-2,12+flap],[3,7],[4,1]],'rockDark');line(-5,7+flap,-2,10+flap,'deep');}
   else for(const wing of [-1,1]){poly([[wing*2,-2],[wing*7,-7-flap],[wing*13,-3+flap],[wing*12,3+flap],[wing*5,4]],'ink');line(wing*5,-2,wing*10,flap,'rockDark');line(wing*10,1+flap,wing*12,2+flap,'deep');}
  }else {line(-2,5,-3,8,'rockDark');line(2,5,4,8,'rockDark');}
  poly(side?[[-3,0],[-s*10,3],[-s*8,6],[0,4]]:[[-2,3],[-3,10],[0,13],[3,9],[2,3]],'ink');
  oval(0,0,side?5:3,side?3:5,'ink');oval(-1,-1,side?4:2,side?2:4,'deep');
  if(!moving){poly([[-3,-2],[3,0],[2,4],[-2,5]],'rockDark');line(-2,-2,2,0,'deep');}
  const hx=side?s*4:0,hy=feed?2:front?-1:-4;
  oval(hx,hy,3,3,'ink');line(hx-1,hy-2,hx+1,hy-2,'deep');
  if(side){poly([[hx+s*2,hy-1],[hx+s*6,hy+1],[hx+s*2,hy+1]],'rockDark');if(!blink)dot(hx+s,hy-1,'rockLight');}
  else if(front){poly([[-1,hy],[0,hy+4],[2,hy+1]],'rockDark');if(!blink){dot(-2,hy-1,'rockLight');dot(2,hy-1,'rockLight');}}
  return;
 }
 if(f.id==='musk-ox'){
  // Low, heavy shoulder hump and hanging coat; pale horn bosses wrap the broad head.
  if(side){
   const length=quarter?12:15,hx=s*(quarter?12:15),hy=feed?6:2;
   for(const [x,k]of[[-9,-step],[9,step]]){poly([[x-2,2],[x+2,2],[x+k+2,12],[x+k-2,12]],'ink');}
   poly([[-length,3],[-length,-5],[-8,-11],[4,-12],[length,-6],[length,9],[7,12],[2,9],[-4,12],[-10,10],[-length,11]],'woodDark');
   oval(-2,-4,length-2,7,'woodShade');oval(-4,-7,length-6,3,'wood');
   for(const x of [-10,-4,3,9])line(x,2,x-1,9+(x%3),'woodShade');
   oval(hx,hy,5,7,'woodDark');oval(hx+s*2,hy+3,4,3,'ink');
   poly([[hx-s*4,hy-3],[hx-s*6,hy-5],[hx-s*7,hy-1],[hx-s*4,hy+1]],'furDark');
   poly([[hx-s*2,hy-4],[hx+s*2,hy-5],[hx+s*4,hy-2],[hx+s*4,hy+1],[hx+s*2,hy-1],[hx,hy-2]],'fur');
   eye(hx+s*2,hy+1);line(hx,hy-4,hx+s*2,hy-4,'furLight');
  }else{
   oval(0,-2,11,13,'woodDark');oval(-1,-5,9,9,'woodShade');oval(-2,-8,6,4,'wood');
   for(const x of [-8,8]){oval(x,10+step*(x<0?1:-1),3,2,'ink');line(x,0,x,8,'wood');}
   const hy=front?(feed?9:6):-10;oval(0,hy,6,6,'woodDark');
   for(const k of [-1,1]){poly([[k,hy-3],[k*5,hy-5],[k*9,hy-2],[k*10,hy+2],[k*7,hy+4],[k*8,hy],[k*4,hy-2]],'furDark');line(k*2,hy-3,k*5,hy-3,'fur');}
   if(front){oval(0,hy+3,4,3,'ink');eye(-3,hy);eye(3,hy);line(-1,hy+3,1,hy+3,'woodShade');}
  }return;
 }
 const wolf=f.id==='wolf',coat=wolf?'snow':'woodDark',shade=wolf?'snowDeep':'ink',light=wolf?'snowLight':'woodLight';
 if(side){
  const length=wolf?(quarter?9:11):8,thick=wolf?4:6,ground=rest?5:wolf?10:8,hx=s*(wolf?11:7),hy=(feed?2:alert?-6:-3)+(quarter&&back?-2:0);
  // Wolves have long strides and a lowered brush tail; wolverines have thick wrists and a blunt head.
  poly([[-s*(length-2),0],[-s*(length+5),2+step],[-s*(length+5),6+step],[-s*(length+1),5],[-s*(length-3),2]],shade);
  for(const[x,k]of[[-length+3,-step],[length-3,step]])poly([[x-1,0],[x+2,0],[x+k+2,ground],[x+k-2,ground]],shade);
  oval(0,0,length,thick,shade);oval(-1,-2,length-1,thick-1,coat);
  if(wolf)poly([[s*5,-3],[s*8,-7],[s*12,-5],[s*10,4],[s*6,3]],'snowShade');
  else{line(-s*7,-3,s*5,-5,'wood');line(-s*8,-2,-s*7,3,light);line(s*5,-5,s*8,-2,light);}
  for(const[x,k]of[[-length+2,step],[length-3,-step]]){poly([[x-1,1],[x+2,1],[x+k+2,ground],[x+k-2,ground]],coat);line(x+k-1,ground,x+k+2,ground,shade);}
  oval(hx,hy,wolf?4:5,4,coat);
  if(wolf){poly([[hx+s*2,hy],[hx+s*6,hy+2],[hx+s*3,hy+4]],'snowShade');poly([[hx-2,hy-2],[hx-2,hy-7],[hx+1,hy-3]],shade);poly([[hx+1,hy-3],[hx+3,hy-6],[hx+3,hy-1]],coat);dot(hx+s*6,hy+2,'ink');}
  else{oval(hx+s*3,hy+2,3,2,'woodShade');oval(hx-s*2,hy-3,2,2,'ink');dot(hx+s*5,hy+2,'ink');}
  eye(hx+s,hy);line(hx-2,hy-2,hx,hy-2,light);
 }else{
  const rx=wolf?5:6,ry=wolf?9:8;
  poly([[-2,front?-7:6],[-3,front?-14:12],[1,front?(wolf?-15:-12):12],[3,front?-9:7]],shade);
  for(const[x,k]of[[-rx,-step],[rx,step]]){oval(x,5+k,2,4,shade);oval(x,-4-k,2,3,shade);}
  oval(0,0,rx,ry,shade);oval(-1,-2,rx-1,ry-1,coat);
  if(!wolf){line(-4,-4,-5,3,'wood');line(4,-4,5,3,light);}
  const hy=front?(feed?7:4):-7;oval(0,hy,wolf?5:6,4,coat);
  if(wolf)for(const k of [-1,1])poly([[k*2,hy-1],[k*4,hy-6],[k*5,hy-1]],shade);
  else{oval(-4,hy-3,2,2,'ink');oval(4,hy-3,2,2,'ink');}
  if(front){oval(0,hy+3,3,2,wolf?'snowShade':'woodShade');eye(-3,hy);eye(3,hy);dot(0,hy+4,'ink');}
 }
}
