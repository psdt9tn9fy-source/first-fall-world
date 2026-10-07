const MODULES=["profile","behavior","nest","engagement"];

export function initEidolonRecords(root,{onTabChange}={}){
  if(!root)return null;
  const buttons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const panels=[...root.querySelectorAll("[data-ei-panel]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const trace=root.querySelector("[data-ei-adaptation-trace]");
  const traceStatus=root.querySelector("[data-ei-trace-status]");
  const traceNodes=[...root.querySelectorAll("[data-ei-trace-node]")];
  const traceRun=root.querySelector("[data-ei-run-trace]");
  let traceToken=0;
  if(!buttons.length||!panels.length)return null;

  function runTrace(){
    if(!trace)return;
    const token=++traceToken;
    trace.classList.remove("complete");
    trace.classList.add("running");
    traceNodes.forEach(node=>node.classList.remove("active"));
    if(traceStatus)traceStatus.textContent="ACQUIRING";
    if(reduced){
      traceNodes.forEach(node=>node.classList.add("active"));
      trace.classList.remove("running");trace.classList.add("complete");
      if(traceStatus)traceStatus.textContent="ADAPTED";
      return;
    }
    traceNodes.forEach((node,index)=>setTimeout(()=>{if(token!==traceToken)return;node.classList.add("active");if(index===traceNodes.length-1){trace.classList.remove("running");trace.classList.add("complete");if(traceStatus)traceStatus.textContent="ADAPTED"}},180+index*360));
  }

  function setTab(key,{silent=false}={}){
    if(!MODULES.includes(key))return;
    root.dataset.eiTab=key;
    buttons.forEach(button=>{
      const active=button.dataset.eiTabBtn===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });
    panels.forEach(panel=>panel.classList.toggle("active",panel.dataset.eiPanel===key));
    if(key==="behavior")requestAnimationFrame(runTrace);
    else traceToken++;
    if(!silent)onTabChange?.(key);
  }

  buttons.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.eiTabBtn)));
  traceRun?.addEventListener("click",runTrace);
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab};
}
