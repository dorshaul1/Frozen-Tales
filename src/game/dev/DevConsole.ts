import {hudPixelText} from '../ui/PixelText';
import {createRegistry,slug,type Context} from './commands';
import {History} from './registry';
import {MAP_MARKERS} from '../map/discovery';
import {validWater} from '../world/DynamicWorld';
import {sideRouteAt} from '../world/sideRoutes';
import {ICE_PASSAGES} from '../world/traversalData';
export function destination(name:string,opened:readonly string[]){
 const marker=MAP_MARKERS.find(m=>m.id===name||slug(m.name)===name)!;
 const route=sideRouteAt(marker.x,marker.y),gate=ICE_PASSAGES.find(p=>p.route===route?.id);
 if(gate&&!opened.includes(gate.id))throw new Error(`Open ${gate.route} with /unlock-area first.`);
 for(let radius=0;radius<=180;radius+=12)for(let i=0;i<(radius?32:1);i++){
  const p={x:Math.round(marker.x+Math.cos(i*Math.PI/16)*radius),y:Math.round(marker.y+Math.sin(i*Math.PI/16)*radius)};
  const candidateRoute=sideRouteAt(p.x,p.y),candidateGate=ICE_PASSAGES.find(g=>g.route===candidateRoute?.id);
  if(candidateGate&&!opened.includes(candidateGate.id))continue;
  if(validWater(p,24,false))return p;
 }
 throw new Error('No safe water near this location. Choose its dock or a river area.');
}
const sessionHistory=new History();
export class DevConsole {
 readonly registry;readonly history=sessionHistory;isOpen=false;
 private root=document.createElement('div');private input=document.createElement('input');private output=document.createElement('div');private matches=document.createElement('div');private prior:Element|null=null;
 private tabOptions:string[]=[];private tabIndex=0;private lastCompletion='';
 constructor(context:Context,private lock:(open:boolean)=>void,private available:()=>boolean){
  if(!import.meta.env.DEV)throw new Error('Development only');
  this.registry=createRegistry(context);
  this.root.id='dev-console';this.root.hidden=true;this.root.style.cssText='position:fixed;inset:0;z-index:99999;background:transparent;display:none;align-items:flex-end;padding:8px;box-sizing:border-box;';
  const panel=document.createElement('section');panel.setAttribute('aria-label','Developer command console');panel.style.cssText='box-sizing:border-box;width:min(760px,100%);margin:0 auto;border:2px solid #b3c9c6;box-shadow:0 0 0 2px #162e3b;background:#19333ff5;color:#edf3de;padding:8px;font:14px/20px monospace;';
  const title=document.createElement('div');hudPixelText(title,'DEV CONSOLE',2,'#e9ca8c');
  const keys=document.createElement('div');keys.textContent='Enter execute · Tab complete · Esc close';keys.style.fontSize='12px';title.style.cssText='color:#e9ca8c;font-size:12px;';
  this.output.setAttribute('role','log');this.output.setAttribute('aria-live','polite');this.output.style.cssText='max-height:28vh;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;margin:4px 0;';
  this.matches.style.cssText='max-height:70px;overflow:auto;color:#b3c9c6;font-size:12px;overflow-wrap:anywhere;';
  this.input.setAttribute('aria-label','Command');this.input.autocomplete='off';this.input.spellcheck=false;this.input.style.cssText='box-sizing:border-box;width:100%;border:0;border-top:1px solid #6b8b95;border-radius:0;padding:6px 2px;background:#122a36;color:#fff3ce;font:16px monospace;outline:none;';
  panel.append(title,keys,this.output,this.matches,this.input);this.root.append(panel);document.body.append(this.root);
  this.root.addEventListener('pointerdown',e=>{if(e.target===this.root){e.preventDefault();this.input.focus();}});
  this.input.addEventListener('input',()=>{this.tabOptions=[];this.suggest();});
  window.addEventListener('keydown',this.key,true);window.addEventListener('keyup',this.keyup,true);
 }
 private suggest(){const matches=this.registry.suggestions(this.input.value);this.matches.textContent=matches.slice(0,6).join('  ·  ')+(matches.length>6?`  (+${matches.length-6})`:'');}
 private keyup=(e:KeyboardEvent)=>{if(this.isOpen){e.stopImmediatePropagation();e.preventDefault();}};
 private key=(e:KeyboardEvent)=>{
  if(!this.isOpen){if((e.key==='/'||e.code==='Slash'&&!e.shiftKey)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat&&!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&this.available()){e.preventDefault();e.stopImmediatePropagation();this.open();}return;}
  e.stopImmediatePropagation();
  if(e.key==='Escape'){e.preventDefault();this.close();return;}
  if(e.key==='Enter'){
   e.preventDefault();if(e.repeat)return;const line=this.input.value.trim();if(!line||line==='/')return;
   this.history.add(line);const result=this.registry.execute(line);const row=document.createElement('div');row.style.color=result.ok?'#d9ecc6':'#efb1a2';row.textContent=`${line}\n${result.text}`;this.output.append(row);while(this.output.children.length>6)this.output.firstElementChild!.remove();this.output.scrollTop=this.output.scrollHeight;
   this.input.value='/';this.tabOptions=[];this.suggest();return;
  }
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();this.input.value=this.history.move(e.key==='ArrowUp'?-1:1,this.input.value);this.input.setSelectionRange(this.input.value.length,this.input.value.length);this.tabOptions=[];this.suggest();return;}
  if(e.key==='Tab'){e.preventDefault();if(!this.tabOptions.length||this.input.value!==this.lastCompletion){this.tabOptions=this.registry.suggestions(this.input.value);this.tabIndex=0;}if(this.tabOptions.length){this.input.value=this.tabOptions[this.tabIndex++%this.tabOptions.length];this.lastCompletion=this.input.value;this.suggest();}return;}
 };
 open(){this.prior=document.activeElement;this.isOpen=true;this.root.hidden=false;this.root.style.display='flex';this.lock(true);this.input.value='/';this.tabOptions=[];this.suggest();this.input.focus();}
 close(){this.isOpen=false;this.root.hidden=true;this.root.style.display='none';this.lock(false);if(this.prior instanceof HTMLElement)this.prior.focus();}
 destroy(){if(this.isOpen)this.close();window.removeEventListener('keydown',this.key,true);window.removeEventListener('keyup',this.keyup,true);this.root.remove();}
}
