import fs from 'node:fs';
import { PNG } from 'pngjs';
import { Pixels } from './pixels.mjs';
import { at, read, png } from './core.mjs';

// Tiny original 3×5 label font, used only for the offline art contact sheet.
const glyphs={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'101111111111101',O:'010101101101010',P:'110101110100100',Q:'010101101111011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','-':'000000111000000'};
const assets=read('assets/manifest.json').assets;
const sheet=new Pixels(640,Math.ceil(assets.length/4)*180);
sheet.rect(0,0,sheet.image.width,sheet.image.height,'deep');
for(const [index,asset] of assets.entries()) {
  const x=index%4*160,y=Math.floor(index/4)*180;
  sheet.rect(x+2,y+2,156,176,'waterShade');
  [...asset.id.toUpperCase()].forEach((char,i)=>{
    const bits=glyphs[char]??'000000000000000';
    [...bits].forEach((bit,j)=>{if(bit==='1')sheet.rect(x+8+i*8+j%3*2,y+9+Math.floor(j/3)*2,2,2,'snow');});
  });
  const source=png(asset.frames[0].output),step=Math.max(1,Math.ceil(Math.max(source.width,source.height)/144)),scale=step>1?1:Math.min(4,Math.max(1,Math.floor(144/Math.max(source.width,source.height))));
  const ox=x+Math.floor((160-Math.ceil(source.width/step)*scale)/2),oy=y+28+Math.floor((144-Math.ceil(source.height/step)*scale)/2);
  for(let sy=0;sy<source.height;sy+=step)for(let sx=0;sx<source.width;sx+=step){
    const si=(sy*source.width+sx)*4;if(source.data[si+3]===0)continue;
    for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.image.data.set(source.data.subarray(si,si+4),((oy+Math.floor(sy/step)*scale+dy)*sheet.image.width+ox+Math.floor(sx/step)*scale+dx)*4);
  }
}
fs.writeFileSync(at('assets/references/contact-sheet.png'),PNG.sync.write(sheet.image));
console.log('Wrote assets/references/contact-sheet.png (nearest-neighbor thumbnails / integer enlargement)');
