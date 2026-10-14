import {MILITARY_NATIONS,MILITARY_NATION_SECTIONS} from "./military-nations-data.js?v=20261014-country-archive-v2";
import {N,ext} from "./data.js?v=20261007-refactor-3";

/* One nation catalogue shared by desktop and mobile. Country details are data-driven. */
export function initNationMilitary(){
  const root=document.querySelector("#milCommand");
  if(!root||root.querySelector(".mil-country-nav"))return;
  const modes=root.querySelector(".mil-modes");
  if(!modes)return;

  const countries=N.map(n=>({key:n[0],name:n[2],code:n[1].split(" // ")[0],eng:n[3]}));
  const getFlag=key=>"./assets/flags-hq/"+key+"-2134."+(ext[key]||"jpg");
  const nav=document.createElement("div");
  nav.className="mil-country-nav";
  nav.innerHTML='<div class="mil-current"><span class="mil-micro">SELECTED ARCHIVE / 2134</span><div class="mil-current-name"><img data-mil-current-flag alt="" hidden><div><b data-mil-current-name>I.D.A. 연합군</b><small data-mil-current-code>ALLIANCE / GENERAL RECORD</small></div></div></div><button type="button" class="mil-country-toggle" aria-expanded="false" aria-controls="milCountryCatalog"><span>국가별 군사기록</span><b>국가 선택 <i aria-hidden="true">⌄</i></b></button>';
  root.insertBefore(nav,modes);
  const catalog=document.createElement("div");
  catalog.className="mil-country-catalog";
  catalog.id="milCountryCatalog";
  catalog.hidden=true;
  catalog.innerHTML='<div class="mil-catalog-head"><div><span class="mil-micro">WORLD DEFENSE DIRECTORY / 17 STATES</span><h3>국가별 군사체계</h3></div><button type="button" data-mil-catalog-close aria-label="국가 목록 닫기">닫기 ×</button></div><div class="mil-country-grid" role="group" aria-label="국가별 군사체계"></div><p class="mil-catalog-foot">국가별 기록은 순차적으로 공개됩니다. <b>DATA PENDING</b>은 아직 열람 준비 중인 자료입니다.</p>';
  nav.after(catalog);
  const grid=catalog.querySelector(".mil-country-grid");
  const entries=[{key:"ida",name:"I.D.A. 국제연합방위기구",code:"IDA",eng:"ALLIANCE RECORD"},...countries];
  entries.forEach(item=>{
    const ready=item.key==="ida"||Boolean(MILITARY_NATIONS[item.key]);
    const button=document.createElement("button");
    button.type="button";
    button.dataset.milCountryPick=item.key;
    button.className="mil-country-option";
    button.setAttribute("aria-pressed",String(item.key==="ida"));
    const emblem=document.createElement("span");
    emblem.className="mil-country-emblem";
    if(item.key==="ida"){emblem.classList.add("mil-emblem-ida");emblem.textContent="I.D.A."}
    else{const im=document.createElement("img");im.src=getFlag(item.key);im.alt="";im.loading="lazy";emblem.append(im)}
    const info=document.createElement("span");
    info.className="mil-country-option-text";
    const name=document.createElement("b");name.textContent=item.name;
    const code=document.createElement("small");code.textContent=item.code+" / "+(ready?"RECORD AVAILABLE":"DATA PENDING");
    info.append(name,code);
    button.append(emblem,info);
    grid.append(button);
  });

  const panel=document.createElement("section");
  panel.className="mil-country-panel";
  panel.hidden=true;
  panel.setAttribute("aria-label","국가별 군사 기록");
  panel.innerHTML='<header class="mil-country-hero"><div class="mil-country-hero-main"><span class="mil-micro" data-mil-nation-code></span><h3 data-mil-nation-name></h3><p data-mil-nation-summary></p></div><aside><span class="mil-micro">OPERATIONAL PROFILE</span><b data-mil-nation-tagline></b></aside></header><nav class="mil-country-subnav" aria-label="군사 기록 분류"></nav><div class="mil-country-workspace"><div class="mil-country-list"><div class="mil-country-list-header"><span data-mil-section-code></span><b data-mil-section-title></b></div><div class="mil-country-items"></div></div><article class="mil-country-detail" aria-live="polite" aria-atomic="true"><div class="mil-country-detail-code" data-mil-detail-code></div><h4 data-mil-detail-title></h4><p data-mil-detail-meta></p><p data-mil-detail-body></p><div class="mil-country-chips" data-mil-detail-facts></div></article></div><footer class="mil-country-footer">I.D.A. / WORLD DEFENSE ARCHIVE · 2134</footer>';
  root.insertBefore(panel,modes);

  const pending=document.createElement("section");
  pending.className="mil-country-pending";
  pending.hidden=true;
  pending.setAttribute("aria-label","기록 준비 중");
  pending.innerHTML='<span class="mil-micro">STATE MILITARY DOSSIER</span><div class="mil-pending-identity"><img data-mil-pending-flag alt=""><div><span data-mil-pending-code></span><h3 data-mil-pending-title></h3></div></div><div class="mil-pending-divider"></div><strong>DATA PENDING</strong><p>해당 국가의 세부 군사기록은 현재 열람 준비 중입니다.</p><small>I.D.A. / ARCHIVE INDEX 2134</small>';
  root.insertBefore(pending,modes);

  const q=sel=>panel.querySelector(sel);
  const sectionNav=q(".mil-country-subnav");
  MILITARY_NATION_SECTIONS.forEach(([key,label,no])=>{
    const button=document.createElement("button");
    button.type="button";
    button.dataset.milCountrySection=key;
    button.innerHTML="<span></span><b></b>";
    button.querySelector("span").textContent=no;
    button.querySelector("b").textContent=label;
    sectionNav.append(button);
  });

  const fields={
    code:q("[data-mil-nation-code]"),name:q("[data-mil-nation-name]"),
    summary:q("[data-mil-nation-summary]"),tagline:q("[data-mil-nation-tagline]"),
    sectionCode:q("[data-mil-section-code]"),sectionTitle:q("[data-mil-section-title]"),
    items:q(".mil-country-items"),detailCode:q("[data-mil-detail-code]"),
    detailTitle:q("[data-mil-detail-title]"),detailMeta:q("[data-mil-detail-meta]"),
    detailBody:q("[data-mil-detail-body]"),detailFacts:q("[data-mil-detail-facts]")
  };
  let nationKey="ida",sectionKey="command";

  function showCatalog(open){
    catalog.hidden=!open;
    nav.querySelector(".mil-country-toggle").setAttribute("aria-expanded",String(open));
    root.classList.toggle("mil-catalog-open",open);
  }
  function selectItem(index){
    const records=MILITARY_NATIONS[nationKey]?.sections[sectionKey];
    if(!records?.[index])return;
    fields.items.querySelectorAll("button").forEach((b,i)=>{
      const active=i===index;b.classList.toggle("active",active);
      b.setAttribute("aria-pressed",String(active));
    });
    const record=records[index],section=MILITARY_NATION_SECTIONS.find(([id])=>id===sectionKey);
    fields.detailCode.textContent=MILITARY_NATIONS[nationKey].code+" / "+section[2]+" — "+String(index+1).padStart(2,"0");
    fields.detailTitle.textContent=record.name;
    fields.detailMeta.textContent=record.meta;
    fields.detailBody.textContent=record.body;
    fields.detailFacts.replaceChildren();
    (record.facts||[]).forEach(text=>{
      const badge=document.createElement("span");badge.textContent=text;fields.detailFacts.append(badge);
    });
  }
  function setSection(key){
    const data=MILITARY_NATIONS[nationKey];
    if(!data?.sections[key])return;
    sectionKey=key;
    const section=MILITARY_NATION_SECTIONS.find(([id])=>id===key);
    sectionNav.querySelectorAll("button").forEach(button=>{
      const active=button.dataset.milCountrySection===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    fields.sectionCode.textContent="DOSSIER / "+section[2];
    fields.sectionTitle.textContent=section[1];
    fields.items.replaceChildren();
    data.sections[key].forEach((item,index)=>{
      const b=document.createElement("button");
      b.type="button";
      b.dataset.milCountryItem=String(index);
      b.setAttribute("aria-pressed","false");
      const no=document.createElement("span");
      no.className="mil-country-item-number";
      no.textContent=String(index+1).padStart(2,"0");
      const lines=document.createElement("span");
      lines.className="mil-country-item-copy";
      const title=document.createElement("b");title.textContent=item.name;
      const description=document.createElement("small");description.textContent=item.meta;
      lines.append(title,description);b.append(no,lines);fields.items.append(b);
    });
    selectItem(0);
  }
  function setNation(key){
    const item=entries.find(entry=>entry.key===key);
    if(!item)return;
    nationKey=key;
    root.dataset.milCountry=key;
    const record=MILITARY_NATIONS[key];
    const isIda=key==="ida";
    panel.hidden=!record;
    pending.hidden=isIda||Boolean(record);
    const currentFlag=nav.querySelector("[data-mil-current-flag]");
    currentFlag.hidden=isIda;
    if(!isIda)currentFlag.src=getFlag(key);
    nav.querySelector("[data-mil-current-name]").textContent=isIda?"I.D.A. 국제연합방위기구":item.name;
    nav.querySelector("[data-mil-current-code]").textContent=isIda?"ALLIANCE / GENERAL RECORD":item.code+" / "+(record?"RECORD AVAILABLE":"DATA PENDING");
    grid.querySelectorAll("button").forEach(button=>{
      const active=button.dataset.milCountryPick===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    showCatalog(false);
    window.dispatchEvent(new CustomEvent("military:nation-changed",{detail:{key}}));
    if(record){
      panel.dataset.nation=key;
      fields.code.textContent=record.code+" / NATIONAL MILITARY ARCHIVE";
      fields.name.textContent=record.name+" · "+record.eng;
      fields.summary.textContent=record.summary;
      fields.tagline.textContent=record.tagline;
      setSection("command");
    }else if(!isIda){
      pending.querySelector("[data-mil-pending-title]").textContent=item.name;
      pending.querySelector("[data-mil-pending-code]").textContent=item.code+" / 2134";
      pending.querySelector("[data-mil-pending-flag]").src=getFlag(key);
    }
  }
  nav.querySelector(".mil-country-toggle").addEventListener("click",()=>showCatalog(catalog.hidden));
  catalog.querySelector("[data-mil-catalog-close]").addEventListener("click",()=>showCatalog(false));
  grid.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-pick]");
    if(b)setNation(b.dataset.milCountryPick);
  });
  sectionNav.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-section]");
    if(b)setSection(b.dataset.milCountrySection);
  });
  fields.items.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-item]");
    if(b)selectItem(Number(b.dataset.milCountryItem));
  });
  window.addEventListener("military:select-nation",event=>setNation(event.detail?.key||"ida"));
  setNation("ida");
}