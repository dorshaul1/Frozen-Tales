import { MICRO_BIOMES } from './microBiomes';
import type { AssetId } from '../assets/catalog';
import { ECOLOGY_LANDMARKS } from './ecologyLandmarks';
// Repeated entries are intentional weights. Large patches share a local tree family.
export const ENVIRONMENT_ART: readonly { trees: readonly AssetId[]; rocks: readonly number[]; snow: readonly number[] }[] = [
 {trees:['tree-pine','tree-pine','tree-fir','tree-young','tree-weathered'],rocks:[0,2,5],snow:[0,0,3,4]},
 {trees:['tree-spruce','tree-spruce','tree-snowbound','tree-spire','tree-young'],rocks:[0,3,4],snow:[1,2,4]},
 {trees:['tree-spire','tree-weathered','tree-snowbound'],rocks:[2,3,4,5],snow:[0,1,1,2]},
 {trees:['tree-weathered','tree-spire'],rocks:[1,1,3,4],snow:[1,1,2,4]},
];
export function artArea(y:number){return y<2150?0:y<3370?1:y<4060?2:3;}
export function shoreMaterial(y:number,side:number):AssetId{
 const pocket=MICRO_BIOMES.find(p=>p.side===side&&p.shore&&Math.abs(y-p.y)<110);
 if(pocket?.shore)return pocket.shore;
 const landmark=ECOLOGY_LANDMARKS.find(l=>l.side===side&&l.variant>=0&&y>l.y-25&&y<l.y+125);
 if(landmark)return landmark.variant===2?'shore-rock':'shore-blue';
 if(y>4060)return Math.sin(y/137+side)>.25?'shore-rock':'shore-blue';
 return y>2150&&Math.sin(y/213+side)>.15?'shore-blue':'shore';
}
