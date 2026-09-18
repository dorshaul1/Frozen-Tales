import {beginLoading,loadingFailed} from './game/boot/loading';
beginLoading();
const screen=document.getElementById('boot-screen')!;
const canvas=document.getElementById('boot-river') as HTMLCanvasElement,ctx=canvas.getContext('2d')!;
ctx.imageSmoothingEnabled=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let last=0;
function draw(time:number){
 if(screen.hidden){window.setTimeout(()=>requestAnimationFrame(draw),250);return;}
 requestAnimationFrame(draw);if(time-last<100)return;last=time;
 const t=reduced?0:time/1000;
 ctx.fillStyle='#dce8e5';ctx.fillRect(0,0,240,120);
 for(let y=0;y<120;y++){
  const left=Math.round(56+Math.sin(y/30)*12),right=Math.round(182+Math.sin(y/34+1)*14);
  ctx.fillStyle='#9bbbc4';ctx.fillRect(left-4,y,right-left+8,1);
  ctx.fillStyle='#527f90';ctx.fillRect(left,y,right-left,1);
  ctx.fillStyle='#254858';ctx.fillRect(left+4,y,right-left-8,1);
 }
 for(let i=0;i<30;i++){
  const y=Math.floor((i*29+t*5)%120),x=76+(i*37)%87;
  ctx.fillStyle=i%2?'#365868':'#416574';ctx.fillRect(x,y,4+i%5,1);
 }

 for(let i=0;i<22;i++){ctx.fillStyle=i%3?'#edf3eb':'#b9d2d5';ctx.fillRect(Math.floor((i*47+t*3)%240),Math.floor((i*31+t*(3+i%3))%120),1,1);}
 if(t%7>5){const r=Math.floor((t%7-5)*7);ctx.fillStyle='#739ca7';for(let a=0;a<24;a++){const angle=a*Math.PI/12;ctx.fillRect(157+Math.round(Math.cos(angle)*r),78+Math.round(Math.sin(angle)*r/3),1,1);}}
}
requestAnimationFrame(draw);
// Hold keyboard input through the fade as well as initialization.
for(const type of ['keydown','keyup','wheel'] as const)window.addEventListener(type,event=>{if(!screen.hidden){event.preventDefault();event.stopImmediatePropagation();}},{capture:true,passive:false});
document.getElementById('boot-retry')!.onclick=()=>location.reload();
window.addEventListener('error',loadingFailed);
window.addEventListener('unhandledrejection',loadingFailed);
import('./main').catch(loadingFailed);
