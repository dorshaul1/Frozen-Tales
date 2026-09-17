import {hasFeature} from '../progression/features';
import {positionPanel} from '../ui/panelPosition';
import {freshness} from '../player/freshness';
import { SPECIMENS } from '../fishing/specimens';
import { pixelText } from '../ui/PixelText';
import { DailyMarket } from '../market/DailyMarket';
import { learnedWaterSign } from '../fishing/spotReading';
import { journalGuide } from '../fishing/journalGuide';
import type { Conditions } from '../world/conditions';
import Phaser from 'phaser';
import { Kayak, kayakAttachmentFrame } from '../entities/Kayak';
import { Cargo, type CaughtFish } from '../player/Cargo';
import { Wallet } from '../player/Wallet';
import { Equipment } from '../upgrades/Equipment';
import { TOOL_IDS, type ToolId, RODS, itemName, UPGRADES, shopUpgrades, MODULE_IDS, type ModuleId } from '../upgrades/data';
import { FISH, RARITIES, type FishId } from '../fishing/data';
import { Home } from './Home';
import { ASSETS, ASSET_FRAMES, ATLAS } from '../assets/textures';
import type { AssetId } from '../assets/catalog';

type Tab = 'cargo' | 'gear' | 'tools' | 'journal';
const FISH_IDS = Object.keys(FISH) as FishId[];
const fishArt = (id: FishId): AssetId => `fish-${id}`;
const GOLD = '#f3d49a', PALE = '#dde7e5', MUTED = '#9dc5cc';

