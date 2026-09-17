import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import type { FishFight } from './FishFight';
import palette from '../../../assets/palette.json';

const tint = (hex: string) => Number.parseInt(hex.slice(1), 16);

// A small world-space meter; no overlay scene, modal, or UI framework.
export class FishingUI {
  private graphics: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private details: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    this.details=pixelText(scene,0,0,'STAMINA\nDISTANCE',{fontFamily:'monospace',fontSize:'6px',color:palette.iceLight,lineSpacing:4}).setDepth(6).setVisible(false);
    this.graphics = scene.add.graphics().setDepth(5);
    this.label = pixelText(scene,0, 0, '', { fontFamily: 'monospace', fontSize: '8px', color: palette.snowLight, backgroundColor:palette.ink, padding:{x:3,y:2} }).setOrigin(.5, 1).setDepth(6);
  }

  draw(fight: FishFight | undefined, x: number, y: number) {
    const g = this.graphics.clear();
    this.label.setVisible(!!fight);this.details.setVisible(!!fight);
    if (!fight) return;
    x = Math.round(x); y = Math.round(y - 46);
    const width = 92;
    const low = fight.tension < fight.safeLow, high = fight.tension > fight.safeHigh;
    const color = high ? palette.rustLight : low ? palette.iceLight : palette.furLight;
    const phase = fight.windTime>0?'SECOND WIND!':{ calm: 'CALM', pull: 'PULL', burst: 'BURST!', recovery: 'EASING' }[fight.struggle.phase];
    const arrows=['→','↘','↓','↙','←','↖','↑','↗'];
    const direction=arrows[(Math.round(fight.controlAngle/(Math.PI/4))+8)%8];
    this.label.setText(fight.readyToLand?'E / SPACE · LAND!':high ? 'RELEASE · ease off' : low ? 'HOLD · reel in' : `${phase} · follow ${direction} · ${fight.running?'ease off':'reel'}`)
      .setPosition(x, y - 8).setColor(color);
    // Keep the complete meter and instruction inside the visible world at map edges.
    const camera=this.scene.cameras.main,view=camera.worldView;
    const half=Math.max(width/2+5,this.label.width/2);
    x=Math.round(Phaser.Math.Clamp(x,view.left+half+4,view.right-half-4));
    y=Math.round(Phaser.Math.Clamp(y,view.top+this.label.height+12,view.bottom-37));
    const left=x-width/2;this.label.setPosition(x,y-8);
    this.details.setPosition(left,y+8);
    g.fillStyle(tint(palette.ink), .94).fillRect(left - 5, y - 20, width + 10, 53);
    g.fillStyle(tint(palette.iceDark)).fillRect(left, y - 3, width, 7);
    g.fillStyle(tint(palette.pineLight)).fillRect(left + Math.round(width * fight.safeLow), y - 3, Math.round(width * (fight.safeHigh - fight.safeLow)), 7);
    g.fillStyle(tint(palette.rustDark)).fillRect(left + Math.round(width * fight.safeHigh), y - 3, Math.round(width * (1 - fight.safeHigh)), 7);
    g.fillStyle(tint(color)).fillRect(left + Math.round(fight.tension * (width - 2)), y - 5, 2, 11);
    // Thin amber line below the tension gauge: accumulated catch progress.
    g.fillStyle(tint(palette.waterLight)).fillRect(left+44, y + 10, width-44, 3);
    g.fillStyle(tint(palette.amber)).fillRect(left+44, y + 10, Math.floor((width-44) * (1-fight.progressRatio)), 3);
    g.fillStyle(tint(palette.waterLight)).fillRect(left+44,y+20,width-44,3);
    g.fillStyle(tint(palette.iceLight)).fillRect(left+44,y+20,Math.floor((width-44)*Math.min(1,fight.distance/105)),3);
    // Tiny danger ticks show that momentary mistakes are recoverable.
    if (low || high) {
      const danger = low ? fight.looseTime / fight.data.escapeTolerance : fight.snapTime / fight.data.snapTolerance;
      g.fillStyle(tint(color)).fillRect(left, y + 6, Math.floor(width * danger), 1);
    }
  }

  destroy() { this.graphics.destroy(); this.label.destroy();this.details.destroy(); }
}
