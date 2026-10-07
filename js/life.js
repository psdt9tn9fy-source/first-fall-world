const SCENES=[
  {key:"commute",time:"07:42",title:"출근길",sub:"서울 · 평일 아침",body:"전쟁은 103년째지만 오전 8시의 도시는 여전히 붐빈다. 지하철과 간선철도는 평시 시간표로 움직이고, 학생과 직장인은 각자의 하루를 시작한다.",place:"서울 생활권",state:"정상 운행",note:"민간 교통망 가동"},
  {key:"education",time:"10:20",title:"수업이 시작된다",sub:"대학가 · 교육",body:"일반 대학과 전문교육기관은 전시체제 속에서도 운영된다. 군 관련 진로의 위상은 높지만 모든 청년이 군인이 되는 사회는 아니다.",place:"대학 교육지구",state:"정상 수업",note:"민간·군 교육 병존"},
  {key:"work",time:"13:05",title:"일과 직업",sub:"도심 업무지구",body:"산업·행정·서비스업은 장기전에 맞춰 재편되었지만 일상적인 직장생활 자체는 사라지지 않았다. 군 경력과 출신 기관은 일부 분야에서 강한 경력 자산으로 작용한다.",place:"서울 업무권",state:"정상 업무",note:"민간경제 유지"},
  {key:"evening",time:"18:40",title:"저녁의 도시",sub:"상업지구 · 문화",body:"사람들은 퇴근 후 식당과 카페를 찾고, 쇼핑하고, 공연과 스포츠를 즐긴다. 전쟁은 삶의 배경이지만 삶 전체를 대신하지는 않는다.",place:"도심 상업지구",state:"야간 영업",note:"문화생활 지속"},
  {key:"alert",time:"22:13",title:"민방위 알림",sub:"백두권역 · 주의",body:"휴대 단말에 짧은 경보가 표시된다. 시민들은 내용을 확인하고 필요한 경우 지정 대피시설과 교통 안내를 따른다. 경보는 특별하지만, 공포 그 자체는 더 이상 낯선 일이 아니다.",place:"백두 감시권역",state:"주의 단계",note:"도시 기능 유지"}
];

const TOPICS={
  city:{title:"도시",copy:"안전권(SAFE ZONE)의 도시는 요새화된 방위시설과 평범한 생활공간이 겹쳐 존재한다. 방벽과 대피시설은 익숙한 기반시설이 되었지만 거리의 목적은 여전히 사람이 살아가는 데 있다.",items:[["교통","철도·지하철·민간항공이 주요 생활권을 연결한다."],["도시공간","상업지구·주거지·대학가가 방위시설과 공존한다."],["대피체계","공공시설 곳곳에 비상대피 동선이 포함된다."]]},
  home:{title:"주거와 생활",copy:"주거공간은 전시 안전기준을 반영하지만 생활 자체는 21세기 도시와 크게 단절되지 않았다. 가족, 식사, 여가, 소비 같은 평범한 일상이 계속된다.",items:[["주거","안전권의 아파트와 주거단지는 일상적으로 운영된다."],["생활서비스","전기·통신·배달·유통망이 안정권에서 유지된다."],["비상설비","건물 단위 대피공간과 비상전력이 보편화되었다."]]},
  education:{title:"교육",copy:"일반 교육과 군 교육이 함께 존재한다. 대학과 학교는 정상적으로 운영되고, 사관학교와 전문 군 교육기관은 별도의 엘리트 경로를 형성한다.",items:[["일반대학","전공교육과 연구활동이 지속된다."],["군 교육","사관학교·부사관학교 등 군 경력 경로가 존재한다."],["사회적 위상","일부 명문 군 교육기관의 출신 배경은 강한 경력 자산이다."]]},
  work:{title:"일과 직업",copy:"장기전은 직업의 우선순위를 바꿨지만 모든 산업을 군수산업으로 바꾸지는 않았다. 행정·무역·서비스·문화·연구·제조가 함께 돌아간다.",items:[["민간경제","안전권 중심으로 일반 경제활동이 지속된다."],["군 경력","일부 공공·방산·안보 분야에서 높은 평가를 받는다."],["산업구조","민수와 군수가 긴밀하게 연결된 분야가 많다."]]},
  culture:{title:"문화",copy:"축제와 스포츠, 음악, 패션, 연애는 사라지지 않았다. 오히려 긴 전쟁 속에서 ‘평범하게 사는 것’ 자체가 중요한 사회적 가치가 되었다.",items:[["여가","공연·스포츠·게임·여행 문화가 존재한다."],["도시문화","카페·쇼핑·야간상권이 안전권에서 활성화되어 있다."],["세대감각","전쟁을 직접 겪지 않은 세대에게 전쟁은 오래된 현실이자 일상 배경이다."]]},
  tech:{title:"생활기술",copy:"2134년의 첨단기술은 전장에서만 쓰이지 않는다. 교통·통신·의료·주거·행정 등 민간 생활 속에도 전쟁 100년 동안 발전한 기술이 자연스럽게 스며들었다.",items:[["통신","도시권 고신뢰 통신망과 경보체계가 통합되어 있다."],["교통","자율운행과 회랑 관리기술이 일상 교통에 적용된다."],["의료","전장 의료기술의 발전이 민간 응급의료에도 영향을 주었다."]]}
};

