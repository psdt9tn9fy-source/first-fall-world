const RECORDS={
  world:{no:"01",title:"세계",code:"현재 시대"},
  nations:{no:"02",title:"세계 질서",code:"국가 체계"},
  eidolon:{no:"03",title:"에이돌론",code:"적성 개체"},
  military:{no:"04",title:"군사",code:"군사 체계"},
  life:{no:"05",title:"생활",code:"민간생활"},
  archive:{no:"06",title:"기록",code:"역사 기록"}
};

export function initNavigation(){
  const tabs=[...document.querySelectorAll(".tab")];
  const views=[...document.querySelectorAll(".view")];
  const transition=document.querySelector("#recordTransition");
  const target=document.querySelector("#transitionTarget");
  const transitionState=document.querySelector("#transitionState");
  const recordCode=document.querySelector("#recordCode");
  const recordTitle=document.querySelector("#recordTitle");
  const frameRecord=document.querySelector("#frameRecord");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shell=document.querySelector("#archiveShell");
  if(shell)shell.dataset.activeRecord=tabs.find(tab=>tab.classList.contains("active"))?.dataset.tab||"world";
  let busy=false;

  function activate(key,button){
    const meta=RECORDS[key];if(!meta||!button)return;
    tabs.forEach(tab=>{
      const active=tab===button;tab.classList.toggle("active",active);
      active?tab.setAttribute("aria-current","page"):tab.removeAttribute("aria-current");
    });
    views.forEach(view=>view.classList.toggle("active",view.dataset.view===key));
    if(shell)shell.dataset.activeRecord=key;
    recordCode.textContent=`기록 ${meta.no} // ${meta.code}`;recordTitle.textContent=meta.title;
    frameRecord.textContent=`기록 ${meta.no} / 06`;document.title=`# 2134 // ${meta.title}`;
    window.dispatchEvent(new CustomEvent("archive:record-opened",{detail:{key}}));
  }

  function openRecord(key){
    const button=tabs.find(tab=>tab.dataset.tab===key),meta=RECORDS[key];
    if(!button||!meta||busy||button.classList.contains("active"))return;
    if(reduced){activate(key,button);window.scrollTo(0,0);return}
    busy=true;target.textContent=`${meta.no} // ${meta.title}`;transitionState.textContent=`${meta.code} // 기록 불러오는 중`;
    transition.classList.add("engaged");
    requestAnimationFrame(()=>requestAnimationFrame(()=>transition.classList.add("cover")));
    setTimeout(()=>{
      activate(key,button);window.scrollTo(0,0);transitionState.textContent="기록 확인 완료 // 열림";transition.classList.remove("cover");
      setTimeout(()=>{transition.classList.remove("engaged");busy=false},360);
    },320);
  }

  tabs.forEach(button=>button.addEventListener("click",()=>openRecord(button.dataset.tab)));
  window.addEventListener("archive:open-record",e=>openRecord(e.detail?.key));
}
