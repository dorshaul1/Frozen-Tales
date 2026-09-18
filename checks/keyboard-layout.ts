import Phaser from 'phaser';
import {installPhysicalKeyboard,physicalKeyCode,slotNumber,gameplayCode} from '../src/game/input/physicalKeyboard';
const out=document.querySelector('#result')!;out.textContent='';
const check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
const wait=()=>new Promise(r=>setTimeout(r,30));
class Test extends Phaser.Scene{
 async create(){
 installPhysicalKeyboard(this);const keyboard=this.input.keyboard!;
 const send=(type:string,code:string,key:string,target:EventTarget=window)=>{const event=new KeyboardEvent(type,{code,key,keyCode:0,bubbles:true,cancelable:true});target.dispatchEvent(event);return event;};
 for(const [code,english,hebrew] of [['KeyM','m','צ'],['KeyE','e','ק'],['KeyW','w',"'"],['KeyA','a','ש'],['KeyS','s','ד'],['KeyD','d','ג'],['KeyI','i','ן'],['KeyO','o','ם'],['Slash','/','.'],['Digit1','1','!'],['Digit2','2','@'],['Digit3','3','#'],['Digit4','4','$'],['Digit5','5','%'],['ShiftLeft','Shift','Shift'],['ShiftRight','Shift','Shift'],['Space',' ',' '],['Escape','Escape','Escape']]){
 const binding=keyboard.addKey(physicalKeyCode(code));
 for(const key of [english,hebrew]){send('keydown',code,key);await wait();check(binding.isDown,`${code} responds to ${JSON.stringify(key)}`);send('keyup',code,key);await wait();check(!binding.isDown,`${code} releases`);}
 }
 const shift=keyboard.addKey('SHIFT');send('keydown','ShiftLeft','Shift');send('keydown','ShiftRight','Shift');await wait();send('keyup','ShiftLeft','Shift');await wait();check(shift.isDown,'Both Shift keys combine without premature release');send('keyup','ShiftRight','Shift');await wait();check(!shift.isDown,'Final Shift release clears action');
 const input=document.querySelector('#text') as HTMLInputElement;input.focus();const typed=send('keydown','KeyM','צ',input);await wait();check(!keyboard.addKey('M').isDown&&!typed.defaultPrevented&&gameplayCode(typed)==='','Editable Hebrew typing is not consumed by gameplay');input.blur();
 check(slotNumber(new KeyboardEvent('keydown',{code:'Digit2',key:'@'}))===2,'Slot selection follows physical digit, not character');check(slotNumber(new KeyboardEvent('keydown',{code:'KeyM',key:'2'}))===0,'Printed numbers do not impersonate number-row shortcuts');
 out.textContent+='ALL CHECKS PASSED — English and Hebrew event variants\n';
 }
}
new Phaser.Game({type:Phaser.CANVAS,width:16,height:16,parent:'test',scene:[Test],audio:{noAudio:true}});
