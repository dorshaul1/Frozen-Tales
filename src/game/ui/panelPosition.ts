import type Phaser from 'phaser';

/** Screen-anchored menus retain integer pixel scale independently of world zoom. */
export function positionPanel(scene:Phaser.Scene,panel:Phaser.GameObjects.Container,width:number,height:number){
 const camera=scene.cameras.main;
 const pixels=Math.max(1,Math.min(Math.round(camera.zoom),Math.floor((camera.width-16)/width),Math.floor((camera.height-16)/height)));
 panel.setScrollFactor(0).setScale(pixels/camera.zoom).setPosition(Math.round(camera.width/2),Math.round(camera.height/2));
}
export function panelPoint(scene:Phaser.Scene,panel:Phaser.GameObjects.Container,pointer:Phaser.Input.Pointer){
 const c=scene.cameras.main,scale=c.zoom*panel.scaleX;
 return {x:(pointer.x-c.x-c.width/2)/scale,y:(pointer.y-c.y-c.height/2)/scale};
}
