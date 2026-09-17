export function traversalArt(p,f){
 p.poly([[2,6],[14,3],[27,5],[43,2],[59,4],[77,3],[93,6],[92,18],[76,21],[61,18],[45,21],[28,19],[12,21],[2,17]],'iceDark');
 p.poly([[3,6],[17,5],[31,7],[47,4],[63,6],[81,5],[92,7],[90,16],[73,18],[55,16],[38,19],[20,17],[3,16]],'iceLight');
 for(const [x,y]of [[8,6],[36,7],[69,5]]){p.line(x,y,x+12,y-1,'snow');p.line(x+2,y+1,x+8,y+1,'snowLight');}
 const points=[[4,13],[21,10],[33,14],[48,9],[64,13],[77,10],[92,14]];for(let i=1;i<points.length;i++)p.line(...points[i-1],...points[i],f.index===2?'deep':'iceShade');
 p.line(33,14,37,18,'iceShade');p.line(64,13,61,6,'iceShade');
 if(f.index>0){p.line(48,9,43,19,'iceDark');p.line(21,10,19,4,'iceDark');}
}
