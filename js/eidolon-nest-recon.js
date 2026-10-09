/* N-01 recon station: true GLB geometry-based LIDAR overlaid on the textured model. */
import {initNestLidar} from "./eidolon-nest-lidar.js?v=20261009-lidar-sync-v2";
const MODEL_URL="./assets/nest/small.glb?v=20261009-nest-recon-v1";
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
const PHASES=[
  ["SATELLITE LINK // SIMULATED",12,"원격 관측 채널 동기화"],
  ["TOPOGRAPHIC RECONSTRUCTION",35,"지형 윤곽 구성 중"],
  ["LIDAR // STRUCTURE RECONSTRUCTION",68,"거점 구조 재구성"],
  ["SIGNAL // TARGET ACQUISITION",92,"관측 대상 위치 확인"],
  ["SCAN COMPLETE // REFERENCE MODEL",100,"3D 참고 모델 표시 완료"]
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
  let level="small",tabActive=false,loaded=false,remoteTried=false;
  let scanToken=0,loadToken=0,localObjectURL=null,viewerPromise=null;
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
    const visible=level==="small"&&tabActive&&loaded&&root.dataset.eiClass!=="seraph";
    const displayingScan=stage.classList.contains("scanning")||stage.dataset.mode==="lidar";
    viewer.autoRotate=visible&&!reduced&&!displayingScan;
  }
  function setMode(mode){
    if(!["tactical","lidar","thermal"].includes(mode))return;
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
    if(!loaded)return;
    clearTimers();
    stage.classList.remove("scanning","scanned");
    stage.dataset.scanPhase="link";
    lidar.setPhase("link");
    if(reduced){
      stage.dataset.scanPhase="complete";lidar.setPhase("complete");
      stage.classList.add("scanned");stage.classList.remove("scanning");
      syncRotation();
      if(phase)phase.textContent=PHASES[4][0];
      updateProgress(100);updateStatus("RECONSTRUCTION COMPLETE");
      setMessage(PHASES[4][2]);return;
    }
    void stage.offsetWidth;
    stage.classList.add("scanning");
    syncRotation();
    const token=scanToken;
    const steps=["link","terrain","wire","acquire","complete"];
    PHASES.forEach(([label,value,text],index)=>{
      schedule(()=>{
        if(token!==scanToken||!tabActive||level!=="small")return;
        stage.dataset.scanPhase=steps[index];lidar.setPhase(steps[index]);
        if(phase)phase.textContent=label;
        updateProgress(value);setMessage(text);
        updateStatus(index===PHASES.length-1?"RECONSTRUCTION COMPLETE":"RECONSTRUCTING");
        if(index===PHASES.length-1){
          stage.classList.remove("scanning");stage.classList.add("scanned");
          syncRotation();
        }
      },index*390);
    });
  }
  function updateVisibility(){
    const on=level==="small"&&tabActive&&root.dataset.eiClass!=="seraph";
    lidar.setActive(on);
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
    stage.classList.remove("missing","loaded","scanned");
    stage.dataset.scanPhase="link";lidar.setPhase("link");lidar.setActive(false);
    if(prompt)prompt.hidden=true;
    updateStatus("RETRIEVING 3D MODEL");
    if(phase)phase.textContent="LINK ESTABLISHING";
    updateProgress(0);setMessage("3D 모델 다운로드 및 처리 중…");
    try{
      await awaitViewerLibrary();
      if(token!==loadToken||!viewer)return;
      viewer.src=url;
    }catch(error){
      if(token===loadToken)fail("3D 뷰어 로딩 실패");
    }
  }
  function ensureRemote(){
    if(remoteTried||loaded||level!=="small"||!tabActive)return;
    remoteTried=true;
    loadSource(MODEL_URL);
  }
  viewer?.addEventListener("load",async()=>{
    loaded=true;stage.classList.remove("missing");stage.classList.add("loaded");
    if(prompt)prompt.hidden=true;
    syncRotation();
    // Extract actual mesh samples from the cached GLB before starting the reveal.
    await lidar.load(viewer.src);
    if(tabActive&&level==="small"&&loaded){
      lidar.setActive(true);play();
    }
  },{signal});
  viewer?.addEventListener("error",()=>{
    fail("3D 파일을 찾지 못했음");
  },{signal});
  fileButton?.addEventListener("click",()=>fileInput?.click(),{signal});
  fileInput?.addEventListener("change",()=>{
    const file=fileInput.files?.[0];
    if(!file)return;
    if(!file.name.toLowerCase().endsWith(".glb")){fail("GLB 형식만 지원");return}
    const previous=localObjectURL;
    localObjectURL=URL.createObjectURL(file);
    if(previous)URL.revokeObjectURL(previous);
    loadSource(localObjectURL);
  },{signal});
  modeBtns.forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.eiNestMode),{signal}));
  setMode("tactical");
  fail("3D 자료 연결 준비");
  return {
    setLevel(next){level=next;updateVisibility()},
    setActive(active){tabActive=active;updateVisibility()},
    replay(){if(root.dataset.eiClass==="seraph"||level!=="small")return;if(loaded)play();else ensureRemote()},
    destroy(){clearTimers();loadToken++;lidar.destroy();if(localObjectURL)URL.revokeObjectURL(localObjectURL);}
  };
}
