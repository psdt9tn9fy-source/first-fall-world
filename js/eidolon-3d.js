/* #2134 EIDOLON 3D. Single model-viewer shared by available species.
   BRUTE, SWARM and HUNTER lazy-load their textured GLBs only when selected. */
const MODELS={
  brute:{
    url:"./assets/eidolon/brute.glb?v=20261008-brute-textured2k-v1",
    label:"BRUTE",homeOrbit:"35deg 72deg 115%",
    coreOrbit:"22deg 75deg 65%",networkOrbit:"-25deg 57deg 72%",
    coreOffset:{x:-.06,y:.09,z:.07},
    networkOffset:{x:.03,y:.29,z:.17}
  },
  swarm:{
    url:"./assets/eidolon/swarm.glb?v=20261008-swarm-textured2k-v1",
    label:"SWARM",homeOrbit:"35deg 73deg 120%",
    coreOrbit:"15deg 77deg 65%",networkOrbit:"-28deg 64deg 78%",
    coreOffset:{x:-.12,y:.06,z:.04},
    networkOffset:{x:.06,y:.19,z:.12}
  },
  hunter:{
    url:"./assets/eidolon/hunter.glb?v=20261008-hunter-textured-v1",
    label:"HUNTER",homeOrbit:"32deg 74deg 118%",
    coreOrbit:"18deg 76deg 68%",networkOrbit:"-24deg 60deg 76%",
    coreOffset:{x:-.04,y:.08,z:.05},
    networkOffset:{x:.05,y:.24,z:.12}
  }
};
const MODEL_VIEWER_SRC="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
const HOME_TARGET="auto auto auto";

