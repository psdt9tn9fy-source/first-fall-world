import { N, ext } from "./data.js";

export function initNations(){
  const list=document.querySelector("#nationList");
  const byKey=new Map(N.map(n=>[n[0],n]));
  function show(n){
    if(!n)return;
    document.querySelectorAll(".nation-btn").forEach(x=>x.classList.toggle("active",x.dataset.k===n[0]));
    const img=document.querySelector("#nf");img.src="./assets/flags-hq/"+n[0]+"-2134."+(ext[n[0]]||"jpg");
    img.onerror=function(){this.style.visibility="hidden"};img.style.visibility="visible";
    ["nc","nn","ne","ns","np","nca","nst","nb"].forEach((id,i)=>document.querySelector("#"+id).textContent=n[i+1]);
  }
  N.forEach(n=>{
    const b=document.createElement("button");b.className="nation-btn";b.dataset.k=n[0];
    b.innerHTML='<img src="./assets/flags-hq/'+n[0]+'-2134.'+(ext[n[0]]||"jpg")+'" onerror="this.style.visibility=\'hidden\'"><b>'+n[2]+'</b><small>'+n[1].split(" //")[0]+'</small>';
    b.onclick=()=>show(n);list.appendChild(b);
  });
  window.addEventListener("archive:select-nation",e=>show(byKey.get(e.detail?.key)));
  show(N[0]);
}
