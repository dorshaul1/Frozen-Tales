import Phaser from 'phaser';
// Original narrow 4×7 alphabet. Solid pixel cells, one-pixel spacing, no font rasterizer.
const rows:Record<string,string>={
A:'0110/1001/1001/1111/1001/1001/1001',B:'1110/1001/1001/1110/1001/1001/1110',C:'0111/1000/1000/1000/1000/1000/0111',D:'1110/1001/1001/1001/1001/1001/1110',E:'1111/1000/1000/1110/1000/1000/1111',F:'1111/1000/1000/1110/1000/1000/1000',G:'0111/1000/1000/1011/1001/1001/0111',H:'1001/1001/1001/1111/1001/1001/1001',I:'111/010/010/010/010/010/111',J:'0011/0001/0001/0001/1001/1001/0110',K:'1001/1001/1010/1100/1010/1001/1001',L:'1000/1000/1000/1000/1000/1000/1111',M:'10001/11011/10101/10101/10001/10001/10001',N:'1001/1101/1101/1011/1011/1001/1001',O:'0110/1001/1001/1001/1001/1001/0110',P:'1110/1001/1001/1110/1000/1000/1000',Q:'0110/1001/1001/1001/1011/1010/0101',R:'1110/1001/1001/1110/1010/1001/1001',S:'0111/1000/1000/0110/0001/0001/1110',T:'11111/00100/00100/00100/00100/00100/00100',U:'1001/1001/1001/1001/1001/1001/0110',V:'1001/1001/1001/1001/1001/0110/0110',W:'10001/10001/10001/10101/10101/11011/10001',X:'1001/1001/0110/0110/0110/1001/1001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'1111/0001/0010/0010/0100/1000/1111',
'0':'0110/1001/1011/1001/1101/1001/0110','1':'010/110/010/010/010/010/111','2':'0110/1001/0001/0010/0100/1000/1111','3':'1110/0001/0001/0110/0001/0001/1110','4':'1001/1001/1001/1111/0001/0001/0001','5':'1111/1000/1000/1110/0001/0001/1110','6':'0111/1000/1000/1110/1001/1001/0110','7':'1111/0001/0010/0010/0100/0100/0100','8':'0110/1001/1001/0110/1001/1001/0110','9':'0110/1001/1001/0111/0001/0001/1110',
' ':'000/000/000/000/000/000/000','.':'0/0/0/0/0/0/1',',':'00/00/00/00/00/01/10',':':'0/1/0/0/1/0/0',';':'00/01/00/00/01/01/10','!':'1/1/1/1/1/0/1','?':'110/001/001/010/010/000/010',"'":'1/1/0/0/0/0/0','"':'101/101/000/000/000/000/000','-':'000/000/000/111/000/000/000','+':'000/010/010/111/010/010/000','/':'0001/0001/0010/0010/0100/1000/1000','\\':'1000/1000/0100/0100/0010/0001/0001','(':'01/10/10/10/10/10/01',')':'10/01/01/01/01/01/10','$':'0100/1111/1100/0110/0011/1110/0010','%':'1001/0001/0010/0010/0100/1000/1001','·':'0/0/0/1/0/0/0','|':'1/1/1/1/1/1/1','→':'00000/00100/00010/11111/00010/00100/00000','↑':'00100/01110/10101/00100/00100/00100/00000','↓':'00100/00100/00100/10101/01110/00100/00000','←':'00000/00100/01000/11111/01000/00100/00000','✓':'0000/0001/0001/1010/0100/0000/0000','×':'0000/1001/0110/0110/1001/0000/0000','↗':'0000/1111/0001/0101/1000/0000/0000','↘':'0000/1000/0101/0001/1111/0000/0000','↖':'0000/1111/1000/1010/0001/0000/0000','↙':'0000/0001/1010/1000/1111/0000/0000'};
rows['&']='01100/10010/10100/01000/10101/10010/01101';
rows['=']='0000/0000/1111/0000/1111/0000/0000';
rows['…']='00000/00000/00000/00000/00000/00000/10101';
rows['◆']='00000/00100/01110/11111/01110/00100/00000';
rows['≋']='00000/11010/00101/00000/11010/00101/00000';
rows['<']='001/010/100/100/010/001/000';rows['>']='100/010/001/001/010/100/000';
const glyph=(char:string)=>(rows[char.toUpperCase().replace(/[’‘]/g,"'").replace(/[—–]/g,'-')]??rows['?']).split('/');
class PixelText extends Phaser.GameObjects.Text {
  setPosition(x=0,y=x) { return super.setPosition(Math.round(x),Math.round(y)); }
  updateText():this {
    const c=this.context,s=this.style;
    if(!c||!s)return this;
    // One native size for body text; titles use exactly 2× cells.
    const scale=parseInt(String(s.fontSize))>=14?2:1;
    s.resolution=1;Reflect.set(s,'metrics',{ascent:7*scale,descent:scale,fontSize:8*scale});
    const measure=c.measureText,fill=c.fillText,stroke=c.strokeText;
    c.measureText=((text:string)=>({width:[...text].reduce((n,ch)=>n+(glyph(ch)[0].length+1)*scale,0)} as TextMetrics));
    const draw=(text:string,x:number,y:number,outline=false)=>{
      x=Math.round(x);y=Math.round(y)-7*scale;
      const color=c.fillStyle;if(outline)c.fillStyle=c.strokeStyle;
      for(const ch of text){const g=glyph(ch);g.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')c.fillRect(x+i*scale-(outline?1:0),y+j*scale-(outline?1:0),scale+(outline?2:0),scale+(outline?2:0));}));x+=(g[0].length+1)*scale;}
      c.fillStyle=color;
    };
    c.fillText=(t,x,y)=>draw(t,x,y);c.strokeText=(t,x,y)=>draw(t,x,y,true);c.imageSmoothingEnabled=false;
    try {super.updateText();Reflect.set(this,'_displayOriginX',Math.round(this.displayOriginX));Reflect.set(this,'_displayOriginY',Math.round(this.displayOriginY));}
    finally{c.measureText=measure;c.fillText=fill;c.strokeText=stroke;}
    return this;
  }
}
export function pixelText(scene:Phaser.Scene,x:number,y:number,text:string,style:Phaser.Types.GameObjects.Text.TextStyle={}) {
  return scene.add.existing(new PixelText(scene,Math.round(x),Math.round(y),text,{...style,resolution:1}));
}

export function hudPixelText(element:HTMLElement|null,text:string,scale=2,color='#edf7f4') {
  if(!element||element.dataset.pixelLabel===text)return;
  element.dataset.pixelLabel=text;element.setAttribute('aria-label',text);
  const canvas=document.createElement('canvas'),g=[...text].map(glyph);
  canvas.width=g.reduce((n,rows)=>n+rows[0].length+1,0)*scale;canvas.height=7*scale;
  const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;c.fillStyle=color;
  let x=0;for(const rows of g){rows.forEach((r,y)=>[...r].forEach((v,i)=>{if(v==='1')c.fillRect(x+i*scale,y*scale,scale,scale);}));x+=(rows[0].length+1)*scale;}
  element.replaceChildren(canvas);
}
