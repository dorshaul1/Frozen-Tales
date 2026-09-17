import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/workshop-service-dock.json'));
for(const[id,w,h]of [['workshop-service-dock',208,136],['workshop-parts',64,48]]){
 const d={...base,id,renderer:'villageYardArt',frameSize:[w,h],description:'Handcrafted native top-down arctic repair yard: shore-fast plank decking, an open kayak slip, a hand-cranked hoist, spare hull and repair equipment. Original palette, no antialiasing.',frames:[{direction:'N',animation:'idle',index:0}]};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
