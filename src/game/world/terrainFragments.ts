/** Remove only small enclosed land components from an already authored contour.
 * Scanline components keep this a one-time, low-allocation bake operation.
 * Exterior land, authored islands and gate/cave banks are never candidates. */
export function clearTerrainFragments(rows:Map<number,number[][]>,height:number,protectedAt:(x:number,y:number)=>boolean){
 type Run={left:number;right:number;y:number;root:number};
 const runs:Run[]=[],parents:number[]=[];let previous:Run[]=[];
 const root=(n:number):number=>{while(parents[n]!==n){parents[n]=parents[parents[n]];n=parents[n];}return n;};
 for(let y=0;y<height;y+=2){const spans=rows.get(y)??[],current:Run[]=[];
  // Only gaps between water spans; outer banks remain untouched.
  for(let i=1;i<spans.length;i++){const left=spans[i-1][1]+1,right=spans[i][0]-1;if(right<left)continue;
   const run:Run={left,right,y,root:runs.length};parents.push(run.root);runs.push(run);current.push(run);
   for(const p of previous)if(p.right>=left-1&&p.left<=right+1)parents[root(run.root)]=root(p.root);
  }previous=current;
 }
 const groups=new Map<number,Run[]>();for(const r of runs){const id=root(r.root);const g=groups.get(id)??[];g.push(r);groups.set(id,g);}
 let removed=0;
 for(const group of groups.values()){
  const top=group[0].y,bottom=group.at(-1)!.y,area=group.reduce((a,r)=>a+(r.right-r.left+1)*2,0);
  const left=Math.min(...group.map(r=>r.left)),right=Math.max(...group.map(r=>r.right));
  if(area>9000||right-left>180||bottom-top>180||top<2||bottom>=height-2)continue;
  // A gap can join a mainland bank above/below. Require water surrounding
  // its entire boundary, not merely a short horizontal gap in a river fork.
  if(group.some(r=>[r.y-2,r.y+2].some(y=>!(rows.get(y)??[]).some(([a,b])=>a<r.left&&b>r.right)&&!group.some(n=>n.y===y&&n.left<=r.right+1&&n.right>=r.left-1))))continue;
  if(group.some(r=>{for(let x=r.left;x<=r.right;x+=2)if(protectedAt(x,r.y))return true;return false;}))continue;
  for(const r of group){const spans=rows.get(r.y)!;const merged:number[][]=[];for(const s of spans){const last=merged.at(-1);if(last&&last[1]>=r.left-1&&s[0]<=r.right+1)last[1]=s[1];else merged.push([...s]);}rows.set(r.y,merged);}removed++;
 }
 return removed;
}
