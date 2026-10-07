import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261008-character-v5";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;

  const character=CHARACTERS[CHARACTER_ORDER[0]];
  const story=root.querySelector("#characterStory");
  const steps=[...root.querySelectorAll("[data-char-step]")];
  const scenes=[...root.querySelectorAll("[data-char-scene]")];
  const progress=[...root.querySelectorAll("[data-char-progress]")];
  const state=root.querySelector("#characterSceneState");
  const chapterNo=root.querySelector("#characterChapterNo");
  const chapterLabel=root.querySelector("#characterChapterLabel");
  const start=root.querySelector("[data-char-start]");
  const portrait=root.querySelector("#characterPortrait");
  const name=root.querySelector("#characterName");
  const roman=root.querySelector("#characterRoman");
  const summary=root.querySelector("#characterSummary");
  const ghost=root.querySelector("#characterGhost");
  const portraitName=root.querySelector("#characterPortraitName");
  const identityName=root.querySelector("#characterIdentityName");
  const affiliation=root.querySelector("#characterAffiliation");
  const position=root.querySelector("#characterPosition");
  const facts=root.querySelector("#characterFacts");
  const observation=root.querySelector("#characterObservation");
  const career=root.querySelector("#characterCareer");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sceneMeta=[
    ["01","식별","IDENTIFICATION"],
    ["02","성격","OBSERVATION"],
    ["03","경력","HISTORY"],
    ["04","연결","CONNECTED WORLD"]
  ];

  let activeScene=-1;
  let ticking=false;

  root.style.setProperty("--char-accent",character.accent);

  function renderCharacter(){
    name.textContent=character.name;
    roman.textContent=character.roman;
    summary.textContent=character.summary;
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

  function setScene(index){
    const next=Math.max(0,Math.min(index,scenes.length-1));
    if(next===activeScene)return;
    activeScene=next;
    root.dataset.scene=String(next);

    scenes.forEach(function(scene,i){
      scene.classList.toggle("active",i===next);
      scene.setAttribute("aria-hidden",i===next?"false":"true");
    });

    progress.forEach(function(item,i){
      item.classList.toggle("active",i===next);
      item.classList.toggle("done",i<next);
    });

    const meta=sceneMeta[next];
    state.textContent=meta[0]+" / "+meta[1];
    chapterNo.textContent=meta[0];
    chapterLabel.textContent=meta[2];
  }

  function updateSceneFromScroll(){
    ticking=false;
    if(!story||!steps.length)return;

    const storyRect=story.getBoundingClientRect();
    if(storyRect.bottom<=0||storyRect.top>=innerHeight)return;

    const targetY=innerHeight*.54;
    let bestIndex=0;
    let bestDistance=Infinity;

    steps.forEach(function(step,index){
      const rect=step.getBoundingClientRect();
      const center=rect.top+rect.height*.5;
      const distance=Math.abs(center-targetY);
      if(distance<bestDistance){
        bestDistance=distance;
        bestIndex=index;
      }
    });

    setScene(bestIndex);
  }

  function onScroll(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(updateSceneFromScroll);
  }

  if(start){
    start.addEventListener("click",function(){
      if(!story)return;
      story.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
    });
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

  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  window.addEventListener("archive:record-opened",function(event){
    if(event.detail&&event.detail.key==="characters"){
      requestAnimationFrame(updateSceneFromScroll);
    }
  });

  renderCharacter();
  setScene(0);
  updateSceneFromScroll();
}
