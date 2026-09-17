export const FEATURES=['riverChart','weatherForecast','corgiCompanion','advancedFishingKnowledge'] as const;
export type Feature=typeof FEATURES[number];
export const CORE_QUESTS={
 survey:{npc:'cartographer',feature:'riverChart',title:'A River in Two Views',prerequisite:undefined,intro:'Take two bearings for my chart. From this dock,\npaddle north to the rounded headwater bend,\nthen south past the broad ice floe.',objectives:['Visit the headwater bend north of Lookout','Visit the broad ice floe south of Lookout'],reward:'RIVER CHART UNLOCKED · Press M'},
 weather:{npc:'weatherObserver',feature:'weatherForecast',title:'Read the Open Water',prerequisite:'riverChart',intro:'Walk to the end of this observation path.\nStay still for a few breaths and watch the wind\nacross the water. Then tell me what you saw.',objectives:['Observe at the end of the beacon path · 6s'],reward:'FORECAST UNLOCKED · Village board / Chart'},
 ranger:{npc:'ranger',feature:'corgiCompanion',title:'Moss Knows the Trail',prerequisite:'weatherForecast',intro:'Moss has been checking our quiet clearings.\nFollow the trail inland to its far northern end,\nthen visit the west clearing and return.',objectives:['Visit the northern forest clearing','Visit the western forest clearing'],reward:'MOSS HAS A HOME · Find him in the village'},
 knowledge:{npc:'oldFisher',feature:'advancedFishingKnowledge',title:'Read the Fish',prerequisite:'weatherForecast',intro:'Try a fish with a little spirit: Arctic Char,\nNorthern Pike or Dolly Varden. Char frequent\nthe Starting River. One catch will tell a story.',objectives:['Catch Char, Pike or Dolly Varden'],reward:'FISHING KNOWLEDGE UNLOCKED · Journal / Guide'},
} as const;
export type QuestId=keyof typeof CORE_QUESTS;
export interface CoreState {version:1;sold:boolean;features:Feature[];quests:Partial<Record<QuestId,{phase:'active'|'return'|'completed';done:boolean[]}>>}
export function coreState(raw:unknown,legacy=false):CoreState{
 const v=raw as Partial<CoreState>|undefined,state:CoreState={version:1,sold:legacy||v?.sold===true,features:[],quests:{}};
 if(v?.version!==1){if(legacy)state.features=['riverChart','weatherForecast','advancedFishingKnowledge'];return state;}
 state.features=FEATURES.filter(f=>Array.isArray(v.features)&&v.features.includes(f));
 for(const id of Object.keys(CORE_QUESTS) as QuestId[]){const q=v.quests?.[id];if(q&&['active','return','completed'].includes(q.phase))state.quests[id]={phase:q.phase,done:CORE_QUESTS[id].objectives.map((_,i)=>q.done?.[i]===true)};}
 return state;
}
