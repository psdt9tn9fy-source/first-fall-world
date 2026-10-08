const MODULES=["profile","behavior","nest","engagement"];
const riskCopy={D:{tier:"ROUTINE ALERT",directive:"LOCAL READINESS",body:"일반 경계 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[22,18,12]},C:{tier:"LOCAL ENGAGEMENT",directive:"LIMITED FORCE RESPONSE",body:"소규모 교전 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[38,30,22]},B:{tier:"TACTICAL RESPONSE",directive:"TACTICAL FORCE DEPLOYMENT",body:"중형 네스트 또는 강력한 개체 대응에 사용되는 작전 위험도.",meters:[58,52,45]},A:{tier:"MAJOR FRONT",directive:"LARGE-SCALE OPERATION",body:"대규모 전선 또는 대형 네스트 공략 수준의 작전 위험도.",meters:[78,74,68]},S:{tier:"STRATEGIC / JOINT",directive:"STRATEGIC · JOINT RESPONSE",body:"ARK 또는 국가존망급 위협에 대응하는 최고 작전위험도. 전략전력과 국제공동작전이 요구될 수 있다.",meters:[100,96,100]}};


export function initEidolonRecords(root,{onTabChange}={}){
  if(!root)return null;
  const buttons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const panels=[...root.querySelectorAll("[data-ei-panel]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ident=root.querySelector("[data-ei-ident-matrix]");
  const identStatus=root.querySelector("[data-ei-profile-status]");
  const identResult=root.querySelector("[data-ei-ident-result]");
  const identRows=[...root.querySelectorAll("[data-ident-row]")];
  const rescan=root.querySelector("[data-ei-rescan]");
  const correlation=root.querySelector("[data-ei-correlation]");
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
  let traceToken=0,nestToken=0,breachToken=0,identToken=0;
  if(!buttons.length||!panels.length)return null;
  const aborter=new AbortController();
  const signal=aborter.signal;
  // Standard and SERAPH risks share the same cached meter elements.
  const meterElements=["threat","force","coord"].map(name=>threatMatrix?.querySelector(`[data-meter="${name}"]`));
  function renderRiskMeters(values){
    meterElements.forEach((meter,index)=>{
      if(meter)meter.style.width=`${values[index]}%`;
    });
  }

  function runIdentification(){
    if(!ident)return;
    const token=++identToken;
    const seraph=root.dataset.eiClass==="seraph";
    ident.classList.remove("locked","outlier");
    identRows.forEach(row=>row.classList.remove("resolved"));
    if(identStatus)identStatus.textContent="ACQUIRING";
    if(identResult)identResult.textContent="TARGET ACQUISITION";
    if(correlation)correlation.textContent="CORRELATING";
    const finish=()=>{
      if(token!==identToken)return;
      ident.classList.add("locked");
      if(seraph)ident.classList.add("outlier");
      identRows.forEach(row=>row.classList.add("resolved"));
      if(identStatus)identStatus.textContent=seraph?"INCONCLUSIVE":"VERIFIED";
      if(identResult)identResult.textContent=seraph?"IDENTIFICATION INCOMPLETE":"IDENTIFICATION CONFIRMED";
      if(correlation)correlation.textContent=seraph?"INSUFFICIENT // OUTLIER":"HIGH // VERIFIED";
    };
    if(reduced)finish();else setTimeout(finish,920);
  }

  function syncIdentification(detail={}){
    const seraph=(detail.classKey||root.dataset.eiClass)==="seraph";
    const mark=detail.mark||root.querySelector("[data-ei-profile-mark]")?.textContent||"?";
    const name=detail.name||root.querySelector("[data-ei-profile-name]")?.textContent||"UNKNOWN";
    const cls=root.querySelector('[data-ident="class"]');
    const scale=root.querySelector('[data-ident="scale"]');
    const role=root.querySelector('[data-ident="role"]');
    if(cls)cls.textContent=seraph?"? // SERAPH":mark+" // "+name;
    if(scale)scale.textContent=seraph?"VARIABLE / UNKNOWN":(root.querySelector('[data-ei-field="scale"]')?.textContent||"VARIABLE");
    if(role)role.textContent=seraph?"OUTLIER / UNIQUE CAPABILITY":(root.querySelector('[data-ei-field="role"]')?.textContent||"UNRESOLVED");
    runIdentification();
  }

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
    renderRiskMeters(data.meters);
  }

  function setBaseline(detail={}){
    const unbounded=detail.key==="UNBOUNDED"||detail.key==="측정 불가"||detail.classKey==="seraph";
    const key=unbounded?"S":(riskCopy[detail.key]?detail.key:"B");
    root.classList.toggle("ei-seraph-risk",unbounded);
    if(baselineLabel)baselineLabel.textContent=unbounded?"측정 불가 // SERAPH":key+" // "+(detail.name||"ENTITY");
    riskButtons.forEach(button=>{
      button.classList.toggle("baseline",!unbounded&&button.dataset.eiRisk===key);
      let tag=button.querySelector("strong");
      if(!unbounded&&button.dataset.eiRisk===key){if(!tag){tag=document.createElement("strong");button.appendChild(tag)}tag.textContent="BASE"}
      else tag?.remove();
    });
    if(unbounded){
      const token=++breachToken;
      if(threatMatrix)threatMatrix.dataset.viewRisk="UNBOUNDED";
      riskButtons.forEach(button=>button.classList.remove("active"));
      renderRiskMeters(riskCopy.S.meters);
      if(riskDetailCode)riskDetailCode.textContent="측정 불가";
      if(threatTier)threatTier.textContent="표준 등급 적용 불가";
      if(threatDirective)threatDirective.textContent="별도 대응 프로토콜";
      if(riskDetailBody)riskDetailBody.textContent="세라프는 표준 D–S 작전위험도 규격 밖의 규격외 개체다.";
      if(viewRiskLabel)viewRiskLabel.textContent="측정 불가 // 표준 초과";
      threatMatrix?.classList.remove("breaching","breached");
      requestAnimationFrame(()=>threatMatrix?.classList.add("breaching"));
      setTimeout(()=>{
        if(token!==breachToken)return;
        threatMatrix?.classList.remove("breaching");
        threatMatrix?.classList.add("breached");
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
    if(key==="profile")requestAnimationFrame(runIdentification);
    if(key==="behavior")requestAnimationFrame(runTrace);
    else traceToken++;
    if(key==="nest")requestAnimationFrame(()=>scanNest());
    else nestToken++;
    if(!silent)onTabChange?.(key);
  }

  buttons.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.eiTabBtn),{signal}));
  rescan?.addEventListener("click",runIdentification,{signal});
  traceRun?.addEventListener("click",runTrace,{signal});
  nestScan?.addEventListener("click",()=>scanNest(),{signal});
  root.addEventListener("eidolon:nest-change",event=>scanNest(event.detail?.key||root.dataset.eiNest||"small"),{signal});
  riskButtons.forEach(button=>button.addEventListener("click",()=>{
    if(root.classList.contains("ei-seraph-risk"))return;
    viewRisk(button.dataset.eiRisk);
  },{signal}));
  root.addEventListener("eidolon:class-risk",event=>{setBaseline(event.detail);syncIdentification(event.detail)},{signal});
  const initialKey=root.classList.contains("risk-unbounded")?"UNBOUNDED":(root.querySelector(".ei-risk-scale span.active")?.dataset.risk||"B");
  const initialName=root.querySelector("[data-ei-field=\"name\"]")?.textContent||"ENTITY";
  setBaseline({key:initialKey,name:initialName});
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab,destroy(){aborter.abort();traceToken++;nestToken++;breachToken++;identToken++}};
}
