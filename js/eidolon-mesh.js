import {inspectTopologyUrl} from "./eidolon-topology.js?v=20261008-brute-topology1";
/* Lightweight GLB metadata inspection; no geometry or texture manipulation.
   The GLB JSON chunk is stored first, before its binary geometry payload. */
const GLB_MAGIC=0x46546c67;
const GLB_JSON=0x4e4f534a;
const MAX_JSON_BYTES=4*1024*1024;
const INITIAL_RANGE=65536;

async function fetchPrefix(url,length,signal){
  const response=await fetch(url,{
    headers:{Range:"bytes=0-"+String(length-1)},
    signal
  });
  if(!response.ok)throw new Error("모델 데이터를 가져오지 못했습니다 (HTTP "+response.status+").");
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength<20)throw new Error("GLB 헤더가 불완전합니다.");
  return bytes;
}

export function summarizeGlb(gltf){
  const materials=Array.isArray(gltf.materials)?gltf.materials:[];
  const nodes=Array.isArray(gltf.nodes)?gltf.nodes:[];
  const sourceMeshes=Array.isArray(gltf.meshes)?gltf.meshes:[];
  let primitives=0;
  const referencedMaterials=new Set();
  const meshes=sourceMeshes.map((mesh,index)=>{
    const parts=Array.isArray(mesh.primitives)?mesh.primitives:[];
    primitives+=parts.length;
    const used=new Set();
    parts.forEach(part=>{
      const label=Number.isInteger(part.material)?"재질 "+String(part.material+1):"기본 재질";
      used.add(label);
      referencedMaterials.add(label);
    });
    const nodeRefs=nodes.filter(node=>node.mesh===index);
    const displayName=String(mesh.name||nodeRefs.find(node=>node.name)?.name||"메시 "+String(index+1).padStart(2,"0"));
    return {name:displayName,primitives:parts.length,nodes:nodeRefs.length,materials:[...used]};
  });
  const meshInstances=nodes.filter(node=>Number.isInteger(node.mesh)).length;
  const meshCount=meshes.length;
  let verdict;
  if(!meshCount)verdict="메시 데이터가 확인되지 않았습니다. 모델 파일을 다시 확인해야 합니다.";
  else if(meshCount===1&&primitives===1)
    verdict="메시 1개·형상 단위 1개입니다. 장갑·관절·코어의 정확한 부위별 채색에는 모델 또는 텍스처 편집이 필요할 가능성이 높습니다.";
  else if(materials.length<=1&&meshCount>1)
    verdict="메시는 여러 개지만 재질은 공유하는 구조입니다. 부품별 색상을 적용하려면 Three.js에서 메시별 재질을 재할당하거나 GLB를 편집해야 합니다.";
  else if(materials.length<=1)
    verdict="하나의 메시 안에 형상 단위가 여럿 있습니다. 분리 가능성은 있지만 현재 뷰어만으로 각 형상에 독립적인 재질을 배정할 수는 없습니다.";
  else
    verdict="복수의 재질이 존재합니다. 부품과 재질의 연결 상태에 따라 색상을 나눠 적용할 수 있습니다.";
  return {
    meshCount,nodeCount:nodes.length,meshInstances,primitiveCount:primitives,
    materialCount:materials.length,usedMaterialCount:referencedMaterials.size,
    meshes,verdict
  };
}

