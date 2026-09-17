import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
for(const id of ['dace','perch','chub','pickerel','sucker','whitebass','bream','huchen','taimen','sculpin','eel','lanternfin'])generate(JSON.parse(fs.readFileSync(`assets/definitions/fish-${id}.json`)),undefined,false);
build();console.log(validate());
