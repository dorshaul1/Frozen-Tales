import { read, write, build, validate } from './core.mjs';
import { generate } from './generate.mjs';
for (const id of ['grayling','burbot','crown']) {
 const definition={...read('assets/definitions/fish-trout.json'),id:`fish-${id}`,description:'Original native pixel-art specimen: silver sail-finned grayling, mottled barbel-bearing burbot, or pale armored sturgeon with golden scutes. Distinct fins, anatomy and silhouette; canonical fish palette.'};
 write(`assets/definitions/fish-${id}.json`,definition);generate(definition,{provider:'procedural'},false);
}
build();console.log(validate());
