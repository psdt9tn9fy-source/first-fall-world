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
  const nestTopology=root.querySelector("[data-ei-nest-topology]");
  const nestStatus=root.querySelector("[data-ei-nest-status]");
  const nestCore=root.querySelector("[data-ei-nest-core]");
  const nestScan=root.querySelector("[data-ei-scan-nest]");
  const nestButtons=[...root.querySelectorAll("[data-ei-nest]")];
  let traceToken=0,nestToken=0;
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

  function scanNest(level=root.dataset.eiNest||"small"){
    if(!nestTopology)return;
    const token=++nestToken;
    nestTopology.dataset.level=level;
    nestTopology.classList.remove("scanned");
    nestTopology.classList.add("scanning");
    if(nestStatus)nestStatus.textContent="MAPPING";
    if(nestCore)nestCore.textContent=level.toUpperCase();
    const finish=()=>{if(token!==nestToken)return;nestTopology.classList.remove("scanning");nestTopology.classList.add("scanned");if(nestStatus)nestStatus.textContent="LINKED"};
    if(reduced)finish();else setTimeout(finish,1150);
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
    if(key==="nest")requestAnimationFrame(()=>scanNest());
    else nestToken++;
    if(!silent)onTabChange?.(key);
  }

  buttons.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.eiTabBtn)));
  traceRun?.addEventListener("click",runTrace);
  nestScan?.addEventListener("click",()=>scanNest());
  nestButtons.forEach(button=>button.addEventListener("click",()=>setTimeout(()=>scanNest(button.dataset.eiNest),0)));
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab};
}
