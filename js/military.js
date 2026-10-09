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
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers=new Set();
  let token=0;
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
    if(key==="command"){
      selectLevel("national");
    }else{
      nodes.forEach(node=>{node.classList.remove("active","passed");node.setAttribute("aria-pressed","false")});
      lines.forEach(line=>line.classList.remove("passed"));
      renderReadout(mode.read,mode.body,mode.facts,mode.labels,mode.read+" // "+String(buttons.findIndex(button=>button.dataset.milMode===key)+1).padStart(2,"0"));
      route.textContent="지휘망 // 계층 선택 가능";
    }
  }
  function runRoute(){
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
  nodes.forEach(node=>node.addEventListener("click",()=>{
    if(root.dataset.mode!=="command")setMode("command");
    selectLevel(node.dataset.milNode);
  }));
  q("[data-mil-route-btn]")?.addEventListener("click",runRoute);
  window.addEventListener("archive:record-opened",event=>{
    if(event.detail?.key==="military"&&root.dataset.mode==="command")runRoute();
    else if(event.detail?.key!=="military")cancelRoute();
  });
  setMode("command");
}
