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
/* Combined operational capabilities, not a nation-specific order of battle. */
const FORCES={
  ground:{title:"지상 전력",body:"도시와 전선의 방어, 거점 확보, 지상 기동을 담당하는 기본 전력이다. 보병·기갑·화력 지원을 상황에 따라 결합하며 전쟁 환경에 맞춰 장비와 전술이 발전했다.",facts:["방어 · 기동 · 거점 확보","보병 · 기갑 · 화력","항공 · 지원 전력"]},
  naval:{title:"해상 전력",body:"해상 교통로를 보호하고 연안 방어와 해상 수송을 수행하는 전력이다. 함정·잠수함과 지원 함대의 역할은 각국의 해역과 산업 기반에 따라 달라진다.",facts:["해역 방어 · 수송로 확보","수상함 · 잠수함","항공 · 지원 전력"]},
  air:{title:"항공 전력",body:"정찰과 요격, 공중 방어 및 지상·해상 작전 지원을 담당한다. 유·무인 항공전력의 구성과 운용 방식은 국가마다 차이가 있다.",facts:["정찰 · 요격 · 공중 지원","유·무인 항공기","지상 · 해상 전력"]},
  special:{title:"특수 전력",body:"정예 인원과 특수 장비를 활용해 일반 부대와 구분되는 임무를 수행하는 전력이다. 특수 능력이나 고도화된 장비의 도입 여부는 각국의 제도와 기술 수준에 따라 다르다.",facts:["특수 임무 · 제한적 운용","정예 인원 · 특수 장비","지상 · 정보 지원"]},
  support:{title:"지원 전력",body:"보급·정비·의무·통신·정보 체계를 통해 여러 전투 전력이 지속적으로 작전할 수 있도록 뒷받침한다. 장기전에서는 전선의 유지와 복구에 필수적이다.",facts:["전력 유지 · 작전 지속","보급 · 정비 · 의무 · 정보","전 군종 공통"]}
};
/* Comparative rank-career stages; these are not standardized national rank names. */
const RANK_GROUPS={
  officer:{name:"장교",stages:[
    {name:"초급 장교",brief:"소부대 지휘",body:"임관 이후 소부대 지휘와 기본 참모 업무를 맡는 단계다. 진출 경로에는 사관학교·기타 장교 양성 과정 등이 포함될 수 있다.",facts:["임관 · 초급 지휘","부대 지휘 · 참모 실무","사관학교 등 양성 과정"]},
    {name:"중견 장교",brief:"중간 지휘",body:"지휘 및 참모 경험을 바탕으로 중간 규모 부대를 지휘하거나 작전 계획 업무를 담당하는 경력 단계다.",facts:["중간 지휘","작전 계획 · 부대 운용","경력 · 진급 심사"]},
    {name:"상급 장교",brief:"상위 지휘·참모",body:"상위 부대의 지휘와 정책·작전 기획에 참여하는 장교 경력 단계다. 세부 지위와 계급 명칭은 국가별로 다르다.",facts:["상위 지휘","작전·조직 관리","장기간 경력"]},
    {name:"장성급 장교",brief:"최상위 군 지휘",body:"군 전체 또는 대규모 작전 조직의 전략·작전 지휘를 맡는 장교 계층이다. 모든 장교가 이 단계로 진급하는 것은 아니다.",facts:["전략·작전 지휘","대규모 조직 지휘","엄격한 선발"]}
  ]},
  nco:{name:"부사관",stages:[
    {name:"초급 부사관",brief:"실무 지휘",body:"부사관으로 임용된 뒤 분대급·현장 단위의 지휘와 숙련 업무를 담당하는 초기 경력 단계다.",facts:["현장 초급 지휘","병력 관리 · 실무","부사관 선발·교육"]},
    {name:"중견 부사관",brief:"숙련 지휘",body:"축적된 현장 경험을 바탕으로 인원과 장비 운용, 실무 지도 역할을 수행한다.",facts:["현장 지휘","훈련·정비·실무 지도","경력 · 평가"]},
    {name:"상급 부사관",brief:"부대 운영",body:"부대의 인원 관리와 실무 조직 운영을 지원하고 경험을 후배 인원에게 전수하는 선임 경력 단계다.",facts:["선임 실무 관리","부대 운영 · 지도","전문성"]},
    {name:"최상급 부사관",brief:"최선임 실무",body:"장기 근무 경험을 토대로 부대 지휘부에 현장 의견을 제공하고 인력 양성과 조직 운영을 지원한다.",facts:["최선임 실무","지휘부 보좌 · 인력 양성","장기 경력"]}
  ]},
  enlisted:{name:"병",stages:[
    {name:"입대·훈련",brief:"기초 교육",body:"기초 군사교육과 직무훈련을 받고 현장 임무를 준비하는 단계다. 계급 명칭은 국가별로 다르다.",facts:["기초 교육","훈련 · 보직 배정","초기 복무"]},
    {name:"초급 병",brief:"기본 임무",body:"지휘체계에 따라 보직별 임무를 수행하며 장비와 전술에 숙달하는 초기 복무 단계다.",facts:["일선 실무","기본 임무 수행","직무 숙련"]},
    {name:"숙련 병",brief:"현장 숙련",body:"축적한 경험을 바탕으로 복잡한 임무를 수행하고 동료의 현장 적응을 지원할 수 있는 단계다.",facts:["숙련 인력","현장 임무 · 지원","경력 축적"]},
    {name:"선임 병",brief:"선임 실무",body:"경험 많은 병 인원으로서 후배 인원을 도울 수 있는 경력 단계다. 국가와 제도에 따라 부사관 지원 경로가 열릴 수 있다.",facts:["선임 인력","실무 · 후배 지원","부사관 지원 가능"]}
  ]}
};
const CAREER_ROUTES={
  "enlisted-nco":{group:"nco",title:"병 → 부사관 지원",body:"병 복무 경력을 바탕으로 부사관 선발·교육을 거쳐 임용될 수 있는 경로다. 지원 자격과 심사 기준은 국가별로 다르며 자동 진급을 의미하지 않는다.",facts:["병 복무 경력","지원 · 선발 · 교육","부사관 임용 심사"]},
  "academy-officer":{group:"officer",title:"군 교육기관 → 장교 임관",body:"중앙사관학교 등 장교 양성 교육기관을 통해 장교로 진출하는 경로다. 중앙사관학교는 세계관의 엘리트 교육기관이지만, 국가별로 다른 장교 양성 경로도 존재한다.",facts:["중앙사관학교 등","교육 · 평가 · 임관","초급 장교"]}
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
  const forceNodes=[...root.querySelectorAll("[data-mil-force]")];
  const forceLinks=[...root.querySelectorAll("[data-mil-force-link]")];
  const rankGroups=[...root.querySelectorAll("[data-mil-rank-group]")];
  const rankStages=[...root.querySelectorAll("[data-mil-rank-stage]")];
  const rankNames=[...root.querySelectorAll("[data-mil-rank-name]")];
  const rankBriefs=[...root.querySelectorAll("[data-mil-rank-brief]")];
  const careerButtons=[...root.querySelectorAll("[data-mil-career]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers=new Set();
  let token=0,branchKey="land",forceKey="ground",rankGroupKey="officer";
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
  function selectForce(key,{replay=false}={}){
    const detail=FORCES[key];
    if(root.dataset.mode!=="force"||!detail)return;
    if(!replay)cancelRoute();
    forceKey=key;
    const order=Object.keys(FORCES);
    const current=order.indexOf(key);
    forceNodes.forEach(node=>{
      const index=order.indexOf(node.dataset.milForce);
      const active=node.dataset.milForce===key;
      node.classList.toggle("active",active);
      node.classList.toggle("passed",replay&&index<current);
      node.setAttribute("aria-pressed",String(active));
    });
    forceLinks.forEach(link=>{
      const index=order.indexOf(link.dataset.milForceLink);
      link.classList.toggle("active",link.dataset.milForceLink===key);
      link.classList.toggle("passed",replay&&index<current);
    });
    renderReadout(detail.title,detail.body,detail.facts,["주요 임무","전력 구성","연계 대상"],
      "전력 유형 // "+String(current+1).padStart(2,"0")+" / 05");
    route.textContent=replay?"전력 연결 // "+String(current+1).padStart(2,"0"):"선택됨 // "+detail.title;
  }
  function selectRankStage(index,{replay=false}={}){
    const group=RANK_GROUPS[rankGroupKey];
    if(root.dataset.mode!=="rank"||!group?.stages[index])return;
    if(!replay)cancelRoute();
    const level=group.stages[index];
    rankStages.forEach((node,i)=>{
      const active=i===index;
      node.classList.toggle("active",active);
      node.classList.toggle("passed",i<index);
      node.setAttribute("aria-pressed",String(active));
    });
    renderReadout(level.name,level.body,level.facts,["경력 범주","주요 역할","진출·진급"],
      group.name+" // "+String(index+1).padStart(2,"0")+" / 04");
    route.textContent=replay?"경력 단계 // "+String(index+1).padStart(2,"0"):"선택됨 // "+level.name;
  }
  function setRankGroup(key){
    const group=RANK_GROUPS[key];
    if(!group||root.dataset.mode!=="rank")return;
    cancelRoute();
    rankGroupKey=key;
    rankGroups.forEach(button=>{
      const active=button.dataset.milRankGroup===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    rankNames.forEach((node,i)=>node.textContent=group.stages[i].name);
    rankBriefs.forEach((node,i)=>node.textContent=group.stages[i].brief);
    q("[data-mil-title]").textContent=group.name+" 경력 단계";
    selectRankStage(0);
  }
  function selectCareer(key){
    const career=CAREER_ROUTES[key];
    if(root.dataset.mode!=="rank"||!career)return;
    setRankGroup(career.group);
    careerButtons.forEach(button=>{
      const active=button.dataset.milCareer===key;
      button.classList.toggle("active",active);
    });
    renderReadout(career.title,career.body,career.facts,["출발 경로","전환 요건","도착 경로"],
      "경력 전환 // "+(key==="enlisted-nco"?"01":"02"));
    route.textContent="경력 경로 // "+career.title;
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
    q("[data-mil-readout-heading]").textContent=key==="structure"?"선택 편제 // 군종별 조직":key==="command"?"선택 계층 // 지휘 구조":key==="force"?"선택 전력 // 통합 전력망":key==="rank"?"계급·경력 // 인사 기록":"현재 기록";
    q("[data-mil-route-btn]").firstChild.textContent=key==="structure"?"편제 흐름 재생 ":key==="force"?"전력 연계 재생 ":key==="rank"?"경력 단계 재생 ":"지휘 흐름 재생 ";
    if(key==="command"){
      selectLevel("national");
    }else if(key==="structure"){
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      setBranch(branchKey);
    }else if(key==="force"){
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      selectForce(forceKey);
    }else if(key==="rank"){
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      setRankGroup(rankGroupKey);
    }else{
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      renderReadout(mode.read,mode.body,mode.facts,mode.labels,mode.read+" // "+String(buttons.findIndex(button=>button.dataset.milMode===key)+1).padStart(2,"0"));
      route.textContent="지휘망 // 계층 선택 가능";
    }
  }
  function runRoute(){
    if(root.dataset.mode==="rank"){
      cancelRoute();
      const steps=RANK_GROUPS[rankGroupKey].stages;
      if(reduced){selectRankStage(steps.length-1,{replay:true});route.textContent="단계 확인 완료";return}
      stage.classList.add("routing");
      const current=token;
      steps.forEach((_,index)=>schedule(()=>{
        if(token!==current||root.dataset.mode!=="rank")return;
        selectRankStage(index,{replay:true});
        if(index===steps.length-1){
          route.textContent="단계 확인 완료";
          schedule(()=>{if(token===current)stage.classList.remove("routing")},340);
        }
      },140+index*300));
      return;
    }
    if(root.dataset.mode==="force"){
      cancelRoute();
      const keys=Object.keys(FORCES);
      if(reduced){selectForce(keys[keys.length-1],{replay:true});route.textContent="연계 완료";return}
      stage.classList.add("routing");
      const current=token;
      keys.forEach((key,index)=>schedule(()=>{
        if(token!==current||root.dataset.mode!=="force")return;
        selectForce(key,{replay:true});
        if(index===keys.length-1){
          route.textContent="연계 완료";
          schedule(()=>{if(token===current)stage.classList.remove("routing")},380);
        }
      },140+index*280));
      return;
    }
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
  forceNodes.forEach(node=>node.addEventListener("click",()=>selectForce(node.dataset.milForce)));
  rankGroups.forEach(button=>button.addEventListener("click",()=>setRankGroup(button.dataset.milRankGroup)));
  rankStages.forEach(node=>node.addEventListener("click",()=>selectRankStage(Number(node.dataset.milRankStage))));
  careerButtons.forEach(button=>button.addEventListener("click",()=>selectCareer(button.dataset.milCareer)));
  nodes.forEach(node=>node.addEventListener("click",()=>{
    if(root.dataset.mode!=="command")setMode("command");
    selectLevel(node.dataset.milNode);
  }));
  q("[data-mil-route-btn]")?.addEventListener("click",runRoute);
  window.addEventListener("archive:record-opened",event=>{
    if(event.detail?.key==="military"&&(root.dataset.mode==="command"||root.dataset.mode==="structure"||root.dataset.mode==="force"||root.dataset.mode==="rank"))runRoute();
    else if(event.detail?.key!=="military")cancelRoute();
  });
  setMode("command");
}
