import {requireFeature} from '../progression/features';
import {interactionReading} from '../world/interactionSpots';
import {riverReading} from '../world/riverConditions';
import {locationPool} from '../world/sideRoutes';
import Phaser from 'phaser';
import type { Equipment } from './Equipment';
import type { Home } from '../home/Home';
import type { EnvironmentView } from '../world/EnvironmentView';
import type { Fishing } from '../fishing/Fishing';
import { habitatAt,waterDepth } from '../world/depth';
import { validWater } from '../world/DynamicWorld';
import { waterAt } from '../world/river';
import { AREA_SPAWNS,areaAt,areaFishPool } from '../world/spawnRules';
import { FISH,type FishId } from '../fishing/data';
import { journalGuide } from '../fishing/journalGuide';
import type { Conditions } from '../world/conditions';
import { pixelText } from '../ui/PixelText';
import { ASSETS,ATLAS,type AssetId } from '../assets/catalog';
import { UPGRADES,TOOL_USE,itemName,type ToolId,type BeltItem } from './data';

// One reusable quick-use layer. Ownership and selection remain in Equipment/SaveStore.
export class ToolView {
  private light:Phaser.GameObjects.Graphics;
  private effects:Phaser.GameObjects.Graphics;
  private belt:Phaser.GameObjects.Container;
  private editor:Phaser.GameObjects.Container;
  private beltStamp='';
  private dragging=false;
  private numberSlot=-1;
  isEditing=false;
  private editSlot=0;
  private editChoice=0;
  private held:Phaser.GameObjects.Image;
  private label:ReturnType<typeof pixelText>;
  private readout:ReturnType<typeof pixelText>;
  private keys:Phaser.Input.Keyboard.Key[];
  private remaining=0;
  private cooldown=0;
  private action?:ToolId;
  private point={x:0,y:0};
  constructor(private scene:Phaser.Scene,private equipment:Equipment,private home:Home,
    private environment:EnvironmentView,private fishing:Fishing,private canUse:()=>boolean=()=>true,
    private context:()=>{conditions:Conditions;records:Partial<Record<FishId,number>>}=()=>({conditions:{phase:'day',weather:'clear'},records:{}})) {
    this.light=scene.add.graphics().setDepth(1.05);this.effects=scene.add.graphics().setDepth(3);
    this.held=scene.add.image(0,0,ATLAS,ASSETS['handheld-tools']).setVisible(false).setDepth(4);
    this.readout=pixelText(scene,0,0,'',{fontSize:'8px',color:'#dde7e5',backgroundColor:'#233e49',padding:{x:5,y:4}}).setOrigin(.5,1).setDepth(9).setScrollFactor(0);
    this.belt=scene.add.container(0,0).setDepth(9).setScrollFactor(0);
    this.editor=scene.add.container(0,0).setDepth(10).setScrollFactor(0);
    this.label=pixelText(scene,0,23,'',{fontSize:'8px',color:'#f3d49a'}).setOrigin(.5,0);
    this.belt.add(this.label);
    this.keys=['Q','R','F','ONE','TWO','THREE','FOUR','FIVE','B','ESC','LEFT','RIGHT','UP','DOWN','ENTER','E'].map(k=>scene.input.keyboard!.addKey(k));
    // Read physical keys before Phaser/browser shortcuts. Some embedded browsers
    // consume an unmodified keydown; keyup still supplies the same physical key.
    const pressedNumbers=new Set<number>();
    const numberKey=(event:KeyboardEvent)=>{
      const match=/^(?:Digit|Numpad)([1-5])$/.exec(event.code);
      const legacy=event.keyCode>=49&&event.keyCode<=53?event.keyCode-48:
        event.keyCode>=97&&event.keyCode<=101?event.keyCode-96:0;
      const number=match?Number(match[1]):/^[1-5]$/.test(event.key)?Number(event.key):legacy;
      if(!number)return;
      const handled=pressedNumbers.has(number);
      if(event.type==='keyup')pressedNumbers.delete(number);
      if(event.ctrlKey||event.metaKey||event.altKey||!this.canUse())return;
      const target=event.target;
      if(target instanceof HTMLElement&&(target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))return;
      event.preventDefault();
      if(handled)return;
      if(event.type==='keydown')pressedNumbers.add(number);
      this.numberSlot=number-1;
    };
    const resetNumbers=()=>{pressedNumbers.clear();this.numberSlot=-1;};
    window.addEventListener('keydown',numberKey,true);
    window.addEventListener('keyup',numberKey,true);
    window.addEventListener('blur',resetNumbers);
    scene.events.once('shutdown',()=>{
      window.removeEventListener('keydown',numberKey,true);
      window.removeEventListener('keyup',numberKey,true);
      window.removeEventListener('blur',resetNumbers);
      scene.cameras.main.setFollowOffset(0,0);
    });
  }
  cycle(step:number){if(this.canUse()){this.equipment.cycleTool(step);this.cancelInspection();}}
  closeEditor(){if(!this.isEditing)return;this.isEditing=false;this.editor.setVisible(false);this.beltStamp='';}
  toggleInventory(){this.toggleEditor();}
  private toggleEditor(){if(!this.canUse())return;this.cancelInspection();this.isEditing=!this.isEditing;this.editSlot=Math.max(0,this.equipment.belt.indexOf(this.equipment.gear.selectedTool!));this.editChoice=0;this.beltStamp='';}
  private get choices():(BeltItem|null)[]{return ['rod',...this.equipment.ownedTools,null];}
  private assign(id:BeltItem|null){this.equipment.setBeltSlot(this.editSlot,id);if(id)this.equipment.selectBeltSlot(this.editSlot);this.beltStamp='';}
  private selectSlot(index:number){if(!this.canUse())return;if(this.isEditing){this.editSlot=index;this.assign(this.choices[this.editChoice]);}else{this.equipment.selectBeltSlot(index);this.cancelInspection();if(!this.equipment.belt[index])this.say('Empty slot · I to arrange tools',1.7);}}
  private name(id:BeltItem){return id==='rod'?itemName('rod',this.equipment.gear.rod):UPGRADES[id].name;}
  private art(id:BeltItem):AssetId{return id==='rod'?`rod-model-${this.equipment.gear.rod}` as AssetId:`gear-${id}` as AssetId;}
  private drawBelt(){
    if(this.dragging)return;
    const items=this.equipment.belt,selected=this.equipment.gear.selectedTool;
    const stamp=JSON.stringify([items,selected,this.equipment.gear.rod,this.isEditing,this.editSlot,this.editChoice,this.equipment.ownedTools]);
    if(stamp===this.beltStamp)return;this.beltStamp=stamp;
    this.belt.remove(this.label);this.belt.removeAll(true);this.belt.add(this.label);
    const text=(x:number,y:number,value:string,size=8)=>pixelText(this.scene,x,y,value,{fontSize:`${size}px`,color:'#f3d49a'});
    items.forEach((id,i)=>{
      const x=-117+i*40,chosen=this.isEditing?i===this.editSlot:!!id&&id===selected;
      this.belt.add(this.scene.add.graphics().fillStyle(0x233e49,.96).fillRect(x,-19,38,38).lineStyle(1,chosen?0xf3d49a:0x947052).strokeRect(x,-19,38,38));
      this.belt.add(text(x+3,-17,String(i+1),7));
      const hit=this.scene.add.zone(x+19,0,38,38).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.selectSlot(i));this.belt.add(hit);
      if(id){
        const icon=this.scene.add.image(x+22,2,ATLAS,ASSETS[this.art(id)]).setInteractive({useHandCursor:true});
        this.scene.input.setDraggable(icon);
        icon.on('dragstart',()=>{this.dragging=true;});
        icon.on('pointerdown',()=>this.selectSlot(i));
        icon.on('drag',(_pointer:Phaser.Input.Pointer,dx:number,dy:number)=>{if(this.canUse())icon.setPosition(dx,dy);});
        icon.on('dragend',(pointer:Phaser.Input.Pointer)=>{
          this.dragging=false;
          const target=Math.floor((pointer.worldX-this.scene.cameras.main.scrollX-this.belt.x+117)/40);
          if(this.canUse()&&target>=0&&target<5&&Math.abs(pointer.worldY-this.scene.cameras.main.scrollY-this.belt.y)<30)this.equipment.setBeltSlot(target,id);
          this.beltStamp='';
        });this.belt.add(icon);
      }
    });
    const edit=text(86,-9,this.isEditing?'DONE':'EDIT',7).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.toggleEditor());
    this.belt.add(edit);this.belt.add(text(89,3,'I',7));
    this.editor.removeAll(true);this.editor.setVisible(this.isEditing);
    if(!this.isEditing)return;
    const choices=this.choices,rows=Math.ceil(choices.length/2),height=rows*28+45;
    this.editor.add(this.scene.add.graphics().fillStyle(0x233e49,.98).fillRect(-126,-height,252,height).lineStyle(1,0xb08d63).strokeRect(-126,-height,252,height));
    this.editor.add(text(-118,-height+8,`PLAYER TOOLS · FOCUS AN ITEM`,8));
    choices.forEach((id,i)=>{
      const x=-118+(i%2)*122,y=-height+28+Math.floor(i/2)*28;
      this.editor.add(this.scene.add.graphics().fillStyle(i===this.editChoice?0x4a6860:0x344c59).fillRect(x,y,116,25));
      if(id)this.editor.add(this.scene.add.image(x+12,y+12,ATLAS,ASSETS[this.art(id)]));
      this.editor.add(text(x+27,y+8,id?this.name(id):'EMPTY',7).setWordWrapWidth(87));
      this.editor.add(this.scene.add.zone(x+58,y+12,116,25).setInteractive({useHandCursor:true}).setName('tool-choice-'+(id??'empty')).on('pointerdown',()=>{this.editChoice=i;this.beltStamp='';}));
    });
    this.editor.add(text(-118,-12,'Click / arrows focus · 1–5 equip · I close',7));
  }
  private say(text:string,duration=3){this.readout.setText(text);this.remaining=duration;}
  private cancelInspection(){this.scene.cameras.main.setFollowOffset(0,0);this.remaining=0;this.action=undefined;}
  private target(distance:number){
    const p=this.home.player;
    const direction=this.home.walking?p.frame.name.split('/')[1]:'';
    const i=['N','NE','E','SE','S','SW','W','NW'].indexOf(direction);
    const angle=this.home.walking?(i<0?0:i*Math.PI/4):p.rotation;
    return {x:Math.round(p.x+Math.sin(angle)*distance),y:Math.round(p.y-Math.cos(angle)*distance)};
  }
  use(){
    if(!this.canUse()||this.cooldown>0)return;
    const id=this.equipment.gear.selectedTool;
    if(id==='rod'){this.cancelInspection();this.say(this.home.walking?'Board the kayak to fish.':'Hold E / Space to aim and cast.',2);return;}
    if(!id||!this.equipment.levels[id]){this.say('Visit Edda for player tools.');return;}
    this.cooldown=TOOL_USE.cooldown;this.cancelInspection();this.action=id;
    const p=this.home.player;this.point=this.target(TOOL_USE.probeDistance);
    if(id==='lantern'){
      this.equipment.gear.disabled=this.equipment.gear.disabled.filter(id=>id!=='lantern');
      this.equipment.gear.lanternLit=!this.equipment.gear.lanternLit;this.equipment.save();
      this.say(this.equipment.gear.lanternLit?'Lantern lit · warm light nearby':'Lantern extinguished',1.8);
    }else if(id==='finder'){
      const water=waterAt(p.x,p.y)?p:this.point;
      if(!validWater(water,4,false)){this.say('Bring the finder closer to water.');return;}
      this.point={x:water.x,y:water.y};
      const spots=this.fishing.spots.filter(s=>!s.retired&&s.availableAt<=this.fishing.elapsed&&Math.hypot(s.x-water.x,s.y-water.y)<UPGRADES.finder.levels[0].value);
      this.say(`${waterDepth(water.x,water.y).toUpperCase()} WATER · ${interactionReading(water.x,water.y)||riverReading(water.x,water.y)}\n${spots.length>1?'Several moving echoes':spots.length?'Faint fish activity':'No activity detected'} · not a catch guarantee`,TOOL_USE.scanDuration);
    }else if(id==='probe'){
      if(!validWater(this.point,4,false)){this.say('Face open water to lower the probe.');return;}
      const h=habitatAt(this.point.x,this.point.y);this.say(`${h.depth.toUpperCase()} WATER${h.features.length?' · '+h.features.join(' / '):''}\n${interactionReading(this.point.x,this.point.y)||riverReading(this.point.x,this.point.y)||'Sounding ahead of you'}`,3);
    }else if(id==='binoculars'){
      this.point=this.target(UPGRADES.binoculars.levels[0].value);
      this.scene.cameras.main.setFollowOffset(p.x-this.point.x,p.y-this.point.y);
      this.say('Looking ahead · wildlife, landmarks and water signs\nMove to inspect · F to look again',TOOL_USE.inspectDuration);
    }else if(id==='bait'){
      this.equipment.gear.baitModel=(this.equipment.baitLevel+1)%(this.equipment.levels.bait+1);this.equipment.save();
      this.say(this.equipment.baitLevel?`${itemName('bait',this.equipment.baitLevel)} readied\nImproves attraction · F cycles owned bait`:'Basic bait readied\nF cycles owned bait',2.5);
    }else{
      if(!requireFeature(this.scene,'advancedFishingKnowledge','Eirik at Old Fisher’s Rest shares advanced notes.'))return;
      const water=waterAt(p.x,p.y)?p:this.point,{conditions,records}=this.context();
      const area=areaAt(water.y,water.x),h=habitatAt(water.x,water.y);
      const known=(Object.keys(locationPool(water.x,water.y,areaFishPool(area,water.y))) as FishId[]).filter(id=>records[id]&&journalGuide(id,conditions,water.y,this.equipment.baitLevel,water.x,this.equipment.traversalProgress).available&&FISH[id].habitat.depths[h.depth]>=1).slice(0,2);
      this.say(`${AREA_SPAWNS[area].name}\n${waterAt(water.x,water.y)?h.depth.toUpperCase()+' WATER':'SNOWY BANK'} · ${conditions.phase} · ${conditions.weather}\n${known.length?'Known visitors: '+known.map(id=>FISH[id].name).join(', '):'Watch shadows and ripples; record catches to learn more.'}\nHabitat hints, not guaranteed catches`,5);
    }
    this.scene.events.emit('river-cue',id==='probe'?'cast':'ui-open',.22);
  }
  update(delta=16){
    const dt=Math.min(delta,50)/1000,p=this.home.player,allowed=this.canUse(),view=this.scene.cameras.main.worldView,camera=this.scene.cameras.main,hudX=camera.width/2,hudBottom=(camera.height+camera.height/camera.zoom)/2;
    this.cooldown=Math.max(0,this.cooldown-dt);this.remaining=Math.max(0,this.remaining-dt);
    // Shared menu keys belong to their current interface, never to a hidden belt.
    const edges=this.keys.map((k,i)=>allowed&&(i<9||this.isEditing)?Phaser.Input.Keyboard.JustDown(k):false);
    if(!allowed)for(const i of [0,2,3,4,5,6,7])Phaser.Input.Keyboard.JustDown(this.keys[i]);
    const numbered=this.numberSlot;this.numberSlot=-1;
    if(!allowed){this.cancelInspection();this.closeEditor();}
    else if(edges[8]||this.isEditing&&edges[9])this.toggleEditor();
    else if(numbered>=0||edges.slice(3,8).some(Boolean))this.selectSlot(numbered>=0?numbered:edges.slice(3,8).findIndex(Boolean));
    else if(this.isEditing){
      if(edges.slice(10,14).some(Boolean)){const step=edges[10]?-1:edges[11]?1:edges[12]?-2:2;this.editChoice=(this.editChoice+step+this.choices.length)%this.choices.length;}
      if(edges[14]||edges[15]||edges[2])this.assign(this.choices[this.editChoice]);
    }else if(edges[0]||edges[1])this.cycle(edges[0]?-1:1);else if(edges[2])this.use();
    if(!this.remaining)this.scene.cameras.main.setFollowOffset(0,0);
    const selected=this.equipment.gear.selectedTool;
    this.belt.setVisible(allowed).setPosition(Math.round(hudX),Math.round(hudBottom-39));
    this.editor.setPosition(Math.round(hudX),Math.round(hudBottom-65));
    this.drawBelt();
    this.label.setText(selected?`${this.name(selected)} · ${selected==='rod'?'E / Space cast':'F use'}`:'1–5 select · I arrange');
    this.readout.setVisible(allowed&&!this.isEditing&&this.remaining>0).setPosition(Math.round(hudX),Math.round(hudBottom-66));
    this.light.clear();const radius=this.equipment.levels.lantern&&this.equipment.gear.lanternLit?UPGRADES.lantern.levels[0].value:0,night=Math.max(this.environment.night,this.environment.cave);
    // No additive spotlight disk on open water. The handheld sprite, cave visibility
    // and nearby fish readability communicate the lantern without a glowing marker.
    this.fishing.lanternStrength=radius?night:0;
    this.held.setVisible(!!radius||allowed&&this.remaining>0&&!!this.action).setPosition(Math.round(p.x+10),Math.round(p.y+4)).setDepth(p.depth+.02);
    if(this.held.visible){const id=allowed&&this.remaining>0?this.action:'lantern',index=['lantern','finder','binoculars','probe','bait','guide'].indexOf(id??'lantern');this.held.setFrame(`handheld-tools/N/idle/${Math.max(0,index)*2+(Math.floor(this.remaining*5)%2)}`);}
    this.effects.clear();
    if(allowed&&selected==='probe'&&!this.remaining){const t=this.target(TOOL_USE.probeDistance);this.effects.fillStyle(validWater(t,4,false)?0x9dc5cc:0xcc8154,.5).fillRect(t.x-2,t.y,5,1).fillRect(t.x,t.y-2,1,5);}
    if(allowed&&this.remaining>0&&this.action==='finder'&&waterAt(this.point.x,this.point.y)){const radius=8+(1-this.remaining/TOOL_USE.scanDuration)*145;this.effects.lineStyle(1,0x9dc5cc,.28).strokeEllipse(this.point.x,this.point.y,Math.round(radius*2),Math.round(radius));}
    if(allowed&&this.remaining>0&&this.action==='probe'&&waterAt(this.point.x,this.point.y)){this.effects.lineStyle(1,0xc0dce0,.65).lineBetween(Math.round(p.x+10),Math.round(p.y+4),this.point.x,this.point.y);this.effects.fillStyle(0xe7b664).fillRect(this.point.x-1,this.point.y-1,3,3);this.effects.lineStyle(1,0x9dc5cc,.4).strokeEllipse(this.point.x,this.point.y,12,5);}
  }
}
