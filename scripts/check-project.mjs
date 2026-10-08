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
assert(riskModule.includes("renderRiskMeters(riskCopy.S.meters)"));
for(const module of ["profile","behavior","nest","risk"])assert(records.includes(`./eidolon-records-${module}.js?v=`),module+" module missing");
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
console.log("PASS: classes, GLBs, SERAPH fallback, risk meters, CSS and entrypoints");
