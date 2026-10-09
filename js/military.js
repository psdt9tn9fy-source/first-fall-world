/* Generic 2134 military hierarchy. Individual countries may use different titles. */
const MODES={
  command:{kick:"지휘 권한 흐름",title:"전략 지휘망",read:"지휘체계",body:"국가 지휘부에서 합동지휘부·작전사령부·현장지휘부를 거쳐 개별 부대로 이어지는 예시 지휘 구조다. 세부 편제와 명칭은 국가마다 다르다.",facts:["전략 → 현장","5단계 지휘 구조","국가별 상이"],labels:["범위","구조","적용"]},
  structure:{kick:"조직 계층",title:"군 조직 구조",read:"군 조직",body:"각국은 독립된 군사제도와 편제를 유지한다. 장교·부사관·병의 역할과 지휘권은 계층적으로 구분되며 전시 편제는 국가와 전선에 따라 달라진다.",facts:["장교 / 부사관 / 병","국가별 체계","국가별 상이"],labels:["구성","운용","기준"]},
  force:{kick:"전투 전력 구성",title:"병과 전력망",read:"전력 구조",body:"100년이 넘는 전쟁 동안 각국은 환경과 산업기반에 맞는 전투교리를 발전시켰다. 전력 구성과 주력 병과는 국가별로 서로 다르다.",facts:["다병과 통합","국가별 교리","적응형"],labels:["구성","운용","특징"]},
  rank:{kick:"지휘 권한",title:"계급 체계",read:"계급과 경력",body:"군 경력과 계급은 장기전 사회에서 강한 경력 자산이다. 병에서 부사관으로 이어지는 진급 경로가 존재하며 장교 교육기관의 위상도 높다.",facts:["장교 / 부사관 / 병","경력 경로","사회적 경력 자산"],labels:["구성","경로","특징"]},
  deployment:{kick:"작전 절차",title:"전개 흐름",read:"전개 절차",body:"작전은 지휘·정보·전력의 연결을 통해 수행된다. 실제 대응 규모와 절차는 전선, 적 개체, 네스트 규모와 작전 위험도에 따라 달라진다.",facts:["지휘부 → 현장","상황별 조정","전쟁 중"],labels:["범위","운용","상태"]}
};
const COMMAND_LEVELS=[
  {key:"national",title:"국가 지휘부",body:"국가의 전쟁 목표와 방위 정책을 정하고, 전략적 우선순위와 군사력 운용 방향을 결정한다. 민간정부와 군의 권한 관계는 국가별로 다르다.",facts:["국가 전략","정책·우선순위 결정","합동지휘부"]},
  {key:"joint",title:"합동지휘부",body:"육·해·공 등 여러 군종의 전력을 연계하고, 국가 차원의 방위 지침을 공동작전 계획으로 구체화한다.",facts:["통합 지휘","군종 간 전력 조정","작전사령부"]},
  {key:"operations",title:"작전사령부",body:"담당 작전 구역의 부대 운용을 조정하고, 합동 지침을 전선별 작전 임무로 전환한다. 각국의 명칭과 편제는 다를 수 있다.",facts:["작전 구역","작전 계획·통제","현장지휘부"]},
  {key:"front",title:"현장지휘부",body:"전선의 변화와 적성 개체의 위협을 반영해 현장 임무를 조정하고, 예하 부대에 작전 지시를 전달한다.",facts:["현장 전술","임무 배분·상황 통제","개별 부대"]},
  {key:"unit",title:"개별 부대",body:"정찰·방어·기동·지원 등의 현장 임무를 수행하고, 전투 상황과 필요한 지원 정보를 상급 지휘부에 보고한다.",facts:["임무 수행","현장 대응·보고","상급 지휘부"]}
];

