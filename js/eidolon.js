const CLASSES=[
  {key:"swarm",mark:"I",name:"SWARM",ko:"스웜",scale:"SMALL / MASS-PRODUCED",role:"RECON / INFILTRATION / GROUP COMBAT",brief:"소형 양산형. 정찰·침투·집단전에 특화된 기본 분류.",risk:"CONTEXTUAL",riskKey:""},
  {key:"hunter",mark:"II",name:"HUNTER",ko:"헌터",scale:"MEDIUM",role:"TRACKING / CLOSE QUARTERS / URBAN",brief:"중형 추적개체. 근접전과 도심전에서 높은 위협을 보이는 분류.",risk:"CONTEXTUAL",riskKey:""},
  {key:"brute",mark:"III",name:"BRUTE",ko:"브루트",scale:"TANK-CLASS",role:"HEAVY ARMOR / DIRECT ASSAULT",brief:"전차급 중장갑 개체. 강한 장갑과 직접적인 전투압력을 특징으로 하는 분류.",risk:"CONTEXTUAL",riskKey:""},
  {key:"dominion",mark:"IV",name:"DOMINION",ko:"도미니언",scale:"COMMAND TYPE",role:"COMMAND / TACTICAL CONTROL",brief:"주변 개체와 전술을 통제하는 지휘형. 단독 전투력뿐 아니라 전장 전체에 영향을 준다.",risk:"CONTEXTUAL",riskKey:""},
  {key:"ark",mark:"V",name:"ARK",ko:"아크",scale:"TENS–HUNDREDS M",role:"STRATEGIC ENTITY / CITY-LEVEL THREAT",brief:"수십~수백 m급 전략개체. 도시급 위협으로 분류되며 S급 작전위험 대응 대상이 될 수 있다.",risk:"S PROTOCOL",riskKey:"S"},
  {key:"seraph",mark:"?",name:"SERAPH",ko:"세라프",scale:"VARIABLE / UNKNOWN",role:"OUTLIER / UNIQUE CAPABILITY",brief:"기존 I~V 등급 밖의 희귀 특이개체. 고유 능력과 압도적 전투력을 가지며 일부는 인간의 언어·사고를 이해하는 정황이 있다.",risk:"S PROTOCOL",riskKey:"S"}
];

const NESTS={
  small:{code:"N-01",name:"SMALL NEST",ko:"소형 네스트",sub:"RECON / WATCH / SUPPLY OUTPOST",body:"정찰·감시·보급을 위한 전초기지 성격의 네스트. 방치될 경우 중형 네스트로 성장할 수 있다."},
  medium:{code:"N-02",name:"MEDIUM NEST",ko:"중형 네스트",sub:"REGIONAL CONTROL / PRODUCTION",body:"도시권이나 전략지역을 통제하는 반거점. 혼합 에이돌론 전력과 생산·수리 기능을 갖춘다."},
  grand:{code:"N-03",name:"GRAND NEST",ko:"대형 네스트",sub:"REGIONAL FRONT HUB / STRATEGIC",body:"광역 전선을 지배하는 초대형 거점. 주변 네스트에 병력과 정보를 공급하며 국가급 또는 I.D.A. 연합작전이 요구될 수 있다."}
};

const RISKS={
  D:"일반 경계 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",
  C:"소규모 교전 단계. D~C는 일반 경계·소규모 교전 범주의 작전 위험도다.",
  B:"중형 네스트 또는 강력한 개체 대응에 사용되는 작전 위험도.",
  A:"대규모 전선 또는 대형 네스트 공략 수준의 작전 위험도.",
  S:"ARK·SERAPH 또는 국가존망급 위협에 대응하는 최고 작전위험도. 전략전력과 국제공동작전이 요구될 수 있다."
};

