import { N } from "./data.js";
import { ZONE_LABEL, ERA, SECTORS, ROUTES } from "./world-data.js?v=20261007-eastasia-polish-1";

const W=1000,H=500;
function project(lon,lat){return[(lon+180)/360*W,(90-lat)/180*H]}
function geomPath(geometry){
  if(!geometry)return"";
  const polys=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
  let d="";
  for(const poly of polys)for(const ring of poly){
    let prev=null;
    ring.forEach((p,i)=>{
      const lon=p[0],lat=p[1],[x,y]=project(lon,lat),jump=prev!==null&&Math.abs(lon-prev)>180;
      d+=(i===0||jump?"M":"L")+x.toFixed(2)+" "+y.toFixed(2);prev=lon;
    });
    d+="Z";
  }
  return d;
}
function centroid(feature){
  let sx=0,sy=0,n=0;
  const walk=v=>{
    if(Array.isArray(v)&&typeof v[0]==="number"){const p=project(v[0],v[1]);sx+=p[0];sy+=p[1];n++}
    else if(Array.isArray(v))v.forEach(walk);
  };
  walk(feature.geometry?.coordinates);return n?[sx/n,sy/n]:[W/2,H/2];
}

export function initWorld(){
  const room=document.querySelector("#situationRoom"),view=document.querySelector('.view[data-view="world"]'),intro=document.querySelector("#intro");
  if(!room||!view)return;
  const desktopQuery=matchMedia("(min-width: 821px)");
  const land=document.querySelector("#worldLand"),sectorLayer=document.querySelector("#worldSectors"),viewport=document.querySelector("#mapViewport");
  const mapGroup=document.querySelector("#worldMapViewport"),loading=document.querySelector("#mapLoading"),hover=document.querySelector("#mapHover");
  const coordinate=document.querySelector("#mapCoordinate"),search=document.querySelector("#worldSearch"),searchList=document.querySelector("#worldSearchList");
  const eraReadout=document.querySelector("#worldEraReadout"),eraState=document.querySelector("#eraState"),eraNote=document.querySelector("#eraNote");
  const panel={
    overline:document.querySelector("#panelOverline"),index:document.querySelector("#panelIndex"),title:document.querySelector("#panelTitle"),
    class:document.querySelector("#panelClass"),body:document.querySelector("#panelBody"),era:document.querySelector("#panelEra"),
    status:document.querySelector("#panelStatus"),access:document.querySelector("#panelAccess"),open:document.querySelector("#panelOpen"),feed:document.querySelector("#panelFeed")
  };
  const nationsByKey=new Map(N.map(n=>[n[0],n])),countryByName=new Map(),pathByIso=new Map(),sectorNode=new Map();
  let loaded=false,loadingNow=false,selected=null,zone="all",era="2134",zoom=1,focus=[W/2,H/2],tx=0,ty=0,drawTx=0,drawTy=0,drawZoom=1,mapAnim=0;

  function setPanel({overline="GLOBAL THEATER // 2134",index="00",title="WORLD OVERVIEW",className="I.D.A. PUBLIC ARCHIVE",body="지도의 국가 또는 전략 노드를 선택하면 현재 기록과 연결된 아카이브를 열람할 수 있다.",status="ONGOING WAR",access="PUBLIC",record=null,nation=null,feed="NODE 07 // WORLD DATA SYNCHRONIZED"}={}){
    panel.overline.textContent=overline;panel.index.textContent=index;panel.title.textContent=title;panel.class.textContent=className;panel.body.textContent=body;
    panel.era.textContent=era;panel.status.textContent=status;panel.access.textContent=access;panel.feed.textContent=feed;
    panel.open.disabled=!record;panel.open.dataset.record=record||"";panel.open.dataset.nation=nation||"";
    panel.open.firstChild.nodeValue=record?"OPEN RELATED RECORD ":"NO LINKED RECORD ";
  }
  function clearSelected(){
    land.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected"));
    sectorLayer.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected"));
  }
  function applyTransform(){
    const [cx,cy]=focus;tx=W/2-cx*zoom;ty=H/2-cy*zoom;cancelAnimationFrame(mapAnim);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced){drawTx=tx;drawTy=ty;drawZoom=zoom;mapGroup.setAttribute("transform",`translate(${drawTx} ${drawTy}) scale(${drawZoom})`);return}
    const sx=drawTx,sy=drawTy,sz=drawZoom,start=performance.now();
    const tick=now=>{
      const p=Math.min(1,(now-start)/360),e=1-Math.pow(1-p,3);
      drawTx=sx+(tx-sx)*e;drawTy=sy+(ty-sy)*e;drawZoom=sz+(zoom-sz)*e;
      mapGroup.setAttribute("transform",`translate(${drawTx} ${drawTy}) scale(${drawZoom})`);
      if(p<1)mapAnim=requestAnimationFrame(tick);
    };
    mapAnim=requestAnimationFrame(tick);
  }
  function resetFocus(){clearSelected();selected=null;zoom=1;focus=[W/2,H/2];applyTransform();setPanel({overline:`GLOBAL THEATER // ${era}`})}
  function focusAt(x,y,z=1.55){focus=[x,y];zoom=Math.max(1,Math.min(2.35,z));applyTransform()}
  function nationPanel(key,name,iso,feature){
    const n=nationsByKey.get(key);clearSelected();pathByIso.get(iso)?.classList.add("selected");selected={type:"nation",key,iso};
    const [x,y]=centroid(feature);focusAt(x,y,1.55);
    if(n)setPanel({overline:`NATION LINK // ${iso}`,index:"N",title:n[2],className:n[3],body:n[8],status:n[4],access:"PUBLIC",record:"nations",nation:key,feed:`${n[1]} // ARCHIVE LINK READY`});
    else setPanel({overline:`GEOGRAPHIC RECORD // ${iso}`,index:"N",title:name,className:"NO DEDICATED PUBLIC RECORD",body:"현재 공개 아카이브에 독립 국가 기록이 연결되어 있지 않다.",status:"REFERENCE ONLY",feed:"GEOGRAPHIC REFERENCE // NO RECORD LINK"});
  }
  function genericCountryPanel(feature){
    const iso=feature.id||"---",name=feature.properties?.name||"UNKNOWN";clearSelected();pathByIso.get(iso)?.classList.add("selected");selected={type:"country",iso};
    const [x,y]=centroid(feature);focusAt(x,y,1.42);
    setPanel({overline:`GEOGRAPHIC REFERENCE // ${iso}`,index:"G",title:name,className:"WORLD MAP REFERENCE",body:"지리 정보는 확인되지만 현재 공개 아카이브에 별도 국가 기록이 연결되어 있지 않다.",status:"REFERENCE ONLY",feed:"MAP NODE // NO DEDICATED RECORD"});
  }
  function sectorPanelData(s,node){
    clearSelected();node.classList.add("selected");selected={type:"sector",id:s.id};
    const [x,y]=project(s.lon,s.lat);focusAt(x,y,1.72);
    setPanel({overline:`STRATEGIC NODE // ${s.id}`,index:s.id,title:s.ko,className:`${ZONE_LABEL[s.zone]} // ${s.name}`,body:s.body,status:ZONE_LABEL[s.zone],access:s.zone==="black"?"RESTRICTED":"PUBLIC",record:s.record,nation:s.nation||null,feed:`${s.name} // RECORD LINK READY`});
  }
  function renderSectors(){
    sectorLayer.innerHTML="";const counts={all:SECTORS.length,safe:0,contested:0,lost:0,black:0};
    for(const s of SECTORS){
      counts[s.zone]++;const [x,y]=project(s.lon,s.lat),g=document.createElementNS("http://www.w3.org/2000/svg","g");
      g.setAttribute("class","sector-marker");g.dataset.zone=s.zone;g.dataset.id=s.id;g.setAttribute("transform",`translate(${x} ${y})`);
      g.setAttribute("tabindex","0");g.setAttribute("role","button");g.setAttribute("aria-label",`${s.ko}, ${ZONE_LABEL[s.zone]}`);
      g.innerHTML='<circle class="sector-hit" r="20"></circle><circle class="sector-pulse" r="8"></circle><circle class="sector-ring" r="8"></circle><circle class="sector-core" r="2.6"></circle><text x="12" y="-8">'+s.id+'</text>';
      g.addEventListener("mouseenter",()=>hover.textContent=`${s.id} // ${s.name}`);g.addEventListener("mouseleave",()=>hover.textContent="SELECT A SECTOR OR NATION");
      g.addEventListener("click",e=>{e.stopPropagation();sectorPanelData(s,g)});
      g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();sectorPanelData(s,g)}});
      sectorLayer.appendChild(g);sectorNode.set(s.id,g);
    }
    Object.entries(counts).forEach(([k,v])=>{const el=document.querySelector("#count"+k[0].toUpperCase()+k.slice(1));if(el)el.textContent=String(v).padStart(2,"0")});
    document.querySelector("#worldNodeCount").textContent=String(SECTORS.length).padStart(2,"0")+" TRACKED";
  }
  function addSearchOptions(features){
    searchList.innerHTML="";const frag=document.createDocumentFragment();
    [...SECTORS.map(s=>s.ko),...features.map(f=>f.properties?.name).filter(Boolean)].sort((a,b)=>a.localeCompare(b)).forEach(name=>{const o=document.createElement("option");o.value=name;frag.appendChild(o)});
    searchList.appendChild(frag);
  }
  function selectSearch(value){
    const q=value.trim().toLowerCase();if(!q)return;
    const sector=SECTORS.find(s=>s.ko.toLowerCase()===q||s.name.toLowerCase()===q||s.id.toLowerCase()===q);
    if(sector){sectorPanelData(sector,sectorNode.get(sector.id));return}
    const feature=countryByName.get(q);if(feature){const route=ROUTES[feature.id];route?nationPanel(route,feature.properties.name,feature.id,feature):genericCountryPanel(feature)}
  }
  async function loadMap(){
    if(!desktopQuery.matches||loaded||loadingNow)return;loadingNow=true;
    try{
      const response=await fetch("./assets/data/world.geojson",{cache:"force-cache"});if(!response.ok)throw new Error("world data");
      const geo=await response.json(),frag=document.createDocumentFragment();
      for(const feature of geo.features){
        const d=geomPath(feature.geometry);if(!d)continue;
        const path=document.createElementNS("http://www.w3.org/2000/svg","path"),iso=feature.id||"---",name=feature.properties?.name||iso,route=ROUTES[iso];
        path.setAttribute("d",d);path.setAttribute("fill-rule","evenodd");path.dataset.iso=iso;path.dataset.name=name;if(route)path.classList.add("linked");
        path.addEventListener("mouseenter",()=>hover.textContent=`${iso} // ${name.toUpperCase()}${route?" // RECORD LINK":""}`);
        path.addEventListener("mouseleave",()=>hover.textContent="SELECT A SECTOR OR NATION");
        path.addEventListener("click",e=>{e.stopPropagation();route?nationPanel(route,name,iso,feature):genericCountryPanel(feature)});
        frag.appendChild(path);pathByIso.set(iso,path);countryByName.set(name.toLowerCase(),feature);
      }
      land.appendChild(frag);renderSectors();addSearchOptions(geo.features);loaded=true;loading.classList.add("done");viewport.classList.add("ready");
    }catch(e){loading.innerHTML="<span>WORLD DATA // UNAVAILABLE</span>";setPanel({status:"MAP OFFLINE",feed:"NODE 07 // GEOGRAPHIC DATA FAILED"})}
    finally{loadingNow=false}
  }

  document.querySelectorAll("[data-zone-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    zone=btn.dataset.zoneFilter;room.dataset.zone=zone;document.querySelectorAll("[data-zone-filter]").forEach(x=>x.classList.toggle("active",x===btn));
    sectorNode.forEach((node,id)=>{const s=SECTORS.find(v=>v.id===id);node.classList.toggle("filtered",zone!=="all"&&s.zone!==zone)});
    if(zone!=="all"&&!SECTORS.some(s=>s.zone===zone)){clearSelected();selected=null;setPanel({overline:`ZONE CLASSIFICATION // ${ZONE_LABEL[zone]}`,index:zone==="contested"?"02":"03",title:ZONE_LABEL[zone],className:"CLASSIFICATION RECORD",body:zone==="contested"?"교전 및 회복작전이 진행 중인 유동 통제권. 현재 공개 지도에는 개별 전략 노드가 등록되지 않았다.":"지속적인 인류 통제가 상실된 지역. 현재 공개 지도에는 개별 전략 노드가 등록되지 않았다.",status:"NO PUBLIC NODES",feed:"ZONE FILTER // ACTIVE"})}
    else if(zone==="all"&&!selected)resetFocus();
  }));
  document.querySelectorAll(".era-track [data-era]").forEach(btn=>btn.addEventListener("click",()=>{
    era=btn.dataset.era;room.dataset.era=era;document.querySelectorAll(".era-track [data-era]").forEach(x=>x.classList.toggle("active",x===btn));
    eraReadout.textContent=era;eraState.textContent=ERA[era].state;eraNote.textContent=ERA[era].note;panel.era.textContent=era;
  }));
  document.querySelector("#zoomIn").addEventListener("click",()=>{zoom=Math.min(2.35,zoom+.3);applyTransform()});
  document.querySelector("#zoomOut").addEventListener("click",()=>{zoom=Math.max(1,zoom-.3);applyTransform()});
  document.querySelector("#zoomReset").addEventListener("click",resetFocus);document.querySelector("#panelReset").addEventListener("click",resetFocus);
  viewport.addEventListener("click",e=>{if(e.target===viewport||e.target.id==="worldSvg"||e.target.classList.contains("map-grid-fill"))resetFocus()});
  viewport.addEventListener("pointermove",e=>{
    const r=viewport.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,vx=px/r.width*W,vy=py/r.height*H,bx=(vx-drawTx)/drawZoom,by=(vy-drawTy)/drawZoom;
    const lon=bx/W*360-180,lat=90-by/H*180;coordinate.textContent=`LAT ${Math.abs(lat).toFixed(2)}°${lat>=0?"N":"S"} // LON ${Math.abs(lon).toFixed(2)}°${lon>=0?"E":"W"}`;
  },{passive:true});
  viewport.addEventListener("pointerleave",()=>coordinate.textContent="LAT --.-- // LON --.--");
  search.addEventListener("change",()=>selectSearch(search.value));search.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();selectSearch(search.value)}});
  panel.open.addEventListener("click",()=>{
    const record=panel.open.dataset.record;if(!record)return;const nation=panel.open.dataset.nation;
    if(nation)window.dispatchEvent(new CustomEvent("archive:select-nation",{detail:{key:nation}}));
    window.dispatchEvent(new CustomEvent("archive:open-record",{detail:{key:record}}));
  });
  new MutationObserver(()=>{if(intro.classList.contains("hide"))loadMap()}).observe(intro,{attributes:true,attributeFilter:["class"]});
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="world")loadMap()});
  desktopQuery.addEventListener?.("change",e=>{if(e.matches&&view.classList.contains("active")&&intro.classList.contains("hide"))loadMap()});
  if(intro.classList.contains("hide"))loadMap();
}
