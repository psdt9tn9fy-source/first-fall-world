const BRUTE_MODEL_URL="./assets/eidolon/brute.glb?v=20261007-brute-3d-1";
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

export function initEidolon3D(root,{reduced=false}={}){
  let viewerPromise=null;
  let modelStage=null;
  let modelViewer=null;
  let classKey=root.dataset.eiClass||"brute";
  let focusKey="morphology";

  function buildModelStage(){
    if(modelStage)return modelStage;
    const target=root.querySelector(".ei-target");
    if(!target)return null;
    modelStage=document.createElement("div");
    modelStage.className="ei-model-stage";
    modelStage.hidden=true;
    modelStage.innerHTML='<div class="ei-model-status"><span>III // BRUTE</span><b>3D SPECIMEN // STANDBY</b><em>DRAG TO ORBIT</em></div><div class="ei-model-loading"><i></i><span>RETRIEVING 3D SPECIMEN</span><b>MODEL DATA // ON DEMAND</b></div>';
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
    root.classList.remove("ei-focus-pulse");
    if(!reduced){void root.offsetWidth;root.classList.add("ei-focus-pulse");setTimeout(()=>root.classList.remove("ei-focus-pulse"),620)}
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
    if(focusKey==="morphology"&&!reduced)modelViewer.setAttribute("auto-rotate","");
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
