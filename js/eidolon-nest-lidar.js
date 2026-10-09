/* N-01 genuine LIDAR sampling: sparse points and mesh triangle segments from the uploaded GLB. No second 3D renderer. */
const MAX_POINTS=3300, MAX_TRIANGLES=1550;
const GLB_MAGIC=0x46546c67, JSON_CHUNK=0x4e4f534a, BIN_CHUNK=0x004e4942;
const componentBytes={5121:1,5123:2,5125:4};
function readIndex(view,at,type){
  if(type===5125)return view.getUint32(at,true);
  if(type===5123)return view.getUint16(at,true);
  if(type===5121)return view.getUint8(at);
  throw new Error("Unsupported triangle index component "+type);
}
/** Reads a sparse, deterministic representation without retaining the full 250k-vertex mesh. */
export function extractReconSamples(buffer){
  const dv=new DataView(buffer);
  if(dv.byteLength<32||dv.getUint32(0,true)!==GLB_MAGIC||dv.getUint32(4,true)!==2)
    throw new Error("Invalid GLB");
  const declared=dv.getUint32(8,true);
  const jsonSize=dv.getUint32(12,true);
  if(declared>dv.byteLength||dv.getUint32(16,true)!==JSON_CHUNK||20+jsonSize+8>declared)throw new Error("GLB header corrupted");
  const doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonSize)));
  const binaryAt=20+jsonSize, binarySize=dv.getUint32(binaryAt,true);
  if(dv.getUint32(binaryAt+4,true)!==BIN_CHUNK||binaryAt+8+binarySize>declared)throw new Error("Missing embedded mesh data");
  const dataStart=binaryAt+8;
  const primitive=doc.meshes?.[0]?.primitives?.find(p=>p.attributes?.POSITION!==undefined&&p.indices!==undefined&&(!p.mode||p.mode===4));
  if(!primitive)throw new Error("No triangle mesh");
  const pos=doc.accessors[primitive.attributes.POSITION],idx=doc.accessors[primitive.indices];
  if(!pos||!idx||pos.componentType!==5126||pos.type!=="VEC3"||idx.type!=="SCALAR"||!componentBytes[idx.componentType])
    throw new Error("Incompatible mesh accessors");
  const pv=doc.bufferViews[pos.bufferView],iv=doc.bufferViews[idx.bufferView];
  if(!pv||!iv||pv.buffer!==0||iv.buffer!==0)throw new Error("Unsupported external buffer");
  const posStart=dataStart+(pv.byteOffset||0)+(pos.byteOffset||0);
  const indexStart=dataStart+(iv.byteOffset||0)+(idx.byteOffset||0);
  const stride=pv.byteStride||12, indexStride=componentBytes[idx.componentType];
  if(stride<12||posStart<0||indexStart<0||posStart+(pos.count-1)*stride+12>dv.byteLength||
     indexStart+(idx.count-1)*indexStride+indexStride>dv.byteLength)throw new Error("Mesh data exceeds file");
  const min=pos.min||[-1,-1,-1],max=pos.max||[1,1,1];
  const center=min.map((v,i)=>(v+max[i])/2);
  const points=[],triangles=[];
  const getPos=(vertex)=>{
    if(vertex>=pos.count)throw new Error("Triangle references missing vertex");
    const i=posStart+vertex*stride;
    return [dv.getFloat32(i,true),dv.getFloat32(i+4,true),dv.getFloat32(i+8,true)];
  };
  const pointStep=Math.max(1,Math.ceil(pos.count/MAX_POINTS));
  for(let i=0;i<pos.count;i+=pointStep)points.push(getPos(i));
  const triangleCount=Math.floor(idx.count/3);
  const triangleStep=Math.max(1,Math.ceil(triangleCount/MAX_TRIANGLES));
  for(let i=0;i<triangleCount;i+=triangleStep){
    const at=indexStart+i*3*indexStride;
    const a=readIndex(dv,at,idx.componentType),b=readIndex(dv,at+indexStride,idx.componentType),c=readIndex(dv,at+2*indexStride,idx.componentType);
    if(a===b||a===c||b===c)continue;
    triangles.push([getPos(a),getPos(b),getPos(c)]);
  }
  return {points,triangles,center,dimensions:max.map((v,i)=>v-min[i])};
}
/** Perspective projection using model-viewer's spherical camera orbit (radians + metres). */
export function projectNestPoint(point,orbit,target,width,height,fovDeg=45){
  const {theta,phi,radius}=orbit;
  if(![theta,phi,radius,width,height,fovDeg].every(Number.isFinite)||radius<=0)return null;
  const st=Math.sin(theta),ct=Math.cos(theta),sp=Math.sin(phi),cp=Math.cos(phi);
  const vx=point[0]-target[0],vy=point[1]-target[1],vz=point[2]-target[2];
  const right=ct*vx-st*vz, up=-cp*st*vx+sp*vy-cp*ct*vz;
  const depth=radius-(st*sp*vx+cp*vy+ct*sp*vz);
  if(depth<=0.01)return null;
  const focal=height/(2*Math.tan(fovDeg*Math.PI/360));
  return [width/2+right*focal/depth,height/2-up*focal/depth,depth];
}
export function initNestLidar(stage,viewer,{signal,reduced=false}={}){
  const canvas=stage.querySelector("[data-ei-nest-lidar]");
  if(!canvas||!viewer)return {load(){},setActive(){},setMode(){},setPhase(){},destroy(){}};
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx)return {load(){},setActive(){},setMode(){},setPhase(){},destroy(){}};
  let geometry=null,active=false,mode="tactical",phase="link",disposed=false;
  let frameId=0,lastPaint=0;
  let fetchedUrl="",loadId=0,fetcher=null,resizeObserver=null;
  // Render in lockstep with frame updates. Touch must never hide the point cloud.
  function shouldDraw(){
    return active&&!!geometry&&(mode==="lidar"||phase==="terrain"||phase==="wire");
  }
  function tick(time){
    frameId=0;
    if(disposed)return;
    if(shouldDraw()&&document.visibilityState!=="hidden"){
      // Cap re-projection to ~40 fps so the model remains responsive on mobile.
      if(time-lastPaint>=25){lastPaint=time;draw()}
      frameId=requestAnimationFrame(tick);
    }else draw();
  }
  function requestDraw(){
    if(!frameId&&!disposed)frameId=requestAnimationFrame(tick);
  }
  function stopLoop(){
    if(frameId)cancelAnimationFrame(frameId);
    frameId=0;
  }
  function onCameraChange(){requestDraw()}
  function onVisibilityChange(){
    if(document.visibilityState==="hidden")stopLoop();
    else requestDraw();
  }
  function draw(){
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h)return;
    const ratio=Math.min(window.devicePixelRatio||1,1.5);
    if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){
      canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,w,h);
    const show=shouldDraw();stage.classList.toggle("lidar-visible",!!show);
    if(!show)return;
    const orbit=viewer.getCameraOrbit?.();
    const t=viewer.getCameraTarget?.();
    if(!orbit||!t)return;
    const target=[t.x,t.y,t.z];
    const fov=viewer.getFieldOfView?.()||45;
    const project=p=>projectNestPoint(p,orbit,target,w,h,fov);
    const progress=phase==="link"?.04:phase==="terrain"?.35:phase==="wire"?.8:1;
    const dotCount=Math.round(geometry.points.length*progress);
    ctx.save();ctx.globalCompositeOperation="screen";
    ctx.fillStyle=mode==="lidar"?"rgba(147,236,255,.87)":"rgba(118,210,236,.75)";
    for(let i=0;i<dotCount;i++){
      const p=project(geometry.points[i]);if(!p||p[0]<0||p[0]>w||p[1]<0||p[1]>h)continue;
      ctx.fillRect(p[0],p[1],i%11===0?2:1,i%11===0?2:1);
    }
    if(phase==="wire"||phase==="acquire"||mode==="lidar"){
      const segments=Math.round(geometry.triangles.length*(phase==="wire"&&mode!=="lidar"?.72:1));
      ctx.lineWidth=.65;ctx.strokeStyle=mode==="lidar"?"rgba(146,229,255,.38)":"rgba(135,208,236,.31)";
      ctx.beginPath();
      for(let i=0;i<segments;i++){
        const q=geometry.triangles[i].map(project);
        if(q.some(p=>!p))continue;
        ctx.moveTo(q[0][0],q[0][1]);ctx.lineTo(q[1][0],q[1][1]);
        ctx.lineTo(q[2][0],q[2][1]);ctx.lineTo(q[0][0],q[0][1]);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  async function load(url){
    if(disposed||!url||url===fetchedUrl)return;
    fetchedUrl=url;
    const token=++loadId;
    fetcher?.abort();fetcher=new AbortController();
    try{
      const response=await fetch(url,{signal:fetcher.signal,cache:"force-cache"});
      if(!response.ok)throw new Error("Asset load failed");
      const samples=extractReconSamples(await response.arrayBuffer());
      if(disposed||token!==loadId)return;
      geometry=samples;stage.classList.add("lidar-ready");requestDraw();
    }catch(e){
      if(disposed||token!==loadId||e.name==="AbortError")return;
      geometry=null;stage.classList.remove("lidar-ready","lidar-visible");
      console.warn("LIDAR surface extraction unavailable; retaining textured model",e);
    }
  }
  viewer.addEventListener("camera-change",onCameraChange,{signal});
  document.addEventListener("visibilitychange",onVisibilityChange,{signal});
  if(typeof ResizeObserver!=="undefined"){
    resizeObserver=new ResizeObserver(requestDraw);resizeObserver.observe(canvas);
  }
  return {
    load,
    setActive(value){active=!!value;requestDraw()},
    setMode(value){mode=value;requestDraw()},
    setPhase(value){phase=value;requestDraw()},
    destroy(){
      disposed=true;loadId++;fetcher?.abort();resizeObserver?.disconnect();stopLoop();
      geometry=null;stage.classList.remove("lidar-ready","lidar-visible");
      canvas.width=0;canvas.height=0;
    }
  };
}
