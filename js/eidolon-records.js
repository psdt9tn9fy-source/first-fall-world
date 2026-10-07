const MODULES=["profile","behavior","nest","engagement"];

export function initEidolonRecords(root,{onTabChange}={}){
  if(!root)return null;
  const buttons=[...root.querySelectorAll("[data-ei-tab-btn]")];
  const panels=[...root.querySelectorAll("[data-ei-panel]")];
  if(!buttons.length||!panels.length)return null;

  function setTab(key,{silent=false}={}){
    if(!MODULES.includes(key))return;
    root.dataset.eiTab=key;
    buttons.forEach(button=>{
      const active=button.dataset.eiTabBtn===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",String(active));
    });
    panels.forEach(panel=>panel.classList.toggle("active",panel.dataset.eiPanel===key));
    if(!silent)onTabChange?.(key);
  }

  buttons.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.eiTabBtn)));
  setTab(root.dataset.eiTab||"profile",{silent:true});
  return {setTab};
}
