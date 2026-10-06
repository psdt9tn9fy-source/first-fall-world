export function initAccess(){
const intro=document.querySelector("#intro"),
  accessStage=document.querySelector("#accessStage"),
  accessControl=document.querySelector("#accessControl"),
  accessFrameProgress=document.querySelector("#accessFrameProgress"),
  accessPercent=document.querySelector("#accessPercent"),
  accessStatus=document.querySelector("#accessStatus"),
  accessHint=document.querySelector("#accessHint"),
  accessHintPrimary=document.querySelector("#accessHintPrimary"),
  accessHintSecondary=document.querySelector("#accessHintSecondary"),
  accessGranted=document.querySelector("#accessGranted");
const isTouchDevice=matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0;
function setIdleAccessHint(){
  accessHintPrimary.textContent=isTouchDevice?"TOUCH & HOLD":"PRESS & HOLD";
  accessHintSecondary.textContent="길게 눌러 기록을 해제하세요";
  accessHint.textContent="HOLD CONTROL // RELEASE TO CANCEL";
}
setIdleAccessHint();
const ACCESS_HOLD_MS=1400;
let accessRAF=0,accessStart=0,accessProgress=0,accessActive=false,accessComplete=false,resetRAF=0;
function paintAccess(p){
  accessProgress=Math.max(0,Math.min(1,p));
  const pct=Math.round(accessProgress*100);
  accessFrameProgress.style.strokeDashoffset=String(100-pct);
  accessControl.style.setProperty("--hold",pct+"%");
  accessPercent.textContent=String(pct).padStart(3,"0")+"%";
  const title=accessStage.querySelector(".final-title");
  title.style.transform="scale("+(1+accessProgress*.035)+")";
  title.style.filter="brightness("+(1+accessProgress*.18)+")";
  if(pct<25)accessStatus.textContent="ARCHIVE SEAL // LOCKED";
  else if(pct<55)accessStatus.textContent="AUTHORIZATION // IDENTITY CHECK";
  else if(pct<82)accessStatus.textContent="ARCHIVE NODE 07 // VERIFYING";
  else if(pct<100)accessStatus.textContent="SEAL RELEASE // STANDBY";
}
function resetAccess(){
  cancelAnimationFrame(accessRAF);cancelAnimationFrame(resetRAF);
  accessActive=false;accessStage.classList.remove("holding");
  const from=accessProgress,start=performance.now(),dur=260;
  function back(now){
    const t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3);
    paintAccess(from*(1-e));
    if(t<1)resetRAF=requestAnimationFrame(back);
    else{accessStatus.textContent="ARCHIVE SEAL // LOCKED";setTimeout(()=>{if(!accessActive&&!accessComplete)setIdleAccessHint()},520)}
  }
  resetRAF=requestAnimationFrame(back);
}
function completeAccess(){
  accessComplete=true;accessActive=false;paintAccess(1);
  accessStage.classList.remove("holding");
  accessHintPrimary.textContent="AUTHORIZATION COMPLETE";
  accessHintSecondary.textContent="기록 봉인이 해제되었습니다";
  accessHint.textContent="ARCHIVE SEAL // RELEASED";
  accessStatus.textContent="ARCHIVE SEAL // RELEASED";
  setTimeout(()=>{
    accessGranted.hidden=false;
    accessStage.classList.add("granted");
    setTimeout(()=>{
      intro.classList.add("unsealing");
      accessStage.classList.add("unsealed");
      setTimeout(()=>{
        intro.classList.add("hide");
        document.body.classList.remove("intro-lock");
      },820);
    },520);
  },150);
}
function accessTick(now){
  if(!accessActive||accessComplete)return;
  const p=Math.min(1,(now-accessStart)/ACCESS_HOLD_MS);
  paintAccess(p);
  if(p>=1)completeAccess();else accessRAF=requestAnimationFrame(accessTick);
}
function beginAccess(e){
  if(e)e.preventDefault();
  if(accessComplete||accessActive||!intro.classList.contains("final-visible"))return;
  cancelAnimationFrame(resetRAF);
  accessActive=true;accessStart=performance.now()-accessProgress*ACCESS_HOLD_MS;
  accessStage.classList.add("holding");
  accessHintPrimary.textContent="KEEP HOLDING";
  accessHintSecondary.textContent="손을 떼지 마세요";
  accessHint.textContent="AUTHORIZATION IN PROGRESS";
  accessRAF=requestAnimationFrame(accessTick);
}
function endAccess(){
  if(accessActive&&!accessComplete){
    accessHintPrimary.textContent="HOLD INTERRUPTED";
    accessHintSecondary.textContent="길게 눌러 다시 시도하세요";
    accessHint.textContent="AUTHORIZATION CANCELLED";
    resetAccess();
  }
}
accessControl.addEventListener("pointerdown",e=>{
  e.preventDefault();
  try{accessControl.setPointerCapture(e.pointerId)}catch(_){}
  beginAccess(e);
});
["pointerup","pointercancel","lostpointercapture"].forEach(x=>accessControl.addEventListener(x,endAccess));
accessControl.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")endAccess()});
accessControl.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!e.repeat)beginAccess(e)});
accessControl.addEventListener("keyup",e=>{if(e.key==="Enter"||e.key===" ")endAccess()});
["contextmenu","selectstart","dragstart"].forEach(x=>accessControl.addEventListener(x,e=>e.preventDefault()));
accessControl.addEventListener("touchstart",e=>e.preventDefault(),{passive:false});
accessControl.addEventListener("touchmove",e=>e.preventDefault(),{passive:false});

}
