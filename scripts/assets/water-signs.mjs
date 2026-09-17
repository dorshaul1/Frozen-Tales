import {write,build,validate} from './core.mjs';
import {generate} from './generate.mjs';
const def={id:'water-shadow',frameSize:[48,32],type:'sprite',renderer:'waterShadow',transparent:true,padding:1,frames:Array.from({length:9},(_,i)=>i).map(index=>({direction:'none',animation:'idle',index})),animations:{idle:{fps:1}},normalization:{fit:'exact'},tags:['water','fishing'],description:'Three anonymous underwater fish silhouettes: small, broad and swift. Fins and tapered tails, dark water palette, no species markings.',references:['assets/references/fish-reference.png']};
write('assets/definitions/water-shadow.json',def);generate(def,{provider:'procedural'},false);build();console.log(validate());
