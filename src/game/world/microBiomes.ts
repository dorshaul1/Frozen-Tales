import type { AssetId } from '../assets/catalog';
// Authored compositions: offsets are deliberate, not a procedural scatter recipe.
type Piece=readonly [number,number,AssetId,number];
export const MICRO_BIOMES: readonly {name:string;y:number;side:number;shore?:AssetId;pieces:readonly Piece[]}[]=[
 {name:'Old Spruce Grove',y:510,side:-1,pieces:[[-72,-61,'tree-spruce',0],[-23,-55,'tree-fir',1],[-96,-24,'tree-spruce',2],[-53,-20,'tree-ancient',0],[33,-5,'tree-young',1],[-89,25,'tree-snowbound',0],[-37,76,'tree-spruce',1],[24,60,'snow-log',1]]},
 {name:'Windward Snowfield',y:1600,side:1,pieces:[[-8,-65,'snow-detail',1],[85,-25,'snow-detail',1],[17,64,'snow-detail',1],[122,75,'dead-branch',2],[100,-91,'geology-rock',2]]},
 {name:'Cobalt Shelves',y:2390,side:1,shore:'shore-blue',pieces:[[0,-67,'geology-rock',4],[55,-30,'blue-ice-outcrop',0],[-10,40,'geology-rock',3],[84,72,'geology-rock',4],[139,10,'tree-spire',1],[145,77,'tree-spruce',2]]},
 {name:'Trapper’s Rest',y:3000,side:-1,shore:'shore-rock',pieces:[[-40,-12,'abandoned-shelter',0],[-90,-75,'tree-weathered',1],[37,-56,'tree-bare',2],[-98,28,'tree-bare',1],[23,60,'tree-weathered',2],[-44,79,'snow-log',0]]},
 {name:'Still Shore',y:3290,side:1,pieces:[[12,-67,'tree-snowbound',1],[73,-25,'tree-fir',0],[15,55,'snow-detail',0],[120,73,'frozen-bush',1]]},
 {name:'Fractured Flats',y:3820,side:-1,shore:'shore-blue',pieces:[[-40,-76,'geology-rock',4],[-104,-19,'snow-detail',2],[-88,67,'geology-rock',3],[28,83,'dead-branch',1]]},
 {name:'Shattered Wall',y:4610,side:-1,shore:'shore-rock',pieces:[[-57,-30,'broken-glacier',0],[-109,-73,'geology-rock',1],[48,37,'geology-rock',4],[-74,88,'geology-rock',3]]},
 {name:'Needle Passage',y:5020,side:1,shore:'shore-rock',pieces:[[5,-72,'geology-rock',1],[50,-26,'geology-rock',4],[10,38,'geology-rock',1],[90,85,'tree-weathered',0]]},
];
