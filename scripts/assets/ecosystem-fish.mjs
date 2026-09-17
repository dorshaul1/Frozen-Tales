import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/fish-cisco.json'));
for(const id of ['smelt','ember','sturgeon']){const d={...base,id:'fish-'+id,renderer:'ecosystemFish',description:'Original anatomy-led river fish portrait: distinct body proportions, fins, tail and native-pixel shading.'};fs.writeFileSync('assets/definitions/'+d.id+'.json',JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);}build();console.log(validate());