export async function inspectGlb(url,{signal}={}){
  let bytes=await fetchPrefix(url,INITIAL_RANGE,signal);
  let view=new DataView(bytes);
  if(view.getUint32(0,true)!==GLB_MAGIC||view.getUint32(4,true)!==2)
    throw new Error("지원하지 않는 모델 파일 형식입니다 (GLB 2.0 필요).");
  const jsonSize=view.getUint32(12,true),type=view.getUint32(16,true);
  if(type!==GLB_JSON||jsonSize===0||jsonSize>MAX_JSON_BYTES)
    throw new Error("GLB 구조 데이터가 없거나 검사 허용 크기를 초과했습니다.");
  const required=jsonSize+20;
  if(bytes.byteLength<required){
    bytes=await fetchPrefix(url,required,signal);
    if(bytes.byteLength<required)throw new Error("모델 구조 데이터가 끝까지 내려받아지지 않았습니다.");
    view=new DataView(bytes);
    if(view.getUint32(0,true)!==GLB_MAGIC||view.getUint32(16,true)!==GLB_JSON)
      throw new Error("GLB 구조 데이터가 손상되었습니다.");
  }
  const text=new TextDecoder("utf-8").decode(new Uint8Array(bytes,20,jsonSize));
  let json;
  try{json=JSON.parse(text)}catch(error){throw new Error("GLB 구조 정보를 해석하지 못했습니다.")}
  return summarizeGlb(json);
}

