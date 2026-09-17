import Phaser from 'phaser';import {RiverScene} from '../src/game/scenes/RiverScene';import {landDecorationFits,landPlant,waterSpans} from '../src/game/world/river';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:800,height:600,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});while(!scene.fishing)await new Promise(r=>setTimeout(r,100));
const out=document.querySelector('#result')!;let samples=0;
for(let y=200;y<5400;y+=7)for(const [l,r]of waterSpans(y)){
 if(landDecorationFits((l+r)/2-8,y,16,16)||landDecorationFits(l-8,y,16,16))throw Error('Plant allowed across water/shore');samples++;
}
for(const o of scene.children.list)if(o instanceof Phaser.GameObjects.Image&&landPlant(o.frame.name.split('/')[0])){
 if(!landDecorationFits(o.x-o.displayWidth*o.originX,o.y-o.displayHeight*o.originY,o.displayWidth,o.displayHeight))throw Error('Village/landing plant overlaps water');
}
out.textContent=`PASS ${samples} river and side-channel placement checks\nPASS village and landing vegetation stays entirely on land`;
