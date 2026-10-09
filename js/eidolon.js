import { CLASSES, NESTS } from "./eidolon-data.js?v=20261009-nest-clean-v1";
import { initSeraphArchive } from "./eidolon-seraph.js?v=20261009-seraph-polish-v2";

export function initEidolon(){
  const root=document.querySelector("#eidolonLab");
  if(!root)return;

  const classButtons=[...root.querySelectorAll("[data-ei-class-btn]")];
  const focusButtons=[...root.querySelectorAll("[data-ei-focus]")];
  const nestButtons=[...root.querySelectorAll("[data-ei-nest]")];
  const scanner=root.querySelector("#eiScanner");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let classIndex=2,scanTimer=0,pointerX=null;
  const textRuns=new WeakMap();
  let threeDModulePromise=null,threeDController=null,dossierPromise=null,dossier=null,recordsPromise=null,records=null;

  const q=id=>root.querySelector(id);
  const field=(name,value)=>root.querySelectorAll('[data-ei-field="'+name+'"]').forEach(el=>el.textContent=value);
  const current=()=>CLASSES[classIndex];
  const seraphArchive=initSeraphArchive(root,{reduced});

  function loadRecords(){
    if(recordsPromise)return recordsPromise;
    recordsPromise=import("./eidolon-records.js?v=20261009-n03-v1").then(mod=>{
      records=mod.initEidolonRecords(root);
      const c=current();
      root.dispatchEvent(new CustomEvent("eidolon:class-risk",{detail:{key:c.key==="seraph"?"측정 불가":c.riskKey,classKey:c.key,mark:c.mark,name:c.name,risk:c.risk}}));
      return records;
    }).catch(err=>{console.warn("에이돌론 기록을 불러올 수 없음",err);return null});
    return recordsPromise;
  }

  function loadDossier(){
    if(dossier)return Promise.resolve(dossier);
    if(dossierPromise)return dossierPromise;
    dossierPromise=import("./eidolon-dossier.js?v=20261009-seraph-v1").then(mod=>{
      dossier=mod.initEidolonDossier(root,{reduced});
      return dossier;
    }).catch(error=>{console.warn("에이돌론 상세기록을 불러올 수 없음.",error);dossierPromise=null;return null});
    return dossierPromise;
  }

  function showLiveDossier(mode="morphology"){
    const c=current();
    if(c.key==="seraph"){
      const info=seraphArchive.description(mode);
      loadDossier().then(ctrl=>ctrl?.show({
        unverified:true,state:"자료 부족 // 미확인",code:"적성 개체 // ? // 세라프",
        mark:"?",title:info.title,classification:"SERAPH / 규격외",
        scale:c.scale,role:c.role,risk:c.risk,
        body:info.body,core:seraphArchive.description("core").body,
        network:seraphArchive.description("network").body,
        note:"검증된 포획 표본이나 확정된 외형 기록이 없다. 공개 정보는 단편적인 목격담에 의존하며, 참고 이미지가 실제 개체의 외형과 일치한다고 단정할 수 없다."
      }));
      return;
    }
    let state="개체 식별 완료",title=c.mark+" // "+c.name,body=c.brief;
    if(mode==="core"){state="코어 분석 중";title="코어 분석";body="코어는 동력원·연산장치·신경중추 역할을 겸한다. 일부 개체는 외형이 파괴되어도 코어가 온전하면 재가동할 수 있다."}
    else if(mode==="network"){state="공유 데이터 수신 중";title="적응 네트워크";body="에이돌론은 인간의 무기와 전술을 학습하고 전투정보를 공유한다. 반복되는 전술은 시간이 지날수록 효과가 떨어질 수 있다."}
    else if(mode==="morphology")body=c.brief+" 형태와 크기는 개체마다 다양하며 이 화면은 분류 참고용 개념 스캔이다.";
    loadDossier().then(ctrl=>ctrl?.show({state,code:"적성 개체 // "+c.mark+" // "+c.name,mark:c.mark,title,classification:c.name+" / "+c.ko,scale:c.scale,role:c.role,risk:c.risk,body,core:"대부분의 에이돌론은 발광하는 코어를 보유한다. 코어는 동력·연산·신경중추에 해당하는 핵심 기관이며, 일부 개체는 외형이 파괴되어도 코어가 온전하면 재가동할 수 있어 현장에서는 파괴 또는 회수 여부를 확인한다.",network:"에이돌론의 가장 위험한 공통 특성은 전투학습과 정보공유다. 인간의 무기와 전술을 학습하고 전투정보를 공유하기 때문에 동일한 공격 방식의 반복은 시간이 지날수록 효과가 저하될 수 있다.",note:c.key==="seraph"?"기존 I–V 분류체계 밖의 특이개체. 일부 개체는 인간의 언어 또는 사고를 이해하는 정황이 있으며 고유 식별명으로 장기 추적될 수 있다.":c.key==="ark"?"도시 규모에 직접적인 위협을 가할 수 있는 전략개체. 아크 관련 교전은 S급 작전위험 대응 대상이 될 수 있다.":"형태와 크기, 세부 능력은 같은 분류 안에서도 달라질 수 있다. 본 기록은 공개 분류체계의 참고 자료이며 개별 개체의 완전한 전투 사양을 의미하지 않는다."}));
  }

  function load3DController(){
    if(threeDController)return Promise.resolve(threeDController);
    if(threeDModulePromise)return threeDModulePromise;
    threeDModulePromise=import("./eidolon-3d.js?v=20261008-eidolon-maint-v1").then(mod=>{
      threeDController=mod.initEidolon3D(root,{reduced});
      threeDController.setClass(current().key);
      threeDController.setFocus(root.dataset.eiFocus||"morphology");
      return threeDController;
    }).catch(error=>{
      console.warn("3D 자료를 불러오지 못해 2D 기록으로 표시합니다.",error);
      threeDModulePromise=null;
      return null;
    });
    return threeDModulePromise;
  }

  function sync3D(){
    threeDController?.setClass(current().key);
    const view=root.closest(".view");
    if(view?.classList.contains("active"))load3DController();
  }

  function setRiskScale(key=""){
    const unbounded=key==="측정 불가";
    root.querySelectorAll(".ei-risk-scale span").forEach(el=>el.classList.toggle("active",!unbounded&&el.dataset.risk===key));
    root.classList.toggle("risk-s",key==="S");
    root.classList.toggle("risk-unbounded",unbounded);
  }

  function typeRecord(el,text,status="데이터 해독"){
    if(!el)return;
    const run=(textRuns.get(el)||0)+1;
    textRuns.set(el,run);
    el.classList.remove("ei-type-done");
    el.classList.add("ei-type-active");
    el.dataset.decode=status;
    if(reduced){el.textContent=text;el.classList.remove("ei-type-active");el.classList.add("ei-type-done");return}
    const glyphs="01/\\[]<>#_";
    let scramble=0;
    const scrambleTimer=setInterval(()=>{
      if(run!==textRuns.get(el)){clearInterval(scrambleTimer);return}
      const reveal=Math.min(10,Math.max(4,Math.floor(text.length*.12)));
      el.textContent=Array.from({length:reveal},()=>glyphs[Math.floor(Math.random()*glyphs.length)]).join("");
      if(++scramble>=3){
        clearInterval(scrambleTimer);
        let i=0;el.textContent="";
        const tick=()=>{
          if(run!==textRuns.get(el))return;
          const step=text[i]?.match(/[\s.,·]/)?2:1;
          i=Math.min(text.length,i+step);
          el.textContent=text.slice(0,i);
          if(i<text.length)setTimeout(tick,14+Math.random()*18);
          else{el.classList.remove("ei-type-active");el.classList.add("ei-type-done")}
        };
        setTimeout(tick,55);
      }
    },45);
  }

  function focusAnalysis(type){
    const c=current();
    root.dataset.eiFocus=type;
    focusButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiFocus===type));
    const title=q("#eiFocusTitle"),body=q("#eiFocusBody"),meta=q("#eiFocusMeta"),index=q("#eiFocusIndex"),statusEl=q("#eiFocusStatus");
    if(index)index.textContent=type==="core"?"01 / 03":type==="network"?"02 / 03":"03 / 03";
    if(statusEl)statusEl.textContent="분석 중";
    threeDController?.setFocus(type);
    if(c.key==="seraph"){
      const info=seraphArchive.setFocus(type);
      title.textContent=info.title;
      meta.textContent=info.meta;
      typeRecord(body,info.body,"자료 미확인");
      if(statusEl)statusEl.textContent="검증 불가";
      return;
    }
    let copy="",status="형태 기록";
    if(type==="core"){
      title.textContent="CORE";
      meta.textContent="동력 / 연산 / 신경망";
      copy="코어는 동력원·연산장치·신경중추 역할을 겸한다. 일부 개체는 외형이 파괴되어도 코어가 온전하면 재가동할 수 있다.";
      status="코어 분석 중";
    }else if(type==="network"){
      title.textContent="적응 네트워크";
      meta.textContent="전투 데이터 / 공유 학습";
      copy="에이돌론은 인간의 무기와 전술을 학습하고 전투정보를 공유한다. 반복되는 전술은 시간이 지날수록 효과가 떨어질 수 있다.";
      status="공유 데이터 수신 중";
    }else{
      title.textContent="형태 분석";
      meta.textContent=c.scale+" // "+c.role;
      copy=c.brief+" 형태와 크기는 개체마다 다양하며 이 화면은 분류 참고용 개념 스캔이다.";
      status="형태 기록";
    }
    typeRecord(body,copy,status);
    if(statusEl)setTimeout(()=>{if(root.dataset.eiFocus===type&&root.dataset.eiClass!=="seraph")statusEl.textContent="확인됨"},reduced?0:760);
  }

  function pulseScan(){
    if(reduced)return;
    clearTimeout(scanTimer);
    root.classList.remove("scanning");void root.offsetWidth;root.classList.add("scanning");
    scanTimer=setTimeout(()=>root.classList.remove("scanning"),480);
  }

  function selectClass(key,{animate=true}={}){
    const next=CLASSES.findIndex(c=>c.key===key);
    if(next<0)return;
    classIndex=next;
    const c=current();
    root.dataset.eiClass=c.key;
    root.classList.toggle("seraph-mode",c.key==="seraph");
    seraphArchive.setClass(c.key);
    classButtons.forEach(b=>{
      const active=b.dataset.eiClassBtn===c.key;
      b.classList.toggle("active",active);
      b.setAttribute("aria-selected",String(active));
    });
    field("mark",c.mark);
    field("name",c.name);
    field("ko",c.ko);
    field("scale",c.scale);
    field("role",c.role);
    field("risk",c.risk);
    const profileMark=root.querySelector("[data-ei-profile-mark]"),profileName=root.querySelector("[data-ei-profile-name]");
    if(profileMark)profileMark.textContent=c.mark;
    if(profileName)profileName.textContent=c.name;
    typeRecord(q("#eiProfileBody"),c.brief,"표본 식별 완료");
    q("#eiBehaviorClass").textContent=c.name+" // "+c.role;
    q("#eiSeraphNotice").hidden=c.key!=="seraph";
    q("#eiTaxonomyState").textContent=c.key==="seraph"?"표준 분류 // 적용 불가":"공개 분류 // 확인됨";
    setRiskScale(c.key==="seraph"?"측정 불가":c.riskKey);
    root.dispatchEvent(new CustomEvent("eidolon:class-risk",{detail:{key:c.key==="seraph"?"측정 불가":c.riskKey,classKey:c.key,mark:c.mark,name:c.name,risk:c.risk}}));
    focusAnalysis("morphology");
    sync3D();
    dossier?.close();
    if(animate)pulseScan();
  }

  function stepClass(delta){
    classIndex=Math.max(0,Math.min(CLASSES.length-1,classIndex+delta));
    selectClass(CLASSES[classIndex].key);
  }

  function setNest(key){
    const n=NESTS[key];if(!n)return;
    nestButtons.forEach(b=>b.classList.toggle("active",b.dataset.eiNest===key));
    q("#eiNestCode").textContent=n.code;
    q("#eiNestTitle").textContent=n.name;
    q("#eiNestKo").textContent=n.ko;
    q("#eiNestSub").textContent=n.sub;
    q("#eiNestBody").textContent=n.body;
    root.dataset.eiNest=key;
    root.dispatchEvent(new CustomEvent("eidolon:nest-change",{detail:{key}}));
  }

  function setSource(detail){
    const source=q("#eiSource"),body=q("#eiSourceBody");
    if(!detail?.id){
      source.textContent="출처 // 일반 분류 기록";
      body.textContent="공개 분류 기록";
      return;
    }
    source.textContent="출처 // 세계 기록 연결 // "+detail.id;
    body.textContent=(detail.name||detail.ko||"흑색권")+" // 지역 개체 구성 비공개";
    root.classList.add("source-linked");
  }

  const infoButton=document.createElement("button");
  infoButton.className="ei-info-tab";
  infoButton.type="button";
  infoButton.innerHTML="<span>개체</span><b>상세 정보</b><i>+</i>";
  infoButton.setAttribute("aria-label","Open detailed entity information");
  scanner.appendChild(infoButton);
  infoButton.addEventListener("click",()=>showLiveDossier(root.dataset.eiFocus||"morphology"));
  root.querySelector("[data-ei-open-info]")?.addEventListener("click",()=>showLiveDossier(root.dataset.eiFocus||"morphology"));

  classButtons.forEach(b=>b.addEventListener("click",()=>selectClass(b.dataset.eiClassBtn)));
  focusButtons.forEach(b=>b.addEventListener("click",()=>focusAnalysis(b.dataset.eiFocus)));
  nestButtons.forEach(b=>b.addEventListener("click",()=>setNest(b.dataset.eiNest)));

  scanner.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();stepClass(-1)}
    if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();stepClass(1)}
  });
  scanner.addEventListener("pointerdown",e=>{if(e.target.closest?.(".ei-model-stage,.ei-live-dossier,.ei-info-tab,.ei-hotspot,button,a,input,select,textarea")){pointerX=null;return}pointerX=e.clientX});
  scanner.addEventListener("pointerup",e=>{
    if(e.target.closest?.(".ei-live-dossier,.ei-info-tab,.ei-hotspot,button,a,input,select,textarea")){pointerX=null;return}
    if(pointerX===null)return;
    const dx=e.clientX-pointerX;pointerX=null;
    if(Math.abs(dx)>52)stepClass(dx<0?1:-1);
  });

  window.addEventListener("archive:eidolon-context",e=>setSource(e.detail));
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="eidolon"){setTimeout(pulseScan,90);sync3D()}});

  selectClass("brute",{animate:false});
  loadRecords();
  setNest("small");
}
