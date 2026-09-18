let started=performance.now(),generation=0,failed=false;
const overlay=()=>document.getElementById('boot-screen');
export function beginLoading(){
 if(!overlay())return;
 generation++;failed=false;started=performance.now();
 document.getElementById('boot-retry')!.hidden=true;
 document.body.classList.add('loading');overlay()!.classList.remove('leaving');
 overlay()!.hidden=false;setLoadingProgress(0,'Packing the tackle…');
}
export function setLoadingProgress(progress:number,message?:string){
 if(failed)return;
 const bar=document.getElementById('boot-progress');
 if(bar){bar.style.width=`${Math.round(Math.max(0,Math.min(1,progress))*100)}%`;bar.parentElement?.setAttribute('aria-valuenow',String(Math.round(progress*100)));}
 const status=document.getElementById('boot-status');if(message&&status)status.textContent=message;
}
export function loadingFailed(){
 if(!overlay()||overlay()!.hidden)return;
 failed=true;document.getElementById('boot-status')!.textContent='The river couldn’t load. Please try again.';
 document.getElementById('boot-retry')!.hidden=false;
}
export function finishLoading(){
 const token=generation;
 setLoadingProgress(1,'The river is ready.');
 window.setTimeout(()=>{
  if(token!==generation||failed||!overlay())return;
  document.body.classList.remove('loading');overlay()!.classList.add('leaving');
  window.setTimeout(()=>{if(token===generation&&!failed)overlay()!.hidden=true;},400);
 },Math.max(0,900-(performance.now()-started)));
}
