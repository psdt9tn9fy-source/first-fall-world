// Run the military tabs with a minimal DOM, without a real browser.
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import assert from "node:assert/strict";
const source=readFileSync(new URL("../js/military.js",import.meta.url),"utf8").replace("export function initMilitary(){","function initMilitary(){");
function element(dataset={}){
  const classes=new Set(), handlers=new Map(),attributes=new Map();
  return {
    dataset,classes,handlers,style:{},textContent:"",firstChild:{textContent:""},
    classList:{
      add:(...names)=>names.forEach(name=>classes.add(name)),
      remove:(...names)=>names.forEach(name=>classes.delete(name)),
      toggle:(name,on)=>{if(on)classes.add(name);else classes.delete(name)},
      contains:name=>classes.has(name)
    },
    addEventListener:(type,fn)=>handlers.set(type,fn),
    setAttribute:(name,value)=>attributes.set(name,value),
    getAttribute:name=>attributes.get(name),
    click(){handlers.get("click")?.()}
  };
}
function createFixture(reduced=false){
  const modeButtons=["command","structure","force","rank","deployment"].map(milMode=>element({milMode}));
  const commandNodes=["national","joint","operations","front","unit"].map(milNode=>element({milNode}));
  const branches=["land","sea","air"].map(milBranch=>element({milBranch}));
  const forceKeys=["ground","naval","air","special","support"];
  const forceNodes=forceKeys.map(milForce=>element({milForce}));
  const forceLinks=forceKeys.map(milForceLink=>element({milForceLink}));
  const rankGroups=["officer","nco","enlisted"].map(milRankGroup=>element({milRankGroup}));
  const rankStages=[0,1,2,3].map(milRankStage=>element({milRankStage:String(milRankStage)}));
  const rankNames=rankStages.map(()=>element()),rankBriefs=rankStages.map(()=>element());
  const careerButtons=["enlisted-nco","academy-officer"].map(milCareer=>element({milCareer}));
  const deploymentKeys=["frontline","city","nest","reserve","rear"];
  const deploymentButtons=deploymentKeys.map(milDeployment=>element({milDeployment}));
  const deploymentRoutes=deploymentKeys.map(milDeployRoute=>element({milDeployRoute}));
  const orgUnits=[0,1,2,3].map(milUnit=>element({milUnit:String(milUnit)}));
  const names=orgUnits.map(()=>element()),briefs=orgUnits.map(()=>element());
  const factLabels=[element(),element(),element()],facts=[element(),element(),element()];
  const byId=new Map([".mil-stage","[data-mil-network]","[data-mil-route]","[data-mil-readout-heading]",
    "[data-mil-route-btn]","[data-mil-readout-code]","[data-mil-readout-title]",
    "[data-mil-readout-body]","[data-mil-kicker]","[data-mil-title]"].map(k=>[k,element()]));
  const all=new Map([
    ["[data-mil-mode]",modeButtons],["[data-mil-node]",commandNodes],
    [".mil-line",[element(),element(),element(),element()]],
    ["[data-mil-facts] span",factLabels],["[data-mil-facts] b",facts],
    ["[data-mil-branch]",branches],["[data-mil-unit]",orgUnits],
    ["[data-mil-org-name]",names],["[data-mil-org-brief]",briefs],
    ["[data-mil-force]",forceNodes],["[data-mil-force-link]",forceLinks],
    ["[data-mil-rank-group]",rankGroups],["[data-mil-rank-stage]",rankStages],
    ["[data-mil-rank-name]",rankNames],["[data-mil-rank-brief]",rankBriefs],
    ["[data-mil-career]",careerButtons],
    ["[data-mil-deployment]",deploymentButtons],["[data-mil-deploy-route]",deploymentRoutes]
  ]);
  const root={
    dataset:{},
    querySelector:key=>byId.get(key),
    querySelectorAll:key=>all.get(key)??[]
  };
  const events=new Map(),pending=new Map();
  let nextId=0;
  const init=runInNewContext(source+"\ninitMilitary",{
    document:{querySelector:()=>root},
    window:{addEventListener:(type,fn)=>events.set(type,fn)},
    matchMedia:()=>({matches:reduced}),
    setTimeout:fn=>{const id=++nextId;pending.set(id,fn);return id},
    clearTimeout:id=>pending.delete(id)
  });
  init();
  function flush(){
    let count=0;
    while(pending.size){
      if(++count>100)throw Error("military timer loop did not finish");
      const [id,fn]=pending.entries().next().value;
      pending.delete(id);
      fn();
    }
  }
  return {root,modeButtons,commandNodes,branches,orgUnits,forceNodes,forceLinks,rankGroups,rankStages,rankNames,rankBriefs,careerButtons,deploymentButtons,deploymentRoutes,names,briefs,byId,facts,events,flush,
    get title(){return byId.get("[data-mil-readout-title]").textContent},
    get description(){return byId.get("[data-mil-readout-body]").textContent},
    get route(){return byId.get("[data-mil-route]").textContent}};
}
const f=createFixture();
assert.equal(f.root.dataset.mode,"command");
assert.equal(f.title,"국가 지휘부","Command mode must remain default");
f.modeButtons[1].click();
assert.equal(f.root.dataset.mode,"structure");
assert.equal(f.title,"군단");
assert.equal(f.names[0].textContent,"군단");
assert.equal(f.names[3].textContent,"대대");
assert.equal(f.branches[0].getAttribute("aria-pressed"),"true");
assert.equal(f.orgUnits[0].getAttribute("aria-pressed"),"true");
f.orgUnits[2].click();
assert.equal(f.title,"여단");
assert.match(f.description,/대대/);
assert.equal(f.orgUnits[2].getAttribute("aria-pressed"),"true");
assert.equal(f.orgUnits[0].getAttribute("aria-pressed"),"false");
f.branches[1].click();
assert.equal(f.names[0].textContent,"함대");
assert.equal(f.names[3].textContent,"함정");
assert.equal(f.title,"함대");
f.orgUnits[1].click();
assert.equal(f.title,"전단");
f.branches[2].click();
assert.equal(f.title,"항공작전부대");
assert.equal(f.names[2].textContent,"비행대대");
f.orgUnits[3].click();
assert.equal(f.title,"편대");
assert.equal(f.facts[0].textContent,"전술 비행 단위");
f.byId.get("[data-mil-route-btn]").click();
f.flush();
assert.equal(f.title,"편대");
assert.equal(f.route,"확인 완료");
f.modeButtons[0].click();
assert.equal(f.root.dataset.mode,"command");
assert.equal(f.title,"국가 지휘부");
assert.equal(f.commandNodes[0].getAttribute("aria-pressed"),"true");
f.commandNodes[2].click();
assert.equal(f.title,"작전사령부");
f.modeButtons[1].click();
assert.equal(f.title,"항공작전부대","Returning to formations must keep the chosen branch");
f.branches[0].click();
assert.equal(f.title,"군단");
const r=createFixture(true);
r.modeButtons[1].click();
r.byId.get("[data-mil-route-btn]").click();
assert.equal(r.title,"대대");
assert.equal(r.route,"확인 완료");

