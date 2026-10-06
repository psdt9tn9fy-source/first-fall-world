const SCENES=["current","war","safe","contested","lost","black","duration","survived"];
const MODE={current:0,war:1,safe:2,contested:3,lost:4,black:5,duration:6,survived:7};

export function initWorld(){
  const view=document.querySelector('.view[data-view="world"]');
  const intro=document.querySelector("#intro");
  const experience=document.querySelector("#worldExperience");
  const stage=document.querySelector("#worldStage");
  const canvas=document.querySelector("#worldField");
  const steps=[...document.querySelectorAll("[data-world-scene]")];
  const sceneIndex=document.querySelector("#worldSceneIndex");
  const signal=document.querySelector("#worldSignal");
  const progress=document.querySelector("#worldProgressBar");
  if(!view||!experience||!stage||!canvas)return;

  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=matchMedia("(pointer: coarse)").matches;
  let current="current",mode=0,running=false,raf=0,gl=null,program=null;
  let t0=performance.now(),lastFrame=0,lastScroll=scrollY,velocity=0,targetVelocity=0;
  const pointer={x:.5,y:.5,tx:.5,ty:.5};
  const uniforms={};

  function setScene(name){
    if(!SCENES.includes(name)||name===current)return;
    current=name;
    mode=MODE[name];
    experience.dataset.scene=name;
    const n=SCENES.indexOf(name)+1;
    sceneIndex.textContent=String(n).padStart(2,"0")+" / 08";
    progress.style.width=(n/SCENES.length*100)+"%";
    signal.textContent=name==="black"?"SIGNAL // DEGRADED":name==="lost"?"SIGNAL // PARTIAL":"SIGNAL // STABLE";
  }

  function compile(type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||"shader");
    return shader;
  }

  function initGL(){
    if(reduced)return false;
    gl=canvas.getContext("webgl2",{alpha:false,antialias:false,powerPreference:"low-power"})||
       canvas.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
    if(!gl)return false;
    const vs=[
      "attribute vec2 p;",
      "void main(){gl_Position=vec4(p,0.0,1.0);}"
    ].join("\n");
    const fs=[
      "precision mediump float;",
      "uniform vec2 r;",
      "uniform vec2 m;",
      "uniform float t;",
      "uniform float mode;",
      "uniform float vel;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float pulse(vec2 uv,vec2 c,float ph){float d=length(uv-c);float ring=smoothstep(.012,.002,abs(d-mod(t*.025+ph,.18)));return ring*smoothstep(.24,0.0,d);}",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/r.xy;",
      "vec2 q=uv-.5;q.x*=r.x/r.y;",
      "float v=min(abs(vel),1.0);",
      "uv.x+=sin(uv.y*24.0+t*2.0)*v*.004;",
      "uv.y+=sin(uv.x*19.0-t*1.7)*v*.002;",
      "vec2 g=fract(uv*vec2(34.0,20.0));",
      "float grid=(1.0-smoothstep(0.0,.035,min(g.x,1.0-g.x)))+(1.0-smoothstep(0.0,.055,min(g.y,1.0-g.y)));",
      "grid*=.055;",
      "float scan=pow(max(0.0,1.0-abs(fract(uv.y*2.0-t*.07)-.5)*28.0),3.0);",
      "float n=(hash(floor(gl_FragCoord.xy/3.0)+floor(t*6.0))-.5)*.025;",
      "float p=0.0;",
      "p+=pulse(uv,vec2(.72,.64),.01);p+=pulse(uv,vec2(.52,.69),.07);",
      "p+=pulse(uv,vec2(.22,.64),.12);p+=pulse(uv,vec2(.67,.50),.16);p+=pulse(uv,vec2(.82,.30),.21);",
      "float pointerGlow=smoothstep(.22,0.0,distance(uv,m))*.035;",
      "float danger=smoothstep(3.0,5.0,mode);",
      "float calm=1.0-danger*.48;",
      "vec3 col=vec3(.018,.026,.029);",
      "col+=vec3(.30,.48,.53)*(grid*calm+scan*.035+p*.16+pointerGlow);",
      "col+=vec3(.08,.095,.10)*n;",
      "col*=1.0-smoothstep(.55,.9,length(q))*.52;",
      "gl_FragColor=vec4(col,1.0);",
      "}"
    ].join("\n");
    try{
      program=gl.createProgram();
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));
      gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||"link");
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      const loc=gl.getAttribLocation(program,"p");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      uniforms.r=gl.getUniformLocation(program,"r");uniforms.m=gl.getUniformLocation(program,"m");
      uniforms.t=gl.getUniformLocation(program,"t");uniforms.mode=gl.getUniformLocation(program,"mode");uniforms.vel=gl.getUniformLocation(program,"vel");
      return true;
    }catch(e){
      gl=null;document.documentElement.classList.add("no-webgl");return false;
    }
  }

  function resize(){
    if(!gl)return;
    const dpr=coarse?1:Math.min(devicePixelRatio||1,1.5);
    const w=Math.max(1,Math.floor(canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(canvas.clientHeight*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
  }

  function draw(now){
    if(!running||!gl)return;
    if(coarse&&now-lastFrame<32){raf=requestAnimationFrame(draw);return}
    lastFrame=now;resize();
    pointer.x+=(pointer.tx-pointer.x)*.06;pointer.y+=(pointer.ty-pointer.y)*.06;
    velocity+=(targetVelocity-velocity)*.08;targetVelocity*=.9;
    gl.useProgram(program);
    gl.uniform2f(uniforms.r,canvas.width,canvas.height);
    gl.uniform2f(uniforms.m,pointer.x,1-pointer.y);
    gl.uniform1f(uniforms.t,(now-t0)/1000);
    gl.uniform1f(uniforms.mode,mode);
    gl.uniform1f(uniforms.vel,velocity);
    gl.drawArrays(gl.TRIANGLES,0,3);
    raf=requestAnimationFrame(draw);
  }

  function shouldRun(){
    return view.classList.contains("active")&&intro.classList.contains("hide")&&!document.hidden&&!reduced;
  }
  function syncRunning(){
    const next=shouldRun();
    if(next===running)return;
    running=next;
    if(running&&gl){t0=performance.now();raf=requestAnimationFrame(draw)}
    else cancelAnimationFrame(raf);
  }

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)setScene(entry.target.dataset.worldScene)});
  },{root:null,rootMargin:"-43% 0px -43% 0px",threshold:0});
  steps.forEach(step=>observer.observe(step));

  stage.addEventListener("pointermove",e=>{
    const rect=stage.getBoundingClientRect();
    pointer.tx=(e.clientX-rect.left)/rect.width;pointer.ty=(e.clientY-rect.top)/rect.height;
  },{passive:true});
  stage.addEventListener("pointerleave",()=>{pointer.tx=.5;pointer.ty=.5},{passive:true});

  addEventListener("scroll",()=>{
    const y=scrollY,dy=y-lastScroll;lastScroll=y;
    targetVelocity=Math.max(-1,Math.min(1,dy/70));
  },{passive:true});

  document.querySelectorAll("[data-open-record]").forEach(button=>{
    button.addEventListener("click",()=>{
      document.querySelector('.tab[data-tab="'+button.dataset.openRecord+'"]')?.click();
    });
  });

  const introObserver=new MutationObserver(()=>{
    if(intro.classList.contains("hide")&&!stage.classList.contains("booted")){
      stage.classList.add("booted");
    }
    syncRunning();
  });
  introObserver.observe(intro,{attributes:true,attributeFilter:["class"]});
  new MutationObserver(syncRunning).observe(view,{attributes:true,attributeFilter:["class"]});
  document.addEventListener("visibilitychange",syncRunning);

  if(!initGL())document.documentElement.classList.add("no-webgl");
  resize();
  syncRunning();
}