export function initMeshInspector(box,modelUrl){
  const scan=box.querySelector("[data-ei-mesh-scan]");
  const state=box.querySelector("[data-ei-mesh-state]");
  const stats=box.querySelector("[data-ei-mesh-stats]");
  const verdict=box.querySelector("[data-ei-mesh-verdict]");
  const list=box.querySelector("[data-ei-mesh-list]");
  const copy=box.querySelector("[data-ei-mesh-copy]");
  const topologyButton=box.querySelector("[data-ei-topology-run]");
  const topologyState=box.querySelector("[data-ei-topology-state]");
  const topologyStats=box.querySelector("[data-ei-topology-stats]");
  const topologyIslands=box.querySelector("[data-ei-topology-islands]");
  const topologyResult=box.querySelector("[data-ei-topology-result]");
  const topologyCaution=box.querySelector("[data-ei-topology-caution]");
  const topologyCopy=box.querySelector("[data-ei-topology-copy]");
  if(!scan||!state||!stats||!list)return;
  let report=null;
  let topologyReport=null;
  let working=false;
  let topologyWorking=false;
  function topologyText(){
    if(!topologyReport)return "";
    const result=topologyReport;
    return ["BRUTE / 표면 연결 분석",
      "정점 "+result.vertices+" | 삼각형 "+result.triangles,
      "인덱스 연결 덩어리 "+result.rawIslands,
      "접합 후 연결 덩어리 "+result.weldedIslands,
      "유의미한 표면 덩어리 "+result.significantIslands,
      ...result.largest.map(item=>"영역 "+item.rank+": 삼각형 "+item.triangles+" ("+item.share+"%)"),
      "판정: "+result.verdict,"주의: "+result.accuracy].join("\n");
  }
  async function scanTopology(){
    if(topologyWorking||!topologyButton)return;
    topologyWorking=true;
    topologyButton.disabled=true;topologyButton.textContent="표면 분석 중…";
    topologyReport=null;
    topologyStats?.replaceChildren();
    topologyIslands?.replaceChildren();
    if(topologyResult)topologyResult.textContent="";
    if(topologyCaution)topologyCaution.textContent="";
    if(topologyCopy)topologyCopy.hidden=true;
    try{
      const result=await inspectTopologyUrl(modelUrl,message=>{
        if(topologyState)topologyState.textContent=message;
      });
      topologyReport=result;
      for(const [label,value] of [
        ["정점",result.vertices],["삼각형",result.triangles],
        ["연결 영역",result.weldedIslands],["주요 영역",result.significantIslands]
      ]){
        const cell=document.createElement("div");
        const text=document.createElement("span");text.textContent=label;
        const count=document.createElement("b");count.textContent=value.toLocaleString("ko-KR");
        cell.append(text,count);topologyStats?.appendChild(cell);
      }
      result.largest.forEach(item=>{
        const row=document.createElement("li");
        row.textContent="영역 "+item.rank+" / 삼각형 "+item.triangles.toLocaleString("ko-KR")+"개 · "+item.share+"%";
        topologyIslands?.appendChild(row);
      });
      if(topologyResult)topologyResult.textContent=result.verdict;
      if(topologyCaution)topologyCaution.textContent=result.accuracy;
      if(topologyState)topologyState.textContent="SURFACE CHECK COMPLETE // 정점 이음새 근사 접합 적용";
      if(topologyCopy)topologyCopy.hidden=false;
    }catch(error){
      if(topologyState)topologyState.textContent="표면 분석 실패: "+(error?.message||"지원하지 않는 형식입니다.");
    }finally{
      topologyWorking=false;
      topologyButton.disabled=false;topologyButton.textContent="다시 표면 분석";
    }
  }
  topologyButton?.addEventListener("click",scanTopology);
  topologyCopy?.addEventListener("click",async()=>{
    if(!topologyReport)return;
    try{
      await navigator.clipboard.writeText(topologyText());
      topologyState.textContent="표면 분석 결과를 복사했습니다.";
    }catch(error){
      topologyState.textContent="복사 실패 · 결과 화면을 캡처해 주세요.";
    }
  });
  function reportText(){
    if(!report)return "";
    return ["BRUTE / GLB 구조 검사",
      "메시 "+report.meshCount+"개 | 노드 "+report.nodeCount+"개 | 메시 인스턴스 "+report.meshInstances+"개",
      "형상 단위(프리미티브) "+report.primitiveCount+"개 | 원본 재질 "+report.materialCount+"개",
      ...report.meshes.map((mesh,i)=>String(i+1)+". "+mesh.name+" / 형상 "+mesh.primitives+" / 노드 "+mesh.nodes+" / "+mesh.materials.join(", ")),
      "판정: "+report.verdict].join("\n");
  }
  async function run(){
    if(working)return;
    working=true;scan.disabled=true;scan.textContent="검사 중…";
    state.textContent="GLB 구조 분석 중 · 처음 실행 시 데이터 다운로드가 발생할 수 있습니다.";
    stats.replaceChildren();list.replaceChildren();verdict.textContent="";copy.hidden=true;
    try{
      report=await inspectGlb(modelUrl);
      const records=[
        ["MESH",""+report.meshCount],["NODE",""+report.nodeCount],
        ["PRIMITIVE",""+report.primitiveCount],["MATERIAL",""+report.materialCount]
      ];
      records.forEach(([key,value])=>{
        const cell=document.createElement("div");
        const label=document.createElement("span");label.textContent=key;
        const count=document.createElement("b");count.textContent=value;
        cell.append(label,count);stats.appendChild(cell);
      });
      report.meshes.slice(0,24).forEach((mesh,index)=>{
        const row=document.createElement("li");
        const title=document.createElement("b");title.textContent=String(index+1).padStart(2,"0")+" / "+mesh.name;
        const sub=document.createElement("span");
        sub.textContent="형상 "+mesh.primitives+" · 사용 노드 "+mesh.nodes+" · "+(mesh.materials.join(", ")||"재질 없음");
        row.append(title,sub);list.appendChild(row);
      });
      if(report.meshCount>24){
        const more=document.createElement("li");more.textContent="외 "+(report.meshCount-24)+"개 메시 · 아래의 결과 복사로 전체 목록 확인";
        list.appendChild(more);
      }
      verdict.textContent=report.verdict;
      state.textContent="STRUCTURE VERIFIED // 메시 인스턴스 "+report.meshInstances+"개";
      copy.hidden=false;
    }catch(error){
      report=null;state.textContent="검사 실패: "+(error?.message||"모델 데이터를 확인할 수 없습니다.");
    }finally{working=false;scan.disabled=false;scan.textContent="다시 검사";}
  }
  scan.addEventListener("click",run);
  copy?.addEventListener("click",async()=>{
    if(!report)return;
    try{
      await navigator.clipboard.writeText(reportText());
      state.textContent="검사 결과를 복사했습니다.";
    }catch(error){state.textContent="복사에 실패했습니다. 검사 결과 화면을 캡처해 주세요.";}
  });
}
