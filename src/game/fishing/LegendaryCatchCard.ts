import { isTrophy } from './specimens';
import { pixelText } from '../ui/PixelText';
import Phaser from 'phaser';
import { FISH } from './data';
import type { CaughtFish } from '../player/Cargo';
import { ASSETS, ATLAS, type AssetId } from '../assets/catalog';

/** Brief world-anchored specimen card; movement remains available. */
export class LegendaryCatchCard {
  private card: Phaser.GameObjects.Container;
  private title: Phaser.GameObjects.Text;
  private name: Phaser.GameObjects.Text;
  private weight:Phaser.GameObjects.Text;
  private details: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene) {
    const text=(x:number,y:number,size:number,color:string)=>pixelText(scene,x,y,'',{fontFamily:'monospace',fontSize:`${size}px`,color}).setOrigin(.5,0);
    const frame=scene.add.graphics().fillStyle(0x173642,.97).fillRect(-98,-48,196,96)
      .lineStyle(2,0xb08d63).strokeRect(-98,-48,196,96).lineStyle(1,0xf3d49a).strokeRect(-94,-44,188,88);
    for(const x of [-98,94])for(const y of [-48,44])frame.fillStyle(0xf3d49a).fillRect(x,y,4,4);
    this.title=text(0,-38,8,'#dac3e8'); this.name=text(0,-23,12,'#f3d49a');
    this.portrait=scene.add.image(-62,13,ATLAS,ASSETS['fish-whitefish']);
    this.weight=text(24,-2,14,'#f3d49a');
    this.details=text(24,19,8,'#dde7e5');
    this.card=scene.add.container(0,0,[frame,this.title,this.name,this.portrait,this.weight,this.details]).setDepth(8).setVisible(false);
  }
  get visible(){return this.card.visible;}
  show(fish:CaughtFish,first:boolean){
    this.title.setText(fish.rarity==='legendary'?(first?'LEGEND DISCOVERED':'LEGENDARY CATCH'):isTrophy(fish.size)?'TROPHY CATCH':'NEW RECORD');
    this.name.setText(FISH[fish.type].name);
    this.portrait.setFrame(ASSETS[`fish-${fish.type}` as AssetId]);
    this.weight.setText(`${fish.weightKg.toFixed(2)} kg`);
    this.details.setText(`$${fish.value} · ${fish.rarity} · Fresh\n${fish.personalRecord?'NEW RECORD':isTrophy(fish.size)?'EXCEPTIONAL SPECIMEN':'Recorded in the journal'}`);
    this.card.setVisible(true).setAlpha(1);
  }
  update(x:number,y:number,remaining:number){this.card.setPosition(Math.round(x),Math.round(y-93)).setAlpha(Math.min(1,remaining*2));}
  hide(){this.card.setVisible(false);}
  destroy(){this.card.destroy(true);}
}