/* Representative formations only: actual hierarchies differ by country. */
const FORMATIONS={
  land:{name:"지상군",levels:[
    {name:"군단",brief:"광역 작전",body:"여러 사단과 지원 전력을 통합해 넓은 지역의 지상 작전을 수행하는 상위 부대 편제 예시다.",facts:["광역 지상 작전","다수 부대 통합","사단"]},
    {name:"사단",brief:"통합 전투",body:"보병·기갑·포병·지원 병과를 통합 운용하는 지상군의 주요 전투 편제 예시다.",facts:["주요 전투 편제","제병협동 작전","여단·연대"]},
    {name:"여단",brief:"독립 작전",body:"여러 대대와 지원 요소를 편성해 특정 지역에서 독립적 전술 임무를 수행하는 부대 예시다.",facts:["전술 기동 부대","공격·방어·지원","대대"]},
    {name:"대대",brief:"현장 전술",body:"여러 중대와 지원 인원으로 구성되어 현장에서 구체적인 전투 임무를 수행하는 부대 예시다.",facts:["현장 전술 단위","전투 임무 수행","중대"]}
  ]},
  sea:{name:"해상군",levels:[
    {name:"함대",brief:"해역 통제",body:"특정 해역에서 여러 함정과 해상 전력을 통합 운용하는 상위 해군 편제 예시다.",facts:["광역 해역 작전","해상 전력 통합","전단"]},
    {name:"전단",brief:"임무 전력",body:"유사한 작전 목적을 가진 전대와 함정들을 묶어 운용하는 해상 부대 편제 예시다.",facts:["임무 중심 편성","해상 전력 조정","전대"]},
    {name:"전대",brief:"전술 운용",body:"여러 함정 또는 해상 전력을 전술 임무에 맞춰 묶은 부대 편제 예시다.",facts:["해상 전술 단위","함정 공동 운용","개별 함정"]},
    {name:"함정",brief:"현장 작전",body:"임무별 승조원과 장비를 갖추고 경계·호위·전투·지원 등의 해상 임무를 수행한다.",facts:["해상 임무 수행","독립·협동 기동","함정 승조원"]}
  ]},
  air:{name:"항공군",levels:[
    {name:"항공작전부대",brief:"항공 전력 통합",body:"항공 작전 전력을 통합·조정하는 상위 조직의 일반화된 편제 예시다. 실제 명칭과 소속은 국가마다 다르다.",facts:["항공 작전 조정","공중 전력 배분","비행단"]},
    {name:"비행단",brief:"기지·전력 운용",body:"항공기와 정비·지원 기능을 함께 운용하며 항공 전력의 지속적인 작전을 뒷받침하는 편제 예시다.",facts:["항공 전력 운영","기지·지원 통합","비행대대"]},
    {name:"비행대대",brief:"임무 수행",body:"작전 목적에 맞는 항공기와 인력으로 구성되어 구체적인 항공 임무를 담당하는 편제 예시다.",facts:["항공 전투 단위","임무 계획·실행","편대"]},
    {name:"편대",brief:"전술 비행",body:"여러 항공기가 전술 임무를 수행하도록 구성된 비행 단위 예시다. 실제 구성 규모는 운용 방식에 따라 다르다.",facts:["전술 비행 단위","항공기 공동 기동","개별 항공기"]}
  ]}
};
export function initMilitary(){
  const root=document.querySelector("#milCommand");
  if(!root)return;
  const q=selector=>root.querySelector(selector);
  const stage=q(".mil-stage"),network=q("[data-mil-network]"),route=q("[data-mil-route]");
  const buttons=[...root.querySelectorAll("[data-mil-mode]")];
  const nodes=[...root.querySelectorAll("[data-mil-node]")];
  const lines=[...root.querySelectorAll(".mil-line")];
  const factLabels=[...root.querySelectorAll("[data-mil-facts] span")];
  const factValues=[...root.querySelectorAll("[data-mil-facts] b")];
  const branchButtons=[...root.querySelectorAll("[data-mil-branch]")];
  const orgNodes=[...root.querySelectorAll("[data-mil-unit]")];
  const orgNames=[...root.querySelectorAll("[data-mil-org-name]")];
  const orgBriefs=[...root.querySelectorAll("[data-mil-org-brief]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers=new Set();
  let token=0,branchKey="land";
  const schedule=(fn,delay)=>{const id=setTimeout(()=>{timers.delete(id);fn()},delay);timers.add(id)};
  function cancelRoute(){
    token++;
    for(const id of timers)clearTimeout(id);
    timers.clear();
    stage.classList.remove("routing");
    network.classList.remove("signal");
  }
  function renderReadout(title,body,facts,labels,code){
    q("[data-mil-readout-code]").textContent=code;
    q("[data-mil-readout-title]").textContent=title;
    q("[data-mil-readout-body]").textContent=body;
    factValues.forEach((value,i)=>{value.textContent=facts[i]||"—"});
    factLabels.forEach((label,i)=>{label.textContent=labels[i]||"정보"});
  }
  function selectLevel(key,{replay=false}={}){
    const index=COMMAND_LEVELS.findIndex(level=>level.key===key);
    if(index<0)return;
    if(!replay)cancelRoute();
    nodes.forEach(node=>{
      const i=COMMAND_LEVELS.findIndex(level=>level.key===node.dataset.milNode);
      const selected=i===index;
      node.classList.toggle("active",selected);
      node.classList.toggle("passed",i>=0&&i<index);
      node.setAttribute("aria-pressed",String(selected));
    });
    lines.forEach((line,i)=>line.classList.toggle("passed",i<index));
    const level=COMMAND_LEVELS[index];
    renderReadout(level.title,level.body,level.facts,["지휘 범위","주요 역할","연결 계층"],"지휘 단계 // "+String(index+1).padStart(2,"0")+" / 05");
    route.textContent=replay?"지휘 신호 전달 // "+String(index+1).padStart(2,"0"):"선택됨 // "+level.title;
  }
  function selectFormation(index,{replay=false}={}){
    const formation=FORMATIONS[branchKey];
    if(root.dataset.mode!=="structure"||!formation||!formation.levels[index])return;
    if(!replay)cancelRoute();
    const unit=formation.levels[index];
    orgNodes.forEach((node,i)=>{
      node.classList.toggle("active",i===index);
      node.classList.toggle("passed",i<index);
      node.setAttribute("aria-pressed",String(i===index));
    });
    renderReadout(unit.name,unit.body,unit.facts,["편제 규모","주요 임무","하위 단위"],
      formation.name+" // "+String(index+1).padStart(2,"0")+" / 04");
    route.textContent=replay?"편제 흐름 // "+String(index+1).padStart(2,"0"):"선택됨 // "+unit.name;
  }
  function setBranch(key){
    const formation=FORMATIONS[key];
    if(!formation)return;
    cancelRoute();
    branchKey=key;
    branchButtons.forEach(button=>{
      const selected=button.dataset.milBranch===key;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    orgNames.forEach((node,i)=>node.textContent=formation.levels[i].name);
    orgBriefs.forEach((node,i)=>node.textContent=formation.levels[i].brief);
    q("[data-mil-title]").textContent=formation.name+" 편제";
    selectFormation(0);
  }
  function setMode(key){
    const mode=MODES[key];
    if(!mode)return;
    cancelRoute();
    root.dataset.mode=key;
    buttons.forEach(button=>{
      const selected=button.dataset.milMode===key;
      button.classList.toggle("active",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    q("[data-mil-kicker]").textContent=mode.kick;
    q("[data-mil-title]").textContent=mode.title;
    q("[data-mil-readout-heading]").textContent=key==="structure"?"선택 편제 // 군종별 조직":key==="command"?"선택 계층 // 지휘 구조":"현재 기록";
    q("[data-mil-route-btn]").firstChild.textContent=key==="structure"?"편제 흐름 재생 ":"지휘 흐름 재생 ";
    if(key==="command"){
      selectLevel("national");
    }else if(key==="structure"){
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      setBranch(branchKey);
    }else{
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      renderReadout(mode.read,mode.body,mode.facts,mode.labels,mode.read+" // "+String(buttons.findIndex(button=>button.dataset.milMode===key)+1).padStart(2,"0"));
      route.textContent="지휘망 // 계층 선택 가능";
    }
  }
  function runRoute(){
    if(root.dataset.mode==="structure"){
      cancelRoute();
      const steps=FORMATIONS[branchKey].levels;
      if(reduced){selectFormation(steps.length-1,{replay:true});route.textContent="확인 완료";return}
      stage.classList.add("routing");
      const current=token;
      steps.forEach((_,index)=>schedule(()=>{
        if(token!==current||root.dataset.mode!=="structure")return;
        selectFormation(index,{replay:true});
        if(index===steps.length-1){
          route.textContent="확인 완료";
          schedule(()=>{if(token===current)stage.classList.remove("routing")},340);
        }
      },120+index*320));
      return;
    }
    if(root.dataset.mode!=="command")setMode("command");
    cancelRoute();
    if(reduced){
      selectLevel("unit",{replay:true});
      route.textContent="연결 완료";
      return;
    }
    stage.classList.add("routing");
    network.classList.add("signal");
    route.textContent="전달 준비";
    const current=token;
    COMMAND_LEVELS.forEach((level,index)=>{
      schedule(()=>{
        if(token!==current||root.dataset.mode!=="command")return;
        selectLevel(level.key,{replay:true});
        if(index===COMMAND_LEVELS.length-1){
          route.textContent="연결 완료";
          schedule(()=>{if(token===current){stage.classList.remove("routing");network.classList.remove("signal")}},380);
        }
      },180+index*280);
    });
  }
  buttons.forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.milMode)));
  branchButtons.forEach(button=>button.addEventListener("click",()=>setBranch(button.dataset.milBranch)));
  orgNodes.forEach(node=>node.addEventListener("click",()=>selectFormation(Number(node.dataset.milUnit))));
  nodes.forEach(node=>node.addEventListener("click",()=>{
    if(root.dataset.mode!=="command")setMode("command");
    selectLevel(node.dataset.milNode);
  }));
  q("[data-mil-route-btn]")?.addEventListener("click",runRoute);
  window.addEventListener("archive:record-opened",event=>{
    if(event.detail?.key==="military"&&(root.dataset.mode==="command"||root.dataset.mode==="structure"))runRoute();
    else if(event.detail?.key!=="military")cancelRoute();
  });
  setMode("command");
}
