export function explorationArt(p,f){
 const id=f.id,n=f.index;
 if(id==='cave-water'){
  p.rect(0,0,128,128,n===1?'deep':n===2?'waterShade':'ink');
  for(let i=0;i<24;i++){const x=(i*47+13)%124,y=(i*31+7)%126;p.line(x,y,x+3+(i%4),y,i%3?'waterShade':'water');if(i%5===0)p.line(x+2,y+2,x+5,y+2,'waterShade');}return;
 }
 if(id==='cave-mouth'){
  const stone=n===1?'iceDark':'rockDark',shade=n===1?'iceShade':'iceDark';
  // A short overhead roof lip held by substantial, uneven rock/ice buttresses.
  p.poly([[6,27],[18,17],[34,20],[44,28],[40,44],[22,48],[9,39]],'ink');
  p.poly([[132,25],[147,16],[164,21],[170,36],[158,46],[136,44]],'ink');
  p.poly([[8,26],[21,19],[34,23],[39,31],[35,40],[20,44],[12,36]],stone);
  p.poly([[137,25],[148,19],[161,24],[165,35],[155,42],[139,39]],stone);
  p.poly([[24,21],[43,18],[61,23],[81,17],[100,22],[124,16],[148,20],[151,34],[132,31],[112,37],[91,32],[70,37],[50,31],[31,35]],shade);
  p.poly([[29,23],[44,21],[63,27],[79,21],[91,23],[72,29],[51,27],[34,30]],n===2?'snow':'iceShade');
  p.poly([[104,25],[123,20],[141,22],[137,27],[120,24]],n===1?'iceLight':'rockLight');
  p.line(76,23,83,31,'deep');p.line(83,31,93,33,'deep');p.line(117,27,111,34,'ink');
  p.line(18,27,23,36,'iceShade');p.line(150,28,157,34,'ice');return;
 }
 if(id==='shore-cave'){
  p.rect(0,0,32,16,'deep');
  for(let y=0;y<16;y++){const ridge=17+Math.round(Math.sin(y*.6+n)*2);p.rect(0,y,ridge,1,n%2?'rockDark':'ink');p.rect(3,y,ridge-4,1,'iceDark');p.rect(6,y,4,1,'iceShade');p.rect(ridge-2,y,3,1,'waterLight');if((y+n)%5<2)p.rect(9,y,3,1,'ice');}
  p.line(3,2,6,8,'deep');p.line(11,4,14,10,'iceLight');return;
 }
 if(id.startsWith('fish-')){
  if(id==='fish-cisco'){
   p.poly([[5,14],[12,8],[28,8],[36,12],[39,15],[32,19],[14,19]],'ink');p.poly([[8,14],[15,9],[28,10],[36,14],[29,18],[14,17]],'iceShade');
   p.line(12,12,31,12,'iceLight');p.line(14,16,31,16,'rockDark');p.poly([[5,13],[2,7],[2,22],[8,16]],'iceDark');p.poly([[18,9],[23,3],[26,9]],'ice');p.poly([[19,18],[24,23],[26,18]],'iceDark');p.dot(34,13,'ink');p.dot(35,13,'snow');
  }else if(id==='fish-glasschar'){
   p.poly([[8,13],[16,7],[30,9],[40,14],[33,19],[17,20]],'ink');p.poly([[10,13],[17,8],[31,11],[37,14],[30,18],[16,18]],'iceDark');p.line(17,11,31,12,'iceLight');p.line(18,17,31,16,'rustLight');
   p.poly([[9,13],[2,7],[3,21],[10,16]],'iceShade');p.poly([[17,8],[24,2],[27,9]],'iceShade');p.line(22,4,24,8,'snow');p.poly([[22,19],[28,25],[30,18]],'ice');for(const[x,y]of[[19,13],[23,14],[27,13],[30,15]])p.dot(x,y,'snowLight');p.dot(35,13,'ink');
  }else{
   p.poly([[3,14],[11,9],[25,7],[36,10],[41,15],[35,20],[23,21],[11,17]],'rockDark');p.poly([[4,14],[13,11],[26,9],[35,12],[39,15],[33,18],[22,19],[12,15]],'snowShade');p.poly([[9,11],[18,3],[30,7],[34,11]],'iceShade');p.line(14,9,24,6,'iceLight');p.poly([[13,17],[21,24],[31,24],[34,19]],'iceDark');p.line(34,19,39,24,'fur');p.line(36,18,41,21,'fur');p.dot(36,13,'ink');p.line(15,13,29,12,'ice');
  }return;
 }
 if(id==='cave-formation'){
  const points=n===0?[[6,53],[12,22],[23,11],[29,30],[42,6],[49,33],[60,55]]:n===1?[[6,51],[15,32],[21,7],[31,25],[42,19],[58,49]]:[[5,52],[9,30],[24,18],[39,7],[48,20],[59,49]];
  p.poly(points,'ink');p.poly(points.map(([x,y])=>[x+1,Math.max(3,y-3)]),'iceDark');
  p.poly([[14,43],[22,16],[28,34],[39,12],[43,39],[52,47]],'iceShade');p.poly([[22,18],[24,33],[18,42]],'iceLight');p.poly([[39,13],[41,35],[33,42]],'ice');p.line(31,34,28,46,'deep');p.line(28,46,40,50,'waterLight');p.line(11,50,20,52,'snow');p.line(40,51,54,50,'iceLight');return;
 }
 if(id==='cave-falls'){
  p.poly([[4,18],[15,6],[31,12],[50,5],[60,18],[57,51],[43,60],[14,54]],'rockDark');p.poly([[13,16],[27,12],[40,16],[51,12],[51,49],[40,56],[19,49]],'iceDark');
  for(let x=18;x<48;x+=5){p.line(x,15+(x%3),x-3,46+(x%7),'iceShade');p.line(x+1,18,x-1,43,'iceLight');}p.poly([[12,12],[24,7],[36,11],[50,7],[57,15],[41,18],[22,15]],'snowShade');p.line(18,49,39,54,'ice');return;
 }
 if(id==='cave-arch'){
  // Broad native-pixel bridge with distinct geological facets, not a repeated strip.
  p.poly([[8,30],[27,13],[52,19],[64,35],[61,77],[40,88],[14,71]],'ink');
  p.poly([[321,24],[345,10],[372,27],[376,67],[355,84],[320,76]],'ink');
  p.poly([[14,29],[30,18],[53,24],[58,70],[39,82],[20,66]],'iceDark');
  p.poly([[326,25],[346,16],[366,30],[369,66],[352,78],[326,69]],'iceDark');
  p.poly([[32,25],[63,16],[110,20],[151,14],[199,23],[244,13],[290,20],[341,16],[352,36],[309,39],[263,33],[221,42],[179,34],[129,39],[86,33],[43,42]],'iceDark');
  p.poly([[34,25],[66,20],[112,25],[151,19],[198,28],[245,18],[289,25],[339,21],[343,30],[304,33],[263,27],[221,36],[177,29],[129,34],[87,27],[44,36]],'iceShade');
  p.poly([[48,23],[72,21],[98,25],[87,27],[61,26]],'iceLight');
  p.poly([[138,23],[151,19],[178,23],[167,26]],'snowShade');
  p.poly([[235,23],[247,19],[274,23],[262,27]],'ice');
  p.line(104,24,110,31,'deep');p.line(110,31,121,33,'deep');p.line(282,27,288,35,'waterLight');
  p.line(29,43,32,65,'ice');p.line(344,39,349,67,'iceShade');p.line(39,50,42,73,'iceShade');return;
 }
}
