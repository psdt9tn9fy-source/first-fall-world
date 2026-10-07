import { N, EVENTS, ext } from "./data.js?v=20261007-nations-rail-1";

const HISTORY_TERMS={
  rok:["서울","부산","평양","백두","SEOUL","BUSAN","PYONGYANG","BAEKDU"],
  afu:["뉴욕","알래스카","NEW YORK","ALASKA"],
  jpn:["도쿄","오사카","TOKYO","OSAKA"],
  crf:["난징","상하이","NANJING","SHANGHAI"],
  ncdr:["베이징","화북","BEIJING","NORTH CHINA"],
  wur:["청두","CHENGDU"],
  rus:["블라디보스토크","시베리아","VLADIVOSTOK","SIBERIA"],
  edc:["브뤼셀","유럽","파리","라인","바르샤바","BRUSSELS","EUROPE","PARIS","RHINE","WARSAW"],
  cadc:["알마티","카자흐","ALMATY","KAZAKH"],
  medc:["카이로","수에즈","앙카라","CAIRO","SUEZ","ANKARA"],
  ind:["뉴델리","인도","NEW DELHI","INDIA"],
  bra:["리우","아마존","RIO","AMAZON"],
  aus:["호주","시드니","AUSTRALIA","SYDNEY"],
  can:["북극","ARCTIC"],
  mex:["멕시코","MEXICO"],
  sea:["마닐라","MANILA"],
  afr:["아프리카","AFRICA"]
};

