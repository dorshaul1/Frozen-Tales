import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/gear-cargo.json'));
for(const[id,w,h,count]of [['gear-binoculars',24,24,1],['gear-probe',24,24,1],['gear-guide',24,24,1],['toolbelt',198,35,1],['handheld-tools',16,16,12]]){
 const d={...base,id,renderer:'modulesArt',frameSize:[w,h],description:'Native arctic personal tools: brass binoculars, sounding reel and field notebook; warm leather toolbelt and hand-use animation frames.',frames:Array.from({length:count},(_,index)=>({direction:'N',animation:'idle',index}))};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
