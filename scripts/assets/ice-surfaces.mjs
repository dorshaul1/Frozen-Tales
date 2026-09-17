import fs from 'node:fs';
import { PNG } from 'pngjs';
import { generate } from './generate.mjs';
import { build,validate } from './core.mjs';
// Rebuild surface artwork while asserting that the established floe masks survive.
for(const id of ['ice-small','ice-wide','ice-medium','ice-fragment']){
 const d=JSON.parse(fs.readFileSync(`assets/definitions/${id}.json`));
 const files=d.frames.map(f=>`assets/source/${id}/${f.direction.toLowerCase()}-${f.animation}-${f.index}.png`);
 const alpha=path=>PNG.sync.read(fs.readFileSync(path)).data.filter((_,i)=>i%4===3);
 const before=files.map(alpha);generate(d,undefined,false);
 files.forEach((file,i)=>{if(!before[i].equals(alpha(file)))throw Error(`Collision silhouette changed: ${file}`);});
}
generate(JSON.parse(fs.readFileSync('assets/definitions/wilderness-formation.json')),undefined,false);
build();console.log(validate());console.log('All floe collision alpha pixels unchanged');
