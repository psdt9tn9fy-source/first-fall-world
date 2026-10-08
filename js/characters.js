import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261008-character-v8";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;
  const character=CHARACTERS[CHARACTER_ORDER[0]];
  if(!character)return;

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
  root.style.setProperty("--char-accent",character.accent);

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
  function render(){
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
    if(cover&&first){cover.src=first.src;cover.alt=character.name+" — "+first.detail}
    root.querySelectorAll("[data-char-image]").forEach(img=>{
      const visual=character.visuals?.[Number(img.dataset.charImage)];
      if(visual){img.src=visual.src;img.alt=character.name+" — "+visual.detail}
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
    glance("#characterPersonality",character.glance?.personality);
    glance("#characterCareer",character.glance?.career);
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
  start?.addEventListener("click",()=>{
    hero.hidden=true;
    binder.hidden=false;
    root.classList.add("record-opened");
    start.setAttribute("aria-expanded","true");
    move(0,true);
    requestAnimationFrame(()=>root.scrollIntoView({behavior:"instant",block:"start"}));
  });
  close?.addEventListener("click",()=>{
    binder.hidden=true;
    hero.hidden=false;
    root.classList.remove("record-opened");
    start?.setAttribute("aria-expanded","false");
    requestAnimationFrame(()=>root.scrollIntoView({behavior:"instant",block:"start"}));
  });
  window.addEventListener("resize",()=>{if(!binder.hidden)move(active,true)},{passive:true});
  root.querySelectorAll("[data-char-open]").forEach(button=>{
    button.addEventListener("click",()=>{
      const key=button.dataset.charOpen;
      if(key==="nations")window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:character.nationKey}}));
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
    });
  });
  render();
  setActive(0);
}
