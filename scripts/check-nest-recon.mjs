// Exercise the shared recon lifecycle without downloading the browser library.
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
for(const name of ['small','medium']){
  const binary=readFileSync(new URL(`../assets/nest/${name}.glb`,import.meta.url));
  assert.equal(binary.readUInt32LE(0),0x46546c67,`${name}: GLB magic`);
  assert.equal(binary.readUInt32LE(4),2,`${name}: glTF version`);
  assert.equal(binary.readUInt32LE(8),binary.length,`${name}: complete binary`);
  const doc=JSON.parse(binary.subarray(20,20+binary.readUInt32LE(12)).toString());
  assert(doc.meshes?.length&&doc.scenes?.length,`${name}: model geometry`);
}
class Element {
  updates=[];jumped=false;
  requestUpdate(property){this.updates.push(property)}
  jumpCameraToGoal(){this.jumped=true}
  dataset={};style={};textContent='';hidden=false;listeners=new Map();classes=new Set();
  classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),contains:x=>this.classes.has(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};
  addEventListener(name,fn){this.listeners.set(name,fn)}
  setAttribute(name,value){this[name]=value}
  removeAttribute(name){this[name]=''}
  async emit(name){await this.listeners.get(name)?.()}
}
const source=readFileSync(new URL('../js/eidolon-nest-recon.js',import.meta.url),'utf8').replace(/^import .*;\n/m,'').replace('export function','function');
function fixture(reduced=false){
  const elements=new Map();
  const stage=new Element(),root=new Element(),document=new Element();
  document.hidden=false;root.dataset.eiClass='brute';
  root.querySelector=()=>stage;
  stage.querySelector=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s)};
  const modes=['tactical','lidar','thermal'].map(mode=>{const e=new Element();e.dataset.eiNestMode=mode;return e});
  stage.querySelectorAll=()=>modes;
  const pending=new Map();let id=0,lidarLoads=0,lidarActive=false;
  const lidar={setActive:on=>lidarActive=on,setMode(){},setPhase(){},async load(){lidarLoads++},destroy(){}};
  const init=runInNewContext(source+'\ninitNestRecon',{
    initNestLidar:()=>lidar,document,customElements:{get:()=>true},
    setTimeout:fn=>{pending.set(++id,fn);return id},clearTimeout:id=>pending.delete(id),URL
  });
  const controller=init(root,{reduced}),viewer=elements.get('[data-ei-nest-viewer]');
  const flush=async()=>{await Promise.resolve();await Promise.resolve()};
  const finish=()=>{for(const fn of [...pending.values()])fn();pending.clear()};
  return {controller,viewer,stage,root,document,modes,elements,flush,finish,get lidarLoads(){return lidarLoads},get lidarActive(){return lidarActive}};
}
const f=fixture();
assert(!f.viewer.src,'Model must be lazy loaded');
f.controller.setLevel('medium');f.controller.setActive(true);await f.flush();
assert.match(f.viewer.src,/medium\.glb/);
await f.viewer.emit('load');f.finish();
assert.equal(f.lidarLoads,0,'N-02 must not parse a point cloud');assert(!f.lidarActive);
assert(f.stage.classList.contains('scanned'));assert(f.viewer.autoRotate);
assert(f.modes[1].hidden);assert.equal(f.elements.get('[data-ei-nest-recon-title]').textContent,'ORBITAL RECON // N-02');
await f.modes[1].emit('click');assert.equal(f.stage.dataset.mode,'tactical');
await f.modes[2].emit('click');assert.equal(f.stage.dataset.mode,'thermal');
f.viewer.cameraOrbit='changed';await f.elements.get('[data-ei-nest-reset]').emit('click');assert.equal(f.viewer.cameraOrbit,'35deg 65deg 135%');
assert.deepEqual(f.viewer.updates,['cameraOrbit','cameraTarget','fieldOfView']);assert(f.viewer.jumped);assert.equal(f.viewer.cameraTarget,'auto auto auto');
f.controller.setActive(false);assert(!f.viewer.autoRotate);assert(!f.lidarActive);
f.controller.setActive(true);assert(f.viewer.autoRotate);
f.document.hidden=true;await f.document.emit('visibilitychange');assert(!f.viewer.autoRotate);
f.document.hidden=false;await f.document.emit('visibilitychange');assert(f.viewer.autoRotate);
f.controller.setLevel('small');await f.flush();assert.match(f.viewer.src,/small\.glb/);
await f.viewer.emit('load');f.finish();assert.equal(f.lidarLoads,1);assert(f.lidarActive);assert(!f.modes[1].hidden);
await f.modes[1].emit('click');assert.equal(f.stage.dataset.mode,'lidar');assert(!f.viewer.autoRotate);
f.controller.setLevel('medium');f.controller.setLevel('small');f.controller.setLevel('medium');await f.flush();
assert.match(f.viewer.src,/medium\.glb/);await f.viewer.emit('load');f.finish();assert.equal(f.lidarLoads,1);
f.controller.setLevel('grand');await f.flush();assert(!f.viewer.src);assert(!f.lidarActive);assert(!f.viewer.autoRotate);
f.controller.setLevel('medium');await f.flush();await f.viewer.emit('error');assert(f.stage.classList.contains('missing'));
f.controller.replay();await f.flush();await f.viewer.emit('load');f.finish();assert(f.stage.classList.contains('loaded'));
f.root.dataset.eiClass='seraph';f.controller.setActive(false);assert(!f.viewer.autoRotate);assert(!f.lidarActive);
f.controller.destroy();
const r=fixture(true);r.controller.setLevel('medium');r.controller.setActive(true);await r.flush();await r.viewer.emit('load');
assert(!r.viewer.autoRotate);assert(r.stage.classList.contains('scanned'));assert.equal(r.elements.get('[data-ei-nest-percent]').textContent,'100%');r.controller.destroy();
console.log('PASS: N-02 model, modes, lazy loading, rapid switching, N-01 LIDAR isolation, N-03, SERAPH, visibility, retry and reduced motion');
