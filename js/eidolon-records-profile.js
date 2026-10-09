/* Entity identification: lifecycle, rescans and SERAPH incomplete readings. */
export function initProfileRecord(root,{reduced,signal}){
  const ident=root.querySelector("[data-ei-ident-matrix]");
  const identStatus=root.querySelector("[data-ei-profile-status]");
  const identResult=root.querySelector("[data-ei-ident-result]");
  const identRows=[...root.querySelectorAll("[data-ident-row]")];
  const correlation=root.querySelector("[data-ei-correlation]");
  const rescan=root.querySelector("[data-ei-rescan]");
  let identToken=0;
  const summaryStatuses=identRows.slice(0,3).map(row=>row.querySelector("em")?.textContent||"");
  const evidenceRows=identRows.slice(3,6).map(row=>({
    row,body:row.querySelector("b")?.textContent||"",status:row.querySelector("em")?.textContent||""
  }));
  function syncEvidenceRows(seraph){
    identRows.slice(0,3).forEach((row,index)=>{
      const badge=row.querySelector("em");
      if(badge)badge.textContent=seraph?"미검증":summaryStatuses[index];
    });
    const unknown=[["표본 미확보","검증 불가"],["인간형 목격 보고","불확실"],["자료 없음","미확인"]];
    evidenceRows.forEach(({row,body,status},index)=>{
      const text=row.querySelector("b"),statusEl=row.querySelector("em");
      if(text)text.textContent=seraph?unknown[index][0]:body;
      if(statusEl)statusEl.textContent=seraph?unknown[index][1]:status;
    });
  }

  function runIdentification(){
    if(!ident)return;
    const token=++identToken;
    const seraph=root.dataset.eiClass==="seraph";
    ident.classList.remove("locked","outlier");
    identRows.forEach(row=>row.classList.remove("resolved"));
    if(identStatus)identStatus.textContent="ACQUIRING";
    if(identResult)identResult.textContent="TARGET ACQUISITION";
    if(correlation)correlation.textContent="CORRELATING";
    const finish=()=>{
      if(token!==identToken)return;
      ident.classList.add("locked");
      if(seraph)ident.classList.add("outlier");
      identRows.forEach(row=>row.classList.add("resolved"));
      if(identStatus)identStatus.textContent=seraph?"INCONCLUSIVE":"VERIFIED";
      if(identResult)identResult.textContent=seraph?"IDENTIFICATION INCOMPLETE":"IDENTIFICATION CONFIRMED";
      if(correlation)correlation.textContent=seraph?"INSUFFICIENT // OUTLIER":"HIGH // VERIFIED";
    };
    if(reduced)finish();else setTimeout(finish,920);
  }

  function syncIdentification(detail={}){
    const seraph=(detail.classKey||root.dataset.eiClass)==="seraph";
    const mark=detail.mark||root.querySelector("[data-ei-profile-mark]")?.textContent||"?";
    const name=detail.name||root.querySelector("[data-ei-profile-name]")?.textContent||"UNKNOWN";
    const cls=root.querySelector('[data-ident="class"]');
    const scale=root.querySelector('[data-ident="scale"]');
    const role=root.querySelector('[data-ident="role"]');
    if(cls)cls.textContent=seraph?"? // SERAPH":mark+" // "+name;
    if(scale)scale.textContent=seraph?"HUMAN-SIZED / UNVERIFIED":(root.querySelector('[data-ei-field="scale"]')?.textContent||"VARIABLE");
    if(role)role.textContent=seraph?"OUTLIER / INSUFFICIENT EVIDENCE":(root.querySelector('[data-ei-field="role"]')?.textContent||"UNRESOLVED");
    syncEvidenceRows(seraph);
    runIdentification();
  }


  rescan?.addEventListener("click",runIdentification,{signal});
  return {runIdentification,syncIdentification,destroy(){identToken++}};
}
