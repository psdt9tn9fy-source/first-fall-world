/* Operation-risk matrix: D-S baselines plus nonstandard SERAPH state. */
const riskCopy={D:{tier:"ROUTINE ALERT",directive:"LOCAL READINESS",body:"일반 경계 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[22,18,12]},C:{tier:"LOCAL ENGAGEMENT",directive:"LIMITED FORCE RESPONSE",body:"소규모 교전 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",meters:[38,30,22]},B:{tier:"TACTICAL RESPONSE",directive:"TACTICAL FORCE DEPLOYMENT",body:"중형 네스트 또는 강력한 개체 대응에 사용되는 작전 위험도.",meters:[58,52,45]},A:{tier:"MAJOR FRONT",directive:"LARGE-SCALE OPERATION",body:"대규모 전선 또는 대형 네스트 공략 수준의 작전 위험도.",meters:[78,74,68]},S:{tier:"STRATEGIC / JOINT",directive:"STRATEGIC · JOINT RESPONSE",body:"ARK 또는 국가존망급 위협에 대응하는 최고 작전위험도. 전략전력과 국제공동작전이 요구될 수 있다.",meters:[100,96,100]}};

export function initRiskRecord(root,{reduced,signal}){
  const threatMatrix=root.querySelector("[data-ei-threat-matrix]");
  const threatTier=root.querySelector("#eiRiskTier");
  const threatDirective=root.querySelector("#eiRiskDirective");
  const viewRiskLabel=root.querySelector("[data-ei-view-risk]");
  const baselineLabel=root.querySelector("[data-ei-baseline-risk]");
  const riskDetailCode=root.querySelector("#eiRiskDetailCode");
  const riskDetailBody=root.querySelector("#eiRiskDetailBody");
  const riskButtons=[...root.querySelectorAll(".ei-threat-matrix [data-ei-risk]")];
  let breachToken=0;
  const meterElements=["threat","force","coord"].map(name=>threatMatrix?.querySelector(`[data-meter="${name}"]`));
  function renderRiskMeters(values){
    meterElements.forEach((meter,index)=>{
      if(meter)meter.style.width=`${values[index]}%`;
    });
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
      // Lack of verified data is not a maximum measured reading.
      renderRiskMeters([0,0,0]);
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


  riskButtons.forEach(button=>button.addEventListener("click",()=>{
    if(root.classList.contains("ei-seraph-risk"))return;
    viewRisk(button.dataset.eiRisk);
  },{signal}));
  const initialKey=root.classList.contains("risk-unbounded")?"UNBOUNDED":(root.querySelector(".ei-risk-scale span.active")?.dataset.risk||"B");
  const initialName=root.querySelector('[data-ei-field="name"]')?.textContent||"ENTITY";
  setBaseline({key:initialKey,name:initialName});
  return {setBaseline,destroy(){breachToken++}};
}
