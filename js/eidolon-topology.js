/* On-demand GLB topology scan. Reads geometry, never writes GLB or renderer. */
const MAGIC=0x46546c67, JSON_CHUNK=0x4e4f534a, BIN_CHUNK=0x004e4942;
const MAX_BYTES=40*1024*1024;
const MAX_VERTICES=650000, MAX_TRIANGLES=950000;

function viewBounds(data,position,size){
  if(position<0||size<0||position+size>data.byteLength)throw new Error("모델 버퍼 범위를 벗어났습니다.");
}

function parseGlb(buffer){
  if(buffer.byteLength<20)throw new Error("GLB 헤더가 불완전합니다.");
  const data=new DataView(buffer);
  if(data.getUint32(0,true)!==MAGIC||data.getUint32(4,true)!==2)
    throw new Error("GLB 2.0 파일이 아닙니다.");
  const total=data.getUint32(8,true);
  if(total>buffer.byteLength)throw new Error("GLB 파일이 완전히 내려받아지지 않았습니다.");
  let offset=12,metadata=null,binary=-1,binaryLength=0;
  while(offset+8<=total){
    const length=data.getUint32(offset,true),type=data.getUint32(offset+4,true);
    const start=offset+8;viewBounds(data,start,length);
    if(type===JSON_CHUNK){
      metadata=JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(buffer,start,length)));
    }
    if(type===BIN_CHUNK){binary=start;binaryLength=length}
    offset=start+length;
  }
  if(!metadata||binary<0)throw new Error("모델의 GLB JSON 또는 바이너리 데이터가 없습니다.");
  return {gltf:metadata,view:data,binary,binaryLength};
}

