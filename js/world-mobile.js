import { N, EVENTS, ext } from "./data.js?v=20261007-field-terminal-3";
import { THEATERS } from "./world-data.js?v=20261007-field-terminal-3";

const mobileQuery=matchMedia("(max-width: 820px)");
const nations=new Map(N.map(n=>[n[0],n]));
const ERA_WINDOWS={
  "2031":[2031,2040],"2041":[2041,2070],"2071":[2071,2100],"2101":[2101,2129],"2134":[2130,2134]
};

const THEATER_ART={
  east:{
    label:"PACIFIC DEFENSE GRID",sub:"EASTERN ARC // ACTIVE",
    paths:["M2 17 C14 8 34 12 44 24 C47 33 42 40 36 47 C28 51 22 60 12 61 C6 54 4 43 2 17Z","M59 20 C64 17 68 24 67 35 C65 46 62 55 58 63","M76 72 C84 67 94 73 97 86 C90 94 78 94 72 84Z"]
  },
  eurasia:{
    label:"CONTINENTAL CORRIDOR",sub:"LAND DEFENSE NETWORK",
    paths:["M3 23 C16 8 47 9 69 17 C85 23 97 37 95 53 C82 57 69 53 58 60 C45 68 27 71 12 61 C5 49 2 37 3 23Z"]
  },
  americas:{
    label:"ATLANTIC DEFENSE GRID",sub:"WESTERN HEMISPHERE",
    paths:["M25 7 C39 9 48 19 43 31 C38 41 35 49 37 60 C31 66 25 57 23 48 C18 37 14 24 25 7Z","M48 55 C59 54 67 62 66 73 C63 86 56 96 48 94 C44 84 42 68 48 55Z"]
  },
  emea:{
    label:"JOINT DEFENSE THEATER",sub:"EUROPE / MENA / AFRICA",
    paths:["M7 22 C24 10 48 15 57 28 C52 39 39 41 30 38 C21 40 12 36 7 22Z","M36 41 C49 40 59 50 57 64 C54 81 45 94 35 90 C27 75 26 56 36 41Z","M60 35 C75 26 91 33 96 47 C88 58 77 60 65 54Z"]
  }
};

