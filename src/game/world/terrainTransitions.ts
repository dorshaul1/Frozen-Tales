// Bake-only distance to the exact shared contour. No camera or gameplay state.
// A two-pixel lattice matches the terrain scanlines; artwork remains native pixels.
export function terrainDistance(width:number,height:number,spans:(y:number)=>number[][]){
 const step=2,cols=Math.ceil(width/step),rows=Math.ceil(height/step),size=cols*rows;
 const wet=new Uint8Array(size),distance=new Uint16Array(size),nearest=new Uint32Array(size);distance.fill(30000);
 for(let y=0;y<rows;y++)for(const [l,r]of spans(y*step))for(let x=Math.max(0,Math.ceil(l/step));x<cols&&x*step<=r;x++)wet[y*cols+x]=1;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*cols+x,w=wet[i];if(x&&wet[i-1]!==w||x+1<cols&&wet[i+1]!==w||y&&wet[i-cols]!==w||y+1<rows&&wet[i+cols]!==w){distance[i]=0;nearest[i]=i;}}
 // Chamfer metric (3 straight / 4 diagonal), stable at convex and concave joins.
 const visit=(i:number,j:number,cost:number)=>{const d=distance[j]+cost;if(d<distance[i]){distance[i]=d;nearest[i]=nearest[j];}};
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*cols+x;if(x)visit(i,i-1,3);if(y){visit(i,i-cols,3);if(x)visit(i,i-cols-1,4);if(x+1<cols)visit(i,i-cols+1,4);}}
 for(let y=rows-1;y>=0;y--)for(let x=cols-1;x>=0;x--){const i=y*cols+x;if(x+1<cols)visit(i,i+1,3);if(y+1<rows){visit(i,i+cols,3);if(x)visit(i,i+cols-1,4);if(x+1<cols)visit(i,i+cols+1,4);}}
 const index=(x:number,y:number)=>Math.max(0,Math.min(rows-1,Math.floor(y/step)))*cols+Math.max(0,Math.min(cols-1,Math.floor(x/step)));
 return Object.assign((x:number,y:number)=>{const i=index(x,y);return (distance[i]*step/3+1)*(wet[i]?1:-1);},{nearest:(x:number,y:number)=>{const i=nearest[index(x,y)];return {x:(i%cols)*step,y:Math.floor(i/cols)*step};}});
}

// Interpolate sampled *existing* habitat depth for presentation only. A merger
// of horizontal water spans must not introduce a visible horizontal color cut.
export function terrainField(width:number,height:number,sample:(x:number,y:number)=>number){
 const step=32,cols=Math.ceil(width/step)+1,rows=Math.ceil(height/step)+1,values=new Float32Array(cols*rows);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)values[y*cols+x]=sample(Math.min(width-1,x*step),Math.min(height-1,y*step));
 return(x:number,y:number)=>{const u=Math.max(0,Math.min(cols-1.001,x/step)),v=Math.max(0,Math.min(rows-1.001,y/step)),ix=Math.floor(u),iy=Math.floor(v),tx=u-ix,ty=v-iy,i=iy*cols+ix;return (values[i]*(1-tx)+values[i+1]*tx)*(1-ty)+(values[i+cols]*(1-tx)+values[i+cols+1]*tx)*ty;};
}
