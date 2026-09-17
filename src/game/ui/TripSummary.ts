import {positionPanel} from './panelPosition';
import Phaser from 'phaser';
import {pixelText} from './PixelText';
import {ASSETS,ATLAS} from '../assets/textures';
import {FISH} from '../fishing/data';
import type {Trip} from '../player/Trips';
export function showTripSummary(scene:Phaser.Scene,t:Trip&{duration:number}){
 const panel=scene.add.container().setDepth(45);
 const position=()=>positionPanel(scene,panel,314,200);position();scene.events.on('update',position);
 panel.add(scene.add.graphics().fillStyle(0x173642,.98).fillRect(-155,-98,310,196).lineStyle(2,0xb49a70).strokeRect(-155,-98,310,196));
 const text=(x:number,y:number,s:string,color='#dde7e5')=>{const t=pixelText(scene,x,y,s,{fontSize:'10px',color});panel.add(t);return t;};
 text(-140,-84,'HOME WITH A HAUL','#f3d49a');const money=text(-140,-63,'+$0','#f3d49a');
 text(-140,-43,`${t.caught} caught · ${Math.floor(t.duration/60)}m ${Math.floor(t.duration%60)}s`);
 for(const [i,f]of [t.biggest,t.valuable].entries())if(f){const y=-15+i*34;panel.add(scene.add.image(-121,y+7,ATLAS,ASSETS[`fish-${f.type}`]).setScale(.75));text(-98,y,`${i?'Best value':'Biggest'} · ${FISH[f.type].name}`);text(-98,y+14,i?`$${t.valuablePrice}`:`${f.weightKg.toFixed(2)} kg`,'#f3d49a');}
 text(-140,58,`${t.rare} Rare/Trophy · ${t.records} records`,t.records?'#f3d49a':'#dde7e5');
 text(-140,77,`Freshness ${t.freshness>=0?'+':''}$${t.freshness} · Any key closes`,'#9dc5cc');
 let closed=false;const close=()=>{if(closed)return;closed=true;scene.events.off('update',position);scene.input.keyboard?.off('keydown',close);panel.destroy(true);};
 scene.input.keyboard?.on('keydown',close);panel.add(scene.add.zone(0,0,310,196).setInteractive().on('pointerdown',close));
 const counter={value:0};scene.tweens.add({targets:counter,value:t.earnings,duration:650,onUpdate:()=>{if(!closed)money.setText(`+$${Math.round(counter.value)}`);}});
 scene.time.delayedCall(4200,close);scene.events.emit('river-cue','sale',.25);
}
