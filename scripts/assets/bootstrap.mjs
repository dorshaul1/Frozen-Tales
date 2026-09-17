import fs from 'node:fs';
import { PNG } from 'pngjs';
import { at, write, read, build, validate, png } from './core.mjs';
import { generate } from './generate.mjs';

const frame=(direction='none',animation='idle',index=0)=>({direction,animation,index});
const recipes=[
  {id:'kayak',type:'sprite',renderer:'kayak',frameSize:[48,60],description:'Cream fur hood, blue-green parka, rust-orange hull, lashed deck and wooden paddle. Exact original gameplay footprint.',frames:[frame('N'),...Array.from({length:3},(_,i)=>frame('N','paddle',i))],animations:{idle:{fps:1},paddle:{fps:6}}},
  {id:'water',type:'tile',renderer:'water',frameSize:[128,128],transparent:false,description:'Quiet seamless deep-blue water with sparse broken wavelets and broad low-contrast clusters.'},
  {id:'snow',type:'tile',renderer:'snow',frameSize:[128,128],transparent:false,description:'Seamless ivory snow, blue wind drifts and sparse clustered highlights.'},
  {id:'shore',type:'tile',renderer:'shore',frameSize:[32,16],transparent:false,description:'Left land, right water. Bank at x=20; stepped snow shelf and layered cyan submerged ice lip.',frames:Array.from({length:4},(_,i)=>frame('none','idle',i))},
  {id:'cabin',type:'prop',renderer:'cabin',frameSize:[72,72],description:'True overhead timber cabin roof, clustered snow cover, roof chimney, warm skylight and porch. No facade.'},
  {id:'dock',type:'prop',renderer:'dock',frameSize:[104,40],description:'Overhead weathered timber dock, grain, rope coil, posts and amber lantern. Collider stays 96×24 at frame offset (3,8).'},
  {id:'ice-small',collision:true,frames:[frame(),frame('none','idle',1),frame('none','idle',2)],type:'prop',renderer:'ice',frameSize:[56,40],description:'Irregular rounded/broken snow-capped floating ice floe, 48×32 collision footprint with 4px visual padding.'},
  {id:'ice-wide',collision:true,frames:[frame(),frame('none','idle',1),frame('none','idle',2)],type:'prop',renderer:'ice',frameSize:[72,48],description:'Irregular rounded/broken snow-capped floating ice floe, 64×40 collision footprint with 4px visual padding.'},
  {id:'ice-medium',collision:true,frames:[frame(),frame('none','idle',1),frame('none','idle',2)],type:'prop',renderer:'ice',frameSize:[64,48],description:'Irregular rounded/broken snow-capped floating ice floe, 56×40 collision footprint with 4px visual padding.'},
  {id:'ice-fragment',collision:true,type:'prop',renderer:'ice',frameSize:[24,20],description:'Small natural broken ice fragment, asymmetric cyan outline and pale snow cap.',frames:[frame(),frame('none','idle',1),frame('none','idle',2)]},
  {id:'rock',type:'prop',renderer:'rock',frameSize:[32,32],description:'Small overhead snow-capped slate rock cluster; lower-right cool shadow.',frames:[frame(),frame('none','idle',1)]},
  {id:'shrub',type:'prop',renderer:'vegetation',frameSize:[32,32],description:'Low top-down arctic pine tuft, radial branches, patchy snow. Never a side-view tree.',frames:[frame(),frame('none','idle',1)]},
  {id:'fish-spot',type:'sprite',renderer:'fish-spot',frameSize:[32,24],description:'Subtle dark fish silhouette under deep water. Bubbles are a separate in-game feedback effect.'},
  {id:'cargo-icon',type:'ui',renderer:'icon',frameSize:[16,16],description:'Small woven wood fish basket with a pale fish silhouette.'},
  {id:'coin-icon',type:'ui',renderer:'icon',frameSize:[16,16],description:'Restrained amber coin with upper-left pixel highlight.'},
];

recipes.push({...recipes[0],id:'kayak-upgraded',description:'The canonical kayak with a small strapped wicker storage basket behind the fisherman; same 32×40 canvas and hull.'});
for(const [id,frameSize] of [['tree-mature',[48,48]],['tree-young',[28,28]],['tree-bare',[40,40]],['frozen-bush',[24,24]],['dead-branch',[24,24]],['snow-log',[32,24]],['reeds',[16,24]]]) {
  recipes.push({id,type:'prop',renderer:'vegetation',frameSize,description:`Original true overhead arctic ${id}; shared pine/snow/wood palette, connected organic silhouette.`,frames:[frame(),frame('none','idle',1),frame('none','idle',2)]});
}
for(const [id,frameSize] of [['penguin',[32,32]],['polar-bear',[56,56]],['seal',[40,40]],['bird',[28,28]]]) {
  recipes.push({id,type:'sprite',renderer:'wildlife',frameSize,description:`Non-hostile ambient ${id}, strictly viewed from above; consistent arctic palette and fixed animation canvas.`,frames:['N','NE','E','SE','S','SW','W','NW'].flatMap(d=>[...Array.from({length:2},(_,i)=>frame(d,'idle',i)),...Array.from({length:4},(_,i)=>frame(d,'walk',i))]),animations:{idle:{fps:1},walk:{fps:id==='bird'?6:5}}});
}

