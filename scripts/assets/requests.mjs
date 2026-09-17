import {write,build,validate} from './core.mjs';
import {generate} from './generate.mjs';
const def={id:'request-board',frameSize:[38,32],type:'sprite',renderer:'requestBoard',transparent:true,padding:1,frames:[{direction:'none',animation:'idle',index:0}],animations:{idle:{fps:1}},normalization:{fit:'exact'},tags:['village','requests'],description:'Small snow-capped timber noticeboard, two pinned cream notes, native arctic palette. Narrow timber feet.',references:['assets/references/cabin-reference.png']};
write('assets/definitions/request-board.json',def);generate(def,{provider:'procedural'},false);build();console.log(validate());
