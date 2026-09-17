import { rgba } from './pixels.mjs';
export function iceMaterial(p,index){
 for(let y=4;y<p.height-4;y++)for(let x=4;x<p.width-4;x++){
 const i=(y*p.width+x)*4;if(!p.data[i+3])continue;
 // Material islands stay inside the existing top snow/ice cap.
 const snow=rgba('snow');if(![0,1,2].every(n=>p.data[i+n]===snow[n]))continue;
 if(index===1&&x>p.width*.4&&y>p.height*.3&&x+y<p.width*.95)p.data.set(rgba('iceLight'),i);
 if(index===2&&Math.abs(x-p.width*.5-Math.sin(y/6)*3)<1)p.data.set(rgba('iceShade'),i);
 if(index===0&&y%9===3&&x>p.width*.3&&x<p.width*.5)p.data.set(rgba('snowLight'),i);
 }
}
