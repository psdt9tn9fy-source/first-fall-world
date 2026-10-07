import { N, EVENTS, ext } from "./data.js?v=20261007-regional-cutout-1";
import { THEATERS } from "./world-data.js?v=20261007-regional-cutout-1";

const mobileQuery=matchMedia("(max-width: 820px)");
const nations=new Map(N.map(n=>[n[0],n]));
const ERA_WINDOWS={
  "2031":[2031,2040],"2041":[2041,2070],"2071":[2071,2100],"2101":[2101,2129],"2134":[2130,2134]
};

const WORLD_SILHOUETTE="./assets/globe/world-silhouette.svg";
const THEATER_ART={
  east:{label:"EAST ASIA / PACIFIC",sub:"REGIONAL CUTOUT // IFF OVERLAY",view:"940 70 500 500",loc:[65.3,9.7,34.7,69.4]},
  eurasia:{label:"EURASIA",sub:"CONTINENTAL CORRIDOR",view:"720 20 460 460",loc:[50,2.8,31.9,63.9]},
  americas:{label:"ATLANTIC / AMERICAS",sub:"WESTERN HEMISPHERE",view:"20 20 600 600",loc:[1.4,2.8,41.7,83.3]},
  emea:{label:"EUROPE / MENA / AFRICA",sub:"JOINT DEFENSE THEATER",view:"560 40 520 520",loc:[38.9,5.6,36.1,72.2]}
};

