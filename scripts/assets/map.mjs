import {write,build,validate} from './core.mjs';
import {generate} from './generate.mjs';
for(const[id,frameSize,count]of [['map-frame',[420,280],1],['map-marker',[8,8],4]]){
 const def={id,frameSize,type:'ui',renderer:'mapArt',transparent:true,padding:1,frames:Array.from({length:count},(_,index)=>({direction:'none',animation:'idle',index})),animations:{idle:{fps:1}},normalization:{fit:'exact'},tags:['map','arctic'],description:'Original compact timber chart frame and small hand-drawn map symbols, shared native palette, crisp pixels.',references:['assets/references/cabin-reference.png','assets/references/fish-reference.png']};
 write(`assets/definitions/${id}.json`,def);generate(def,{provider:'procedural'},false);
}
build();console.log(validate());
