const RECORDS={
  world:{no:"01",title:"세계",code:"현재 시대"},
  characters:{no:"02",title:"인물",code:"인물 기록"},
  nations:{no:"03",title:"세계 질서",code:"국가 체계"},
  eidolon:{no:"04",title:"에이돌론",code:"적성 개체"},
  military:{no:"05",title:"군사",code:"군사 체계"},
  archive:{no:"06",title:"기록",code:"역사 기록"}
};

export function initNavigation(){
  const views=[...document.querySelectorAll(".view")];
  const dock=document.querySelector("#recordDock");
  const dockButtons=[...document.querySelectorAll("[data-record-nav]")];
  const moreButton=document.querySelector("[data-record-more]");
  const transition=document.querySelector("#recordTransition");
  const target=document.querySelector("#transitionTarget");
  const transitionState=document.querySelector("#transitionState");
  const recordCode=document.querySelector("#recordCode");
  const recordTitle=document.querySelector("#recordTitle");
  const frameRecord=document.querySelector("#frameRecord");
  const shell=document.querySelector("#archiveShell");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!shell)return;

  let busy=false;
  shell.dataset.activeRecord=shell.dataset.activeRecord||"world";

  function closeMore(){
    dock?.classList.remove("more-open");
    moreButton?.setAttribute("aria-expanded","false");
  }

  function activate(key){
    const meta=RECORDS[key];if(!meta)return;
    views.forEach(view=>view.classList.toggle("active",view.dataset.view===key));
    dockButtons.forEach(button=>{
      const active=button.dataset.recordNav===key;
      button.classList.toggle("active",active);
      active?button.setAttribute("aria-current","page"):button.removeAttribute("aria-current");
    });
    moreButton?.classList.toggle("active",key==="military"||key==="archive");
    shell.dataset.activeRecord=key;
    closeMore();
    if(recordCode)recordCode.textContent=`기록 ${meta.no} // ${meta.code}`;
    if(recordTitle)recordTitle.textContent=meta.title;
    if(frameRecord)frameRecord.textContent=`기록 ${meta.no} / 06`;
    document.title=`# 2134 // ${meta.title}`;
    window.dispatchEvent(new CustomEvent("archive:record-opened",{detail:{key}}));
  }

  function openRecord(key){
    const meta=RECORDS[key];if(!meta||busy)return;
    if(shell.dataset.activeRecord===key){closeMore();return}
    if(reduced){activate(key);window.scrollTo(0,0);return}

    busy=true;
    if(target)target.textContent=`${meta.no} // ${meta.title}`;
    if(transitionState)transitionState.textContent=`${meta.code} // 기록 불러오는 중`;
    transition?.classList.add("engaged");
    requestAnimationFrame(()=>requestAnimationFrame(()=>transition?.classList.add("cover")));

    setTimeout(()=>{
      activate(key);window.scrollTo(0,0);
      if(transitionState)transitionState.textContent="기록 확인 완료 // 열림";
      transition?.classList.remove("cover");
      setTimeout(()=>{transition?.classList.remove("engaged");busy=false},360);
    },320);
  }

  dockButtons.forEach(button=>button.addEventListener("click",()=>openRecord(button.dataset.recordNav)));
  moreButton?.addEventListener("click",()=>{
    const open=!dock?.classList.contains("more-open");
    dock?.classList.toggle("more-open",open);
    moreButton.setAttribute("aria-expanded",String(open));
  });
  document.addEventListener("pointerdown",event=>{
    if(dock?.classList.contains("more-open")&&!dock.contains(event.target))closeMore();
  });
  window.addEventListener("archive:open-record",event=>openRecord(event.detail?.key));

  activate(shell.dataset.activeRecord);
}
