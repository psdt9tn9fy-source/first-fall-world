export const CHARACTER_COUNTRIES=[
  {key:"rok",name:"대한민국",nationKeys:["rok"]},
  {key:"jpn",name:"일본",nationKeys:["jpn"]},
  {key:"china",name:"중국",nationKeys:["crf","ncdr","wur"],note:"중화재건연방 · 화북방위공화국 · 서부연합공화국"},
  {key:"afu",name:"아메리카 연방연합",nationKeys:["afu"]},
  {key:"rus",name:"러시아 연방",nationKeys:["rus"]},
  {key:"edc",name:"유럽방위공동체",nationKeys:["edc"]},
  {key:"ind",name:"인도공화국",nationKeys:["ind"]},
  {key:"can",name:"캐나다",nationKeys:["can"]},
  {key:"mex",name:"멕시코",nationKeys:["mex"]},
  {key:"bra",name:"브라질",nationKeys:["bra"]},
  {key:"aus",name:"호주",nationKeys:["aus"]},
  {key:"sea",name:"동남아시아 방위협력권",nationKeys:["sea"]},
  {key:"afr",name:"아프리카 방위협력권",nationKeys:["afr"]},
  {key:"cadc",name:"중앙아시아 공동방위체",nationKeys:["cadc"]},
  {key:"medc",name:"중동 공동방위체",nationKeys:["medc"]}
];
export const CHARACTER_ORDER=["seorin","chaeryeong"];

