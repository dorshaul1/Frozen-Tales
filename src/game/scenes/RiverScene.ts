import {REMOTE_NPCS} from '../home/remoteNpcData';
import {landings} from '../home/Landings';
import {MAP_MARKERS} from '../map/discovery';
import {Goals} from '../goals/Goals';
import {GoalsView} from '../goals/GoalsView';
import {CoreQuests} from '../progression/CoreQuests';
import {CoreQuestView} from '../progression/CoreQuestView';
import {RemoteNpcs} from '../home/RemoteNpcs';
import {Trips} from '../player/Trips';
import {showTripSummary} from '../ui/TripSummary';
import {freshness} from '../player/freshness';
import {ForecastBoard} from '../home/ForecastBoard';
import {WeatherView} from '../world/WeatherView';
import {eventDay,setEventDay,readEventDay,generateEvents,eventName} from '../world/areaEvents';
import {preparationHint} from '../world/preparation';
import {locationAt} from '../world/sideRoutes';
import {RiverConditionView} from '../world/RiverConditionView';
import {generateRiverDay,readRiverDay,riverDay,setRiverDay} from '../world/riverConditions';
import {sideRouteAt} from '../world/sideRoutes';
import { ExplorationView } from '../world/ExplorationView';
import { ToolView } from '../upgrades/ToolView';
import {Traversal} from '../world/Traversal';
import { NavigationView } from '../world/NavigationView';
import { SIDE_ROUTES,routeSpan,routeFlow } from '../world/sideRoutes';
import { pixelText, hudPixelText } from '../ui/PixelText';
import { DailyMarket } from '../market/DailyMarket';
import type { CaughtFish } from '../player/Cargo';
import type { Conditions } from '../world/conditions';
import { DailyRequests } from '../requests/DailyRequests';
import { RequestBoard } from '../requests/RequestBoard';
import { WorldMap } from '../map/WorldMap';
import { Sleep } from '../home/Sleep';
import { Environment, ENVIRONMENT } from '../world/conditions';
import { EnvironmentView } from '../world/EnvironmentView';
import Phaser from 'phaser';
import { DynamicWorld } from '../world/DynamicWorld';
import { AREA_SPAWNS, DYNAMIC, areaAt, type AreaId } from '../world/spawnRules';
import { CURRENTS } from '../world/areas';
import { banks } from '../world/river';
import { AudioManager } from '../audio/AudioManager';
import { AudioPanel } from '../audio/AudioPanel';
import { Ambience } from '../world/Ambience';
import { createTextures, loadAssets } from '../assets/textures';
import { Kayak } from '../entities/Kayak';
import { createRiver, WORLD_HEIGHT, WORLD_WIDTH } from '../world/river';
import { HOME, MOVEMENT, WAKE } from '../tuning';
import { Fishing } from '../fishing/Fishing';
import { Cargo } from '../player/Cargo';
import { Wallet } from '../player/Wallet';
import { Home } from '../home/Home';
import { SAVE_KEY, SaveStore } from '../player/SaveStore';
import { Equipment } from '../upgrades/Equipment';
import { capacityAt } from '../upgrades/data';
import { HarborPanel } from '../home/HarborPanel';

export class RiverScene extends Phaser.Scene {
  private devConsole?: import('../dev/DevConsole').DevConsole;
  readonly market: DailyMarket;
  daily!: DailyRequests;
  requestBoard!: RequestBoard;
  private trips!:Trips;
  forecastBoard!: ForecastBoard;
  map!: WorldMap;
  sleep!: Sleep;
  readonly environment: Environment;
  private exploration!: ExplorationView;
  private environmentView!: EnvironmentView;
  private environmentSaveTimer = 0;
  readonly dynamicWorld = new DynamicWorld();
  private tripArmed = true;
  private previousHomeDistance = 0;
  private currentArea?: AreaId;
  private weatherView!:WeatherView;
  private areaLabel!: Phaser.GameObjects.Text;
  private preparationLabel!: Phaser.GameObjects.Text;
  private preparationPlace="";
  private flow!: Phaser.GameObjects.Graphics;
  private kayak!: Kayak;
  private ambience!: Ambience;
  audio!: AudioManager;
  audioPanel!: AudioPanel;
  private store: SaveStore;
  private tools!: ToolView;
  private traversal!: Traversal;
  private riverConditions!: RiverConditionView;
  private navigation!: NavigationView;
  private wake!: Phaser.GameObjects.Graphics;
  private ripples: { x: number; y: number; nx: number; ny: number; strength: number; age: number }[] = [];
  private wakeTimer = 0;
  fishing!: Fishing;
  readonly cargo: Cargo;
  readonly wallet: Wallet;
  readonly equipment: Equipment;
  harborPanel!: HarborPanel;
  private home!: Home;
  remoteNpcs!:RemoteNpcs;
  goals!:Goals;private goalsView!:GoalsView;private goalsRegion='';
  core!:CoreQuests;private coreView!:CoreQuestView;
  private interactionKeys: Phaser.Input.Keyboard.Key[] = [];

