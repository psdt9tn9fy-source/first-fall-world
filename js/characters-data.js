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
export const CHARACTER_ORDER=["seorin"];

export const CHARACTERS={
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
