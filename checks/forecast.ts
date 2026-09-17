import {Environment,PHASES} from '../src/game/world/conditions';
import Phaser from 'phaser';
import {RiverScene} from '../src/game/scenes/RiverScene';
const out=document.querySelector('#result')!;
const check=(v:boolean,s:string)=>{out.textContent+=(v?'PASS ':'FAIL ')+s+'\n';if(!v)throw Error(s);};
const e=new Environment({seed:54});let previous='';let changed=0;
for(let day=0;day<12;day++){
 const expected=JSON.stringify(e.forecast),restored=new Environment(e.snapshot());
 check(JSON.stringify(restored.forecast)===expected,'Forecast survives reload');
 if(expected!==previous)changed++;previous=expected;
 for(let n=0;n<600;n++){e.update(1);if(n%45===0){const copy=new Environment(e.snapshot());check(JSON.stringify(copy.forecast)===JSON.stringify(e.forecast),'Forecast remains stable within day');}}
 e.sleepUntilMorning();e.update(25);
 check(e.weather===e.forecast[PHASES.indexOf(e.phase)],'Actual weather follows forecast window');
}
check(changed>5,'Different days vary');out.textContent='PASS · 12 days: forecast persistence, weather matching, daily variation';
const scene=new RiverScene(null,true);new Phaser.Game({type:Phaser.AUTO,width:900,height:650,parent:'test',pixelArt:true,physics:{default:'arcade'},scene:[scene]});
while(!scene.forecastBoard)await new Promise(r=>setTimeout(r,100));scene.forecastBoard.open();
