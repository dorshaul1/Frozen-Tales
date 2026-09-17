import fs from 'node:fs';
import { generate } from './generate.mjs';
import { build,validate } from './core.mjs';
const base=JSON.parse(fs.readFileSync('assets/definitions/tree-mature.json'));
const entries=[
 ...['spruce','fir','spire','pine','weathered','snowbound'].map(t=>({id:'tree-'+t,renderer:'vegetation',frameSize:[48,48],count:3,description:`Overhead ${t} with distinct branching, layered needles, exposed timber and snow pillows.`})),
 {id:'geology-rock',renderer:'environmentArt',frameSize:[44,40],count:6,description:'Rounded, sharp, buried, blue ice, fractured glacier and drift-covered rock studies.'},
 {id:'snow-detail',renderer:'environmentArt',frameSize:[96,64],count:5,description:'Sparse feathered drift, wind scour, ice patch, old tracks and uneven snow clusters.'},
 ...['rock','blue'].map(t=>({id:'shore-'+t,renderer:'shore',frameSize:[32,16],count:4,transparent:false,description:`Contour material: ${t} shoreline with fixed bank at x20, submerged lip and snow transition.`}))
];
for(const e of entries){const {count,...d}=e;const def={...base,...d,frames:Array.from({length:count},(_,index)=>({direction:'none',animation:'idle',index})),references:['assets/references/snow-reference.png','assets/references/ice-reference.png','assets/references/pine-reference.png']};fs.writeFileSync(`assets/definitions/${d.id}.json`,JSON.stringify(def,null,2)+'\n');generate(def,undefined,false);}
build();console.log(validate());
