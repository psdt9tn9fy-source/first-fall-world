const N=[
["rok","ROK // 2134","대한민국","REPUBLIC OF KOREA","요새화 / 교전 중","약 4,300만","서울","적응형 전투체계","제1강하 이후 국가체제를 유지한 한반도 핵심국가. 북부 붕괴와 수십 년의 회복전쟁을 거쳐 한반도 대부분을 통합했다."],
["afu","AFU // 2134","아메리카 연방연합","AMERICAN FEDERAL UNION","재편 연방국","약 2억 4,000만","워싱턴 연방구","전장 AI / 항공우주","구 미합중국의 후계국. 북미 연방위기 이후 신헌법으로 재편되었다."],
["jpn","JPN // 2134","일본국","JAPAN","체제 존속국","약 6,800만","도쿄","요새도시 / 해양방어","제1강하 이후에도 국호와 국가체제를 유지한 해양 방위국."],
["crf","CRF // 2134","중화재건연방","CHINESE RECONSTRUCTION FEDERATION","중국 후계국","약 4억 2,000만","난징","산업 / 드론","구 중국 동부·남부 핵심 산업권을 기반으로 한 최대 후계국."],
["ncdr","NCDR // 2134","화북방위공화국","NORTH CHINA DEFENSE REPUBLIC","군사화 후계국","약 1억 8,000만","베이징","요새 / 장거리포병","베이징과 화북 방위권을 중심으로 형성된 군사화 후계국."],
["wur","WUR // 2134","서부연합공화국","WESTERN UNION REPUBLIC","중국 후계국","약 1억 4,000만","청두","에너지 / 지하시설","청두 중심의 서부권 후계국."],
["rus","RUS // 2134","러시아 연방","RUSSIAN FEDERATION","회랑 방위국","약 8,200만","모스크바","중장비 / 극지전","도시·자원지대·철도·군사회랑을 중심으로 안정 통제권을 유지한다."],
["edc","EDC // 2134","유럽방위공동체","EUROPEAN DEFENCE COMMUNITY","초국가 방위공동체","약 4억 5,000만","브뤼셀 방위구","전장 네트워크 / 전자전","유럽 각국이 독립국가와 군을 유지한 채 통합전구사령부를 운영한다."],
["cadc","CADC // 2134","중앙아시아 공동방위체","CENTRAL ASIA DEFENSE COMPACT","지역 공동방위체","약 1억 1,000만","다국적 사령체계","초원 / 산악 / 육상회랑","중앙아시아 5개국과 몽골이 참여하는 공동방위체."],
["medc","MEDC // 2134","중동 공동방위체","MIDDLE EAST DEFENSE COMPACT","지역 공동방위체","약 5억 2,000만","다국적 사령체계","사막전 / 방공 / 에너지회랑","중동 각국이 주권을 유지한 채 구성한 느슨한 전시 협력기구."],
["ind","IND // 2134","인도공화국","REPUBLIC OF INDIA","주요 강대국","약 17억 8,000만","뉴델리","에너지 / 항공우주","국가체제를 유지한 주요 강대국."],
["bra","BRA // 2134","브라질","BRAZIL","아마존 전선국","약 2억 6,000만","브라질리아","밀림전 / 탐사","아마존 BLACK ZONE 대응 경험을 축적한 남미 핵심국."],
["aus","AUS // 2134","호주","AUSTRALIA","태평양 후방기지","약 4,100만","캔버라","군수 / 광물자원","태평양권의 주요 후방 생산·훈련기지."],
["can","CAN // 2134","캐나다","CANADA","북미 공동방위","약 5,200만","오타와","북극권 / 감시","북극권 감시와 극지전에 강한 주권국가."],
["mex","MEX // 2134","멕시코","MEXICO","북미 공동방위","약 1억 7,000만","멕시코시티","도시전 / 제조","중미 연결회랑과 제조업에서 중요한 역할을 한다."],
["sea","SEA COOP","동남아시아 방위협력권","SOUTHEAST ASIA DEFENCE COOPERATION","지역 방위협력체","약 8억 3,000만","다국적 사령체계","해양전 / 군도방어","동남아 각국이 주권을 유지하면서 해양 방위를 공동조율한다."],
["afr","AU // 2134","아프리카 방위협력권","AFRICAN UNION DEFENCE COOPERATION","지역 방위협력체","약 24억","다국적 사령체계","회랑 방어","아프리카연합의 방위기능이 강화된 협력체."]
];
const ext={rok:"jpg",afu:"jpg",jpn:"jpg",crf:"jpg",ncdr:"jpg",wur:"jpg",rus:"jpg",edc:"jpg",cadc:"jpg",medc:"jpg",ind:"jpg",bra:"jpg",aus:"jpg",can:"jpg",mex:"jpg",sea:"jpg",afr:"png"};
const yearStage=document.querySelector(".intro-years"),timelineYear=document.querySelector("#timelineYear"),eraTitle=document.querySelector("#eraTitle"),timelineTrack=document.querySelector("#timelineTrack"),timelineEra=document.querySelector("#timelineEra");
const ERAS=[{y:2031,n:"대혼란기",e:"THE GREAT CHAOS"},{y:2041,n:"대전쟁기",e:"THE GREAT WAR"},{y:2071,n:"인류 반격기",e:"HUMAN COUNTEROFFENSIVE"},{y:2101,n:"재건·고착기",e:"AGE OF RECONSTRUCTION"}];
const EVENTS=[
[2031,"상하이 17일","SHANGHAI // SEVENTEEN DAYS","A"],
[2031,"도쿄 대피령","TOKYO // GENERAL EVACUATION","A"],
[2031,"제2차 서울 방공전","SEOUL // AIR DEFENSE II","A"],
[2031,"뉴델리 첫 접촉","NEW DELHI // FIRST CONTACT","B"],
[2031,"시드니 항만 폐쇄","SYDNEY // HARBOR CLOSED","C"],
[2032,"블라디보스토크 단절","VLADIVOSTOK // CONNECTION LOST","B"],
[2032,"태평양 통신망 붕괴","PACIFIC // NETWORK COLLAPSE","A"],
[2032,"파리 지하대피령","PARIS // UNDERGROUND ORDER","B"],
[2032,"서울 야간통행금지령","SEOUL // NIGHT CURFEW","C"],
[2033,"베이징 철수작전","BEIJING // EVACUATION OP.","A"],
[2033,"제네바 긴급회담","GENEVA // EMERGENCY SUMMIT","B"],
[2033,"호주 북부 방위선","N. AUSTRALIA // DEFENSE LINE","C"],
[2034,"라인강 난민회랑","RHINE // REFUGEE CORRIDOR","A"],
[2034,"마드리드 공중전","MADRID // AIR BATTLE","B"],
[2035,"뉴욕 블랙아웃","NEW YORK // BLACKOUT","A"],
[2035,"멕시코시티 72시간","MEXICO CITY // 72 HOURS","B"],
[2036,"부산 집결령","BUSAN // MUSTER ORDER","A"],
[2036,"카이로 방공망 붕괴","CAIRO // AIR GRID LOST","B"],
[2037,"알마티 피난회랑","ALMATY // EVACUATION CORRIDOR","C"],
[2038,"수에즈 봉쇄","SUEZ // BLOCKADE","A"],
[2039,"브뤼셀 기록소 화재","BRUSSELS // ARCHIVE FIRE","C"],
[2040,"제1차 백두산 관측사건","BAEKDU // OBSERVATION 01","A"],
[2042,"마닐라 9일","MANILA // NINE DAYS","A"],
[2043,"제2차 인도양 호송전","INDIAN OCEAN // CONVOY II","B"],
[2044,"제3차 화북 공세","NORTH CHINA // OFFENSIVE III","A"],
[2045,"서울 제1외곽선 완공","SEOUL // OUTER LINE 01","C"],
[2047,"알래스카 방위선 붕괴","ALASKA // DEFENSE LINE LOST","A"],
[2048,"바르샤바 4월 공세","WARSAW // APRIL OFFENSIVE","B"],
[2050,"난징 탈환전","NANJING // RECAPTURE","A"],
[2051,"부산 군수항 재개항","BUSAN // ARSENAL PORT REOPENED","C"],
[2053,"시베리아 철도전쟁","SIBERIA // RAIL WAR","A"],
[2054,"앙카라 방공협정","ANKARA // AIR DEFENSE ACCORD","C"],
[2056,"인도양 공동함대 창설","INDIAN OCEAN // JOINT FLEET","B"],
[2057,"제4차 평양 정찰전","PYONGYANG // RECON IV","B"],
[2059,"제1차 둥지 소각작전","NEST BURN // OPERATION 01","A"],
[2060,"리우 격리구역 붕괴","RIO // QUARANTINE COLLAPSE","B"],
[2062,"유럽 동부 대후퇴","EASTERN EUROPE // GREAT RETREAT","A"],
[2063,"오사카 해상방벽 전투","OSAKA // SEA WALL BATTLE","B"],
[2065,"서울 방위권 재편","SEOUL // DEFENSE REFORM","B"],
[2066,"카자흐 초원전선 개방","KAZAKH STEPPE // FRONT OPENED","B"],
[2068,"평양 진입작전","PYONGYANG // ENTRY OP.","A"],
[2069,"제1차 민간귀환계획","CIVIL RETURN // PLAN 01","C"],
[2070,"아마존 제7탐사대 실종","AMAZON // EXPEDITION 07 LOST","A"],
[2073,"난징 재건선언","NANJING // RECONSTRUCTION","A"],
[2074,"서울 민간철도 정상화","SEOUL // CIVIL RAIL RESTORED","C"],
[2076,"제1차 BLACK ZONE 축소작전","BLACK ZONE // REDUCTION 01","A"],
[2077,"도쿄 야간등화 복구","TOKYO // NIGHT GRID RESTORED","C"],
[2079,"평양 SAFE ZONE 지정","PYONGYANG // SAFE ZONE","A"],
[2080,"뉴욕 동부구역 재개방","NEW YORK // EAST SECTOR REOPENED","C"],
[2082,"도쿄 외곽방벽 완공","TOKYO // OUTER WALL COMPLETE","B"],
[2083,"부산 국제항로 재개","BUSAN // INTL ROUTES RESTORED","C"],
[2085,"서울–부산 고속회랑 복구","SEOUL–BUSAN // CORRIDOR RESTORED","A"],
[2086,"제3차 유럽 귀환계획","EUROPE // RETURN PLAN III","C"],
[2088,"브뤼셀 공동전구사령부 창설","BRUSSELS // JOINT THEATER CMD","A"],
[2089,"상하이 동부구역 재건","SHANGHAI // EAST SECTOR REBUILT","B"],
[2091,"북극권 제4둥지 격멸","ARCTIC // NEST 04 ELIMINATED","A"],
[2092,"시드니 태평양 훈련협정","SYDNEY // PACIFIC TRAINING ACCORD","C"],
[2094,"인도 궤도감시망 재가동","INDIA // ORBITAL GRID ONLINE","A"],
[2095,"아프리카 대륙감시망 연결","AFRICA // WATCH GRID LINKED","B"],
[2097,"아마존 회복작전","AMAZON // RECOVERY OP.","A"],
[2098,"마닐라 민간항로 정상화","MANILA // CIVIL AIR RESTORED","C"],
[2100,"제76차 세계방위협정","GLOBAL DEFENSE ACCORD // 76","A"],
[2101,"제1차 전후세대 성인선언","FIRST POST-DESCENT GENERATION","B"],
[2103,"중앙사관학교 개편","CENTRAL MILITARY ACADEMY // REFORM","A"],
[2105,"서울 제3민간구역 확장","SEOUL // CIVIL SECTOR III","C"],
[2107,"서울 제4방벽 철거","SEOUL // WALL 04 REMOVED","B"],
[2109,"도쿄–오사카 자율회랑","TOKYO–OSAKA // AUTO CORRIDOR","C"],
[2111,"평양 민간거주구역 확대","PYONGYANG // CIVIL ZONE EXPANDED","A"],
[2113,"유럽 대륙철도 완전복구","EUROPE // RAIL GRID RESTORED","B"],
[2115,"백두 BLACK ZONE 제13차 봉쇄","BAEKDU // CONTAINMENT 13","A"],
[2117,"부산 제2우주항 개항","BUSAN // SPACEPORT 02 OPENED","C"],
[2119,"제2차 유라시아 회랑 개통","EURASIA // CORRIDOR II","A"],
[2121,"아마존 생태복구선 진입","AMAZON // ECO RECOVERY LINE","B"],
[2123,"태평양 방위망 완성","PACIFIC // DEFENSE GRID COMPLETE","A"],
[2125,"제네바 민간교류헌장","GENEVA // CIVIL EXCHANGE CHARTER","C"],
[2127,"카자흐 회랑 공동방위선","KAZAKH CORRIDOR // JOINT LINE","A"],
[2128,"평양 대학지구 재개방","PYONGYANG // UNIVERSITY DISTRICT","C"],
[2130,"제9차 EIDOLON 대분류 개정","EIDOLON // TAXONOMY REV.09","A"],
[2131,"세계 민간항공망 82% 복구","GLOBAL CIVIL AVIATION // 82%","B"],
[2132,"세계전구 경계등급 재조정","GLOBAL THEATER // ALERT REVISION","A"],
[2133,"중앙사관학교 제76기 입교","CENTRAL ACADEMY // CLASS 76","B"],
[2134,"백년전쟁 // ONGOING","CENTURY WAR // ONGOING","A"]];
const TL_START=2000,TL_SCALE=118,eventEls=[];
for(let y=2000;y<=2134;y++){if(y%2===0||y===2031||y===2134){const m=document.createElement("i");m.className="tl-mark"+([2000,2026,2041,2071,2101,2134].includes(y)?" major":"")+(y===2031?" rupture":"");m.style.left=((y-TL_START)*TL_SCALE)+"px";timelineTrack.appendChild(m)}if(y%5===0||[2026,2031,2041,2071,2101,2134].includes(y)){const t=document.createElement("span");t.className="tl-year"+([2000,2026,2041,2071,2101,2134].includes(y)?" major":"")+(y===2031?" rupture":"");t.style.left=((y-TL_START)*TL_SCALE)+"px";t.textContent=y;timelineTrack.appendChild(t)}}
EVENTS.forEach((ev,i)=>{const e=document.createElement("span");e.className="tl-event "+(i%2?"down":"up")+(ev[0]===2031?" hot":"")+" rank-"+ev[3].toLowerCase();e.dataset.year=ev[0];e.dataset.rank=ev[3];e.style.left=((ev[0]-TL_START)*TL_SCALE+(i%3-1)*34)+"px";const level=i%4;e.style.setProperty("--stem",(54+level*36)+"px");if(i%2)e.style.top=(58+level*38)+"px";else e.style.bottom=(58+level*38)+"px";e.textContent=ev[1];timelineTrack.appendChild(e);eventEls.push(e)});
const finalStage=document.querySelector(".intro-final"),finalBlackout=document.querySelector("#finalBlackout");
const recordWindow=document.querySelector("#recordWindow"),recordEvent=document.querySelector("#recordEvent"),recordEng=document.querySelector("#recordEng"),recordStatus=document.querySelector("#recordStatus");
let eraSeen=new Set(),heroTimer;
function showEra(o){if(eraSeen.has(o.y))return;eraSeen.add(o.y);eraTitle.innerHTML=o.n+"<small>"+o.e+" // "+o.y+"</small>";eraTitle.classList.add("show");setTimeout(()=>eraTitle.classList.remove("show"),1450)}
function hero(ev,i){
  eventEls.forEach(x=>x.classList.remove("active"));eventEls[i].classList.add("active");
  clearTimeout(heroTimer);
  recordEvent.classList.remove("roll");void recordEvent.offsetWidth;
  recordEvent.textContent=ev[1];
  recordEng.textContent=ev[2]+" // RECORD "+String(i+1).padStart(3,"0");
  recordEvent.classList.add("roll");
  if(ev[0]>=2031){recordWindow.classList.add("war");recordStatus.textContent="WAR RECORD // ACTIVE"}
  if(ev[0]===2031&&i<3){recordWindow.classList.remove("impact");void recordWindow.offsetWidth;recordWindow.classList.add("impact")}
  heroTimer=setTimeout(()=>eventEls[i].classList.remove("active"),520);
}
const intro=document.querySelector("#intro"),hold=document.querySelector("#enter"),skip=document.querySelector("#introSkip");
let introSkipped=false,chronologyRAF=0,eventTimers=[];
function finishChronology(){
  if(introSkipped)return;
  finalBlackout.classList.add("hit");
  setTimeout(()=>{
    yearStage.classList.add("done");
    finalStage.classList.add("ready");
    intro.classList.add("final-visible");
  },3650);
}
function skipIntro(){
  introSkipped=true;
  cancelAnimationFrame(chronologyRAF);
  eventTimers.forEach(clearTimeout);
  intro.classList.add("opening","final-visible");
  setTimeout(()=>intro.classList.add("hide"),260);
}
skip.addEventListener("click",skipIntro);
setTimeout(()=>{
  if(introSkipped)return;
  let lastShown=2000,lastYearInt=2000,nextEvent=0,lastEventYear=null,sameYearSlot=0;
  const duration=9200,start=performance.now();
  const moveTo=(year)=>{
    const y=Math.max(2000,Math.min(2134,year));
    const yi=Math.floor(y);if(yi!==lastYearInt){timelineYear.textContent=yi;timelineYear.classList.remove("flip");void timelineYear.offsetWidth;timelineYear.classList.add("flip");lastYearInt=yi}
    const x=(y-TL_START)*TL_SCALE;
    timelineTrack.style.transform="translateX("+(-x)+"px)";
    timelineTrack.style.setProperty("--progress",x+"px");
    if(y>=2031)timelineTrack.classList.add("post");
    timelineEra.textContent=y<2031?"PRE-DESCENT ERA":y<2041?"대혼란기 // GREAT CHAOS":y<2071?"대전쟁기 // GREAT WAR":y<2101?"인류 반격기 // COUNTEROFFENSIVE":"재건·고착기 // RECONSTRUCTION";
    ERAS.forEach(o=>{if(y>=o.y)showEra(o)});
    if(y>=2031&&!yearStage.classList.contains("ruptured"))yearStage.classList.add("ruptured");
  };
  function fireCrossedEvents(year){
    while(nextEvent<EVENTS.length&&EVENTS[nextEvent][0]<=year){
      const i=nextEvent++,ev=EVENTS[i];
      if(lastEventYear===ev[0])sameYearSlot++;else{lastEventYear=ev[0];sameYearSlot=0}
      const delay=sameYearSlot*(ev[0]===2031?360:210);
      eventTimers.push(setTimeout(()=>{if(!introSkipped)hero(ev,i)},delay));
    }
  }
  function tick(now){
    if(introSkipped)return;
    const p=Math.min(1,(now-start)/duration);
    /* Four-act pacing: calm → pre-2031 acceleration → century rush → controlled arrival. */
    let year;
    if(p<.17)year=2000+(p/.17)*26;
    else if(p<.25)year=2026+((p-.17)/.08)*5;
    else if(p<.78)year=2031+((p-.25)/.53)*69;
    else year=2100+((p-.78)/.22)*34;
    moveTo(year);
    fireCrossedEvents(year);
    lastShown=year;
    if(p<1)chronologyRAF=requestAnimationFrame(tick);
    else{
      timelineYear.textContent=2134;
      yearStage.classList.add("braking");
      eventTimers.push(setTimeout(finishChronology,620));
    }
  }
  chronologyRAF=requestAnimationFrame(tick);
},2100);let holdTimer;function release(){clearTimeout(holdTimer);hold.classList.remove("holding")}function begin(e){e.preventDefault();if(intro.classList.contains("opening"))return;hold.classList.add("holding");holdTimer=setTimeout(()=>{intro.classList.add("opening");setTimeout(()=>intro.classList.add("hide"),720)},850)}hold.addEventListener("pointerdown",begin);["pointerup","pointerleave","pointercancel"].forEach(x=>hold.addEventListener(x,release));
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.dataset.view===b.dataset.tab))});
const list=document.querySelector("#nationList");
function show(n){document.querySelectorAll(".nation-btn").forEach(x=>x.classList.toggle("active",x.dataset.k===n[0]));document.querySelector("#nf").src="./assets/flags-hq/"+n[0]+"-2134."+(ext[n[0]]||"jpg");document.querySelector("#nf").onerror=function(){this.style.visibility="hidden"};document.querySelector("#nf").style.visibility="visible";["nc","nn","ne","ns","np","nca","nst","nb"].forEach((id,i)=>document.querySelector("#"+id).textContent=n[i+1])}
N.forEach(n=>{let b=document.createElement("button");b.className="nation-btn";b.dataset.k=n[0];b.innerHTML='<img src="./assets/flags-hq/'+n[0]+'-2134.'+(ext[n[0]]||"jpg")+'" onerror="this.style.visibility=\'hidden\'"><b>'+n[2]+'</b><small>'+n[1].split(" //")[0]+'</small>';b.onclick=()=>show(n);list.appendChild(b)});show(N[0]);