export function initWorldMobile(){
  const terminal=document.querySelector("#fieldTerminal");
  if(!terminal)return;
  const intro=document.querySelector("#intro");

  const deck=document.querySelector("#ftTheaterDeck");
  const theaterName=document.querySelector("#ftTheaterName");
  const theaterCaption=document.querySelector("#ftTheaterCaption");
  const theaterIndex=document.querySelector("#ftTheaterIndex");
  const theaterDots=document.querySelector("#ftTheaterDots");
  const worldIndex=document.querySelector("#ftWorldIndex");
  const discoveryHint=document.querySelector("#ftDiscoveryHint");
  const dossier=document.querySelector("#ftDossier");
  const grabber=document.querySelector("#ftDossierGrabber");
  const close=document.querySelector("#ftDossierClose");
  const moduleButtons=[...terminal.querySelectorAll("[data-ft-module]")];
  const modulePanels=[...terminal.querySelectorAll("[data-ft-panel]")];
  const timelineButtons=[...terminal.querySelectorAll("[data-ft-era]")];
  const timelineList=document.querySelector("#ftTimelineList");
  const more=document.querySelector("#ftMoreMenu");
  let activeTheater=0,sheetState="closed",dragY=null,dragged=false,scrollRaf=0,switchTimer=0,hintTimer=0;

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
    const nodesHtml=theater.nodes.map(node=>{
      const meta=nodeMeta(node);
      return `<button class="ft-node" data-node="${node.id}" style="--x:${node.x}%;--y:${node.y}%" aria-label="${meta.title}">
        <i class="ft-flag-marker">
          <span class="ft-flag-fallback">${meta.code}</span>
          <img class="ft-flag-img" data-src="${meta.flag}" alt="${meta.title} flag" loading="lazy" decoding="async" fetchpriority="low">
        </i>
        <b>${meta.code}</b><small>${meta.title}</small>
      </button>`;
    }).join("");
    const [lx,ly,lw,lh]=art.loc;
    card.innerHTML=`
      <div class="ft-card-code">${theater.code} // REGIONAL CUTOUT</div>
      <div class="ft-schematic" aria-label="${theater.caption}">
        <div class="ft-map-watermark"><b>${theater.code}</b><span>${art.label}</span><small>${art.sub}</small></div>
        <svg class="ft-region-map" viewBox="${art.view}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <image href="${WORLD_SILHOUETTE}" x="0" y="0" width="1440" height="720"></image>
        </svg>
        <svg class="ft-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g>${lines}</g></svg>
        <div class="ft-locator" aria-hidden="true">
          <img src="${WORLD_SILHOUETTE}" alt="" decoding="async">
          <i style="--lx:${lx}%;--ly:${ly}%;--lw:${lw}%;--lh:${lh}%"></i>
          <span>GLOBAL LOCATOR</span>
        </div>
        ${nodesHtml}
        <div class="ft-target-lock" aria-hidden="true"><i></i><i></i><span>TARGET LOCK</span><b>---</b></div>
      </div>
      <div class="ft-card-foot"><span>GEOGRAPHIC REFERENCE // GENERALIZED</span><b>${theater.nodes.length} NATIONS</b></div>`;
    card.querySelectorAll(".ft-node").forEach(button=>button.addEventListener("click",()=>selectNode(theater,button)));
    return card;
  }

  function loadTheaterFlags(index){
    const card=deck.children[index];if(!card)return;
    card.querySelectorAll(".ft-flag-img[data-src]").forEach(img=>{
      const src=img.dataset.src;if(!src)return;
      const button=img.closest(".ft-node");
      img.addEventListener("load",()=>button?.classList.add("flag-ready"),{once:true});
      img.src=src;img.removeAttribute("data-src");
    });
  }

  function animateTheaterSwitch(){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    clearTimeout(switchTimer);terminal.classList.remove("theater-switch");void terminal.offsetWidth;terminal.classList.add("theater-switch");
    switchTimer=setTimeout(()=>terminal.classList.remove("theater-switch"),430);
  }

  function showDiscoveryHint(){
    if(!mobileQuery.matches||!discoveryHint)return;
    let seen=false;
    try{seen=localStorage.getItem("ida-field-terminal-hint-v1")==="1"}catch(e){}
    if(seen)return;
    discoveryHint.classList.add("show");
    clearTimeout(hintTimer);hintTimer=setTimeout(()=>{
      discoveryHint.classList.remove("show");
      try{localStorage.setItem("ida-field-terminal-hint-v1","1")}catch(e){}
    },2600);
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
    updateTheater(0,false);
  }

  function updateTheater(index,animate=true){
    const next=Math.max(0,Math.min(THEATERS.length-1,index)),changed=next!==activeTheater;
    activeTheater=next;
    const t=THEATERS[activeTheater];
    theaterName.textContent=t.name;theaterCaption.textContent=t.caption;
    theaterIndex.textContent=String(activeTheater+1).padStart(2,"0")+" / "+String(THEATERS.length).padStart(2,"0");
    [...theaterDots.children].forEach((d,i)=>d.classList.toggle("active",i===activeTheater));
    [...worldIndex.children].forEach((d,i)=>d.classList.toggle("active",i===activeTheater));
    terminal.style.setProperty("--theater-index",activeTheater);
    loadTheaterFlags(activeTheater);
    if(changed&&animate)animateTheaterSwitch();
  }

  function goTheater(index){
    const card=deck.children[index];if(!card)return;
    const left=card.offsetLeft-deck.offsetLeft;
    deck.scrollTo({left,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
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
    discoveryHint?.classList.remove("show");
    const node=theater.nodes.find(n=>n.id===button.dataset.node),meta=nodeMeta(node);
    deck.querySelectorAll(".ft-node.selected").forEach(n=>n.classList.remove("selected"));button.classList.add("selected");
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
      let index=0,best=Infinity;
      [...deck.children].forEach((card,i)=>{
        const d=Math.abs((card.offsetLeft-deck.offsetLeft)-deck.scrollLeft);
        if(d<best){best=d;index=i}
      });
      if(index!==activeTheater)updateTheater(index);
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

  function maybeShowDiscovery(){
    if(!mobileQuery.matches)return;
    if(intro&&!intro.classList.contains("hide"))return;
    if(!terminal.closest(".view")?.classList.contains("active"))return;
    setTimeout(showDiscoveryHint,260);
  }
  if(intro)new MutationObserver(maybeShowDiscovery).observe(intro,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="world")maybeShowDiscovery()});
  mobileQuery.addEventListener?.("change",e=>{if(!e.matches)setSheetState("closed");else maybeShowDiscovery()});
  renderDeck();renderTimeline("2134");maybeShowDiscovery();
}
