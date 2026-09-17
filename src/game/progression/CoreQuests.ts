import {CORE_QUESTS,coreState,type CoreState,type Feature,type QuestId} from './coreData';
export class CoreQuests {
 readonly state:CoreState;
 constructor(raw:unknown,private persist:(state:CoreState)=>boolean,private reward:(feature:Feature,message:string)=>void){this.state=coreState(raw);}
 has(f:Feature){return this.state.features.includes(f);}
 status(id:QuestId){const q=this.state.quests[id];if(q)return q.phase;if(this.has(CORE_QUESTS[id].feature))return 'completed';const pre=CORE_QUESTS[id].prerequisite;return (pre?this.has(pre):this.state.sold)?'available':'locked';}
 private change(fn:()=>void){const before=JSON.stringify(this.state);fn();if(!this.persist(this.state)){Object.assign(this.state,JSON.parse(before));throw Error('Could not save progress. Please try again.');}}
 sale(){if(!this.state.sold)this.change(()=>{this.state.sold=true;});}
 start(id:QuestId,dev=false){if(!dev&&this.status(id)!=='available')return;this.change(()=>{this.state.quests[id]={phase:'active',done:CORE_QUESTS[id].objectives.map(()=>false)};});}
 observe(id:QuestId,index:number){const q=this.state.quests[id];if(q?.phase!=='active'||q.done[index]!==false)return;this.change(()=>{q.done[index]=true;if(q.done.every(Boolean))q.phase='return';});}
 catch(species:string){if(['char','pike','dolly'].includes(species))this.observe('knowledge',0);}
 complete(id:QuestId,dev=false){if(!dev&&this.status(id)!=='return')return;const def=CORE_QUESTS[id];this.change(()=>{this.state.quests[id]={phase:'completed',done:def.objectives.map(()=>true)};if(!this.has(def.feature))this.state.features.push(def.feature);});this.reward(def.feature,def.reward);}
 setFeature(f:Feature,on:boolean){this.change(()=>{this.state.features=this.state.features.filter(x=>x!==f);if(on)this.state.features.push(f);});this.reward(f,on?`${f} unlocked`:`${f} locked`);}
 reset(id:QuestId){this.change(()=>{delete this.state.quests[id];this.state.features=this.state.features.filter(f=>f!==CORE_QUESTS[id].feature);});this.reward(CORE_QUESTS[id].feature,'Quest reset');}
}
