const RECORDS={
  world:{no:"01",title:"WORLD",code:"CURRENT ERA"},
  nations:{no:"02",title:"NATIONS",code:"NATION ARCHIVE"},
  eidolon:{no:"03",title:"EIDOLON",code:"HOSTILE ENTITY"},
  military:{no:"04",title:"MILITARY",code:"MILITARY SOCIETY"},
  academy:{no:"05",title:"ACADEMY",code:"OFFICER EDUCATION"},
  archive:{no:"06",title:"ARCHIVE",code:"HISTORICAL RECORD"}
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
  let busy=false;

  function activate(key,button){
    const meta=RECORDS[key];if(!meta||!button)return;
    tabs.forEach(tab=>{
      const active=tab===button;tab.classList.toggle("active",active);
      active?tab.setAttribute("aria-current","page"):tab.removeAttribute("aria-current");
    });
    views.forEach(view=>view.classList.toggle("active",view.dataset.view===key));
    recordCode.textContent=`RECORD ${meta.no} // ${meta.code}`;recordTitle.textContent=meta.title;
    frameRecord.textContent=`RECORD ${meta.no} / 06`;document.title=`# 2134 // ${meta.title}`;
    window.dispatchEvent(new CustomEvent("archive:record-opened",{detail:{key}}));
  }

  function openRecord(key){
    const button=tabs.find(tab=>tab.dataset.tab===key),meta=RECORDS[key];
    if(!button||!meta||busy||button.classList.contains("active"))return;
    if(reduced){activate(key,button);window.scrollTo(0,0);return}
    busy=true;target.textContent=`${meta.no} // ${meta.title}`;transitionState.textContent=`${meta.code} // LOADING RECORD`;
    transition.classList.add("engaged");
    requestAnimationFrame(()=>requestAnimationFrame(()=>transition.classList.add("cover")));
    setTimeout(()=>{
      activate(key,button);window.scrollTo(0,0);transitionState.textContent="RECORD VERIFIED // OPEN";transition.classList.remove("cover");
      setTimeout(()=>{transition.classList.remove("engaged");busy=false},360);
    },320);
  }

  tabs.forEach(button=>button.addEventListener("click",()=>openRecord(button.dataset.tab)));
  window.addEventListener("archive:open-record",e=>openRecord(e.detail?.key));
}
