import {initMeshInspector} from "./eidolon-mesh.js?v=20261008-brute-topology1";
const BRUTE_MODEL_URL="./assets/eidolon/brute.glb?v=20261007-brute-3d-1";
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

export function initEidolon3D(root,{reduced=false}={}){
  let viewerPromise=null;
  let modelStage=null;
  let modelViewer=null;
  let classKey=root.dataset.eiClass||"brute";
  let focusKey="morphology";
  let materialLab=null;
  let materialState=[];
  let activeMaterial=0;

  // A reversible on-device preview. It never modifies the original GLB file.
  function createMaterialLab(){
    const materials=modelViewer?.model?.materials;
    if(!Array.isArray(materials)||!materials.length)return;
    const scanner=root.querySelector("#eiScanner");
    if(!scanner)return;
    materialState=materials.map(material=>({
      material,
      base:Array.from(material.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1]),
      metallic:material.pbrMetallicRoughness?.metallicFactor,
      roughness:material.pbrMetallicRoughness?.roughnessFactor
    }));
    if(materialLab)materialLab.remove();
    const box=document.createElement("details");
    box.className="ei-material-lab";
    box.innerHTML=`
      <summary><span>BRUTE / 재질 검사</span><b>COLOR TEST ↗</b></summary>
      <div class="ei-material-lab-inner">
        <div class="ei-material-lab-heading"><span>LIVE MATERIAL ANALYSIS</span><b data-ei-material-count></b></div>
        <label for="eiMaterialSelect">변경할 재질</label>
        <select id="eiMaterialSelect" data-ei-material-select></select>
        <div class="ei-material-palettes" role="group" aria-label="재질 색상 시험">
          <button type="button" data-ei-paint="#657780" style="--paint:#657780" aria-label="슬레이트 그레이" title="슬레이트"></button>
          <button type="button" data-ei-paint="#354a63" style="--paint:#354a63" aria-label="청회색" title="청회색"></button>
          <button type="button" data-ei-paint="#7a3f39" style="--paint:#7a3f39" aria-label="산화 적색" title="산화 적색"></button>
          <button type="button" data-ei-paint="#637a72" style="--paint:#637a72" aria-label="청록색" title="청록색"></button>
          <button type="button" data-ei-paint="#b08e58" style="--paint:#b08e58" aria-label="황동색" title="황동색"></button>
        </div>
        <div class="ei-material-actions">
          <label for="eiMaterialCustom">직접 색상</label>
          <input id="eiMaterialCustom" type="color" data-ei-material-custom value="#657780" aria-label="선택한 재질의 색상">
          <button type="button" data-ei-material-reset>전체 초기화</button>
        </div>
        <p data-ei-material-feedback aria-live="polite"></p>
        <small>화면 미리보기 전용. 원본 GLB에는 저장되지 않으며, 재질이 1개라면 전체가 함께 변합니다.</small>
        <section class="ei-mesh-inspector" aria-label="브루트 메시 구조 검사">
          <div class="ei-mesh-inspector-head"><b>MESH / STRUCTURE</b><span>GLB INSPECTION</span></div>
          <p class="ei-mesh-instruction">모델이 실제로 몇 개의 부품으로 나뉘는지 확인합니다.</p>
          <button type="button" data-ei-mesh-scan class="ei-mesh-run">메시 구조 검사 시작 ↗</button>
          <p data-ei-mesh-state role="status" aria-live="polite">원본 GLB를 변경하지 않습니다.</p>
          <div class="ei-mesh-stats" data-ei-mesh-stats></div>
          <ol class="ei-mesh-list" data-ei-mesh-list></ol>
          <p class="ei-mesh-verdict" data-ei-mesh-verdict></p>
          <button type="button" data-ei-mesh-copy class="ei-mesh-copy" hidden>검사 결과 복사</button>
        </section>
        <section class="ei-topology" aria-label="브루트 표면 연결 분석">
          <div class="ei-topology-heading"><b>SURFACE / CONNECTIONS</b><span>READ-ONLY SCAN</span></div>
          <p>메시가 하나여도 내부 표면이 여러 덩어리로 나뉘는지 검사합니다.</p>
          <button type="button" data-ei-topology-run>표면 분리 가능성 분석 ↗</button>
          <p data-ei-topology-state role="status" aria-live="polite">약 13MB의 모델을 읽으며 원본은 수정하지 않습니다.</p>
          <div class="ei-topology-stats" data-ei-topology-stats></div>
          <ol class="ei-topology-islands" data-ei-topology-islands></ol>
          <p class="ei-topology-result" data-ei-topology-result></p>
          <small data-ei-topology-caution></small>
          <button type="button" data-ei-topology-copy hidden>분석 결과 복사</button>
        </section>
      </div>`;
    const select=box.querySelector("[data-ei-material-select]");
    materials.forEach((material,index)=>{
      const option=document.createElement("option");
      option.value=String(index);
      option.textContent=String(index+1).padStart(2,"0")+" / "+(material.name||"재질 "+(index+1));
      select.appendChild(option);
    });
    box.querySelector("[data-ei-material-count]").textContent=materials.length+" MATERIAL"+(materials.length===1?"":"S");
    const feedback=box.querySelector("[data-ei-material-feedback]");
    function note(message){if(feedback)feedback.textContent=message}
    function paint(color){
      const item=materialState[activeMaterial];
      if(!item?.material?.pbrMetallicRoughness?.setBaseColorFactor)return note("이 재질은 브라우저에서 색상 변경이 지원되지 않습니다.");
      try{
        item.material.pbrMetallicRoughness.setBaseColorFactor(color);
        note((item.material.name||"재질 "+(activeMaterial+1))+" / "+color+" 적용 · 임시");
      }catch(err){note("재질 색상을 변경할 수 없습니다.")}
    }
    select.addEventListener("change",()=>{
      activeMaterial=Math.max(0,Math.min(materialState.length-1,Number(select.value)||0));
      note("선택 재질: "+(materialState[activeMaterial].material.name||"재질 "+(activeMaterial+1)));
    });
    box.querySelectorAll("[data-ei-paint]").forEach(button=>{
      button.addEventListener("click",()=>paint(button.dataset.eiPaint));
    });
    box.querySelector("[data-ei-material-custom]").addEventListener("input",event=>paint(event.target.value));
    box.querySelector("[data-ei-material-reset]").addEventListener("click",()=>{
      materialState.forEach(item=>{
        try{
          const pbr=item.material.pbrMetallicRoughness;
          pbr?.setBaseColorFactor(item.base);
          if(Number.isFinite(item.metallic))pbr?.setMetallicFactor(item.metallic);
          if(Number.isFinite(item.roughness))pbr?.setRoughnessFactor(item.roughness);
        }catch(err){/* Some imported materials are read-only. */}
      });
      note("모든 재질을 원본 색상으로 되돌렸습니다.");
    });
    box.addEventListener("toggle",()=>{
      if(box.open&&!reduced)modelViewer?.removeAttribute("auto-rotate");
      if(!box.open)applyFocus();
    });
    note(materials.length===1?"재질 1개: 전체 색상만 변경 가능":"재질 "+materials.length+"개 감지: 각 재질의 색상 시험 가능");
    scanner.appendChild(box);
    initMeshInspector(box,BRUTE_MODEL_URL);
    materialLab=box;
    materialLab.hidden=classKey!=="brute";
  }

  function buildModelStage(){
    if(modelStage)return modelStage;
    const target=root.querySelector(".ei-target");
    if(!target)return null;
    modelStage=document.createElement("div");
    modelStage.className="ei-model-stage";
    modelStage.hidden=true;
    modelStage.innerHTML='<div class="ei-acquisition" aria-hidden="true"><div class="ei-lock-frame"><i></i><i></i><i></i><i></i><b></b></div><div class="ei-scan-progress"><span>ANALYSIS // <b>READY</b></span><i><u></u></i></div><div class="ei-analysis-nodes"><span class="core">CORE</span><span class="network">LINK</span><span class="form">FORM</span></div></div><div class="ei-model-status"><span>III // BRUTE</span><b>3D SPECIMEN // STANDBY</b><em>DRAG TO ORBIT</em></div><div class="ei-model-loading"><i></i><span>RETRIEVING 3D SPECIMEN</span><b>MODEL DATA // ON DEMAND</b></div>';
    target.appendChild(modelStage);
    return modelStage;
  }

  function loadModelViewer(){
    if(customElements.get("model-viewer"))return Promise.resolve();
    if(viewerPromise)return viewerPromise;
    viewerPromise=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-ei-model-viewer]');
      if(existing){
        customElements.whenDefined("model-viewer").then(resolve).catch(reject);
        return;
      }
      const script=document.createElement("script");
      script.type="module";
      script.src=MODEL_VIEWER_SRC;
      script.dataset.eiModelViewer="1";
      script.onload=()=>customElements.whenDefined("model-viewer").then(resolve).catch(reject);
      script.onerror=reject;
      document.head.appendChild(script);
    });
    return viewerPromise;
  }

  function syncVisibility(){
    const isBrute=classKey==="brute";
    if(modelStage)modelStage.hidden=!isBrute;
    if(materialLab){
      materialLab.hidden=!isBrute;
      if(!isBrute)materialLab.open=false;
    }
    if(modelViewer){
      modelViewer.style.display=isBrute?"block":"none";
      if(isBrute&&!reduced)modelViewer.setAttribute("auto-rotate","");
      else modelViewer.removeAttribute("auto-rotate");
    }
    root.classList.toggle("ei-has-3d",isBrute&&!!modelStage);
    if(!isBrute)root.classList.remove("ei-model-pending","ei-model-ready","ei-model-error");
  }

  async function ensureBruteModel(){
    if(classKey!=="brute")return;
    const stage=buildModelStage();
    if(!stage)return;
    syncVisibility();
    root.classList.add("ei-model-pending");
    if(modelViewer){
      root.classList.add("ei-model-ready");
      root.classList.remove("ei-model-pending");
      return;
    }
    try{
      await loadModelViewer();
      if(classKey!=="brute")return;
      modelViewer=document.createElement("model-viewer");
      modelViewer.className="ei-model-viewer";
      modelViewer.setAttribute("src",BRUTE_MODEL_URL);
      modelViewer.setAttribute("alt","BRUTE class EIDOLON 3D reference model");
      modelViewer.setAttribute("camera-controls","");
      modelViewer.setAttribute("interaction-prompt","none");
      modelViewer.setAttribute("shadow-intensity","1.05");
      modelViewer.setAttribute("shadow-softness","0.75");
      modelViewer.setAttribute("exposure","0.72");
      modelViewer.setAttribute("camera-orbit","35deg 72deg auto");
      modelViewer.setAttribute("min-camera-orbit","auto 35deg auto");
      modelViewer.setAttribute("max-camera-orbit","auto 105deg auto");
      if(!reduced){
        modelViewer.setAttribute("auto-rotate","");
        modelViewer.setAttribute("rotation-per-second","10deg");
        modelViewer.setAttribute("auto-rotate-delay","900");
      }
      modelViewer.addEventListener("load",()=>{
        root.classList.remove("ei-model-pending","ei-model-error");
        root.classList.add("ei-model-ready");
        createMaterialLab();
      },{once:true});
      modelViewer.addEventListener("error",()=>{
        root.classList.remove("ei-model-pending","ei-model-ready");
        root.classList.add("ei-model-error");
      });
      stage.prepend(modelViewer);
      syncVisibility();
      applyFocus();
    }catch(error){
      console.warn("BRUTE 3D model failed to initialize.",error);
      root.classList.remove("ei-model-pending","ei-model-ready");
      root.classList.add("ei-model-error");
    }
  }

  function applyFocus(){
    if(!modelViewer||classKey!=="brute")return;
    root.dataset.ei3dFocus=focusKey;
    root.classList.remove("ei-focus-pulse","ei-acquiring");
    const status=modelStage?.querySelector(".ei-model-status b");
    const progress=modelStage?.querySelector(".ei-scan-progress span b");
    if(status)status.textContent="ANALYZING // "+focusKey.toUpperCase();
    if(progress)progress.textContent="SCANNING";
    if(!reduced){void root.offsetWidth;root.classList.add("ei-focus-pulse","ei-acquiring");setTimeout(()=>{root.classList.remove("ei-focus-pulse","ei-acquiring");if(status)status.textContent="3D SPECIMEN // LOCKED";if(progress)progress.textContent="VERIFIED"},760)}else{if(status)status.textContent="3D SPECIMEN // LOCKED";if(progress)progress.textContent="VERIFIED"}
    const views={
      morphology:{orbit:"35deg 72deg 115%",target:"auto auto auto"},
      core:{orbit:"8deg 78deg 72%",target:"auto 52% auto"},
      network:{orbit:"-18deg 66deg 82%",target:"auto 68% auto"}
    };
    const view=views[focusKey]||views.morphology;
    if(!reduced&&typeof modelViewer.setAttribute==="function"){
      modelViewer.setAttribute("interpolation-decay","120");
    }
    modelViewer.setAttribute("camera-orbit",view.orbit);
    modelViewer.setAttribute("camera-target",view.target);
    if(focusKey==="morphology"&&!reduced&&!materialLab?.open)modelViewer.setAttribute("auto-rotate","");
    else modelViewer.removeAttribute("auto-rotate");
  }

  function setClass(key){
    classKey=key;
    syncVisibility();
    if(classKey==="brute")ensureBruteModel().then?.(()=>applyFocus());
  }

  function setFocus(key){
    focusKey=key||"morphology";
    applyFocus();
  }

  return {setClass,setFocus};
}
