export const ZONE_LABEL={safe:"SAFE",contested:"CONTESTED",lost:"LOST",black:"BLACK"};

export const ERA={
  "2031":{state:"FIRST DESCENT // SYSTEMIC COLLAPSE",note:"제1강하. 에이돌론 출현과 함께 전 지구적 혼란이 시작되었다."},
  "2041":{state:"GREAT WAR // GLOBAL MOBILIZATION",note:"대전쟁기. 도시 요새화와 장기 방위체계가 세계 곳곳에서 정착하기 시작했다."},
  "2071":{state:"COUNTEROFFENSIVE // TERRITORY RECOVERY",note:"인류 반격기. 상실지역 일부에 대한 회복작전과 민간 귀환계획이 확대된다."},
  "2101":{state:"RECONSTRUCTION // STALEMATE",note:"재건·고착기. 회복된 생활권과 장기 전선이 동시에 고착된다."},
  "2134":{state:"CURRENT RECORD // STALEMATE",note:"현재 세계 기록. 국가와 도시의 일상은 존속하지만 전쟁은 103년째 계속되고 있다."}
};

export const SECTORS=[
  {id:"SEO",name:"SEOUL CORE",ko:"서울 핵심 생활권",zone:"safe",lon:126.978,lat:37.5665,record:"nations",nation:"rok",body:"대한민국의 수도이자 주요 SAFE 생활권. 국가 행정과 군사 지휘체계가 집중되어 있다."},
  {id:"PYO",name:"PYONGYANG SAFE ZONE",ko:"평양 SAFE ZONE",zone:"safe",lon:125.7625,lat:39.0392,record:"nations",nation:"rok",body:"2079년 SAFE ZONE으로 지정된 북부 핵심 거점. 민간 거주구역과 대학지구가 단계적으로 확대되었다."},
  {id:"TYO",name:"TOKYO–OSAKA CORRIDOR",ko:"도쿄–오사카 생활권",zone:"safe",lon:137.7,lat:35.3,record:"nations",nation:"jpn",body:"일본의 핵심 도시·교통축. 장기전 이후에도 민간 생활과 해양 방위체계를 함께 유지한다."},
  {id:"NKG",name:"NANJING RECONSTRUCTION ZONE",ko:"난징 재건권",zone:"safe",lon:118.7969,lat:32.0603,record:"nations",nation:"crf",body:"2050년 탈환 이후 재건된 중국 동부 핵심권. 중화재건연방의 산업·행정 중심 중 하나다."},
  {id:"BRU",name:"BRUSSELS COMMAND ZONE",ko:"브뤼셀 공동전구 지휘권",zone:"safe",lon:4.3517,lat:50.8503,record:"nations",nation:"edc",body:"유럽 공동방위체계의 주요 지휘·기록 거점. 다국가 전구 조정 기능을 담당한다."},
  {id:"SYD",name:"SYDNEY PACIFIC NODE",ko:"시드니 태평양 후방거점",zone:"safe",lon:151.2093,lat:-33.8688,record:"nations",nation:"aus",body:"태평양 방위권의 주요 후방 거점. 군수·훈련·민간 항로를 연결하는 안정 통제지역이다."},
  {id:"BAE",name:"BAEKDU BLACK ZONE",ko:"백두 BLACK ZONE",zone:"black",lon:128.08,lat:42.01,record:"eidolon",body:"반복적인 봉쇄작전이 기록된 고위험 구역. 접근과 장기 정찰 데이터는 제한적으로 공개된다."},
  {id:"AMZ",name:"AMAZON BLACK ZONE",ko:"아마존 BLACK ZONE",zone:"black",lon:-60.0,lat:-3.0,record:"eidolon",body:"다수의 탐사·회복작전 기록이 남은 대규모 위험권. 브라질은 이 지역 대응 경험을 축적해왔다."}
];

export const ROUTES={
  KOR:"rok",PRK:"rok",USA:"afu",JPN:"jpn",RUS:"rus",IND:"ind",BRA:"bra",AUS:"aus",CAN:"can",MEX:"mex",
  FRA:"edc",DEU:"edc",GBR:"edc",ITA:"edc",ESP:"edc",BEL:"edc",NLD:"edc",POL:"edc",PRT:"edc",NOR:"edc",SWE:"edc",FIN:"edc",DNK:"edc",CZE:"edc",AUT:"edc",CHE:"edc",
  KAZ:"cadc",UZB:"cadc",TKM:"cadc",KGZ:"cadc",TJK:"cadc",MNG:"cadc",
  SAU:"medc",IRN:"medc",IRQ:"medc",TUR:"medc",SYR:"medc",JOR:"medc",ISR:"medc",ARE:"medc",QAT:"medc",OMN:"medc",YEM:"medc",
  IDN:"sea",MYS:"sea",PHL:"sea",VNM:"sea",THA:"sea",MMR:"sea",KHM:"sea",LAO:"sea",SGP:"sea",BRN:"sea",
  ZAF:"afr",NGA:"afr",ETH:"afr",KEN:"afr",DZA:"afr",MAR:"afr"
};

export const THEATERS=[
  {
    id:"east",code:"T-01",name:"EAST ASIA / PACIFIC",short:"EA / PAC",caption:"동아시아 · 태평양 전구",
    nodes:[
      {id:"BAE",type:"sector",x:52,y:13},
      {id:"ncdr",type:"nation",x:34,y:31},
      {id:"rok",type:"nation",x:49,y:48},
      {id:"jpn",type:"nation",x:79,y:45},
      {id:"crf",type:"nation",x:31,y:61},
      {id:"wur",type:"nation",x:12,y:72},
      {id:"sea",type:"nation",x:58,y:75},
      {id:"aus",type:"nation",x:83,y:84}
    ],
    links:[["BAE","rok"],["ncdr","rok"],["ncdr","crf"],["crf","rok"],["rok","jpn"],["crf","sea"],["sea","aus"],["jpn","aus"]]
  },
  {
    id:"eurasia",code:"T-02",name:"EURASIA",short:"EURASIA",caption:"유라시아 내륙 전구",
    nodes:[
      {id:"rus",type:"nation",x:31,y:25},
      {id:"cadc",type:"nation",x:50,y:51},
      {id:"ind",type:"nation",x:68,y:76}
    ],
    links:[["rus","cadc"],["cadc","ind"]]
  },
  {
    id:"americas",code:"T-03",name:"ATLANTIC / AMERICAS",short:"AMERICAS",caption:"북미 · 남미 전구",
    nodes:[
      {id:"can",type:"nation",x:34,y:18},
      {id:"afu",type:"nation",x:43,y:40},
      {id:"mex",type:"nation",x:38,y:65},
      {id:"bra",type:"nation",x:67,y:79},
      {id:"AMZ",type:"sector",x:79,y:56}
    ],
    links:[["can","afu"],["afu","mex"],["mex","bra"],["bra","AMZ"]]
  },
  {
    id:"emea",code:"T-04",name:"EUROPE / MENA / AFRICA",short:"EU / MENA",caption:"유럽 · 중동 · 아프리카 전구",
    nodes:[
      {id:"edc",type:"nation",x:33,y:23},
      {id:"medc",type:"nation",x:66,y:49},
      {id:"afr",type:"nation",x:43,y:78}
    ],
    links:[["edc","medc"],["edc","afr"],["medc","afr"]]
  }
];
