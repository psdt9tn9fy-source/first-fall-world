// node scripts/check-project.mjs — dependency-free static tests.
import {readFileSync,existsSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
const root=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=name=>readFileSync(join(root,name),"utf8");
const data=read("js/eidolon-data.js"),model=read("js/eidolon-3d.js");
const entry=read("js/eidolon.js"),records=read("js/eidolon-records.js");
const index=read("index.html"),main=read("js/main.js"),css=read("css/eidolon.css");
const cls=[...data.matchAll(/key:"([a-z]+)"/g)].map(x=>x[1]);
const models=[...model.matchAll(/^\s+(\w+):\{\s*\n\s*url:"\.\/assets\/eidolon\/([^?"]+)\?[^"]+"/gm)];
assert.equal(cls.length,6,"6 classes");assert.equal(models.length,5,"5 GLB models");
for(const [,name,file] of models){assert(cls.includes(name));assert(existsSync(join(root,"assets/eidolon",file)),file)}
assert(!models.some(([,name])=>name==="seraph"));
assert(read("css/eidolon-controls.css").includes(".ei-3d-capable"));
assert(model.includes('root.classList.toggle("ei-3d-capable",enabled)'));
assert(entry.includes('./eidolon-data.js?v='));
assert(records.includes("initRiskRecord"),"Risk controller not connected");
const riskModule=read("js/eidolon-records-risk.js");
assert(riskModule.includes("renderRiskMeters(data.meters)"));
assert(riskModule.includes("renderRiskMeters([0,0,0])"),"Unknown SERAPH meters must not be fabricated as S-tier");
for(const module of ["profile","behavior","nest","risk","seraph"])assert(records.includes(`./eidolon-records-${module}.js?v=`),module+" module missing");
for(const [s,path] of [[index,"./js/main.js?v="],[index,"./css/intro.css?v="],[index,"./css/eidolon-records.css?v="],[main,"./eidolon.js?v="],[entry,"./eidolon-3d.js?v="]])assert(s.includes(path),path);
for(const name of ["intro","eidolon-records"]){const s=read(`css/${name}.css`);assert.equal((s.match(/\{/g)||[]).length,(s.match(/\}/g)||[]).length,name+" braces")}

const cssGroups=[
  {paths:["css/eidolon.css","css/eidolon-3d.css","css/eidolon-dossier.css","css/eidolon-analysis.css","css/eidolon-controls.css"],expected:"bd1f8ba0"},
  {paths:["css/eidolon-records.css","css/eidolon-records-behavior.css","css/eidolon-records-nest.css","css/eidolon-records-engagement.css","css/eidolon-records-profile.css","css/eidolon-records-readability.css"],expected:"ad902409"}
];
function cssChecksum(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,"0")}
const cssHrefOrder=[...index.matchAll(/<link rel="stylesheet" href="\.\/([^?"]+)\?v=[^"]+">/g)].map(x=>x[1]);
for(const group of cssGroups){
  const combined=group.paths.map(read).join("");
  assert.equal(cssChecksum(combined),group.expected,"CSS cascade snapshot changed");
  let lastIndex=-1;
  for(const path of group.paths){
    const where=cssHrefOrder.indexOf(path);
    assert(where>lastIndex,"CSS module order broken: "+path);
    lastIndex=where;
  }
}

