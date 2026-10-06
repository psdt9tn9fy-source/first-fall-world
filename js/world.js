import { N } from "./data.js";

const W=1000,H=500;
const ZONE_LABEL={safe:"SAFE",contested:"CONTESTED",lost:"LOST",black:"BLACK"};
const ERA={
  "2031":{state:"FIRST DESCENT // SYSTEMIC COLLAPSE",note:"제1강하. 에이돌론 출현과 함께 전 지구적 혼란이 시작되었다."},
  "2041":{state:"GREAT WAR // GLOBAL MOBILIZATION",note:"대전쟁기. 도시 요새화와 장기 방위체계가 세계 곳곳에서 정착하기 시작했다."},
  "2071":{state:"COUNTEROFFENSIVE // TERRITORY RECOVERY",note:"인류 반격기. 상실지역 일부에 대한 회복작전과 민간 귀환계획이 확대된다."},
  "2101":{state:"RECONSTRUCTION // STALEMATE",note:"재건·고착기. 회복된 생활권과 장기 전선이 동시에 고착된다."},
  "2134":{state:"CURRENT RECORD // STALEMATE",note:"현재 세계 기록. 국가와 도시의 일상은 존속하지만 전쟁은 103년째 계속되고 있다."}
};
const SECTORS=[
  {id:"SEO",name:"SEOUL CORE",ko:"서울 핵심 생활권",zone:"safe",lon:126.978,lat:37.5665,record:"nations",nation:"rok",body:"대한민국의 수도이자 주요 SAFE 생활권. 국가 행정과 군사 지휘체계가 집중되어 있다."},
  {id:"PYO",name:"PYONGYANG SAFE ZONE",ko:"평양 SAFE ZONE",zone:"safe",lon:125.7625,lat:39.0392,record:"nations",nation:"rok",body:"2079년 SAFE ZONE으로 지정된 북부 핵심 거점. 민간 거주구역과 대학지구가 단계적으로 확대되었다."},
  {id:"TYO",name:"TOKYO–OSAKA CORRIDOR",ko:"도쿄–오사카 생활권",zone:"safe",lon:137.7,lat:35.3,record:"nations",nation:"jpn",body:"일본의 핵심 도시·교통축. 장기전 이후에도 민간 생활과 해양 방위체계를 함께 유지한다."},
  {id:"NKG",name:"NANJING RECONSTRUCTION ZONE",ko:"난징 재건권",zone:"safe",lon:118.7969,lat:32.0603,record:"nations",nation:"crf",body:"2050년 탈환 이후 재건된 중국 동부 핵심권. 중화재건연방의 산업·행정 중심 중 하나다."},
  {id:"BRU",name:"BRUSSELS COMMAND ZONE",ko:"브뤼셀 공동전구 지휘권",zone:"safe",lon:4.3517,lat:50.8503,record:"nations",nation:"edc",body:"유럽 공동방위체계의 주요 지휘·기록 거점. 다국가 전구 조정 기능을 담당한다."},
  {id:"SYD",name:"SYDNEY PACIFIC NODE",ko:"시드니 태평양 후방거점",zone:"safe",lon:151.2093,lat:-33.8688,record:"nations",nation:"aus",body:"태평양 방위권의 주요 후방 거점. 군수·훈련·민간 항로를 연결하는 안정 통제지역이다."},
  {id:"BAE",name:"BAEKDU BLACK ZONE",ko:"백두 BLACK ZONE",zone:"black",lon:128.08,lat:42.01,record:"eidolon",body:"반복적인 봉쇄작전이 기록된 고위험 구역. 접근과 장기 정찰 데이터는 제한적으로 공개된다."},
  {id:"AMZ",name:"AMAZON BLACK ZONE",ko:"아마존 BLACK ZONE",zone:"black",lon:-60.0,lat:-3.0,record:"eidolon",body:"다수의 탐사·회복작전 기록이 남은 대규모 위험권. 브라질은 이 지역 대응 경험을 축적해왔다."}
];
const ROUTES={
  KOR:"rok",PRK:"rok",USA:"afu",JPN:"jpn",RUS:"rus",IND:"ind",BRA:"bra",AUS:"aus",CAN:"can",MEX:"mex",
  FRA:"edc",DEU:"edc",GBR:"edc",ITA:"edc",ESP:"edc",BEL:"edc",NLD:"edc",POL:"edc",PRT:"edc",NOR:"edc",SWE:"edc",FIN:"edc",DNK:"edc",CZE:"edc",AUT:"edc",CHE:"edc",
  KAZ:"cadc",UZB:"cadc",TKM:"cadc",KGZ:"cadc",TJK:"cadc",MNG:"cadc",
  SAU:"medc",IRN:"medc",IRQ:"medc",TUR:"medc",SYR:"medc",JOR:"medc",ISR:"medc",ARE:"medc",QAT:"medc",OMN:"medc",YEM:"medc",
  IDN:"sea",MYS:"sea",PHL:"sea",VNM:"sea",THA:"sea",MMR:"sea",KHM:"sea",LAO:"sea",SGP:"sea",BRN:"sea",
  ZAF:"afr",NGA:"afr",ETH:"afr",KEN:"afr",DZA:"afr",MAR:"afr"
};

