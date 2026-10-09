import { HISTORY_TERMS, STATE_RECORDS } from "./nations-data.js?v=20261009-military-command-v1";
import { flagUrl } from "./flag-utils.js?v=20261008-world-order-structure-v1";
import { N, EVENTS } from "./data.js?v=20261007-refactor-3";

export function initNations(){
  const root=document.querySelector("#nationsArchive");
  if(!root)return;

  const list=root.querySelector("#nationList");
  const search=root.querySelector("#nationSearch");
  const indexToggle=root.querySelector("#nationIndexToggle");
  const indexClose=root.querySelector("#nationIndexClose");
  const mobileQuery=matchMedia("(max-width:820px)");
  const dossier=root.querySelector("#nationDossier");
  const flag=root.querySelector("#nf");
  const railFlag=root.querySelector("#naRailFlag");
  const handoff=root.querySelector("#nationHandoff");
  const handoffFlag=root.querySelector("#nationHandoffFlag");
  const history=root.querySelector("#nationHistory");
  const prev=root.querySelector("#nationPrev");
  const next=root.querySelector("#nationNext");
  const tabButtons=[...root.querySelectorAll("[data-na-tab]")];
  const panels=[...root.querySelectorAll("[data-na-panel]")];
  const militaryLink=root.querySelector("[data-na-open-military]");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byKey=new Map(N.map(n=>[n[0],n]));
  let currentIndex=0,currentKey=N[0][0],pendingHandoff=false,swapTimer=0,handoffTimer=0,pickerTimer=0,pickerLock=false;

  function isRecordOpen(){
    return root.closest(".view")?.classList.contains("active")===true;
  }

  function setField(name,value){
    root.querySelectorAll(`[data-nation-field="${name}"]`).forEach(el=>el.textContent=value);
  }

  function hydrateFlag(button){
    if(!isRecordOpen())return;
    const img=button?.querySelector(".na-flag-card img[data-src]");
    if(!img)return;
    img.src=img.dataset.src;img.removeAttribute("data-src");
    img.addEventListener("load",()=>button.classList.add("flag-ready"),{once:true});
  }

  function hydrateAround(button,radius=1){
    if(!button)return;
    const buttons=[...list.querySelectorAll(".na-index-btn")];
    const i=buttons.indexOf(button);
    if(i<0)return;
    for(let n=Math.max(0,i-radius);n<=Math.min(buttons.length-1,i+radius);n++)hydrateFlag(buttons[n]);
  }

  function renderIndex(filter=""){
    const q=filter.trim().toLowerCase();
    list.innerHTML="";
    let shown=0;
    N.forEach((n,index)=>{
      const hay=[n[0],n[1],n[2],n[3],n[4]].join(" ").toLowerCase();
      if(q&&!hay.includes(q))return;
      shown++;
      const code=n[1].split(" //")[0];
      const b=document.createElement("button");
      b.type="button";b.className="na-index-btn";b.dataset.k=n[0];b.dataset.index=index;
      b.setAttribute("role","option");b.setAttribute("aria-selected",String(n[0]===currentKey));
      const flagCard=mobileQuery.matches?`<i class="na-flag-card" aria-hidden="true"><img data-src="${flagUrl(n[0])}" alt="" decoding="async"><u></u></i>`:"";
      b.innerHTML=`
        <span>${String(index+1).padStart(2,"0")}</span>
        ${flagCard}
        <div><b>${n[2]}</b><small>${n[3]}</small></div>
        <em>${code}</em>`;
      b.classList.toggle("active",n[0]===currentKey);
      b.addEventListener("click",()=>{
        pickerLock=true;
        show(n,{animate:true,centerPicker:true});
        if(root.classList.contains("index-open"))setIndexOpen(false);
        setTimeout(()=>pickerLock=false,240);
      });
      list.appendChild(b);
    });
    root.querySelector("#nationCount").textContent=`${shown} / ${N.length}개 기록`;
    requestAnimationFrame(()=>{
      const active=list.querySelector(".na-index-btn.active");
      hydrateAround(active,1);
      if(mobileQuery.matches&&!root.classList.contains("index-open"))centerButton(active,"auto");
    });
  }

  function centerButton(button,behavior=reduced?"auto":"smooth"){
    if(!button||!isRecordOpen()||!mobileQuery.matches||root.classList.contains("index-open"))return;
    const top=button.offsetTop-(list.clientHeight-button.offsetHeight)/2;
    list.scrollTo({top:Math.max(0,top),behavior});
  }

  function syncIndexSelection({center=false,behavior}={}){
    list.querySelectorAll(".na-index-btn").forEach(b=>{
      const active=b.dataset.k===currentKey;
      b.classList.toggle("active",active);
      b.setAttribute("aria-selected",String(active));
    });
    const active=list.querySelector(".na-index-btn.active");
    hydrateAround(active,1);
    if(center)requestAnimationFrame(()=>centerButton(active,behavior));
  }

  function nearestPickerButton(){
    const buttons=[...list.querySelectorAll(".na-index-btn")];
    if(!buttons.length)return null;
    const box=list.getBoundingClientRect(),center=box.top+box.height/2;
    let best=null,distance=Infinity;
    buttons.forEach(b=>{
      const r=b.getBoundingClientRect(),d=Math.abs((r.top+r.height/2)-center);
      if(d<distance){distance=d;best=b}
    });
    return best;
  }

  function settlePicker(){
    if(!mobileQuery.matches||root.classList.contains("index-open")||pickerLock)return;
    const button=nearestPickerButton();
    if(!button)return;
    hydrateAround(button,1);
    const n=byKey.get(button.dataset.k);
    if(n&&n[0]!==currentKey)show(n,{animate:true,centerPicker:false});
  }

  function setIndexOpen(open){
    if(!mobileQuery.matches)open=false;
    const wasOpen=root.classList.contains("index-open");
    root.classList.toggle("index-open",open);
    indexToggle?.setAttribute("aria-expanded",String(open));
    if(open){
      hydrateAround(list.querySelector(".na-index-btn.active"),2);
      requestAnimationFrame(()=>list.querySelector(".na-index-btn.active")?.scrollIntoView({block:"nearest"}));
    }else{
      if(wasOpen&&search.value){
        search.value="";renderIndex("");
      }else requestAnimationFrame(()=>centerButton(list.querySelector(".na-index-btn.active"),"auto"));
    }
  }

  function linkedEvents(key){
    const terms=HISTORY_TERMS[key]||[];
    return EVENTS.filter(e=>terms.some(term=>e[1].includes(term)||e[2].includes(term))).slice(-5).reverse();
  }

  function renderHistory(key){
    const events=linkedEvents(key);
    if(!events.length){
      history.innerHTML='<div class="na-history-empty"><span>연결된 공개 사건 없음</span><b>상세 기록 미등록</b></div>';
      return;
    }
    history.innerHTML=events.map(e=>`
      <article><time>${e[0]}</time><div><b>${e[1]}</b><span>${e[2]}</span></div><em>등급 ${e[3]}</em></article>
    `).join("");
  }

  function setStateField(name,value="미등록"){
    root.querySelectorAll(`[data-state-field="${name}"]`).forEach(el=>el.textContent=value);
  }

  function renderStateRecord(key){
    const record=STATE_RECORDS[key];
    dossier.dataset.stateReady=record?"true":"false";
    root.querySelector("#naStateAvailability").textContent=record?"국가 체계 // 확인됨":"국가 체계 // 상세기록 준비 중";
    if(!record){
      ["gov-type","gov-ko","gov-note","gov-executive","gov-legislature","gov-judiciary","gov-balance",
       "soc-civil","soc-military","soc-zone","soc-note","def-doctrine","def-command","def-status","def-note",
       "inst-name","inst-eng","inst-class","inst-location","inst-role","inst-status","inst-note"].forEach(k=>setStateField(k));
      return;
    }
    setStateField("gov-type",record.governance.type);setStateField("gov-ko",record.governance.ko);setStateField("gov-note",record.governance.note);
    setStateField("gov-executive",record.governance.executive);setStateField("gov-legislature",record.governance.legislature);setStateField("gov-judiciary",record.governance.judiciary);setStateField("gov-balance",record.governance.balance);
    setStateField("soc-civil",record.society.civil);setStateField("soc-military",record.society.military);setStateField("soc-zone",record.society.zone);setStateField("soc-note",record.society.note);
    setStateField("def-doctrine",record.defense.doctrine);setStateField("def-command",record.defense.command);setStateField("def-status",record.defense.status);setStateField("def-note",record.defense.note);
    setStateField("inst-name",record.institution.name);setStateField("inst-eng",record.institution.eng);setStateField("inst-class",record.institution.class);setStateField("inst-location",record.institution.location);setStateField("inst-role",record.institution.role);setStateField("inst-status",record.institution.status);setStateField("inst-note",record.institution.note);
  }

  function updateButtons(){
    prev.disabled=currentIndex<=0;next.disabled=currentIndex>=N.length-1;
  }

  function updateContent(n,{centerPicker=false}={}){
    currentKey=n[0];currentIndex=N.findIndex(x=>x[0]===n[0]);
    const src=flagUrl(n[0]);
    if(isRecordOpen()&&!mobileQuery.matches){
      flag.src=src;flag.alt=n[2]+" flag";
      railFlag.src=src;railFlag.alt="";
    }
    dossier.dataset.code=n[1].split(" //")[0];
    root.querySelector("#nc").textContent=n[1];
    root.querySelector("#nn").textContent=n[2];
    root.querySelector("#ne").textContent=n[3];
    root.querySelector("#nb").textContent=n[8];
    root.querySelector("#naRailCode").textContent=n[1].split(" //")[0];
    setField("status",n[4]);setField("population",n[5]);setField("capital",n[6]);setField("strength",n[7]);setField("brief",n[8]);
    renderStateRecord(n[0]);renderHistory(n[0]);syncIndexSelection({center:centerPicker});updateButtons();
  }

  function show(n,{animate=true,centerPicker=false}={}){
    if(!n)return;
    const nextIndex=N.findIndex(x=>x[0]===n[0]);
    const direction=nextIndex<currentIndex?"prev":"next";
    clearTimeout(swapTimer);
    dossier.classList.remove("swap-next","swap-prev");
    updateContent(n,{centerPicker});
    if(animate&&!reduced){
      dossier.classList.add(direction==="prev"?"swap-prev":"swap-next");
      swapTimer=setTimeout(()=>dossier.classList.remove("swap-next","swap-prev"),210);
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
    if(index!==currentIndex)show(N[index],{animate:true,centerPicker:true});
  }

  function activateNationVisuals(){
    const n=byKey.get(currentKey);if(!n||!isRecordOpen())return;
    if(mobileQuery.matches){
      const active=list.querySelector(".na-index-btn.active");
      hydrateAround(active,1);
      requestAnimationFrame(()=>centerButton(active,"auto"));
    }else{
      const src=flagUrl(n[0]);
      flag.src=src;flag.alt=n[2]+" flag";
      railFlag.src=src;railFlag.alt="";
    }
  }

  function playHandoff(){
    const n=byKey.get(currentKey);if(!n||reduced)return;
    clearTimeout(handoffTimer);
    handoffFlag.src=flagUrl(n[0]);root.querySelector("#nationHandoffTarget").textContent="대상 // "+n[1].split(" //")[0];
    handoff.classList.remove("active");void handoff.offsetWidth;handoff.classList.add("active");
    handoffTimer=setTimeout(()=>handoff.classList.remove("active"),620);
  }

  search.addEventListener("input",()=>renderIndex(search.value));
  indexToggle?.addEventListener("click",()=>setIndexOpen(!root.classList.contains("index-open")));
  indexClose?.addEventListener("click",()=>setIndexOpen(false));
  window.addEventListener("keydown",e=>{if(e.key==="Escape")setIndexOpen(false)});
  mobileQuery.addEventListener?.("change",()=>{setIndexOpen(false);renderIndex(search.value)});
  list.addEventListener("scroll",()=>{
    if(!mobileQuery.matches)return;
    const near=nearestPickerButton();
    if(root.classList.contains("index-open")){hydrateAround(near,2);return}
    clearTimeout(pickerTimer);
    hydrateAround(near,1);
    pickerTimer=setTimeout(settlePicker,105);
  },{passive:true});

  tabButtons.forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.naTab)));
  militaryLink?.addEventListener("click",()=>window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:"military"}})));
  prev.addEventListener("click",()=>step(-1));next.addEventListener("click",()=>step(1));

  window.addEventListener("archive:select-nation",e=>{
    const n=byKey.get(e.detail?.key);if(!n)return;
    pendingHandoff=true;setIndexOpen(false);show(n,{animate:false,centerPicker:true});
  });
  window.addEventListener("archive:record-opened",e=>{
    if(e.detail?.key!=="nations")return;
    requestAnimationFrame(activateNationVisuals);
    if(!pendingHandoff)return;
    pendingHandoff=false;setTimeout(playHandoff,110);
  });

  renderIndex();switchTab("governance");show(N[0],{animate:false,centerPicker:true});
  if(isRecordOpen())requestAnimationFrame(activateNationVisuals);
}