// All views share the existing inventory, equipment and journal state.
export class HarborPanel {
  isOpen = false;
  private managing = false;
  private pending?: CaughtFish;
  private confirmIndex = -1;
  tab: Tab = 'cargo';
  private selection = 0;
  private moduleSlot = 0;
  private detailOpen = false;
  private panel: Phaser.GameObjects.Container;
  private cards: Phaser.GameObjects.Container;
  private title: Phaser.GameObjects.Text;
  private purse: Phaser.GameObjects.Text;
  private subtitle: Phaser.GameObjects.Text;
  private status: Phaser.GameObjects.Text;
  private help: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Image;
  private statusTime = 0;
  private marketDay=0;
  private journalConditions='';
  private keys: Phaser.Input.Keyboard.Key[];
  private highlight: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene, private kayak: Kayak, private cargo: Cargo,
    private wallet: Wallet, private equipment: Equipment, private home: Home, private conditions:()=>Conditions=()=>({phase:'day',weather:'clear'}), private market = new DailyMarket()) {
    const background = this.art('hub-panel', 0, 0);
    this.portrait = this.art('merchant', -157, -117);
    this.title = this.text(-134, -127, '', GOLD, 11);
    this.purse = this.text(120, -127, '', GOLD, 10);
    const coin = this.art('coin-icon', 109, -120);
    this.subtitle = this.text(-134, -105, '', '#b08d63', 8);
    this.cards = scene.add.container();
    this.status = this.text(-165, 111, '', GOLD, 9);
    this.help = this.text(-165, 126, '', MUTED, 8);
    this.panel = scene.add.container(0, 0, [background, this.portrait, this.title, coin, this.purse, this.subtitle, this.cards, this.status, this.help]).setDepth(10).setVisible(false);
    this.highlight = scene.add.graphics().setDepth(3);
    this.keys = ['ESC', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER', 'B', 'R'].map(key => scene.input.keyboard!.addKey(key));
    scene.input.keyboard!.addCapture('ESC,ENTER');
    scene.game.events.on(Phaser.Core.Events.BLUR, this.close, this);
    scene.events.once('shutdown', () => { scene.game.events.off(Phaser.Core.Events.BLUR, this.close, this); document.body.classList.remove('panel-open'); });
  }
  private text(x: number, y: number, value: string, color = PALE, size = 9) {
    return pixelText(this.scene,x, y, value, { fontFamily: 'monospace', fontSize: `${size}px`, color });
  }
  private art(id: AssetId, x: number, y: number, variant = 0) {
    return this.scene.add.image(x, y, ATLAS, ASSET_FRAMES[id][variant] ?? ASSETS[id]);
  }
  toggleCargo(){if(this.isOpen){if(this.managing&&!this.pending)this.close();}else this.openCargo();}
  openCargo(pending?: CaughtFish) {
    this.managing = true; this.pending = pending; this.confirmIndex = -1;
    this.isOpen = true; this.home.setMovementEnabled(false);
    this.status.setText(''); this.setTab('cargo'); this.panel.setVisible(true);
    document.body.classList.add('panel-open'); this.position();
    this.keys.forEach(key => key.reset());
  }
  open(tab: Tab) {
    this.managing = false; this.confirmIndex = -1;
    if (!this.home.canInteract(tab)) return;
    if(tab==='journal')this.scene.events.emit('journal-opened');
    this.scene.events.emit('river-cue', tab === 'cargo' ? 'ui-open' : 'npc', .5);
    this.isOpen = true; this.home.setMovementEnabled(false);
    this.statusTime = 0; this.status.setText(''); this.setTab(tab);
    this.panel.setVisible(true); document.body.classList.add('panel-open');
    this.keys.forEach(key => key.reset()); this.position();
  }
  close() {
    if(this.pending) this.releaseFeedback();
    this.pending = undefined; this.confirmIndex = -1;
    if (this.isOpen) { this.home.setMovementEnabled(true); this.scene.events.emit('river-cue', 'ui-close', .4); }
    this.isOpen = false; this.panel.setVisible(false); document.body.classList.remove('panel-open');
  }
  private position() {
    positionPanel(this.scene,this.panel,360,280);
  }
  private setTab(tab: Tab) { this.tab = tab; this.selection = 0; this.detailOpen = false; this.refresh(); }
  private get shopIds() { return shopUpgrades(this.tab === 'tools' ? 'tools' : 'gear'); }
  private get gearItems(){return [
    ...RODS.map((rod,model)=>({id:'rod' as const,model,name:rod.name,detail:rod.detail})),
    ...shopUpgrades('tools').filter(id=>id!=='rod').map(id=>({id,model:Math.min(this.equipment.levels[id]+1,UPGRADES[id].levels.length),name:itemName(id,Math.min(this.equipment.levels[id]+1,UPGRADES[id].levels.length)),detail:UPGRADES[id].description}))
  ];}
  private activateGear(){
    if(!this.home.canInteract('tools')){this.close();return;}
    const item=this.gearItems[this.selection],id=item.id;
    if(id==='rod'&&item.model<=this.equipment.levels.rod){this.equipment.equipRod(item.model);this.message(item.name+' equipped');}
    else if((TOOL_IDS as readonly string[]).includes(id)&&id!=='bait'&&this.equipment.levels[id]){this.equipment.selectTool(id as ToolId);this.message(item.name+' selected · F to use');}
    else if(id==='rod'&&item.model!==this.equipment.levels.rod+1)this.message('Own the previous rod first.',true);
    else {
      const next=this.equipment.next(id),result=this.equipment.purchase(id);
      if(result==='insufficient')this.message(`Need $${next!.cost-this.wallet.balance} more.`,true);
      else if(result==='maxed')this.message('Best model owned.');
      else {this.scene.events.emit('upgrade-purchased',{id,cost:next!.cost});this.message(itemName(id,this.equipment.levels[id])+` · -$${next!.cost}`);}
    }
    this.refresh();
  }
  private count() { return this.tab==='tools'?this.gearItems.length:this.tab === 'cargo' ? this.cargo.count + 1 : this.tab === 'gear' ? this.shopIds.length : FISH_IDS.length; }
  private message(text: string, error = false) {
    this.statusTime = 2.5; this.status.setText(text).setColor(error ? '#cc8154' : GOLD);
  }
  private buyModule(){
    if(!this.home.canInteract('gear')){this.close();return;}
    const id=this.shopIds[this.selection],next=this.equipment.next(id),result=this.equipment.purchase(id);
    if(result==='insufficient')this.message(`Need $${next!.cost-this.wallet.balance} more.`,true);
    else if(result==='maxed')this.message('Module fully upgraded.');
    else {this.scene.events.emit('upgrade-purchased',{id,cost:next!.cost});this.message(`Owned · ${UPGRADES[id].name} -$${next!.cost}${result==='save-unavailable'?' · save unavailable':''}`);}
    this.refresh();
  }
  private fitModule(id:ModuleId|null){
    const result=this.equipment.setSlot(this.moduleSlot,id);
    this.refresh();
    if(result==='cargo-full')this.message('Sell or release fish before removing storage.',true);
    else if(result==='workshop-only'){this.close();}
    else if(result==='unowned')this.message('Buy this module first.',true);
    else {this.scene.events.emit('river-cue','upgrade',.3);this.message(result==='save-unavailable'?'Loadout changed · save unavailable':id?`Slot ${this.moduleSlot+1} fitted · ${UPGRADES[id].name}`:'Module stored safely · slot free');}
  }
  private activate() {
    if(this.tab==='tools'){this.activateGear();return;}
    if(this.tab==='gear'){const id=this.shopIds[this.selection] as ModuleId;if(this.equipment.levels[id])this.fitModule(id);else this.buyModule();return;}

    if (this.tab === 'journal') { this.detailOpen = !this.detailOpen; this.refresh(); return; }
    if (this.managing && this.tab === 'cargo') {
      if(this.selection === 0) { this.close(); return; }
      const index = this.selection - 1;
      if(this.confirmIndex !== index) { this.confirmIndex = index; this.message(this.pending ? 'E again: release this fish and keep the new catch' : 'E again: release this fish · no money earned'); return; }
      if(this.cargo.remove(index).length) {
        if(this.pending) this.cargo.store(this.pending);
        this.pending = undefined; this.equipment.save(); this.releaseFeedback();
      }
      this.confirmIndex = -1; this.selection = 0; this.refresh(); this.message('Fish released'); return;
    }
    if (!this.home.canInteract(this.tab)) { this.close(); return; }
    if (this.tab === 'cargo') {
      const sold = this.home.sell(this.selection === 0 ? undefined : this.selection - 1);
      this.message(sold.count ? `Sold ${sold.count} fish  +$${sold.earnings}` : 'An empty basket. The river is waiting.');
    }
    this.selection = Math.min(this.selection, this.count() - 1); this.refresh();
  }
  private releaseFeedback() {
    this.scene.events.emit('river-cue', 'cast', .3);
    const p=this.home.player;
    const ripple=this.scene.add.graphics().setDepth(4).lineStyle(1,0x9dc5cc,.7).strokeEllipse(p.x+13,p.y+9,12,5);
    this.scene.tweens.add({targets:ripple,alpha:0,duration:550,onComplete:()=>ripple.destroy()});
  }
  private card(id: AssetId, x: number, y: number, width: number, height: number, state: number, index: number) {
    const container = this.scene.add.container(x, y);
    container.add(this.art(id, width / 2, height / 2, state));
    const hit = this.scene.add.zone(width / 2, height / 2, width - 4, height - 4).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.selection = index; this.activate(); });
    container.add(hit); this.cards.add(container); return container;
  }
  private refresh() {
    this.cards.removeAll(true);
    this.title.setText(this.managing ? (this.pending ? 'INVENTORY FULL' : 'KAYAK CARGO') : this.tab === 'gear' ? 'KAYAK WORKSHOP' : this.tab === 'tools' ? 'PLAYER GEAR' : this.tab === 'journal' ? 'IVO’S FIELD GUIDE' : 'NESSA’S FISH MARKET');
    this.purse.setText(`$${this.wallet.balance}`);
    this.portrait.setVisible(!this.managing);
    this.portrait.setFrame(ASSETS[this.tab === 'journal' ? 'journal-keeper' : this.tab === 'gear' ? 'merchant' : this.tab === 'tools' ? 'tools-keeper' : 'fish-seller']);
    this.subtitle.setText(this.tab === 'gear' ? 'Three active modules · owned parts stay yours.' : this.tab === 'tools' ? 'Personal tackle · no kayak slots used.' : this.tab === 'journal' ? 'The river’s visitors, remembered.' : 'Fresh catches for the village.');
    this.help.setText('Arrows · choose     E · confirm     Esc · close');
    if(this.managing) this.help.setText(this.pending ? 'Choose a card to REPLACE · E confirms · Esc releases new fish' : 'Choose a card to release · E confirms · Esc closes');
    if(this.managing) this.subtitle.setText(this.pending ? 'Choose a fish below to replace.' : 'One fish, one slot. Release unwanted catches.');
    if (this.tab === 'gear') this.drawWorkshop();
    else if (this.tab === 'tools') this.drawGear();
    else if (this.tab === 'journal') this.drawJournal();
    else this.drawCargo();
    if(this.tab==='cargo'&&!this.managing)this.drawMarket();
  }
  private drawWorkshop(){
    this.help.setText('↑↓ part · ←→ slot · E fit / buy · B upgrade · R remove');
    const levels=this.equipment.kayakLevels,loadout=this.equipment.loadout,id=this.shopIds[this.selection] as ModuleId;
    const level=this.equipment.levels[id],next=this.equipment.next(id);
    this.cards.add(this.text(-165,-88,'INSTALLED · 3 SLOTS',GOLD,8));
    loadout.forEach((part,i)=>{
      const x=-165+i*37,y=-73,g=this.scene.add.graphics().fillStyle(0x233e49).fillRect(x,y,33,29).lineStyle(1,i===this.moduleSlot?0xf3d49a:0x70513f).strokeRect(x,y,33,29);
      this.cards.add(g);
      if(part)this.cards.add(this.art(`gear-${part}` as AssetId,x+16,y+14));
      else this.cards.add(this.text(x+14,y+10,String(i+1),MUTED,8));
      this.cards.add(this.scene.add.zone(x+16,y+14,33,29).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.moduleSlot=i;this.refresh();}));
    });
    this.cards.add(this.art('kayak',-111,23).setScale(2));
    for(const part of MODULE_IDS)if(levels[part])this.cards.add(this.scene.add.image(-111,23,ATLAS,kayakAttachmentFrame(part,levels[part])).setScale(2));
    const fitted=loadout[this.moduleSlot];
    this.cards.add(this.text(-165,89,`Slot ${this.moduleSlot+1}: ${fitted?itemName(fitted,this.equipment.levels[fitted]):'empty'}`,GOLD,8).setWordWrapWidth(120));
    this.cards.add(this.art('module-card',65,-31));
    this.cards.add(this.art(`gear-${id}` as AssetId,-19,-66));
    this.cards.add(this.text(0,-79,UPGRADES[id].name,GOLD,9));
    this.cards.add(this.text(0,-64,`${level?itemName(id,level):'Choose your equipment'} · ${this.selection+1}/${this.shopIds.length}`,MUTED,8));
    this.cards.add(this.text(-28,-42,UPGRADES[id].description,PALE,8).setWordWrapWidth(187));
    this.cards.add(this.text(-28,-14,next?itemName(id,level+1)+': '+next.detail:UPGRADES[id].levels.at(-1)!.detail,GOLD,8).setWordWrapWidth(187));
    this.cards.add(this.text(-28,8,this.equipment.equipped(id)?'INSTALLED':level?'OWNED · NOT INSTALLED':'NOT OWNED',MUTED,8));
    const action=(y:number,label:string,run:()=>void,color=GOLD)=>{
      this.cards.add(this.scene.add.graphics().fillStyle(0x344c59).fillRect(-38,y,206,18).lineStyle(1,0x947052).strokeRect(-38,y,206,18));
      this.cards.add(this.text(-31,y+5,label,color,8));
      this.cards.add(this.scene.add.zone(65,y+9,206,18).setInteractive({useHandCursor:true}).on('pointerdown',run));
    };
    action(33,next?`B · ${level?'NEXT MODEL':'BUY'} $${next.cost}`:'BEST MODEL OWNED',()=>this.buyModule(),next&&this.wallet.balance<next.cost?'#a4b7bc':GOLD);
    action(57,`E · FIT TO SLOT ${this.moduleSlot+1}`,()=>this.fitModule(id),level?GOLD:MUTED);
    action(81,`R · REMOVE SLOT ${this.moduleSlot+1}`,()=>this.fitModule(null),fitted?GOLD:MUTED);
    // Mouse users can browse the same catalog without a separate interface.
    for(const [label,x,step]of [['←',115,-1],['→',152,1]] as const)this.cards.add(this.text(x,-100,label,GOLD,9).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.selection=(this.selection+step+this.count())%this.count();this.refresh();}));
  }
  private drawGear() {
    const items=this.gearItems,page=Math.floor(this.selection/6);
    this.subtitle.setText('One equipped rod · personal tools use no slots');
    items.slice(page*6,page*6+6).forEach((item,i)=>{
      const index=page*6+i,id=item.id,level=this.equipment.levels[id];
      const owned=id==='rod'?item.model<=level:level>=item.model;
      const equipped=id==='rod'?this.equipment.gear.rod===item.model:owned&&this.equipment.gear.selectedTool===id;
      const locked=id==='rod'&&item.model>level+1;
      const cost=id==='rod'?RODS[item.model].cost:this.equipment.next(id)?.cost??0;
      const state=equipped?3:locked||!owned&&cost>this.wallet.balance?2:this.selection===index?1:0;
      const card=this.card('gear-card',-172+i%2*172,-88+Math.floor(i/2)*63,168,60,state,index);
      card.add(this.art(id==='rod'?`rod-model-${item.model}` as AssetId:`gear-${id}` as AssetId,20,23));
      card.add(this.text(37,7,item.name,GOLD,8));
      card.add(this.text(37,21,equipped?'EQUIPPED':owned?'OWNED · E equip':locked?`$${cost} · OWN PREVIOUS`:`$${cost} · ${this.wallet.balance>=cost?'BUY':'SAVE UP'}`,equipped?GOLD:MUTED,7));
      card.add(this.text(9,37,id==='bait'&&level>0?`Using ${itemName(id,level)}\nF cycles owned bait`:item.detail,PALE,7).setWordWrapWidth(150));
      if(this.selection===index)card.add(this.scene.add.graphics().lineStyle(1,0xf3d49a).strokeRect(1,1,165,57));
    });
    this.help.setText('Arrows choose · E buy / select · Esc close');
    const pages=Math.ceil(items.length/6);
    this.cards.add(this.text(-165,101,`Player gear · ${page+1}/${pages}`,MUTED,8));
    if(pages>1)for(const [label,x,step]of [['←',120,-1],['→',151,1]] as const)this.cards.add(this.text(x,101,label,GOLD,9).setInteractive({useHandCursor:true}).on('pointerdown',()=>{this.selection=((page+step+pages)%pages)*6;this.refresh();}));
  }
  private drawMarket() {
    const ids=(Object.keys(this.cargo.records) as FishId[]).filter(id=>this.cargo.records[id]);
    const ordered=ids.sort((a,b)=>Number(this.market.rate(b)!==1)-Number(this.market.rate(a)!==1)||this.market.rate(b)-this.market.rate(a)).slice(0,3);
    this.status.setText(`Today's market · Day ${this.market.state.day}`); this.statusTime=2;
    // Small price cards above the existing sell grid; only known fish are shown.
    this.subtitle.setText(ordered.length?'':'Normal prices · discover fish to learn local demand');
    ordered.forEach((id,i)=>{
      const x=-166+i*112;
      this.cards.add(this.scene.add.graphics().fillStyle(0x253d49).fillRect(x,-112,108,23));
      this.cards.add(this.art(fishArt(id),x+14,-99).setScale(.55));
      this.cards.add(this.text(x+28,-112,FISH[id].name,PALE,7));
      this.cards.add(this.text(x+28,-101,`$${this.market.price({type:id,value:FISH[id].value})} ${this.market.label(id)}`,GOLD,7));
    });
  }
  private drawCargo() {
    const page = this.selection === 0 ? 0 : Math.floor((this.selection - 1) / 6);
    const totalPages = Math.max(1, Math.ceil(this.cargo.count / 6));
    const sell = this.scene.add.graphics().fillStyle(this.selection === 0 ? 0x4a6860 : 0x344c59).fillRect(-167, -88, 334, 20)
      .lineStyle(1, 0xb08d63).strokeRect(-167, -88, 334, 20);
    const sellText = this.text(-158, -83, this.managing ? (this.pending ? 'RELEASE NEW CATCH · Esc' : 'CLOSE CARGO · Esc') : `SELL THE HOLD  ${this.cargo.count}/${this.cargo.capacity}    $${this.cargo.totalValue}`, GOLD, 10)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.selection = 0; this.activate(); });
    this.cards.add([sell, sellText]);
    if(this.pending) {
      const f=this.pending; this.cards.add(this.art(fishArt(f.type),-146,-111));
      this.subtitle.setText(`${FISH[f.type].name} · ${f.weightKg.toFixed(2)}kg · $${this.cargo.marketValue(f)} · ${RARITIES[f.rarity].name} · ${freshness(f).name}`);
    }
    if (!this.cargo.count) {
      this.cards.add(this.art('gear-cargo', 0, -5).setScale(2));
      this.cards.add(this.text(-103, 34, 'Nothing in the basket yet.', MUTED, 10));
      this.cards.add(this.text(-119, 51, 'Look for shadows and bubbles.', MUTED, 9));
    }
    this.cargo.entries.slice(page * 6, page * 6 + 6).forEach((fish, offset) => {
      const index = page * 6 + offset + 1;
      const card = this.card('cargo-card', -172 + offset % 2 * 172, -63 + Math.floor(offset / 2) * 54, 168, 54, this.selection === index ? 1 : 0, index);
      card.add(this.art(fishArt(fish.type), 29, 25));
      card.add(this.text(56, 8, FISH[fish.type].name, PALE, 8));
      card.add(this.text(56, 21, `${fish.weightKg.toFixed(2)}kg · $${this.cargo.marketValue(fish)}`, GOLD, 9));
      card.add(this.scene.add.graphics().fillStyle(freshness(fish).color).fillRect(145,7,5,5));
      card.add(this.text(56, 35, `${fish.size&&fish.size!=='normal'?SPECIMENS[fish.size].name:RARITIES[fish.rarity].name} · ${freshness(fish).name} ${Math.round((freshness(fish).rate-1)*100)}%`, RARITIES[fish.rarity].color, 8));
    });
    if (totalPages > 1) this.cards.add(this.text(111, 100, `${page + 1}/${totalPages}`, MUTED, 8));
  }
  private drawJournal() {
    const id = FISH_IDS[this.selection], best = this.cargo.records[id];
    if (this.detailOpen) {
      const guide=journalGuide(id,this.conditions(),this.home.player.y,this.equipment.baitLevel,this.home.player.x,this.equipment.traversalProgress);
      const illustration=this.art(fishArt(id),-128,-57).setScale(1.5);
      if(!best)illustration.setTintFill(0x566977);
      this.cards.add(illustration);
      this.cards.add(this.text(-89,-83,best?FISH[id].name:'???',GOLD,12));
      this.cards.add(this.text(-89,-64,`${RARITIES[FISH[id].rarity].name}${hasFeature(this.scene,'advancedFishingKnowledge')?' · Fight: '+guide.difficulty:''}`,MUTED,9));
      this.cards.add(this.text(-89,-49,best?`Best ${best.toFixed(2)}kg · Base $${FISH[id].value} · Today $${this.market.price({type:id,value:FISH[id].value})}`:'Uncaught · specimen hidden',PALE,8));
      if(best)this.cards.add(this.text(-89,-38,`${this.market.label(id)} · Trophies ${this.cargo.trophies[id]??0}${best>=FISH[id].baseKg*1.5?' · TROPHY BEST':''}`,GOLD,8));
      if(hasFeature(this.scene,'advancedFishingKnowledge')){
      this.cards.add(this.text(-160,-28,guide.status+(guide.available&&guide.rows[0].state==='unmet'?' · travel to habitat':''),guide.available?'#a7c7a7':'#cc8154',10));
      guide.rows.forEach((row,i)=>{
        const y=-9+i*19,color=row.state==='met'?'#a7c7a7':row.state==='unmet'?'#cc8154':MUTED;
        this.cards.add(this.text(-160,y,row.state==='met'?'✓':row.state==='unmet'?'×':'–',color,9));
        this.cards.add(this.text(-147,y,row.label+':',MUTED,7));
        this.cards.add(this.text(-147,y+8,row.text,PALE,7));
      });
      this.cards.add(this.text(-160,88,guide.available?(best?learnedWaterSign(id,this.cargo.records):guide.special):guide.reason,MUTED,7).setWordWrapWidth(320));
      }else{this.cards.add(this.text(-160,-10,'Area: '+guide.rows[0].text,PALE,8).setWordWrapWidth(310));this.cards.add(this.text(-160,22,'Ask Eirik at Old Fisher’s Rest\nfor advanced habitat and hunting notes.',MUTED,8));}
      const back = this.text(-156, 111, '← Back to the gallery · E', GOLD, 10).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.detailOpen = false; this.refresh(); });
      this.cards.add(back); return;
    }
    const page = Math.floor(this.selection / 3);
    FISH_IDS.slice(page * 3, page * 3 + 3).forEach((fishId, i) => {
      const known = !!this.cargo.records[fishId];
      const card = this.card('fish-card', -171 + i * 114, -77, 112, 132, this.selection === page * 3 + i ? 1 : 0, page * 3 + i);
      const portrait = this.art(fishArt(fishId), 56, 40).setScale(2);
      if (!known) portrait.setTintFill(0x566977);
      card.add(portrait);
      card.add(this.text(56, 70, known ? FISH[fishId].name : '???', known ? GOLD : MUTED, 9).setOrigin(.5, 0));
      card.add(this.text(56, 88, known ? RARITIES[FISH[fishId].rarity].name : 'Undiscovered', MUTED, 8).setOrigin(.5, 0));
      card.add(this.text(56, 104, known ? `${this.cargo.records[fishId]!.toFixed(2)} kg · BEST` : (!hasFeature(this.scene,'advancedFishingKnowledge')?'Undiscovered':journalGuide(fishId,this.conditions(),this.home.player.y,this.equipment.baitLevel,this.home.player.x,this.equipment.traversalProgress).available?'Available now':'Check conditions'), known ? PALE : '#7b929c', 8).setOrigin(.5, 0));
    });
    this.cards.add(this.text(-157, 73, 'River stories · arrows browse pages.\nChoose a fish to open its record.', '#b08d63', 9));
  }
  update(delta: number, confirm: boolean) {
    this.statusTime = Math.max(0, this.statusTime - Math.min(delta, 50) / 1000);
    if (!this.statusTime) this.status.setText('');
    const edges = this.keys.map(key => Phaser.Input.Keyboard.JustDown(key));
    if (!this.isOpen) return;
    this.position();
    if(this.marketDay!==this.market.state.day){this.marketDay=this.market.state.day;this.refresh();}
    const conditions=JSON.stringify(this.conditions());
    if(this.tab==='journal'&&conditions!==this.journalConditions){this.journalConditions=conditions;this.refresh();}
    if (edges[0]) { this.close(); return; }
    if(this.tab==='gear'){
      if(edges[1]||edges[2]){this.selection=(this.selection+(edges[1]?-1:1)+this.count())%this.count();this.refresh();}
      if(edges[3]||edges[4]){this.moduleSlot=(this.moduleSlot+(edges[3]?-1:1)+3)%3;this.refresh();}
      if(edges[6])this.buyModule();else if(edges[7])this.fitModule(null);else if(confirm||edges[5])this.activate();
      return;
    }
    if (edges.slice(1, 5).some(Boolean) && !this.detailOpen) {
      const columns = this.tab === 'journal' ? 3 : 2;
      const change = edges[1] ? -columns : edges[2] ? columns : edges[3] ? -1 : 1;
      this.selection = this.tab === 'cargo' && this.selection === 0 && change > 0 ? Math.min(1, this.count() - 1) : Phaser.Math.Clamp(this.selection + change, 0, this.count() - 1);
      this.confirmIndex = -1; this.refresh();
    }
    if (confirm || edges[5]) this.activate();
  }
}
