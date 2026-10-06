import { N, EVENTS } from "./data.js";
import { THEATERS, SECTORS, ZONE_LABEL } from "./world-data.js";

const mobileQuery=matchMedia("(max-width: 820px)");
const nations=new Map(N.map(n=>[n[0],n]));
const sectors=new Map(SECTORS.map(s=>[s.id,s]));
const ERA_WINDOWS={
  "2031":[2031,2040],"2041":[2041,2070],"2071":[2071,2100],"2101":[2101,2129],"2134":[2130,2134]
};

export function initWorldMobile(){
  const terminal=document.querySelector("#fieldTerminal");
  if(!terminal)return;

  const deck=document.querySelector("#ftTheaterDeck");
  const theaterName=document.querySelector("#ftTheaterName");
  const theaterCaption=document.querySelector("#ftTheaterCaption");
  const theaterIndex=document.querySelector("#ftTheaterIndex");
  const theaterDots=document.querySelector("#ftTheaterDots");
  const dossier=document.querySelector("#ftDossier");
  const grabber=document.querySelector("#ftDossierGrabber");
  const close=document.querySelector("#ftDossierClose");
  const targetLabel=document.querySelector("#ftTargetLabel");
  const moduleButtons=[...terminal.querySelectorAll("[data-ft-module]")];
  const modulePanels=[...terminal.querySelectorAll("[data-ft-panel]")];
  const timelineButtons=[...terminal.querySelectorAll("[data-ft-era]")];
  const timelineList=document.querySelector("#ftTimelineList");
  const more=document.querySelector("#ftMoreMenu");
  let activeTheater=0,sheetState="closed",dragY=null,dragged=false,scrollRaf=0;

  function nodeMeta(node){
    if(node.type==="sector"){
      const s=sectors.get(node.id);
      return {
        code:s.id,title:s.ko,eng:s.name,status:ZONE_LABEL[s.zone],body:s.body,
        record:s.record,nation:s.nation||"",kind:"THREAT NODE",detail1:"ACCESS",value1:s.zone==="black"?"RESTRICTED":"PUBLIC",
        detail2:"CLASS",value2:ZONE_LABEL[s.zone],danger:s.zone==="black"
      };
    }
    const n=nations.get(node.id);
    return {
      code:n[1].split(" //")[0],title:n[2],eng:n[3],status:n[4],body:n[8],
      record:"nations",nation:n[0],kind:"NATION RECORD",detail1:"CAPITAL",value1:n[6],
      detail2:"STRENGTH",value2:n[7],danger:false
    };
  }

  function makeCard(theater,index){
    const card=document.createElement("article");
    card.className="ft-theater-card";card.dataset.theater=theater.id;card.dataset.index=index;
    const nodeById=new Map(theater.nodes.map(n=>[n.id,n]));
    const lines=theater.links.map(([a,b])=>{
      const p=nodeById.get(a),q=nodeById.get(b);
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"></line>`;
    }).join("");
    const nodesHtml=theater.nodes.map(node=>{
      const m=nodeMeta(node);
      return `<button class="ft-node ${m.danger?"danger":""}" data-node="${node.id}" data-type="${node.type}" style="--x:${node.x}%;--y:${node.y}%" aria-label="${m.title}">
        <i><span></span></i><b>${m.code}</b><small>${m.title}</small>
      </button>`;
    }).join("");
    card.innerHTML=`
      <div class="ft-card-code">${theater.code} // SCHEMATIC THEATER MAP</div>
      <div class="ft-schematic" aria-label="${theater.caption}">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${lines}</g></svg>
        ${nodesHtml}
        <div class="ft-target-lock" aria-hidden="true"><i></i><i></i><span>TARGET LOCK</span><b>---</b></div>
      </div>
      <div class="ft-card-foot"><span>SCHEMATIC // NOT TO SCALE</span><b>${theater.nodes.length} NODES</b></div>`;
    card.querySelectorAll(".ft-node").forEach(button=>button.addEventListener("click",()=>selectNode(theater,button)));
    return card;
  }

  function renderDeck(){
    deck.innerHTML="";theaterDots.innerHTML="";
    THEATERS.forEach((theater,index)=>{
      deck.appendChild(makeCard(theater,index));
      const dot=document.createElement("button");dot.type="button";dot.dataset.index=index;dot.setAttribute("aria-label",theater.name);
      dot.addEventListener("click",()=>goTheater(index));theaterDots.appendChild(dot);
    });
    updateTheater(0);
  }

  function updateTheater(index){
    activeTheater=Math.max(0,Math.min(THEATERS.length-1,index));
    const t=THEATERS[activeTheater];
    theaterName.textContent=t.name;theaterCaption.textContent=t.caption;
    theaterIndex.textContent=String(activeTheater+1).padStart(2,"0")+" / "+String(THEATERS.length).padStart(2,"0");
    [...theaterDots.children].forEach((d,i)=>d.classList.toggle("active",i===activeTheater));
    terminal.style.setProperty("--theater-index",activeTheater);
  }

  function goTheater(index){
    const card=deck.children[index];if(!card)return;
    card.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",inline:"start",block:"nearest"});
    updateTheater(index);
  }

  function showTarget(card,button,label){
    const target=card.querySelector(".ft-target-lock");
    target.style.left=button.style.getPropertyValue("--x");target.style.top=button.style.getPropertyValue("--y");
    target.querySelector("b").textContent=label;target.classList.remove("lock");
    void target.offsetWidth;target.classList.add("lock");
    setTimeout(()=>target.classList.remove("lock"),520);
  }

  function setSheetState(state){
    sheetState=state;dossier.dataset.state=state;
    grabber.setAttribute("aria-expanded",String(state==="medium"||state==="full"));
  }
  function stepSheet(direction){
    const order=["closed","peek","medium","full"];let i=order.indexOf(sheetState);
    i=Math.max(0,Math.min(order.length-1,i+direction));setSheetState(order[i]);
  }

  function fillDossier(meta){
    document.querySelector("#ftDossierCode").textContent=meta.kind+" // "+meta.code;
    document.querySelector("#ftDossierTitle").textContent=meta.title;
    document.querySelector("#ftDossierClass").textContent=meta.status+" // "+meta.eng;
    document.querySelector("#ftDossierBody").textContent=meta.body;
    document.querySelector("#ftDossierKey1").textContent=meta.detail1;
    document.querySelector("#ftDossierVal1").textContent=meta.value1;
    document.querySelector("#ftDossierKey2").textContent=meta.detail2;
    document.querySelector("#ftDossierVal2").textContent=meta.value2;
    const open=document.querySelector("#ftDossierOpen");
    open.dataset.record=meta.record;open.dataset.nation=meta.nation||"";
    open.textContent=meta.record==="eidolon"?"OPEN EIDOLON RECORD →":"OPEN NATION RECORD →";
    dossier.classList.toggle("danger",meta.danger);
  }

  function selectNode(theater,button){
    const node=theater.nodes.find(n=>n.id===button.dataset.node),meta=nodeMeta(node);
    deck.querySelectorAll(".ft-node.selected").forEach(n=>n.classList.remove("selected"));button.classList.add("selected");
    targetLabel.textContent=meta.code;showTarget(button.closest(".ft-theater-card"),button,meta.code);
    fillDossier(meta);
    setTimeout(()=>setSheetState("peek"),240);
  }

  function switchModule(key){
    moduleButtons.forEach(b=>b.classList.toggle("active",b.dataset.ftModule===key));
    modulePanels.forEach(p=>p.classList.toggle("active",p.dataset.ftPanel===key));
    terminal.dataset.module=key;setSheetState("closed");
  }

  function renderTimeline(era){
    const [a,b]=ERA_WINDOWS[era];
    let items=EVENTS.filter(e=>e[0]>=a&&e[0]<=b);
    if(era!=="2134")items=items.slice(0,6);else items=items.slice(-6);
    timelineList.innerHTML=items.map(e=>`
      <article><time>${e[0]}</time><div><b>${e[1]}</b><span>${e[2]}</span></div><em>${e[3]}</em></article>
    `).join("");
    timelineButtons.forEach(btn=>btn.classList.toggle("active",btn.dataset.ftEra===era));
  }

  deck.addEventListener("scroll",()=>{
    cancelAnimationFrame(scrollRaf);scrollRaf=requestAnimationFrame(()=>{
      const index=Math.round(deck.scrollLeft/Math.max(1,deck.clientWidth));if(index!==activeTheater)updateTheater(index);
    });
  },{passive:true});

  moduleButtons.forEach(button=>button.addEventListener("click",()=>switchModule(button.dataset.ftModule)));
  timelineButtons.forEach(button=>button.addEventListener("click",()=>renderTimeline(button.dataset.ftEra)));

  grabber.addEventListener("click",()=>{if(dragged){dragged=false;return}stepSheet(sheetState==="peek"?1:-1)});
  grabber.addEventListener("pointerdown",e=>{dragY=e.clientY;dragged=false;grabber.setPointerCapture?.(e.pointerId)});
  grabber.addEventListener("pointerup",e=>{
    if(dragY===null)return;const dy=e.clientY-dragY;dragY=null;
    if(Math.abs(dy)>42){dragged=true;stepSheet(dy<0?1:-1)}
  });
  close.addEventListener("click",()=>setSheetState("closed"));

  document.querySelector("#ftDossierOpen").addEventListener("click",e=>{
    const record=e.currentTarget.dataset.record,nation=e.currentTarget.dataset.nation;
    setSheetState("closed");
    if(nation)window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:nation}}));
    window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:record}}));
  });

  terminal.querySelectorAll("[data-ft-open]").forEach(button=>button.addEventListener("click",()=>{
    const key=button.dataset.ftOpen;
    if(key==="more"){more.classList.toggle("open");return}
    more.classList.remove("open");window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
  }));

  terminal.querySelectorAll("[data-ft-more]").forEach(button=>button.addEventListener("click",()=>{
    more.classList.remove("open");window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:button.dataset.ftMore}}));
  }));

  mobileQuery.addEventListener?.("change",e=>{if(!e.matches)setSheetState("closed")});
  renderDeck();renderTimeline("2134");
}
