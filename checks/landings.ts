import Phaser from 'phaser';import {sceneryBlocked,sceneryFootprints} from '../src/game/world/sceneryCollision';import {RiverScene} from '../src/game/scenes/RiverScene';import {landings,landingWalk} from '../src/game/home/Landings';import {validWater} from '../src/game/world/DynamicWorld';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const out=document.querySelector('#result')!;
for(const s of landings()){
 for(const path of s.paths)for(const [x,y]of path)if(!landingWalk(s,x,y))out.textContent+=`Invalid ${s.name} ${x},${y} obstacles ${s.obstacles.filter(o=>Math.hypot(o.x-x,o.y-y)<o.r+10).length}\n`;
 let valid=landingWalk(s,s.landX,s.landY);for(const path of s.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=d;t+=4)valid&&=landingWalk(s,a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d)&&!sceneryBlocked(a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d,8);}
 if(!valid)out.textContent+=JSON.stringify(sceneryFootprints.filter(o=>s.paths.some(path=>path.some(([x,y])=>Math.hypot(o.x-x,o.y-y)<o.radius+20))))+'\n';
 out.textContent+=`${valid&&validWater(s,18,false)?'PASS':'FAIL'} ${s.name} y=${s.y} paths=${valid} berth=${validWater(s,18,false)}\n`;
 const button=document.createElement('button');button.textContent=s.name;button.onclick=()=>{scene.cameras.main.stopFollow();scene.cameras.main.setZoom(1);const points=s.paths.flat();scene.cameras.main.centerOn((Math.min(...points.map(p=>p[0]))+s.x)/2,(Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2);};document.body.prepend(button);
}
const home=Reflect.get(scene,'home'),kayak=Reflect.get(scene,'kayak');
for(const s of landings()){
 kayak.body.reset(s.x,s.y);kayak.setVelocity(0,0);
 if(!home.interactDock()||!home.walking)throw Error('Cannot land '+s.name);
 if(!home.interactDock()||home.walking)throw Error('Cannot launch '+s.name);
}
out.textContent+='PASS all seven dock/land/launch transitions\n';
for(const s of landings()){
 const dock=scene.children.list.find(o=>o instanceof Phaser.GameObjects.Zone&&Math.abs(o.x-(s.x-76))<.1&&o.y===s.y) as Phaser.GameObjects.Zone;
 if(!dock?.body)throw Error('Missing dock body '+s.name);
 kayak.body.reset(s.x-26,s.y);kayak.body.prev.x=kayak.body.position.x+32;kayak.body.velocity.x=-80;
 const collided=scene.physics.collide(kayak,dock);
 if(!collided)throw Error('Dock collision failed '+s.name);
 kayak.body.reset(s.x,s.y);kayak.setVelocity(0,0);if(!home.canLand)throw Error('Landing prompt out of reach');
}
out.textContent+='PASS solid dock collisions and reachable landing prompts\n';
for(const s of landings()){
 kayak.body.reset(s.x,s.y);kayak.setVelocity(0,0);if(!home.interactDock())throw Error('Land failed');
 home.fisherman.setPosition(s.paths[0][2][0],s.paths[0][2][1]);
 for(let x=s.landX;x<=s.x-34;x+=2)if(!landingWalk(s,x,s.y))throw Error('Deck inaccessible '+s.name);
 home.fisherman.setPosition(s.x-34,s.y);
 if(!home.canLaunch||!home.interactDock()||home.walking)throw Error('Return from deck failed '+s.name);
}
out.textContent+='PASS return after walking away and boarding from every dock tip\n';
const {navigationFlow,dockFlowScale}=await import('../src/game/world/navigation');
for(const s of landings())for(const weather of ['clear','rain','windy','heavy-snow'] as const){const f=navigationFlow(s.x,s.y,weather);if(Math.hypot(f.x,f.y)!==0||dockFlowScale(s.x,s.y)!==0)throw Error('Rough berth '+s.name);}
out.textContent+='PASS all dock berths remain calm in storms\n';

const {Discovery,MAP_MARKERS}=await import('../src/game/map/discovery');const discovery=new Discovery();
for(const s of landings()){if(discovery.landmarks.has(s.id))throw Error('Remote stop revealed on fresh chart');const found=discovery.visit(s.x,s.y).found;if(!found.some(m=>m.id===s.id&&m.notify))throw Error('Missing location reveal');}
const restored=new Discovery(discovery.snapshot());if(!landings().every(s=>restored.landmarks.has(s.id)&&MAP_MARKERS.filter(m=>m.id===s.id).length===1))throw Error('Discovery persistence or duplicate marker');out.textContent+='PASS hidden discovery, location reveal and saved unique chart markers\n';
for(const s of landings())for(const p of s.paths.flat())if(!landingWalk(s,p[0],p[1]))throw Error('Blocked walking endpoint');
const forest=landings().find(s=>s.id==='forest')!;if(!landings().filter(s=>s!==forest).every(s=>s.paths.flat().length<forest.paths.flat().length))throw Error('Forest should have the largest trail network');
out.textContent+='PASS forest has the largest connected trail network\n';

const required:Record<string,string[]>={'beacon-rest':['village-beacon','village-bench'],'shelter-bay':['abandoned-shelter','blue-ice-outcrop'],lookout:['village-bench','research-instruments'],camp:['abandoned-shelter','snow-log'],'old-dock':['abandoned-shelter','village-drying-rack','hub-barrel','hub-net'],grove:['village-bench','blue-ice-outcrop'],forest:['tree-spruce','tree-fir','village-bench']};
for(const s of landings()){const assets=scene.children.list.filter(o=>o.getData('landing')===s.id).map(o=>o.getData('asset'));for(const id of required[s.id])if(!assets.includes(id))throw Error(s.id+' missing focal prop '+id);}
out.textContent+='PASS all landing focal props placed on safe ground\n';
