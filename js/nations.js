import { N, EVENTS, ext } from "./data.js?v=20261007-nations-picker-1";

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
  let currentIndex=0,currentKey=N[0][0],pendingHandoff=false,swapTimer=0,handoffTimer=0,pickerTimer=0,pickerLock=false;

  function flagUrl(key){
    return `./assets/flags-hq/${key}-2134.${ext[key]||"jpg"}`;
  }

  function setField(name,value){
    root.querySelectorAll(`[data-nation-field="${name}"]`).forEach(el=>el.textContent=value);
  }

  function hydrateFlag(button){
    const img=button?.querySelector(".na-flag-card img[data-src]");
    if(!img)return;
    img.src=img.dataset.src;img.removeAttribute("data-src");
    img.addEventListener("load",()=>button.classList.add("flag-ready"),{once:true});
  }

  function hydrateAround(button,radius=2){
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
      b.innerHTML=`
        <span>${String(index+1).padStart(2,"0")}</span>
        <i class="na-flag-card" aria-hidden="true"><img data-src="${flagUrl(n[0])}" alt="" decoding="async"><u></u></i>
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
    root.querySelector("#nationCount").textContent=`${shown} / ${N.length} RECORDS`;
    requestAnimationFrame(()=>{
      const active=list.querySelector(".na-index-btn.active");
      hydrateAround(active,2);
      if(mobileQuery.matches&&!root.classList.contains("index-open"))centerButton(active,"auto");
    });
  }

  function centerButton(button,behavior=reduced?"auto":"smooth"){
    if(!button||!mobileQuery.matches||root.classList.contains("index-open"))return;
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
    hydrateAround(active,2);
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
    hydrateAround(button,2);
    const n=byKey.get(button.dataset.k);
    if(n&&n[0]!==currentKey)show(n,{animate:true,centerPicker:false});
  }

  function setIndexOpen(open){
    if(!mobileQuery.matches)open=false;
    const wasOpen=root.classList.contains("index-open");
    root.classList.toggle("index-open",open);
    indexToggle?.setAttribute("aria-expanded",String(open));
    if(open){
      hydrateAround(list.querySelector(".na-index-btn.active"),3);
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

  function updateContent(n,{centerPicker=false}={}){
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
    renderHistory(n[0]);syncIndexSelection({center:centerPicker});updateButtons();
  }

  function show(n,{animate=true,centerPicker=false}={}){
    if(!n)return;
    clearTimeout(swapTimer);
    dossier.classList.remove("swap-next","swap-prev");
    updateContent(n,{centerPicker});
    if(animate&&!reduced){
      dossier.classList.add("swap-next");
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
  mobileQuery.addEventListener?.("change",()=>{setIndexOpen(false);renderIndex(search.value)});
  list.addEventListener("scroll",()=>{
    if(!mobileQuery.matches||root.classList.contains("index-open"))return;
    clearTimeout(pickerTimer);
    const near=nearestPickerButton();hydrateAround(near,2);
    pickerTimer=setTimeout(settlePicker,105);
  },{passive:true});

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
    pendingHandoff=true;setIndexOpen(false);show(n,{animate:false,centerPicker:true});
  });
  window.addEventListener("archive:record-opened",e=>{
    if(e.detail?.key!=="nations"||!pendingHandoff)return;
    pendingHandoff=false;setTimeout(playHandoff,110);
  });

  renderIndex();switchTab("overview");show(N[0],{animate:false,centerPicker:true});
}
