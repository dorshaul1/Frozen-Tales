import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { Environment, LIGHTING, WEATHER } from './conditions';

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function mixColor(a: number, b: number, t: number) {
  return [16, 8, 0].reduce((color, shift) => color | Math.round(mix((a >> shift) & 255, (b >> shift) & 255, t)) << shift, 0);
}
function multiply(a: number, b: number) {
  return [16, 8, 0].reduce((color, shift) => color | Math.round(((a >> shift) & 255) * ((b >> shift) & 255) / 255) << shift, 0);
}
export class EnvironmentView {
  storm=0;
  rain=0;
  gust=0;
  night = 0;
  cave = 0;
  flakes = 0;
  wind = 2;
  water = 1;
  aurora = 0;
  private weatherTint = 0xffffff;
  private tintChannels = [255, 255, 255];
  private tintTimer = 0;
  private icon:Phaser.GameObjects.Graphics;
  private iconWeather='';
  private label: Phaser.GameObjects.Text;
  constructor(private scene: Phaser.Scene, private environment: Environment) {
    this.icon=scene.add.graphics().setScrollFactor(0).setDepth(19);
    this.label = pixelText(scene,0, 0, '', { fontFamily: 'monospace', fontSize: '8px', color: '#c0dce0', stroke: '#203441', strokeThickness: 2 })
      .setScrollFactor(0).setDepth(19).setAlpha(.85);
  }
  update(seconds: number) {
    const env = this.environment, weather = WEATHER[env.weather], blend = 1 - Math.exp(-seconds / 6);
    this.storm=mix(this.storm,env.weather==='heavy-snow'?1:0,blend);
    this.rain=mix(this.rain,env.weather==='rain'?1:0,blend);
    this.gust=mix(this.gust,env.weather==='windy'?1:env.weather==='heavy-snow'?.85:env.weather==='rain'?.45:0,blend);
    this.flakes = mix(this.flakes, weather.flakes, blend);
    this.wind = mix(this.wind, weather.wind, blend);
    this.water = mix(this.water, weather.water, blend);
    this.aurora = mix(this.aurora, env.weather === 'aurora' ? 1 : 0, blend);
    const phaseBlend = env.transition * env.transition * (3 - 2 * env.transition);
    this.night = mix(LIGHTING[env.phase].night, LIGHTING[env.nextPhase].night, phaseBlend);
    this.weatherTint = [16, 8, 0].reduce((color, shift, i) => {
      this.tintChannels[i] = mix(this.tintChannels[i], (weather.tint >> shift) & 255, blend);
      return color | Math.round(this.tintChannels[i]) << shift;
    }, 0);
    const tint = multiply(mixColor(LIGHTING[env.phase].tint, LIGHTING[env.nextPhase].tint, phaseBlend), this.weatherTint);
    // Tint native world pixels rather than placing a fog/filter over fishing or UI.
    this.tintTimer -= seconds;
    if (this.tintTimer <= 0) {
      this.tintTimer = .15;
      for (const child of this.scene.children.list) {
        if ((child instanceof Phaser.GameObjects.Image || child instanceof Phaser.GameObjects.Sprite) && child.depth <= 3 && !child.getData('emissive')) child.setTint(tint);
      }
    }
    const camera = this.scene.cameras.main;
    this.label.setPosition((camera.width - camera.width / camera.zoom) / 2 + 25, (camera.height + camera.height / camera.zoom) / 2 - 22);
    this.label.setText(`${env.phase[0].toUpperCase()}${env.phase.slice(1)} · ${weather.name}`);
    this.icon.setPosition(Math.round(this.label.x-16),Math.round(this.label.y));
    if(this.iconWeather!==env.weather){this.iconWeather=env.weather;const g=this.icon.clear().fillStyle(0xc0dce0);
      if(env.weather.includes('snow')){g.fillRect(5,0,1,11).fillRect(0,5,11,1).fillRect(2,2,2,2).fillRect(7,7,2,2).fillRect(7,2,2,2).fillRect(2,7,2,2);if(env.weather==='heavy-snow')g.fillRect(12,7,1,4);}
      else if(env.weather==='rain'){for(let i=0;i<3;i++)g.fillRect(i*4+1,0,1,4).fillRect(i*4,4,1,3);}
      else if(env.weather==='windy'){g.fillRect(0,2,10,1).fillRect(3,5,10,1).fillRect(0,8,8,1);}
      else {g.fillRect(3,2,6,6).fillRect(5,0,2,1).fillRect(5,9,2,1).fillRect(1,4,1,2).fillRect(10,4,1,2);}
    }
  }
}
