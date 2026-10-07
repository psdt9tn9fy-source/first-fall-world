export function initEidolonDossier(root,{reduced=false}={}){
  const scanner=root.querySelector("#eiScanner");
  if(!scanner)return {show(){},close(){}};
  let panel=scanner.querySelector(".ei-live-dossier"),run=0;
  if(!panel){
    panel=document.createElement("aside");
    panel.className="ei-live-dossier";
    panel.setAttribute("aria-live","polite");
    panel.innerHTML='<div class="ei-live-head"><span>I.D.A. // ENTITY INFORMATION</span><div><b data-live-state>STANDBY</b><button class="ei-live-close" type="button" aria-label="Close entity information">×</button></div></div><div class="ei-live-code" data-live-code></div><h3 data-live-title></h3><div class="ei-live-lines"><div><span>CLASS</span><b data-live-class></b></div><div><span>SCALE</span><b data-live-scale></b></div><div><span>ROLE</span><b data-live-role></b></div></div><p data-live-body></p><footer><span data-live-foot>STREAM // ACTIVE</span><i></i></footer>';
    scanner.appendChild(panel);
    panel.querySelector(".ei-live-close")?.addEventListener("click",close);
  }
  const get=s=>panel.querySelector(s);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function stream(el,text,token,speed=11){
    el.textContent="";
    if(reduced){el.textContent=text;return true}
    for(let i=0;i<text.length;){
      if(token!==run)return false;
      const burst=Math.min(text.length-i,Math.random()<.28?3:Math.random()<.5?2:1);
      i+=burst;el.textContent=text.slice(0,i);
      await sleep(speed+Math.random()*9);
    }
    return token===run;
  }
  async function show(record){
    const token=++run;
    panel.classList.remove("ready");
    panel.classList.add("open","streaming");
    get("[data-live-state]").textContent="RETRIEVING...";
    get("[data-live-code]").textContent="";
    get("[data-live-title]").textContent="";
    ["[data-live-class]","[data-live-scale]","[data-live-role]","[data-live-body]"].forEach(s=>get(s).textContent="");
    if(!reduced)await sleep(35);
    if(token!==run)return;
    get("[data-live-state]").textContent=record.state||"ENTITY IDENTIFIED";
    await Promise.all([
      stream(get("[data-live-code]"),record.code||"",token,7),
      stream(get("[data-live-title]"),record.title||"",token,8)
    ]);
    if(token!==run)return;
    await stream(get("[data-live-class]"),record.classification||"",token,6);
    await stream(get("[data-live-scale]"),record.scale||"",token,6);
    await stream(get("[data-live-role]"),record.role||"",token,6);
    await stream(get("[data-live-body]"),record.body||"",token,10);
    if(token!==run)return;
    get("[data-live-state]").textContent="RECORD VERIFIED";
    get("[data-live-foot]").textContent="STREAM // COMPLETE";
    panel.classList.remove("streaming");panel.classList.add("ready");
  }
  function close(){run++;panel.classList.remove("open","streaming","ready")}
  return {show,close};
}
