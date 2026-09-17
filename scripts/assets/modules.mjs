import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/gear-cargo.json'));
for(const[id,w,h,count]of [['workshop-service-dock',104,80,1],['module-card',210,112,1],['gear-mount',24,24,1],['kayak-gear-mount',48,60,2]]){
 const d={...base,id,renderer:'modulesArt',frameSize:[w,h],type:id==='module-card'?'ui':'sprite',description:'Native arctic workshop artwork: worn timber, steel bracing, warm brass and pixel snow. Clear repair berth and aligned kayak equipment.',frames:Array.from({length:count},(_,index)=>({direction:'N',animation:'idle',index}))};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
