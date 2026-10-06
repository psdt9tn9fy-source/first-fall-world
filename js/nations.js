import { N, ext } from "./data.js";

export function initNations(){
const list=document.querySelector("#nationList");
function show(n){document.querySelectorAll(".nation-btn").forEach(x=>x.classList.toggle("active",x.dataset.k===n[0]));document.querySelector("#nf").src="./assets/flags-hq/"+n[0]+"-2134."+(ext[n[0]]||"jpg");document.querySelector("#nf").onerror=function(){this.style.visibility="hidden"};document.querySelector("#nf").style.visibility="visible";["nc","nn","ne","ns","np","nca","nst","nb"].forEach((id,i)=>document.querySelector("#"+id).textContent=n[i+1])}
N.forEach(n=>{let b=document.createElement("button");b.className="nation-btn";b.dataset.k=n[0];b.innerHTML='<img src="./assets/flags-hq/'+n[0]+'-2134.'+(ext[n[0]]||"jpg")+'" onerror="this.style.visibility=\'hidden\'"><b>'+n[2]+'</b><small>'+n[1].split(" //")[0]+'</small>';b.onclick=()=>show(n);list.appendChild(b)});show(N[0]);
}
