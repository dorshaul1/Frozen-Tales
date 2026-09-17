// Native three-by-five carved lettering, deliberately short at world scale.
const letters={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],E:['111','100','110','100','111'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','111','101','101'],O:['010','101','101','101','010'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],V:['101','101','101','101','010'],' ':['000','000','000','000','000']};
const boards=[[['R','COAST'],['D','HOME']],[['D','LAKE'],['R','BLUE ICE']],[['D','LAKE'],['R','BLUE ICE']],[['L','GORGE'],['R','LAKE']]];
export function navigationSignArt(p,frame){
 p.rect(34,5,6,28,'woodDark');p.rect(35,6,2,25,'woodLight');p.rect(33,31,9,2,'snowShade');
 boards[frame.index].forEach(([dir,label],i)=>{const y=3+i*12;
 p.rect(3,y,68,11,'woodDark');p.rect(4,y+1,66,8,'wood');p.line(5,y+1,68,y+1,'woodLight');p.line(9,y+9,64,y+9,'woodShade');
 p.line(5,y,22,y,'snow');p.line(48,y,67,y,'snow');p.rect(6,y+7,1,1,'ink');p.rect(68,y+7,1,1,'ink');
 const x=10,cy=y+5;if(dir==='L'||dir==='R'){p.line(x-3,cy,x+3,cy,'snow');const tip=dir==='L'?x-3:x+3,back=dir==='L'?x:x;p.line(tip,cy,back,cy-3,'snow');p.line(tip,cy,back,cy+3,'snow');}else{p.line(x,cy-3,x,cy+3,'snow');const tip=dir==='U'?cy-3:cy+3;p.line(x,tip,x-3,cy,'snow');p.line(x,tip,x+3,cy,'snow');}
 for(let c=0;c<label.length;c++)for(let yy=0;yy<5;yy++)for(let xx=0;xx<3;xx++)if(letters[label[c]][yy][xx]==='1')p.rect(20+c*5+xx,y+3+yy,1,1,'snow');
 });
}
