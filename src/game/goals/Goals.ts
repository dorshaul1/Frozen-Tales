/** Permanent objectives. Daily request rotation and Core Mission unlocks live elsewhere. */
export interface GoalContext {now:number;species:string[];caught:boolean;home:boolean;sold:boolean;cartographer:boolean;chart:boolean;upgraded:boolean;regions:string[];journal:boolean;forecast:boolean;capacity:number;count:number;landmarks?:string[];landings?:string[];landingTotal?:number;regionTotal?:number;modules?:number;trophies?:number;npcs?:string[];npcTotal?:number;wildlife?:string[];wildlifeTotal?:number}
export type Scope='short'|'medium'|'long';
export interface Goal {id:string;type:string;title:string;detail:string;target:number;progress:number;seen:string[];completeAt?:number;starter?:string;region?:string;scope:Scope;reward:number;icon:string}
export interface GoalState {version:2;serial:number;current:Goal[];starters:string[];recent:string[];collapsed:boolean;journal:boolean;talked:boolean;completed:Record<string,number>;pins:string[];unpinned:string[];met:string[];wildlife:string[]}
interface Definition {id:string;title:string;detail:string;scope:Scope;icon:string;target:number;requires?:string[];metric:(c:GoalContext,s:GoalState)=>number;available?:(c:GoalContext)=>boolean;effort:number;stage:number;rarity?:number}
// One balance surface: time/steps (effort), progression stage and rarity premium.
export const REWARDS={base:10,effort:15,stage:20,rarity:25};
export const objectiveReward=(d:Pick<Definition,'effort'|'stage'|'rarity'>)=>Math.round((REWARDS.base+d.effort*REWARDS.effort+d.stage*REWARDS.stage+(d.rarity??0)*REWARDS.rarity)/5)*5;
const yes=(v:boolean)=>v?1:0;
export const OBJECTIVES:Definition[]=[
 {id:'first',title:'First catch',detail:'Catch your first fish.',scope:'short',icon:'fish',target:1,effort:0,stage:0,metric:c=>yes(c.caught)},
 {id:'home',title:'Bring it home',detail:'Return to the village with your catch.',scope:'short',icon:'home',target:1,requires:['first'],effort:0,stage:0,metric:c=>yes(c.sold||c.caught&&c.home)},
 {id:'sale',title:'Sell your haul',detail:'Sell fish at the village Fish Seller.',scope:'short',icon:'coin',target:1,requires:['home'],effort:1,stage:0,metric:c=>yes(c.sold)},
 {id:'cartographer',title:'Meet the Cartographer',detail:'Mara knows the river. Lookout Point · western river north.',scope:'short',icon:'map',target:1,requires:['sale'],effort:2,stage:0,metric:(c,s)=>yes(c.cartographer||s.talked||c.chart)},
 {id:'chart',title:'Learn the river',detail:'Help Mara with her Core Mission to unlock the River Chart.',scope:'short',icon:'map',target:1,requires:['cartographer'],effort:2,stage:0,metric:c=>yes(c.chart)},
 {id:'upgrade',title:'Better equipment',detail:'Buy a better rod, a player tool or a kayak module.',scope:'short',icon:'gear',target:1,requires:['sale'],effort:1,stage:0,metric:c=>yes(c.upgraded)},
 {id:'species',title:'Another river visitor',detail:'Record two different fish species.',scope:'medium',icon:'fish',target:2,requires:['first'],effort:2,stage:0,metric:c=>new Set(c.species).size},
 {id:'journal',title:'Know your catch',detail:'Open the Fish Journal at the village.',scope:'short',icon:'book',target:1,requires:['sale'],effort:0,stage:0,metric:(c,s)=>yes(c.journal||s.journal)},
 {id:'region',title:'A wider world',detail:'Visit two major regions. Use the River Chart and signs.',scope:'short',icon:'map',target:2,requires:['chart'],effort:2,stage:1,metric:c=>new Set(c.regions).size},
 {id:'five-species',title:'A varied catch',detail:'Record five unique fish species across your trips.',scope:'medium',icon:'fish',target:5,requires:['species'],effort:4,stage:1,metric:c=>new Set(c.species).size},
 {id:'landmarks',title:'Learn the landmarks',detail:'Discover three major landmarks along the river.',scope:'medium',icon:'map',target:3,requires:['chart'],effort:3,stage:1,metric:c=>new Set(c.landmarks??[]).size},
 {id:'loadout',title:'Prepared kayak',detail:'Install three modules at once at the Kayak Workshop.',scope:'medium',icon:'gear',target:3,requires:['upgrade'],effort:4,stage:1,metric:c=>c.modules??0},
 {id:'trophy',title:'An exceptional catch',detail:'Catch a Trophy or Record-size fish. Any species counts.',scope:'medium',icon:'fish',target:1,requires:['five-species'],effort:5,stage:2,rarity:2,metric:c=>c.trophies??0},
 {id:'mission',title:'Prepare for the weather',detail:'Help Sela at the Coastal Beacon unlock the forecast.',scope:'medium',icon:'map',target:1,requires:['chart'],effort:3,stage:1,metric:c=>yes(c.forecast)},
 {id:'everyone',title:'River acquaintances',detail:'Speak with Mara, Iver, Sela and Eirik at their remote stops.',scope:'long',icon:'home',target:4,requires:['sale'],effort:12,stage:2,metric:(c,s)=>new Set([...(c.npcs??[]),...s.met]).size},
 {id:'all-regions',title:'Across the arctic',detail:'Visit every major region of the river network.',scope:'long',icon:'map',target:5,requires:['chart'],effort:14,stage:2,metric:c=>new Set(c.regions).size},
 {id:'twenty-species',title:'River naturalist',detail:'Record twenty unique fish species. No rare species is required.',scope:'long',icon:'fish',target:20,requires:['species'],effort:20,stage:3,metric:c=>new Set(c.species).size},
 {id:'all-landings',title:'Every quiet shore',detail:'Discover every major remote landing spot.',scope:'long',icon:'home',target:7,requires:['chart'],effort:16,stage:2,metric:c=>new Set(c.landings??[]).size},
 {id:'wildlife',title:'Patient observer',detail:'See eight different wildlife species nearby in the world.',scope:'long',icon:'book',target:8,requires:['first'],effort:12,stage:1,metric:(c,s)=>new Set([...(c.wildlife??[]),...s.wildlife]).size},
];
const ids=new Set(OBJECTIVES.map(d=>d.id));
export function readGoals(raw:unknown):GoalState|undefined {
 const v=raw as Partial<GoalState>;if(!v||![1,2].includes(v.version as number))return;
 const strings=(a:unknown)=>Array.isArray(a)?[...new Set(a.filter((x):x is string=>typeof x==='string'))]:[];
 const completed:Record<string,number>={};for(const [id,time]of Object.entries(v.completed??{}))if(ids.has(id)&&Number.isFinite(time))completed[id]=time;
 // Old starters already completed are grandfathered without paying them twice.
 for(const id of strings(v.starters))if(ids.has(id))completed[id]??=0;
 return {version:2,serial:0,current:[],starters:Object.keys(completed),recent:[],collapsed:v.collapsed===true,journal:v.journal===true,talked:v.talked===true,completed,pins:strings(v.pins).filter(id=>ids.has(id)).slice(0,3),unpinned:strings(v.unpinned).filter(id=>ids.has(id)),met:strings([ ...strings(v.met), ...(v.talked?['cartographer']:[]) ]),wildlife:strings(v.wildlife)};
}
export class Goals {
 state:GoalState;private last=-Infinity;
 constructor(raw:unknown,private context:()=>GoalContext,private persist:(s:GoalState,reward:number)=>boolean,private feedback:(text:string)=>void){this.state=readGoals(raw)??{version:2,serial:0,current:[],starters:[],recent:[],collapsed:false,journal:false,talked:false,completed:{},pins:[],unpinned:[],met:[],wildlife:[]};this.sync(true);}
 private target(d:Definition,c:GoalContext){return d.id==='all-regions'?c.regionTotal??d.target:d.id==='all-landings'?c.landingTotal??d.target:d.id==='everyone'?c.npcTotal??d.target:d.id==='wildlife'?Math.min(8,c.wildlifeTotal??8):d.target;}
 private transaction(fn:()=>number){const before=JSON.stringify(this.state);try{const reward=fn();if(!this.persist(this.state,reward)){this.state=JSON.parse(before);return false;}return true;}catch(e){this.state=JSON.parse(before);throw e;}}
 private sync(initial=false){const c=this.context(),notices:string[]=[];const before=JSON.stringify(this.state);let reward=0;
 // Reconcile existing facts as prerequisites open; completion IDs survive reload.
 for(const d of OBJECTIVES){const target=this.target(d,c);if(this.state.completed[d.id]!==undefined||d.requires?.some(id=>this.state.completed[id]===undefined))continue;if(d.metric(c,this.state)>=target){this.state.completed[d.id]=c.now;reward+=objectiveReward(d);if(!initial)notices.push(`${d.title} · +$${objectiveReward(d)}`);}}
 this.state.current=OBJECTIVES.filter(d=>d.requires?.every(id=>this.state.completed[id]!==undefined)!==false&&(!d.available||d.available(c))).map(d=>({id:d.id,type:d.id,title:d.title,detail:d.detail,scope:d.scope,icon:d.icon,reward:objectiveReward(d),target:this.target(d,c),progress:Math.min(this.target(d,c),Math.max(0,d.metric(c,this.state))),seen:[],completeAt:this.state.completed[d.id]}));
 for(const g of this.state.current)if(g.completeAt!==undefined)g.progress=g.target;
 this.state.pins=this.state.pins.filter(id=>{const g=this.state.current.find(g=>g.id===id);return g&& (g.completeAt===undefined||c.now-g.completeAt<4);});
 for(const g of [...this.state.current].sort((a,b)=>['short','medium','long'].indexOf(a.scope)-['short','medium','long'].indexOf(b.scope)))if(this.state.pins.length<3&&g.completeAt===undefined&&!this.state.pins.includes(g.id)&&!this.state.unpinned.includes(g.id))this.state.pins.push(g.id);
 if(JSON.stringify(this.state)!==before){if(!this.persist(this.state,reward)){this.state=JSON.parse(before);return;}for(const n of notices)this.feedback(n);}
 }
 update(){const now=this.context().now;if(now-this.last<.5&&now>=this.last)return;this.last=now;this.sync();}
 event(kind:'catch'|'sale'|'visit'|'journal'|'talk'|'observe',value:string|number=''){if(kind==='journal'||kind==='talk'||kind==='observe')this.transaction(()=>{if(kind==='journal')this.state.journal=true;if(kind==='talk'){if(value==='cartographer'||value==='')this.state.talked=true;if(value&&!this.state.met.includes(String(value)))this.state.met.push(String(value));}if(kind==='observe'&&!this.state.wildlife.includes(String(value)))this.state.wildlife.push(String(value));return 0;});this.sync();}
 collapse(){this.transaction(()=>{this.state.collapsed=!this.state.collapsed;return 0;});}
 pin(id:string){const g=this.state.current.find(g=>g.id===id);if(!g||g.completeAt!==undefined)return;this.transaction(()=>{if(this.state.pins.includes(id)){this.state.pins=this.state.pins.filter(x=>x!==id);this.state.unpinned.push(id);}else{if(this.state.pins.length>=3){const old=this.state.pins.shift()!;this.state.unpinned.push(old);}this.state.unpinned=this.state.unpinned.filter(x=>x!==id);this.state.pins.push(id);}return 0;});}
 dev(action:'complete'|'reroll'|'reset',id=''){if(action==='reroll')throw Error('Permanent objectives do not reroll. Pin a different objective.');if(action==='reset'){this.sync();return;}if(!ids.has(id))throw Error('Unknown objective ID');this.transaction(()=>{this.state.completed[id]??=this.context().now;return 0;});this.sync();}
}
