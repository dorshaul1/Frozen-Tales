// Mounted lights inherit the building's ground depth; only free-standing posts add bodies.
export const VILLAGE_FIXTURES = [
 {id:'path-lantern',x:324,y:1028,baseY:1050,radius:23,post:true},
 {id:'path-lantern',x:242,y:1050,baseY:1072,radius:22,post:true},
 {id:'path-lantern',x:322,y:1235,baseY:1257,radius:24,post:true},
 {id:'path-lantern',x:644,y:1194,baseY:1216,radius:23,post:true},
 {id:'wall-lantern',x:250,y:936,baseY:958,radius:19,post:false},
 {id:'hanging-lantern',x:231,y:1138,baseY:1160,radius:23,post:false},
 {id:'hanging-lantern',x:201,y:1290,baseY:1316,radius:22,post:false},
 {id:'wall-lantern',x:485,y:970,baseY:981,radius:21,post:false},
 {id:'wall-lantern',x:467,y:1294,baseY:1316,radius:20,post:false},
] as const;
for(const f of VILLAGE_FIXTURES)Object.assign(f,{x:f.x+1500,y:f.y+1500,baseY:f.baseY+1500});
export const fixturePostRadius=3;
export const fixtureSource=(f:typeof VILLAGE_FIXTURES[number])=>({x:f.x+(f.id==='wall-lantern'?10:8),y:f.y+(f.id==='path-lantern'?10:f.id==='wall-lantern'?10:13)});
