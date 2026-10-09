/* SERAPH records: evidence display and exceptions to normal class-specific telemetry. */
const EVIDENCE={
  form:{
    code:"TESTIMONY // 01",
    state:"증언 기반 / 검증 불가",
    title:"사람과 닮은 형태",
    body:"인간과 비슷한 크기의 형상이 보고되었으나 검증된 촬영 원본이나 확보된 실물 표본은 없다. 화면의 실루엣은 목격 기록을 토대로 한 참고 재구성이다."
  },
  contact:{
    code:"TESTIMONY // 02",
    state:"서술 단편 / 교차 검증 불가",
    title:"의사소통 여부 미확인",
    body:"일부 기록에는 인간의 언어나 의도를 이해하는 듯한 정황이 언급된다. 그러나 의사소통 방식, 의도, 다른 개체와의 관계를 확정할 검증 자료는 없다."
  },
  combat:{
    code:"TESTIMONY // 03",
    state:"교전 자료 부족",
    title:"전투 패턴 비교 불가",
    body:"일반 에이돌론에서 관측된 학습·공유·적응 과정이 세라프에도 동일하게 적용되는지 확인되지 않았다. 추정한 능력을 사실처럼 기록하지 않는다."
  }
};
const SERAPH_TAB_LABELS={
  profile:"01 // 개체 정보",behavior:"02 // 목격 기록",
  nest:"03 // 네스트 연관",engagement:"04 // 위험 판정"
};
export function initSeraphRecords(root,{signal,reduced=false}={}){
  const consoleHeader=root.querySelector(".ei-record-console > header em");
  const originalHeader=consoleHeader?.textContent||"";
  const tabButtons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const originalLabels=new Map(tabButtons.map(button=>[button,button.textContent]));
  const buttons=[...root.querySelectorAll("[data-ei-seraph-evidence]")];
  const details=root.querySelector("[data-ei-seraph-evidence-detail]");
  const nodes={
    code:root.querySelector("[data-ei-seraph-evidence-code]"),
    state:root.querySelector("[data-ei-seraph-evidence-state]"),
    title:root.querySelector("[data-ei-seraph-evidence-title]"),
    body:root.querySelector("[data-ei-seraph-evidence-body]")
  };
  let active=false,interferenceTimer=0;
  function clearInterference(){
    clearTimeout(interferenceTimer);
    details?.classList.remove("ei-seraph-interference");
  }
  function selectEvidence(key,{animate=true}={}){
    const value=EVIDENCE[key]||EVIDENCE.form;
    buttons.forEach(button=>{
      const selected=button.dataset.eiSeraphEvidence===key;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    if(nodes.code)nodes.code.textContent=value.code;
    if(nodes.state)nodes.state.textContent=value.state;
    if(nodes.title)nodes.title.textContent=value.title;
    if(nodes.body)nodes.body.textContent=value.body;
    clearInterference();
    if(active&&animate&&!reduced&&details){
      void details.offsetWidth;
      details.classList.add("ei-seraph-interference");
      interferenceTimer=setTimeout(clearInterference,460);
    }
  }
  function setClass(key){
    active=key==="seraph";
    if(consoleHeader)consoleHeader.textContent=active?"규격외 // 단편 기록":originalHeader;
    tabButtons.forEach(button=>button.textContent=active?(SERAPH_TAB_LABELS[button.dataset.eiTabBtn]||originalLabels.get(button)):originalLabels.get(button));
    if(!active)clearInterference();
  }
  function setTab(key){
    if(active&&key==="behavior")selectEvidence(root.querySelector("[data-ei-seraph-evidence].active")?.dataset.eiSeraphEvidence||"form",{animate:false});
    else clearInterference();
  }
  buttons.forEach(button=>button.addEventListener("click",()=>selectEvidence(button.dataset.eiSeraphEvidence),{signal}));
  selectEvidence("form",{animate:false});
  setClass(root.dataset.eiClass||"brute");
  return {setClass,setTab,destroy:clearInterference};
}
