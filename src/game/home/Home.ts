import {VillageRoutines} from './VillageRoutines';
import type {Conditions} from '../world/conditions';
import {VILLAGE_FIXTURES,fixturePostRadius} from './villageFixtures';
import {landDecorationFits,landPlant} from '../world/river';
import {dockApproach, dockBoarding} from './dockInteraction';
import {landings,landingWalk,LandingsView,type Landing} from './Landings';
import { pixelText } from '../ui/PixelText';
import { VillageLighting, VILLAGE_LIGHTING } from './VillageLighting';
import Phaser from 'phaser';
import { HOME } from '../tuning';
import { Cargo } from '../player/Cargo';
import { Wallet } from '../player/Wallet';
import { Kayak } from '../entities/Kayak';
import { Fisherman } from '../entities/Fisherman';
import { ASSETS, ASSET_FRAMES, ATLAS } from '../assets/textures';
import { VILLAGE, WORKSHOP_BAY, BUILDING_BODIES, type VillageRect } from './villageLayout';

export const HUB = { merchant: VILLAGE.npcs.merchant, keeper: VILLAGE.npcs.keeper, seller: VILLAGE.npcs.seller, talkDistance: VILLAGE.talkDistance };
export type HubInteraction = 'cargo' | 'gear' | 'tools' | 'journal';
export class Home {
  readonly fisherman: Fisherman;
  readonly routines:VillageRoutines;
  walking = false;
  private landing?:Landing;
  private landingView:LandingsView;
  private get dock(){return this.walking?this.landing??VILLAGE.dock:landings().find(s=>this.near(s,95))??VILLAGE.dock;}
  private hint: Phaser.GameObjects.Text;
  private feedback: Phaser.GameObjects.Text;
  readonly lighting: VillageLighting;
  private feedbackTime = 0;
  private occluders: { image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite; baseY: number }[] = [];


