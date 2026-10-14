import {MILITARY_NATIONS, MILITARY_NATION_SECTIONS} from "./military-nations-data.js?v=20261014-country-tabs-v1";

/* Nation tabs add a parallel country dossier without duplicating generic MILITARY modes.
   Generic interactive diagrams remain intact under the I.D.A. / common tab. */
export function initNationMilitary(){
  const root=document.querySelector("#milCommand");
  if(!root||root.querySelector(".mil-country-nav"))return;
  const modes=root.querySelector(".mil-modes");
  if(!modes)return;

  const nav=document.createElement("nav");
  nav.className="mil-country-nav";
  nav.setAttribute("aria-label","국가별 군사체계 선택");
  const countries=[
    ["ida","I.D.A. / 공통","연합 개념도"],
    ["rok","대한민국","ROK / 2134"],
    ["rus","러시아 연방","RUS / 2134"]
  ];
  countries.forEach(([key,label,sub])=>{
    const button=document.createElement("button");
    button.type="button";
    button.dataset.milCountryPick=key;
    button.setAttribute("aria-pressed",String(key==="ida"));
    button.innerHTML="<b></b><small></small>";
    button.querySelector("b").textContent=label;
    button.querySelector("small").textContent=sub;
    if(key==="ida")button.classList.add("active");
    nav.append(button);
  });
  root.insertBefore(nav,modes);

  const panel=document.createElement("section");
  panel.className="mil-country-panel";
  panel.hidden=true;
  panel.setAttribute("aria-label","선택 국가 군사기록");
  panel.innerHTML=`
    <header class="mil-country-hero">
      <div><span data-mil-nation-code></span><h3 data-mil-nation-name></h3><p data-mil-nation-summary></p></div>
      <aside><span>STATE MILITARY RECORD / 2134</span><b data-mil-nation-tagline></b></aside>
    </header>
    <nav class="mil-country-subnav" aria-label="선택 국가 기록 분류"></nav>
    <div class="mil-country-workspace">
      <div class="mil-country-list">
        <div class="mil-country-list-header"><span data-mil-section-code></span><b data-mil-section-title></b></div>
        <div class="mil-country-items" aria-label="국가 군사기록 항목"></div>
      </div>
      <article class="mil-country-detail" aria-live="polite" aria-atomic="true">
        <div class="mil-country-detail-code" data-mil-detail-code></div>
        <h4 data-mil-detail-title></h4>
        <p data-mil-detail-meta></p>
        <p data-mil-detail-body></p>
        <div class="mil-country-chips" data-mil-detail-facts></div>
        <div class="mil-country-disclaimer">2134년 AFTER DESCENT 가상 역사 설정 · 현존 군대의 실제 조직표와 다를 수 있음</div>
      </article>
    </div>
    <footer class="mil-country-footer">STATE DOSSIER // 국가별 군사제도는 독립적으로 유지되며 I.D.A. 연합작전은 협정에 따라 연결된다.</footer>
  `;
  root.insertBefore(panel,modes);

  const sectionNav=panel.querySelector(".mil-country-subnav");
  MILITARY_NATION_SECTIONS.forEach(([key,label,no])=>{
    const button=document.createElement("button");
    button.type="button";
    button.dataset.milCountrySection=key;
    button.innerHTML="<span></span><b></b>";
    button.querySelector("span").textContent=no;
    button.querySelector("b").textContent=label;
    sectionNav.append(button);
  });

  let nationKey="ida",sectionKey="command",selectedIndex=0;
  const selectors={
    code:panel.querySelector("[data-mil-nation-code]"),
    name:panel.querySelector("[data-mil-nation-name]"),
    summary:panel.querySelector("[data-mil-nation-summary]"),
    tagline:panel.querySelector("[data-mil-nation-tagline]"),
    sectionCode:panel.querySelector("[data-mil-section-code]"),
    sectionTitle:panel.querySelector("[data-mil-section-title]"),
    items:panel.querySelector(".mil-country-items"),
    detailCode:panel.querySelector("[data-mil-detail-code]"),
    detailTitle:panel.querySelector("[data-mil-detail-title]"),
    detailMeta:panel.querySelector("[data-mil-detail-meta]"),
    detailBody:panel.querySelector("[data-mil-detail-body]"),
    detailFacts:panel.querySelector("[data-mil-detail-facts]")
  };

  function selectItem(index){
    const records=MILITARY_NATIONS[nationKey]?.sections[sectionKey];
    if(!records?.[index])return;
    selectedIndex=index;
    selectors.items.querySelectorAll("button[data-mil-country-item]").forEach((b,i)=>{
      const active=i===index;
      b.classList.toggle("active",active);
      b.setAttribute("aria-pressed",String(active));
    });
    const record=records[index];
    const sec=MILITARY_NATION_SECTIONS.find(([id])=>id===sectionKey);
    selectors.detailCode.textContent=`${MILITARY_NATIONS[nationKey].code} / ${sec[2]} · ${String(index+1).padStart(2,"0")}`;
    selectors.detailTitle.textContent=record.name;
    selectors.detailMeta.textContent=record.meta;
    selectors.detailBody.textContent=record.body;
    selectors.detailFacts.replaceChildren();
    (record.facts||[]).forEach(fact=>{
      const pill=document.createElement("span");
      pill.textContent=fact;
      selectors.detailFacts.append(pill);
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
    selectors.sectionCode.textContent="MILITARY RECORD / "+section[2];
    selectors.sectionTitle.textContent=section[1];
    selectors.items.replaceChildren();
    data.sections[key].forEach((item,index)=>{
      const b=document.createElement("button");
      b.type="button";
      b.dataset.milCountryItem=String(index);
      b.setAttribute("aria-pressed","false");
      const number=document.createElement("span");
      number.textContent=String(index+1).padStart(2,"0");
      const lines=document.createElement("span");
      lines.className="mil-country-item-copy";
      const title=document.createElement("b");
      title.textContent=item.name;
      const small=document.createElement("small");
      small.textContent=item.meta;
      lines.append(title,small);
      b.append(number,lines);
      selectors.items.append(b);
    });
    selectItem(0);
  }

  function setNation(key){
    if(key!=="ida"&&!MILITARY_NATIONS[key])return;
    nationKey=key;
    root.dataset.milCountry=key;
    const generic=key==="ida";
    panel.hidden=generic;
    nav.querySelectorAll("button").forEach(button=>{
      const active=button.dataset.milCountryPick===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    window.dispatchEvent(new CustomEvent("military:nation-changed",{detail:{key}}));
    if(generic)return;
    const data=MILITARY_NATIONS[key];
    panel.dataset.nation=key;
    selectors.code.textContent=data.code+" / NATIONAL DEFENSE ARCHIVE";
    selectors.name.textContent=data.name+" · "+data.eng;
    selectors.summary.textContent=data.summary;
    selectors.tagline.textContent=data.tagline;
    setSection(sectionKey);
  }
  nav.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-pick]");
    if(b)setNation(b.dataset.milCountryPick);
  });
  sectionNav.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-section]");
    if(b)setSection(b.dataset.milCountrySection);
  });
  selectors.items.addEventListener("click",e=>{
    const b=e.target.closest("button[data-mil-country-item]");
    if(b)selectItem(Number(b.dataset.milCountryItem));
  });
  setNation("ida");
}
