/* Nest topology map and scanning lifecycle (3D rendering is independent). */
export function initNestRecord(root,{reduced,signal}){
  const nestTopology=root.querySelector("[data-ei-nest-topology]");
  const nestStatus=root.querySelector("[data-ei-nest-status]");
  const nestCore=root.querySelector("[data-ei-nest-core]");
  const nestScan=root.querySelector("[data-ei-scan-nest]");
  let nestToken=0;

  function scanNest(level=root.dataset.eiNest||"small"){
    if(!nestTopology)return;
    const token=++nestToken;
    if(root.dataset.eiClass==="seraph"){
      nestTopology.classList.remove("scanning","scanned");
      if(nestStatus)nestStatus.textContent="NO VERIFIED LINK";
      return;
    }
    nestTopology.dataset.level=level;
    nestTopology.classList.remove("scanned");
    nestTopology.classList.add("scanning");
    if(nestStatus)nestStatus.textContent="MAPPING";
    if(nestCore)nestCore.textContent=level.toUpperCase();
    const finish=()=>{if(token!==nestToken)return;nestTopology.classList.remove("scanning");nestTopology.classList.add("scanned");if(nestStatus)nestStatus.textContent="LINKED"};
    if(reduced)finish();else setTimeout(finish,1150);
  }


  nestScan?.addEventListener("click",()=>{if(root.dataset.eiClass!=="seraph")scanNest()},{signal});
  root.addEventListener("eidolon:nest-change",event=>scanNest(event.detail?.key||root.dataset.eiNest||"small"),{signal});
  return {scanNest,cancel(){nestToken++},destroy(){nestToken++}};
}
