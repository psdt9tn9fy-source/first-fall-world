/* Read-only historical archive. EVENTS from data.js is the single source of truth. */
import {EVENTS} from "./data.js?v=20261007-refactor-3";
export const HISTORY_PERIODS={
  all:{name:"전체 기록",from:2031,to:2134},
  chaos:{name:"대혼란기",from:2031,to:2040},
  war:{name:"대전쟁기",from:2041,to:2070},
  counter:{name:"인류 반격기",from:2071,to:2100},
  rebuild:{name:"재건·고착기",from:2101,to:2134}
};
export function historyRowsFor(period="all"){
  const range=HISTORY_PERIODS[period];
  if(!range)return [];
  return EVENTS.filter(row=>row[0]>=range.from&&row[0]<=range.to);
}
export function initArchive(){
  const root=document.querySelector("#historyArchive");
  if(!root)return;
  const entries=root.querySelector("#historyEntries");
  const count=root.querySelector("#historyCount");
  const more=root.querySelector("#historyMore");
  const title=root.querySelector("#historyPeriodName");
  const buttons=[...root.querySelectorAll("[data-history-era]")];
  const PAGE=16;
  let period="all",shown=0;
  function appendRows(rows){
    const fragment=document.createDocumentFragment();
    for(const [year,name,english] of rows){
      const item=document.createElement("article");
      item.className="history-entry";
      const date=document.createElement("time");
      date.dateTime=String(year);date.textContent=String(year);
      const copy=document.createElement("div");
      const heading=document.createElement("h3");heading.textContent=name;
      const sub=document.createElement("p");sub.textContent=english;
      copy.append(heading,sub);item.append(date,copy);fragment.appendChild(item);
    }
    entries.appendChild(fragment);
  }
  function expand(){
    const records=historyRowsFor(period);
    const next=Math.min(shown+PAGE,records.length);
    appendRows(records.slice(shown,next));
    shown=next;
    more.hidden=shown>=records.length;
    more.setAttribute("aria-label","이어서 열람, "+(records.length-shown)+"개 남음");
    count.textContent=shown+" / "+records.length+"개 기록";
  }
  function showPeriod(key){
    const selected=HISTORY_PERIODS[key];
    if(!selected)return;
    period=key;shown=0;entries.replaceChildren();
    title.textContent=selected.name;
    buttons.forEach(button=>{
      const active=button.dataset.historyEra===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    expand();
  }
  buttons.forEach(button=>button.addEventListener("click",()=>showPeriod(button.dataset.historyEra)));
  more.addEventListener("click",expand);
  showPeriod("all");
}
