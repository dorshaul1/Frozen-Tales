import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import type {AnimalId} from '../src/game/world/spawnRules';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const world=Reflect.get(scene,'dynamicWorld'),ambience=Reflect.get(scene,'ambience'),kayak=Reflect.get(scene,'kayak'),home=Reflect.get(scene,'home');
const out=document.querySelector('#result')!,check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
const species:AnimalId[]=['penguin','polar-bear','fox','hare','seal','otter','reindeer','bird','owl','musk-ox','wolf','wolverine','raven'];
world.encounters.splice(0,world.encounters.length,...species.map((species,id)=>({id:9000+id,species,points:[{x:800,y:1200}],expiresAt:99999,heading:0})));
Reflect.get(ambience,'syncEncounters').call(ambience);
for(const a of Reflect.get(ambience,'animals')){
 if(a.species==='bird'||a.species==='owl'||a.species==='raven'){check(!a.obstacle,'Airborne '+a.species+' does not block navigation');continue;}
 const b=a.obstacle.body as Phaser.Physics.Arcade.StaticBody;
 check(b.isCircle&&b.radius>0,'Body-sized circular footprint: '+a.species);
 kayak.body.reset(b.center.x-b.radius-12,b.center.y);kayak.body.position.x+=b.center.x-b.radius-12-kayak.body.center.x;kayak.body.position.y+=b.center.y-kayak.body.center.y;kayak.body.updateCenter();kayak.setVelocity(100,0);kayak.body.prev.x=kayak.body.position.x-24;
 check(scene.physics.collide(kayak,a.obstacle),'Kayak collides: '+a.species);
 check(ambience.blocks(b.center.x,b.center.y,10)&&home.fisherman.blockedByWildlife(b.center.x,b.center.y),'Walking blocked: '+a.species);
 check(Math.hypot(kayak.body.center.x-b.center.x,kayak.body.center.y-b.center.y)>=b.radius+16.9,'Hull separated from animal');
}
world.encounters.splice(0);Reflect.get(ambience,'syncEncounters').call(ambience);
check(ambience.collisionBodies.countActive()===0&&!ambience.blocks(800,1200,10),'Despawn removes collision: no invisible blockers');out.textContent+='ALL ANIMAL COLLISION CHECKS PASSED';
