// Separately composed front/back/profile anatomy; no rotated source frames.
export function corgiArt(p,f){
 const side=f.direction==='E'||f.direction==='W',east=f.direction==='E',n=f.index,move=['walk','run'].includes(f.animation),lie=f.animation==='lie',sit=f.animation==='sit';
 const step=move?(n%2?1:-1):0,bob=f.animation==='run'&&n%2?-1:0;
 if(side){
  const head=east?23:9,rear=east?7:25,y=lie?23:19+bob;
  p.ellipse(16,y,10,5,'woodDark');p.ellipse(16,y-1,10,5,'rust');p.ellipse(16,y-2,8,3,'woodLight');
  for(const x of [10,21]){p.rect(x+step,y+3,3,lie?2:5,'fur');p.dot(x+step,y+7,'woodDark');}
  p.line(rear,y-2,rear+(east?-3:3),y-5+(n%2),'woodLight');
  p.ellipse(head,y-3,5,5,'woodLight');p.poly([[head-4,y-5],[head-3,y-12],[head,y-6]],'rust');p.poly([[head+1,y-6],[head+4,y-11],[head+4,y-3]],'woodLight');
  p.rect(head+(east?1:-5),y-2,5,3,'fur');p.dot(head+(east?5:-5),y-2,'ink');p.dot(head+(east?2:-2),y-5,'ink');p.rect(head-2,y,3,5,'fur');
  if(sit){p.ellipse(rear,y+3,4,4,'rust');p.rect(head-1,y+3,3,5,'fur');}
 }else{
  const front=f.direction==='S',y=lie?21:18+bob;
  p.ellipse(16,y+1,6,lie?5:8,'woodDark');p.ellipse(16,y,6,sit?6:7,'rust');p.ellipse(16,y-1,4,5,'woodLight');
  for(const x of [11,19])p.rect(x,y+5+(x===11?step:-step),3,3,'fur');
  const hy=(front?y-3:y-5)+(f.animation==='sniff'?2+n%2:0);
  p.ellipse(16,hy,7,5,'woodLight');p.poly([[9,hy-2],[10,hy-10],[14,hy-4]],'rust');p.poly([[18,hy-4],[22,hy-10],[23,hy-1]],'rust');p.line(11,hy-7,12,hy-4,'fur');p.line(21,hy-7,20,hy-4,'fur');
  if(front){p.rect(15,hy-4,2,5,'fur');p.ellipse(16,hy+2,4,2,'fur');p.dot(12,hy,'ink');p.dot(20,hy,'ink');p.rect(15,hy+1,2,2,'ink');p.rect(14,y+3,4,3,'fur');}
  else{p.ellipse(16,hy+2,5,2,'fur');p.line(16,y+6,16+(n%2?2:-2),y+9,'woodLight');}
 }
}
