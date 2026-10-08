const BRUTE_MODEL_URL="./assets/eidolon/brute.glb?v=20261008-brute-textured2k-v1";
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

export function initEidolon3D(root,{reduced=false}={}){
  let viewerPromise=null;
  let modelStage=null;
  let modelViewer=null;
  let classKey=root.dataset.eiClass||"brute";
  let focusKey=root.dataset.eiFocus||"morphology";
  let modelLoaded=false;
  const HOME_ORBIT="35deg 72deg 115%";
  const HOME_TARGET="auto auto auto";

  // Use real glTF bounding-box dimensions, not percentages in camera-target:
  // camera-target only accepts lengths (e.g. 1m) and 'auto'.
  function focusTarget(mode){
    if(typeof modelViewer?.getBoundingBoxCenter!=="function"||
       typeof modelViewer?.getDimensions!=="function")return HOME_TARGET;
    const center=modelViewer.getBoundingBoxCenter();
    const dimensions=modelViewer.getDimensions();
    if(!center||!dimensions||
       ![center.x,center.y,center.z,dimensions.x,dimensions.y,dimensions.z].every(Number.isFinite))
      return HOME_TARGET;
    // Approximate torso-core / upper sensor-network targets as fractions of
    // the imported model's real dimensions. Keep each target deterministic.
    const fractions=mode==="core"
      ? {x:-0.06,y:0.09,z:0.07}
      : {x:0.03,y:0.29,z:0.17};
    return [center.x+dimensions.x*fractions.x,
            center.y+dimensions.y*fractions.y,
            center.z+dimensions.z*fractions.z]
      .map(value=>Number(value.toFixed(4))+"m").join(" ");
  }
  function buildModelStage(){
    if(modelStage)return modelStage;
    const target=root.querySelector(".ei-target");
    if(!target)return null;
    modelStage=document.createElement("div");
    modelStage.className="ei-model-stage";
    modelStage.hidden=true;
    modelStage.innerHTML='<div class="ei-model-loading" aria-live="polite"><i></i><span>RETRIEVING 3D SPECIMEN</span><b>MODEL DATA // ON DEMAND</b></div>';
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
      if(isBrute&&focusKey==="morphology"&&!reduced){
        modelViewer.setAttribute("auto-rotate","");
      }else{
        modelViewer.removeAttribute("auto-rotate");
      }
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
      if(modelLoaded){
        root.classList.add("ei-model-ready");
        root.classList.remove("ei-model-pending");
      }
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
      modelViewer.setAttribute("camera-orbit",HOME_ORBIT);
      modelViewer.setAttribute("camera-target",HOME_TARGET);
      modelViewer.setAttribute("min-camera-orbit","auto 25deg 30%");
      modelViewer.setAttribute("max-camera-orbit","auto 115deg auto");
      modelViewer.setAttribute("interpolation-decay","140");
      modelViewer.setAttribute("rotation-per-second","10deg");
      modelViewer.setAttribute("auto-rotate-delay","1000");
      modelViewer.addEventListener("load",()=>{
        modelLoaded=true;
        root.classList.remove("ei-model-pending","ei-model-error");
        if(classKey==="brute")root.classList.add("ei-model-ready");
        // The model's bounding box becomes available at this point.
        applyFocus();
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

    // Focus mode pauses rotation and flies toward a predictable location.
    // Morphology returns to the centered original framing and resumes rotation.
    if(focusKey==="morphology"){
      modelViewer.removeAttribute("auto-rotate");
      modelViewer.setAttribute("camera-target",HOME_TARGET);
      modelViewer.setAttribute("camera-orbit",HOME_ORBIT);
      if(modelLoaded&&typeof modelViewer.resetTurntableRotation==="function"){
        modelViewer.resetTurntableRotation(0);
      }
      if(!reduced)modelViewer.setAttribute("auto-rotate","");
      return;
    }

    modelViewer.removeAttribute("auto-rotate");
    if(!modelLoaded)return;
    if(typeof modelViewer.resetTurntableRotation==="function"){
      modelViewer.resetTurntableRotation(0);
    }
    const orbit=focusKey==="core"?"22deg 75deg 65%":"-25deg 57deg 72%";
    modelViewer.setAttribute("camera-target",focusTarget(focusKey));
    modelViewer.setAttribute("camera-orbit",orbit);
  }

  function setClass(key){
    classKey=key;
    syncVisibility();
    if(classKey==="brute")ensureBruteModel().then?.(()=>applyFocus());
  }

  function setFocus(key){
    focusKey=["core","network","morphology"].includes(key)?key:"morphology";
    applyFocus();
  }

  return {setClass,setFocus};
}