  constructor(saveKey: string | null = SAVE_KEY, readonly fixedActivity = false) {
    super('river');
    const store = this.store = new SaveStore(saveKey), saved = store.load();
    this.environment = new Environment(fixedActivity ? { elapsed: 180 } : store.loadEnvironment());
    this.cargo = new Cargo(capacityAt(saved.levels.cargo), saved.cargo, saved.records, saved.encounters,saved.trophies);
    if (!fixedActivity && this.dynamicWorld.restore(store.loadWorld())) this.tripArmed = false;
    this.dynamicWorld.memory = this.cargo.encounters;
    this.market = new DailyMarket(saved.market);
    this.cargo.clock=()=>this.environment.totalSeconds;
    this.cargo.marketValue = fish => Math.max(1,Math.round(this.market.price(fish)*freshness(fish).rate));
    this.wallet = new Wallet(saved.money);
    this.equipment = new Equipment(this.cargo, this.wallet, store, saved.levels, saved.loadout);
  }

  preload() { loadAssets(this); AudioManager.preload(this); }

  create() {
    setEventDay(readEventDay(this.store.load().areaEvents),this.environment.snapshot().elapsed);
    this.refreshAreaEvents();
    setRiverDay(readRiverDay(this.store.load().riverDay));
    this.refreshRiverDay();
    this.riverConditions=new RiverConditionView(this);
    createTextures(this);
    this.cameras.main.roundPixels=false;
    document.querySelectorAll<HTMLElement>('.hud small:not(#haul)').forEach(el=>hudPixelText(el,el.getAttribute('aria-label')??el.textContent??'',1,'#c0dce0'));
    hudPixelText(document.getElementById('map-button'),'MAP',2,'#f3d49a');
    this.ripples = [];
    this.wakeTimer = 0;
    const land = createRiver(this);
    this.audio = new AudioManager(this, this.store);
    this.environmentView = new EnvironmentView(this, this.environment);
    this.weatherView=new WeatherView(this,this.environmentView,this.audio);
    this.ambience = new Ambience(this, this.dynamicWorld, this.environmentView,()=>this.home?.walking?0:this.equipment.value('cover'));
    const saveEnvironment = () => this.equipment.save(this.environment.snapshot(), this.dynamicWorld.snapshot());
    this.dynamicWorld.onChange = saveEnvironment;
    window.addEventListener('pagehide', saveEnvironment);
    this.events.once('shutdown', () => { saveEnvironment(); window.removeEventListener('pagehide', saveEnvironment); });
    this.kayak = new Kayak(this, HOME.spawnX, HOME.spawnY, () => 1 + this.equipment.value('speed'));
    this.kayak.moduleValue=id=>this.equipment.value(id);
    this.kayak.setEquipmentVisual(this.equipment.kayakLevels);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.navigation=new NavigationView(this,this.kayak,this.dynamicWorld,()=>this.equipment.value('cover'),()=>this.environmentView);
    this.traversal=new Traversal(this,this.kayak,this.store,()=>this.equipment.value('icebreaker')>0);
    this.physics.add.collider(this.kayak, land,this.navigation.hit);
    this.daily=new DailyRequests(this.store.load().daily);
    this.home = new Home(this, this.kayak, this.cargo, this.wallet, land);
    this.physics.add.collider(this.kayak,this.ambience.collisionBodies);
    this.remoteNpcs=new RemoteNpcs(this,this.home,this.store.load().corgiHome);
    this.core=new CoreQuests(this.store.load().core,state=>this.store.write({...this.store.load(),core:state,corgiHome:state.features.includes('corgiCompanion')?'village':'ranger'}), (feature,message)=>{if(feature==='corgiCompanion'){const home=this.core.has(feature)?'village':'ranger';this.remoteNpcs.moveDog(home);}this.coreView?.say(message);});
    this.registry.set('coreQuests',this.core);this.coreView=new CoreQuestView(this,this.core);this.remoteNpcs.dialoguePages=id=>this.coreView.pages(id);
    this.events.on('cargo-sold',()=>this.core.sale());this.events.on('fish-landed',({fish}:{fish:CaughtFish})=>this.core.catch(fish.type));
    this.home.fisherman.blockedByWildlife=(x,y)=>this.ambience.blocks(x,y,10)||this.remoteNpcs.blocks(x,y);
    this.equipment.canConfigure=()=>this.home.canInteract('gear');
    this.equipment.onChange=()=>this.kayak.setEquipmentVisual(this.equipment.kayakLevels,true);
    this.sleep = new Sleep(this, this.home, this.environment, this.audio, () => {
      this.environment.sleepUntilMorning();
      this.refreshAreaEvents();
      this.refreshRiverDay();
      this.cargo.age(this.environment.totalSeconds,!!this.equipment.value('insulated'));
    this.refreshRequests();
      this.dynamicWorld.conditions = this.environment.conditions;
      this.dynamicWorld.bait = this.equipment.baitLevel;
      this.dynamicWorld.newDay((Math.random() * 0xffffffff) >>> 0, this.home.player, this.cameras.main.worldView);
      this.tripArmed = true;
      return this.equipment.save(this.environment.snapshot(), this.dynamicWorld.snapshot());
    });
    this.fishing = new Fishing(this, this.kayak, this.cargo, this.equipment, this.fixedActivity ? undefined : this.dynamicWorld);
    this.exploration = new ExplorationView(this,this.environmentView,this.equipment);
    this.tools = new ToolView(this,this.equipment,this.home,this.environmentView,this.fishing,()=>!this.goalsView?.isOpen&&!this.remoteNpcs.dialogue.isOpen&&!this.devConsole?.isOpen&&!this.fishing.active&&!this.sleep?.active&&!this.harborPanel?.isOpen&&!this.audioPanel?.isOpen&&!this.map?.isOpen&&!this.requestBoard?.isOpen,()=>({conditions:this.environment.conditions,records:this.cargo.records}));
    this.harborPanel = new HarborPanel(this, this.kayak, this.cargo, this.wallet, this.equipment, this.home,()=>this.environment.conditions,this.market);
    this.events.on('cargo-overflow',(fish:CaughtFish)=>this.harborPanel.openCargo(fish));
    const cargoButton=document.getElementById('cargo-button');
    const openCargo=()=>{if(!this.goalsView?.isOpen&&!this.remoteNpcs.dialogue.isOpen&&!this.fishing.active&&!this.sleep.active&&!this.audioPanel.isOpen&&!this.map.isOpen&&!this.requestBoard.isOpen&&!this.forecastBoard?.isOpen){this.tools.closeEditor();this.harborPanel.toggleCargo();}};
    const inventoryKey=(event:KeyboardEvent)=>{if(!event.repeat)this.tools.toggleInventory();};
    this.input.keyboard!.on('keydown-I',inventoryKey);
    this.events.once('shutdown',()=>this.input.keyboard?.off('keydown-I',inventoryKey));
    cargoButton?.addEventListener('click',openCargo);
    this.events.once('shutdown',()=>cargoButton?.removeEventListener('click',openCargo));
    this.store.writeEnvironment(this.environment.snapshot());
    this.forecastBoard=new ForecastBoard(this,this.home,this.environment);
    this.requestBoard=new RequestBoard(this,this.home,this.daily,index=>{
      const reward=this.daily.claim(index);if(!reward)return false;
      this.wallet.credit(reward);
      if(!this.saveRequests()){this.wallet.spend(reward);this.daily.state.active[index].claimed=false;return false;}
      this.events.emit('river-cue','sale',.45);return true;
    });
    this.events.on('fish-landed',({fish,area,conditions,large}:{fish:CaughtFish;area:AreaId;conditions:Conditions;large:boolean})=>{if(this.daily.catch(fish,area,conditions,large))this.saveRequests();});
    this.events.on('cargo-sold',({earnings}:{earnings:number})=>{if(this.daily.sale(earnings))this.saveRequests();});
    this.cargo.age(this.environment.totalSeconds,!!this.equipment.value('insulated'));
    this.refreshRequests();
    this.audioPanel = new AudioPanel(this, this.audio, () => { this.forecastBoard.close();this.requestBoard.close(); this.map?.close(); this.harborPanel.close(); this.home.setMovementEnabled(false); }, () => this.home.setMovementEnabled(!this.fishing.active));
    this.map=new WorldMap(this,this.store,()=>this.home.player,()=>!this.goalsView?.isOpen&&!this.remoteNpcs.dialogue.isOpen&&!this.fishing.active&&!this.sleep.active&&!this.audioPanel.isOpen&&!this.requestBoard.isOpen&&!this.forecastBoard?.isOpen,locked=>{
      if(locked)this.harborPanel.close();this.home.setMovementEnabled(!locked&&!this.fishing.active);
    },()=>({icebreaker:this.equipment.value('icebreaker')>0,openedPassages:this.traversal.openedPassages}));
    const saveMoney = () => this.equipment.save();
    this.events.on('cargo-sold', saveMoney);
    this.events.once('shutdown', () => this.events.off('cargo-sold', saveMoney));
    this.goals=new Goals(this.store.load().goals,()=>({now:this.environment.totalSeconds,species:Object.keys(this.cargo.records),caught:Object.keys(this.cargo.records).length>0,home:this.home.walking&&Math.hypot(this.home.player.x-HOME.dockX,this.home.player.y-HOME.dockY)<700,sold:this.core.state.sold,cartographer:!!this.core.state.quests.survey||!!this.goals?.state.talked,chart:this.core.has('riverChart'),upgraded:Object.values(this.equipment.levels).some(n=>n>0),regions:[...this.map.discovery.visitedAreas],journal:this.core.has('advancedFishingKnowledge'),forecast:this.core.has('weatherForecast'),capacity:this.cargo.capacity,count:this.cargo.count,modules:this.equipment.loadout.filter(Boolean).length,trophies:Object.values(this.cargo.trophies).reduce((a,b)=>a+(b??0),0),regionTotal:Object.keys(AREA_SPAWNS).length,landmarks:[...this.map.discovery.landmarks].filter(id=>MAP_MARKERS.some(m=>m.id===id&&m.kind==='landmark'&&!['dock',...landings().map(l=>l.id)].includes(id))),landings:landings().filter(l=>this.map.discovery.landmarks.has(l.id)).map(l=>l.id),landingTotal:landings().length,npcs:REMOTE_NPCS.filter(n=>Object.values(this.core.state.quests).length>0&&((n.id==='cartographer'&&!!this.core.state.quests.survey)||(n.id==='weatherObserver'&&!!this.core.state.quests.weather)||(n.id==='ranger'&&!!this.core.state.quests.ranger)||(n.id==='oldFisher'&&!!this.core.state.quests.knowledge))).map(n=>n.id),npcTotal:REMOTE_NPCS.length,wildlife:this.map.discovery.regional.allWildlifeObserved()}), (state,reward)=>{const ok=this.store.write({...this.store.load(),goals:state,money:this.wallet.balance+reward},this.environment.snapshot());if(ok&&reward)this.wallet.credit(reward);return ok;},title=>this.coreView.say('Objective complete · '+title));
    this.events.on('wildlife-observed',(id:import('../world/spawnRules').AnimalId,x:number,y:number)=>{if(Number.isFinite(x)&&Number.isFinite(y))this.map.discovery.regional.observeWildlife(areaAt(y,x),id);});this.registry.set('currentGoals',this.goals);this.goalsView=new GoalsView(this,this.goals,locked=>this.home.setMovementEnabled(!locked));this.goalsRegion=areaAt(this.home.player.y,this.home.player.x);
    this.events.on('fish-landed',({fish,area}:{fish:CaughtFish;area:AreaId})=>{this.map.discovery.regional.recordFish(area,fish.type);this.goals.event('catch',fish.type);});this.events.on('cargo-sold',({earnings}:{earnings:number})=>this.goals.event('sale',earnings));this.events.on('journal-opened',()=>this.goals.event('journal'));this.events.on('dialogue-opened',(name:string)=>{const npc=REMOTE_NPCS.find(n=>n.name===name);if(npc)this.goals.event('talk',npc.id);});
    this.map.forecast=()=>{this.map.close();this.forecastBoard.open();};
    this.trips=new Trips(this.store.load().trips);
    const saveTrips=()=>this.store.write({...this.store.load(),trips:this.trips.state},this.environment.snapshot());
    this.events.on('fish-landed',({fish}:{fish:import('../player/Cargo').CaughtFish})=>{this.trips.catch(fish,this.environment.totalSeconds);saveTrips();});
    this.events.on('cargo-sold',({fish,earnings}:{fish:import('../player/Cargo').CaughtFish[];earnings:number})=>{
      const summary=this.trips.sell(fish,earnings,this.cargo.count===0,this.environment.totalSeconds,f=>this.cargo.marketValue(f),f=>this.market.price(f));
      saveTrips();if(summary)this.time.delayedCall(0,()=>showTripSummary(this,summary));
    });
    this.interactionKeys = [this.input.keyboard!.addKey('E'), this.input.keyboard!.addKey('SPACE')];
    this.input.keyboard!.addCapture('E,SPACE');
    this.flow = this.add.graphics().setDepth(1);
    this.areaLabel = pixelText(this,0, 0, '', { fontFamily: 'monospace', fontSize: '14px', color: '#c0dce0', stroke: '#203441', strokeThickness: 3 }).setOrigin(.5).setDepth(20).setAlpha(0);
    this.preparationLabel=pixelText(this,0,0,'',{fontSize:'8px',color:'#f3d49a',stroke:'#203441',strokeThickness:3}).setOrigin(.5).setDepth(20).setAlpha(0);
    this.wake = this.add.graphics().setDepth(1);
    const camera = this.cameras.main;
    camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    camera.startFollow(this.kayak, false);
    this.resize(this.scale.gameSize);
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.resize, this));
    if(import.meta.env.DEV)void import('../dev/DevConsole').then(({DevConsole,destination})=>{
      if(!this.sys.isActive())return;
      let consoleDay=this.environment.day;
      this.devConsole=new DevConsole({regional:this.map.discovery.regional,goals:this.goals,core:this.core,environment:this.environment,equipment:this.equipment,cargo:this.cargo,wallet:this.wallet,
        save:saveEnvironment,
        timeChanged:()=>{
          this.cargo.age(this.environment.totalSeconds,!!this.equipment.value('insulated'));
          this.refreshAreaEvents();this.refreshRiverDay();this.refreshRequests();
          this.dynamicWorld.conditions=this.environment.conditions;
          if(consoleDay!==this.environment.day){this.dynamicWorld.newDay((Math.random()*0xffffffff)>>>0,this.home.player,this.cameras.main.worldView);consoleDay=this.environment.day;}
        },
        teleport:name=>{
          if(this.home.walking)throw new Error('Board your kayak before teleporting.');
          const p=destination(name,this.traversal.openedPassages);
          (this.kayak.body as Phaser.Physics.Arcade.Body).reset(p.x,p.y);
          this.cameras.main.centerOn(p.x,p.y);
          return `Teleported near ${name}.`;
        },
        gate:(area,open)=>{
          if(!open&&sideRouteAt(this.home.player.x,this.home.player.y))throw new Error('Return to the main river before closing routes.');
          this.traversal.setPassageOpen(area,open);
        },
        spawn:(species,count)=>this.dynamicWorld.spawnNearby(species,count,this.home.player),
      },open=>{
        this.input.keyboard?.resetKeys();
        this.home.setMovementEnabled(!open);this.input.enabled=!open;
        if(open)this.physics.world.pause();else this.physics.world.resume();
      },()=>!this.fishing.active&&!this.sleep.active&&!this.map.isOpen&&!this.audioPanel.isOpen&&!this.harborPanel.isOpen&&!this.tools.isEditing&&!this.requestBoard.isOpen&&!this.forecastBoard.isOpen);
      this.events.once('shutdown',()=>{this.devConsole?.destroy();this.devConsole=undefined;});
    });
  }

  private resize(size: { width: number; height: number }) {
    this.cameras.main.setZoom(Math.max(1, Math.floor(Math.min(size.width / 440, size.height / 300))));
    this.preparationLabel?.setWordWrapWidth(Math.min(300,size.width/this.cameras.main.zoom-32)).setAlign('center');
  }

  private refreshAreaEvents(){
    if(eventDay?.day!==this.environment.day){setEventDay(generateEvents(this.environment.day,(Math.random()*0xffffffff)>>>0,eventDay),this.environment.snapshot().elapsed);this.store.write({...this.store.load(),areaEvents:eventDay},this.environment.snapshot());}
    else setEventDay(eventDay,this.environment.snapshot().elapsed);
  }
  private refreshRiverDay(){
    if(riverDay?.day===this.environment.day)return;
    // A natural midnight never closes a passage around an exploring player.
    if(this.home&&sideRouteAt(this.home.player.x,this.home.player.y))return;
    setRiverDay(generateRiverDay(this.environment.day,(Math.random()*0xffffffff)>>>0,this.environment.conditions.weather,riverDay));
    this.store.write({...this.store.load(),riverDay},this.environment.snapshot());
    this.traversal?.refresh();
  }
  private saveRequests(){return this.store.write({...this.store.load(),money:this.wallet.balance,daily:this.daily.state},this.environment.snapshot());}
  private refreshRequests(){
    if(this.market.newDay(this.environment.day,this.cargo.records))this.store.write({...this.store.load(),market:this.market.state},this.environment.snapshot());
    const saved=this.store.loadMap() as {landmarks?:string[]}|undefined;
    const known=this.map?.discovery.landmarks ?? new Set(Array.isArray(saved?.landmarks)?saved.landmarks:[]);
    if(this.daily.newDay(this.environment.day,this.cargo.records,this.environment.conditions,known))this.saveRequests();
  }
  update(time: number, delta: number) {
    if(this.goals){this.goals.update();const region=areaAt(this.home.player.y,this.home.player.x);if(region!==this.goalsRegion){this.goalsRegion=region;this.goals.event('visit',region);}this.goalsView.update(!this.remoteNpcs.dialogue.isOpen&&!this.devConsole?.isOpen&&!this.map.isOpen&&!this.harborPanel.isOpen&&!this.audioPanel.isOpen&&!this.fishing.active&&!this.tools.isEditing&&!this.requestBoard.isOpen&&!this.forecastBoard.isOpen&&!this.sleep.active);}
    if(this.goalsView?.isOpen){this.home.setMovementEnabled(false);return;}
    if(this.remoteNpcs?.dialogue.isOpen){this.coreView.update(0,this.home.player,this.home.walking,false);this.remoteNpcs.dialogue.update();return;}
    if(this.devConsole?.isOpen){
      this.environmentView.update(Math.min(delta,50)/1000);
      this.exploration.update(time,this.home.player);
      this.weatherView.update(delta,this.home.player,!!this.equipment.gear.lanternLit);
      return;
    }
    this.coreView.update(delta,this.home.player,this.home.walking,!this.map.isOpen&&!this.harborPanel.isOpen&&!this.audioPanel.isOpen&&!this.fishing.active&&!this.remoteNpcs.dialogue.isOpen);
    this.refreshAreaEvents();
    this.refreshRiverDay();
    this.riverConditions.update(time);
    this.exploration.update(time,this.home.player);
    this.weatherView.update(delta,this.home.player,!!this.equipment.levels.lantern&&!!this.equipment.gear.lanternLit);
    this.fishing.weatherClarity=1-(this.environmentView.storm*.55+this.environmentView.rain*.3)*(1-this.environmentView.cave);
    this.tools.update(delta);
    if(this.tools.isEditing){this.home.setMovementEnabled(false);return;}
    this.audio.update(time, this.kayak.body!.velocity.length(), delta);
    if (this.sleep.active) {
      const skip = this.interactionKeys.map(key => Phaser.Input.Keyboard.JustDown(key)).some(Boolean);
      this.environmentView.update(Math.min(delta, 50) / 1000);
      this.home.update(delta, false, this.environmentView.night,this.environment.conditions);
      this.sleep.update(delta, skip);
      this.ambience.update(time, delta, this.home.player);
      return;
    }
    const mapWasOpen=this.map.isOpen;
    if(this.map.update(delta)||mapWasOpen)return;
    const audioWasOpen = this.audioPanel.isOpen;
    this.audioPanel.update();
    if (audioWasOpen || this.audioPanel.isOpen) return;
    const environmentDelta = Math.min(delta, 50) / 1000;
    if (!this.fixedActivity) this.environment.update(environmentDelta);
    this.cargo.age(this.environment.totalSeconds,!!this.equipment.value('insulated'));
    this.refreshRequests();
    this.dynamicWorld.conditions = this.environment.conditions;
    this.dynamicWorld.bait = this.equipment.baitLevel;
    this.environmentView.update(environmentDelta);
    this.environmentSaveTimer += environmentDelta;
    if (this.environmentSaveTimer >= ENVIRONMENT.saveInterval) {
      this.environmentSaveTimer = 0;
      this.equipment.save(this.environment.snapshot());
    }
    // One consumed input edge is routed to one interaction. Holding either key
    // cannot double-sell or automatically catch a fish.
    const homeDistance = Math.hypot(this.kayak.x - HOME.dockX, this.kayak.y - HOME.dockY);
    if (!this.fixedActivity) {
      const view = this.cameras.main.worldView;
      if (homeDistance < DYNAMIC.tripHomeRadius && this.previousHomeDistance >= DYNAMIC.tripHomeRadius) this.tripArmed = true;
      this.previousHomeDistance = homeDistance;
      if (!this.home.walking && this.tripArmed && homeDistance > DYNAMIC.tripLeaveRadius && !this.fishing.active) {
        this.tripArmed = false;
        this.trips.start(this.environment.totalSeconds);
        this.store.write({...this.store.load(),trips:this.trips.state},this.environment.snapshot());
        this.dynamicWorld.newTrip((Math.random() * 0xffffffff) >>> 0, this.home.player, view);
      }
      this.dynamicWorld.update(delta, this.home.player, view, this.fishing.protectedSpot, this.home.walking?0:this.kayak.body!.velocity.length());
    } else this.dynamicWorld.update(delta, this.home.player, this.cameras.main.worldView);
    const pressed = this.interactionKeys.map(key => Phaser.Input.Keyboard.JustDown(key)).some(Boolean);
    if(this.remoteNpcs.update(delta,pressed,this.home.walking&&!this.fishing.active&&!this.harborPanel.isOpen&&!this.requestBoard.isOpen&&!this.forecastBoard.isOpen))return;
    if(this.forecastBoard.update(pressed,!this.fishing.active&&!this.harborPanel.isOpen&&!this.requestBoard.isOpen&&!this.forecastBoard?.isOpen))return;
    if(this.requestBoard.update(pressed,!this.fishing.active&&!this.harborPanel.isOpen))return;
    const wasOpen = this.harborPanel.isOpen;
    this.harborPanel.update(delta, pressed);
    const available = !this.fishing.active && !wasOpen && !this.harborPanel.isOpen;
    this.home.setMovementEnabled(available);
    const interaction = this.home.update(delta, available, this.environmentView.night,this.environment.conditions);
    this.sleep.updateHint(available);
    if (available && pressed && this.sleep.begin()) return;
    const dockConsumed = available && pressed && this.home.interactDock();
    if (available && !dockConsumed && interaction && pressed) this.harborPanel.open(interaction);
    const blocked = wasOpen || this.harborPanel.isOpen;
    this.fishing.showIdleHint=!this.home.walking&&!interaction&&!blocked&&!this.home.canLand;
    this.fishing.update(delta, pressed && !dockConsumed && !interaction && !blocked && !this.home.walking, !blocked && !this.home.walking && this.interactionKeys.some(key => key.isDown));
    this.home.setMovementEnabled(!this.fishing.active && !this.harborPanel.isOpen);

    this.traversal.update(this.home.walking);
    this.navigation.update(time,delta);
    this.kayak.update(time, delta);
    this.ambience.update(time, delta, this.home.player);
    const area = areaAt(this.kayak.y,this.kayak.x);
    const currentEvent=eventName(this.kayak.x,this.kayak.y);
    const destination=(locationAt(this.kayak.x,this.kayak.y)?.id??area)+currentEvent;
    this.preparationLabel.setPosition(this.home.player.x,this.home.player.y-69);
    if(destination!==this.preparationPlace){
      this.preparationPlace=destination;
      this.tweens.killTweensOf(this.preparationLabel);
      this.preparationLabel.setText(currentEvent||preparationHint(this.kayak.x,this.kayak.y,this.equipment.gear.rod,this.equipment.levels,this.equipment.loadout)).setAlpha(0);
      this.tweens.add({targets:this.preparationLabel,alpha:.9,duration:700,hold:2800,yoyo:true});
    }
    this.areaLabel.setPosition(this.home.player.x, this.home.player.y - 90);
    if (area !== this.currentArea) {
      this.currentArea = area;
      this.tweens.killTweensOf(this.areaLabel);
      // First entry is announced and persisted by River Chart discovery.
      this.areaLabel.setAlpha(0);
    }
    this.flow.clear();
    for(const route of SIDE_ROUTES)if(route.flow){
      const lo=route.points[0][1],length=route.points.at(-1)![1]-lo;
      for(let i=0;i<8;i++){
        const y=lo+(i*length/8+time/1000*route.flow*.5)%length,span=routeSpan(route,y);if(!span)continue;
        const x=(span[0]+span[1])/2;if(routeFlow(x,y)<10)continue;
        this.flow.fillStyle(0x8bbbc3,.25).fillRect(Math.round(x),Math.round(y),1,5);
        this.flow.fillRect(Math.round(x+3),Math.round(y-3),1,2);
      }
    }
    for (const section of CURRENTS) for (let i = 0; i < 9; i++) {
      const y = section.y + (i * 29 + time / 1000 * section.speed) % section.length;
      const [l, r] = banks(y), x = Math.round(l + 35 + ((i * 73) % Math.max(1, r - l - 70)));
      this.flow.fillStyle(0x8bbbc3, .23 * Math.sin((y - section.y) / section.length * Math.PI));
      this.flow.fillRect(x, Math.round(y), 1, 5); this.flow.fillRect(x + 2, Math.round(y - 3), 1, 2);
    }
    const cargoLabel = document.getElementById('cargo');
    const moneyLabel = document.getElementById('money');
    const cargoText = `Fish: ${this.cargo.count} / ${this.cargo.capacity}`;
    const haul=document.getElementById('haul');
    hudPixelText(haul,`Haul: $${this.cargo.totalValue}`,2,'#c0dce0');
    if(cargoLabel)cargoLabel.style.color=this.cargo.full?'#efb779':this.cargo.count>=this.cargo.capacity-1?'#f3d49a':'';
    const moneyText = `$${this.wallet.balance}`;
    hudPixelText(cargoLabel,cargoText,2,this.cargo.count>=this.cargo.capacity-1?'#f3d49a':'#edf7f4');
    hudPixelText(moneyLabel,moneyText,2,'#f3d49a');
    const dt = Math.min(delta, 50) / 1000;
    const follow = 1 - Math.exp(-MOVEMENT.cameraResponsiveness * dt);
    this.cameras.main.setLerp(follow, follow);
    const velocity = this.kayak.body!.velocity;
    const speed = velocity.length();

    this.wakeTimer += dt;
    if (speed > WAKE.minSpeed && this.wakeTimer > WAKE.interval/(1+this.kayak.flowMomentum/100)) {
      const dx = Math.sin(this.kayak.rotation);
      const dy = -Math.cos(this.kayak.rotation);
      this.ripples.push({
        x: this.kayak.x - dx * WAKE.sternOffset,
        y: this.kayak.y - dy * WAKE.sternOffset,
        nx: -dy, ny: dx, strength: Math.min(1, speed / MOVEMENT.maxSpeed + Math.hypot(this.kayak.waterFlow?.x??0,this.kayak.waterFlow?.y??0)/220), age: 0,
      });
      this.wakeTimer = 0;
    }
    this.wake.clear();
    this.ripples = this.ripples.filter(r => r.age < WAKE.lifetime);
    for (const ripple of this.ripples) {
      ripple.age += dt;
      const life = Math.min(1, ripple.age / WAKE.lifetime);
      const spread = 3 + life * WAKE.spread;
      this.wake.fillStyle(0x8bbbc3, (1 - life) * WAKE.intensity * ripple.strength);
      // Two tiny, pixel-aligned flecks spread behind the stern; no full rings.
      for (const side of [-1, 1]) {
        this.wake.fillRect(Math.round(ripple.x + ripple.nx * spread * side), Math.round(ripple.y + ripple.ny * spread * side), this.kayak.flowMomentum>25?3:2, 1);
      }
    }
  }
}
