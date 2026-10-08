import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261008-character-v7";

/* V7: one access gate, four continuously readable sections, one active-photo state. */
export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;
  const character=CHARACTERS[CHARACTER_ORDER[0]];
  if(!character)return;
  const binder=root.querySelector("#characterBinder");
  const start=root.querySelector("[data-char-start]");
  const cover=root.querySelector("#characterCover");
  const portrait=root.querySelector("#characterPortrait");
  const photoNumber=root.querySelector("#characterImageCounter");
  const photoLabel=root.querySelector("#characterImageLabel");
  const photoDetail=root.querySelector("#characterImageDetail");
  const chapters=[...root.querySelectorAll("[data-char-page]")];
  const tabs=[...root.querySelectorAll("[data-char-tab]")];
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const visuals=character.visuals||[];
  let activeSection=0;
  let photoRequest=0;
  let rafId=0;
  let jumpTarget=null;
  let jumpTimer=0;

  root.style.setProperty("--char-accent",character.accent);
  function put(id,value){
    const element=root.querySelector(id);
    if(element)element.textContent=value||"";
  }
  function makeRecords(target,blocks){
    const element=root.querySelector(target);
    if(!element)return;
    element.replaceChildren();
    (blocks||[]).forEach(function(item){
      const row=document.createElement("article");
      const heading=document.createElement("span");
      const body=document.createElement("p");
      heading.textContent=item[0];
      body.textContent=item[1];
      row.append(heading,body);
      element.appendChild(row);
    });
  }
  function render(){
    put("#characterName",character.name);
    put("#characterRoman",character.roman);
    put("#characterSummary",character.summary);
    put("#characterIdentityName",character.name);
    put("#characterAffiliation",character.affiliation);
    put("#characterPosition",character.position);
    put("#characterBasicLead",character.panels?.basic?.lead);
    put("#characterPersonalityLead",character.panels?.personality?.lead);
    put("#characterCareerLead",character.panels?.career?.lead);
    put("#characterRelationsLead",character.panels?.relations?.lead);
    const identity=document.querySelector("[data-char-hero-affiliation]");
    if(identity)identity.textContent=character.nation+" // "+character.affiliation;
    const facts=root.querySelector("#characterFacts");
    if(facts){
      facts.replaceChildren();
      (character.facts||[]).forEach(function(item){
        const wrapper=document.createElement("div");
        const key=document.createElement("dt");
        const val=document.createElement("dd");
        key.textContent=item[0];
        val.textContent=item[1];
        wrapper.append(key,val);
        facts.appendChild(wrapper);
      });
    }
    // Avoid repeating affiliation and body measurements immediately under the fact grid.
    const basics=(character.panels?.basic?.blocks||[]).filter(block=>!["신분","체형"].includes(block[0]));
    makeRecords("#characterBasic",basics);
    makeRecords("#characterObservation",character.panels?.personality?.blocks);
    makeRecords("#characterCareer",character.panels?.career?.blocks);
    makeRecords("#characterRelations",character.panels?.relations?.blocks);
    if(visuals[0]&&cover){
      cover.src=visuals[0].src;
      cover.alt=character.name+" — "+visuals[0].detail;
    }
    root.querySelectorAll("[data-char-mobile-image]").forEach(function(img){
      const visual=visuals[Number(img.dataset.charMobileImage)];
      if(visual){
        img.src=visual.src;
        img.alt=character.name+" — "+visual.detail;
      }
    });
  }

  function setVisual(index){
    const visual=visuals[index];
    if(!visual||!portrait)return;
    const request=++photoRequest;
    const asset=new Image();
    asset.decoding="async";
    asset.onload=function(){
      if(request!==photoRequest)return;
      portrait.src=visual.src;
      portrait.alt=character.name+" — "+visual.detail;
      if(photoLabel)photoLabel.textContent=visual.label;
      if(photoDetail)photoDetail.textContent=visual.detail;
      if(photoNumber)photoNumber.textContent=String(index+1).padStart(2,"0")+" / "+String(visuals.length).padStart(2,"0");
      if(!reduced){
        portrait.classList.remove("visual-enter");
        void portrait.offsetWidth;
        portrait.classList.add("visual-enter");
      }
    };
    asset.onerror=function(){
      if(request!==photoRequest)return;
      portrait.removeAttribute("src");
      if(photoLabel)photoLabel.textContent="사진 없음";
      if(photoDetail)photoDetail.textContent="이미지를 불러올 수 없습니다.";
    };
    asset.src=visual.src;
  }
  function setActive(index){
    if(index<0||index>=chapters.length)return;
    if(activeSection===index&&root.dataset.section===String(index))return;
    activeSection=index;
    root.dataset.section=String(index);
    tabs.forEach(function(tab,i){
      if(i===index)tab.setAttribute("aria-current","location");
      else tab.removeAttribute("aria-current");
    });
    if(!binder.hidden)setVisual(index);
  }
  function readScroll(){
    rafId=0;
    if(binder.hidden||!root.closest(".view")?.classList.contains("active"))return;
    if(jumpTarget!==null){
      const distance=Math.abs(chapters[jumpTarget].getBoundingClientRect().top-(window.innerWidth<=820?182:160));
      if(distance>22)return;
      jumpTarget=null;
      clearTimeout(jumpTimer);
    }
    const threshold=Math.max(175,Math.min(window.innerHeight*.39,340));
    let selected=0;
    chapters.forEach(function(chapter,index){
      if(chapter.getBoundingClientRect().top<=threshold)selected=index;
    });
    setActive(selected);
  }
  function scheduleRead(){
    if(!rafId)rafId=requestAnimationFrame(readScroll);
  }
  function jumpTo(index){
    if(binder.hidden||!chapters[index])return;
    jumpTarget=index;
    setActive(index);
    clearTimeout(jumpTimer);
    jumpTimer=setTimeout(function(){jumpTarget=null;scheduleRead()},1100);
    chapters[index].scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
  }

  tabs.forEach(function(tab,index){
    tab.addEventListener("click",function(){jumpTo(index)});
    tab.addEventListener("keydown",function(event){
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      event.preventDefault();
      let next=index;
      if(event.key==="ArrowLeft")next=Math.max(0,index-1);
      else if(event.key==="ArrowRight")next=Math.min(tabs.length-1,index+1);
      else if(event.key==="Home")next=0;
      else if(event.key==="End")next=tabs.length-1;
      tabs[next].focus();
      jumpTo(next);
    });
  });
  start?.addEventListener("click",function(){
    if(binder.hidden){
      binder.hidden=false;
      root.classList.add("record-opened");
      start.setAttribute("aria-expanded","true");
      activeSection=-1;
      setActive(0);
    }
    requestAnimationFrame(function(){
      root.scrollIntoView({behavior:"auto",block:"start"});
      scheduleRead();
    });
  });

  root.querySelectorAll("[data-char-open]").forEach(function(button){
    button.addEventListener("click",function(){
      const key=button.dataset.charOpen;
      if(key==="nations"){
        window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:character.nationKey}}));
      }
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
    });
  });
  window.addEventListener("scroll",scheduleRead,{passive:true});
  window.addEventListener("resize",scheduleRead,{passive:true});
  window.addEventListener("archive:record-opened",function(event){
    if(event.detail?.key==="characters")requestAnimationFrame(scheduleRead);
  });
  render();
  // The dossier stays inaccessible until its explicit opening action.
}