/* WORLD ORDER regression guards. Shared flag URLs and map projection are source-of-truth. */
const nationsJs=read("js/nations.js"),mobileJs=read("js/world-mobile.js"),worldJs=read("js/world.js");
const nationData=read("js/nations-data.js"),flagUtils=read("js/flag-utils.js"),mapGeometry=read("js/world-geometry.js");
const mobileData=read("js/world-mobile-data.js");
assert(nationsJs.includes('./nations-data.js?v='),"Nation state data import missing");
assert(nationsJs.includes('./flag-utils.js?v='),"Nation flags must use shared helper");
assert(mobileJs.includes('./flag-utils.js?v='),"Mobile flags must use shared helper");
assert(mobileJs.includes('./world-mobile-data.js?v='),"Mobile world configuration import missing");
assert(worldJs.includes('./world-geometry.js?v='),"World map projection import missing");
assert(!nationsJs.includes("const STATE_RECORDS="),"State records are still embedded in UI");
assert(!mobileJs.includes("function flagUrl("),"Mobile flags are duplicated");
assert(!worldJs.includes("function geomPath("),"Projection implementation duplicated");
assert(nationData.includes('export const STATE_RECORDS=')&&nationData.includes('export const HISTORY_TERMS='));
assert(mobileData.includes('export const THEATER_ART=')&&mobileData.includes('export const ERA_WINDOWS='));
assert(mapGeometry.includes("export function centroid("));
assert(flagUtils.includes('export function flagUrl('));
for(const [key,extension] of Object.entries({afr:"png",rok:"jpg",afu:"jpg"})){
  assert(existsSync(join(root,`assets/flags-hq/${key}-2134.${extension}`)),"Missing flag: "+key);
}

/* Nation/world CSS is split into feature stylesheets without changing cascade order. */
const worldCssGroups=[{"original":"css/nations.css","parts":["css/nations.css","css/nations-dossier.css","css/nations-readability.css"],"hash":"79bfbc2d"},{"original":"css/nations-mobile.css","parts":["css/nations-mobile.css","css/nations-mobile-dossier.css","css/nations-mobile-readability.css"],"hash":"3ba5ce64"},{"original":"css/world.css","parts":["css/world.css","css/world-map.css","css/world-panel.css"],"hash":"4970fdbe"},{"original":"css/world-mobile.css","parts":["css/world-mobile.css","css/world-mobile-readability.css"],"hash":"732db4a4"}];
for(const group of worldCssGroups){
  const combined=group.parts.map(read).join("");
  assert.equal(cssChecksum(combined),group.hash,"Original CSS changed: "+group.original);
  let prev=-1;
  for(const path of group.parts){
    const index=cssHrefOrder.indexOf(path);
    assert(index>prev,"Nation/world cascade order broken: "+path);
    prev=index;
  }
}

