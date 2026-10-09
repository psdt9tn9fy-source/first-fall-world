import { ERAS, EVENTS } from "./data.js";

export function initIntro(){
const yearStage=document.querySelector(".intro-years"),timelineYear=document.querySelector("#timelineYear"),eraTitle=document.querySelector("#eraTitle"),timelineTrack=document.querySelector("#timelineTrack"),timelineEra=document.querySelector("#timelineEra");
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
const intro=document.querySelector("#intro"),skip=document.querySelector("#introSkip");
document.body.classList.add("intro-lock");
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
  intro.classList.add("hide");
  document.body.classList.remove("intro-lock");
}
skip.addEventListener("click",skipIntro);
if(matchMedia("(prefers-reduced-motion: reduce)").matches){skipIntro();return}
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
},2100);

}
