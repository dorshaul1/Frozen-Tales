import Phaser from 'phaser';
import {pixelText,hudPixelText} from '../ui/PixelText';
import {positionPanel} from '../ui/panelPosition';
import {ATLAS,ASSETS,type AssetId} from '../assets/catalog';
import {Goals} from './Goals';
const ICONS:Record<string,AssetId>={fish:'fish-char',home:'village-igloo',coin:'coin-icon',map:'map-marker',gear:'village-sign-tools',book:'gear-guide'};
export class GoalsView {
 isOpen=false;private allowed=false;private tab='ACTIVE';private page=0;private stamp='';
 private preview:HTMLButtonElement;private screen:Phaser.GameObjects.Container;
 constructor(private scene:Phaser.Scene,private goals:Goals,private lock:(v:boolean)=>void=()=>{}){
 this.screen=scene.add.container().setDepth(65).setVisible(false);
 this.preview=document.createElement('button');this.preview.type='button';this.preview.id='objectives-button';this.preview.title='Open Objectives (O)';
 Object.assign(this.preview.style,{position:'fixed',zIndex:'10',border:'0',padding:'6px 8px',background:'#173642',color:'#f3d49a',cursor:'pointer'});
 this.preview.addEventListener('click',()=>this.open());document.body.append(this.preview);
 this.alignPreview();scene.scale.on('resize',this.alignPreview);window.addEventListener('resize',this.alignPreview);
 window.addEventListener('keydown',this.key,true);scene.events.once('shutdown',()=>{window.removeEventListener('keydown',this.key,true);window.removeEventListener('resize',this.alignPreview);scene.scale.off('resize',this.alignPreview);if(this.isOpen)this.close();this.preview.remove();});
 }
 private alignPreview=()=>{const r=document.getElementById('settings-button')?.getBoundingClientRect()??this.scene.game.canvas.getBoundingClientRect();this.preview.style.left=`${Math.round(r.left)}px`;this.preview.style.top=`${Math.round(r.bottom+(document.getElementById('settings-button')?12:0))}px`;};
 private key=(e:KeyboardEvent)=>{if(!this.isOpen){if(e.code!=='KeyO'||!this.allowed||e.repeat)return;e.preventDefault();e.stopImmediatePropagation();this.open();return;}e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyO')this.close();if(e.code==='ArrowRight'){this.page++;this.draw();}if(e.code==='ArrowLeft'){this.page=Math.max(0,this.page-1);this.draw();}};
 open(){if(!this.allowed||this.isOpen)return;this.isOpen=true;this.tab='ACTIVE';this.page=0;this.preview.style.display='none';this.preview.setAttribute('aria-expanded','true');this.scene.input.keyboard!.resetKeys();this.scene.input.keyboard!.enabled=false;this.lock(true);this.draw();}
 close(){this.isOpen=false;this.screen.setVisible(false);this.preview.style.display=this.allowed?'block':'none';this.preview.setAttribute('aria-expanded','false');this.scene.input.keyboard!.enabled=true;this.scene.input.keyboard!.resetKeys();this.lock(false);}
 private list(){return this.goals.state.current.filter(g=>this.tab==='COMPLETED'?g.completeAt!==undefined:g.completeAt===undefined&&(this.tab==='LONG-TERM'?g.scope==='long':g.scope!=='long')).sort((a,b)=>this.tab==='COMPLETED'?(b.completeAt??0)-(a.completeAt??0):0);}
 private draw(){this.screen.removeAll(true);this.screen.setVisible(true);const add=(o:Phaser.GameObjects.GameObject)=>{this.screen.add(o);return o;};
 add(this.scene.add.zone(0,0,10000,10000).setInteractive());add(this.scene.add.graphics().fillStyle(0x173642,.99).fillRect(-158,-144,316,288).lineStyle(1,0xb08d63).strokeRect(-158,-144,316,288));
 const text=(x:number,y:number,t:string,color='#c0dce0')=>{const v=pixelText(this.scene,x,y,t,{fontSize:'8px',color});add(v);return v;};
 text(-146,-132,'PROGRESSION OBJECTIVES','#f3d49a');text(106,-132,'Esc · X').setInteractive().on('pointerdown',()=>this.close());
 ['ACTIVE','LONG-TERM','COMPLETED'].forEach((t,i)=>text(-146+i*98,-111,t,t===this.tab?'#f3d49a':'#7397a1').setInteractive().on('pointerdown',()=>{this.tab=t;this.page=0;this.draw();}));
 const list=this.list(),pages=Math.max(1,Math.ceil(list.length/3));this.page=Math.min(this.page,pages-1);
 list.slice(this.page*3,this.page*3+3).forEach((g,i)=>{const y=-91+i*68;add(this.scene.add.graphics().fillStyle(0x254653).fillRect(-147,y,294,62).lineStyle(1,g.completeAt!==undefined?0x698f82:0x486978).strokeRect(-147,y,294,62));const icon=this.scene.add.image(-132,y+14,ATLAS,ASSETS[ICONS[g.icon]]);icon.setScale(Math.min(1,18/icon.width,18/icon.height));add(icon);text(-116,y+5,g.title,'#f3d49a');text(-138,y+20,g.detail).setWordWrapWidth(270);text(-138,y+49,`${g.progress} / ${g.target}     $${g.reward}${g.completeAt!==undefined?' · Earned':''}`,'#a9cfc2');if(g.completeAt===undefined)text(96,y+49,this.goals.state.pins.includes(g.id)?'Unpin':'Pin').setInteractive().on('pointerdown',()=>{this.goals.pin(g.id);this.draw();});});
 if(!list.length)text(-138,-60,'No objectives here yet.\nOther branches will open as you progress.');
 text(-144,124,'< Prev').setInteractive().on('pointerdown',()=>{this.page=Math.max(0,this.page-1);this.draw();});text(-48,124,`${this.page+1}/${pages} · Pins ${this.goals.state.pins.length}/3`);text(94,124,'Next >').setInteractive().on('pointerdown',()=>{this.page=Math.min(pages-1,this.page+1);this.draw();});positionPanel(this.scene,this.screen,316,288);
 }
 update(visible:boolean){this.allowed=visible;const c=this.scene.cameras.main,pixels=c.width>=640&&c.height>=480?2:1;this.preview.style.display=visible&&!this.isOpen?'block':'none';const active=this.goals.state.current.filter(g=>g.completeAt===undefined&&g.scope!=='long').length;
 const label=`Objectives (${active})`;if(this.preview.dataset.pixelScale!==String(pixels)){delete this.preview.dataset.pixelLabel;this.preview.dataset.pixelScale=String(pixels);}hudPixelText(this.preview,label,pixels,'#f3d49a');this.preview.setAttribute('aria-expanded',String(this.isOpen));
 if(this.isOpen){const stamp=JSON.stringify(this.goals.state);if(stamp!==this.stamp){this.stamp=stamp;this.draw();}positionPanel(this.scene,this.screen,316,288);}
 }
}
