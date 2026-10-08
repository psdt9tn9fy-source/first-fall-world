import {CHARACTERS,CHARACTER_ORDER,CHARACTER_COUNTRIES} from "./characters-data.js?v=20261008-character-v9";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;
  const available=CHARACTER_ORDER.filter(id=>Boolean(CHARACTERS[id]));
  if(!available.length)return;
  let character=CHARACTERS[available[0]];
  const directory=root.querySelector("#characterDirectory");
  const countryTabs=root.querySelector("#characterCountryTabs");
  const cardList=root.querySelector("#characterCardList");
  const emptyState=root.querySelector("#characterDirectoryEmpty");
  let countryKey="rok";

  const hero=root.querySelector("[data-char-opening]");
  const binder=root.querySelector("#characterBinder");
  const rail=root.querySelector("#characterTrack");
  const tabs=[...root.querySelectorAll("[data-char-tab]")];
  const slides=[...root.querySelectorAll("[data-char-slide]")];
  const progress=[...root.querySelectorAll("[data-char-progress]")];
  const prev=root.querySelector("[data-char-prev]");
  const next=root.querySelector("[data-char-next]");
  const start=root.querySelector("[data-char-start]");
  const close=root.querySelector("[data-char-close]");
  const pageNumber=root.querySelector("#characterPageNumber");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active=0,scrollRaf=0;

  function put(id,value){const el=root.querySelector(id);if(el)el.textContent=value||""}
  function glance(target,entries){
    const el=root.querySelector(target);if(!el)return;
    el.replaceChildren();
    (entries||[]).forEach(([name,copy])=>{
      const item=document.createElement("article");
      const heading=document.createElement("span");
      const description=document.createElement("p");
      heading.textContent=name;description.textContent=copy;
      item.append(heading,description);el.append(item);
    });
  }
  function regionFor(key){
    return CHARACTER_COUNTRIES.find(country=>country.nationKeys.includes(key))||CHARACTER_COUNTRIES[0];
  }
  function setCountry(key){
    const group=CHARACTER_COUNTRIES.find(item=>item.key===key)||CHARACTER_COUNTRIES[0];
    countryKey=group.key;
    const people=available.map(id=>CHARACTERS[id]).filter(person=>group.nationKeys.includes(person.nationKey));
    countryTabs?.querySelectorAll("[data-char-country]").forEach(button=>
      button.setAttribute("aria-pressed",String(button.dataset.charCountry===countryKey)));
    put("#characterCountryName",group.name);
    put("#characterCountryCount",String(people.length).padStart(2,"0")+" / 등록 인물");
    put("#characterCountryNote",group.note||"");
    if(emptyState)emptyState.hidden=people.length!==0;
    cardList?.replaceChildren();
    people.forEach(person=>{
      const card=document.createElement("button");card.type="button";card.className="char-directory-card";
      card.setAttribute("aria-label",person.name+" 인물 기록 열람");
      const visual=person.visuals?.[0];
      if(visual?.src){
        const img=document.createElement("img");img.src=visual.src;img.alt="";img.loading="lazy";img.decoding="async";card.append(img);
      }
      const info=document.createElement("div");info.className="char-directory-card-info";
      const code=document.createElement("span");code.className="char-directory-card-code";code.textContent="PERSONNEL FILE // "+(person.record||"—");
      const name=document.createElement("b");name.className="char-directory-card-name";name.textContent=person.name;
      const meta=document.createElement("span");meta.className="char-directory-card-meta";
      meta.textContent=(group.key==="china"?person.nation+" · ":"")+(person.affiliation||person.nation||"");
      const action=document.createElement("span");action.className="char-directory-card-cta";action.textContent="기록 열람 →";
      info.append(code,name,meta,action);card.append(info);
      card.addEventListener("click",()=>selectCharacter(person.id));
      cardList?.append(card);
    });
  }
  function createCountries(){
    if(!countryTabs)return;
    countryTabs.replaceChildren();
    CHARACTER_COUNTRIES.forEach(group=>{
      const count=available.filter(id=>group.nationKeys.includes(CHARACTERS[id].nationKey)).length;
      const button=document.createElement("button");button.type="button";button.dataset.charCountry=group.key;
      button.setAttribute("aria-pressed","false");
      const title=document.createElement("b");title.textContent=group.name;
      const countTag=document.createElement("span");countTag.textContent=String(count).padStart(2,"0");
      button.append(title,countTag);
      button.addEventListener("click",()=>setCountry(group.key));
      countryTabs.append(button);
    });
    put("#characterTotalCount",String(available.length).padStart(2,"0"));
    setCountry(countryKey);
  }
  function show(mode){
    directory.hidden=mode!=="directory";
    hero.hidden=mode!=="hero";
    binder.hidden=mode!=="binder";
    root.dataset.mode=mode;
    root.classList.toggle("record-opened",mode==="binder");
    start?.setAttribute("aria-expanded",String(mode==="binder"));
    if(mode==="binder")move(0,true);
    if(mode==="directory")setCountry(countryKey);
    requestAnimationFrame(()=>root.scrollIntoView({behavior:"instant",block:"start"}));
  }
  function selectCharacter(id){
    if(!CHARACTERS[id])return;
    character=CHARACTERS[id];
    countryKey=regionFor(character.nationKey).key;
    render();
    setActive(0);
    show("hero");
  }
  function render(){
    root.style.setProperty("--char-accent",character.accent||"#5e82e9");
    put("#characterDossierName",character.name);
    put("#characterFileBadge","PERSONNEL / "+(character.record||"—"));
    put("#characterCoverCaption",character.nation+" / "+(character.affiliation||""));
    put("#characterPersonalityTitle",character.personTitle||"성격 기록");
    put("#characterCareerTitle",character.careerTitle||"경력 기록");
    put("#characterLinksTitle",character.linksTitle||"연결 기록");
    put("#characterLinkedNation",character.nation);
    put("#characterLinkedInstitution",character.institution||character.affiliation);
    put("#characterLinkedNote",character.relatedNote||"개별 관계 기록 준비 중");
    put("#characterName",character.name);
    put("#characterRoman",character.roman);
    put("#characterSummary",character.summary);
    put("#characterIdentityName",character.name);
    put("#characterAffiliation",character.affiliation);
    put("#characterPosition",character.position);
    put("#characterIdentityNote",character.glance?.identity);
    put("#characterPersonalityLead",character.panels?.personality?.lead);
    put("#characterCareerLead",character.panels?.career?.lead);
    put("#characterRelationsLead",character.panels?.relations?.lead);
    const cover=root.querySelector("#characterCover");
    const first=character.visuals?.[0];
    if(cover){if(first?.src){cover.src=first.src;cover.alt=character.name+" — "+first.detail}else{cover.removeAttribute("src");cover.alt="이미지 미등록"}}
    root.querySelectorAll("[data-char-image]").forEach(img=>{
      const visual=character.visuals?.[Number(img.dataset.charImage)];
      if(visual?.src){img.src=visual.src;img.alt=character.name+" — "+visual.detail}else{img.removeAttribute("src");img.alt="이미지 미등록"}
    });
    const facts=root.querySelector("#characterFacts");
    if(facts){
      facts.replaceChildren();
      (character.facts||[]).forEach(([key,value])=>{
        const row=document.createElement("div");
        const title=document.createElement("dt");
        const val=document.createElement("dd");
        title.textContent=key;val.textContent=value;
        row.append(title,val);facts.append(row);
      });
    }
    glance("#characterPersonality",character.glance?.personality||character.panels?.personality?.blocks);
    glance("#characterCareer",character.glance?.career||character.panels?.career?.blocks);
    root.querySelectorAll(".char-slide-image figcaption b").forEach((label,i)=>{
      label.textContent=character.visuals?.[i]?.label||"이미지 미등록";
    });
  }
  function setActive(index){
    if(index<0||index>=slides.length)return;
    active=index;
    root.dataset.section=String(index);
    tabs.forEach((tab,i)=>{
      if(i===index)tab.setAttribute("aria-current","location");
      else tab.removeAttribute("aria-current");
    });
    progress.forEach((line,i)=>line.classList.toggle("active",i===index));
    if(pageNumber){
      pageNumber.replaceChildren();
      pageNumber.append(document.createTextNode(String(index+1).padStart(2,"0")+" "));
      const slash=document.createElement("i");
      slash.textContent="/";
      pageNumber.append(slash,document.createTextNode(" "+String(slides.length).padStart(2,"0")));
    }
    if(prev)prev.disabled=index===0;
    if(next)next.disabled=index===slides.length-1;
  }
  function move(index,instant=false){
    index=Math.max(0,Math.min(slides.length-1,index));
    setActive(index);
    if(rail)rail.scrollTo({left:index*rail.clientWidth,behavior:(instant||reduced)?"instant":"smooth"});
  }
  function syncScroll(){
    scrollRaf=0;
    if(!rail||binder.hidden||!rail.clientWidth)return;
    setActive(Math.round(rail.scrollLeft/rail.clientWidth));
  }
  rail?.addEventListener("scroll",()=>{
    if(scrollRaf)return;
    scrollRaf=requestAnimationFrame(syncScroll);
  },{passive:true});
  rail?.addEventListener("keydown",event=>{
    if(event.target!==rail)return;
    if(event.key==="ArrowLeft"||event.key==="ArrowRight"){
      event.preventDefault();move(active+(event.key==="ArrowRight"?1:-1));
    }
    if(event.key==="Home"||event.key==="End"){
      event.preventDefault();move(event.key==="Home"?0:slides.length-1);
    }
  });
  tabs.forEach((tab,index)=>{
    tab.addEventListener("click",()=>move(index));
    tab.addEventListener("keydown",event=>{
      const keys=["ArrowLeft","ArrowRight","Home","End"];
      if(!keys.includes(event.key))return;
      event.preventDefault();
      const target=event.key==="Home"?0:event.key==="End"?slides.length-1:Math.max(0,Math.min(slides.length-1,index+(event.key==="ArrowRight"?1:-1)));
      tabs[target].focus();move(target);
    });
  });
  prev?.addEventListener("click",()=>move(active-1));
  next?.addEventListener("click",()=>move(active+1));
  start?.addEventListener("click",()=>show("binder"));
  close?.addEventListener("click",()=>show("hero"));
  root.querySelectorAll("[data-char-directory-open]").forEach(button=>{
    button.addEventListener("click",()=>show("directory"));
  });
  window.addEventListener("resize",()=>{if(!binder.hidden)move(active,true)},{passive:true});
  root.querySelectorAll("[data-char-open]").forEach(button=>{
    button.addEventListener("click",()=>{
      const key=button.dataset.charOpen;
      if(key==="nations")window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:character.nationKey}}));
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
    });
  });
  createCountries();
  render();
  setActive(0);
  // The directory becomes the entrance automatically after a second character is added.
  if(available.length>1)show("directory");
  else{directory.hidden=true;hero.hidden=false;binder.hidden=true;root.dataset.mode="hero"}
}
