import Phaser from 'phaser';
import { ANIMATIONS, ASSETS, ASSET_FRAMES, ATLAS, ATLAS_DATA, ATLAS_IMAGE, type AssetId } from './catalog';
export { ASSETS, ASSET_FRAMES, ATLAS } from './catalog';
export function loadAssets(scene:Phaser.Scene){
 if(!scene.textures.exists(ATLAS))scene.load.atlas(ATLAS,ATLAS_IMAGE,ATLAS_DATA);
}
export function createTextures(scene:Phaser.Scene){
 for(const animation of ANIMATIONS)if(!scene.anims.exists(animation.key))scene.anims.create({
  key:animation.key,frames:animation.frames.map(frame=>({key:ATLAS,frame})),frameRate:animation.frameRate,repeat:animation.repeat,
 });
  // DOM HUD icons also come from the same validated atlas, never duplicate art.
  for (const [elementId, assetId] of [['cargo-icon', 'cargo-icon'], ['coin-icon', 'coin-icon']] as const) {
    const element = document.getElementById(elementId) as HTMLImageElement | null;
    if (element) element.src = assetCanvas(scene, assetId).toDataURL();
  }
}

export function paintAsset(scene: Phaser.Scene, ctx: CanvasRenderingContext2D, id: AssetId, x: number, y: number, variant = 0) {
  const frame = scene.textures.getFrame(ATLAS, ASSET_FRAMES[id][variant] ?? ASSETS[id]);
  ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, x, y, frame.realWidth, frame.realHeight);
}

export function assetCanvas(scene: Phaser.Scene, id: AssetId, variant=0) {
  const frame = scene.textures.getFrame(ATLAS, ASSET_FRAMES[id][variant]??ASSETS[id]);
  const canvas = document.createElement('canvas');
  canvas.width = frame.cutWidth; canvas.height = frame.cutHeight;
  const ctx = canvas.getContext('2d')!; ctx.imageSmoothingEnabled = false;
  paintAsset(scene, ctx, id, 0, 0);
  return canvas;
}

export function assetPattern(scene:Phaser.Scene,ctx:CanvasRenderingContext2D,id:AssetId,variant=0){
 return ctx.createPattern(assetCanvas(scene,id,variant),'repeat')!;
}
