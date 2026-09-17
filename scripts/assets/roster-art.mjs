const shapes={
 dace:[15,3,7,3,0],perch:[12,6,8,7,1],chub:[14,5,6,3,2],pickerel:[17,3,4,4,3],sucker:[14,6,5,4,4],whitebass:[11,7,8,5,5],bream:[10,9,6,4,6],huchen:[17,5,7,5,7],taimen:[18,6,6,4,8],sculpin:[11,6,4,8,9],eel:[18,2,2,3,10],lanternfin:[10,7,5,9,11]};
export function rosterArt(p,f){
 const id=f.id.slice(5),[length,height,tail,fin,pattern]=shapes[id],cx=22,cy=14;
 if(id==='eel'){
  p.poly([[3,10],[11,8],[24,15],[34,14],[41,10],[38,17],[25,20],[10,12]],'rockDark');p.line(6,10,24,17,'iceShade');p.line(24,17,36,15,'fur');p.dot(5,10,'ink');return;
 }
 p.poly([[cx+length-3,cy],[42,cy-tail],[40,cy],[42,cy+tail]],'rockDark');p.line(cx+length-2,cy,40,cy-tail+2,'iceShade');
 p.poly([[17,cy-height+2],[22,Math.max(2,cy-height-fin)],[29,cy-height+2]],'iceShade');
 p.poly([[19,cy+height-2],[25,Math.min(26,cy+height+4)],[29,cy+height-2]],'woodLight');
 p.ellipse(cx,cy,length,height,'rockDark');p.ellipse(cx,cy-1,length-1,height-1,pattern%3===0?'pine':pattern%3===1?'iceShade':'wood');
 p.ellipse(cx-1,cy+Math.max(1,height/3),length-3,Math.max(1,height/3),'fur');
 p.line(cx-length+4,cy-height+2,cx+length-5,cy-height+2,'iceLight');
 p.line(cx-length+8,cy-2,cx-length+9,cy+3,'rockDark');p.dot(cx-length+3,cy-1,'ink');p.dot(cx-length+3,cy-2,'snow');
 p.line(cx-length,cy+2,cx-length+3,cy+2,'ink');
 if(['perch','whitebass'].includes(id))for(let x=18;x<32;x+=4)p.line(x,cy-height+2,x-1,cy+2,'pine');
 if(['huchen','taimen','chub'].includes(id))for(let x=17;x<34;x+=4){p.dot(x,cy-2,'rockDark');p.dot(x+1,cy,'woodLight');}
 if(id==='pickerel')p.line(6,14,1,14,'pine');
 if(id==='sucker')p.ellipse(7,16,2,2,'woodDark');
 if(id==='sculpin'){p.poly([[12,15],[8,24],[21,19]],'wood');p.poly([[13,11],[10,3],[22,9]],'woodLight');}
 if(id==='lanternfin'){p.line(13,8,8,3,'iceShade');p.ellipse(7,3,2,2,'lamp');p.line(27,8,31,2,'iceLight');}
}
