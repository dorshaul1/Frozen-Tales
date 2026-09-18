import {gameplayCode} from '../input/physicalKeyboard';
import {positionPanel,panelPoint} from '../ui/panelPosition';
import { HELP_PAGES } from '../ui/help';
import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { ASSETS, ATLAS } from '../assets/textures';
import { AudioManager } from './AudioManager';
import type { Channel } from './settings';
const PANEL_CHANNELS = ['master', 'music', 'sfx'] as const;
export class AudioPanel {
  isOpen=false;
  private helpPage=-1;
  private helpView!:Phaser.GameObjects.Container;
  private helpButton!:Phaser.GameObjects.Text;
  private panel:Phaser.GameObjects.Container;
  private graphics:Phaser.GameObjects.Graphics;
  private values:Phaser.GameObjects.Text[]=[];
  private mutes:Phaser.GameObjects.Text[]=[];
  private selection=0;
  private dragging?:Channel;
  private keys:Phaser.Input.Keyboard.Key[];
  private button:HTMLElement|null;
  constructor(private scene:Phaser.Scene,private audio:AudioManager,private onOpen:()=>void,private onClose:()=>void){
    const text=(x:number,y:number,t:string,size=10,color='#c0dce0')=>pixelText(scene,x,y,t,{fontFamily:'monospace',fontSize:`${size}px`,color});
    this.graphics=scene.add.graphics();
    this.panel=scene.add.container(0,0,[scene.add.image(0,0,ATLAS,ASSETS['hub-panel']),text(-155,-128,'PAUSED',14,'#f3d49a'),text(-155,-108,'Settle into the sounds of the river.',8),this.graphics]).setDepth(30).setVisible(false);
    this.panel.add(text(145,-128,'×',14,'#f3d49a'));
    PANEL_CHANNELS.forEach((id,i)=>{
      const y=-50+i*55;
      this.panel.add(text(-155,y-10,id === 'sfx' ? 'SFX' : id.charAt(0).toUpperCase()+id.slice(1)));
      this.values.push(text(73,y-10,'',9));this.panel.add(this.values[i]);
      this.mutes.push(text(110,y-10,'',9,'#f3d49a'));this.panel.add(this.mutes[i]);

    });
    this.panel.add(text(-155,112,'↑↓ choose  ←→ volume  E mute  Esc close',8));
    this.helpButton=text(-155,88,'Controls & How to Play  >',10,'#f3d49a');
    this.panel.add(this.helpButton);
    this.helpView=scene.add.container();this.panel.add(this.helpView);
    this.keys=['ESC','UP','DOWN','LEFT','RIGHT','E','SPACE'].map(k=>scene.input.keyboard!.addKey(k));
    this.button=document.getElementById('settings-button');this.button?.addEventListener('click',this.toggle);this.button?.addEventListener('keydown',this.buttonKey);
    scene.input.on('pointerdown',this.pressPanel,this);scene.input.on('pointermove',this.slide,this);scene.input.on('pointerup',this.release,this);
    scene.game.events.on(Phaser.Core.Events.BLUR,this.close,this);
    scene.events.once('shutdown',()=>{this.button?.removeEventListener('click',this.toggle);this.button?.removeEventListener('keydown',this.buttonKey);scene.input.off('pointerdown',this.pressPanel,this);scene.input.off('pointermove',this.slide,this);scene.input.off('pointerup',this.release,this);scene.game.events.off(Phaser.Core.Events.BLUR,this.close,this);this.panel.destroy();});
  }
  private showHelp(page:number) {
    this.helpPage=page;this.dragging=undefined;this.helpView.removeAll(true);
    if(page<0)return;
    const data=HELP_PAGES[page];
    const text=(x:number,y:number,t:string,color='#dde7e5')=>pixelText(this.scene,x,y,t,{fontSize:'8px',color});
    this.helpView.add(this.scene.add.image(0,0,ATLAS,ASSETS['hub-panel']));
    this.helpView.add(text(-155,-125,data.title,'#f3d49a'));
    data.lines.forEach((line,i)=>this.helpView.add(text(-155,-90+i*14,line)));
    this.helpView.add(text(-155,102,'< '+(page+1)+' / 2  · arrows / E for next >','#f3d49a'));
    this.helpView.add(text(-155,123,'Esc · back to pause','#c0dce0'));
  }
  // Hit-test in the same camera-independent coordinates used to draw the panel.
  // Phaser child zones inherit the world camera transform and drift at non-unit zoom.
  private pressPanel(p:Phaser.Input.Pointer){
    if(!this.isOpen)return;
    const point=panelPoint(this.scene,this.panel,p);
    const inside=(x:number,y:number,w:number,h:number)=>point.x>=x&&point.x<=x+w&&point.y>=y&&point.y<=y+h;
    if(this.helpPage>=0){
      if(inside(-160,98,320,19))this.showHelp((this.helpPage+1)%HELP_PAGES.length);
      else if(inside(-160,119,320,19))this.showHelp(-1);
      return;
    }
    if(inside(140,-132,24,24)){this.close();return;}
    if(inside(-160,83,320,23)){this.selection=3;this.showHelp(0);return;}
    PANEL_CHANNELS.forEach((id,i)=>{
      const y=-50+i*55;if(point.y<y-15||point.y>y+12)return;
      if(point.x>=-65&&point.x<=65){this.selection=i;this.dragging=id;this.slide(p);}
      else if(point.x>=107&&point.x<=158){this.selection=i;this.audio.setMute(id,!this.audio.settings[id].muted);this.draw();}
    });
  }
  private release(){this.dragging=undefined;}
  private slide(p:Phaser.Input.Pointer){if(!this.isOpen||!this.dragging)return;const point=panelPoint(this.scene,this.panel,p);this.audio.setVolume(this.dragging,(point.x+65)/130);this.draw();}
  private buttonKey=(event:KeyboardEvent)=>{if((gameplayCode(event)==='Enter'||gameplayCode(event)==='Space')&&!event.repeat){event.preventDefault();event.stopPropagation();this.toggle();}};
  private toggle=()=>{if(this.isOpen)this.close();else this.open();};
  open(){if(this.isOpen)return;this.onOpen();this.showHelp(-1);this.isOpen=true;this.panel.setVisible(true);this.button?.blur();if(this.button){this.button.textContent='▶';this.button.setAttribute('aria-label','Resume game');this.button.setAttribute('aria-expanded','true');}document.body.classList.add('panel-open');this.keys.forEach(k=>k.reset());this.audio.play('ui-open');this.position();this.draw();}
  close(){if(!this.isOpen)return;this.isOpen=false;this.dragging=undefined;this.panel.setVisible(false);if(this.button){this.button.textContent='Ⅱ';this.button.setAttribute('aria-label','Pause game and open settings');this.button.setAttribute('aria-expanded','false');}document.body.classList.remove('panel-open');this.audio.play('ui-close');this.onClose();}
  private position(){positionPanel(this.scene,this.panel,360,280);}
  private draw(){
    this.helpButton.setColor(this.selection===3?'#ffffff':'#f3d49a');
    this.graphics.clear();PANEL_CHANNELS.forEach((id,i)=>{const s=this.audio.settings[id],y=-50+i*55,x=-65;
      this.graphics.fillStyle(0x344c59).fillRect(x,y-5,130,8).fillStyle(s.muted?0x7b929c:0xb08d63).fillRect(x,y-5,Math.round(130*s.volume),8);
      this.graphics.lineStyle(1,i===this.selection?0xf3d49a:0x566977).strokeRect(x-2,y-7,134,12);
      this.graphics.fillStyle(s.muted?0x7b929c:0xf3d49a).fillRect(Math.round(x+130*s.volume)-2,y-8,5,14);
      this.values[i].setText(`${Math.round(s.volume*100)}%`);this.mutes[i].setText(s.muted?'MUTED':'MUTE');
    });
  }
  update(){if(!this.isOpen)return;this.position();const edge=this.keys.map(k=>Phaser.Input.Keyboard.JustDown(k));if(this.helpPage>=0){if(edge[0])this.showHelp(-1);else if(edge.slice(1).some(Boolean))this.showHelp((this.helpPage+1)%HELP_PAGES.length);return;}if(edge[0]){this.close();return;}
    if(edge[1])this.selection=(this.selection+3)%4;if(edge[2])this.selection=(this.selection+1)%4;
    if(this.selection===3){if(edge[5]||edge[6])this.showHelp(0);this.draw();return;}
    const id=PANEL_CHANNELS[this.selection];if(edge[3]||edge[4])this.audio.setVolume(id,this.audio.settings[id].volume+(edge[4]?.05:-.05));
    if(edge[5]||edge[6])this.audio.setMute(id,!this.audio.settings[id].muted);if(edge.some(Boolean))this.draw();
  }
}
