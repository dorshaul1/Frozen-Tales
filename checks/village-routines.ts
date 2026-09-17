import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {VILLAGE,WORKSHOP_BAY} from '../src/game/home/villageLayout';import type {Conditions} from '../src/game/world/conditions';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));scene.scene.pause();
const h=Reflect.get(scene,'home'),r=h.routines,out=document.querySelector('#result')!;function check(v:boolean,s:string){out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);}
const moved=new Set<string>(),states=new Set<string>();
for(const phase of ['morning','day','evening','night'] as const)for(const weather of ['clear','rain','heavy-snow'] as const){
 const c:Conditions={phase,weather};
 for(let i=0;i<2400;i++){r.update(50,{x:900,y:1800},c);for(const a of r.residents){const n=VILLAGE.npcs[a.role as keyof typeof VILLAGE.npcs];if(Math.hypot(a.sprite.x-n.x,a.sprite.y-n.y)>2)moved.add(a.role);states.add(a.state);if(!r.valid(a.role,a.sprite.x,a.sprite.y))throw Error('Invalid NPC ground '+a.role);}}
 for(const [role,n]of Object.entries(VILLAGE.npcs)){
  h.walking=role!=='merchant';if(h.walking)h.fisherman.setPosition(n.x+25,n.y);else{h.kayak.setPosition(WORKSHOP_BAY.x,WORKSHOP_BAY.y);h.kayak.setVelocity(0,0);}
  check(h.canInteract(n.view),`${phase}/${weather}: ${role} service available during routine`);
  r.update(16,h.player,c);check(r.residents.find((a:any)=>a.role===role).state==='serve','Approach interrupts '+role+' immediately');
 }
}
check(moved.size===4,'Every NPC uses safe local movement');check(['sort','inspect','repair','write','warm'].every(s=>states.has(s)),'Role-specific and quiet evening activities exercised');
for(const a of r.residents)for(const action of ['idle','walk','work','warm'])check(scene.anims.exists(`${VILLAGE.npcs[a.role as keyof typeof VILLAGE.npcs].asset}/N/${action}`),'Animation registered '+a.role+'/'+action);
out.textContent+='ALL ROUTINE CHECKS PASSED';
scene.cameras.main.stopFollow();scene.cameras.main.centerOn(VILLAGE.square.x,VILLAGE.square.y);let last=performance.now();function animate(now:number){const dt=Math.min(50,now-last);last=now;r.update(dt,{x:900,y:1800},{phase:'day',weather:'clear'});for(const a of r.residents)a.sprite.anims.update(now,dt);requestAnimationFrame(animate);}requestAnimationFrame(animate);
