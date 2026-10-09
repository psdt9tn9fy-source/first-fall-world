/* Shared N-01/N-02 recon station; mesh LIDAR remains exclusive to N-01. */
import {initNestLidar} from "./eidolon-nest-lidar.js?v=20261009-lidar-live-sync-v3";
const MODELS={
  small:{url:"./assets/nest/small.glb?v=20261009-nest-recon-v1",code:"N-01",name:"소형 네스트",orbit:"45deg 55deg 125%"},
  medium:{url:"./assets/nest/medium.glb?v=20261009-n02-v1",code:"N-02",name:"중형 네스트",orbit:"35deg 65deg 135%"}
};
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
const PHASES=[
  ["SATELLITE LINK // SIMULATED",12,"원격 관측 채널 동기화"],
  ["TOPOGRAPHIC RECONSTRUCTION",35,"지형 윤곽 구성 중"],
  ["LIDAR // STRUCTURE RECONSTRUCTION",68,"거점 구조 재구성"],
  ["SIGNAL // TARGET ACQUISITION",92,"관측 대상 위치 확인"],
  ["SCAN COMPLETE // REFERENCE MODEL",100,"3D 참고 모델 표시 완료"]
];
const MEDIUM_PHASES=[
  ["SATELLITE LINK // SIMULATED",12,"N-02 관측 채널 동기화"],
  ["FORTRESS // SURFACE SCAN",35,"외계 기계 성채의 외곽 구조 표시"],
  ["PRODUCTION HUB // ANALYSIS",68,"생산·수리 거점 기록 대조"],
  ["TARGET // VISUAL ACQUISITION",92,"지역 통제 거점 시각 분석"],
  ["SCAN COMPLETE // REFERENCE MODEL",100,"N-02 참고 모델 · 드래그 회전 / 휠·두 손가락 확대"]
];
export function initNestRecon(root,{reduced=false,signal}={}){
  const stage=root.querySelector("[data-ei-nest-recon]");
  if(!stage)return {setLevel(){},setActive(){},replay(){},destroy(){}};
  const viewer=stage.querySelector("[data-ei-nest-viewer]");
  const status=stage.querySelector("[data-ei-nest-recon-status]");
  const phase=stage.querySelector("[data-ei-nest-phase]");
  const percent=stage.querySelector("[data-ei-nest-percent]");
  const bar=stage.querySelector("[data-ei-nest-bar]");
  const log=stage.querySelector("[data-ei-nest-log]");
  const prompt=stage.querySelector("[data-ei-nest-fallback]");
  const fileInput=stage.querySelector("[data-ei-nest-file]");
  const fileButton=stage.querySelector("[data-ei-nest-local]");
  const modeBtns=[...stage.querySelectorAll("[data-ei-nest-mode]")];
  const lidar=initNestLidar(stage,viewer,{reduced,signal});
  let level="small",tabActive=false,loaded=false,sourceURL=null;
  const localSources=new Map();
  let scanToken=0,loadToken=0,viewerPromise=null;
  const supported=()=>!!MODELS[level];
  const isVisible=()=>supported()&&tabActive&&root.dataset.eiClass!=="seraph"&&!document.hidden;
  const timers=new Set();
  function schedule(fn,delay){
    const timer=setTimeout(()=>{timers.delete(timer);fn()},delay);timers.add(timer);
  }
  function clearTimers(){for(const timer of timers)clearTimeout(timer);timers.clear();scanToken++}
  function updateStatus(value){if(status)status.textContent=value}
  function updateProgress(value){
    if(percent)percent.textContent=value+"%";
    if(bar)bar.style.width=value+"%";
  }
  // Texture rotation is suspended whenever geometry-derived scan data is visible.
  // A distinct canvas cannot render at precisely the model-viewer's WebGL frame boundary.
  function syncRotation(){
    if(!viewer)return;
    const visible=isVisible()&&loaded;
    const displayingScan=stage.classList.contains("scanning")||stage.dataset.mode==="lidar";
    viewer.autoRotate=visible&&!reduced&&!displayingScan;
  }
  function setMode(mode){
    if(!["tactical","lidar","thermal"].includes(mode))return;
    if(level!=="small"&&mode==="lidar")return;
    stage.dataset.mode=mode;
    lidar.setMode(mode);
    syncRotation();
    modeBtns.forEach(button=>{
      const active=button.dataset.eiNestMode===mode;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }
  function setMessage(value){if(log)log.textContent=value}
  function fail(message="3D 파일 연결 대기"){
    clearTimers();
    sourceURL=null;
    loaded=false;lidar.setActive(false);stage.classList.remove("loaded","scanning");
    syncRotation();
    stage.classList.add("missing");
    if(prompt)prompt.hidden=false;
    updateStatus(message);
    if(phase)phase.textContent="MODEL DATA // NOT AVAILABLE";
    updateProgress(0);
    setMessage("GLB 업로드 후 자동 연결 · 아래 버튼으로 로컬 미리보기 가능");
  }
  function play(){
    if(!loaded||!isVisible())return;
    const phases=level==="medium"?MEDIUM_PHASES:PHASES;
    clearTimers();
    stage.classList.remove("scanning","scanned");
    stage.dataset.scanPhase="link";
    lidar.setPhase("link");
    if(reduced){
      stage.dataset.scanPhase="complete";lidar.setPhase("complete");
      stage.classList.add("scanned");stage.classList.remove("scanning");
      syncRotation();
      if(phase)phase.textContent=phases[4][0];
      updateProgress(100);updateStatus("RECONSTRUCTION COMPLETE");
      setMessage(phases[4][2]);return;
    }
    void stage.offsetWidth;
    stage.classList.add("scanning");
    syncRotation();
    const token=scanToken;
    const steps=["link","terrain","wire","acquire","complete"];
    phases.forEach(([label,value,text],index)=>{
      schedule(()=>{
        if(token!==scanToken||!isVisible())return;
        stage.dataset.scanPhase=steps[index];lidar.setPhase(steps[index]);
        if(phase)phase.textContent=label;
        updateProgress(value);setMessage(text);
        updateStatus(index===phases.length-1?"RECONSTRUCTION COMPLETE":"RECONSTRUCTING");
        if(index===phases.length-1){
          stage.classList.remove("scanning");stage.classList.add("scanned");
          syncRotation();
        }
      },index*390);
    });
  }
  function updateVisibility(){
    const on=isVisible();
    lidar.setActive(on&&level==="small"&&loaded);
    if(!on){clearTimers();stage.classList.remove("scanning");}
    syncRotation();
    if(on){
      if(loaded&&!stage.classList.contains("scanned")&&!stage.classList.contains("scanning"))play();
      else ensureRemote();
    }
  }
  function awaitViewerLibrary(){
    if(customElements.get("model-viewer"))return Promise.resolve();
    if(viewerPromise)return viewerPromise;
    viewerPromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector("script[data-ei-model-viewer]");
      if(existing){
        customElements.whenDefined("model-viewer").then(resolve,reject);
        return;
      }
      const script=document.createElement("script");
      script.type="module";script.src=MODEL_VIEWER_SRC;
      script.dataset.eiModelViewer="1";
      script.onload=()=>customElements.whenDefined("model-viewer").then(resolve,reject);
      script.onerror=reject;
      document.head.appendChild(script);
    }).catch(error=>{viewerPromise=null;throw error});
    return viewerPromise;
  }
  async function loadSource(url){
    const token=++loadToken;
    sourceURL=url;loaded=false;clearTimers();
    stage.classList.remove("missing","loaded","scanned","scanning");
    syncRotation();
    stage.dataset.scanPhase="link";lidar.setPhase("link");lidar.setActive(false);
    if(prompt)prompt.hidden=true;
    updateStatus("RETRIEVING 3D MODEL");
    if(phase)phase.textContent="LINK ESTABLISHING";
    updateProgress(0);setMessage("3D 모델 다운로드 및 처리 중…");
    try{
      await awaitViewerLibrary();
      if(token!==loadToken||!viewer)return;
      if(viewer.src===url)viewer.removeAttribute("src");
      viewer.src=url;
    }catch(error){
      if(token===loadToken)fail("3D 뷰어 로딩 실패");
    }
  }
  function ensureRemote(){
    if(!supported()||!isVisible())return;
    const url=localSources.get(level)||MODELS[level].url;
    if(sourceURL===url)return;
    loadSource(url);
  }
  viewer?.addEventListener("load",async()=>{
    if(!supported()||viewer.src!==sourceURL)return;
    const token=loadToken;
    loaded=true;stage.classList.remove("missing");stage.classList.add("loaded");
    if(prompt)prompt.hidden=true;
    syncRotation();
    // Extract actual mesh samples from the cached GLB before starting the reveal.
    if(level==="small")await lidar.load(viewer.src);
    if(token===loadToken&&isVisible()&&loaded){
      lidar.setActive(level==="small");play();
    }
  },{signal});
  viewer?.addEventListener("error",()=>{
    if(viewer.src!==sourceURL||!supported())return;
    fail("3D 파일을 찾지 못했음");
  },{signal});
  fileButton?.addEventListener("click",()=>fileInput?.click(),{signal});
  fileInput?.addEventListener("change",()=>{
    const file=fileInput.files?.[0];
    if(!file)return;
    if(!file.name.toLowerCase().endsWith(".glb")){fail("GLB 형식만 지원");return}
    const previous=localSources.get(level);
    const localObjectURL=URL.createObjectURL(file);
    localSources.set(level,localObjectURL);
    if(previous)URL.revokeObjectURL(previous);
    loadSource(localObjectURL);
  },{signal});
  modeBtns.forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.eiNestMode),{signal}));
  stage.querySelector("[data-ei-nest-reset]")?.addEventListener("click",()=>{
    if(viewer&&supported())viewer.cameraOrbit=MODELS[level].orbit;
  },{signal});
  document.addEventListener("visibilitychange",updateVisibility,{signal});
  setMode("tactical");
  fail("3D 자료 연결 준비");
  return {
    setLevel(next){
      if(next!==level){
        clearTimers();loadToken++;loaded=false;sourceURL=null;lidar.setActive(false);
        stage.classList.remove("loaded","scanned","scanning","missing");
        viewer.removeAttribute("src");
        level=next;stage.dataset.level=level;
        const model=MODELS[level];
        if(model){
          stage.setAttribute("aria-label",model.name+" 3D 정찰 재구성");
          stage.querySelector("[data-ei-nest-recon-title]").textContent="ORBITAL RECON // "+model.code;
          viewer.alt=model.name+" 3D 참고 모델. 드래그하여 회전하고 휠 또는 두 손가락으로 확대할 수 있습니다.";
          viewer.cameraOrbit=model.orbit;
          setMode("tactical");
          modeBtns.forEach(button=>{button.hidden=level==="medium"&&button.dataset.eiNestMode==="lidar"});
        }
      }
      updateVisibility();
    },
    setActive(active){tabActive=active;updateVisibility()},
    replay(){if(!isVisible())return;if(loaded)play();else ensureRemote()},
    destroy(){clearTimers();loadToken++;lidar.destroy();for(const url of localSources.values())URL.revokeObjectURL(url);}
  };
}