export function initLife(){
  const root=document.querySelector("#lifeArchive");if(!root)return;
  const sceneButtons=[...root.querySelectorAll("[data-life-scene]")];
  const topicButtons=[...root.querySelectorAll("[data-life-topic]")];
  const scene=root.querySelector("#lifeScene"),time=root.querySelector("#lifeTime"),sub=root.querySelector("#lifeSub"),title=root.querySelector("#lifeTitle"),body=root.querySelector("#lifeBody");
  const place=root.querySelector("#lifePlace"),state=root.querySelector("#lifeState"),note=root.querySelector("#lifeNote");
  const featureTitle=root.querySelector("#lifeFeatureTitle"),featureCopy=root.querySelector("#lifeFeatureCopy"),featureList=root.querySelector("#lifeFeatureList");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

  function selectScene(key){
    const d=SCENES.find(x=>x.key===key)||SCENES[0];
    sceneButtons.forEach(b=>b.classList.toggle("active",b.dataset.lifeScene===d.key));
    time.textContent=d.time;sub.textContent=d.sub;title.textContent=d.title;body.textContent=d.body;
    place.textContent=d.place;state.textContent=d.state;note.textContent=d.note;scene.dataset.scene=d.key;
    scene.querySelector(".life-scene-word").textContent=d.key==="alert"?"ALERT":"2134";
    scene.querySelector(".life-scene-tag span").textContent=d.key==="alert"?"민방위 기록":"생활 기록";
    scene.querySelector(".life-scene-tag b").textContent=d.key==="alert"?"주의 단계":"정상 생활권";
    if(!reduced){scene.animate([{opacity:.35,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:260,easing:"cubic-bezier(.2,.75,.2,1)"})}
  }

  function selectTopic(key){
    const d=TOPICS[key]||TOPICS.city;
    topicButtons.forEach(b=>b.classList.toggle("active",b.dataset.lifeTopic===key));
    featureTitle.textContent=d.title;featureCopy.textContent=d.copy;
    featureList.innerHTML=d.items.map(([a,b])=>`<article><span>${a}</span><b>${b}</b></article>`).join("");
    if(!reduced)root.querySelector(".life-feature").animate([{opacity:.35,transform:"translateY(7px)"},{opacity:1,transform:"none"}],{duration:240,easing:"ease-out"});
  }

  sceneButtons.forEach(b=>b.addEventListener("click",()=>selectScene(b.dataset.lifeScene)));
  topicButtons.forEach(b=>b.addEventListener("click",()=>selectTopic(b.dataset.lifeTopic)));
  window.addEventListener("archive:record-opened",e=>{if(e.detail?.key==="life")setTimeout(()=>selectScene("commute"),80)});
  selectScene("commute");selectTopic("city");
}