export function initEidolon3D(root,{reduced=false}={}){
  let viewerPromise=null;
  let creationPromise=null;
  let modelStage=null;
  let modelViewer=null;
  let classKey=root.dataset.eiClass||"brute";
  let focusKey=root.dataset.eiFocus||"morphology";
  let activeModelKey=null;
  let loadedModelKey=null;
  const modelFor=()=>MODELS[classKey]||null;

  function focusTarget(mode){
    const config=modelFor();
    if(!config||
       typeof modelViewer?.getBoundingBoxCenter!=="function"||
       typeof modelViewer?.getDimensions!=="function")return HOME_TARGET;
    const center=modelViewer.getBoundingBoxCenter();
    const dims=modelViewer.getDimensions();
    if(!center||!dims||![center.x,center.y,center.z,dims.x,dims.y,dims.z].every(Number.isFinite))
      return HOME_TARGET;
    const delta=mode==="core"?config.coreOffset:config.networkOffset;
    return [center.x+dims.x*delta.x,center.y+dims.y*delta.y,center.z+dims.z*delta.z]
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
        customElements.whenDefined("model-viewer").then(resolve,reject);
        return;
      }
      const script=document.createElement("script");
      script.type="module";
      script.src=MODEL_VIEWER_SRC;
      script.dataset.eiModelViewer="1";
      script.onload=()=>customElements.whenDefined("model-viewer").then(resolve,reject);
      script.onerror=reject;
      document.head.appendChild(script);
    }).catch(error=>{viewerPromise=null;throw error});
    return viewerPromise;
  }

  function syncVisibility(){
    const enabled=!!modelFor();
    if(modelStage)modelStage.hidden=!enabled;
    if(modelViewer){
      modelViewer.style.display=enabled?"block":"none";
      if(!enabled||loadedModelKey!==classKey||focusKey!=="morphology"||reduced)
        modelViewer.removeAttribute("auto-rotate");
    }
    root.classList.toggle("ei-has-3d",enabled&&!!modelStage);
    if(!enabled){
      root.classList.remove("ei-model-pending","ei-model-ready","ei-model-error");
    }
  }

  function activateModel(){
    const config=modelFor();
    if(!config||!modelViewer)return;
    if(activeModelKey!==classKey){
      activeModelKey=classKey;
      loadedModelKey=null;
      root.classList.remove("ei-model-ready","ei-model-error");
      root.classList.add("ei-model-pending");
      modelViewer.style.visibility="hidden";
      modelViewer.removeAttribute("auto-rotate");
      modelViewer.setAttribute("camera-target",HOME_TARGET);
      modelViewer.setAttribute("camera-orbit",config.homeOrbit);
      modelViewer.setAttribute("alt",config.label+" class EIDOLON textured 3D reference model");
      modelViewer.setAttribute("src",config.url);
      return;
    }
    if(loadedModelKey===classKey){
      root.classList.remove("ei-model-pending","ei-model-error");
      root.classList.add("ei-model-ready");
      modelViewer.style.visibility="visible";
      applyFocus();
    }
  }

  function onModelLoad(){
    const config=MODELS[activeModelKey];
    if(!config||modelViewer?.getAttribute("src")!==config.url)return;
    loadedModelKey=activeModelKey;
    if(classKey!==activeModelKey)return;
    root.classList.remove("ei-model-pending","ei-model-error");
    root.classList.add("ei-model-ready");
    modelViewer.style.visibility="visible";
    applyFocus();
  }

  function onModelError(){
    if(classKey!==activeModelKey)return;
    root.classList.remove("ei-model-pending","ei-model-ready");
    root.classList.add("ei-model-error");
    modelViewer.removeAttribute("auto-rotate");
  }

  function ensure3DModel(){
    if(!modelFor())return Promise.resolve();
    const stage=buildModelStage();
    if(!stage)return Promise.resolve();
    syncVisibility();
    if(modelViewer){
      activateModel();
      return Promise.resolve();
    }
    if(!creationPromise){
      root.classList.add("ei-model-pending");
      creationPromise=(async()=>{
        try{
          await loadModelViewer();
          if(!modelFor())return;
          const viewer=document.createElement("model-viewer");
          viewer.className="ei-model-viewer";
          viewer.setAttribute("camera-controls","");
          viewer.setAttribute("interaction-prompt","none");
          viewer.setAttribute("shadow-intensity","1.05");
          viewer.setAttribute("shadow-softness","0.75");
          viewer.setAttribute("exposure","0.72");
          viewer.setAttribute("camera-target",HOME_TARGET);
          viewer.setAttribute("min-camera-orbit","auto 25deg 30%");
          viewer.setAttribute("max-camera-orbit","auto 115deg auto");
          viewer.setAttribute("interpolation-decay","140");
          viewer.setAttribute("rotation-per-second","10deg");
          viewer.setAttribute("auto-rotate-delay","1000");
          viewer.addEventListener("load",onModelLoad);
          viewer.addEventListener("error",onModelError);
          modelViewer=viewer;
          stage.prepend(viewer);
          syncVisibility();
          activateModel();
        }catch(error){
          console.warn("EIDOLON 3D model failed to initialize.",error);
          root.classList.remove("ei-model-pending","ei-model-ready");
          if(modelFor())root.classList.add("ei-model-error");
        }
      })().finally(()=>{creationPromise=null});
    }
    return creationPromise;
  }

  function applyFocus(){
    const config=modelFor();
    if(!config||!modelViewer||loadedModelKey!==classKey)return;
    root.dataset.ei3dFocus=focusKey;
    if(focusKey==="morphology"){
      modelViewer.removeAttribute("auto-rotate");
      modelViewer.setAttribute("camera-target",HOME_TARGET);
      modelViewer.setAttribute("camera-orbit",config.homeOrbit);
      if(typeof modelViewer.resetTurntableRotation==="function")
        modelViewer.resetTurntableRotation(0);
      if(!reduced)modelViewer.setAttribute("auto-rotate","");
      return;
    }
    modelViewer.removeAttribute("auto-rotate");
    if(typeof modelViewer.resetTurntableRotation==="function")
      modelViewer.resetTurntableRotation(0);
    modelViewer.setAttribute("camera-target",focusTarget(focusKey));
    modelViewer.setAttribute("camera-orbit",focusKey==="core"?config.coreOrbit:config.networkOrbit);
  }

  function setClass(key){
    classKey=key;
    syncVisibility();
    if(modelFor())ensure3DModel().then(()=>{
      if(modelFor())activateModel();
    });
  }

  function setFocus(key){
    focusKey=["core","network","morphology"].includes(key)?key:"morphology";
    applyFocus();
  }

  return {setClass,setFocus};
}