  constructor(private scene: Phaser.Scene, private kayak: Kayak, private cargo: Cargo, private wallet: Wallet, land: Phaser.Physics.Arcade.StaticGroup) {
    this.landingView=new LandingsView(scene,land);
    this.drawGround();
    const obstacles: VillageRect[] = [...BUILDING_BODIES.map(r=>({...r})), ...this.drawScenery()];
    for(const b of VILLAGE.buildings) {
      const image=scene.add.image(b.x,b.y,ATLAS,ASSETS[b.asset]).setOrigin(0).setDepth(1);
      this.occluders.push({image,baseY:b.y+Math.max(...b.bodies.map(r=>r[1]+r[3]))});
    }
    scene.add.image(HOME.dockX-99,HOME.dockY-20,ATLAS,ASSETS.dock).setOrigin(0).setDepth(1);
    land.add(scene.add.zone(HOME.dockX-48,HOME.dockY,96,24));
    scene.add.image(WORKSHOP_BAY.dockX,WORKSHOP_BAY.dockY,ATLAS,ASSETS['workshop-service-dock']).setOrigin(0).setDepth(.9);
    for(const[x,y,w,h]of WORKSHOP_BAY.rails)land.add(scene.add.zone(x+w/2,y+h/2,w,h));
    for(const[id,x,y]of VILLAGE.props){
      if(id==='village-firepit')scene.add.sprite(x,y,ATLAS,ASSETS[id]).setOrigin(0).setDepth(1).setData('emissive',true).play('village-firepit/none/idle');
      else {
        const image=scene.add.image(x,y,ATLAS,ASSETS[id]).setOrigin(0).setDepth(1);
        if(id!=='hub-net'&&id!=='village-rope')this.occluders.push({image,baseY:y+(id==='village-lamp'?22:image.height-5)});
      }
      if(id==='harbor-landing'){for(const [dx,dy,w,h]of [[2,2,18,60],[20,2,56,18]])land.add(scene.add.zone(x+dx+w/2,y+dy+h/2,w,h));}
      else if(id==='village-beacon')obstacles.push({x:x+17,y:y+35,width:23,height:29});
      else if(id==='village-lamp')obstacles.push({x:x+12,y:y+22,width:0,height:0,radius:VILLAGE_LIGHTING.lampBaseRadius});
      else if(id==='village-firepit')obstacles.push({x:x+14,y:y+14,width:0,height:0,radius:VILLAGE_LIGHTING.fireRadiusCollision});
      else if(id!=='hub-net'&&id!=='village-rope'){
        const frame=scene.textures.getFrame(ATLAS,ASSETS[id]);
        obstacles.push({x:x+4,y:y+4,width:frame.width-8,height:frame.height-8});
      }
    }
    for(const f of VILLAGE_FIXTURES){
      const image=scene.add.image(f.x,f.y,ATLAS,ASSETS[f.id]).setOrigin(0).setDepth(1);
      this.occluders.push({image,baseY:f.baseY});
      if(f.post){
        obstacles.push({x:f.x+8,y:f.baseY,width:0,height:0,radius:fixturePostRadius});
        const post=scene.add.zone(f.x+8,f.baseY,fixturePostRadius*2,fixturePostRadius*2);land.add(post);
        (post.body as Phaser.Physics.Arcade.StaticBody).setCircle(fixturePostRadius);
      }
    }
    this.routines=new VillageRoutines(scene,obstacles);
    for(const [role,npc] of Object.entries(VILLAGE.npcs)){
      const image=scene.add.sprite(npc.x,npc.y,ATLAS,ASSETS[npc.asset]).setDepth(2).play(`${npc.asset}/N/idle`);
      this.routines.add(role as keyof typeof VILLAGE.npcs,image);
    }
    obstacles.push({x:VILLAGE.forecastBoard.x-12,y:VILLAGE.forecastBoard.y+6,width:24,height:5});
    obstacles.push({x:VILLAGE.requestBoard.x-12,y:VILLAGE.requestBoard.y+6,width:24,height:5});
    this.fisherman=new Fisherman(scene,obstacles);
    this.lighting=new VillageLighting(scene);

    const style={fontFamily:'monospace',fontSize:'10px',color:'#f3d49a',backgroundColor:'#173642',padding:{x:4,y:3},align:'center'};
    this.hint=pixelText(scene,0,0,'',style).setOrigin(.5,1).setDepth(4);
    this.feedback=pixelText(scene,HUB.seller.x,HUB.seller.y-25,'',style).setOrigin(.5,1).setDepth(5).setVisible(false);
  }
  private drawGround() {
    if(this.scene.textures.exists('village-ground'))this.scene.textures.remove('village-ground');
    const texture=this.scene.textures.createCanvas('village-ground',VILLAGE.ground.width,VILLAGE.ground.height)!,ctx=texture.context;
    ctx.imageSmoothingEnabled=false;
    const segments=VILLAGE.paths.flatMap((path,index)=>path.slice(1).map((b,i)=>({a:path[i],b,width:VILLAGE.pathWidths[index]})));
    // Paint a single merged, lightly compacted surface. No outline or repeated tile stamps.
    for(let y=0;y<VILLAGE.ground.height;y+=2)for(let x=0;x<VILLAGE.ground.width;x+=2){
      const wx=x+VILLAGE.ground.x,wy=y+VILLAGE.ground.y;
      let distance=Infinity;
      for(const{a,b,width}of segments){
        const dx=b[0]-a[0],dy=b[1]-a[1],t=Phaser.Math.Clamp(((wx-a[0])*dx+(wy-a[1])*dy)/(dx*dx+dy*dy),0,1);
        distance=Math.min(distance,Math.hypot(wx-a[0]-t*dx,wy-a[1]-t*dy)-width);
      }

      const width=0+Math.sin(wy/17)*1.5+Math.sin(wx/11)*1.2;
      if(distance>width)continue;
      const alpha=distance>width-3?.12:.25;
      ctx.fillStyle=`rgba(155,183,197,${alpha})`;ctx.fillRect(x,y,2,2);
    }
    ctx.fillStyle='rgba(123,146,156,.28)';
    for(const path of VILLAGE.paths)for(let i=1;i<path.length;i++){
      const[a,b]=[path[i-1],path[i]],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
      for(let d=7;d<length;d+=11){const x=a[0]+(b[0]-a[0])*d/length,y=a[1]+(b[1]-a[1])*d/length;if(x<VILLAGE.dock.x-128)ctx.fillRect(Math.round(x)+(Math.floor(d/11)%2?3:-3)-VILLAGE.ground.x,Math.round(y)-VILLAGE.ground.y,2,2);}
    }
    texture.refresh();this.scene.add.image(VILLAGE.ground.x,VILLAGE.ground.y,'village-ground').setOrigin(0).setDepth(.5);
  }
  private drawScenery() {
    const obstacles:VillageRect[]=[],crowns=this.scene.registry.get('treeCrowns') as {x:number;y:number}[];
    for(const[id,x,y,variant]of VILLAGE.scenery){
      const frame=ASSET_FRAMES[id][variant];
      const bounds=this.scene.textures.getFrame(ATLAS,frame);
      if(landPlant(id)&&!landDecorationFits(x-bounds.realWidth/2,y-bounds.realHeight/2,bounds.realWidth,bounds.realHeight))continue;
      const image=this.scene.add.image(x,y,ATLAS,frame).setDepth(id==='village-snowbank'?.7:1);
      if(id!=='village-snowbank'&&id!=='dead-branch')this.occluders.push({image,baseY:y+9});
      if(id==='tree-mature'||id==='tree-young')crowns.push({x,y});
      if(id==='frozen-bush')obstacles.push({x,y,width:0,height:0,radius:10});
      else if(id.startsWith('tree-')||id==='rock'||id==='snow-log')obstacles.push({x:x-9,y:y-9,width:18,height:18});
    }
    return obstacles;
  }
  get player() { return this.walking?this.fisherman:this.kayak; }
  private near(point:{x:number;y:number},distance=HUB.talkDistance){return Phaser.Math.Distance.BetweenPoints(this.player,point)<=distance;}
  get inRange(){return this.canInteract('cargo');}
  private nearService(npc:typeof VILLAGE.npcs[keyof typeof VILLAGE.npcs]){
    const resident=this.routines.residents.find(r=>VILLAGE.npcs[r.role]===npc);
    return this.near(npc)||!!resident&&this.near(resident.sprite);
  }
  get atWorkshop(){return !this.walking&&this.near(WORKSHOP_BAY,WORKSHOP_BAY.radius)&&this.kayak.body!.velocity.length()<=WORKSHOP_BAY.maxSpeed;}
  canInteract(view:HubInteraction){if(view==='gear')return this.atWorkshop;return this.walking&&Object.values(VILLAGE.npcs).some(n=>n.view===view&&this.nearService(n));}
  get interaction():HubInteraction|undefined{
    if(this.atWorkshop)return 'gear';
    if(!this.walking)return;
    const npc=Object.values(VILLAGE.npcs).find(n=>n.view!=='gear'&&this.nearService(n));return npc?.view;
  }
  get canLand(){return !this.walking&&dockApproach(this.dock,this.kayak)&&this.kayak.body!.velocity.length()<=VILLAGE.dock.maxSpeed;}
  get canLaunch(){return this.walking&&dockBoarding(this.dock,this.fisherman);}
  setMovementEnabled(enabled:boolean){this.kayak.setMovementEnabled(enabled&&!this.walking);this.fisherman.setMovementEnabled(enabled&&this.walking);}
  interactDock(){
    if(this.canLand){
      const dock=this.dock;this.landing=landings().find(s=>s===dock);
      this.fisherman.walkable=this.landing?(x,y)=>landingWalk(this.landing!,x,y):undefined;
      const body=this.kayak.body as Phaser.Physics.Arcade.Body;body.reset(dock.x,dock.y);
      this.kayak.setRotation(0);this.walking=true;this.kayak.setOccupied(false);
      this.fisherman.setPosition(dock.landX,dock.landY).setVisible(true);
    }else if(this.canLaunch){const dock=this.dock;(this.kayak.body as Phaser.Physics.Arcade.Body).reset(dock.x,dock.y);this.walking=false;this.fisherman.setVisible(false);this.kayak.setOccupied(true);}
    else return false;
    this.setMovementEnabled(true);
    // startFollow recenters immediately; retain the previous scroll for a seamless handoff.
    const camera=this.scene.cameras.main,sx=camera.scrollX,sy=camera.scrollY;
    camera.startFollow(this.player,false,camera.lerp.x,camera.lerp.y);camera.setScroll(sx,sy);
    this.scene.events.emit('river-cue','npc',.25);return true;
  }
  sell(index?:number):{count:number;earnings:number}{
    if(!this.inRange)return {count:0,earnings:0};
    const fish=index===undefined?this.cargo.unload():this.cargo.remove(index),earnings=fish.reduce((sum,f)=>sum+this.cargo.marketValue(f),0);
    if(fish.length){this.wallet.credit(earnings);this.feedbackTime=HOME.feedbackDuration;this.feedback.setText(`Sold ${fish.length} fish\n+$${earnings}`);this.scene.events.emit('cargo-sold',{fish,earnings});}
    return {count:fish.length,earnings};
  }
  update(delta:number,available:boolean,night=0,conditions:Conditions={phase:'day',weather:'clear'}):HubInteraction|undefined{
    const dt=Math.min(delta,50)/1000;this.fisherman.update(delta);this.landingView.update(night,this.scene.time.now,this.player.y);this.lighting.update(delta,night,this.player.y);
    this.routines.update(delta,this.player,conditions);
    for(const object of this.occluders)object.image.setDepth(this.player.y<object.baseY?2.2:1);
    const interaction=available?this.interaction:undefined,npc=Object.values(VILLAGE.npcs).find(n=>n.view===interaction);
    const dockHint=available&&(this.canLand||this.canLaunch);
    const nearBay=!this.walking&&this.near(WORKSHOP_BAY,60);
    const nearDock=!this.walking&&dockApproach(this.dock,this.kayak);
    const point=nearBay?WORKSHOP_BAY:npc??(this.walking?{x:this.dock.landX,y:this.dock.landY}:this.dock);
    this.hint.setPosition(point.x,point.y-28).setText(nearBay?(this.atWorkshop?'E — Kayak Workshop':'Slow into the service bay'):npc?.label??(this.walking?'E — Board kayak':this.canLand?'E — Land':'Slow down at the dock'))
      .setVisible(available&&!!(npc||dockHint||nearDock||nearBay));
    this.feedbackTime=Math.max(0,this.feedbackTime-dt);const t=1-this.feedbackTime/HOME.feedbackDuration;
    this.feedback.setVisible(available&&this.feedbackTime>0).setAlpha(Math.min(1,this.feedbackTime*3)).setY(HUB.seller.y-28-t*12);
    return interaction;
  }
}
