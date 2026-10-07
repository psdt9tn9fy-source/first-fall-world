import {CHARACTERS,CHARACTER_ORDER} from "./characters-data.js?v=20261007-character-1";

const PANEL_ORDER=["basic","personality","career","relations","records"];

export function initCharacters(){
  const root=document.querySelector("#characterArchive");
  if(!root)return;

  const roster=root.querySelector("#characterRoster");
  const detailTabs=[...root.querySelectorAll("[data-char-panel]")];
  const portrait=root.querySelector("#characterPortrait");
  const portraitName=root.querySelector("#characterPortraitName");
  const watermark=root.querySelector("#characterWatermark");
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
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeId=CHARACTER_ORDER[0],activePanel="basic";

  function renderRoster(){
    const active=CHARACTERS[activeId];
    const records=CHARACTER_ORDER.map(id=>{
      const c=CHARACTERS[id];
      return `<button class="char-roster-item ${id===activeId?"active":""}" type="button" data-char-id="${id}">
        <span class="char-roster-mark">${c.hanja.slice(0,1)}</span>
        <span class="char-roster-copy"><small>${c.record}</small><b>${c.name}</b><em>${c.affiliation}</em></span>
      </button>`;
    });
    for(let i=CHARACTER_ORDER.length;i<4;i++){
      records.push(`<button class="char-roster-item pending" type="button" disabled>
        <span class="char-roster-mark">+</span>
        <span class="char-roster-copy"><small>${String(i+1).padStart(3,"0")}</small><b>기록 미등록</b><em>추가 인물 대기</em></span>
      </button>`);
    }
    roster.innerHTML=records.join("");
    roster.querySelectorAll("[data-char-id]").forEach(btn=>btn.addEventListener("click",()=>selectCharacter(btn.dataset.charId)));
    root.style.setProperty("--char-accent",active.accent);
  }

  function renderPanel(){
    const c=CHARACTERS[activeId],p=c.panels[activePanel]||c.panels.basic;
    detailTabs.forEach(btn=>btn.classList.toggle("active",btn.dataset.charPanel===activePanel));
    panelTitle.textContent=p.title;
    panelLead.textContent=p.lead;
    panelBlocks.innerHTML=p.blocks.map(([label,value])=>`<article><span>${label}</span><p>${value}</p></article>`).join("");
    if(!reduced){
      panelBlocks.animate([{opacity:.25,transform:"translateY(7px)"},{opacity:1,transform:"none"}],{duration:230,easing:"ease-out"});
    }
  }

  function renderCharacter(animate=false){
    const c=CHARACTERS[activeId];
    root.style.setProperty("--char-accent",c.accent);
    recordNo.textContent=`인물 기록 ${c.record}`;
    watermark.textContent=c.name;
    name.textContent=c.name;
    hanja.textContent=c.hanja;
    roman.textContent=c.roman;
    affiliation.textContent=c.affiliation;
    position.textContent=c.position;
    summary.textContent=c.summary;
    portraitName.textContent=c.hanja;
    facts.innerHTML=c.facts.map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join("");
    portrait.classList.toggle("has-image",Boolean(c.image));
    portrait.style.backgroundImage=c.image?`url("${c.image}")`:"";
    renderRoster();
    renderPanel();
    if(animate&&!reduced){
      root.classList.remove("char-switching");
      void root.offsetWidth;
      root.classList.add("char-switching");
      setTimeout(()=>root.classList.remove("char-switching"),520);
    }
  }

  function selectCharacter(id){
    if(!CHARACTERS[id]||id===activeId)return;
    activeId=id;activePanel="basic";renderCharacter(true);
  }

  detailTabs.forEach(btn=>btn.addEventListener("click",()=>{activePanel=btn.dataset.charPanel;renderPanel()}));

  root.querySelectorAll("[data-char-open]").forEach(btn=>btn.addEventListener("click",()=>{
    const key=btn.dataset.charOpen;
    if(key==="nations"){
      window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:CHARACTERS[activeId].nationKey}}));
    }
    window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key}}));
  }));

  window.addEventListener("archive:record-opened",e=>{
    if(e.detail?.key==="characters")renderCharacter(false);
  });

  renderCharacter(false);
}