// Interactive force network: each domain updates the shared readout and highlighted link.
f.modeButtons[2].click();
assert.equal(f.root.dataset.mode,"force");
assert.equal(f.title,"지상 전력");
assert.equal(f.forceNodes[0].getAttribute("aria-pressed"),"true");
assert(f.forceLinks[0].classes.has("active"));
f.forceNodes[1].click();
assert.equal(f.title,"해상 전력");
assert.match(f.description,/해상 교통로/);
assert.equal(f.forceNodes[0].getAttribute("aria-pressed"),"false");
assert(f.forceLinks[1].classes.has("active"));
assert(!f.forceLinks[0].classes.has("active"));
f.forceNodes[2].click();
assert.equal(f.title,"항공 전력");
f.forceNodes[3].click();
assert.equal(f.title,"특수 전력");
assert.match(f.description,/각국/);
f.forceNodes[4].click();
assert.equal(f.title,"지원 전력");
assert.equal(f.facts[0].textContent,"전력 유지 · 작전 지속");
f.forceNodes[0].click();
f.byId.get("[data-mil-route-btn]").click();
f.flush();
assert.equal(f.title,"지원 전력");
assert.equal(f.route,"연계 완료");
assert(f.forceLinks[3].classes.has("passed"));
f.modeButtons[1].click();
assert.equal(f.title,"군단");
f.modeButtons[2].click();
assert.equal(f.title,"지원 전력","Reentering force mode must preserve selection");
f.modeButtons[0].click();
assert.equal(f.title,"국가 지휘부","Force tab must not corrupt command hierarchy");
const rf=createFixture(true);
rf.modeButtons[2].click();
rf.byId.get("[data-mil-route-btn]").click();
assert.equal(rf.title,"지원 전력");
assert.equal(rf.route,"연계 완료");
// 04 rank classification, progression, and career entry buttons must not affect earlier tabs.
f.modeButtons[3].click();
assert.equal(f.root.dataset.mode,"rank");
assert.equal(f.title,"초급 장교");
assert.equal(f.rankStages[0].getAttribute("aria-pressed"),"true");
f.rankStages[2].click();
assert.equal(f.title,"상급 장교");
assert.equal(f.rankStages[2].getAttribute("aria-pressed"),"true");
f.rankGroups[1].click();
assert.equal(f.title,"초급 부사관");
assert.equal(f.rankNames[3].textContent,"최상급 부사관");
f.rankGroups[2].click();
assert.equal(f.title,"입대·훈련");
f.rankStages[3].click();
assert.equal(f.title,"선임 병");
f.careerButtons[0].click();
assert.equal(f.title,"병 → 부사관 지원");
assert.equal(f.rankGroups[1].getAttribute("aria-pressed"),"true");
assert.match(f.description,/자동 진급을 의미하지 않는다/);
f.careerButtons[1].click();
assert.equal(f.title,"군 교육기관 → 장교 임관");
assert.equal(f.rankGroups[0].getAttribute("aria-pressed"),"true");
assert.match(f.description,/중앙사관학교/);
f.byId.get("[data-mil-route-btn]").click();
f.flush();
assert.equal(f.title,"장성급 장교");
assert.equal(f.route,"단계 확인 완료");
f.modeButtons[2].click();
assert.equal(f.title,"지원 전력","Rank tab should preserve force selection");
f.modeButtons[0].click();
assert.equal(f.title,"국가 지휘부","Rank tab should not affect command");
const rr=createFixture(true);
rr.modeButtons[3].click();
rr.byId.get("[data-mil-route-btn]").click();
assert.equal(rr.title,"장성급 장교");
assert.equal(rr.route,"단계 확인 완료");
// 05 deployment: choosing a zone, replaying conceptual map, cancellation and reduced-motion support.
f.modeButtons[4].click();
assert.equal(f.root.dataset.mode,"deployment");
assert.equal(f.title,"전선 방어");
assert.equal(f.deploymentButtons[0].getAttribute("aria-pressed"),"true");
assert(f.deploymentRoutes[0].classes.has("active"));
f.deploymentButtons[1].click();
assert.equal(f.title,"도시 안전권");
assert.match(f.description,/민간인의 생활/);
assert.equal(f.deploymentButtons[0].getAttribute("aria-pressed"),"false");
assert(!f.deploymentRoutes[0].classes.has("active"));
f.deploymentButtons[2].click();
assert.equal(f.title,"네스트 대응");
assert.match(f.description,/N-01~N-03/);
f.deploymentButtons[3].click();
assert.equal(f.title,"기동 예비전력");
f.deploymentButtons[4].click();
assert.equal(f.title,"후방 보급");
assert.equal(f.facts[0].textContent,"보급 · 수리 · 회복");
f.deploymentButtons[0].click();
f.byId.get("[data-mil-route-btn]").click();
f.flush();
assert.equal(f.title,"후방 보급");
assert.equal(f.route,"구역 확인 완료");
assert(f.deploymentRoutes[3].classes.has("passed"));
f.modeButtons[1].click();
assert.equal(f.title,"군단");
f.modeButtons[4].click();
assert.equal(f.title,"후방 보급","Returning to deployments should preserve selected zone");
f.modeButtons[0].click();
assert.equal(f.title,"국가 지휘부");
const rd=createFixture(true);
rd.modeButtons[4].click();
rd.byId.get("[data-mil-route-btn]").click();
assert.equal(rd.title,"후방 보급");
assert.equal(rd.route,"구역 확인 완료");
const cancel=createFixture();
cancel.modeButtons[4].click();
cancel.byId.get("[data-mil-route-btn]").click();
cancel.modeButtons[3].click();cancel.flush();
assert.equal(cancel.title,"초급 장교","Changing tabs must cancel deployment playback");
console.log("PASS: all 5 military tabs, deployment sectors, readout, cancel/replay, reduced motion");