function accessorReader(gltf,view,binary,binaryLength,index,kind){
  const accessor=gltf.accessors?.[index];
  if(!accessor)throw new Error(kind+" 접근자 정보가 없습니다.");
  if(accessor.sparse)throw new Error(kind+" 희소 접근자 모델은 아직 지원하지 않습니다.");
  const bufferView=gltf.bufferViews?.[accessor.bufferView];
  if(!bufferView||bufferView.buffer!==0)throw new Error(kind+" 외부 버퍼는 지원하지 않습니다.");
  const types={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
  const size=types[accessor.componentType];
  const lanes=accessor.type==="VEC3"?3:accessor.type==="SCALAR"?1:0;
  if(!size||!lanes)throw new Error(kind+" 접근자 형식이 지원되지 않습니다.");
  if(!Number.isInteger(accessor.count)||accessor.count<0)throw new Error(kind+" 접근자 개수가 잘못되었습니다.");
  const stride=bufferView.byteStride||size*lanes;
  const start=binary+(bufferView.byteOffset||0)+(accessor.byteOffset||0);
  const end=start+Math.max(0,accessor.count-1)*stride+size*lanes;
  if(start<binary||end>binary+binaryLength)throw new Error(kind+" 바이너리 범위를 벗어났습니다.");
  function component(row,lane=0){
    const offset=start+row*stride+lane*size;
    switch(accessor.componentType){
      case 5120:return view.getInt8(offset);
      case 5121:return view.getUint8(offset);
      case 5122:return view.getInt16(offset,true);
      case 5123:return view.getUint16(offset,true);
      case 5125:return view.getUint32(offset,true);
      case 5126:return view.getFloat32(offset,true);
      default:throw new Error("잘못된 GLB 형식");
    }
  }
  return {component,count:accessor.count,type:accessor.type,componentType:accessor.componentType,normalized:!!accessor.normalized};
}

export async function analyzeGlbTopology(buffer,onProgress=()=>{}){
  const {gltf,view,binary,binaryLength}=parseGlb(buffer);
  const primitives=(gltf.meshes||[]).flatMap((mesh,mi)=>
    (mesh.primitives||[]).map((primitive,pi)=>({mesh,mi,pi,primitive})));
  const candidates=primitives.filter(({primitive})=>primitive.mode===undefined||primitive.mode===4);
  if(!candidates.length)throw new Error("삼각형 메시를 찾을 수 없습니다.");
  if(candidates.length!==1)throw new Error("형상 단위가 여러 개입니다. 현재 정밀 검사는 단일 형상 모델용입니다.");
  const {mesh,primitive}=candidates[0];
  if(primitive.extensions?.KHR_draco_mesh_compression||
     primitive.extensions?.EXT_meshopt_compression)
    throw new Error("압축된 메시입니다. 압축 해제 후 검사해야 합니다.");
  const positions=accessorReader(gltf,view,binary,binaryLength,primitive.attributes?.POSITION,"POSITION");
  if(positions.type!=="VEC3"||positions.componentType!==5126)
    throw new Error("현재는 FLOAT32 좌표 형식만 지원합니다.");
  const count=positions.count;
  if(count<3||count>MAX_VERTICES)throw new Error("정점 개수가 검사 허용 범위를 벗어났습니다 ("+count+").");
  const indices=Number.isInteger(primitive.indices)?
    accessorReader(gltf,view,binary,binaryLength,primitive.indices,"INDEX"):null;
  if(indices&&indices.type!=="SCALAR")throw new Error("인덱스 형식이 잘못되었습니다.");
  const indexCount=indices?.count??count;
  if(indexCount%3)throw new Error("삼각형 인덱스 개수가 3의 배수가 아닙니다.");
  const triangles=indexCount/3;
  if(!triangles||triangles>MAX_TRIANGLES)throw new Error("삼각형이 너무 많아 모바일 분석이 제한됩니다 ("+triangles+").");
  const parent=new Uint32Array(count),rank=new Uint8Array(count),used=new Uint8Array(count),head=new Uint32Array(triangles);
  for(let i=0;i<count;i++)parent[i]=i;
  function find(a){while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a]}return a}
  function unite(a,b){
    a=find(a);b=find(b);if(a===b)return;
    if(rank[a]<rank[b]){const t=a;a=b;b=t}
    parent[b]=a;if(rank[a]===rank[b])rank[a]++;
  }
  const getIndex=i=>indices?indices.component(i):i;
  onProgress("삼각형 연결 검사 중…");
  for(let t=0;t<triangles;t++){
    const p=t*3,a=getIndex(p),b=getIndex(p+1),c=getIndex(p+2);
    if(a>=count||b>=count||c>=count)throw new Error("잘못된 정점 인덱스가 있습니다.");
    used[a]=used[b]=used[c]=1;
    unite(a,b);unite(a,c);
    head[t]=a;
    if(t&&t%100000===0){onProgress("삼각형 "+t.toLocaleString("ko-KR")+" / "+triangles.toLocaleString("ko-KR")+" 분석 중…");await new Promise(resolve=>setTimeout(resolve,0))}
  }
  const rawRoots=new Set();
  for(let i=0;i<count;i++)if(used[i])rawRoots.add(find(i));
  const rawIslands=rawRoots.size;
  onProgress("중복 좌표 및 표면 이음새 검사 중…");
  // Triangles frequently duplicate vertices along UV seams.
  // Use a conservative spatial tolerance relative to overall model scale.
  const limits=[[Infinity,-Infinity],[Infinity,-Infinity],[Infinity,-Infinity]];
  for(let i=0;i<count;i++)if(used[i]){
    for(let k=0;k<3;k++){
      const n=positions.component(i,k);
      if(!Number.isFinite(n))throw new Error("좌표에 올바르지 않은 값이 있습니다.");
      if(n<limits[k][0])limits[k][0]=n;
      if(n>limits[k][1])limits[k][1]=n;
    }
  }
  const span=Math.max(...limits.map(([a,b])=>b-a));
  const precision=Math.max(span*0.000001,1e-8);
  const locations=new Map();let welded=0;
  for(let i=0;i<count;i++){
    if(!used[i])continue;
    const key=[0,1,2].map(k=>Math.round((positions.component(i,k)-limits[k][0])/precision)).join("/");
    const prev=locations.get(key);
    if(prev===undefined)locations.set(key,i);
    else if(find(i)!==find(prev)){unite(i,prev);welded++}
    if(i&&i%150000===0){onProgress("좌표 접합 "+i.toLocaleString("ko-KR")+" / "+count.toLocaleString("ko-KR"));await new Promise(resolve=>setTimeout(resolve,0))}
  }
  onProgress("분리 가능한 표면 영역 계산 중…");
  const components=new Map();
  for(let t=0;t<triangles;t++){
    const key=find(head[t]),item=components.get(key);
    if(item)item.triangles++;else components.set(key,{triangles:1});
  }
  const ranked=[...components.values()].sort((a,b)=>b.triangles-a.triangles);
  const minimum=Math.max(10,Math.round(triangles*0.005));
  const significant=ranked.filter(c=>c.triangles>=minimum).length;
  const largest=ranked.slice(0,12).map((item,i)=>({
    rank:i+1,triangles:item.triangles,
    share:Math.round(item.triangles/triangles*1000)/10
  }));
  let verdict;
  if(ranked.length===1)verdict="표면 연결 검사에서 하나의 연결 덩어리로 확인됐습니다. 자동 부위 분리는 어렵고, 수동 분할·텍스처 채색이 필요할 가능성이 높습니다.";
  else if(significant<=1)verdict="분리된 작은 표면은 있지만 큰 덩어리는 사실상 하나입니다. 장갑·팔·관절이 독립 부품인지 단정하기 어렵습니다.";
  else verdict="서로 떨어진 표면 덩어리가 여러 개 확인됐습니다. 웹에서 덩어리 단위로 메시를 분리할 가능성이 있지만, 각 덩어리가 어느 신체 부위인지는 별도 확인이 필요합니다.";
  return {
    meshName:mesh.name||"mesh",vertices:count,triangles,
    rawIslands,weldedIslands:ranked.length,significantIslands:significant,
    weldedPairs:welded,largest,verdict,
    accuracy:"좌표가 겹치는 정점을 근사 접합한 분석입니다. 같은 위치의 별도 부품은 합쳐질 수 있으며, 실제 신체 부위 판별은 아닙니다."
  };
}

export async function inspectTopologyUrl(url,onProgress=()=>{}){
  onProgress("원본 GLB 내려받는 중… 약 13MB");
  const response=await fetch(url,{cache:"force-cache"});
  if(!response.ok)throw new Error("3D 모델 다운로드 실패 (HTTP "+response.status+").");
  const headerSize=Number(response.headers?.get("content-length")||0);
  if(headerSize>MAX_BYTES)throw new Error("모바일 검사용 파일 크기 제한을 초과합니다.");
  const buffer=await response.arrayBuffer();
  if(buffer.byteLength>MAX_BYTES)throw new Error("모바일 검사용 파일 크기 제한을 초과합니다.");
  return analyzeGlbTopology(buffer,onProgress);
}
