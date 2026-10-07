export function initEidolonDossier(root,{reduced=false}={}){
  const scanner=root.querySelector("#eiScanner");
  if(!scanner)return {show(){},close(){}};
  let panel=scanner.querySelector(".ei-live-dossier"),run=0;
  if(!panel){
    panel=document.createElement("aside");
    panel.className="ei-live-dossier ei-fui-dossier";
    panel.setAttribute("aria-live","polite");
    panel.innerHTML=`
      <div class="ei-fui-shutter" aria-hidden="true"><i></i><i></i></div>
      <div class="ei-fui-frame" aria-hidden="true"></div>
      <header class="ei-live-head">
        <div><span>I.D.A. // ENTITY INTELLIGENCE ARCHIVE</span><small>PUBLIC ACCESS // HOSTILE ENTITY RECORD</small></div>
        <div><b data-live-state>STANDBY</b><button class="ei-live-close" type="button" aria-label="Close entity information">×</button></div>
      </header>
      <main class="ei-fui-document">
        <div class="ei-fui-index"><span data-live-code></span><i>RECORD // 03</i></div>
        <section class="ei-fui-hero" data-stage="hero"><strong data-live-mark></strong><div><span>CLASSIFICATION RECORD</span><h3 data-live-title></h3><em data-live-role></em></div></section>
        <section class="ei-fui-meta" data-stage="meta">
          <div><span>CLASS</span><b data-live-class></b></div><div><span>SCALE</span><b data-live-scale></b></div>
          <div><span>ROLE</span><b data-live-role2></b></div><div><span>RISK</span><b data-live-risk></b></div>
        </section>
        <section class="ei-fui-entry" data-stage="body"><header><b>01</b><span>IDENTIFICATION</span><i></i></header><p data-live-body></p></section>
        <section class="ei-fui-entry" data-stage="core"><header><b>02</b><span>CORE STRUCTURE</span><i></i></header><p data-live-core></p></section>
        <section class="ei-fui-entry" data-stage="network"><header><b>03</b><span>COMBAT ADAPTATION</span><i></i></header><p data-live-network></p></section>
        <section class="ei-fui-entry ei-fui-field" data-stage="note"><header><b>04</b><span>FIELD DIRECTIVE</span><i></i></header><p data-live-note></p></section>
      </main>
      <footer><span data-live-foot>LINK // IDLE</span><i></i><b>NODE 07 // 2134</b></footer>`;
    scanner.appendChild(panel);
    panel.querySelector(".ei-live-close")?.addEventListener("click",e=>{e.stopPropagation();close()});
  }
  const get=s=>panel.querySelector(s),all=s=>[...panel.querySelectorAll(s)];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function clear(){
    all("[data-stage]").forEach(el=>el.classList.remove("arrived","writing"));
    ["code","title","mark","class","scale","role","role2","risk","body","core","network","note"].forEach(k=>{const el=get("[data-live-"+k+"]");if(el)el.textContent=""});
  }
  async function stream(el,text,token,speed=7){
    if(!el)return false;text=String(text??"");
    if(reduced){el.textContent=text;return true}
    for(let i=0;i<text.length;){
      if(token!==run)return false;
      const r=Math.random(),n=r<.2?5:r<.46?3:r<.76?2:1;
      i=Math.min(text.length,i+n);el.textContent=text.slice(0,i);
      await sleep(speed+Math.random()*6);
    }
    return token===run;
  }
  async function reveal(stage,el,text,token,speed=7){
    const box=get('[data-stage="'+stage+'"]');box?.classList.add("arrived","writing");
    await stream(el,text,token,speed);
    box?.classList.remove("writing");
    return token===run;
  }
  async function show(record){
    const token=++run;
    clear();panel.scrollTop=0;
    panel.classList.remove("ready","closing","booting","streaming");
    panel.classList.add("open");
    /* Force the open state to paint before the boot phase begins. */
    void panel.offsetHeight;
    panel.classList.add("booting");
    get("[data-live-state]").textContent="ACCESSING...";
    get("[data-live-foot]").textContent="LINK // ESTABLISHING";
    if(!reduced)await sleep(150); if(token!==run)return;
    panel.classList.remove("booting");panel.classList.add("streaming");
    get("[data-live-state]").textContent=record.state||"ENTITY IDENTIFIED";
    await stream(get("[data-live-code]"),record.code||"",token,5);
    if(token!==run)return;
    const hero=get('[data-stage="hero"]');hero.classList.add("arrived","writing");
    await Promise.all([stream(get("[data-live-mark]"),record.mark||"",token,5),stream(get("[data-live-title]"),record.title||"",token,6),stream(get("[data-live-role]"),record.role||"",token,5)]);
    hero.classList.remove("writing");if(token!==run)return;
    const meta=get('[data-stage="meta"]');meta.classList.add("arrived","writing");
    await Promise.all([stream(get("[data-live-class]"),record.classification||"",token,4),stream(get("[data-live-scale]"),record.scale||"",token,4),stream(get("[data-live-role2]"),record.role||"",token,4),stream(get("[data-live-risk]"),record.risk||"",token,4)]);
    meta.classList.remove("writing");if(token!==run)return;
    await reveal("body",get("[data-live-body]"),record.body||"",token,7);if(token!==run)return;
    await reveal("core",get("[data-live-core]"),record.core||"",token,7);if(token!==run)return;
    await reveal("network",get("[data-live-network]"),record.network||"",token,7);if(token!==run)return;
    await reveal("note",get("[data-live-note]"),record.note||"",token,7);if(token!==run)return;
    get("[data-live-state]").textContent="RECORD VERIFIED";
    get("[data-live-foot]").textContent="LINK // VERIFIED";
    panel.classList.remove("streaming");panel.classList.add("ready");
  }
  function close(){
    const token=++run;panel.classList.remove("booting","streaming","ready");panel.classList.add("closing");
    setTimeout(()=>{if(token===run)panel.classList.remove("open","closing")},reduced?0:180);
  }
  return {show,close};
}
