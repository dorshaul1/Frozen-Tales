import { write, build, validate } from './core.mjs';
import { generate } from './generate.mjs';
const frame=(direction='none',animation='idle',index=0)=>({direction,animation,index});
const definitions=[
 {id:'village-snowbank',type:'prop',renderer:'villageProp',frameSize:[64,48],frames:Array.from({length:6},(_,i)=>frame('none','idle',i))},
 {id:'fisherman',type:'sprite',renderer:'villagePerson',frameSize:[32,32],frames:['N','NE','E','SE','S','SW','W','NW'].flatMap(d=>[frame(d),frame(d,'idle',1),...Array.from({length:4},(_,i)=>frame(d,'walk',i))]),animations:{idle:{fps:1},walk:{fps:7}}},
 {id:'fish-seller',type:'sprite',renderer:'villagePerson',frameSize:[32,32],frames:Array.from({length:4},(_,i)=>frame('N','idle',i)),animations:{idle:{fps:2}}},
 ...['kayak-empty','kayak-empty-upgraded'].map(id=>({id,type:'sprite',renderer:'kayak',frameSize:[48,60],frames:[frame('N')]})),
 ...['village-igloo-lights','village-market-lights','village-workshop-lights','village-research-lights'].map(id=>({id,type:'sprite',renderer:'settlementLights',frameSize:[96,80]})),
 ...['village-lamp','village-lamp-light'].map(id=>({id,type:'prop',renderer:'settlementDetail',frameSize:[24,32]})),
 ...['village-igloo','village-market','village-workshop','village-research'].map(id=>({id,type:'prop',renderer:'settlementBuilding',frameSize:[96,80]})),
 ...[['village-bench',[40,24]],['village-sled',[48,28]],['village-drying-rack',[48,28]],['village-fabric-line',[56,28]],['village-rope',[24,24]],['village-cart',[40,32]],['village-storage',[48,40]]].map(([id,frameSize])=>({id,type:'prop',renderer:'settlementDetail',frameSize})),
 {id:'village-firepit',type:'sprite',renderer:'settlementDetail',frameSize:[28,28],frames:Array.from({length:6},(_,i)=>frame('none','idle',i)),animations:{idle:{fps:6}}},
 ...['coin','rod','book'].map(icon=>({id:`village-sign-${icon}`,type:'prop',renderer:'villageProp',frameSize:[26,28]})),
 ...['village-woodpile','village-fish-crate'].map(id=>({id,type:'prop',renderer:'villageProp',frameSize:[32,24]})),
];
for(const recipe of definitions) {
 const def={transparent:true,padding:1,frames:[frame()],animations:{idle:{fps:1}},tags:['arctic','village'],normalization:{fit:'exact'},description:'Original native overhead village artwork: canonical fur hood, timber, layered snow, connected material highlights. No facade or perspective tilt.',references:['assets/references/fisherman-reference.png','assets/references/merchant-reference.png','assets/references/cabin-reference.png'],...recipe};
 write(`assets/definitions/${def.id}.json`,def);generate(def,{provider:'procedural'},false);
}
build();console.log(validate());
