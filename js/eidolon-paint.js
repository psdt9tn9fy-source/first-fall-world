/* BRUTE experimental vertex painting (tap-to-paint).
   Separate viewer, never saves or mutates the original GLB.
   Initialized only from a user click to protect mobile memory. */
const MAX_PIXEL_RATIO=1.35;
const MAX_UNDO=8;

export function brushWeight(distanceSquared,radiusSquared){
  if(distanceSquared>=radiusSquared)return 0;
  const normalized=Math.sqrt(distanceSquared/radiusSquared);
  const smooth=1-normalized;
  return smooth*smooth*(3-2*smooth);
}

export function createBrutePaint({root,modelUrl,onClose=()=>{}}){
  let stage=null,canvas=null,renderer=null,scene=null,camera=null,group=null,three=null;
  let controls={},meshes=[],ready=false,opening=false,mode="rotate",strokes=[];
  let frame=0,resizer=null,loadingToken=0,activePointer=null;
  let modelSpan=1,paintColor="#d74a36",brushSize=5;
  const query=selector=>stage?.querySelector(selector);
  const setStatus=value=>{const el=query("[data-paint-status]");if(el)el.textContent=value};
  function draw(){
    if(!renderer||!scene||!camera||stage?.hidden)return;
    if(frame)return;
    frame=requestAnimationFrame(()=>{frame=0;if(renderer&&scene&&camera&&!stage.hidden)renderer.render(scene,camera)});
  }
  function ui(){
    const scanner=root.querySelector("#eiScanner");
    if(!scanner)throw new Error("에이돌론 분석 화면을 찾지 못했습니다.");
    if(stage)return;
    stage=document.createElement("section");
    stage.className="ei-paint-stage";stage.hidden=true;
    stage.setAttribute("aria-label","브루트 부분 채색 실험 화면");
    stage.innerHTML=`
      <header class="ei-paint-head"><div><span>BRUTE // EXPERIMENT 01</span><b>부분 채색 시험</b></div>
        <button type="button" data-paint-close aria-label="부분 채색 화면 닫기">닫기 ×</button></header>
      <div class="ei-paint-viewport" data-paint-viewport></div>
      <div class="ei-paint-foot">
        <nav aria-label="브루트 3D 조작 모드">
          <button type="button" data-paint-mode="rotate" aria-pressed="true">↻ 회전</button>
          <button type="button" data-paint-mode="brush" aria-pressed="false">✦ 채색</button>
        </nav>
        <div class="ei-paint-settings">
          <label>색상 <input type="color" data-paint-color value="#d74a36" aria-label="칠할 색상"></label>
          <label>붓 크기 <input type="range" min="2" max="12" step="1" value="5" data-paint-size aria-label="붓 크기"></label>
          <button type="button" data-paint-undo>되돌리기</button>
          <button type="button" data-paint-clear>초기화</button>
        </div>
        <p data-paint-status role="status" aria-live="polite">3D 페인팅을 준비하는 중입니다.</p>
        <small>회전 모드: 드래그 / 채색 모드: 표면 한 번 터치. 원본 파일에는 저장되지 않으며, 닫으면 채색이 사라집니다.</small>
      </div>`;
    scanner.appendChild(stage);
    query("[data-paint-close]").addEventListener("click",close);
    query("[data-paint-color]").addEventListener("input",event=>paintColor=event.target.value);
    query("[data-paint-size]").addEventListener("input",event=>brushSize=Number(event.target.value));
    query("[data-paint-undo]").addEventListener("click",undo);
    query("[data-paint-clear]").addEventListener("click",clear);
    query("[data-paint-mode='rotate']").addEventListener("click",()=>setMode("rotate"));
    query("[data-paint-mode='brush']").addEventListener("click",()=>setMode("brush"));
  }
  function setMode(value){
    mode=value;
    stage?.querySelectorAll("[data-paint-mode]").forEach(button=>
      button.setAttribute("aria-pressed",String(button.dataset.paintMode===value)));
    setStatus(value==="brush"?"채색 모드 · 원하는 표면을 한 번 터치하세요.":"회전 모드 · 드래그해서 원하는 부위를 찾아보세요.");
  }
  function resize(){
    if(!renderer||!camera)return;
    const el=query("[data-paint-viewport]");
    const w=el?.clientWidth||320,h=el?.clientHeight||270;
    camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);draw();
  }
  function pointerDown(event){
    if(!ready||event.button>0||activePointer)return;
    event.preventDefault();
    activePointer={id:event.pointerId,x:event.clientX,y:event.clientY,prevX:event.clientX,prevY:event.clientY,moved:false};
    try{canvas.setPointerCapture(event.pointerId)}catch(error){}
  }
  function pointerMove(event){
    const p=activePointer;
    if(!p||p.id!==event.pointerId)return;
    event.preventDefault();
    const dx=event.clientX-p.prevX,dy=event.clientY-p.prevY;
    if(Math.hypot(event.clientX-p.x,event.clientY-p.y)>6)p.moved=true;
    if(mode==="rotate"){
      group.rotation.y+=dx*.008;
      group.rotation.x=Math.max(-1.1,Math.min(1.1,group.rotation.x+dy*.006));
      draw();
    }
    p.prevX=event.clientX;p.prevY=event.clientY;
  }
  function pointerUp(event){
    const p=activePointer;
    if(!p||p.id!==event.pointerId)return;
    activePointer=null;
    try{canvas.releasePointerCapture(event.pointerId)}catch(error){}
    if(mode==="brush"&&!p.moved)paintAt(event.clientX,event.clientY);
  }
  function initializeMesh(mesh){
    if(!mesh.geometry?.attributes?.position)return;
    // The GLB is loaded into an independent scene. Its geometry can be modified
    // here without affecting model-viewer's separate original scene.
    const position=mesh.geometry.attributes.position;
    const colors=new Float32Array(position.count*3);
    colors.fill(1);
    mesh.geometry.setAttribute("color",new three.Float32BufferAttribute(colors,3));
    if(Array.isArray(mesh.material)){
      mesh.material=mesh.material.map(mat=>{const m=mat.clone();m.vertexColors=true;return m});
    }else{
      mesh.material=mesh.material.clone();
      mesh.material.vertexColors=true;
    }
    mesh.material.needsUpdate=true;
    meshes.push(mesh);
  }
  async function load(token){
    const [THREE,addon]=await Promise.all([
      import("three"),import("three/addons/loaders/GLTFLoader.js")
    ]);
    if(token!==loadingToken)return;
    three=THREE;
    scene=new THREE.Scene();scene.background=new THREE.Color("#08131d");
    camera=new THREE.PerspectiveCamera(43,1,.05,200);
    camera.position.set(3.2,1.9,5.5);camera.lookAt(0,0,0);
    group=new THREE.Group();scene.add(group);
    scene.add(new THREE.HemisphereLight(0xe3efff,0x283039,2.2));
    const light=new THREE.DirectionalLight(0xffffff,2.0);
    light.position.set(3,6,5);scene.add(light);
    const back=new THREE.DirectionalLight(0x87b4ff,1.2);back.position.set(-4,0,-4);scene.add(back);
    const viewport=query("[data-paint-viewport]");
    renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,MAX_PIXEL_RATIO));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    canvas=renderer.domElement;
    canvas.className="ei-paint-canvas";
    canvas.setAttribute("aria-label","브루트 3D 미리보기. 회전 모드에서 드래그하고 채색 모드에서 터치하세요.");
    viewport.appendChild(canvas);
    canvas.addEventListener("pointerdown",pointerDown);
    canvas.addEventListener("pointermove",pointerMove);
    canvas.addEventListener("pointerup",pointerUp);
    canvas.addEventListener("pointercancel",()=>activePointer=null);
    resize();
    setStatus("브루트 모델 로딩 중 · 약 13MB");
    const gltf=await new addon.GLTFLoader().loadAsync(modelUrl);
    if(token!==loadingToken)return;
    gltf.scene.traverse(object=>{if(object.isMesh)initializeMesh(object)});
    if(!meshes.length)throw new Error("채색 가능한 3D 메시가 없습니다.");
    const bbox=new THREE.Box3().setFromObject(gltf.scene);
    const center=bbox.getCenter(new THREE.Vector3());
    const size=bbox.getSize(new THREE.Vector3());
    modelSpan=Math.max(size.x,size.y,size.z,.00001);
    gltf.scene.position.sub(center);
    group.add(gltf.scene);
    group.scale.setScalar(3.1/modelSpan);
    group.rotation.y=.4;
    group.updateMatrixWorld(true);
    controls.raycaster=new THREE.Raycaster();
    controls.pointer=new THREE.Vector2();
    if(typeof ResizeObserver!=="undefined"){
      resizer=new ResizeObserver(resize);resizer.observe(viewport);
    }else window.addEventListener("resize",resize,{passive:true});
    ready=true;
    resize();
    setMode("rotate");
  }
  async function paintAt(x,y){
    if(!ready||!three||!controls.raycaster||opening)return;
    opening=true;setStatus("터치한 표면을 찾는 중…");
    await new Promise(resolve=>requestAnimationFrame(resolve));
    try{
      const rect=canvas.getBoundingClientRect();
      controls.pointer.set(((x-rect.left)/rect.width)*2-1,-((y-rect.top)/rect.height)*2+1);
      group.updateMatrixWorld(true);
      controls.raycaster.setFromCamera(controls.pointer,camera);
      // One tap only: the model has ~720k triangles. Avoid doing this per pointer move.
      const hit=controls.raycaster.intersectObjects(meshes,false)[0];
      if(!hit){setStatus("모델이 아닌 곳을 터치했어. 표면을 다시 눌러봐.");return}
      const mesh=hit.object,geometry=mesh.geometry;
      const positions=geometry.getAttribute("position"),colorAttr=geometry.getAttribute("color");
      if(!positions||!colorAttr)throw new Error("이 형상은 정점 채색을 지원하지 않습니다.");
      const center=mesh.worldToLocal(hit.point.clone());
      const scale=mesh.getWorldScale(new three.Vector3());
      const radius=(3.1*(brushSize/100))/Math.max(scale.x,scale.y,scale.z,0.000001);
      const r2=radius*radius,target=new three.Color(paintColor);
      const edited=[];
      for(let i=0;i<positions.count;i++){
        const dx=positions.getX(i)-center.x,dy=positions.getY(i)-center.y,dz=positions.getZ(i)-center.z;
        const d=dx*dx+dy*dy+dz*dz;
        if(d>=r2)continue;
        const weight=brushWeight(d,r2);
        if(weight<=0)continue;
        const previous=[colorAttr.getX(i),colorAttr.getY(i),colorAttr.getZ(i)];
        colorAttr.setXYZ(i,
          previous[0]+(target.r-previous[0])*weight,
          previous[1]+(target.g-previous[1])*weight,
          previous[2]+(target.b-previous[2])*weight);
        edited.push([i,...previous]);
      }
      if(!edited.length){setStatus("색칠할 정점이 감지되지 않았어. 붓 크기를 키워봐.");return}
      colorAttr.needsUpdate=true;
      strokes.push({mesh,edited});
      if(strokes.length>MAX_UNDO)strokes.shift();
      draw();setStatus("색상 적용 · 정점 "+edited.length.toLocaleString("ko-KR")+"개 · 회전 모드로 돌려서 확인해봐.");
    }catch(error){
      setStatus("채색 실패: "+(error?.message||"잠시 후 다시 시도해 주세요."));
    }finally{opening=false}
  }
  function undo(){
    const action=strokes.pop();if(!action)return setStatus("되돌릴 작업이 없습니다.");
    const colors=action.mesh.geometry.getAttribute("color");
    for(const [index,r,g,b]of action.edited)colors.setXYZ(index,r,g,b);
    colors.needsUpdate=true;draw();setStatus("직전 채색을 되돌렸습니다.");
  }
  function clear(){
    if(!ready)return;
    for(const mesh of meshes){
      const attr=mesh.geometry.getAttribute("color");attr.array.fill(1);attr.needsUpdate=true;
    }
    strokes.length=0;draw();setStatus("부분 채색을 전부 초기화했습니다.");
  }
  function dispose(){
    if(frame)cancelAnimationFrame(frame);frame=0;
    resizer?.disconnect();resizer=null;
    window.removeEventListener("resize",resize);
    if(group){
      group.traverse(item=>{
        if(!item.isMesh)return;
        item.geometry?.dispose();
        const mats=Array.isArray(item.material)?item.material:[item.material];
        mats.forEach(m=>m?.dispose());
      });
    }
    renderer?.dispose();renderer?.forceContextLoss();
    canvas?.remove();canvas=null;
    renderer=null;scene=null;camera=null;group=null;ready=false;
    meshes=[];strokes=[];activePointer=null;controls={};
  }
  async function open(){
    if(opening||!root||root.dataset.eiClass!=="brute")return;
    ui();stage.hidden=false;root.classList.add("ei-paint-active");
    opening=true;const token=++loadingToken;
    try{
      await load(token);
      if(token!==loadingToken)return;
    }catch(error){
      setStatus("페인팅 뷰어를 열 수 없습니다: "+(error?.message||"오류")+" · 닫기 후 다시 시도해 주세요.");
      ready=false;
    }finally{opening=false}
  }
  function close(){
    ++loadingToken;
    if(stage)stage.hidden=true;
    root.classList.remove("ei-paint-active");
    dispose();
    onClose();
  }
  return {open,close,get active(){return !stage?.hidden}};
}
