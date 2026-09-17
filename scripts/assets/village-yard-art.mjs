export function villageYardArt(p,f){
 if(f.id==='workshop-parts'){
  // A spare kayak hull on two repair trestles, coiled line and a dismantled paddle.
  for(const x of [9,33]){p.rect(x,12,4,26,'woodDark');p.line(x,13,x+3,13,'woodLight');}
  p.poly([[5,20],[13,14],[39,14],[49,21],[39,28],[14,28]],'woodDark');
  p.poly([[8,20],[15,17],[38,17],[45,21],[37,25],[15,25]],'rustDark');
  p.poly([[15,20],[20,18],[33,18],[39,21],[32,23],[21,23]],'wood');
  p.line(19,19,33,19,'woodEdge');p.line(10,33,46,38,'woodLight');p.poly([[39,34],[49,36],[47,40],[39,38]],'fur');
  p.ellipse(51,10,7,5,'furDark');p.ellipse(51,10,4,2,'woodDark');p.line(55,13,57,19,'fur');return;
 }
 // Shore-fast timber platform and open slip. All solid boards match configured collision.
 const plank=(x,y,w,h)=>{p.rect(x,y,w,h,'woodDark');p.rect(x+1,y+1,w-2,h-2,'woodShade');
  for(let xx=x+3;xx<x+w-2;xx+=8){p.line(xx,y+1,xx,y+h-2,'woodDark');p.line(xx+1,y+2,xx+1,y+h-3,'wood');
   for(let yy=y+7;yy<y+h-3;yy+=23)p.line(xx+2,yy,Math.min(xx+6,x+w-2),yy+1,'woodLight');}
 };
 plank(2,4,90,124);plank(92,4,106,46);plank(92,116,106,12);
 // Inner edge reinforcement and four chunky bollards.
 p.line(91,51,91,114,'woodLight');
 for(const[x,y]of[[84,38],[190,38],[84,119],[190,119]]){p.rect(x-2,y-2,7,7,'woodDark');p.rect(x-1,y-1,5,3,'woodEdge');p.dot(x,y,'snow');}
 // Low worktable, rack of spare paddles and a compact hand-cranked hoist.
 p.rect(6,70,25,14,'woodDark');p.rect(7,71,23,9,'woodLight');
 p.line(11,73,20,77,'iceDark');p.rect(20,75,5,3,'rockLight');p.line(15,71,12,77,'woodDark');
 for(let i=0;i<3;i++){const x=10+i*8;p.line(x,90,x+3,114,'woodEdge');p.poly([[x-2,88],[x+2,85],[x+5,92],[x+2,97]],i%2?'rust':'woodLight');}
 p.rect(145,36,13,10,'rockDark');p.line(150,40,163,18,'woodDark');p.line(151,40,164,18,'woodLight');p.line(163,18,182,18,'woodDark');
 p.line(178,20,178,42,'furDark');p.line(178,42,181,44,'rockLight');p.ellipse(151,40,3,3,'ink');p.dot(151,40,'amber');
 // Rope fenders and quiet patches of windblown snow along unused corners.
 for(const x of [111,171]){p.ellipse(x,49,5,2,'rockDark');p.line(x-3,47,x+2,47,'furDark');p.ellipse(x,115,5,2,'rockDark');}
 p.line(5,7,23,7,'snow');p.line(7,8,17,8,'snowShade');p.line(6,121,22,121,'snowShade');p.line(164,125,192,125,'snow');
}