export function initEidolon(){
  const root=document.querySelector("#eidolonLab");
  if(!root)return;

  const classButtons=[...root.querySelectorAll("[data-ei-class-btn]")];
  const tabButtons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const panels=[...root.querySelectorAll("[data-ei-panel]")];
  const focusButtons=[...root.querySelectorAll("[data-ei-focus]")];
  const nestButtons=[...root.querySelectorAll("[data-ei-nest]")];
  const riskButtons=[...root.querySelectorAll("[data-ei-risk]")];
  const scanner=root.querySelector("#eiScanner");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let classIndex=2,scanTimer=0,pointerX=null;
  let threeDModulePromise=null,threeDController=null;

  const q=id=>root.querySelector(id);
  const field=(name,value)=>root.querySelectorAll('[data-ei-field="'+name+'"]').forEach(el=>el.textContent=value);
  const current=()=>CLASSES[classIndex];

  function load3DController(){
    if(threeDController)return Promise.resolve(threeDController);
    if(threeDModulePromise)return threeDModulePromise;
    threeDModulePromise=import("./eidolon-3d.js?v=20261007-3d-isolation-1").then(mod=>{
      threeDController=mod.initEidolon3D(root,{reduced});
      threeDController.setClass(current().key);
      return threeDController;
    }).catch(error=>{
      console.warn("EIDOLON 3D unavailable; continuing with 2D fallback.",error);
      threeDModulePromise=null;
      return null;
    });
    return threeDModulePromise;
  }

  function sync3D(){
    threeDController?.setClass(current().key);
    const view=root.closest(".view");
    if(current().key==="brute"&&view?.classList.contains("active"))load3DController();
  }

  function setRiskScale(key=""){
    root.querySelectorAll(".ei-risk-scale span").forEach(el=>el.classList.toggle("active",el.dataset.risk===key));
    root.classList.toggle("risk-s",key==="S");
  }

  function focusAnalysis(type){
    const c=current();
    focusButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiFocus===type));
    const title=q("#eiFocusTitle"),body=q("#eiFocusBody"),meta=q("#eiFocusMeta");
    if(type==="core"){
      title.textContent="CORE";
      meta.textContent="POWER / COMPUTE / NEURAL";
      body.textContent="코어는 동력원·연산장치·신경중추 역할을 겸한다. 일부 개체는 외형이 파괴되어도 코어가 온전하면 재가동할 수 있다.";
    }else if(type==="network"){
      title.textContent="ADAPTIVE NETWORK";
      meta.textContent="COMBAT DATA / SHARED LEARNING";
      body.textContent="에이돌론은 인간의 무기와 전술을 학습하고 전투정보를 공유한다. 반복되는 전술은 시간이 지날수록 효과가 떨어질 수 있다.";
    }else{
      title.textContent="MORPHOLOGY";
      meta.textContent=c.scale+" // "+c.role;
      body.textContent=c.brief+" 형태와 크기는 개체마다 다양하며 이 화면은 분류 참고용 개념 스캔이다.";
    }
  }

  function pulseScan(){
    if(reduced)return;
    clearTimeout(scanTimer);
    root.classList.remove("scanning");void root.offsetWidth;root.classList.add("scanning");
    scanTimer=setTimeout(()=>root.classList.remove("scanning"),480);
  }

  function selectClass(key,{animate=true}={}){
    const next=CLASSES.findIndex(c=>c.key===key);
    if(next<0)return;
    classIndex=next;
    const c=current();
    root.dataset.eiClass=c.key;
    root.classList.toggle("seraph-mode",c.key==="seraph");
    classButtons.forEach(b=>{
      const active=b.dataset.eiClassBtn===c.key;
      b.classList.toggle("active",active);
      b.setAttribute("aria-selected",String(active));
    });
    field("mark",c.mark);
    field("name",c.name);
    field("ko",c.ko);
    field("scale",c.scale);
    field("role",c.role);
    field("risk",c.risk);
    q("#eiProfileTitle").textContent=c.mark+" // "+c.name;
    q("#eiProfileBody").textContent=c.brief;
    q("#eiBehaviorClass").textContent=c.name+" // "+c.role;
    q("#eiSeraphNotice").hidden=c.key!=="seraph";
    q("#eiTaxonomyState").textContent=c.key==="seraph"?"STANDARD TAXONOMY // NOT APPLICABLE":"PUBLIC TAXONOMY // CLASS VERIFIED";
    setRiskScale(c.riskKey);
    focusAnalysis("morphology");
    sync3D();
    if(animate)pulseScan();
  }

  function stepClass(delta){
    classIndex=Math.max(0,Math.min(CLASSES.length-1,classIndex+delta));
    selectClass(CLASSES[classIndex].key);
  }

  function setTab(key){
    root.dataset.eiTab=key;
    tabButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiTabBtn===key));
    panels.forEach(p=>p.classList.toggle("active",p.dataset.eiPanel===key));
  }

  function setNest(key){
    const n=NESTS[key];if(!n)return;
    nestButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiNest===key));
    q("#eiNestCode").textContent=n.code;
    q("#eiNestTitle").textContent=n.name;
    q("#eiNestKo").textContent=n.ko;
    q("#eiNestSub").textContent=n.sub;
    q("#eiNestBody").textContent=n.body;
    root.dataset.eiNest=key;
  }

  function setRisk(key){
    if(!RISKS[key])return;
    riskButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiRisk===key));
    q("#eiRiskDetailCode").textContent="RISK "+key;
    q("#eiRiskDetailBody").textContent=RISKS[key];
  }

  function setSource(detail){
    const source=q("#eiSource"),body=q("#eiSourceBody");
    if(!detail?.id){
      source.textContent="SOURCE // GENERAL TAXONOMY";
      body.textContent="PUBLIC CLASSIFICATION RECORD";
      return;
    }
    source.textContent="SOURCE // WORLD LINK // "+detail.id;
    body.textContent=(detail.name||detail.ko||"BLACK ZONE")+" // LOCAL COMPOSITION NOT PUBLICLY INDEXED";
    root.classList.add("source-linked");
  }

  classButtons.forEach(b=>b.addEventListener("click",()=>selectClass(b.dataset.eiClassBtn)));
  tabButtons.forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.eiTabBtn)));
  focusButtons.forEach(b=>b.addEventListener("click",()=>focusAnalysis(b.dataset.eiFocus)));
  nestButtons.forEach(b=>b.addEventListener("click",()=>setNest(b.dataset.eiNest)));
  riskButtons.forEach(b=>b.addEventListener("click",()=>setRisk(b.dataset.eiRisk)));

  scanner.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();stepClass(-1)}
    if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();stepClass(1)}
  });
  scanner.addEventListener("pointerdown",e=>{if(e.target.closest?.(".ei-model-stage"))return;pointerX=e.clientX;scanner.setPointerCapture?.(e.pointerId)});
  scanner.addEventListener("pointerup",e=>{
    if(pointerX===null)return;
    const dx=e.clientX-pointerX;pointerX=null;
    if(Math.abs(dx)>52)stepClass(dx<0?1:-1);
  });

  window.addEventListener("archive:eidolon-context",e=>setSource(e.detail));
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="eidolon"){setTimeout(pulseScan,90);sync3D()}});

  selectClass("brute",{animate:false});
  setTab("profile");
  setNest("small");
  setRisk("D");
}
