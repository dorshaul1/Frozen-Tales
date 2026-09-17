import { FISH,type FishId } from '../fishing/data';
import type { CaughtFish,CatchRecords } from '../player/Cargo';
import type { Conditions } from '../world/conditions';
import type { AreaId } from '../world/spawnRules';
export interface RequestDefinition { id:string; label:string; target:number; reward:number; kind:'catch'|'species'|'weight'|'sale'|'snow'|'large'|'area'; fish?:FishId; kg?:number; area?:AreaId }
export const REQUESTS:RequestDefinition[]=[
 {id:'supper',label:'Catch 3 fish for supper',target:3,reward:24,kind:'catch'},
 {id:'whitefish',label:'Catch 3 Whitefish',target:3,reward:22,kind:'species',fish:'whitefish'},
 {id:'char',label:'Catch 2 Arctic Char',target:2,reward:25,kind:'species',fish:'char'},
 {id:'salmon',label:'Catch 2 Salmon',target:2,reward:38,kind:'species',fish:'salmon'},
 {id:'pike',label:'Catch a Northern Pike',target:1,reward:34,kind:'species',fish:'pike'},
 {id:'weight',label:'Catch a fish over 1.5 kg',target:1,reward:20,kind:'weight',kg:1.5},
 {id:'market',label:'Sell $40 worth of fish',target:40,reward:28,kind:'sale'},
 {id:'snow',label:'Catch a fish during snow',target:1,reward:22,kind:'snow'},
 {id:'large',label:'Catch at a broad-shadow spot',target:1,reward:28,kind:'large'},
 {id:'bend',label:'Catch 2 fish in Blue Ice Bend',target:2,reward:55,kind:'area',area:'bend'},
 {id:'lake',label:'Catch a fish in Frozen Lake',target:1,reward:46,kind:'area',area:'lake'},
];
export interface DailyState { day:number; history:string[]; active:{id:string;progress:number;claimed:boolean}[] }
export class DailyRequests {
 state:DailyState={day:-1,history:[],active:[]};
 constructor(raw:unknown){const s=raw as DailyState|undefined;if(s&&Number.isSafeInteger(s.day)&&s.day>=0&&Array.isArray(s.active)&&Array.isArray(s.history)){
 this.state={day:s.day,history:s.history.filter(id=>REQUESTS.some(d=>d.id===id)).slice(-6),active:[]};
 for(const r of s.active.slice(0,3)){const d=REQUESTS.find(d=>d.id===r?.id);if(d&&!this.state.active.some(a=>a.id===d.id)&&Number.isFinite(r.progress))this.state.active.push({id:d.id,progress:Math.max(0,Math.min(d.target,Math.floor(r.progress))),claimed:r.claimed===true&&r.progress>=d.target});}
 }}
 newDay(day:number,records:CatchRecords,c:Conditions,areas:ReadonlySet<string>,random=Math.random){
 if(this.state.day===day&&this.state.active.length)return false;
 const previous=this.state.active.map(r=>r.id),history=[...this.state.history,...previous].slice(-6);
 const eligible=REQUESTS.filter(d=>(!d.fish||FISH[d.fish].fight.struggleStrength<=.08||!!records[d.fish])&&(!d.area||areas.has(d.area))&&(d.kind!=='snow'||c.weather==='light-snow'||c.weather==='heavy-snow'));
 const ranked=eligible.map(d=>({d,rank:(previous.includes(d.id)?10:history.includes(d.id)?3:0)+random()})).sort((a,b)=>a.rank-b.rank);
 this.state={day,history,active:ranked.slice(0,random()<.5?2:3).map(({d})=>({id:d.id,progress:0,claimed:false}))};return true;
 }
 catch(fish:CaughtFish,area:AreaId,c:Conditions,large:boolean){return this.track(d=>d.kind==='catch'||d.kind==='species'&&fish.type===d.fish||d.kind==='weight'&&fish.weightKg>d.kg!||d.kind==='snow'&&['light-snow','heavy-snow'].includes(c.weather)||d.kind==='large'&&large||d.kind==='area'&&d.area===area?1:0);}
 sale(earnings:number){return this.track(d=>d.kind==='sale'?Math.max(0,earnings):0);}
 private track(amount:(d:RequestDefinition)=>number){let changed=false;for(const r of this.state.active){const d=REQUESTS.find(d=>d.id===r.id)!;const next=Math.min(d.target,r.progress+amount(d));if(next!==r.progress){r.progress=next;changed=true;}}return changed;}
 claim(index:number){const r=this.state.active[index],d=REQUESTS.find(d=>d.id===r?.id);if(!r||!d||r.claimed||r.progress<d.target)return 0;r.claimed=true;return d.reward;}
}