export function initWorldMobile(){
  const terminal=document.querySelector("#fieldTerminal");
  if(!terminal)return;

  const deck=document.querySelector("#ftTheaterDeck");
  const theaterName=document.querySelector("#ftTheaterName");
  const theaterCaption=document.querySelector("#ftTheaterCaption");
  const theaterIndex=document.querySelector("#ftTheaterIndex");
  const theaterDots=document.querySelector("#ftTheaterDots");
  const worldIndex=document.querySelector("#ftWorldIndex");
  const dossier=document.querySelector("#ftDossier");
  const grabber=document.querySelector("#ftDossierGrabber");
  const close=document.querySelector("#ftDossierClose");
  const moduleButtons=[...terminal.querySelectorAll("[data-ft-module]")];
  const modulePanels=[...terminal.querySelectorAll("[data-ft-panel]")];
  const timelineButtons=[...terminal.querySelectorAll("[data-ft-era]")];
  const timelineList=document.querySelector("#ftTimelineList");
  const more=document.querySelector("#ftMoreMenu");
  let activeTheater=0,sheetState="closed",dragY=null,dragged=false,scrollRaf=0;

  function flagUrl(key){
    const suffix=ext[key]||"jpg";
    return `./assets/flags-hq/${key}-2134.${suffix}`;
  }

  function nodeMeta(node){
    const n=nations.get(node.id);
    return {
      code:n[1].split(" //")[0],title:n[2],eng:n[3],status:n[4],body:n[8],
      record:"nations",nation:n[0],kind:"NATION RECORD",detail1:"CAPITAL",value1:n[6],
      detail2:"STRENGTH",value2:n[7],flag:flagUrl(n[0])
    };
  }

  function makeCard(theater,index){
    const card=document.createElement("article");
    card.className="ft-theater-card";card.dataset.theater=theater.id;card.dataset.index=index;
    const nodeById=new Map(theater.nodes.map(n=>[n.id,n])),art=THEATER_ART[theater.id];
    const lines=theater.links.map(([a,b])=>{
      const p=nodeById.get(a),q=nodeById.get(b);if(!p||!q)return"";
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"></line>`;
    }).join("");
    const land=art.paths.map(d=>`<path d="${d}"></path>`).join("");
    const nodesHtml=theater.nodes.map(node=>{
      const m=nodeMeta(node);
      return `<button class="ft-node" data-node="${node.id}" style="--x:${node.x}%;--y:${node.y}%" aria-label="${m.title}">
        <i class="ft-iff"><span class="ft-iff-mark">${m.code}</span><span class="ft-iff-grid"></span></i>
        <b>${m.code}</b><small>${m.title}</small>
      </button>`;
    }).join("");
    card.innerHTML=`
      <div class="ft-card-code">${theater.code} // SCHEMATIC THEATER MAP</div>
      <div class="ft-schematic" aria-label="${theater.caption}">
        <div class="ft-map-watermark"><b>${theater.code}</b><span>${art.label}</span><small>${art.sub}</small></div>
        <svg class="ft-terrain" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${land}</g></svg>
        <svg class="ft-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${lines}</g></svg>
        ${nodesHtml}
        <div class="ft-target-lock" aria-hidden="true"><i></i><i></i><span>TARGET LOCK</span><b>---</b></div>
      </div>
      <div class="ft-card-foot"><span>IFF NETWORK // NOT TO SCALE</span><b>${theater.nodes.length} NATIONS</b></div>`;
    card.querySelectorAll(".ft-node").forEach(button=>button.addEventListener("click",()=>selectNode(theater,button)));
    return card;
  }

  function renderDeck(){
    deck.innerHTML="";theaterDots.innerHTML="";worldIndex.innerHTML="";
    THEATERS.forEach((theater,index)=>{
      deck.appendChild(makeCard(theater,index));
      const dot=document.createElement("button");dot.type="button";dot.dataset.index=index;dot.setAttribute("aria-label",theater.name);
      dot.addEventListener("click",()=>goTheater(index));theaterDots.appendChild(dot);
      const tab=document.createElement("button");tab.type="button";tab.dataset.index=index;tab.textContent=theater.short;
      tab.addEventListener("click",()=>goTheater(index));worldIndex.appendChild(tab);
    });
    updateTheater(0);
  }

  function updateTheater(index){
    activeTheater=Math.max(0,Math.min(THEATERS.length-1,index));
    const t=THEATERS[activeTheater];
    theaterName.textContent=t.name;theaterCaption.textContent=t.caption;
    theaterIndex.textContent=String(activeTheater+1).padStart(2,"0")+" / "+String(THEATERS.length).padStart(2,"0");
    [...theaterDots.children].forEach((d,i)=>d.classList.toggle("active",i===activeTheater));
    [...worldIndex.children].forEach((d,i)=>d.classList.toggle("active",i===activeTheater));
    terminal.style.setProperty("--theater-index",activeTheater);
  }

  function goTheater(index){
    const card=deck.children[index];if(!card)return;
    deck.scrollTo({left:index*deck.clientWidth,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
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
  function toggleSheet(){
    setSheetState(sheetState==="full"?"medium":"full");
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
    const flag=document.querySelector("#ftDossierFlag"),flagWrap=document.querySelector("#ftDossierFlagWrap");
    flag.src=meta.flag;flag.alt=meta.title+" flag";flagWrap.classList.add("visible");
    const open=document.querySelector("#ftDossierOpen");
    open.dataset.record=meta.record;open.dataset.nation=meta.nation||"";
    open.textContent="OPEN NATION RECORD →";
  }

  function selectNode(theater,button){
    const node=theater.nodes.find(n=>n.id===button.dataset.node),meta=nodeMeta(node);
    deck.querySelectorAll(".ft-node.selected").forEach(n=>n.classList.remove("selected"));button.classList.add("selected");
    button.style.setProperty("--flag-image",`url("${meta.flag}")`);button.classList.add("flag-loaded");
    showTarget(button.closest(".ft-theater-card"),button,meta.code);
    fillDossier(meta);setSheetState("medium");
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

  grabber.addEventListener("click",()=>{if(dragged){dragged=false;return}toggleSheet()});
  grabber.addEventListener("pointerdown",e=>{dragY=e.clientY;dragged=false;grabber.setPointerCapture?.(e.pointerId)});
  grabber.addEventListener("pointerup",e=>{
    if(dragY===null)return;const dy=e.clientY-dragY;dragY=null;
    if(Math.abs(dy)>42){
      dragged=true;
      if(dy>0)setSheetState("closed");else setSheetState("full");
    }
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
