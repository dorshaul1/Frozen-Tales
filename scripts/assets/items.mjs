import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/gear-cargo.json'));
for(const id of ['rod-model-0','rod-model-1','rod-model-2','rod-model-3','gear-turbo','gear-hull','kayak-gear-turbo','kayak-gear-hull']){
 const attached=id.startsWith('kayak-');
 const d={...base,id,renderer:'modulesArt',frameSize:attached?[48,60]:[24,24],description:'Original native arctic equipment: distinct fishing rod models, compact rust motor and fitted steel hull rails. Shared snow, timber and blue steel palette.',frames:[{direction:'N',animation:'idle',index:0}]};
 fs.writeFileSync('assets/definitions/'+id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