/* Verify local JavaScript imports and linked stylesheets exist at deploy paths. */
import {readdirSync} from "node:fs";
for(const filename of readdirSync(join(root,"js")).filter(name=>name.endsWith(".js"))){
  const source=read("js/"+filename);
  for(const match of source.matchAll(/(?:from\s*|import\(\s*)["'](\.[^"']+)["']/g)){
    const imported=match[1].split("?")[0];
    assert(existsSync(join(root,"js",imported)),`Missing local import in ${filename}: ${imported}`);
  }
}
for(const rel of cssHrefOrder)assert(existsSync(join(root,rel)),"Missing CSS link: "+rel);

/* Deterministic smoke tests for the extracted browser-independent helpers. */
const {flagUrl:makeFlagUrl}=await import("../js/flag-utils.js");
const {project:toWorldXY,geomPath:makeGeometryPath,centroid:findCentroid}=await import("../js/world-geometry.js");
assert.equal(makeFlagUrl("rok"),"./assets/flags-hq/rok-2134.jpg");
assert.equal(makeFlagUrl("afr"),"./assets/flags-hq/afr-2134.png");
assert.deepEqual(toWorldXY(0,0),[500,250]);
assert.deepEqual(toWorldXY(-180,90),[0,0]);
assert(makeGeometryPath({type:"Polygon",coordinates:[[[0,0],[10,0],[0,10]]]}).startsWith("M"));
assert.equal(findCentroid({geometry:{type:"Polygon",coordinates:[[[0,0],[10,0],[0,10]]]}}).length,2);

/* SERAPH observation: protect unknown readings and reference image. */
const seraphController=read("js/eidolon-seraph.js"),seraphCSS=read("css/eidolon-seraph.css");
const profileController=read("js/eidolon-records-profile.js"),dossierController=read("js/eidolon-dossier.js");
assert(seraphController.includes("HUMAN-LIKE // SIGHTING ONLY"),"SERAPH sighting visual missing");
assert(seraphController.includes("INTERNAL STRUCTURE // NO DATA"),"SERAPH interior wrongly assumed");
assert(seraphController.includes("NETWORK // UNVERIFIED"),"SERAPH network wrongly assumed");
assert(entry.includes('./eidolon-seraph.js?v='),"SERAPH module missing");
assert(index.includes('data-ei-seraph-visual'),"SERAPH stage missing");
assert(index.includes('seraph-silhouette.webp'),"SERAPH image not referenced");
assert(existsSync(join(root,"assets/eidolon/seraph-silhouette.webp")),"SERAPH image not found");
assert(index.includes('./css/eidolon-seraph.css?v='),"SERAPH CSS not linked");
assert(seraphCSS.includes(".seraph-mode"),"SERAPH CSS must be scoped");
assert(seraphCSS.includes("bottom:168px!important"),"SERAPH desktop controls must not overlap telemetry");
assert(seraphCSS.includes("bottom:162px!important"),"SERAPH mobile controls must not overlap telemetry");
assert(seraphCSS.includes("background:linear-gradient(105deg,rgba(4,5,8,.98)"),"SERAPH telemetry contrast surface missing");
assert(seraphCSS.includes("eiSeraphSignalBurst"),"SERAPH signal interference animation missing");
assert(seraphCSS.includes("prefers-reduced-motion:reduce"),"SERAPH accessible motion fallback missing");
assert(seraphController.includes('root.classList.add("ei-seraph-boot")'),"SERAPH enter animation not triggered");
assert(seraphController.includes("if(!wasActive){pulse();boot()}"),"SERAPH boot should only run when switching in");
assert(seraphController.includes('root.classList.remove("ei-seraph-boot")'),"SERAPH boot lifecycle not cleaned up");
assert(profileController.includes("syncEvidenceRows(seraph)"),"SERAPH evidence records wrongly verified");
assert(dossierController.includes('record.unverified?"RECORD INCOMPLETE"'),"SERAPH detailed record verification incorrect");
const seraphRecords=read("js/eidolon-records-seraph.js");
const seraphRecordCSS=read("css/eidolon-records-seraph.css");
assert(records.includes("initSeraphRecords(root"),"SERAPH record controller is not initialized");
assert(records.includes("seraph.setClass(event.detail?.classKey)"),"SERAPH record lifecycle disconnected");
assert(records.includes("seraph.setTab(key)"),"SERAPH tab lifecycle disconnected");
for(const id of ["profile","behavior","nest","engagement"])
  assert(index.includes('data-seraph-panel="'+id+'"'),"SERAPH record tab missing: "+id);
for(const item of ["form","contact","combat"])
  assert(seraphRecords.includes(item+':{'),"SERAPH evidence source missing: "+item);
assert(index.includes('data-ei-seraph-evidence-detail'),"Evidence details missing");
assert(index.includes('./css/eidolon-records-seraph.css?v='),"SERAPH lower dossier CSS not included");
assert(seraphRecordCSS.includes('.ei-panel[data-ei-panel="behavior"] > :not(.ei-seraph-record)'),"Standard behavior view not isolated");
assert(seraphRecordCSS.includes('.ei-panel[data-ei-panel="nest"] > :not(.ei-seraph-record)'),"Standard nest view not isolated");
assert(seraphRecordCSS.includes('.ei-panel[data-ei-panel="engagement"] > :not(.ei-seraph-record)'),"Standard risk view not isolated");
assert(seraphRecordCSS.includes('prefers-reduced-motion:reduce'),"SERAPH records need motion fallback");
assert(profileController.includes('badge.textContent=seraph?"미검증"'),"SERAPH summary incorrectly marked verified");
assert(read("js/eidolon-records-behavior.js").includes('root.dataset.eiClass==="seraph"'),"SERAPH must bypass ordinary adaptation");
assert(read("js/eidolon-records-nest.js").includes('root.dataset.eiClass==="seraph"'),"SERAPH must bypass ordinary nest scan");

/* SERAPH behavior controls: switching classes restores ordinary navigation. */
const {initSeraphRecords}=await import("../js/eidolon-records-seraph.js");
function fakeNode(value=""){
  const classes=new Set();
  const handlers=new Map();
  return {
    textContent:value, dataset:{},
    classList:{
      add(name){classes.add(name)},remove(name){classes.delete(name)},
      toggle(name,on){if(on)classes.add(name);else classes.delete(name)},
      contains(name){return classes.has(name)}
    },
    addEventListener(type,handler){handlers.set(type,handler)},
    setAttribute(name,value){this.attributes??={};this.attributes[name]=value},
    getAttribute(name){return this.attributes?.[name]??null},
    click(){handlers.get("click")?.()},
    get offsetWidth(){return 1}
  };
}
const evidenceButtons=["form","contact","combat"].map(key=>{
  const node=fakeNode();node.dataset.eiSeraphEvidence=key;return node;
});
const tabs=["profile","behavior","nest","engagement"].map(key=>{
  const node=fakeNode("ORIGINAL "+key);node.dataset.eiTabBtn=key;return node;
});
const header=fakeNode("4개 항목 // 공개"),detail=fakeNode();
const fields=Object.fromEntries(
 ["code","state","title","body"].map(key=>[key,fakeNode()])
);
const mockRoot={
  dataset:{eiClass:"brute",eiTab:"behavior"},
  querySelector(selector){
    if(selector===".ei-record-console > header em")return header;
    if(selector==="[data-ei-seraph-evidence-detail]")return detail;
    if(selector==="[data-ei-seraph-evidence].active")return evidenceButtons.find(n=>n.classList.contains("active"));
    return Object.entries(fields).find(([key])=>selector===`[data-ei-seraph-evidence-${key}]`)?.[1]||null;
  },
  querySelectorAll(selector){
    if(selector==="[data-ei-tab-btn]")return tabs;
    if(selector==="[data-ei-seraph-evidence]")return evidenceButtons;
    return [];
  }
};
const seraphTest=initSeraphRecords(mockRoot,{reduced:true});
seraphTest.setClass("seraph");
assert.equal(tabs[1].textContent,"02 // 목격 기록");
assert.equal(header.textContent,"규격외 // 단편 기록");
evidenceButtons[1].click();
assert.equal(fields.title.textContent,"의사소통 여부 미확인");
assert.equal(evidenceButtons[1].getAttribute("aria-pressed"),"true");
seraphTest.setClass("hunter");
assert.equal(tabs[1].textContent,"ORIGINAL behavior");
assert.equal(header.textContent,"4개 항목 // 공개");
seraphTest.destroy();
/* Small N-01 recon preserves the standard medium/grand topology and SERAPH archive. */
const reconJS=read("js/eidolon-nest-recon.js");
const reconCSS=read("css/eidolon-nest-recon.css");
assert(index.includes("data-ei-nest-recon"),"N-01 model stage absent");
assert(index.includes('data-ei-nest-file'),"N-01 local GLB preview absent");
assert(index.includes('./css/eidolon-nest-recon.css?v='),"N-01 CSS link absent");
assert(read("js/eidolon-records-nest.js").includes("initNestRecon(root"),"N-01 JS lifecycle disconnected");
assert(records.includes("nest.setActive(true)"),"Nest tab activation disconnected");
assert(reconJS.includes('./assets/nest/small.glb?v='),"N-01 production GLB URL absent");
assert(reconJS.includes('URL.createObjectURL(file)'),"N-01 local preview must support binary uploads");
assert(reconJS.includes("prefers-reduced-motion")===false,"Motion fallback centralized in recon CSS");
assert(reconCSS.includes(':not(.seraph-mode)'),"N-01 must not override SERAPH");
assert(reconCSS.includes('data-ei-nest="small"'),"N-01 CSS must not override other nest scales");
// Production model is optional until user commits small-nest.glb; missing file must show local preview UI.
console.log("PASS: classes, GLBs, SERAPH fallback, risk meters, N-01 recon, CSS and entrypoints");
