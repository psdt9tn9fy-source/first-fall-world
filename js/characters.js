import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261007-character-v4";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;

  const character=CHARACTERS[CHARACTER_ORDER[0]];
  const records=[...root.querySelectorAll("[data-char-record]")];
  const progress=[...root.querySelectorAll("[data-char-progress]")];
  const state=root.querySelector("#characterUnlockState");
  const start=root.querySelector("[data-char-start]");
  const portrait=root.querySelector("#characterPortrait");
  const name=root.querySelector("#characterName");
  const roman=root.querySelector("#characterRoman");
  const summary=root.querySelector("#characterSummary");
  const portraitName=root.querySelector("#characterPortraitName");
  const identityName=root.querySelector("#characterIdentityName");
  const affiliation=root.querySelector("#characterAffiliation");
  const position=root.querySelector("#characterPosition");
  const facts=root.querySelector("#characterFacts");
  const observation=root.querySelector("#characterObservation");
  const career=root.querySelector("#characterCareer");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  let unlockedCount=1;
  let activeRecord=0;
  let scrollTick=false;

  root.style.setProperty("--char-accent",character.accent);

  function renderCharacter(){
    name.textContent=character.name;
    roman.textContent=character.roman;
    summary.textContent=character.summary;
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

  function updateUnlockUI(){
    state.textContent=String(unlockedCount).padStart(2,"0")+" / 04 해제됨";

    records.forEach(function(record,index){
      const button=record.querySelector("[data-char-unlock]");
      const status=record.querySelector(".char-record-status b");
      const kicker=record.querySelector(".char-record-kicker");

      if(index<unlockedCount){
        record.classList.add("unlocked");
        record.classList.remove("locked","waiting");
        if(status)status.textContent="복원 완료";
        if(kicker)kicker.textContent=kicker.textContent.replace("SEALED","RECOVERED");
        if(button)button.disabled=true;
      }else{
        record.classList.add("locked");
        record.classList.remove("unlocked");
        if(status)status.textContent=index===unlockedCount?"해제 가능":"순차 잠금";
        if(button){
          const ready=index===unlockedCount;
          button.disabled=!ready;
          button.classList.toggle("waiting",!ready);
          const label=button.querySelector("span");
          if(label)label.textContent=ready?"기록 해제":"이전 기록 필요";
        }
      }
    });

    progress.forEach(function(item,index){
      item.classList.toggle("done",index<unlockedCount&&index!==activeRecord);
      item.classList.toggle("active",index===activeRecord);
    });

    root.classList.toggle("complete",unlockedCount===records.length);
  }

  function setActiveRecord(index){
    activeRecord=Math.max(0,Math.min(index,records.length-1));
    records.forEach(function(record,i){
      record.classList.toggle("active",i===activeRecord);
    });
    progress.forEach(function(item,i){
      item.classList.toggle("active",i===activeRecord);
      item.classList.toggle("done",i<unlockedCount&&i!==activeRecord);
    });
  }

  function unlockRecord(index){
    if(index!==unlockedCount||index>=records.length)return;

    const record=records[index];
    const button=record.querySelector("[data-char-unlock]");
    const status=record.querySelector(".char-record-status b");

    if(button)button.disabled=true;
    if(status)status.textContent="복원 중";
    record.classList.add("unlocking");
    record.classList.remove("waiting");
    setActiveRecord(index);

    const finish=function(){
      record.classList.remove("unlocking","locked");
      record.classList.add("unlocked");
      unlockedCount=index+1;
      updateUnlockUI();
    };

    if(reduced)finish();
    else setTimeout(finish,760);
  }

  function updateScrollState(){
    scrollTick=false;
    const threshold=innerWidth<=820?165:172;
    let current=0;

    records.forEach(function(record,index){
      const rect=record.getBoundingClientRect();
      if(rect.top<=threshold+18)current=index;
    });

    setActiveRecord(current);
  }

  function onScroll(){
    if(scrollTick)return;
    scrollTick=true;
    requestAnimationFrame(updateScrollState);
  }

  if(start){
    start.addEventListener("click",function(){
      if(records[0])records[0].scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
    });
  }

  root.querySelectorAll("[data-char-unlock]").forEach(function(button){
    button.addEventListener("click",function(){
      unlockRecord(Number(button.dataset.charUnlock));
    });
  });

  root.querySelectorAll("[data-char-open]").forEach(function(button){
    button.addEventListener("click",function(){
      if(unlockedCount<records.length)return;
      const key=button.dataset.charOpen;
      if(key==="nations"){
        window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:character.nationKey}}));
      }
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:key}}));
    });
  });

  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);

  window.addEventListener("archive:record-opened",function(event){
    if(event.detail&&event.detail.key==="characters"){
      requestAnimationFrame(updateScrollState);
    }
  });

  renderCharacter();
  updateUnlockUI();
  updateScrollState();
}
