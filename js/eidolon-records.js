/* Entity database coordinator: controls navigation only; each panel owns its behavior. */
import { initProfileRecord } from "./eidolon-records-profile.js?v=20261009-seraph-v1";
import { initBehaviorRecord } from "./eidolon-records-behavior.js?v=20261008-structure-v1";
import { initNestRecord } from "./eidolon-records-nest.js?v=20261008-structure-v1";
import { initRiskRecord } from "./eidolon-records-risk.js?v=20261008-structure-v1";

const MODULES=["profile","behavior","nest","engagement"];
export function initEidolonRecords(root,{onTabChange}={}){
  if(!root)return null;
  const buttons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const panels=[...root.querySelectorAll("[data-ei-panel]")];
  if(!buttons.length||!panels.length)return null;
  const aborter=new AbortController(),signal=aborter.signal;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const profile=initProfileRecord(root,{reduced,signal});
  const behavior=initBehaviorRecord(root,{reduced,signal});
  const nest=initNestRecord(root,{reduced,signal});
  const risk=initRiskRecord(root,{reduced,signal});

  function setTab(key,{silent=false}={}){
    if(!MODULES.includes(key))return;
    root.dataset.eiTab=key;
    buttons.forEach(button=>{
      const active=button.dataset.eiTabBtn===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });
    panels.forEach(panel=>panel.classList.toggle("active",panel.dataset.eiPanel===key));
    if(key==="profile")requestAnimationFrame(profile.runIdentification);
    if(key==="behavior")requestAnimationFrame(behavior.runTrace);
    else behavior.cancel();
    if(key==="nest")requestAnimationFrame(()=>nest.scanNest());
    else nest.cancel();
    if(!silent)onTabChange?.(key);
  }
  buttons.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.eiTabBtn),{signal}));
  root.addEventListener("eidolon:class-risk",event=>{
    risk.setBaseline(event.detail);
    profile.syncIdentification(event.detail);
  },{signal});
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab,destroy(){
    aborter.abort();
    profile.destroy();behavior.destroy();nest.destroy();risk.destroy();
  }};
}
