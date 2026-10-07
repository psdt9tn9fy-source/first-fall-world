export function initEidolonDossier(root,{reduced=false}={}){
  const scanner=root.querySelector("#eiScanner");
  if(!scanner)return {show(){},close(){}};
  let panel=scanner.querySelector(".ei-live-dossier"),run=0;
  if(!panel){
    panel=document.createElement("aside");
    panel.className="ei-live-dossier";
    panel.setAttribute("aria-live","polite");
    panel.innerHTML=`
      <div class="ei-doc-corners" aria-hidden="true"></div>
      <header class="ei-live-head">
        <div><span>I.D.A. // HOSTILE ENTITY DOSSIER</span><small>PUBLIC INTELLIGENCE ARCHIVE // NODE 07</small></div>
        <div><b data-live-state>STANDBY</b><button class="ei-live-close" type="button" aria-label="Close entity information">×</button></div>
      </header>
      <div class="ei-doc-classline"><span data-live-code></span><i>ENTITY RECORD</i></div>
      <div class="ei-doc-title"><div><span>CLASSIFIED REFERENCE</span><h3 data-live-title></h3></div><strong data-live-mark></strong></div>
      <section class="ei-live-lines">
        <div><span>CLASSIFICATION</span><b data-live-class></b></div>
        <div><span>SCALE</span><b data-live-scale></b></div>
        <div><span>PRIMARY ROLE</span><b data-live-role></b></div>
        <div><span>OPERATIONAL RISK</span><b data-live-risk></b></div>
      </section>
      <div class="ei-doc-section"><span>01 // CLASS PROFILE</span><p data-live-body></p></div>
      <div class="ei-doc-grid">
        <section><span>02 // CORE SYSTEM</span><p data-live-core></p></section>
        <section><span>03 // ADAPTIVE NETWORK</span><p data-live-network></p></section>
      </div>
      <div class="ei-doc-section ei-doc-warning"><span>04 // FIELD NOTE</span><p data-live-note></p></div>
      <footer><span data-live-foot>DATA STREAM // ACTIVE</span><i></i><b>I.D.A. 2134</b></footer>`;
    scanner.appendChild(panel);
    panel.querySelector(".ei-live-close")?.addEventListener("click",e=>{e.stopPropagation();close()});
  }
  const get=s=>panel.querySelector(s);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function stream(el,text,token,speed=8){
    if(!el)return false;
    el.textContent="";
    if(reduced){el.textContent=text;return true}
    for(let i=0;i<text.length;){
      if(token!==run)return false;
      const r=Math.random(),burst=r<.16?4:r<.38?3:r<.68?2:1;
      i=Math.min(text.length,i+burst);
      el.textContent=text.slice(0,i);
      await sleep(speed+Math.random()*7);
    }
    return token===run;
  }
  async function show(record){
    const token=++run;
    panel.scrollTop=0;
    panel.classList.remove("ready");
    panel.classList.add("open","streaming");
    get("[data-live-state]").textContent="RETRIEVING RECORD...";
    get("[data-live-foot]").textContent="DATA STREAM // ACTIVE";
    const fields=["code","title","mark","class","scale","role","risk","body","core","network","note"];
    fields.forEach(k=>{const el=get("[data-live-"+k+"]");if(el)el.textContent=""});
    if(!reduced)await sleep(70);
    if(token!==run)return;
    get("[data-live-state]").textContent=record.state||"ENTITY IDENTIFIED";
    await Promise.all([
      stream(get("[data-live-code]"),record.code||"",token,5),
      stream(get("[data-live-mark]"),record.mark||"",token,5)
    ]);
    if(token!==run)return;
    await stream(get("[data-live-title]"),record.title||"",token,6);
    await Promise.all([
      stream(get("[data-live-class]"),record.classification||"",token,5),
      stream(get("[data-live-scale]"),record.scale||"",token,5),
      stream(get("[data-live-role]"),record.role||"",token,5),
      stream(get("[data-live-risk]"),record.risk||"",token,5)
    ]);
    if(token!==run)return;
    await stream(get("[data-live-body]"),record.body||"",token,8);
    await Promise.all([
      stream(get("[data-live-core]"),record.core||"",token,8),
      stream(get("[data-live-network]"),record.network||"",token,8)
    ]);
    if(token!==run)return;
    await stream(get("[data-live-note]"),record.note||"",token,8);
    if(token!==run)return;
    get("[data-live-state]").textContent="RECORD VERIFIED";
    get("[data-live-foot]").textContent="DATA STREAM // COMPLETE";
    panel.classList.remove("streaming");panel.classList.add("ready");
  }
  function close(){run++;panel.classList.remove("open","streaming","ready")}
  return {show,close};
}
