import {VILLAGE_SHIFT} from '../world/regionNetwork';
export const WORKSHOP_BAY = { x:550,y:1354,radius:25,maxSpeed:18,dockX:404,dockY:1270, rails:[[406,1274,90,124],[496,1274,106,46],[496,1386,106,12]] as const };
// Handcrafted village geometry. Shared by walking, decoration and wildlife exclusion.
export const VILLAGE = {
  requestBoard: { x:430, y:1168, radius:32 },
  forecastBoard: {x:543,y:1016},
  square: {x:365,y:1160},
  corgiHome: {x:280,y:992},
  ground: {x:50,y:820,width:650,height:700},
  walkSpeed: 90, playerRadius: 10, talkDistance: 38,
  dock: { x: 674, y: 1216, landX: 630, landY: 1216, radius: 30, maxSpeed: 18 },
  boundary: [[125,885],[250,858],[409,875],[551,899],[570,991],[565,1118],[544,1185],[558,1197],[649,1197],[649,1236],[518,1236],[500,1260],[500,1420],[410,1470],[210,1480],[105,1410],[85,1260],[90,1060]] as [number, number][],
  buildings: [
    { asset: 'village-igloo', x: 180, y: 900, bodies: [[9,10,55,48],[5,25,67,27],[60,36,29,22]], lights: [[45,18],[86,47]], smoke: null },
    { asset: 'village-research', x: 438, y: 910, bodies: [[8,8,48,59],[53,29,36,32],[15,61,39,10]], lights: [[23,45]], smoke: [44,17] },
    { asset: 'village-market', x: 150, y: 1090, bodies: [[7,7,55,48],[63,15,25,35],[6,47,86,23]], lights: [[24,35]], smoke: [48,16] },
    { asset: 'village-workshop', x: 396, y: 1250, bodies: [[7,8,79,43],[7,47,31,25],[42,53,48,13]], lights: [[54,37]], smoke: [67,18] },
    { asset: 'village-tools', x: 145, y: 1280, bodies: [[4,4,64,25],[4,26,14,10]], lights: [[52,19]], smoke: null },
  ] as const,
  npcs: {
    seller: { x: 210, y: 1198, asset: 'fish-seller', label: 'E — Nessa · sell fish', view: 'cargo' },
    merchant: { x: 528, y: 1310, asset: 'merchant', label: 'E — Kayak Workshop', view: 'gear' },
    tools: { x: 242, y: 1302, asset: 'tools-keeper', label: 'E — Edda · player gear', view: 'tools' },
    keeper: { x: 491, y: 1020, asset: 'journal-keeper', label: 'E — Ivo · field guide', view: 'journal' },
  } as const,
  // One circulation loop; direct spurs serve the quieter districts.
  pathWidths:[21,18,15,15,13,13,16,13,12,12] as readonly number[],
  paths: [
    [[630,1216],[540,1216],[480,1216],[380,1216],[285,1216]],
    [[285,1216],[270,1170],[270,1110],[302,1070],[440,1070],[480,1115],[480,1216]],
    [[302,1070],[303,1010],[302,963],[279,947]],
    [[440,1070],[474,1051],[491,1043]],
    [[285,1216],[253,1216],[237,1198]],
    [[285,1216],[284,1260],[282,1302],[269,1302]],
    [[380,1216],[356,1260],[354,1330],[400,1345],[469,1345]],
    [[354,1330],[333,1375],[302,1390]],
    [[302,1390],[256,1410],[238,1430]],
    [[491,1043],[520,1042],[525,1036]],
  ] as [number, number][][],
  props: [
    // Square: one readable landmark ensemble, surrounded by clean open snow.
    ['village-beacon',338,1085],['village-firepit',360,1165],
    ['village-bench',295,1170],['village-bench',406,1100],['village-lamp',493,1170],
    // Fish market: a working yard to the west, an uncluttered customer apron below.
    ['village-sign-coin',102,1082],['village-fish-crate',132,1190],
    ['village-drying-rack',105,1044],['hub-net',98,1120],
    ['hub-barrel',99,1173],
    // Equipment store and its supply court, kept away from the square.
    ['village-sign-tools',112,1275],['market-canopy',136,1372],
    ['winter-equipment',199,1338],['village-sled',100,1330],
    // Home: open snow garden; every object has its own clear footprint.
    ['village-woodpile',134,925],['village-lamp',277,901],
    ['village-bench',212,1000],['village-fabric-line',177,866],
    // Research instruments and map board sit to the side, never across the entrance.
    ['village-sign-book',538,954],['research-instruments',382,937],
    ['hub-crate',537,908],['village-lamp',443,1012],
    // Social clearing, offset from the working harbor.
    ['communal-table',277,1421],['village-firepit',268,1352],
    ['village-bench',340,1380],['village-lamp',342,1433],
    // Compact utility cluster; empty lane between shed and shared table.
    ['village-storage',111,1430],['village-cart',177,1436],
    ['hub-barrel',93,1410],['village-woodpile',165,1480],
    // Harbor: retain the shore-fast servicing slip; clear its village-facing edge.
    ['village-sign-kayak',507,1246],
    ['workshop-parts',410,1357],
    ['village-lamp',379,1394],['village-lamp',567,1280],
    ['harbor-landing',580,1144],['village-rope',600,1218],
  ] as const,
  scenery: [
    ['tree-mature',78,866,0],['tree-mature',116,831,2],['tree-young',161,841,0],
    ['tree-mature',62,960,1],['tree-young',92,993,2],['frozen-bush',109,1006,1],
    ['tree-mature',338,890,0],['tree-young',375,866,1],['rock',409,869,1],
    ['tree-mature',47,1155,2],['tree-young',65,1207,1],['snow-log',72,1247,0],
    ['tree-young',329,967,2],['frozen-bush',351,1010,1],
    ['tree-mature',574,904,1],['tree-young',609,936,0],['tree-bare',594,1000,2],
    ['tree-mature',68,1483,1],['tree-young',113,1527,2],['tree-bare',159,1540,1],
    ['tree-mature',300,1510,2],['tree-young',347,1532,1],['frozen-bush',407,1480,2],
    ['dead-branch',224,1518,0],['rock',66,1382,0],['village-snowbank',51,1303,3],
  ] as const,

};
// Stable service IDs and local composition survive world recomposition.
const shiftPoint=(p:{x:number;y:number})=>Object.assign(p,{x:p.x+VILLAGE_SHIFT.x,y:p.y+VILLAGE_SHIFT.y});
for(const p of [VILLAGE.requestBoard,VILLAGE.forecastBoard,VILLAGE.square,VILLAGE.corgiHome,VILLAGE.ground,VILLAGE.dock,...VILLAGE.buildings,...Object.values(VILLAGE.npcs),WORKSHOP_BAY])shiftPoint(p);
Object.assign(VILLAGE.dock,{landX:VILLAGE.dock.landX+VILLAGE_SHIFT.x,landY:VILLAGE.dock.landY+VILLAGE_SHIFT.y});
Object.assign(WORKSHOP_BAY,{dockX:WORKSHOP_BAY.dockX+VILLAGE_SHIFT.x,dockY:WORKSHOP_BAY.dockY+VILLAGE_SHIFT.y});
for(const p of [...VILLAGE.boundary,...VILLAGE.paths.flat()]){p[0]+=VILLAGE_SHIFT.x;p[1]+=VILLAGE_SHIFT.y;}
for(const p of [...VILLAGE.props,...VILLAGE.scenery])Object.assign(p,{1:p[1]+VILLAGE_SHIFT.x,2:p[2]+VILLAGE_SHIFT.y});
for(const p of WORKSHOP_BAY.rails)Object.assign(p,{0:p[0]+VILLAGE_SHIFT.x,1:p[1]+VILLAGE_SHIFT.y});
export type VillageRect = { x: number; y: number; width: number; height: number; radius?: number };
export const BUILDING_BODIES: VillageRect[] = VILLAGE.buildings.flatMap(b => b.bodies.map(([x,y,width,height]) => ({ x: b.x+x, y: b.y+y, width, height })));
export function insideVillage(x: number, y: number) {
  let inside = false;
  const points = VILLAGE.boundary;
  for (let i=0,j=points.length-1;i<points.length;j=i++) {
    const [ax,ay]=points[i],[bx,by]=points[j];
    if ((ay>y)!==(by>y) && x<(bx-ax)*(y-ay)/(by-ay)+ax) inside=!inside;
  }
  return inside;
}
export function villageReserved(x: number, y: number, margin = 45) {
  // Reserve a small framing strip for the authored settlement and nearby scenery as well.
  return x > 60+VILLAGE_SHIFT.x-margin && x < 650+VILLAGE_SHIFT.x+margin && y > 850+VILLAGE_SHIFT.y-margin && y < 1510+VILLAGE_SHIFT.y+margin;
}
export function canWalk(x: number, y: number, obstacles: readonly VillageRect[] = BUILDING_BODIES) {
  const radius=VILLAGE.playerRadius;
  for(let i=0;i<12;i++) if(!insideVillage(x+Math.cos(i*Math.PI/6)*radius,y+Math.sin(i*Math.PI/6)*radius))return false;
  return !obstacles.some(r => r.radius !== undefined ? Math.hypot(x-r.x,y-r.y)<radius+r.radius : Math.hypot(x-Math.max(r.x,Math.min(x,r.x+r.width)),y-Math.max(r.y,Math.min(y,r.y+r.height)))<radius);
}
