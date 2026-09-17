import {requireFeature,hasFeature} from '../progression/features';
import {VILLAGE} from './villageLayout';
const forecast=VILLAGE.forecastBoard;
import {positionPanel} from '../ui/panelPosition';
import Phaser from 'phaser';
import {pixelText} from '../ui/PixelText';
import {ATLAS,ASSETS} from '../assets/textures';
import {Environment,WEATHER} from '../world/conditions';
import type {Home} from './Home';
// Existing wooden-board and panel art, with a native-pixel weather vane.
export class ForecastBoard {
 isOpen=false;
 private panel:Phaser.GameObjects.Container;
 private hint:Phaser.GameObjects.Text;
 private escape:Phaser.Input.Keyboard.Key;
 constructor(private scene:Phaser.Scene,private home:Home,private environment:Environment){
  scene.add.image(forecast.x,forecast.y,ATLAS,ASSETS['request-board']).setDepth(1);
  scene.add.graphics().setDepth(2).fillStyle(0xf3d49a).fillRect(forecast.x-6,forecast.y-8,9,7).fillRect(forecast.x+5,forecast.y-3,5,2);
  this.hint=pixelText(scene,forecast.x,forecast.y-25,'E · Forecast',{fontSize:'9px',color:'#f3d49a',backgroundColor:'#173642'}).setOrigin(.5).setDepth(4).setVisible(false);
  this.panel=scene.add.container().setDepth(36).setVisible(false);
  this.escape=scene.input.keyboard!.addKey('ESC');
 }
 open(){if(!requireFeature(this.scene,'weatherForecast','Meet Sela at the Coastal Beacon for forecasts.'))return;this.isOpen=true;this.panel.setVisible(true);this.home.setMovementEnabled(false);this.hint.setVisible(false);this.draw();this.scene.events.emit('river-cue','ui-open',.3);}
 close(){this.isOpen=false;this.panel.setVisible(false);this.home.setMovementEnabled(true);this.scene.input.keyboard?.resetKeys();}
 update(pressed:boolean,available:boolean){
  const near=this.home.walking&&Math.hypot(this.home.player.x-forecast.x,this.home.player.y-forecast.y)<30;
  this.hint.setText(hasFeature(this.scene,'weatherForecast')?'E · Forecast':'E · Forecast · ask Sela');this.hint.setVisible(near&&available&&!this.isOpen);
  if(!this.isOpen&&near&&available&&pressed)this.open();
  if(!this.isOpen)return false;
  if(Phaser.Input.Keyboard.JustDown(this.escape)){this.close();return true;}
  positionPanel(this.scene,this.panel,360,280);return true;
 }
 private draw(){
  this.panel.removeAll(true);this.panel.add(this.scene.add.image(0,0,ATLAS,ASSETS['hub-panel']));
  const text=(x:number,y:number,t:string,color='#dde7e5')=>this.panel.add(pixelText(this.scene,x,y,t,{fontSize:'10px',color}));
  text(-153,-123,`RIVER FORECAST · DAY ${this.environment.day+1}`,'#f3d49a');
  this.environment.forecast.forEach((id,i)=>{
   const y=-86+i*30,g=this.scene.add.graphics().fillStyle(id==='clear'?0xf3d49a:0x9dc5cc);this.panel.add(g);
   if(id==='clear'||id==='aurora'){g.fillRect(-150,y+2,7,7);g.fillRect(-148,y-2,2,2).fillRect(-148,y+11,2,2).fillRect(-154,y+4,2,2).fillRect(-141,y+4,2,2);}
   else if(id==='windy')for(let j=0;j<3;j++)g.fillRect(-153+j*2,y+j*4,13,1);
   else for(let j=0;j<3;j++){g.fillRect(-153+j*5,y+2,1,8);if(id!=='rain')g.fillRect(-155+j*5,y+5,5,1);}
   text(-128,y,`${['Morning','Afternoon','Evening','Night'][i]} · ${WEATHER[id].name}`);
  });
  text(-153,43,'Timing may shift · Esc to close.','#9dc5cc');
  text(-153,63,'Rough: Stabilizer / Turbo help.');
  text(-153,79,'Snow: Finder / weather cover help.');
  text(-153,95,'Calm: room for storage or rod mount.');
  text(-153,113,'River: gentle · Gorge: stronger flow', '#9dc5cc');
 }
}
