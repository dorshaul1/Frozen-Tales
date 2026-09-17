// Native-pixel settlement pieces. Original palette, overhead construction, no scaling.
export function villageExpansionArt(p,f){
 const wood=(x,y,w,h)=>{p.rect(x,y,w,h,'woodDark');p.rect(x+1,y+1,w-2,h-2,'woodShade');for(let yy=y+3;yy<y+h-2;yy+=5){p.line(x+2,yy,x+w-3,yy,'wood');p.line(x+3,yy+1,x+w-5,yy+1,'woodLight');}};
 if(f.id==='harbor-landing'){
  wood(2,2,18,60);wood(20,2,56,18);
  for(const[x,y]of [[4,4],[70,4],[4,54]]){p.rect(x,y,5,5,'woodDark');p.line(x,y,x+3,y,'snow');}
  p.poly([[26,12],[34,6],[58,6],[69,12],[58,17],[34,17]],'rustDark');p.poly([[32,12],[37,9],[56,9],[63,12],[55,14],[38,14]],'woodLight');p.rect(43,10,10,4,'woodDark');p.line(26,23,67,23,'woodLight');p.ellipse(11,34,5,4,'furDark');p.ellipse(11,34,3,2,'woodDark');
 }else if(f.id.startsWith('village-beacon')){
  if(f.id==='village-beacon'){
   // Carved fish finial, four timber feet, and a glazed octagonal lantern roof.
   p.ellipse(28,48,23,14,'snowShade');wood(15,38,27,26);
   for(const[x,y]of[[7,28],[45,28],[7,56],[45,56]]){wood(x,y,5,9);p.line(x,y,x+3,y,'snow');}
   p.poly([[28,15],[46,26],[47,45],[29,57],[10,46],[9,27]],'woodDark');
   p.poly([[28,18],[43,28],[43,43],[28,53],[13,43],[13,28]],'pineDark');
   p.poly([[28,20],[41,29],[28,37],[15,29]],'pineLight');
   p.poly([[15,31],[26,39],[26,50],[15,42]],'pine');
   p.line(28,20,28,51,'woodLight');p.line(14,30,42,44,'woodDark');p.line(42,30,14,44,'woodDark');
   p.poly([[21,29],[34,29],[38,35],[34,43],[21,43],[18,35]],'woodDark');
   p.rect(23,31,10,10,'amber');p.rect(25,32,6,7,'lamp');p.line(28,30,28,42,'woodDark');p.line(22,36,34,36,'woodDark');
   // A salmon carving is a recognizable silhouette, not a generic tower cap.
   p.poly([[8,11],[17,6],[30,6],[39,11],[48,5],[46,13],[48,20],[39,15],[28,20],[16,18]],'woodDark');
   p.poly([[11,12],[19,8],[29,8],[38,12],[29,17],[18,16]],'woodLight');
   p.line(17,9,30,9,'woodEdge');p.dot(15,11,'ink');p.line(23,10,23,15,'wood');
   p.poly([[27,8],[29,3],[35,9]],'wood');p.line(41,12,45,9,'woodLight');
   p.line(15,26,24,21,'snow');p.line(15,27,20,24,'snowLight');
   for(const x of [8,45]){p.rect(x,50,4,5,'woodDark');p.rect(x+1,51,2,2,'amber');}
   p.line(17,60,37,60,'snow');
  }else{p.rect(25,32,2,3,'lamp');p.rect(29,32,2,3,'amber');p.rect(24,38,3,2,'amber');p.rect(29,38,3,2,'lamp');for(const x of [9,46])p.rect(x,51,2,2,'amber');}
 }else if(f.id==='market-canopy'){
  wood(5,9,52,27);p.poly([[4,8],[51,5],[59,22],[8,25]],'woodDark');
  p.poly([[6,8],[49,7],[56,20],[10,23]],'fur');
  for(const x of [13,29,45])p.poly([[x,8],[x+6,8],[x+10,20],[x+3,21]],'rust');
  p.line(7,8,47,6,'snow');wood(9,27,40,10);
  for(let i=0;i<3;i++){p.ellipse(17+i*11,31,4,2,'iceDark');p.line(15+i*11,30,19+i*11,30,'iceLight');}p.rect(6,24,3,15,'woodDark');p.rect(52,24,3,15,'woodDark');
 }else if(f.id==='communal-table'){
  wood(5,7,38,19);wood(8,2,32,4);wood(8,27,32,4);
  p.rect(12,11,9,7,'furDark');p.rect(13,12,7,5,'fur');p.ellipse(28,15,3,3,'ink');p.ellipse(28,14,2,2,'amber');p.line(31,13,33,15,'woodLight');p.line(23,19,34,19,'woodDark');p.dot(38,9,'snow');
 }else if(f.id==='research-instruments'){
  wood(3,5,26,21);p.rect(5,7,13,13,'fur');p.line(7,9,14,11,'iceDark');p.line(14,11,9,16,'iceDark');p.dot(12,14,'rust');
  p.ellipse(23,13,4,4,'rockDark');p.ellipse(23,13,2,2,'iceLight');p.line(20,23,26,6,'woodDark');p.line(26,6,29,8,'woodLight');
 }else if(f.id==='winter-equipment'){
  for(const x of [5,12]){p.poly([[x,4],[x+3,2],[x+5,27],[x+2,30]],'woodDark');p.line(x+2,5,x+3,26,'woodLight');p.rect(x+1,16,4,4,'furDark');}
  p.ellipse(22,13,5,9,'woodDark');p.ellipse(22,13,3,7,'furDark');for(let y=8;y<20;y+=3)p.line(19,y,25,y,'woodShade');p.line(22,6,22,20,'woodLight');
 }
}
