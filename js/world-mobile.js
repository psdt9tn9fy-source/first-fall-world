import { ERA_WINDOWS, THEATER_ART, WORLD_SILHOUETTE } from "./world-mobile-data.js?v=20261008-world-order-structure-v1";
import { flagUrl } from "./flag-utils.js?v=20261008-world-order-structure-v1";
import { N, EVENTS } from "./data.js?v=20261007-refactor-3";
import { THEATERS } from "./world-data.js?v=20261007-refactor-3";

const nations=new Map(N.map(n=>[n[0],n]));
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
  let activeTheater=0,sheetState="closed",dragY=null,dragged=false,scrollRaf=0,switchTimer=0,hintTimer=0;

  function nodeMeta(node){
    const n=nations.get(node.id);
    return {
      code:n[1].split(" //")[0],title:n[2],eng:n[3],status:n[4],body:n[8],
      record:"nations",nation:n[0],kind:"국가 기록",detail1:"수도",value1:n[6],
      detail2:"주요 특징",value2:n[7],flag:flagUrl(n[0])
    };
  }

  function makeCard(theater,index){
    const card=document.createElement("article");
    card.className="ft-theater-card";card.dataset.theater=theater.id;card.dataset.index=index;
    const nodeById=new Map(theater.nodes.map(n=>[n.id,n])),art=THEATER_ART[theater.id];
    const ax=n=>n.ax??n.x,ay=n=>n.ay??n.y;
    const network=theater.links.map(([a,b])=>{
      const p=nodeById.get(a),q=nodeById.get(b);if(!p||!q)return"";
      return `<line class="ft-network-line" x1="${ax(p)}" y1="${ay(p)}" x2="${ax(q)}" y2="${ay(q)}"></line>`;
    }).join("");
    const leaders=theater.nodes.map(node=>{
      const dx=Math.abs(node.x-ax(node)),dy=Math.abs(node.y-ay(node));
      if(dx<.5&&dy<.5)return"";
      return `<line class="ft-leader-line" data-node="${node.id}" x1="${ax(node)}" y1="${ay(node)}" x2="${node.x}" y2="${node.y}"></line>`;
    }).join("");
    const anchors=theater.nodes.map(node=>
      `<circle class="ft-anchor-dot" data-node="${node.id}" cx="${ax(node)}" cy="${ay(node)}" r=".75"></circle>`
    ).join("");
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
      <div class="ft-card-code">${theater.code} // 지역 보기</div>
      <div class="ft-schematic" aria-label="${theater.caption}">
        <div class="ft-map-watermark"><b>${theater.code}</b><span>${art.label}</span><small>${art.sub}</small></div>
        <svg class="ft-region-map" viewBox="${art.view}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <image href="${WORLD_SILHOUETTE}" x="0" y="0" width="1440" height="720"></image>
        </svg>
        <svg class="ft-map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g class="ft-network">${network}</g>
          <g class="ft-leaders">${leaders}</g>
          <g class="ft-anchors">${anchors}</g>
        </svg>
        <div class="ft-locator" aria-hidden="true">
          <img src="${WORLD_SILHOUETTE}" alt="" decoding="async">
          <i style="--lx:${lx}%;--ly:${ly}%;--lw:${lw}%;--lh:${lh}%"></i>
          <span>세계 위치</span>
        </div>
        ${nodesHtml}
        <div class="ft-target-lock" aria-hidden="true"><i></i><i></i><span>선택 대상</span><b>---</b></div>
      </div>
      <div class="ft-card-foot"><span>기준 = 실제 위치 // 표식 보정</span><b>${theater.nodes.length}개 국가</b></div>`;
    card.querySelectorAll(".ft-node").forEach(button=>button.addEventListener("click",()=>selectNode(theater,button)));
    return card;
  }

  function worldReady(){
    return terminal.closest(".view")?.classList.contains("active")&&(!intro||intro.classList.contains("hide"));
  }

  function loadTheaterFlags(index){
    if(!worldReady())return;
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
    if(!discoveryHint)return;
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
    if(worldReady())loadTheaterFlags(activeTheater);
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
    open.textContent="국가 기록 열기 →";
  }

  function selectNode(theater,button){
    discoveryHint?.classList.remove("show");
    const node=theater.nodes.find(n=>n.id===button.dataset.node),meta=nodeMeta(node);
    deck.querySelectorAll(".ft-node.selected").forEach(n=>n.classList.remove("selected"));button.classList.add("selected");
    deck.querySelectorAll(".ft-leader-line.selected,.ft-anchor-dot.selected").forEach(n=>n.classList.remove("selected"));
    const card=button.closest(".ft-theater-card");
    card.querySelectorAll(`[data-node="${node.id}"]`).forEach(el=>{
      if(el.classList.contains("ft-leader-line")||el.classList.contains("ft-anchor-dot"))el.classList.add("selected");
    });
    showTarget(card,button,meta.code);
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
    window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:button.dataset.ftOpen}}));
  }));

  function maybeShowDiscovery(){
    if(!worldReady())return;
    loadTheaterFlags(activeTheater);
    setTimeout(showDiscoveryHint,260);
  }
  if(intro)new MutationObserver(maybeShowDiscovery).observe(intro,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="world")maybeShowDiscovery()});
  renderDeck();renderTimeline("2134");maybeShowDiscovery();
}
