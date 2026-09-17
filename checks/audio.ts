import Phaser from 'phaser';
import { RiverScene } from '../src/game/scenes/RiverScene';
import { SaveStore } from '../src/game/player/SaveStore';
import { Kayak } from '../src/game/entities/Kayak';
import { CHANNELS } from '../src/game/audio/settings';
const saveKey='arctic-drift.check-audio';const refreshExpected=sessionStorage.getItem(saveKey);if(!refreshExpected)localStorage.removeItem(saveKey);
const scene=new RiverScene(saveKey,true);
new Phaser.Game({type:Phaser.AUTO,parent:'test',width:location.search.includes('small')?420:900,height:560,pixelArt:true,physics:{default:'arcade'},scene:[scene]});
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const results:string[]=[];const check=(ok:boolean,s:string)=>{results.push((ok?'PASS ':'FAIL ')+s);document.querySelector('#result')!.textContent=results.join('\n');if(!ok)throw Error(s);};
const tap=async(code:number)=>{window.dispatchEvent(new KeyboardEvent('keydown',{keyCode:code,which:code,bubbles:true}));await wait(80);window.dispatchEvent(new KeyboardEvent('keyup',{keyCode:code,which:code,bubbles:true}));await wait(100);};
setTimeout(()=>{
 const music=scene.sound.get('background-loop') as Phaser.Sound.WebAudioSound;
 check(!!music&&music.duration>50&&music.duration<57,'Attached stereo track decoded and loop prepared');
 check(!music.isPlaying,'No music starts before a trusted gesture');
 if(refreshExpected){const settings=scene.audio.settings;check(JSON.stringify(settings)===refreshExpected,'Full browser refresh restores audio sliders and mutes');sessionStorage.removeItem(saveKey);scene.audioPanel.open();}
 const raw=scene.cache.audio.get('background-source') as AudioBuffer,loop=scene.cache.audio.get('background-loop') as AudioBuffer;
 const data=loop.getChannelData(0);const jump=Math.abs(data[0]-data[data.length-1]);
 const rms=(from:number,to:number)=>Math.sqrt(data.slice(from,to).reduce((sum,v)=>sum+v*v,0)/(to-from));
 check(raw.numberOfChannels===2&&loop.numberOfChannels===2,'Track retains stereo');
 check(jump<.03&&rms(0,4800)>.0005&&rms(data.length-4800,data.length)>.0005,`Loop seam has no silence or abrupt sample jump (${jump.toFixed(5)})`);
},1800);
document.querySelector('#start')!.addEventListener('click',async()=>{
 try{
  await wait(300);const audio=scene.audio,music=scene.sound.get('background-loop') as Phaser.Sound.WebAudioSound;
  check(music.isPlaying&&audio.manager.context.state==='running','Trusted gesture starts Phaser music');
  let loops=0,plays=0;music.on('looped',()=>loops++);music.on('play',()=>plays++);
  music.setSeek(music.duration-.35);await wait(1000);check(loops>=1&&music.isPlaying,'Phaser crosses the music loop boundary without stopping');
  scene.audioPanel.open();const before=music.seek;await wait(350);
  check(scene.audioPanel.isOpen&&music.seek>before,'Settings leave music advancing');
  const kayak=scene.children.list.find(c=>c instanceof Kayak) as Kayak,x=kayak.x;await tap(68);check(Math.abs(kayak.x-x)<.1,'Settings block gameplay movement');
  audio.setVolume('master',.8);audio.setVolume('music',.3);audio.setVolume('ambience',.2);audio.setVolume('sfx',.4);await wait(300);
  check(Math.abs(audio.volume('music')-.24)<.001&&Math.abs(audio.volume('ambience')-.16)<.001&&Math.abs(audio.volume('sfx')-.32)<.001,'Channels use independent gains under master');
  for(const id of CHANNELS){audio.setMute(id,true);check(audio.volume(id)===0,`${id} mute silences its channel`);audio.setMute(id,false);}
  await tap(40);await tap(39);await tap(69);check(audio.settings.music.muted,'Keyboard selects a slider and toggles its mute');await tap(69);
  audio.play('cast');audio.play('bite');audio.play('catch');audio.play('sale');audio.play('upgrade');for(let i=0;i<20;i++)audio.play('warning');
  check(scene.sound.getAllPlaying().filter(s=>s.key.startsWith('cue-')).length<=6,'Rapid SFX events respect voice and cooldown limits');
  await tap(27);check(!scene.audioPanel.isOpen,'Escape closes settings');const origin=kayak.x;await tap(68);check(kayak.x>origin,'Movement restores after settings');
  const body=kayak.body as Phaser.Physics.Arcade.Body;body.reset(520,1338);await wait(400);scene.harborPanel.open('gear');await wait(300);scene.harborPanel.close();
  check(plays===0&&music.isPlaying,'Settings and NPC menus never restart the music');
  await wait(300);const settings=new SaveStore(saveKey).loadAudio();check(CHANNELS.every(id=>settings[id].volume===audio.settings[id].volume&&settings[id].muted===audio.settings[id].muted),'Settings round-trip through the existing save store');
  scene.wallet.credit(17);scene.equipment.save();check(new SaveStore(saveKey).loadAudio().music.volume===settings.music.volume,'Gameplay saves preserve audio settings');
  check(new SaveStore(saveKey).load().money===17,'Audio settings preserve gameplay money');
  audio.setMute('ambience',true);await wait(300);sessionStorage.setItem(saveKey,JSON.stringify(audio.settings));check(true,'Refreshing to verify persisted audio…');location.reload();
 }catch(e){results.push(String(e));document.querySelector('#result')!.textContent=results.join('\n');}
});
