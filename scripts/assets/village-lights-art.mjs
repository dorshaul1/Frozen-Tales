// Native fixtures and separate emissive panes; illumination is supplied at runtime.
export function villageLightArt(p,f){
 const mask=f.id.endsWith('-light'),id=f.id.replace(/-light$/,'');
 if(id==='path-lantern'){
  if(!mask){p.ellipse(8,20,4,2,'snowShade');p.rect(7,10,3,12,'woodDark');p.line(7,12,7,20,'woodLight');p.rect(3,5,10,10,'ink');p.rect(5,7,6,6,'amber');p.poly([[2,5],[5,2],[10,2],[14,5]],'woodDark');p.line(4,3,10,3,'snow');p.line(8,6,8,14,'woodDark');}
  else{p.rect(5,7,2,4,'amber');p.rect(9,7,2,4,'lamp');}
 }else if(id==='wall-lantern'){
  if(!mask){p.rect(2,2,4,11,'woodDark');p.line(4,3,11,3,'rockDark');p.rect(7,5,7,9,'ink');p.rect(8,7,5,5,'amber');p.line(7,5,12,5,'rockLight');p.line(10,7,10,12,'woodDark');}
  else{p.rect(8,7,2,4,'lamp');p.rect(11,7,2,4,'amber');}
 }else{
  if(!mask){p.line(8,1,8,6,'woodDark');p.line(3,2,12,2,'woodLight');p.poly([[8,5],[13,9],[12,16],[8,18],[3,15],[3,9]],'ink');p.poly([[8,7],[11,10],[10,15],[6,15],[5,10]],'amber');p.line(8,8,8,16,'woodDark');}
  else{p.rect(6,10,2,4,'lamp');p.rect(9,10,2,4,'amber');}
 }
}
