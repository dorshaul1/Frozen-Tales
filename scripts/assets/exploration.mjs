import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const sprite=JSON.parse(fs.readFileSync('assets/definitions/gear-cargo.json')),shore=JSON.parse(fs.readFileSync('assets/definitions/shore-blue.json'));
for(const[id,w,h,count,opaque]of [['cave-water',128,128,3,true],['cave-mouth',176,64,3,false],['shore-cave',32,16,4,true],['cave-formation',64,64,3,false],['cave-falls',64,64,1,false],['cave-arch',384,96,1,false],['fish-cisco',44,28,1,false],['fish-glasschar',44,28,1,false],['fish-veil',44,28,1,false]]){
 const d={...(opaque?shore:sprite),id,renderer:'explorationArt',frameSize:[w,h],transparent:!opaque,description:'Original native-pixel arctic cave materials and anatomy-led cave fish: dark layered blue ice, submerged reflections, mineral facets and quiet deep pools.',frames:Array.from({length:count},(_,index)=>({direction:opaque?'none':'N',animation:'idle',index}))};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