for(const id of ['merchant','journal-keeper']) recipes.push({id,type:'sprite',renderer:'hubNpc',frameSize:[32,32],description:'Original arctic villager seen strictly from overhead: hood crown, mittens, boots and working hands. Warm merchant coat or blue journal keeper with book.',frames:Array.from({length:4},(_,i)=>frame('N','idle',i)),animations:{idle:{fps:2}}});
for(const id of ['fish-char','fish-whitefish','fish-salmon','fish-pike','fish-trout']) recipes.push({id,type:'ui',renderer:'fishPortrait',frameSize:[44,28],description:'Distinct natural overhead fish specimen with forked tail, fins, gills, small eyes and species markings. Native clean pixel clusters for gallery and cargo cards.'});
for(const id of ['gear-rod','gear-line','gear-reel','gear-bait','gear-cargo','gear-speed']) recipes.push({id,type:'ui',renderer:'gearIcon',frameSize:[24,24],description:'Readable handcrafted fishing equipment icon in wood, slate, cyan and amber from the canonical palette.'});
for(const [id,frameSize] of [['journal-hut',[56,56]],['hub-platform',[64,36]],['hub-crate',[24,24]],['hub-barrel',[24,24]],['hub-net',[32,24]],['hub-lantern',[16,20]],['tackle-rack',[40,28]]]) recipes.push({id,type:'prop',renderer:'hubProp',frameSize,description:'Original cozy arctic dock prop, directly overhead, textured wood, restrained warm light, native pixels.'});
for(const [id,frameSize] of [['hub-panel',[364,284]],['gear-card',[168,60]],['fish-card',[112,132]],['cargo-card',[168,54]]]) recipes.push({id,type:'ui',renderer:'uiSkin',frameSize,description:'Native pixel timber frame with brass corner pins and dark quiet inset. Four states: normal, selected, unavailable, mastered.',frames:Array.from({length:id==='hub-panel'?1:4},(_,i)=>frame('none','idle',i))});

recipes.push({id:'blue-ice-outcrop',type:'prop',renderer:'blueIce',frameSize:[84,64],description:'Fractured exposed cyan ice shelf with snow cap and deep cracks.'});

for(const recipe of recipes) {
  const def={transparent:true,padding:1,frames:[frame()],animations:{idle:{fps:1}},tags:[recipe.type,'arctic','canonical'],normalization:{fit:'exact'},...recipe,references:['assets/references/arctic-mood.png']};
  write(`assets/definitions/${def.id}.json`,def);generate(def,{provider:'procedural'},false);
}
build();
// Deliberate promotion: only bootstrap changes canonical references.
const referenceMap={kayak:'kayak',snow:'snow',water:'water',ice:'shore',cabin:'cabin',dock:'dock',pine:'tree-mature',penguin:'penguin',bear:'polar-bear',merchant:'merchant',fish:'fish-char',gear:'gear-rod'};
const manifest=read('assets/manifest.json');
for(const [name,id] of Object.entries(referenceMap)) {
  const asset=manifest.assets.find(a=>a.id===id);
  fs.copyFileSync(at(asset.frames[0].output),at(`assets/references/${name}-reference.png`));
}
const fisherman=new PNG({width:24,height:27});
PNG.bitblt(png('assets/references/kayak-reference.png'),fisherman,12,14,24,27,0,0);
fs.writeFileSync(at('assets/references/fisherman-reference.png'),PNG.sync.write(fisherman));
for(const asset of manifest.assets) {
  const reference=asset.id.startsWith('kayak')?'kayak':asset.id.startsWith('ice')?'ice':asset.id in referenceMap?asset.id:asset.id==='shore'?'ice':asset.id.startsWith('tree')||asset.id==='frozen-bush'?'pine':asset.id==='polar-bear'?'bear':asset.id.startsWith('fish-')?'fish':asset.id.startsWith('gear-')?'gear':asset.id==='journal-keeper'?'merchant':asset.id.startsWith('hub-')||asset.id==='journal-hut'||asset.id==='tackle-rack'?'cabin':'snow';
  asset.references=[`assets/references/${reference}-reference.png`,'assets/references/arctic-mood.png'];
  const def=read(`assets/definitions/${asset.id}.json`);def.references=asset.references;write(`assets/definitions/${asset.id}.json`,def);
}
write('assets/manifest.json',manifest);
write('assets/references/reference-status.json',{
  status:'Agent-selected canonical production baseline; not explicitly user-approved',
  mood:{file:'arctic-mood.png',provider:'Built-in image_gen',purpose:'Original material/mood reference only; not a final game sprite',prompt:'arctic-mood.prompt.txt'},
  nativeReferences:{...referenceMap,fisherman:'Crop of native kayak source, x12 y14 w24 h27'},
  promotion:'Run assets:bootstrap only for deliberate whole-set regeneration. Do not overwrite references casually.',
});
build();console.log(validate());
