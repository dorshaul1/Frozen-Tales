import fs from 'node:fs';import {generate} from './generate.mjs';import {build,validate} from './core.mjs';
for(const id of ['penguin','polar-bear','fox','hare','reindeer','otter','seal','owl','bird']){
 const path=`assets/definitions/${id}.json`,d=JSON.parse(fs.readFileSync(path));const actions=id==='seal'?['rest','inspect','swim']:['bird','owl'].includes(id)?['inspect','perch']:['fox','hare','reindeer','otter'].includes(id)?['rest','forage','inspect','alert']:['rest','inspect','alert'];
 d.frames=d.frames.filter(f=>['idle','walk'].includes(f.animation));for(const a of Object.keys(d.animations))if(!['idle','walk'].includes(a))delete d.animations[a];
 for(const action of actions){for(const direction of ['N','NE','E','SE','S','SW','W','NW'])for(let index=0;index<(action==='swim'?4:2);index++)d.frames.push({direction,animation:action,index});d.animations[action]={fps:action==='swim'?5:action==='forage'?2:1};}
 d.description=`Original ${id}: authored front, rear, profile and quarter poses; native canvas, no rotation. Species-specific anatomy, alternating limbs and quiet idle frames.`;d.animations.walk.fps=id==='polar-bear'?4:id==='hare'?7:id==='bird'?6:5;fs.writeFileSync(path,JSON.stringify(d,null,2)+'\n');generate(d,undefined,false);
}build();console.log(validate());
