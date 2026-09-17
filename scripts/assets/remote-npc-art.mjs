export function remoteNpcArt(p,f){
 const role=f.id.replace('remote-',''),side=f.direction==='E'||f.direction==='W',rear=f.direction==='N',step=f.animation==='walk'?(f.index%2?1:-1):0;
 const coat=role==='ranger'?'pine':role==='observer'?'parka':role==='fisher'?'rust':'woodShade';
 p.rect(11+step,24,4,4,'ink');p.rect(18-step,24,4,4,'ink');p.ellipse(16,20,7,7,'parkaDark');p.ellipse(15,19,6,6,coat);p.line(12,16,12,23,'furDark');
 p.ellipse(16,10,8,7,'furDark');p.ellipse(15,9,7,6,'fur');p.ellipse(15,8,5,4,coat);
 if(!rear){const x=side?(f.direction==='E'?20:10):13;p.rect(x,11,side?3:6,4,'woodLight');p.dot(x,12,'ink');if(!side)p.dot(x+5,12,'ink');if(role==='fisher')p.rect(x,14,side?3:6,3,'fur');}
 p.rect(7,19+step,3,4,'fur');p.rect(22,19-step,3,4,'fur');
 if(role==='cartographer'){p.rect(8,20,8,5,'snow');p.line(9,23,14,21,'waterLight');p.rect(21,15,3,6,'woodDark');}
 if(role==='ranger'){p.rect(19,17,4,8,'woodDark');p.rect(20,18,2,5,'wood');p.rect(11,7,8,2,'pineDark');}
 if(role==='observer'){p.rect(8,20,6,5,'woodDark');p.rect(9,21,4,3,'snow');p.dot(20,19,'amber');}
 if(role==='fisher'){p.line(25,13,25,28,'woodLight');p.rect(10,18,3,6,'furDark');}
}
