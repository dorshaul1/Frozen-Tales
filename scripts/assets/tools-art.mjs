// Native original gear, timber stall and villager artwork; all materials use the shared palette.
export function toolsArt(p,f){
 const id=f.id;
 if(id==='tools-keeper'){
  const hand=[0,1,0,-1][f.index];
  p.ellipse(16,22,10,5,'snowShade');
  const stride=f.animation==='walk'?hand:0;
  p.rect(10,23+stride,5,f.animation==='walk'?4:5,'woodDark');p.rect(19,23-stride,4,f.animation==='walk'?4:5,'woodDark');
  p.poly([[10,12],[6,17],[9,24],[21,26],[25,21],[23,14]],'pineDark');
  p.poly([[11,13],[8,17],[11,23],[20,24],[23,20],[21,14]],'pine');
  p.line(11,16,12,22,'pineLight');p.line(17,17,17,24,'woodDark');
  p.rect(12,19,9,5,'wood');p.line(13,20,19,20,'woodLight');
  p.ellipse(7,19+hand,3,3,'furDark');p.ellipse(24,19-hand,3,3,'fur');
  p.ellipse(16,10,9,8,'furDark');p.ellipse(15,9,8,7,'fur');p.ellipse(15,8,6,5,'furLight');
  p.ellipse(16,9,5,4,'pineDark');p.ellipse(15,8,4,3,'pine');p.line(13,7,16,6,'pineLight');
  p.line(22,18-hand,27,22-hand,'woodDark');p.line(23,18-hand,28,21-hand,'woodLight');
  p.rect(25,16-hand,4,3,'iceShade');p.line(25,16-hand,28,16-hand,'iceLight');
  return;
 }
 if(id==='village-tools-lights'){p.rect(49,16,7,5,'amber');p.rect(50,17,4,3,'lamp');return;}
 if(id==='village-tools'){
  p.poly([[3,7],[65,5],[72,17],[70,38],[8,41],[3,33]],'snowShade');
  p.rect(5,8,62,26,'woodDark');p.rect(7,10,58,22,'wood');
  for(let x=9;x<65;x+=8){p.line(x,11,x,31,'woodShade');p.line(x+1,12,x+1,27,'woodLight');}
  p.poly([[3,5],[64,3],[70,8],[68,23],[7,25],[3,20]],'pineDark');
  p.poly([[5,5],[62,4],[68,9],[65,20],[7,22]],'pine');
  p.line(9,8,64,7,'pineLight');p.line(22,5,24,21,'pineLight');p.line(43,5,45,21,'pineDark');
  p.poly([[4,5],[19,3],[38,4],[57,2],[65,4],[68,8],[56,7],[44,9],[31,7],[18,9],[5,8]],'snow');
  p.line(8,4,19,3,'snowLight');p.line(39,5,57,3,'snowLight');
  p.rect(6,25,57,7,'woodDark');p.rect(7,25,55,4,'woodLight');p.line(8,25,59,25,'woodEdge');
  // Stock is grouped on the workbench: lens, lantern, folded canvas and an ice pick.
  p.ellipse(20,27,4,3,'ink');p.ellipse(19,26,3,2,'ice');
  p.rect(37,24,9,5,'pineDark');p.line(38,24,44,24,'pineLight');p.line(40,24,40,28,'furDark');
  p.rect(48,15,9,8,'ink');p.rect(50,17,5,4,'amber');p.line(51,14,54,14,'woodEdge');
  p.line(56,26,61,31,'woodDark');p.rect(57,24,5,2,'iceShade');
  p.rect(7,33,10,5,'woodShade');p.line(8,33,15,33,'woodLight');return;
 }
 if(id==='village-sign-tools'||id==='village-sign-kayak'){
  p.rect(11,15,4,13,'woodDark');p.line(11,16,11,26,'woodLight');
  p.poly([[3,5],[21,4],[23,7],[22,17],[3,18],[2,15]],'woodDark');
  p.rect(4,6,17,10,'wood');p.line(5,6,19,6,'woodEdge');
  if(id==='village-sign-kayak'){p.poly([[7,11],[12,7],[19,10],[20,12],[13,15]],'rustDark');p.line(8,11,17,10,'rustEdge');p.line(9,6,17,15,'woodEdge');return;}
  p.line(8,14,17,7,'iceLight');p.line(8,7,17,14,'woodDark');p.rect(7,7,5,2,'ice');return;
 }
 const attachment=id.startsWith('kayak-gear-'),kind=id.replace(attachment?'kayak-gear-':'gear-','');
 if(attachment){
  if(kind==='lantern'){
   p.rect(27,9,6,8,'ink');p.rect(28,10,4,5,'amber');p.rect(29,11,2,3,'lamp');p.line(28,8,31,8,'woodLight');
  }else if(kind==='finder'){
   p.rect(13,30,6,7,'woodDark');p.rect(14,31,4,4,'iceDark');p.dot(15,32,'iceLight');p.line(16,34,18,33,'iceLight');
  }else if(kind==='icebreaker'){
   p.poly([[23,2],[27,9],[29,16],[25,14],[24,7],[22,14],[19,16],[21,8]],'rockDark');
   p.line(23,3,21,11,'iceLight');p.line(21,11,20,14,'ice');p.line(25,7,27,13,'rockLight');
  }else{
   p.poly([[16,26],[19,28],[18,36],[20,40],[16,39],[14,34]],'pineDark');
   p.poly([[30,26],[32,30],[31,37],[28,40],[29,33]],'pine');
   p.line(15,30,17,37,'pineLight');p.line(30,28,30,35,'furDark');
  }return;
 }
 if(kind==='lantern'){
  p.line(9,5,9,3,'woodEdge');p.line(9,3,15,3,'woodEdge');p.line(15,3,15,5,'woodEdge');
  p.poly([[7,6],[17,6],[19,10],[18,20],[6,20],[5,10]],'ink');
  p.rect(8,9,8,9,'amberDark');p.rect(9,10,6,6,'amber');p.rect(10,11,3,4,'lamp');
  p.line(7,7,17,7,'woodLight');p.line(7,19,17,19,'woodLight');
 }else if(kind==='finder'){
  p.rect(4,4,16,17,'woodDark');p.rect(5,5,14,14,'woodLight');p.rect(7,7,10,9,'deep');
  p.line(8,13,10,10,'ice');p.line(10,10,13,13,'ice');p.line(13,13,16,9,'ice');
  p.rect(8,17,2,1,'lamp');p.dot(16,17,'ink');
 }else if(kind==='icebreaker'){
  p.line(6,21,16,5,'woodDark');p.line(7,21,17,5,'woodEdge');
  p.poly([[10,4],[15,2],[21,4],[21,9],[18,7],[14,6],[10,7]],'rockDark');
  p.line(11,4,15,3,'iceLight');p.line(15,3,20,5,'ice');p.line(7,17,9,18,'rustDark');
 }else{
  p.poly([[4,6],[17,3],[21,8],[19,19],[7,21],[3,16]],'pineDark');
  p.poly([[5,7],[16,5],[19,8],[17,17],[7,19],[5,15]],'pine');
  p.line(6,8,15,6,'pineLight');p.line(8,6,10,19,'furDark');p.line(16,5,15,18,'fur');
  p.rect(9,11,3,3,'woodLight');
 }
}
