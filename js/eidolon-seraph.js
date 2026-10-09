/* SERAPH archive: silhouette derived from eyewitness reports, not a captured specimen. */
const CHANNELS={
  morphology:{
    label:"HUMAN-LIKE // SIGHTING ONLY",
    message:"목격 기록 기반 참고 이미지 · 실제 외형 미확인",
    title:"인간형 실루엣 // 목격 기록",
    meta:"인간 크기 추정 / 형태 판독 불가",
    body:"일부 현장 목격 보고에서 인간과 유사한 크기와 실루엣이 언급된다. 포획된 실물 표본이나 검증된 촬영 자료가 없으므로 현재 이미지는 목격 기록을 토대로 재구성한 비검증 참고 자료다."
  },
  core:{
    label:"INTERNAL STRUCTURE // NO DATA",
    message:"표본 미확보 · 내부 구조 미확인",
    title:"내부 구조 // 분석 불가",
    meta:"표본 없음 / 코어 확인 불가",
    body:"세라프의 내부 구조를 확인할 실물 표본이 없다. 일반 에이돌론과 같은 코어가 존재하는지, 어떤 기관으로 움직이는지 판단할 수 없다."
  },
  network:{
    label:"NETWORK // UNVERIFIED",
    message:"신호 증거 부족 · 통신 방식 미확인",
    title:"통신 양상 // 분석 불가",
    meta:"연결 여부 / 확인된 자료 없음",
    body:"세라프와 다른 에이돌론 사이의 정보 공유나 통신 관계는 검증되지 않았다. 목격 보고만으로 네트워크 구조 또는 지휘 체계를 확정할 수 없다."
  }
};

export function initSeraphArchive(root,{reduced=false}={}){
  const visual=root.querySelector("[data-ei-seraph-visual]");
  const channel=visual?.querySelector("[data-ei-seraph-channel]");
  const message=visual?.querySelector("[data-ei-seraph-message]");
  const scannerHeading=root.querySelector(".ei-scan-top span");
  const originalHeading=scannerHeading?.textContent||"";
  const buttons=[...root.querySelectorAll("[data-ei-focus]")];
  const labels=new Map(buttons.map(button=>[button,button.querySelector("b")||button]));
  const originals=new Map([...labels].map(([button,label])=>[button,label.textContent]));
  const names={core:"내부",network:"통신",morphology:"외형"};
  let active=false,timer=0,bootTimer=0;
  function description(key){return CHANNELS[key]||CHANNELS.morphology}
  function setFocus(key="morphology"){
    const data=description(key);
    if(!active)return data;
    root.dataset.eiSeraphFocus=key;
    if(channel)channel.textContent=data.label;
    if(message)message.textContent=data.message;
    return data;
  }
  function pulse(){
    if(!active||!visual)return;
    clearTimeout(timer);
    visual.classList.remove("reacquiring");
    if(reduced)return;
    void visual.offsetWidth;
    visual.classList.add("reacquiring");
    timer=setTimeout(()=>visual.classList.remove("reacquiring"),750);
  }
  function boot(){
    clearTimeout(bootTimer);
    root.classList.remove("ei-seraph-boot");
    if(reduced)return;
    void root.offsetWidth;
    root.classList.add("ei-seraph-boot");
    bootTimer=setTimeout(()=>root.classList.remove("ei-seraph-boot"),980);
  }
  function setClass(key){
    const wasActive=active;
    active=key==="seraph";
    root.classList.toggle("seraph-archive-ready",active);
    if(scannerHeading)scannerHeading.textContent=active?"목격 기록 // 비검증 실루엣":originalHeading;
    for(const [button,label] of labels){
      const original=originals.get(button);
      label.textContent=active?(names[button.dataset.eiFocus]||original):original;
    }
    if(active){
      setFocus(root.dataset.eiFocus||"morphology");
      if(!wasActive){pulse();boot()}
    }else{
      clearTimeout(timer);
      clearTimeout(bootTimer);
      root.classList.remove("ei-seraph-boot");
      visual?.classList.remove("reacquiring");
      delete root.dataset.eiSeraphFocus;
    }
  }
  root.querySelector("[data-ei-rescan]")?.addEventListener("click",pulse);
  return {setClass,setFocus,pulse,description};
}
