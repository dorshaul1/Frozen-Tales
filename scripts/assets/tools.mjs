import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/merchant.json'));
const assets=[['tools-keeper',32,32,4],['village-tools',76,44,1],['village-tools-lights',76,44,1],['village-sign-tools',26,30,1],['village-sign-kayak',26,30,1]];
for(const id of ['lantern','finder','icebreaker','cover'])assets.push(['gear-'+id,24,24,1],['kayak-gear-'+id,48,60,1]);
for(const[id,w,h,count]of assets){
 const d={...base,id,renderer:'toolsArt',frameSize:[w,h],type:id.startsWith('gear-')?'ui':'sprite',description:'Original native pixel village tools artwork: layered pine-green canvas, worn timber, brass lantern and cold steel. Shared arctic palette and overhead anchors.',frames:Array.from({length:count},(_,index)=>({direction:'N',animation:'idle',index})),animations:{idle:{fps:2}}};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