export function initNations(){
  const root=document.querySelector("#nationsArchive");
  if(!root)return;

  const list=root.querySelector("#nationList");
  const search=root.querySelector("#nationSearch");
  const indexToggle=root.querySelector("#nationIndexToggle");
  const indexClose=root.querySelector("#nationIndexClose");
  const indexScrim=root.querySelector("#nationIndexScrim");
  const mobileQuery=matchMedia("(max-width:820px)");
  const dossier=root.querySelector("#nationDossier");
  const identity=root.querySelector("#nationIdentity");
  const flag=root.querySelector("#nf");
  const railFlag=root.querySelector("#naRailFlag");
  const handoff=root.querySelector("#nationHandoff");
  const handoffFlag=root.querySelector("#nationHandoffFlag");
  const history=root.querySelector("#nationHistory");
  const prev=root.querySelector("#nationPrev");
  const next=root.querySelector("#nationNext");
  const tabButtons=[...root.querySelectorAll("[data-na-tab]")];
  const panels=[...root.querySelectorAll("[data-na-panel]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byKey=new Map(N.map(n=>[n[0],n]));
  let currentIndex=0,currentKey=N[0][0],pendingHandoff=false,swapTimer=0,handoffTimer=0;

  function flagUrl(key){
    return `./assets/flags-hq/${key}-2134.${ext[key]||"jpg"}`;
  }

  function setField(name,value){
    root.querySelectorAll(`[data-nation-field="${name}"]`).forEach(el=>el.textContent=value);
  }

  function renderIndex(filter=""){
    const q=filter.trim().toLowerCase();
    list.innerHTML="";
    let shown=0;
    N.forEach((n,index)=>{
      const hay=[n[0],n[1],n[2],n[3],n[4]].join(" ").toLowerCase();
      if(q&&!hay.includes(q))return;
      shown++;
      const b=document.createElement("button");
      b.type="button";b.className="na-index-btn";b.dataset.k=n[0];b.dataset.index=index;
      b.setAttribute("role","option");b.setAttribute("aria-selected",String(n[0]===currentKey));
      b.innerHTML=`<span>${String(index+1).padStart(2,"0")}</span><div><b>${n[2]}</b><small>${n[3]}</small></div><em>${n[1].split(" //")[0]}</em>`;
      b.classList.toggle("active",n[0]===currentKey);
      b.addEventListener("click",()=>{
        show(n,{animate:true});
        if(mobileQuery.matches)setIndexOpen(false);
      });
      list.appendChild(b);
    });
    const indicator=document.createElement("i");
    indicator.className="na-rail-indicator";indicator.setAttribute("aria-hidden","true");list.appendChild(indicator);
    root.querySelector("#nationCount").textContent=`${shown} / ${N.length} RECORDS`;
    requestAnimationFrame(updateRailIndicator);
  }

  function updateRailIndicator(){
    const active=list.querySelector(".na-index-btn.active"),indicator=list.querySelector(".na-rail-indicator");
    if(!active||!indicator){if(indicator)indicator.style.opacity="0";return}
    indicator.style.opacity="1";
    indicator.style.setProperty("--rail-y",active.offsetTop+"px");
    indicator.style.setProperty("--rail-h",active.offsetHeight+"px");
  }

  function setIndexOpen(open){
    if(!mobileQuery.matches)open=false;
    root.classList.toggle("index-open",open);
    indexToggle?.setAttribute("aria-expanded",String(open));
    if(open)requestAnimationFrame(updateRailIndicator);
  }

  function linkedEvents(key){
    const terms=HISTORY_TERMS[key]||[];
    return EVENTS.filter(e=>terms.some(term=>e[1].includes(term)||e[2].includes(term))).slice(-5).reverse();
  }

  function renderHistory(key){
    const events=linkedEvents(key);
    if(!events.length){
      history.innerHTML='<div class="na-history-empty"><span>NO LINKED PUBLIC EVENT</span><b>DETAIL RECORD NOT INDEXED</b></div>';
      return;
    }
    history.innerHTML=events.map(e=>`
      <article><time>${e[0]}</time><div><b>${e[1]}</b><span>${e[2]}</span></div><em>CLASS ${e[3]}</em></article>
    `).join("");
  }

  function updateButtons(){
    prev.disabled=currentIndex<=0;next.disabled=currentIndex>=N.length-1;
  }

  function updateContent(n){
    currentKey=n[0];currentIndex=N.findIndex(x=>x[0]===n[0]);
    const src=flagUrl(n[0]);
    flag.src=src;flag.alt=n[2]+" flag";
    railFlag.src=src;railFlag.alt="";
    dossier.dataset.code=n[1].split(" //")[0];
    root.querySelector("#nc").textContent=n[1];
    root.querySelector("#nn").textContent=n[2];
    root.querySelector("#ne").textContent=n[3];
    root.querySelector("#nb").textContent=n[8];
    root.querySelector("#naStickyCode").textContent=n[1].split(" //")[0];
    root.querySelector("#naStickyName").textContent=n[2];
    root.querySelector("#naPosition").textContent=`${String(currentIndex+1).padStart(2,"0")} / ${String(N.length).padStart(2,"0")}`;
    root.querySelector("#naRailCode").textContent=n[1].split(" //")[0];
    setField("status",n[4]);setField("population",n[5]);setField("capital",n[6]);setField("strength",n[7]);setField("brief",n[8]);
    renderHistory(n[0]);renderIndex(search.value);updateButtons();
    const active=list.querySelector(`[data-k="${n[0]}"]`);
    active?.scrollIntoView({block:"nearest",inline:"nearest",behavior:reduced?"auto":"smooth"});
    requestAnimationFrame(updateRailIndicator);
  }

  function show(n,{animate=true}={}){
    if(!n)return;
    const nextIndex=N.findIndex(x=>x[0]===n[0]);
    const direction=nextIndex>=currentIndex?"next":"prev";
    clearTimeout(swapTimer);
    dossier.classList.remove("swap-next","swap-prev");
    updateContent(n);
    if(animate&&!reduced){
      dossier.classList.add(direction==="next"?"swap-next":"swap-prev");
      swapTimer=setTimeout(()=>dossier.classList.remove("swap-next","swap-prev"),240);
    }
  }

  function switchTab(key){
    tabButtons.forEach(b=>b.classList.toggle("active",b.dataset.naTab===key));
    panels.forEach(p=>{
      const active=p.dataset.naPanel===key;
      p.classList.toggle("active",active);
      if(active&&!reduced){p.classList.remove("fade-in");void p.offsetWidth;p.classList.add("fade-in")}
    });
  }

  function step(delta){
    const index=Math.max(0,Math.min(N.length-1,currentIndex+delta));
    if(index!==currentIndex)show(N[index],{animate:true});
  }

  function playHandoff(){
    const n=byKey.get(currentKey);if(!n||reduced)return;
    clearTimeout(handoffTimer);
    handoffFlag.src=flagUrl(n[0]);root.querySelector("#nationHandoffTarget").textContent="TARGET // "+n[1].split(" //")[0];
    handoff.classList.remove("active");void handoff.offsetWidth;handoff.classList.add("active");
    handoffTimer=setTimeout(()=>handoff.classList.remove("active"),620);
  }

  search.addEventListener("input",()=>renderIndex(search.value));
  indexToggle?.addEventListener("click",()=>setIndexOpen(!root.classList.contains("index-open")));
  indexClose?.addEventListener("click",()=>setIndexOpen(false));
  indexScrim?.addEventListener("click",()=>setIndexOpen(false));
  window.addEventListener("keydown",e=>{if(e.key==="Escape")setIndexOpen(false)});
  mobileQuery.addEventListener?.("change",()=>setIndexOpen(false));
  list.addEventListener("scroll",()=>requestAnimationFrame(updateRailIndicator),{passive:true});
  tabButtons.forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.naTab)));
  prev.addEventListener("click",()=>step(-1));next.addEventListener("click",()=>step(1));

  let startX=null,startY=null;
  identity.addEventListener("pointerdown",e=>{startX=e.clientX;startY=e.clientY});
  identity.addEventListener("pointerup",e=>{
    if(startX===null||startY===null)return;
    const dx=e.clientX-startX,dy=e.clientY-startY;startX=startY=null;
    if(Math.abs(dx)>54&&Math.abs(dx)>Math.abs(dy)*1.35)step(dx<0?1:-1);
  });

  window.addEventListener("archive:select-nation",e=>{
    const n=byKey.get(e.detail?.key);if(!n)return;
    pendingHandoff=true;setIndexOpen(false);show(n,{animate:false});
  });
  window.addEventListener("archive:record-opened",e=>{
    if(e.detail?.key!=="nations"||!pendingHandoff)return;
    pendingHandoff=false;setTimeout(playHandoff,110);
  });

  renderIndex();switchTab("overview");show(N[0],{animate:false});
}
