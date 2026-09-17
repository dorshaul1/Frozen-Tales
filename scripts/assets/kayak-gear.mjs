import {write,build,validate} from './core.mjs';
import {generate} from './generate.mjs';
for(const part of ['cargo','speed','rod','line','reel','bait']){
 const count=part==='speed'?15:3;
 const def={id:`kayak-gear-${part}`,frameSize:[48,60],type:'sprite',renderer:'kayakGear',transparent:true,padding:1,frames:Array.from({length:count},(_,index)=>({direction:'N',animation:'idle',index})),animations:{idle:{fps:1}},normalization:{fit:'exact'},tags:['kayak','equipment','modular'],description:`Original native overhead ${part} attachment, three purchased levels, fixed kayak canvas and shared anchor. Speed includes synchronized idle, three paddle poses and parked pose per tier.`,references:['assets/references/kayak-reference.png']};
 write(`assets/definitions/${def.id}.json`,def);generate(def,{provider:'procedural'},false);
}build();console.log(validate());