function project(lon,lat){return[(lon+180)/360*W,(90-lat)/180*H]}
function geomPath(geometry){
  if(!geometry)return"";
  const polys=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
  let d="";
  for(const poly of polys){
    for(const ring of poly){
      let prev=null;
      ring.forEach((p,i)=>{
        const lon=p[0],lat=p[1],[x,y]=project(lon,lat);
        const jump=prev!==null&&Math.abs(lon-prev)>180;
        d+=(i===0||jump?"M":"L")+x.toFixed(2)+" "+y.toFixed(2);
        prev=lon;
      });
      d+="Z";
    }
  }
  return d;
}
function centroid(feature){
  let sx=0,sy=0,n=0;
  const walk=v=>{
    if(Array.isArray(v)&&typeof v[0]==="number"){const p=project(v[0],v[1]);sx+=p[0];sy+=p[1];n++}
    else if(Array.isArray(v))v.forEach(walk);
  };
  walk(feature.geometry?.coordinates);
  return n?[sx/n,sy/n]:[W/2,H/2];
}

export function initWorld(){
  const room=document.querySelector("#situationRoom");
  const view=document.querySelector('.view[data-view="world"]');
  const intro=document.querySelector("#intro");
  if(!room||!view)return;

  const land=document.querySelector("#worldLand"),sectorLayer=document.querySelector("#worldSectors");
  const viewport=document.querySelector("#mapViewport"),mapGroup=document.querySelector("#worldMapViewport");
  const loading=document.querySelector("#mapLoading"),hover=document.querySelector("#mapHover");
  const coordinate=document.querySelector("#mapCoordinate"),search=document.querySelector("#worldSearch"),searchList=document.querySelector("#worldSearchList");
  const lens=document.querySelector("#scanLens"),scanTarget=document.querySelector("#scanTarget"),scanToggle=document.querySelector("#scanToggle");
  const eraReadout=document.querySelector("#worldEraReadout"),eraState=document.querySelector("#eraState"),eraNote=document.querySelector("#eraNote");
  const mobileQuery=matchMedia("(max-width: 820px)");
  const mobileEraReadout=document.querySelector("#mobileEraReadout");
  const targetAcquire=document.querySelector("#targetAcquire"),targetAcquireLabel=document.querySelector("#targetAcquireLabel");
  const sectorPanel=document.querySelector("#sectorPanel"),sheetGrabber=document.querySelector("#sheetGrabber");
  const panel={
    overline:document.querySelector("#panelOverline"),index:document.querySelector("#panelIndex"),
    title:document.querySelector("#panelTitle"),class:document.querySelector("#panelClass"),
    body:document.querySelector("#panelBody"),era:document.querySelector("#panelEra"),
    status:document.querySelector("#panelStatus"),access:document.querySelector("#panelAccess"),
    open:document.querySelector("#panelOpen"),feed:document.querySelector("#panelFeed")
  };
  const nationsByKey=new Map(N.map(n=>[n[0],n]));
  const countryByName=new Map();
  const pathByIso=new Map();
  const sectorNode=new Map();
  let loaded=false,loadingNow=false,selected=null,zone="all",era="2134",zoom=1,focus=[W/2,H/2],scan=false,mapTx=0,mapTy=0,drawTx=0,drawTy=0,drawZoom=1,mapAnim=0,acquireTimer=0,sheetStartY=null,sheetDragged=false;

  function isMobile(){return mobileQuery.matches}
  function showAcquire(label){
    if(!isMobile()||!targetAcquire)return;
    clearTimeout(acquireTimer);targetAcquireLabel.textContent=label||"TARGET";
    targetAcquire.classList.remove("acquiring");void targetAcquire.offsetWidth;targetAcquire.classList.add("acquiring");
    if(navigator.vibrate)navigator.vibrate(12);
    acquireTimer=setTimeout(()=>targetAcquire.classList.remove("acquiring"),820);
  }
  function openSheet(expand=false){
    if(!isMobile()||!sectorPanel)return;
    sectorPanel.classList.add("mobile-open");sectorPanel.classList.toggle("expanded",expand);
    sheetGrabber?.setAttribute("aria-expanded",String(expand));
  }
  function closeSheet(){
    if(!sectorPanel)return;
    sectorPanel.classList.remove("mobile-open","expanded");sheetGrabber?.setAttribute("aria-expanded","false");
  }

  function setPanel({overline="GLOBAL THEATER // 2134",index="00",title="WORLD OVERVIEW",className="I.D.A. PUBLIC ARCHIVE",body="지도의 국가 또는 전략 노드를 선택하면 현재 기록과 연결된 아카이브를 열람할 수 있다.",status="ONGOING WAR",access="PUBLIC",record=null,nation=null,feed="NODE 07 // WORLD DATA SYNCHRONIZED"}={}){
    panel.overline.textContent=overline;panel.index.textContent=index;panel.title.textContent=title;panel.class.textContent=className;
    panel.body.textContent=body;panel.era.textContent=era;panel.status.textContent=status;panel.access.textContent=access;panel.feed.textContent=feed;
    panel.open.disabled=!record;panel.open.dataset.record=record||"";panel.open.dataset.nation=nation||"";
    panel.open.firstChild.nodeValue=record?"OPEN RELATED RECORD ":"NO LINKED RECORD ";
  }
  function clearSelected(){
    land.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected"));
    sectorLayer.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected"));
  }
  function applyTransform(){
    const [cx,cy]=focus;
    mapTx=W/2-cx*zoom;mapTy=H/2-cy*zoom;
    cancelAnimationFrame(mapAnim);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){
      drawTx=mapTx;drawTy=mapTy;drawZoom=zoom;
      mapGroup.setAttribute("transform",`translate(${drawTx} ${drawTy}) scale(${drawZoom})`);return;
    }
    const sx=drawTx,sy=drawTy,sz=drawZoom,start=performance.now(),duration=isMobile()?430:360;
    const tick=now=>{
      const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3);
      drawTx=sx+(mapTx-sx)*e;drawTy=sy+(mapTy-sy)*e;drawZoom=sz+(zoom-sz)*e;
      mapGroup.setAttribute("transform",`translate(${drawTx} ${drawTy}) scale(${drawZoom})`);
      if(p<1)mapAnim=requestAnimationFrame(tick);
    };
    mapAnim=requestAnimationFrame(tick);
  }
  function resetFocus(){
    clearSelected();selected=null;zoom=1;focus=[W/2,H/2];applyTransform();closeSheet();
    setPanel({overline:`GLOBAL THEATER // ${era}`});
  }
  function focusAt(x,y,z=1.55){focus=[x,y];zoom=Math.max(1,Math.min(2.35,z));applyTransform()}
  function nationPanel(key,name,iso,feature){
    const n=nationsByKey.get(key);
    clearSelected();
    pathByIso.get(iso)?.classList.add("selected");
    selected={type:"nation",key,iso};
    const [x,y]=centroid(feature);focusAt(x,y,1.55);showAcquire(iso);openSheet(false);
    if(n){
      setPanel({overline:`NATION LINK // ${iso}`,index:"N",title:n[2],className:n[3],body:n[8],status:n[4],access:"PUBLIC",record:"nations",nation:key,feed:`${n[1]} // ARCHIVE LINK READY`});
    }else{
      setPanel({overline:`GEOGRAPHIC RECORD // ${iso}`,index:"N",title:name,className:"NO DEDICATED PUBLIC RECORD",body:"현재 공개 아카이브에 독립 국가 기록이 연결되어 있지 않다.",status:"REFERENCE ONLY",access:"PUBLIC",feed:"GEOGRAPHIC REFERENCE // NO RECORD LINK"});
    }
  }
  function genericCountryPanel(feature){
    const iso=feature.id||"---",name=feature.properties?.name||"UNKNOWN";
    clearSelected();pathByIso.get(iso)?.classList.add("selected");selected={type:"country",iso};
    const [x,y]=centroid(feature);focusAt(x,y,1.42);showAcquire(iso);openSheet(false);
    setPanel({overline:`GEOGRAPHIC REFERENCE // ${iso}`,index:"G",title:name,className:"WORLD MAP REFERENCE",body:"지리 정보는 확인되지만 현재 공개 아카이브에 별도 국가 기록이 연결되어 있지 않다.",status:"REFERENCE ONLY",access:"PUBLIC",feed:"MAP NODE // NO DEDICATED RECORD"});
  }
  function sectorPanelData(s,node){
    clearSelected();node.classList.add("selected");selected={type:"sector",id:s.id};
    const [x,y]=project(s.lon,s.lat);focusAt(x,y,1.72);showAcquire(s.id);openSheet(false);
    setPanel({overline:`STRATEGIC NODE // ${s.id}`,index:s.id,title:s.ko,className:`${ZONE_LABEL[s.zone]} // ${s.name}`,body:s.body,status:ZONE_LABEL[s.zone],access:s.zone==="black"?"RESTRICTED":"PUBLIC",record:s.record,nation:s.nation||null,feed:`${s.name} // RECORD LINK READY`});
  }

  function renderSectors(){
    sectorLayer.innerHTML="";
    const counts={all:SECTORS.length,safe:0,contested:0,lost:0,black:0};
    for(const s of SECTORS){
      counts[s.zone]++;
      const [x,y]=project(s.lon,s.lat);
      const g=document.createElementNS("http://www.w3.org/2000/svg","g");
      g.setAttribute("class","sector-marker");g.dataset.zone=s.zone;g.dataset.id=s.id;g.setAttribute("transform",`translate(${x} ${y})`);
      g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",`${s.ko}, ${ZONE_LABEL[s.zone]}`);
      g.innerHTML='<circle class="sector-hit" r="20"></circle><circle class="sector-pulse" r="8"></circle><circle class="sector-ring" r="8"></circle><circle class="sector-core" r="2.6"></circle><text x="12" y="-8">'+s.id+'</text>';
      g.addEventListener("mouseenter",()=>hover.textContent=`${s.id} // ${s.name}`);
      g.addEventListener("mouseleave",()=>hover.textContent="SELECT A SECTOR OR NATION");
      g.addEventListener("click",e=>{e.stopPropagation();sectorPanelData(s,g)});
      g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sectorPanelData(s,g)}});
      sectorLayer.appendChild(g);sectorNode.set(s.id,g);
    }
    Object.entries(counts).forEach(([k,v])=>{const el=document.querySelector("#count"+k[0].toUpperCase()+k.slice(1));if(el)el.textContent=String(v).padStart(2,"0")});
    document.querySelector("#worldNodeCount").textContent=String(SECTORS.length).padStart(2,"0")+" TRACKED";
  }

  function addSearchOptions(features){
    searchList.innerHTML="";
    const frag=document.createDocumentFragment();
    [...SECTORS.map(s=>s.ko),...features.map(f=>f.properties?.name).filter(Boolean)].sort((a,b)=>a.localeCompare(b)).forEach(name=>{
      const o=document.createElement("option");o.value=name;frag.appendChild(o);
    });
    searchList.appendChild(frag);
  }
  function selectSearch(value){
    const q=value.trim().toLowerCase();if(!q)return;
    const sector=SECTORS.find(s=>s.ko.toLowerCase()===q||s.name.toLowerCase()===q||s.id.toLowerCase()===q);
    if(sector){sectorPanelData(sector,sectorNode.get(sector.id));return}
    const feature=countryByName.get(q);
    if(feature){
      const route=ROUTES[feature.id];
      route?nationPanel(route,feature.properties.name,feature.id,feature):genericCountryPanel(feature);
    }
  }

  async function loadMap(){
    if(loaded||loadingNow)return;loadingNow=true;
    try{
      const response=await fetch("./assets/data/world.geojson",{cache:"force-cache"});
      if(!response.ok)throw new Error("world data");
      const geo=await response.json(),frag=document.createDocumentFragment();
      for(const feature of geo.features){
        const d=geomPath(feature.geometry);if(!d)continue;
        const path=document.createElementNS("http://www.w3.org/2000/svg","path");
        const iso=feature.id||"---",name=feature.properties?.name||iso;
        path.setAttribute("d",d);path.setAttribute("fill-rule","evenodd");path.dataset.iso=iso;path.dataset.name=name;
        const route=ROUTES[iso];if(route)path.classList.add("linked");
        path.addEventListener("mouseenter",()=>hover.textContent=`${iso} // ${name.toUpperCase()}${route?" // RECORD LINK":""}`);
        path.addEventListener("mouseleave",()=>hover.textContent="SELECT A SECTOR OR NATION");
        path.addEventListener("click",e=>{e.stopPropagation();route?nationPanel(route,name,iso,feature):genericCountryPanel(feature)});
        frag.appendChild(path);pathByIso.set(iso,path);countryByName.set(name.toLowerCase(),feature);
      }
      land.appendChild(frag);renderSectors();addSearchOptions(geo.features);
      loaded=true;loading.classList.add("done");viewport.classList.add("ready");
    }catch(e){
      loading.innerHTML="<span>WORLD DATA // UNAVAILABLE</span>";
      setPanel({status:"MAP OFFLINE",feed:"NODE 07 // GEOGRAPHIC DATA FAILED"});
    }finally{loadingNow=false}
  }

  document.querySelectorAll("[data-zone-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    zone=btn.dataset.zoneFilter;room.dataset.zone=zone;
    document.querySelectorAll("[data-zone-filter]").forEach(x=>x.classList.toggle("active",x===btn));
    sectorNode.forEach((node,id)=>{
      const s=SECTORS.find(v=>v.id===id);node.classList.toggle("filtered",zone!=="all"&&s.zone!==zone);
    });
    if(zone!=="all"){
      const visible=SECTORS.filter(s=>s.zone===zone);
      if(!visible.length){
        clearSelected();selected=null;
        setPanel({overline:`ZONE CLASSIFICATION // ${ZONE_LABEL[zone]}`,index:zone==="safe"?"01":zone==="contested"?"02":zone==="lost"?"03":"04",title:ZONE_LABEL[zone],className:"CLASSIFICATION RECORD",body:zone==="contested"?"교전 및 회복작전이 진행 중인 유동 통제권. 현재 공개 지도에는 개별 전략 노드가 등록되지 않았다.":zone==="lost"?"지속적인 인류 통제가 상실된 지역. 현재 공개 지도에는 개별 전략 노드가 등록되지 않았다.":"선택한 분류의 공개 전략 노드만 표시하고 있다.",status:visible.length?String(visible.length).padStart(2,"0")+" PUBLIC NODES":"NO PUBLIC NODES",feed:"ZONE FILTER // ACTIVE"});
      }
    }else if(!selected)resetFocus();
  }));

  document.querySelectorAll("[data-era]").forEach(btn=>btn.addEventListener("click",()=>{
    era=btn.dataset.era;room.dataset.era=era;
    document.querySelectorAll("[data-era]").forEach(x=>x.classList.toggle("active",x===btn));
    eraReadout.textContent=era;if(mobileEraReadout)mobileEraReadout.textContent=era;eraState.textContent=ERA[era].state;eraNote.textContent=ERA[era].note;panel.era.textContent=era;
  }));

  document.querySelector("#zoomIn").addEventListener("click",()=>{zoom=Math.min(2.35,zoom+.3);applyTransform()});
  document.querySelector("#zoomOut").addEventListener("click",()=>{zoom=Math.max(1,zoom-.3);applyTransform()});
  document.querySelector("#zoomReset").addEventListener("click",resetFocus);
  document.querySelector("#panelReset").addEventListener("click",resetFocus);
  viewport.addEventListener("click",e=>{if(e.target===viewport||e.target.id==="worldSvg"||e.target.classList.contains("map-grid-fill"))resetFocus()});

  sheetGrabber?.addEventListener("click",()=>{
    if(sheetDragged){sheetDragged=false;return}
    const expand=!sectorPanel.classList.contains("expanded");openSheet(expand);
  });
  sheetGrabber?.addEventListener("pointerdown",e=>{sheetStartY=e.clientY;sheetDragged=false;sheetGrabber.setPointerCapture?.(e.pointerId)});
  sheetGrabber?.addEventListener("pointerup",e=>{
    if(sheetStartY===null)return;
    const dy=e.clientY-sheetStartY;sheetStartY=null;
    if(Math.abs(dy)>28){
      sheetDragged=true;
      if(dy<0)openSheet(true);else openSheet(false);
    }
  });

  scanToggle.addEventListener("click",()=>{
    scan=!scan;scanToggle.setAttribute("aria-pressed",String(scan));viewport.classList.toggle("scan-active",scan);
    scanToggle.textContent=scan?"SCAN // ON":"SCAN";
  });
  viewport.addEventListener("pointermove",e=>{
    const r=viewport.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
    const vx=px/r.width*W,vy=py/r.height*H;
    const bx=(vx-mapTx)/zoom,by=(vy-mapTy)/zoom;
    const lon=bx/W*360-180,lat=90-by/H*180;
    coordinate.textContent=`LAT ${Math.abs(lat).toFixed(2)}°${lat>=0?"N":"S"} // LON ${Math.abs(lon).toFixed(2)}°${lon>=0?"E":"W"}`;
    if(scan){
      lens.style.left=px+"px";lens.style.top=py+"px";
      let best=null,bestD=Infinity;
      sectorNode.forEach((node,id)=>{
        const nr=node.getBoundingClientRect(),cx=nr.left+nr.width/2-r.left,cy=nr.top+nr.height/2-r.top,d=Math.hypot(cx-px,cy-py);
        if(d<bestD){bestD=d;best=id}
      });
      scanTarget.textContent=bestD<75?best+" // SIGNAL ACQUIRED":"NO TARGET";
    }
  },{passive:true});
  viewport.addEventListener("pointerleave",()=>{coordinate.textContent="LAT --.-- // LON --.--";scanTarget.textContent="NO TARGET"});

  search.addEventListener("change",()=>selectSearch(search.value));
  search.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();selectSearch(search.value)}});

  panel.open.addEventListener("click",()=>{
    const record=panel.open.dataset.record;if(!record)return;closeSheet();
    const nation=panel.open.dataset.nation;
    if(nation)window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:nation}}));
    window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:record}}));
  });

  mobileQuery.addEventListener?.("change",e=>{if(!e.matches)closeSheet()});

  const introObserver=new MutationObserver(()=>{
    if(intro.classList.contains("hide"))loadMap();
  });
  introObserver.observe(intro,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="world")loadMap()});
  if(intro.classList.contains("hide"))loadMap();
}
