import Phaser from 'phaser';
import { SaveStore } from '../player/SaveStore';
import { type Channel, type AudioSettings } from './settings';
export type Cue = 'raven-call' | 'herd-snort' | 'corgi-bark' | 'cave-drip' | 'ice-break' | 'ice-drift' | 'hull-splash' | 'current' | 'wings' | 'wild-splash' | 'wild-call' | 'paddle' | 'cast' | 'bite' | 'warning' | 'catch' | 'snap' | 'escape' | 'step' | 'bird' | 'ice' | 'sale' | 'upgrade' | 'ui-open' | 'ui-close' | 'npc' | 'sleep' | 'rare-near' | 'legendary-near' | 'rare-catch' | 'legendary-catch';
export const AMBIENCE_LAYERS = { river: { wind: 0, water: 0 } };
const CUES: Record<Cue, [number, number, number, boolean, number]> = {
 'corgi-bark':[420,180,.12,true,25],
  'cave-drip':[1350,650,.18,false,5],
  'ice-drift':[210,80,.17,false,12],
  'hull-splash':[320,120,.15,true,1],current:[190,100,.35,true,8],
  'ice-break':[700,90,.3,true,1],
  'raven-call':[260,180,.22,true,25], 'herd-snort':[130,85,.25,true,35],
  wings:[480,160,.14,true,3], 'wild-splash':[400,100,.2,true,4], 'wild-call':[1100,1400,.16,false,12],
  'rare-near':[740,860,.34,false,14], 'legendary-near':[330,660,.65,false,22],
  'rare-catch':[660,990,.4,false,1], 'legendary-catch':[440,1320,.8,false,2],
  sleep:[440,220,.5,false,1],
  paddle:[360,160,.16,true,.7], cast:[900,280,.18,true,.25], bite:[520,170,.13,true,.4], warning:[430,390,.14,false,1.8],
  catch:[540,810,.23,false,.3], snap:[1100,140,.08,true,.4], escape:[330,180,.22,false,.4], step:[850,430,.075,true,.3],
  bird:[1500,2050,.16,false,2], ice:[170,70,.3,false,3], sale:[680,1020,.2,false,.3], upgrade:[660,1320,.32,false,.3],
  'ui-open':[340,430,.09,false,.18], 'ui-close':[430,300,.08,false,.18], npc:[560,630,.10,false,.4],
};
// Remove encoder silence and crossfade tail into head, then let Phaser schedule
// the prepared buffer sample-accurately. No timer-based music restarts.
export function seamlessLoop(context: BaseAudioContext, source: AudioBuffer, overlapSeconds = .9) {
  let start=0,end=source.length;
  const audible=(i:number)=>{for(let c=0;c<source.numberOfChannels;c++)if(Math.abs(source.getChannelData(c)[i])>.001)return true;return false;};
  while(start<end-1&&!audible(start))start++;
  while(end>start+1&&!audible(end-1))end--;
  const overlap=Math.min(Math.floor(source.sampleRate*overlapSeconds),Math.floor((end-start)/4));
  const length=end-start-overlap;
  const output=context.createBuffer(source.numberOfChannels,length,source.sampleRate);
  for(let c=0;c<source.numberOfChannels;c++){
    const input=source.getChannelData(c),data=output.getChannelData(c);
    data.set(input.subarray(start+overlap,end));
    for(let i=0;i<overlap;i++){
      const t=i/Math.max(1,overlap-1);
      data[length-overlap+i]=input[end-overlap+i]*(1-t)+input[start+i]*t;
    }
  }
  return output;
}
export class AudioManager {
  readonly settings: AudioSettings;
  readonly manager: Phaser.Sound.WebAudioSoundManager;
  private music?: Phaser.Sound.WebAudioSound;
  private weatherMix=[0,0];
  setWeatherMix(wind:number,rain:number){this.weatherMix=[wind,rain];}
  private beds: Phaser.Sound.WebAudioSound[]=[];
  private effects = new Map<Cue, Phaser.Sound.WebAudioSound>();
  private strengths = new Map<Cue, number>();
  private last = new Map<Cue,number>();
  private bindings: [string, (...args:any[])=>void][]=[];
  private started=false;
  private starting=false;
  private disposed=false;
  private fade=0;
  private duck=1;
  setSleepMix(amount:number) { this.duck=1-.45*Math.max(0,Math.min(1,amount)); this.apply(); }
  private layer: keyof typeof AMBIENCE_LAYERS = 'river';
  setAmbience(layer: keyof typeof AMBIENCE_LAYERS) { this.layer=layer; this.apply(); }
  private saveTimer?: ReturnType<typeof setTimeout>;
  private gesture=(event:Event)=>{if(event.isTrusted && (!(event instanceof KeyboardEvent)||!event.repeat))void this.start();};
  private flush=()=>{if(this.saveTimer)clearTimeout(this.saveTimer);this.saveTimer=undefined;this.store.writeAudio(this.settings);};
  static preload(scene: Phaser.Scene) { scene.load.audio('background-source',new URL('../../../assets/audio/background.mp3',import.meta.url).href); }
  constructor(private scene:Phaser.Scene,private store:SaveStore){
    this.settings=store.loadAudio();this.manager=scene.sound as Phaser.Sound.WebAudioSoundManager;
    this.manager.pauseOnBlur=false;
    if(this.manager.context){
      const context=this.manager.context,raw=scene.cache.audio.get('background-source') as AudioBuffer | undefined;
      if(raw){scene.cache.audio.add('background-loop',seamlessLoop(context,raw));this.music=this.manager.add('background-loop',{loop:true,volume:0}) as Phaser.Sound.WebAudioSound;}
      let seed=9173;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};
      for(let layer=0;layer<2;layer++){
        const buffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=buffer.getChannelData(0);let low=0,drop=0;
        for(let i=0;i<data.length;i++){const t=i/data.length;low+=.008*(random()-low);if(layer&&random()>.997)drop=.12;drop*=.94;
          const envelope=layer?.7+.3*Math.sin(Math.PI*t)**2:Math.sin(Math.PI*t)**2;data[i]=(layer?low*.7+drop:low*2*(.55+.45*Math.sin(t*Math.PI*4)**2))*envelope;
        }
        const key=`weather-bed-${layer}`;scene.cache.audio.add(key,seamlessLoop(context,buffer,.35));this.beds.push(this.manager.add(key,{loop:true,volume:0}) as Phaser.Sound.WebAudioSound);
      }
      for(const[id,[from,to,duration,noisy]]of Object.entries(CUES) as [Cue,typeof CUES[Cue]][]){
        const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);let phase=0,noise=0;
        for(let i=0;i<data.length;i++){const t=i/data.length;phase+=2*Math.PI*(from+(to-from)*t)/context.sampleRate;noise+=.16*(random()-noise);const envelope=Math.min(1,t*duration/.008)*Math.exp(-5*t)*(1-t);data[i]=(noisy?noise:Math.sin(phase))*.4*envelope;}
        scene.cache.audio.add(`cue-${id}`,buffer);this.effects.set(id,this.manager.add(`cue-${id}`) as Phaser.Sound.WebAudioSound);
      }

    }
    const listen=(name:string,fn:(...args:any[])=>void)=>{scene.events.on(name,fn);this.bindings.push([name,fn]);};
    listen('river-cue',(id:Cue,volume=1)=>this.play(id,volume));listen('cargo-sold',()=>this.play('sale'));listen('upgrade-purchased',()=>this.play('upgrade'));
    window.addEventListener('pointerdown',this.gesture);window.addEventListener('keydown',this.gesture,true);window.addEventListener('pagehide',this.flush);
    scene.events.once('shutdown',()=>this.destroy());
  }
  private async start(){
    if(this.disposed||this.starting||this.started||!this.manager.context)return;
    this.starting=true;
    try{await this.manager.context.resume();if(this.disposed||this.manager.context.state!=='running')return;
      this.music?.play();this.beds.forEach(s=>s.play());this.started=true;
    }catch{/* A later trusted gesture can retry if the browser refuses. */}finally{this.starting=false;}
  }
  volume(channel:Channel){const m=this.settings.master,c=this.settings[channel];return m.muted||c.muted?0:m.volume*(channel==='master'?1:c.volume);}
  setVolume(channel:Channel,value:number){this.settings[channel].volume=Math.max(0,Math.min(1,value));this.changed();}
  setMute(channel:Channel,muted:boolean){this.settings[channel].muted=muted;this.changed();}
  private changed(){this.apply();if(this.saveTimer)clearTimeout(this.saveTimer);this.saveTimer=setTimeout(this.flush,180);}
  private gain(sound: Phaser.Sound.WebAudioSound, target: number) {
    if (Math.abs(sound.volume-target)<.00001) return;
    const gain=sound.volumeNode.gain, now=this.manager.context.currentTime, current=gain.value;
    sound.setVolume(target);gain.cancelScheduledValues(now);gain.setValueAtTime(current,now);gain.linearRampToValueAtTime(target,now+.06);
  }
  private apply(){
    if(this.music)this.gain(this.music,this.volume('music')*this.fade*this.duck);
    this.beds.forEach((s,i)=>this.gain(s,this.volume('sfx')*this.weatherMix[i]*.18*this.fade*this.duck));
    for(const[id,s]of this.effects)this.gain(s,this.volume(id==='bird'||id==='ice'?'ambience':'sfx')*(this.strengths.get(id)??1));
  }
  update(_time:number,speed:number,delta=16.67){
    if(!this.started)return;
    this.fade+=(1-this.fade)*(1-Math.exp(-Math.min(delta,50)/1000/1.2));this.apply();
    if(speed>35)this.play('paddle',.25);
  }
  play(id:Cue,strength=1){
    const sound=this.effects.get(id);if(!sound||!this.started||this.manager.context.state!=='running')return;
    const channel=id==='bird'||id==='ice'?'ambience':'sfx';if(!this.volume(channel))return;
    const now=this.manager.context.currentTime;
    if(now-(this.last.get(id)??-Infinity)<CUES[id][4]||sound.isPlaying||[...this.effects.values()].filter(s=>s.isPlaying).length>=6)return;
    this.last.set(id,now);this.strengths.set(id,Math.max(0,Math.min(1,strength)));sound.play({volume:this.volume(channel)*Math.max(0,Math.min(1,strength))});
  }
  private destroy(){this.disposed=true;this.flush();window.removeEventListener('pointerdown',this.gesture);window.removeEventListener('keydown',this.gesture,true);window.removeEventListener('pagehide',this.flush);this.bindings.forEach(([id,fn])=>this.scene.events.off(id,fn));this.music?.destroy();this.beds.forEach(s=>s.destroy());this.effects.forEach(s=>s.destroy());}
}
