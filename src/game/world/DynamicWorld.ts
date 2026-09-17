import {REGION_ATMOSPHERE} from './regionalContent';
import {NETWORK_ROUTES} from './regionNetwork';
import {sceneryBlocked} from './sceneryCollision';
import {WILDLIFE_SIZE} from './wildlifeSize';
import {interactionAffinity} from './interactionSpots';
import {eventWildlife,activeEvent,AREA_EVENTS} from './areaEvents';
import {dailyFishAffinity} from './riverConditions';
import { driftingIce,thinIce } from './driftingIce';
import { SIDE_ROUTES,pocketAt,locationPool,locationAt,caveStrength } from './sideRoutes';
import { landmarkBounds } from './ecologyLandmarks';
import { habitatAffinity } from './depth';
import { makeSchool, moveSchool, restoreSchool, SCHOOL, type School } from '../fishing/schools';
import { chooseWaterSign, isWaterSign, signFishTable, type WaterSign } from '../fishing/spotReading';
import { eligibleRare, selectEncounter, RARE_FISH, type EncounterMemory } from '../fishing/rareFish';
import { villageReserved, WORKSHOP_BAY } from '../home/villageLayout';
import { animalActivity, WEATHER, type Conditions } from './conditions';
import { ASSET_FRAMES, COLLISION_MASKS } from '../assets/catalog';
import { FISH, type FishId, type FishTable } from '../fishing/data';
import { HOME } from '../tuning';
import { waterSpans, banks, createFloes, WORLD_HEIGHT, WORLD_WIDTH } from './river';
import { currentAt } from './areas';
import { ECOLOGY, areaFishPool, AREA_SPAWNS, ANIMAL_RULES, DYNAMIC, areaAt, type AreaId, type AnimalId } from './spawnRules';
export type Point = { x: number; y: number };
export type View = { left: number; right: number; top: number; bottom: number };
export type Activity = Point & { area: AreaId; weights: FishTable; availableAt: number; expiresAt: number; kind: 'normal' | 'busy' | 'trophy'; retired?: boolean; required?: FishId; visitor?: FishId; rareChecked?: string; sign?: WaterSign; school?: School };
export interface DynamicSave { version: 1; state: number; clock: number; trip: number; spots: Activity[] }
export type Encounter = { id: number; species: AnimalId; points: Point[]; expiresAt: number; heading: number; departed?: boolean };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const home = { x: HOME.dockX, y: HOME.dockY };
export const outside = (p: Point, view: View, margin = 70) => p.x < view.left - margin || p.x > view.right + margin || p.y < view.top - margin || p.y > view.bottom + margin;
// Geometry is read-only. Dynamic seeds never enter terrain generation.
const floes = createFloes();
function onFloe(p: Point) {
  return floes.some(f => {
    const x = (p.x - f.x) / f.scale + 4, y = (p.y - f.y) / f.scale + 4;
    return COLLISION_MASKS[ASSET_FRAMES[f.asset][f.variant]].some(([sx, sy, w, h]) => x >= sx && x < sx + w && y >= sy && y < sy + h);
  });
}
export function validSnow(p: Point, radius: number) {
  if(sceneryBlocked(p.x,p.y,radius))return false;
  if (p.y < 100 || p.y > WORLD_HEIGHT - 100 || p.x < radius || p.x > WORLD_WIDTH - radius) return false;
  if(landmarkBounds().some(l=>p.x+radius>l.x&&p.x-radius<l.x+l.width&&p.y+radius>l.y&&p.y-radius<l.y+l.height))return false;
  if (caveStrength(p.x,p.y)>.1)return false;
  if (villageReserved(p.x, p.y, radius + 10)) return false;
  if (p.x > 1960-radius && p.x < 2170+radius && p.y > 2500-radius && p.y < 2780+radius) return false;
  if (p.x > 1870-radius && p.x < 2010+radius && p.y > 2780-radius && p.y < 2910+radius) return false;
  return [p.y-radius,p.y,p.y+radius].every(y=>waterSpans(y).every(([l,r])=>p.x+radius<l-15||p.x-radius>r+15));
}
export function validWater(p: Point, radius = 42, encounter = true, ignoreDriftingIce = false) {
  if (p.y < 150 || p.y > WORLD_HEIGHT - 150 || encounter && (distance(p, home) < DYNAMIC.homeExclusion || p.x<1550&&currentAt(p.y) > 12)) return false;
  if(!ignoreDriftingIce&&driftingIce.some(f=>Math.hypot(p.x-f.x,p.y-f.y)<radius+30))return false;
  if(thinIce.some(f=>Math.abs(p.x-f.x)<f.width/2+radius&&Math.abs(p.y-f.y)<f.height/2+radius))return false;
  if(Math.hypot(p.x-WORKSHOP_BAY.x,p.y-WORKSHOP_BAY.y)<75+radius)return false;
  // Shore, home piers and generous obstacle clearance, including room to park.
  if (p.x > 1900 && p.x < 2205 && p.y > 2500 && p.y < 2790) return false;
  for (let y = p.y-radius; y <= p.y+radius; y += 4) { if(!waterSpans(y).some(([l,r])=>p.x-radius>=l+15&&p.x+radius<=r-15))return false; }
  return !floes.some(f => p.x+radius>f.x-8 && p.x-radius<f.x+f.width+8 && p.y+radius>f.y-8 && p.y-radius<f.y+f.height+8);
}
export function validFloe(p: Point, radius: number) {
  return [p, ...Array.from({length:12},(_,i)=>({x:p.x+Math.cos(i*Math.PI/6)*radius,y:p.y+Math.sin(i*Math.PI/6)*radius}))].every(onFloe);
}
export class DynamicWorld {
  readonly spots: Activity[] = [];
  readonly encounters: Encounter[] = [];
  conditions: Conditions = { phase: 'day', weather: 'clear' };
  onChange = () => {};
  memory: EncounterMemory = {};
  bait = 0;
  clock = 0;
  trip = 0;
  private state: number;
  private nextTick = 0;
  private schoolElapsed = 0;
  private lastPlayerY?: number;
  private travelDirection = 1;
  private nextId = 0;
  private rareAt = 0;
  private cooldown: Partial<Record<AnimalId, number>> = {};
  private recent: (Point & { until: number })[] = [];
  private requests = new Map<FishId, { area: AreaId; deadline: number }>();
  constructor(seed = (Math.random() * 0xffffffff) >>> 0) { this.state = seed || 1; }
  random = () => { this.state = (this.state * 1664525 + 1013904223) >>> 0; return this.state / 4294967296; };
  snapshot(): DynamicSave { return { version: 1, state: this.state, clock: this.clock, trip: this.trip, spots: this.spots.map(s=>({...s, weights:{...s.weights},school:s.school?{...s.school}:undefined})) }; }
  restore(raw: unknown): boolean {
    const saved = raw as DynamicSave | undefined;
    if (saved?.version !== 1 || !Number.isInteger(saved.state) || !Number.isFinite(saved.clock) || saved.clock < 0 || !Array.isArray(saved.spots)) return false;
    this.state = saved.state >>> 0; this.clock = saved.clock; this.trip = Math.max(0, Number.isInteger(saved.trip) ? saved.trip : 0);
    this.nextTick = this.clock + DYNAMIC.tick;
    for (const s of saved.spots.slice(0,128)) {
      if (!s || typeof s !== 'object') continue;
      if (!Number.isFinite(s.x) || !Number.isFinite(s.y) || !validWater(s) || !Number.isFinite(s.availableAt) || !Number.isFinite(s.expiresAt)) continue;
      const pool=locationPool(s.x,s.y,areaFishPool(areaAt(s.y,s.x),s.y));
      const weights = Object.fromEntries(Object.entries(s.weights ?? {}).filter(([id,w])=>Object.hasOwn(FISH,id)&&(pool[id as FishId]??0)>0&&Number.isFinite(w)&&w>0));
      if(!Object.keys(weights).length)continue;
      this.spots.push({x:s.x,y:s.y,area:areaAt(s.y,s.x),weights,kind:['busy','trophy'].includes(s.kind)?s.kind:'normal',availableAt:s.availableAt,expiresAt:s.expiresAt,
        school:restoreSchool(s.school),sign:isWaterSign(s.sign)?s.sign:(s.visitor?'shimmer':'calm'),retired:s.retired===true,required:s.required&&Object.hasOwn(FISH,s.required)?s.required:undefined,
        visitor:s.visitor&&Object.hasOwn(RARE_FISH,s.visitor)?s.visitor:undefined,rareChecked:typeof s.rareChecked==='string'?s.rareChecked:undefined});
    }
    return true;
  }
  visitorAt(spot: Activity) { return !spot.retired && !spot.required && spot.visitor && eligibleRare(spot,this.conditions).includes(spot.visitor) ? spot.visitor : undefined; }
  commit(spot: Activity) {
    const fish = spot.required ?? this.visitorAt(spot);
    // Commit before casting: a reload cannot replay a signaled opportunity.
    spot.visitor = undefined; spot.retired = true; spot.availableAt=this.clock+45; spot.expiresAt=this.clock;
    this.onChange(); return fish;
  }
  private range(min: number, max: number) { return min + this.random() * (max-min); }
  private remember(p: Point) { this.recent.push({...p, until:this.clock+DYNAMIC.recentLifetime}); this.recent=this.recent.slice(-80); }
  private fresh(p: Point) { return !this.recent.some(r=>r.until>this.clock && distance(r,p)<DYNAMIC.recentDistance); }
  newTrip(seed: number, player: Point, view: View) {
    this.state = seed || 1; this.trip++;
    // Keep visible activity intact; refresh it after it leaves view, never pop it out.
    for (const s of this.spots) s.expiresAt = this.clock;
    for (const e of this.encounters) {
      if (e.points.every(p => outside(p, view) && distance(p, player) > 260)) e.expiresAt = this.clock;
    }
    this.populate(player,view); this.assignVisitors(view); this.onChange();
  }
  newDay(seed: number, player: Point, view: View) {
    // Called under the sleep fade. Preserve quest requests and recent-location avoidance.
    this.recent = this.spots.map(s=>({x:s.x,y:s.y,until:this.clock+30}));
    this.spots.length = 0; this.encounters.length = 0;
    this.cooldown = {}; this.nextTick = this.clock;
    this.newTrip(seed, player, view);
  }
  // A future quest can request a species without changing the area's fish pool.
  // By the deadline, an off-screen activity is reserved; its next bite is guaranteed.
  requestOpportunity(id: FishId, area: AreaId) {
    if (!(AREA_SPAWNS[area].fish[id] ?? 0)) return false;
    if (!this.requests.has(id)) this.requests.set(id,{area,deadline:this.clock+30});
    return true;
  }
  caught(spot: Activity, success = true) {
    if (spot.required && success) this.requests.delete(spot.required);
    spot.required=undefined; spot.retired=true; spot.expiresAt=this.clock;
    spot.availableAt=this.clock+this.range(...DYNAMIC.fishCooldown as [number,number]);
    this.remember(spot); this.onChange();
  }
  private candidate(area: AreaId, player: Point, view: View): Point | undefined {
    const rule=AREA_SPAWNS[area];
    for(let i=0;i<120;i++) {
      const pockets=SIDE_ROUTES.filter(r=>areaAt(r.pocket.y,r.pocket.x)===area);
      const chosen=pockets.length&&this.random()<.22?pockets[Math.floor(this.random()*pockets.length)]:undefined;
      const reaches=NETWORK_ROUTES.filter(r=>r.area===area),reach=reaches[Math.floor(this.random()*reaches.length)];
      const node=reach?.points[Math.floor(this.random()*reach.points.length)];
      const local=areaAt(player.y,player.x)===area&&this.random()<.45;
      const y=Math.round(chosen?chosen.pocket.y+this.range(-32,32):local?player.y+this.range(-650,650):node&&this.random()<.65?node[1]+this.range(-140,140):this.range(area==='starting'?400:rule.minY,area==='starting'?3100:rule.maxY));
      const spans=waterSpans(y).filter(([l,r])=>r-l>110);if(!spans.length)continue;
      const [l,r]=spans[Math.floor(this.random()*spans.length)],p={x:Math.round(chosen?chosen.pocket.x+this.range(-24,24):local?player.x+this.range(-650,650):this.range(l+55,r-55)),y};
      if(areaAt(p.y,p.x)===area&&!locationAt(p.x,p.y)?.kind&&validWater(p)&&outside(p,view)&&distance(p,player)>120&&this.fresh(p)&&this.spots.every(s=>distance(s,p)>DYNAMIC.spacing))return p;
    }
  }
  private addActivity(p:Point,area:AreaId){
        const pool=locationPool(p.x,p.y,areaFishPool(area,p.y));
        const pocket=pocketAt(p.x,p.y);
        const weights=Object.fromEntries(Object.entries(pool).map(([id,w])=>[id,w*interactionAffinity(p.x,p.y,FISH[id as FishId])*dailyFishAffinity(p.x,p.y,FISH[id as FishId])*(pocket&&FISH[id as FishId].baseKg>=3?1.3:1)*this.range(.8,1.2)*habitatAffinity(FISH[id as FishId].habitat,p.x,p.y)])) as FishTable;
        let kind:Activity['kind']='normal';
        if(this.clock>=this.rareAt && this.random()<DYNAMIC.rareActivityChance*(pocket?1.5:1)*WEATHER[this.conditions.weather].rare){kind=this.random()<.5?'busy':'trophy';this.rareAt=this.clock+DYNAMIC.rareCooldown;}
        const event=activeEvent(p.x,p.y);
        const chosenSign=event&&this.random()<.4?AREA_EVENTS[event.id].sign:chooseWaterSign(weights,p.y,this.conditions,this.random,p.x);
        const sign=chosenSign==='birds'&&caveStrength(p.x,p.y)>.2?'strong':chosenSign;
        this.spots.push({...p,area,weights:signFishTable(weights,sign),sign,school:makeSchool(p.x,p.y,sign,weights,this.random),kind,availableAt:this.clock,expiresAt:this.clock+(sign==='birds'?55:this.range(...DYNAMIC.fishLifetime as [number,number]))});
  }
  private populate(player: Point, view: View) {
    for(const area of Object.keys(AREA_SPAWNS) as AreaId[]) {
      const count=this.spots.filter(s=>s.area===area&&!locationAt(s.x,s.y)?.kind).length;
      for(let i=count;i<AREA_SPAWNS[area].spots;i++) {
        const p=this.candidate(area,player,view); if(!p)break;
        this.addActivity(p,area);
      }
    }
    // A quiet opportunity in each new pocket; coordinates, fish and return times vary.
    for(const route of SIDE_ROUTES.filter(r=>r.kind)){
      if(this.spots.some(s=>locationAt(s.x,s.y)?.id===route.id))continue;
      for(let attempt=0;attempt<24;attempt++){
        const spread=attempt<16?1:.35;
        const p={x:route.pocket.x+Math.round(this.range(-35,35)*spread),y:route.pocket.y+Math.round(this.range(-40,40)*spread)};
        if(!validWater(p)||!outside(p,view)||distance(p,player)<120||!this.fresh(p)||this.spots.some(s=>distance(p,s)<DYNAMIC.spacing))continue;
        this.addActivity(p,areaAt(p.y,p.x));break;
      }
    }
    for(const[id,request]of this.requests) if(this.clock>=request.deadline&&!this.spots.some(s=>s.required===id)) {
      const spot=this.spots.find(s=>s.area===request.area && !s.visitor && !s.retired && s.availableAt<=this.clock && outside(s,view) && distance(s,player)>120);
      if(spot){spot.required=id;spot.expiresAt=this.clock+180;}
    }
  }
  private assignVisitors(view: View) {
    const key = `${this.conditions.phase}/${this.conditions.weather}`;
    for (const spot of this.spots) {
      if (spot.retired || spot.required || spot.visitor || spot.rareChecked===key || !outside(spot,view)) continue;
      if (!eligibleRare(spot,this.conditions).length || this.spots.some(s=>s.area===spot.area&&this.visitorAt(s))) continue;
      spot.rareChecked=key;
      const id=selectEncounter(spot.weights,spot,this.conditions,this.memory,this.bait,this.random);
      if (RARE_FISH[id]) { spot.visitor=id; spot.sign=this.random()<.7?'shimmer':'large'; spot.school=makeSchool(spot.x,spot.y,spot.sign,spot.weights,this.random); spot.expiresAt=Math.max(spot.expiresAt,this.clock+150); }
    }
  }
  spawnNearby(species:AnimalId,count:number,player:Point){
    const rule=ANIMAL_RULES[species];
    if(!rule||!Number.isInteger(count)||count<1||count>rule.maxActive)throw new Error(`Amount must be 1–${rule?.maxActive??1}.`);
    if(!rule.areas.includes(areaAt(player.y,player.x)))throw new Error('This species does not live in this area.');
    if(this.encounters.filter(e=>e.species===species).reduce((n,e)=>n+e.points.length,0)+count>rule.maxActive||this.encounters.reduce((n,e)=>n+e.points.length,0)+count>DYNAMIC.wildlifeLimit)throw new Error('Wildlife limit reached. Wait for animals to leave.');
    const points:Point[]=[];
    for(let radius=70;radius<=420&&points.length<count;radius+=24)for(let a=0;a<32&&points.length<count;a++){
      const p={x:Math.round(player.x+Math.cos(a*Math.PI/16)*radius),y:Math.round(player.y+Math.sin(a*Math.PI/16)*radius)};
      if(p.x<30||p.x>WORLD_WIDTH-30||p.y<150||p.y>WORLD_HEIGHT-150||!rule.areas.includes(areaAt(p.y,p.x)))continue;
      if(caveStrength(p.x,p.y)>.1||rule.terrain==='snow'&&!validSnow(p,rule.radius)||rule.terrain==='floe'&&!validFloe(p,rule.radius))continue;
      if(points.some(q=>distance(p,q)<WILDLIFE_SIZE[species].spacing)||this.encounters.some(e=>e.points.some(q=>distance(p,q)<50)))continue;
      points.push(p);
    }
    if(points.length<count)throw new Error('No safe nearby habitat. Try another shoreline.');
    this.encounters.push({id:this.nextId++,species,points,expiresAt:this.clock+rule.lifetime,heading:0});
  }
  private spawnAnimal(species: AnimalId, player: Point, view: View) {
    const rule=ANIMAL_RULES[species];
    const active=this.encounters.filter(e=>e.species===species).reduce((n,e)=>n+e.points.length,0);
    const total=this.encounters.reduce((n,e)=>n+e.points.length,0);
    if(this.clock<(this.cooldown[species]??0)||active>=rule.maxActive||total>=DYNAMIC.wildlifeLimit||this.random()>=Math.min(1,rule.probability*eventWildlife(player.x,player.y)*animalActivity(species,this.conditions)*(ECOLOGY[areaAt(player.y,player.x)][species]??1)))return;
    if(rule.rarity==='rare'&&this.clock<this.rareAt)return;
    let count=Math.min(rule.maxActive-active,DYNAMIC.wildlifeLimit-total,Math.floor(this.range(rule.group[0],rule.group[1]+1)));
    if(count<rule.group[0])return;
    // A seal pair is rare and shares the same global rare-event budget.
    if(species==='seal'&&count>1){if(this.clock<this.rareAt||this.random()>.12)count=1;}
    for(let attempt=0;attempt<50;attempt++) {
      const forward = this.random() < .75 ? this.travelDirection : -this.travelDirection;
      const distanceAhead = (view.bottom - view.top) / 2 + this.range(100, 360)+REGION_ATMOSPHERE[areaAt(player.y,player.x)].wildlifeDistance;
      const y=Math.round(player.y + forward * distanceAhead);
      const area=areaAt(y,player.x);if(!rule.areas.includes(area)||y<180||y>WORLD_HEIGHT-180)continue;
      const[l,r]=waterSpans(y).slice().sort((a,b)=>Math.abs((a[0]+a[1])/2-player.x)-Math.abs((b[0]+b[1])/2-player.x))[0]??banks(y),side=this.random()<.5?-1:1;
      let origin:Point={x:side<0?l-this.range(rule.radius+20,rule.radius+55):r+this.range(rule.radius+20,rule.radius+55),y};
      if(rule.terrain==='floe'){
        const available=floes.filter(f=>rule.areas.includes(areaAt(f.y,f.x))&&f.width>=56&&Math.abs(f.y-player.y)<1000);
        if(!available.length)return; const f=available[Math.floor(this.random()*available.length)];origin={x:f.x+f.width/2,y:f.y+f.height/2};
      }
      if(rule.terrain==='air') {
        origin = { x: view.left - 110 - count * 36, y: player.y + this.range(-100, 100) };
        const activity=this.spots.filter(s=>s.availableAt<=this.clock&&Math.abs(s.y-player.y)<650);
        if(activity.length&&this.random()<.08)origin={x:view.left-110-count*36,y:activity[Math.floor(this.random()*activity.length)].y};
      }
      const points=Array.from({length:count},(_,i)=>({x:Math.round(origin.x+(i%2)*WILDLIFE_SIZE[species].spacing*(rule.terrain==='snow'?side:1)+this.range(-3,3)),y:Math.round(origin.y+Math.floor(i/2)*WILDLIFE_SIZE[species].spacing+this.range(-3,3))}));
      if(points.some(p=>!outside(p,view,90)||distance(p,player)<rule.playerDistance||distance(p,home)<rule.homeDistance||!this.fresh(p)
        ||p.x<30||p.x>WORLD_WIDTH-30||p.y<150||p.y>WORLD_HEIGHT-150||!rule.areas.includes(areaAt(p.y,p.x))
        ||caveStrength(p.x,p.y)>.1||(rule.terrain==='snow'&&!validSnow(p,rule.radius))||(rule.terrain==='floe'&&!validFloe(p,rule.radius))))continue;
      if(this.encounters.some(e=>e.points.some(p=>distance(p,origin)<130)))continue;
      this.encounters.push({id:this.nextId++,species,points,expiresAt:this.clock+rule.lifetime*this.range(.8,1.2),heading:this.range(0,Math.PI*2)});
      this.cooldown[species]=this.clock+rule.cooldown;
      if(rule.rarity==='rare'||(species==='seal'&&count>1))this.rareAt=this.clock+DYNAMIC.rareCooldown;
      return;
    }
  }
  update(delta: number, player: Point, view: View, protectedSpot?: Point, playerSpeed = 0) {
    if (this.lastPlayerY !== undefined && Math.abs(player.y - this.lastPlayerY) > 1) this.travelDirection = Math.sign(player.y - this.lastPlayerY);
    this.lastPlayerY = player.y;
    this.clock+=Math.min(delta,50)/1000;
    this.schoolElapsed+=Math.min(delta,50)/1000;
    if(this.schoolElapsed>=.1){const dt=this.schoolElapsed;this.schoolElapsed=0;
      for(const spot of this.spots)if(spot!==protectedSpot&&!spot.retired&&spot.availableAt<=this.clock)
        moveSchool(spot,dt,player,playerSpeed,this.random,p=>areaAt(p.y,p.x)===spot.area&&locationAt(p.x,p.y)?.id===locationAt(spot.x,spot.y)?.id&&validWater(p)&&this.spots.every(other=>other===spot||Math.hypot(other.x-p.x,other.y-p.y)>SCHOOL.spacing));
    }
    if(this.clock<this.nextTick)return; this.nextTick=this.clock+DYNAMIC.tick;
    this.recent=this.recent.filter(r=>r.until>this.clock);
    for(let i=this.spots.length-1;i>=0;i--){const s=this.spots[i];
      if(s!==protectedSpot&&this.clock>=s.expiresAt&&this.clock>=s.availableAt&&outside(s,view)&&distance(s,player)>120){this.remember(s);this.spots.splice(i,1);}
    }
    for(let i=this.encounters.length-1;i>=0;i--){const e=this.encounters[i];
      if (animalActivity(e.species, this.conditions) === 0) e.expiresAt = Math.min(e.expiresAt, this.clock + 3);
      if(this.clock>=e.expiresAt&&(e.departed||e.points.every(p=>outside(p,view,100))||this.clock>e.expiresAt+46)){e.points.forEach(p=>this.remember(p));this.encounters.splice(i,1);this.cooldown[e.species]=Math.max(this.cooldown[e.species]??0,this.clock+ANIMAL_RULES[e.species].cooldown);}
    }
    this.populate(player,view); this.assignVisitors(view);
    for(const id of Object.keys(ANIMAL_RULES) as AnimalId[])this.spawnAnimal(id,player,view);
    this.onChange();
  }
}
