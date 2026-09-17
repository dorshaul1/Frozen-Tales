export function ecosystemFish(p,f){
 if(f.id==='fish-smelt'){
  // Slim translucent body, forked tail and small separate adipose fin.
  p.poly([[8,13],[17,9],[31,11],[40,14],[32,17],[16,18]],'ink');
  p.poly([[9,14],[18,11],[31,12],[37,14],[30,16],[17,16]],'iceShade');
  p.poly([[9,13],[2,8],[4,14],[2,21],[10,16]],'iceDark');
  p.line(14,13,32,13,'snowLight');p.line(18,16,29,16,'waterLight');
  p.poly([[17,10],[22,5],[24,11]],'ice');p.poly([[26,11],[28,8],[30,12]],'iceShade');
  p.line(22,17,25,21,'iceDark');p.dot(35,13,'ink');p.dot(36,13,'snow');
 }else if(f.id==='fish-ember'){
  // Deep oval dace with rounded shoulders, a short snout and copper fins.
  p.poly([[9,12],[17,6],[27,5],[35,9],[40,14],[35,20],[24,23],[15,20]],'ink');
  p.poly([[11,13],[18,8],[27,7],[34,11],[37,14],[32,19],[24,21],[16,18]],'rockDark');
  p.poly([[13,15],[23,13],[34,14],[30,20],[22,20]],'rustLight');
  p.line(16,10,28,9,'iceLight');p.line(16,12,31,11,'iceShade');
  p.poly([[10,12],[3,7],[4,15],[2,22],[11,17]],'rust');
  p.poly([[17,8],[22,2],[28,6]],'rust');p.poly([[21,21],[27,26],[31,20]],'rustDark');
  p.line(31,11,31,18,'ink');p.dot(35,12,'snow');p.dot(35,13,'ink');
 }else{
  // Long armored back, asymmetric shark-like tail and pointed underslung snout.
  p.poly([[8,14],[17,9],[28,8],[35,11],[42,15],[34,19],[20,20]],'ink');
  p.poly([[10,14],[18,11],[29,10],[36,13],[40,15],[32,17],[20,18]],'rockLight');
  p.poly([[10,14],[2,3],[3,14],[2,21],[10,17]],'rockDark');
  p.poly([[25,10],[30,3],[33,11]],'iceDark');p.poly([[27,18],[32,25],[33,18]],'iceDark');
  for(let x=15;x<31;x+=4){p.poly([[x,12],[x+2,10],[x+3,13]],'snowShade');p.dot(x+1,16,'iceShade');}
  p.line(35,17,35,21,'fur');p.line(38,16,38,19,'fur');p.dot(35,13,'ink');
 }
}
