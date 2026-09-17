// Static ground footprints recorded alongside the authored scenery bake.
// Crowns and transparent sprite padding are not solid ground.
export type SceneryFootprint={x:number;y:number;radius:number;asset:string};
const cells=new Map<string,SceneryFootprint[]>();
export const sceneryFootprints:SceneryFootprint[]=[];
const CELL=128;
export function clearSceneryCollision(){cells.clear();sceneryFootprints.length=0;}
export function addSceneryFootprint(p:SceneryFootprint){
 sceneryFootprints.push(p);
 for(let y=Math.floor((p.y-p.radius)/CELL);y<=Math.floor((p.y+p.radius)/CELL);y++)
 for(let x=Math.floor((p.x-p.radius)/CELL);x<=Math.floor((p.x+p.radius)/CELL);x++){
  const key=`${x},${y}`,list=cells.get(key)??[];list.push(p);cells.set(key,list);
 }
}
export function sceneryBlocked(x:number,y:number,radius:number){
 for(let cy=Math.floor((y-radius)/CELL);cy<=Math.floor((y+radius)/CELL);cy++)
 for(let cx=Math.floor((x-radius)/CELL);cx<=Math.floor((x+radius)/CELL);cx++)
 for(const p of cells.get(`${cx},${cy}`)??[])if(Math.hypot(x-p.x,y-p.y)<radius+p.radius)return true;
 return false;
}
export function sceneryPathClear(ax:number,ay:number,bx:number,by:number,radius:number){
 const steps=Math.max(1,Math.ceil(Math.hypot(bx-ax,by-ay)/4));
 for(let i=1;i<=steps;i++)if(sceneryBlocked(ax+(bx-ax)*i/steps,ay+(by-ay)*i/steps,radius))return false;
 return true;
}
