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
assert(css.includes(".ei-3d-capable"));
assert(model.includes('root.classList.toggle("ei-3d-capable",enabled)'));
assert(entry.includes('./eidolon-data.js?v='));
assert(records.includes("renderRiskMeters(data.meters)"));
assert(records.includes("renderRiskMeters(riskCopy.S.meters)"));
for(const [s,path] of [[index,"./js/main.js?v="],[index,"./css/intro.css?v="],[index,"./css/eidolon-records.css?v="],[main,"./eidolon.js?v="],[entry,"./eidolon-3d.js?v="]])assert(s.includes(path),path);
for(const name of ["intro","eidolon-records"]){const s=read(`css/${name}.css`);assert.equal((s.match(/\{/g)||[]).length,(s.match(/\}/g)||[]).length,name+" braces")}
console.log("PASS: classes, GLBs, SERAPH fallback, risk meters, CSS and entrypoints");
