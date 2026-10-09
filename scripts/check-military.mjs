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
    ["[data-mil-org-name]",names],["[data-mil-org-brief]",briefs]
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
  return {root,modeButtons,commandNodes,branches,orgUnits,names,briefs,byId,facts,events,flush,
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
console.log("PASS: military command preservation, 3 branch selection, 4 formation nodes, replay, reduced motion");