export const CHARACTERS={
  chaeryeong:{
    id:"chaeryeong",
    record:"002",
    name:"윤채령",
    hanja:"尹采鈴",
    roman:"YOON CHAE-RYEONG",
    visualCode:"65TH // MAJOR",
    heroMeta:"2134 / ROK ARMY · MAJOR",
    personTitle:"가벼운 장난, 먼 진심.",
    careerTitle:"전장의 실력주의자.",
    linksTitle:"전선과 일상.",
    institution:"대한민국 육군 · 제7기동대응여단",
    relatedNote:"제7기동대응여단 직할 기동타격대장 · 인천 송도 거주",
    accent:"#c46c92",
    image:null,
    visuals:[
      {src:"./assets/caveduck-yoon-chaeryeong.webp",label:"인물",detail:"육군 소령 윤채령"},
      {src:"./assets/caveduck-yoon-chaeryeong.webp",label:"평소",detail:"여유로운 표정과 오른팔 타투"},
      {src:"./assets/caveduck-yoon-chaeryeong.webp",label:"군복",detail:"제7기동대응여단 기동타격대장"},
      {src:"./assets/yoon-chaeryeong-sd.webp",label:"SD",detail:"윤채령 SD 일러스트"}
    ],
    nation:"대한민국",
    nationKey:"rok",
    affiliation:"대한민국 육군 · 소령",
    position:"제7기동대응여단 직할 기동타격대장",
    summary:"31세에 소령 계급장을 단 기동타격대장. 평소에는 능글맞고 장난스럽지만, 작전이 시작되면 냉정한 지휘관으로 돌변한다.",
    facts:[
      ["나이","31세"],
      ["출생","2103년"],
      ["신장","178cm"],
      ["출신","중앙사관학교 제65기"]
    ],
    glance:{
      identity:"검은 머리 · 나른한 눈매 · 오른팔 전체 타투",
      personality:[
        ["첫인상","능글맞음 · 장난기"],
        ["취향","귀여운 사람에게 약함"],
        ["거리감","호감과 진심은 별개"],
        ["작전 중","침착 · 단호한 판단"]
      ],
      career:[
        ["2126","중앙사관학교 제65기 소위 임관"],
        ["2133","에이돌론 대응 작전 공적 · 소령 조기 진급"],
        ["2134","제7기동대응여단 직할 기동타격대장"],
        ["전문","사격 · 시가전 지휘"]
      ]
    },
    panels:{
      basic:{
        title:"기본정보",
        lead:"대한민국 육군 소령 · 제7기동대응여단 직할 기동타격대장.",
        blocks:[
          ["출신","중앙사관학교 제65기"],
          ["외형","검은 머리, 나른한 눈매, 오른팔 풀슬리브 타투."],
          ["사복","검은 나시와 블랙 슬랙스 등 세련된 스타일."],
          ["거주","인천 송도 펜트하우스"]
        ]
      },
      personality:{
        title:"성격",
        lead:"누구에게나 여유롭고 능글맞지만, 호감과 진심 사이에는 분명한 거리를 둔다.",
        blocks:[
          ["평소","장난스럽고 사교적이며 상대를 놀리는 데 능숙하다."],
          ["취향","귀엽고 매력적인 사람에게 관심을 보인다."],
          ["관계","호감이 생기더라도 쉽게 깊은 관계로 발전시키지 않는다."],
          ["작전","위험한 상황에서는 냉정하고 책임감 있는 지휘관이 된다."]
        ]
      },
      career:{
        title:"경력",
        lead:"사격과 시가전 지휘 실력을 인정받아 전시 공적으로 조기 진급했다.",
        blocks:[
          ["2126","중앙사관학교 제65기 졸업 및 소위 임관."],
          ["2133","에이돌론 대응 작전 공적으로 소령 조기 진급."],
          ["2134","제7기동대응여단 직할 기동타격대장으로 복무."],
          ["분야","사격 · 시가전 지휘"]
        ]
      },
      relations:{
        title:"연결 기록",
        lead:"대한민국 육군의 기동타격대장. 전장 밖에서는 송도에 거주하며 개인 스포츠카로 출퇴근한다.",
        blocks:[
          ["대한민국","국가 및 국방 기록으로 연결."],
          ["소속","제7기동대응여단 직할 기동타격대."],
          ["일상","인천 송도 거주 · 개인 스포츠카 출퇴근."]
        ]
      }
    }
  },
  seorin:{
    id:"seorin",
    record:"001",
    name:"한서린",
    hanja:"",
    visualCode:"76TH // CADET",
    roman:"HAN SEO-RIN",
    personTitle:"서툰 다정함.",
    careerTitle:"가문보다 실력.",
    linksTitle:"세계와의 연결.",
    institution:"중앙사관학교",
    relatedNote:"명문 군인가문 출신 · 개별 인물 관계 미공개",
    accent:"#315ee8",
    image:null,
    visuals:[
      {src:"./assets/characters/han-seorin-main.webp",label:"전장",detail:"전신·작전 현장"},
      {src:"./assets/characters/han-seorin-casual.webp",label:"사복",detail:"일상복"},
      {src:"./assets/characters/han-seorin-salute.webp",label:"경례",detail:"정복·경례"},
      {src:"./assets/characters/han-seorin-portrait.webp",label:"인물",detail:"정복·상반신"}
    ],
    nation:"대한민국",
    nationKey:"rok",
    affiliation:"중앙사관학교 제76기",
    position:"2학년 생도",
    summary:"말수가 적고 침착하며 쉽게 거리를 좁히지 않는다. 하지만 신뢰한 사람 앞에서는 의외로 서툴고 솔직한 면이 드러난다.",
    facts:[
      ["나이","20세"],
      ["생년월일","2114.01.17"],
      ["신장 / 체중","168cm / 50kg"],
      ["혈액형","AB형"]
    ],
    glance:{
      identity:"외동딸 · 청흑색 단발 · 회흑색 눈",
      personality:[
        ["첫인상","침착 · 거리감"],
        ["내면","맹한 면 · 표현 서툼"],
        ["신뢰 이후","챙김 · 당황하면 홍조"],
        ["관계","질투 · 애착"]
      ],
      career:[
        ["2133","19세, 중앙사관학교 입교"],
        ["2134","제76기 2학년 생도"],
        ["가문","군인 명문가 출신"],
        ["지향","후광보다 개인의 실력"]
      ]
    },
    panels:{
      basic:{
        title:"기본정보",
        lead:"대한민국 중앙사관학교 제76기 2학년 생도.",
        blocks:[
          ["신분","중앙사관학교 생도 · 제76기 · 2학년"],
          ["가족","외동딸"],
          ["외형","턱선의 청흑색 단발, 회흑색 눈. 흐트러진 제복을 싫어한다."],
          ["체형","168cm · 50kg · 슬림 체형"]
        ]
      },
      personality:{
        title:"성격",
        lead:"겉으로는 냉정하고 침착하지만, 가까워질수록 전혀 다른 결이 드러난다.",
        blocks:[
          ["겉모습","말수가 적고 침착하다. 낯선 사람에게는 일정한 거리감을 유지한다."],
          ["내면","은근히 맹한 면이 있고 감정 표현에 서툴다."],
          ["신뢰 이후","말투가 조금 풀리고 챙김이 늘어난다. 당황하면 얼굴에 티가 나는 편."],
          ["관계 성향","신뢰가 깊어질수록 질투와 애착도 분명해진다."]
        ]
      },
      career:{
        title:"경력",
        lead:"명문 군인가문 출신이지만 후광보다 자신의 실력으로 평가받는 것을 원한다.",
        blocks:[
          ["2133","19세에 대한민국 중앙사관학교 입교."],
          ["2134","제76기 2학년 생도 과정 이수 중."],
          ["가문","군 경력이 강한 명문가 출신."],
          ["지향","가문의 이름이 아니라 개인의 성과와 실력으로 인정받는 것을 중시."]
        ]
      },
      relations:{
        title:"관계",
        lead:"공개 인물 기록은 아직 한서린을 중심으로 시작된다.",
        blocks:[
          ["가족","명문 군인가문. 상세 가족기록은 비공개."],
          ["동기","공개된 개별 관계 기록 없음."],
          ["추가 인물","새 캐릭터가 등록되면 관계 기록이 이곳에 연결된다."]
        ]
      },
      records:{
        title:"연결 기록",
        lead:"인물 정보에서 국가와 군사체계 기록으로 바로 이동할 수 있다.",
        blocks:[
          ["대한민국","세계 질서의 대한민국 국가 기록과 연결."],
          ["중앙사관학교","군사체계의 장교 교육기관 기록과 연결."],
          ["제76기","2134년 중앙사관학교 2학년 생도 기수."]
        ]
      }
    }
  }
};
