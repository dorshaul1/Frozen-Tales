import {FLOW_STRETCHES,ridingFlow,rideMomentum} from '../src/game/world/flowRiding';
import {banks} from '../src/game/world/river';
import {SIDE_ROUTES,routeSpan} from '../src/game/world/sideRoutes';
const out=document.querySelector('#result')!,check=(ok:boolean,s:string)=>{out.textContent+=(ok?'PASS ':'FAIL ')+s+'\n';if(!ok)throw Error(s);};
const geometry=JSON.stringify(Array.from({length:550},(_,i)=>banks(150+i*9)));
for(const lane of FLOW_STRETCHES){const y=(lane.start+lane.end)/2,[l,r]=banks(y),x=(l+r)/2;
 const calm=ridingFlow(x,y,0),storm=ridingFlow(x+(r-l)/2*Math.sin(y/180)*.06,y,1);
 check(storm.boost>calm.boost*1.2,'Storm strengthens lane at '+y);
 let before=calm.boost;for(let i=1;i<=100;i++){const next=ridingFlow(x,y,i/100).boost;if(Math.abs(next-before)>3)throw Error('Weather discontinuity');before=next;}
 const scores=[30,60,120].map(fps=>{let m=0;for(let i=0;i<fps*3;i++)m=rideMomentum(m,calm,calm.x*125,calm.y*125,1/fps);return m;});
 check(Math.max(...scores)-Math.min(...scores)<.01,'Frame-rate independent momentum');
}
check(JSON.stringify(Array.from({length:550},(_,i)=>banks(150+i*9)))===geometry,'Weather never changes fixed geography');
let caves=0;for(const route of SIDE_ROUTES.filter(r=>r.interior))for(let y=route.points[0][1]+30;y<route.points.at(-1)![1]-30;y+=20){const span=routeSpan(route,y);if(span&&ridingFlow((span[0]+span[1])/2,y).boost>0){caves++;break;}}
check(caves>0,'Local cave approach flows exist alongside calm chambers');
