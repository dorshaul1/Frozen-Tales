import type Phaser from 'phaser';

/** Text retains native layout; only game bindings use physical positions. */
export function editableTarget(target:EventTarget|null){return target instanceof HTMLElement&&(target.isContentEditable||!!target.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]'));}
export function gameplayCode(event:KeyboardEvent){return event.isComposing||event.ctrlKey||event.metaKey||event.altKey||editableTarget(event.target)||editableTarget(document.activeElement)?'':event.code;}
export function slotNumber(event:KeyboardEvent){const match=/^(?:Digit|Numpad)([1-5])$/.exec(gameplayCode(event));return match?Number(match[1]):0;}
const codes:Record<string,number>={Escape:27,Space:32,Enter:13,NumpadEnter:13,Tab:9,Backspace:8,ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,ShiftLeft:16,ShiftRight:16,Slash:191};
for(let i=0;i<26;i++)codes[`Key${String.fromCharCode(65+i)}`]=65+i;
for(let i=0;i<=9;i++){codes[`Digit${i}`]=48+i;codes[`Numpad${i}`]=48+i;}
export const physicalKeyCode=(code:string)=>codes[code];
const installed=new WeakSet<object>();
/** Adapt Phaser's legacy numeric binding API once, at its DOM boundary.
 * Scenes keep Key/isDown/JustDown and keydown-I APIs, now backed exclusively by code.
 * Never redispatch DOM events or alter the original text-input event.
 */
export function installPhysicalKeyboard(scene:Phaser.Scene){
 const manager=scene.input.keyboard?.manager;if(!manager||installed.has(manager))return;installed.add(manager);
 const down=manager.onKeyDown,up=manager.onKeyUp,target=manager.target;
 manager.stopListeners();
 const held=new Set<string>();
 const clear=()=>{held.clear();for(const s of scene.game.scene.getScenes(false))s.input.keyboard?.resetKeys();};
 const route=(event:KeyboardEvent,pressed:boolean)=>{
  const number=physicalKeyCode(event.code);if(number===undefined)return;
  if(!pressed){held.delete(event.code);if([...held].some(code=>physicalKeyCode(code)===number))return;}
  if(!gameplayCode(event)){clear();return;}
  if(event.defaultPrevented)return;
  if(pressed)held.add(event.code);
  const normalized=new KeyboardEvent(event.type,{code:event.code,key:event.key,keyCode:number,which:number,repeat:event.repeat,shiftKey:event.shiftKey,cancelable:true});
  (pressed?down:up).call(manager,normalized);
  if(normalized.defaultPrevented)event.preventDefault();
 };
 manager.onKeyDown=(event:KeyboardEvent)=>route(event,true);
 manager.onKeyUp=(event:KeyboardEvent)=>route(event,false);
 target.addEventListener('keydown',manager.onKeyDown as EventListener);
 target.addEventListener('keyup',manager.onKeyUp as EventListener);manager.enabled=true;
 const focus=(e:FocusEvent)=>{if(editableTarget(e.target))clear();};
 window.addEventListener('blur',clear);document.addEventListener('focusin',focus);
 scene.game.events.once('destroy',()=>{window.removeEventListener('blur',clear);document.removeEventListener('focusin',focus);});
}
