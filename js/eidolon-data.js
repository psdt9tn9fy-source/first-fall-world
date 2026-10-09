/* EIDOLON reference data. UI logic is in eidolon.js. */
export const CLASSES=[
  {key:"swarm",mark:"I",name:"스웜",ko:"SWARM",scale:"소형 / 대량생산",role:"정찰 / 침투 / 집단전",brief:"소형 양산형. 정찰·침투·집단전에 특화된 기본 분류.",risk:"D급 // 표준",riskKey:"D"},
  {key:"hunter",mark:"II",name:"헌터",ko:"HUNTER",scale:"중형",role:"추적 / 근접전 / 도심",brief:"중형 추적개체. 근접전과 도심전에서 높은 위협을 보이는 분류.",risk:"C급 // 표준",riskKey:"C"},
  {key:"brute",mark:"III",name:"브루트",ko:"BRUTE",scale:"전차급",role:"중장갑 / 직접 돌격",brief:"전차급 중장갑 개체. 강한 장갑과 직접적인 전투압력을 특징으로 하는 분류.",risk:"B급 // 표준",riskKey:"B"},
  {key:"dominion",mark:"IV",name:"도미니언",ko:"DOMINION",scale:"지휘형",role:"지휘 / 전술 통제",brief:"주변 개체와 전술을 통제하는 지휘형. 단독 전투력뿐 아니라 전장 전체에 영향을 준다.",risk:"A급 // 표준",riskKey:"A"},
  {key:"ark",mark:"V",name:"아크",ko:"ARK",scale:"수십~수백 m",role:"전략 개체 / 도시급 위협",brief:"수십~수백 m급 전략개체. 도시급 위협으로 분류되며 S급 작전위험 대응 대상이 될 수 있다.",risk:"S급 대응",riskKey:"S"},
  {key:"seraph",mark:"?",name:"세라프",ko:"SERAPH",scale:"인간 크기 추정 / 미확인",role:"규격외 / 관측 자료 부족",brief:"I~V 분류체계 바깥에 놓인 미확인 개체. 인간과 비슷한 크기와 실루엣의 목격 보고가 있으나 확보된 실물 표본이나 검증된 신체 구조 자료는 없다.",risk:"측정 불가 // 표준 초과",riskKey:""}
];

export const NESTS={
  small:{code:"N-01",name:"소형 네스트",ko:"소형 네스트",sub:"정찰 / 감시 / 보급 전초기지",body:"정찰·감시·보급을 위한 전초기지 성격의 네스트. 방치될 경우 중형 네스트로 성장할 수 있다."},
  medium:{code:"N-02",name:"중형 네스트",ko:"중형 네스트",sub:"지역 통제 / 생산·수리 / 보급",body:"도시권과 전략지역을 통제하는 중형 네스트. 혼합 에이돌론 전력을 운용하며 생산·수리·보급 기능을 통해 점령지를 유지한다."},
  grand:{code:"N-03",name:"대형 네스트",ko:"대형 네스트",sub:"지역 전선 거점 / 전략급",body:"광역 전선을 지배하는 초대형 거점. 주변 네스트에 병력과 정보를 공급하며 국가급 또는 I.D.A. 연합작전이 요구될 수 있다."}
};
