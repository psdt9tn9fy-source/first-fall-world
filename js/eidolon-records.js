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
  const threatMatrix=root.querySelector("[data-ei-threat-matrix]");
  const threatTier=root.querySelector("#eiRiskTier");
  const threatDirective=root.querySelector("#eiRiskDirective");
  const viewRiskLabel=root.querySelector("[data-ei-view-risk]");
  const baselineLabel=root.querySelector("[data-ei-baseline-risk]");
  const riskDetailCode=root.querySelector("#eiRiskDetailCode");
  const riskDetailBody=root.querySelector("#eiRiskDetailBody");
  const riskButtons=[...root.querySelectorAll(".ei-threat-matrix [data-ei-risk]")];
  const riskCopy={D:{tier:"ROUTINE ALERT",directive:"LOCAL READINESS",body:"일반 경계 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[22,18,12]},C:{tier:"LOCAL ENGAGEMENT",directive:"LIMITED FORCE RESPONSE",body:"소규모 교전 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[38,30,22]},B:{tier:"TACTICAL RESPONSE",directive:"TACTICAL FORCE DEPLOYMENT",body:"중형 네스트 또는 강력한 개체 대응에 사용되는 작전 위험도.",meters:[58,52,45]},A:{tier:"MAJOR FRONT",directive:"LARGE-SCALE OPERATION",body:"대규모 전선 또는 대형 네스트 공략 수준의 작전 위험도.",meters:[78,74,68]},S:{tier:"STRATEGIC / JOINT",directive:"STRATEGIC · JOINT RESPONSE",body:"ARK·SERAPH 또는 국가존망급 위협에 대응하는 최고 작전위험도. 전략전력과 국제공동작전이 요구될 수 있다.",meters:[100,96,100]}};
  let traceToken=0,nestToken=0,baselineRisk="B",breachToken=0;
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

  function viewRisk(key="B"){
    const data=riskCopy[key]||riskCopy.B;if(!threatMatrix)return;
    threatMatrix.dataset.viewRisk=key;
    riskButtons.forEach(button=>button.classList.toggle("active",button.dataset.eiRisk===key));
    if(riskDetailCode)riskDetailCode.textContent=`RISK ${key}`;
    if(viewRiskLabel)viewRiskLabel.textContent=`${key} // ${data.tier}`;
    if(riskDetailBody)riskDetailBody.textContent=data.body;
    if(threatTier)threatTier.textContent=data.tier;
    if(threatDirective)threatDirective.textContent=data.directive;
    ["threat","force","coord"].forEach((name,index)=>{const meter=threatMatrix.querySelector(`[data-meter="${name}"]`);if(meter)meter.style.width=`${data.meters[index]}%`});
  }

  function setBaseline(detail={}){
    const unbounded=detail.key==="UNBOUNDED";
    const key=unbounded?"S":(riskCopy[detail.key]?detail.key:"B");
    baselineRisk=unbounded?"UNBOUNDED":key;
    root.classList.toggle("ei-seraph-risk",unbounded);
    if(baselineLabel)baselineLabel.textContent=unbounded?"UNBOUNDED // SERAPH":key+" // "+(detail.name||"ENTITY");
    riskButtons.forEach(button=>{
      button.classList.toggle("baseline",!unbounded&&button.dataset.eiRisk===key);
      let tag=button.querySelector("strong");
      if(!unbounded&&button.dataset.eiRisk===key){if(!tag){tag=document.createElement("strong");button.appendChild(tag)}tag.textContent="BASE"}
      else tag?.remove();
    });
    if(unbounded){
      const token=++breachToken;
      viewRisk("S");
      threatMatrix?.classList.remove("breaching","breached");
      requestAnimationFrame(()=>threatMatrix?.classList.add("breaching"));
      setTimeout(()=>{
        if(token!==breachToken)return;
        threatMatrix?.classList.remove("breaching");threatMatrix?.classList.add("breached");
        if(riskDetailCode)riskDetailCode.textContent="UNBOUNDED";
        if(threatTier)threatTier.textContent="STANDARD SCALE // NOT APPLICABLE";
        if(threatDirective)threatDirective.textContent="NO STANDARD PROTOCOL";
        if(riskDetailBody)riskDetailBody.textContent="SERAPH는 표준 D–S 작전위험도 규격 밖의 예외 개체로 취급된다.";
        if(viewRiskLabel)viewRiskLabel.textContent="SCALE EXCEEDED";
      },reduced?0:850);
    }else{
      ++breachToken;threatMatrix?.classList.remove("breaching","breached");viewRisk(key);
    }
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
  root.addEventListener("eidolon:nest-change",event=>scanNest(event.detail?.key||root.dataset.eiNest||"small"));
  riskButtons.forEach(button=>button.addEventListener("click",()=>viewRisk(button.dataset.eiRisk)));
  root.addEventListener("eidolon:class-risk",event=>setBaseline(event.detail));
  const initialKey=root.classList.contains("risk-unbounded")?"UNBOUNDED":(root.querySelector(".ei-risk-scale span.active")?.dataset.risk||"B");
  const initialName=root.querySelector("[data-ei-field=\"name\"]")?.textContent||"ENTITY";
  setBaseline({key:initialKey,name:initialName});
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab};
}
