import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261008-character-v6";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;

  const character=CHARACTERS[CHARACTER_ORDER[0]];
  const binder=root.querySelector("#characterBinder");
  const stage=binder?.querySelector("[data-char-swipe]");
  const tabs=[...root.querySelectorAll("[data-char-tab]")];
  const pages=[...root.querySelectorAll("[data-char-page]")];
  const progress=[...root.querySelectorAll("[data-char-progress]")];
  const state=root.querySelector("#characterSectionState");
  const pageNo=root.querySelector("#characterPageNo");
  const pageLabel=root.querySelector("#characterPageLabel");
  const prev=root.querySelector("[data-char-prev]");
  const next=root.querySelector("[data-char-next]");
  const start=root.querySelector("[data-char-start]");
  const portrait=root.querySelector("#characterPortrait");
  const name=root.querySelector("#characterName");
  const roman=root.querySelector("#characterRoman");
  const summary=root.querySelector("#characterSummary");
  const binderName=root.querySelector("#characterBinderName");
  const ghost=root.querySelector("#characterGhost");
  const portraitName=root.querySelector("#characterPortraitName");
  const identityName=root.querySelector("#characterIdentityName");
  const affiliation=root.querySelector("#characterAffiliation");
  const position=root.querySelector("#characterPosition");
  const facts=root.querySelector("#characterFacts");
  const observation=root.querySelector("#characterObservation");
  const career=root.querySelector("#characterCareer");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sections=[
    ["01","신상","IDENTIFICATION"],
    ["02","성격","OBSERVATION"],
    ["03","경력","HISTORY"],
    ["04","연결","LINKED RECORDS"]
  ];

  let activeSection=0;
  let touchStartX=0;
  let touchStartY=0;
  let switchTimer=0;

  root.style.setProperty("--char-accent",character.accent);

  function renderCharacter(){
    name.textContent=character.name;
    roman.textContent=character.roman;
    summary.textContent=character.summary;
    binderName.textContent=character.name;
    ghost.textContent=character.name;
    portraitName.textContent=character.name;
    identityName.textContent=character.name;
    affiliation.textContent=character.affiliation;
    position.textContent=character.position;

    portrait.classList.toggle("has-image",Boolean(character.image));
    portrait.style.backgroundImage=character.image?'url("'+character.image+'")':"";

    facts.innerHTML=character.facts.map(function(item){
      return '<div><span>'+item[0]+'</span><b>'+item[1]+'</b></div>';
    }).join("");

    const personality=(character.panels.personality&&character.panels.personality.blocks)||[];
    observation.innerHTML=personality.map(function(item){
      return '<article><span>'+item[0]+'</span><p>'+item[1]+'</p></article>';
    }).join("");

    const careerBlocks=(character.panels.career&&character.panels.career.blocks)||[];
    career.innerHTML=careerBlocks.map(function(item){
      return '<article><span>'+item[0]+'</span><p>'+item[1]+'</p></article>';
    }).join("");
  }

  function updateControls(){
    tabs.forEach(function(tab,index){
      const active=index===activeSection;
      tab.classList.toggle("active",active);
      tab.setAttribute("aria-selected",active?"true":"false");
      tab.tabIndex=active?0:-1;
    });

    progress.forEach(function(item,index){
      item.classList.toggle("active",index===activeSection);
      item.classList.toggle("done",index<activeSection);
    });

    const meta=sections[activeSection];
    state.textContent=meta[0]+" / "+meta[1];
    pageNo.textContent=meta[0];
    pageLabel.textContent=meta[2];

    if(prev)prev.disabled=activeSection===0;
    if(next)next.disabled=activeSection===pages.length-1;
  }

  function setSection(index,animate=true){
    const target=Math.max(0,Math.min(index,pages.length-1));
    if(target===activeSection){
      updateControls();
      return;
    }

    const direction=target>activeSection?"forward":"back";
    activeSection=target;
    root.dataset.section=String(target);

    pages.forEach(function(page,i){
      const active=i===target;
      page.hidden=!active;
      page.classList.toggle("active",active);
      page.setAttribute("aria-hidden",active?"false":"true");
    });

    updateControls();

    if(binder&&animate&&!reduced){
      clearTimeout(switchTimer);
      binder.classList.remove("switch-forward","switch-back");
      void binder.offsetWidth;
      binder.classList.add(direction==="forward"?"switch-forward":"switch-back");
      switchTimer=setTimeout(function(){
        binder.classList.remove("switch-forward","switch-back");
      },420);
    }
  }

  tabs.forEach(function(tab,index){
    tab.addEventListener("click",function(){
      setSection(index,true);
    });

    tab.addEventListener("keydown",function(event){
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();

      let target=activeSection;
      if(event.key==="ArrowLeft")target=activeSection-1;
      if(event.key==="ArrowRight")target=activeSection+1;
      if(event.key==="Home")target=0;
      if(event.key==="End")target=tabs.length-1;

      target=Math.max(0,Math.min(target,tabs.length-1));
      setSection(target,true);
      tabs[target]?.focus();
    });
  });

  prev?.addEventListener("click",function(){
    setSection(activeSection-1,true);
  });

  next?.addEventListener("click",function(){
    setSection(activeSection+1,true);
  });

  start?.addEventListener("click",function(){
    binder?.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
  });

  if(stage){
    stage.addEventListener("touchstart",function(event){
      const touch=event.changedTouches[0];
      touchStartX=touch.clientX;
      touchStartY=touch.clientY;
    },{passive:true});

    stage.addEventListener("touchend",function(event){
      const touch=event.changedTouches[0];
      const dx=touch.clientX-touchStartX;
      const dy=touch.clientY-touchStartY;

      if(Math.abs(dx)<46||Math.abs(dx)<=Math.abs(dy)*1.15)return;
      setSection(activeSection+(dx<0?1:-1),true);
    },{passive:true});
  }

  root.querySelectorAll("[data-char-open]").forEach(function(button){
    button.addEventListener("click",function(){
      const key=button.dataset.charOpen;
      if(key==="nations"){
        window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:character.nationKey}}));
      }
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:key}}));
    });
  });

  window.addEventListener("archive:record-opened",function(event){
    if(event.detail&&event.detail.key==="characters"){
      updateControls();
    }
  });

  renderCharacter();

  pages.forEach(function(page,index){
    const active=index===0;
    page.hidden=!active;
    page.classList.toggle("active",active);
    page.setAttribute("aria-hidden",active?"false":"true");
  });

  root.dataset.section="0";
  updateControls();
}
