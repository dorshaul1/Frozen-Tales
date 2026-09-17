import {requireFeature} from '../progression/features';
import {areaAt,AREA_SPAWNS,type AreaId} from '../world/spawnRules';
import {positionPanel,panelPoint} from '../ui/panelPosition';
import {INTERACTION_SPOTS} from '../world/interactionSpots';
import {eventName} from '../world/areaEvents';
import {preparationAt} from '../world/preparation';
import {RODS,UPGRADES} from '../upgrades/data';
import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { Discovery, MAP, MAP_MARKERS, type MapMarker } from './discovery';
import { crossingAccess, placeGroup, type PlaceGroup, type MapProgress } from './access';
import { ICE_PASSAGES, passageBounds } from '../world/traversalData';
import { waterAt, waterSpans, WORLD_WIDTH, WORLD_HEIGHT } from '../world/river';
import { SaveStore } from '../player/SaveStore';
import { ASSETS, ATLAS } from '../assets/catalog';

export const CHART = { left:-198, top:-108, sidebar:88, sidebarWidth:110, scale:MAP.width/4200 };
export class WorldMap {
 readonly discovery:Discovery;
 isOpen=false;
 forecast?:()=>void;
 private rowButtons=document.createElement('div');
 private panel:Phaser.GameObjects.Container;
 private chart:Phaser.Textures.CanvasTexture;
 private marks:Phaser.GameObjects.Graphics;
 private regionLabels:Phaser.GameObjects.Container;
 private list:Phaser.GameObjects.Container;
 private notice:Phaser.GameObjects.Text;
 private timer=0;
 private m:Phaser.Input.Keyboard.Key;
 private escape:Phaser.Input.Keyboard.Key;
 private panKeys:Phaser.Input.Keyboard.Key[];
 private top=0;
 private west=0;
 private group:PlaceGroup='areas';
 private selected?:string;
 private page=0;
 private button=document.getElementById('map-button');
 readonly temporaryMarkers:(MapMarker&{expiresAt:number})[]=[];
 constructor(private scene:Phaser.Scene,private store:SaveStore,private player:()=>{x:number;y:number},private available:()=>boolean,
   private lock:(locked:boolean)=>void,private progress:()=>MapProgress=()=>({icebreaker:store.load().loadout?.includes('icebreaker')??false,openedPassages:store.load().openedPassages??[]})){
  Object.assign(this.rowButtons.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'11',display:'none'});document.body.append(this.rowButtons);
  this.discovery=new Discovery(store.loadMap());
  if(!(store.loadMap() as {regional?:unknown}|undefined)?.regional){this.discovery.regional.inferLegacy(store.load().records,store.load().goals?.wildlife);store.writeMap(this.discovery.snapshot());}
  this.discovery.regional.onChange=region=>{const saved=this.store.writeMap(this.discovery.snapshot());if(saved){this.scene.events.emit('regional-discovery-changed',region);if(this.isOpen)this.renderList();}return saved;};
  if(scene.textures.exists('exploration-chart'))scene.textures.remove('exploration-chart');
  this.chart=scene.textures.createCanvas('exploration-chart',MAP.width,MAP.height)!;
  this.marks=scene.add.graphics();this.regionLabels=scene.add.container();this.list=scene.add.container();
  const recenter=this.text(-29,-128,'YOU', '#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.center(this.player().y,this.player().x));
  const west=this.text(-111,-128,'←','#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.panAcross(-520));
  const east=this.text(-94,-128,'→','#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.panAcross(520));
  const north=this.text(-75,-128,'↑', '#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.pan(-520));
  const south=this.text(-55,-128,'↓', '#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.pan(520));
  const close=this.text(129,-128,'M / Esc · close').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.close());
  this.panel=scene.add.container(0,0,[
   scene.add.image(0,0,ATLAS,ASSETS['map-frame']),this.text(-198,-128,'RIVER CHART','#f3d49a'),west,east,north,south,recenter,close,
   scene.add.image(CHART.left,CHART.top,'exploration-chart').setOrigin(0),this.marks,this.regionLabels,this.list,
   this.text(-198,120,'◆ You · Dark: unexplored'),
   this.text(80,120,'FORECAST','#f3d49a').setInteractive({useHandCursor:true}).on('pointerdown',()=>this.forecast?.()),
  ]).setDepth(35).setVisible(false);
  this.notice=this.text(0,0,'','#f3d49a').setOrigin(.5).setStroke('#173642',3).setDepth(21).setVisible(false);
  this.m=scene.input.keyboard!.addKey('M');this.escape=scene.input.keyboard!.addKey('ESC');
  this.panKeys=['UP','DOWN','SPACE','LEFT','RIGHT'].map(k=>scene.input.keyboard!.addKey(k));scene.input.keyboard!.addCapture('M');
  scene.input.on('wheel',this.wheel,this);scene.input.on('pointerdown',this.pickMarker,this);
  this.button?.addEventListener('click',this.toggle);
  scene.game.events.on(Phaser.Core.Events.BLUR,this.close,this);
  scene.events.once('shutdown',()=>{scene.input.off('wheel',this.wheel,this);scene.input.off('pointerdown',this.pickMarker,this);
   this.button?.removeEventListener('click',this.toggle);scene.game.events.off(Phaser.Core.Events.BLUR,this.close,this);this.panel.destroy(true);this.notice.destroy();this.rowButtons.remove();});
 }
 private text(x:number,y:number,t:string,color='#c0dce0'){
  return pixelText(this.scene,x,y,t,{fontFamily:'monospace',fontSize:'8px',color});
 }
 private toggle=()=>{if(this.isOpen)this.close();else this.open();};
 open(){
  if(!requireFeature(this.scene,'riverChart','Mara at Lookout Point can help you chart the river.'))return;
  if(this.isOpen||!this.available())return;
  const p=this.player();if(this.discovery.visit(p.x,p.y).changed)this.store.writeMap(this.discovery.snapshot());
  this.isOpen=true;this.lock(true);this.selected=areaAt(p.y,p.x);this.group='areas';this.page=0;
  this.panel.setVisible(true);this.rowButtons.style.display='block';this.button?.blur();this.button?.setAttribute('aria-expanded','true');
  document.body.classList.add('panel-open');this.scene.events.emit('river-cue','ui-open',.4);
  this.center(p.y,p.x);this.position();
 }
 close(){
  if(!this.isOpen)return;this.isOpen=false;this.panel.setVisible(false);this.rowButtons.style.display='none';this.button?.setAttribute('aria-expanded','false');
  document.body.classList.remove('panel-open');this.scene.input.keyboard?.resetKeys();this.lock(false);this.scene.events.emit('river-cue','ui-close',.35);
 }
 private position(){positionPanel(this.scene,this.panel,420,280);this.positionRows();}
 private positionRows(){const c=this.scene.cameras.main,b=this.scene.game.canvas.getBoundingClientRect(),sx=b.width/this.scene.scale.width,sy=b.height/this.scene.scale.height,scale=c.zoom*this.panel.scaleX;for(const el of Array.from(this.rowButtons.children) as HTMLButtonElement[]){Object.assign(el.style,{left:`${b.left+(c.x+c.width/2+Number(el.dataset.x)*scale)*sx}px`,top:`${b.top+(c.y+c.height/2+Number(el.dataset.y)*scale)*sy}px`,width:`${Number(el.dataset.w)*scale*sx}px`,height:`${12*scale*sy}px`});}}
 private rowButton(label:string,x:number,y:number,width:number,click:()=>void){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;b.dataset.x=String(x);b.dataset.y=String(y);b.dataset.w=String(width);Object.assign(b.style,{position:'fixed',pointerEvents:'auto',background:'transparent',border:'0',padding:'0',cursor:'pointer'});b.onclick=click;this.rowButtons.append(b);}

 update(delta:number){
  if(Phaser.Input.Keyboard.JustDown(this.m))this.toggle();
  if(this.isOpen&&Phaser.Input.Keyboard.JustDown(this.escape))this.close();
  const player=this.player();
  if(!this.isOpen){
   const result=this.discovery.visit(player.x,player.y);
   if(result.changed){if(result.found.length)this.scene.events.emit('regional-discovery-changed',areaAt(player.y,player.x));const saved=this.store.writeMap(this.discovery.snapshot());const found=result.found.find(m=>m.notify);
    if(found||!saved){this.timer=3;this.notice.setText(saved?(found!.kind==='entrance'?found!.name.toUpperCase():`New ${this.discovery.regional.catalog.find(p=>p.id===found!.id)?.category==='landings'?'Landing':this.discovery.regional.catalog.find(p=>p.id===found!.id)?.category==='caves'?'Cave':'Landmark'} · ${found!.name}`):'Map save unavailable');}}
  }
  this.timer=Math.max(0,this.timer-Math.min(delta,50)/1000);
  this.notice.setPosition(player.x,player.y-43).setVisible(this.timer>0&&!this.isOpen).setAlpha(Math.min(1,this.timer));
  if(this.isOpen){
   this.position();
   if(Phaser.Input.Keyboard.JustDown(this.panKeys[0]))this.pan(-520);
   if(Phaser.Input.Keyboard.JustDown(this.panKeys[1]))this.pan(520);
   if(Phaser.Input.Keyboard.JustDown(this.panKeys[2]))this.center(player.y,player.x);
   if(Phaser.Input.Keyboard.JustDown(this.panKeys[3]))this.panAcross(-520);
   if(Phaser.Input.Keyboard.JustDown(this.panKeys[4]))this.panAcross(520);
   this.drawMarkers();
  }
  return this.isOpen;
 }
 private center(y:number,x?:number){if(x!==undefined)this.west=Phaser.Math.Clamp(x-MAP.width/CHART.scale/2,0,Math.max(0,WORLD_WIDTH-MAP.width/CHART.scale));this.top=Phaser.Math.Clamp(y-MAP.height/CHART.scale/2,0,WORLD_HEIGHT-MAP.height/CHART.scale);this.render();}
 private panAcross(distance:number){this.west=Phaser.Math.Clamp(this.west+distance,0,Math.max(0,WORLD_WIDTH-MAP.width/CHART.scale));this.render();}
 private pan(distance:number){this.center(this.top+MAP.height/CHART.scale/2+distance);}
 private wheel(_p:Phaser.Input.Pointer,_over:unknown,_dx:number,dy:number){if(this.isOpen)this.pan(Math.sign(dy)*260);}
 private point(x:number,y:number){return {x:CHART.left+Math.round((x-this.west)*CHART.scale),y:CHART.top+Math.round((y-this.top)*CHART.scale)};}
 private onChart(p:{x:number;y:number},margin=4){return p.x>=CHART.left+margin&&p.x<CHART.left+MAP.width-margin&&p.y>=CHART.top+margin&&p.y<CHART.top+MAP.height-margin;}
 private get knownPlaces(){
  return MAP_MARKERS.flatMap(m=>{
   if(this.discovery.landmarks.has(m.id)&&this.discovery.known(m.x,m.y))return [m];
   if(m.kind!=='entrance'||!this.discovery.visitedAreas.has(m.id as ReturnType<typeof areaAt>))return [];
   // Labels use only already-charted water in their actual region. Entering a
   // region from a new branch never reveals its old canonical marker remotely.
   const cells=[...this.discovery.regions].map(key=>{const [x,y]=key.split(',').map(Number);return {x:(x+.5)*MAP.chunk,y:(y+.5)*MAP.chunk};}).filter(p=>waterAt(p.x,p.y)&&areaAt(p.y,p.x)===m.id);
   cells.sort((a,b)=>Math.hypot(a.x-m.x,a.y-m.y)-Math.hypot(b.x-m.x,b.y-m.y));
   return cells[0]?[{...m,...cells[0]}]:[];
  }).sort((a,b)=>a.y-b.y||a.x-b.x);
 }
 private pickMarker(pointer:Phaser.Input.Pointer){
  if(!this.isOpen)return;
  const local=panelPoint(this.scene,this.panel,pointer);
  // Use the same camera-independent pointer conversion as map markers.
  // Text hit areas inside the scaled Chart can drift from their visible rows.
  if(local.x>=CHART.sidebar-2&&local.x<=CHART.sidebar+CHART.sidebarWidth){
   if(local.y>=-95&&local.y<-78){
    this.group=local.x<CHART.sidebar+34?'areas':local.x<CHART.sidebar+75?'landmarks':'services';
    this.page=0;this.selected=this.group==='areas'?areaAt(this.player().y,this.player().x):undefined;this.renderList();return;
   }
   const row=Math.floor((local.y+70)/13),places=this.knownPlaces.filter(m=>placeGroup(m)===this.group);
   if(local.y>=-70&&row>=0&&row<6){const m=places[this.page*6+row];if(m){this.selected=m.id;this.center(m.y,m.x);}return;}
   if(local.y>=10&&local.y<=24&&places.length>6){this.page=(this.page+1)%Math.ceil(places.length/6);this.renderList();return;}
  }
  if(!this.onChart(local))return;
  const nearest=this.knownPlaces.filter(m=>this.onChart(this.point(m.x,m.y)))
   .sort((a,b)=>Phaser.Math.Distance.BetweenPoints(local,this.point(a.x,a.y))-Phaser.Math.Distance.BetweenPoints(local,this.point(b.x,b.y)))[0];
  if(nearest&&Phaser.Math.Distance.BetweenPoints(local,this.point(nearest.x,nearest.y))<8){
   this.selected=nearest.id;this.group=placeGroup(nearest);this.page=Math.floor(this.knownPlaces.filter(m=>placeGroup(m)===this.group).indexOf(nearest)/6);this.renderList();
  }
 }
 private render(){
  const ctx=this.chart.context;ctx.imageSmoothingEnabled=false;
  for(let py=0;py<MAP.height;py++)for(let px=0;px<MAP.width;px++){
   const x=this.west+(px+.5)/CHART.scale,y=this.top+(py+.5)/CHART.scale,known=this.discovery.known(x,y);
   let color='#2c414e';
   if(known){
    const water=waterAt(x,y);color=water?'#527f90':'#d0c7a8';
    if(water&&waterSpans(y).some(([l,r])=>Math.min(Math.abs(x-l),Math.abs(x-r))<14))color='#9dc5cc';
   }
   ctx.fillStyle=color;ctx.fillRect(px,py,1,1);
  }
  this.chart.refresh();this.renderList();this.drawMarkers();this.drawRegionLabels();
 }
 private renderList(){
  this.list.removeAll(true);this.rowButtons.replaceChildren();const x=CHART.sidebar;
  this.list.add(this.text(x,-108,'CONTENTS','#f3d49a'));
  for(const [group,label,offset]of [['areas','AREAS',0],['landmarks','SIGHTS',36],['services','HOME',77]] as const){
   const tab=this.text(x+offset,-91,label,this.group===group?'#f3d49a':'#7a9696');
   this.list.add(tab);this.rowButton(label,x+offset,-94,group==='areas'?34:group==='landmarks'?39:33,()=>{this.group=group;this.page=0;this.selected=group==='areas'?areaAt(this.player().y,this.player().x):undefined;this.renderList();});
  }
  const places=this.knownPlaces.filter(m=>placeGroup(m)===this.group);
  if(!places.length)this.list.add(this.text(x,-67,'Nothing charted\nhere yet.','#9dc5cc'));
  places.slice(this.page*6,this.page*6+6).forEach((m,i)=>{
   const status=crossingAccess(m,this.progress()),y=-68+i*13;
   if(this.selected===m.id)this.list.add(this.scene.add.graphics().fillStyle(0x344c59).fillRect(x-2,y-2,112,12));
   const prefix=status.state==='open'?'':'≋ ';
   const label=this.text(x,y,prefix+m.name,this.selected===m.id?'#f3d49a':status.state==='open'?'#dde7e5':'#9dc5cc');
   while(label.width>99&&label.text.length>4)label.setText(label.text.slice(0,-2)+'…');
   this.list.add(label);this.rowButton('View '+m.name+' progress',x-2,y-2,112,()=>{this.selected=m.id;this.center(m.y,m.x);});
   const point=this.point(m.x,m.y);
   if(!this.onChart(point))this.list.add(this.text(x+103,y,point.x<CHART.left?'←':point.x>=CHART.left+MAP.width?'→':point.y<CHART.top?'↑':'↓','#7a9696'));
  });
  if(places.length>6)this.list.add(this.text(x,12,`More · ${this.page+1}/${Math.ceil(places.length/6)}`,'#f3d49a'));
  if(places.length>6)this.rowButton('More places',x,10,110,()=>{this.page=(this.page+1)%Math.ceil(places.length/6);this.renderList();});
  this.positionRows();
  const selected=this.knownPlaces.find(m=>m.id===this.selected),access=selected?crossingAccess(selected,this.progress()):undefined;
  const prep=selected&&placeGroup(selected)==='areas'?preparationAt(selected.x,selected.y):undefined;
  const interaction=selected?INTERACTION_SPOTS[selected.id as keyof typeof INTERACTION_SPOTS]:undefined;
  const regional=this.selected&&Object.hasOwn(AREA_SPAWNS,this.selected)?this.discovery.regional.chartLines(this.selected as AreaId):undefined;
  const detail=regional?.length?regional.join('\n'):interaction?interaction.hint:prep?`${RODS[prep.rod].name} advised\nSuggested modules:\n${prep.modules.map(id=>UPGRADES[id].name).join("\n")}`:access?.text||'Arrows / wheel: pan\nSpace: find yourself';
  const description=this.text(x,30,detail,'#9dc5cc').setLineSpacing(2).setWordWrapWidth(CHART.sidebarWidth);
  const lines=description.getWrappedText();if(lines.length>8)description.setText(lines.slice(0,8).join('\n'));
  this.list.add(description);
  const event=eventName(this.player().x,this.player().y);if(event&&!selected)this.list.add(this.text(x,96,event,'#f3d49a').setFontSize(7));
 }
 private drawRegionLabels(){
  this.regionLabels.removeAll(true);const occupied:Phaser.Geom.Rectangle[]=[];
  for(const m of this.knownPlaces.filter(m=>m.kind==='entrance'||m.kind==='village')){
   const p=this.point(m.x,m.y);if(!this.onChart(p,12))continue;
   const label=this.text(0,0,m.name.toUpperCase(),'#f0e4bd').setFontSize(7).setWordWrapWidth(76).setAlign('center').setStroke('#2c414e',2);
   const x=Math.round(Phaser.Math.Clamp(p.x-label.width/2,CHART.left+3,CHART.left+MAP.width-label.width-3)),y=Math.round(Math.min(p.y+8,CHART.top+MAP.height-label.height-3));
   const box=new Phaser.Geom.Rectangle(x-2,y-2,label.width+4,label.height+4);
   if(occupied.some(r=>Phaser.Geom.Intersects.RectangleToRectangle(r,box))){label.destroy();continue;}
   occupied.push(box);label.setPosition(x,y);this.regionLabels.add(label);
  }
 }
 private drawMarkers(){
  this.marks.clear();
  // Draw each known place exactly once, independently of which contents group is open.
  for(const m of this.knownPlaces){
   const p=this.point(m.x,m.y);if(!this.onChart(p))continue;
   const color=this.selected===m.id?0xf5d990:m.kind==='npc'?0xc4a878:m.kind==='entrance'?0xf1f1df:0x9dc5cc;
   this.marks.fillStyle(0x233e49).fillRect(p.x-3,p.y-3,7,7).fillStyle(color);
   if(m.kind==='npc')this.marks.fillRect(p.x-1,p.y-1,3,3);
   else if(m.kind==='village')this.marks.fillRect(p.x-2,p.y-2,5,5);
   else this.marks.fillTriangle(p.x,p.y-2,p.x+3,p.y+2,p.x-3,p.y+2);
   if(this.selected===m.id)this.marks.lineStyle(1,0xf5d990).strokeRect(p.x-5,p.y-5,10,10);
  }
  const progress=this.progress();
  for(const passage of ICE_PASSAGES){
   if(progress.openedPassages.includes(passage.id))continue;
   const b=passageBounds(passage),mid={x:b.x+b.width/2,y:b.y+7},p=this.point(mid.x,mid.y);
   if(!this.discovery.known(mid.x,mid.y)||!this.onChart(p,8))continue;
   const half=Math.max(3,Math.round(b.width*CHART.scale/2));
   this.marks.lineStyle(2,0xc0dce0).lineBetween(p.x-half,p.y,p.x+half,p.y);
   this.marks.lineStyle(1,0x233e49).lineBetween(p.x-2,p.y-3,p.x+2,p.y+3);
  }
  for(const m of this.temporaryMarkers.filter(m=>m.expiresAt>this.scene.time.now)){
   const p=this.point(m.x,m.y);if(this.onChart(p)&&this.discovery.known(m.x,m.y))this.marks.fillStyle(0xf3d49a).fillRect(p.x-1,p.y-1,3,3);
  }
  const p=this.point(this.player().x,this.player().y);
  if(this.onChart(p,5)){
   this.marks.fillStyle(0x173642).fillRect(p.x-4,p.y-4,9,9).fillStyle(0xf5d990)
    .fillTriangle(p.x,p.y-4,p.x+4,p.y,p.x-4,p.y).fillTriangle(p.x,p.y+4,p.x+4,p.y,p.x-4,p.y).fillStyle(0xf1f1df).fillRect(p.x,p.y-1,1,2);
  }
 }
}
