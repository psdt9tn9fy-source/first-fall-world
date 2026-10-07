import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261007-character-v2";

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;

  const roster=root.querySelector("#characterRoster");
  const detailTabs=[...root.querySelectorAll("[data-char-panel]")];
  const portrait=root.querySelector("#characterPortrait");
  const portraitName=root.querySelector("#characterPortraitName");
  const watermark=root.querySelector("#characterWatermark");
  const romanGhost=root.querySelector("#characterRomanGhost");
  const name=root.querySelector("#characterName");
  const hanja=root.querySelector("#characterHanja");
  const roman=root.querySelector("#characterRoman");
  const affiliation=root.querySelector("#characterAffiliation");
  const position=root.querySelector("#characterPosition");
  const summary=root.querySelector("#characterSummary");
  const facts=root.querySelector("#characterFacts");
  const panelTitle=root.querySelector("#characterPanelTitle");
  const panelLead=root.querySelector("#characterPanelLead");
  const panelBlocks=root.querySelector("#characterPanelBlocks");
  const recordNo=root.querySelector("#characterRecordNo");
  const counter=root.querySelector("#characterCounter");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  let activeId=CHARACTER_ORDER[0];
  let activePanel="basic";

  function renderRoster(){
    roster.innerHTML=CHARACTER_ORDER.map(id=>{
      const c=CHARACTERS[id];
      return `<button class="char-roster-item ${id===activeId?"active":""}" type="button" data-char-id="${id}">
        <span class="char-roster-mark">${c.record}</span>
        <span class="char-roster-copy"><small>CHARACTER</small><b>${c.name}</b><em>${c.affiliation}</em></span>
      </button>`;
    }).join("");

    roster.classList.toggle("single-character",CHARACTER_ORDER.length===1);
    roster.querySelectorAll("[data-char-id]").forEach(button=>{
      button.addEventListener("click",()=>selectCharacter(button.dataset.charId));
    });
  }

  function renderPanel(){
    const character=CHARACTERS[activeId];
    const panel=character.panels[activePanel]||character.panels.basic;

    detailTabs.forEach(button=>{
      const active=button.dataset.charPanel===activePanel;
      button.classList.toggle("active",active);
      active?button.setAttribute("aria-current","true"):button.removeAttribute("aria-current");
    });

    panelTitle.textContent=panel.title;
    panelLead.textContent=panel.lead;
    panelBlocks.innerHTML=panel.blocks.map(([label,value])=>
      `<article><span>${label}</span><p>${value}</p></article>`
    ).join("");

    if(!reduced){
      panelBlocks.animate(
        [{opacity:.18,transform:"translateY(7px)"},{opacity:1,transform:"none"}],
        {duration:240,easing:"ease-out"}
      );
    }
  }

  function renderCharacter(animate=false){
    const character=CHARACTERS[activeId];
    const index=CHARACTER_ORDER.indexOf(activeId)+1;

    root.style.setProperty("--char-accent",character.accent);
    recordNo.textContent=character.record;
    counter.textContent=`${String(index).padStart(3,"0")} / ${String(CHARACTER_ORDER.length).padStart(3,"0")}`;
    watermark.textContent=character.name;
    romanGhost.textContent=character.roman;
    name.textContent=character.name;
    hanja.textContent=character.hanja;
    roman.textContent=character.roman;
    affiliation.textContent=character.affiliation;
    position.textContent=character.position;
    summary.textContent=character.summary;
    portraitName.textContent=character.hanja;

    facts.innerHTML=character.facts.map(([label,value])=>
      `<div><span>${label}</span><b>${value}</b></div>`
    ).join("");

    portrait.classList.toggle("has-image",Boolean(character.image));
    portrait.style.backgroundImage=character.image?`url("${character.image}")`:"";

    renderRoster();
    renderPanel();

    if(animate&&!reduced){
      root.classList.remove("char-switching");
      void root.offsetWidth;
      root.classList.add("char-switching");
      setTimeout(()=>root.classList.remove("char-switching"),540);
    }
  }

  function selectCharacter(id){
    if(!CHARACTERS[id]||id===activeId)return;
    activeId=id;
    activePanel="basic";
    renderCharacter(true);
  }

  detailTabs.forEach(button=>{
    button.addEventListener("click",()=>{
      activePanel=button.dataset.charPanel;
      renderPanel();
    });
  });

  root.querySelectorAll("[data-char-open]").forEach(button=>{
    button.addEventListener("click",()=>{
      const key=button.dataset.charOpen;
      if(key==="nations"){
        window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:CHARACTERS[activeId].nationKey}}));
      }
      window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
    });
  });

  window.addEventListener("archive:record-opened",event=>{
    if(event.detail?.key==="characters")renderCharacter(false);
  });

  renderCharacter(false);
}
