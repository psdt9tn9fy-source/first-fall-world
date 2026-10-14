/* Nation chronology terms and registered state dossiers. */
export const HISTORY_TERMS={
  rok:["서울","부산","평양","백두","SEOUL","BUSAN","PYONGYANG","BAEKDU"],
  afu:["뉴욕","알래스카","NEW YORK","ALASKA"],
  jpn:["도쿄","오사카","TOKYO","OSAKA"],
  crf:["난징","상하이","NANJING","SHANGHAI"],
  ncdr:["베이징","화북","BEIJING","NORTH CHINA"],
  wur:["청두","CHENGDU"],
  rus:["블라디보스토크","시베리아","VLADIVOSTOK","SIBERIA"],
  edc:["브뤼셀","유럽","파리","라인","바르샤바","BRUSSELS","EUROPE","PARIS","RHINE","WARSAW"],
  cadc:["알마티","카자흐","ALMATY","KAZAKH"],
  medc:["카이로","수에즈","앙카라","CAIRO","SUEZ","ANKARA"],
  ind:["뉴델리","인도","NEW DELHI","INDIA"],
  bra:["리우","아마존","RIO","AMAZON"],
  aus:["호주","시드니","AUSTRALIA","SYDNEY"],
  can:["북극","ARCTIC"],
  mex:["멕시코","MEXICO"],
  sea:["마닐라","MANILA"],
  afr:["아프리카","AFRICA"]
};


export const STATE_RECORDS={
  rok:{
    governance:{
      type:"공화국 / 민간정부",
      ko:"공화국 · 민간정부",
      note:"제1강하 이후에도 민간 국가체제를 유지했다. 장기전으로 군의 영향력은 커졌지만 행정부·입법부·사법부가 국가 운영의 기본 축으로 존속한다.",
      executive:"대통령 · 행정부",
      legislature:"국회",
      judiciary:"사법부",
      balance:"민간 권력 균형"
    },
    society:{
      civil:"민간행정 유지",
      military:"높음",
      zone:"서울 안전권 / SAFE ZONE",
      note:"안전권에서는 민간의 일상과 교육·산업·행정이 지속된다. 동시에 군 경력·계급·출신 교육기관은 중요한 사회적 자산으로 기능한다."
    },
    defense:{
      doctrine:"적응형 전투체계",
      command:"국가 → 합동 → 작전 → 현장",
      status:"전쟁 중 / 103년째",
      note:"국가 지휘부에서 합동지휘부·작전사령부·현장지휘부로 이어지는 다층 구조를 운용한다. 세부 편제는 작전 환경과 전선에 따라 조정된다."
    },
    institution:{
      name:"중앙사관학교",
      eng:"중앙사관학교",
      class:"제76기",
      location:"서울",
      role:"정예 장교 양성",
      status:"국가 최상위",
      note:"대한민국 장교 교육의 최상위 엘리트 코스. 학교와 출신 기수는 장기전 시대의 군 경력에서 강한 영향력을 가진다."
    }
  },
  rus:{
    governance:{
      type:"대통령 중심 연방공화국 / 전시 헌정",
      ko:"연방공화국 · 전시 국정조정",
      note:"2134년의 러시아 연방은 대통령·연방정부·연방의회와 사법체계를 유지한다. 제1강하 이후 안보회의와 지역 방위당국의 조정 권한이 커졌지만, 군이 민간행정을 전면 대체한 국가는 아니다.",
      executive:"대통령 · 연방정부 · 안보회의",
      legislature:"연방의회 / 연방평의회 · 국가두마",
      judiciary:"헌법재판 · 연방법원",
      balance:"중앙·지역·군의 전시 권한 조정"
    },
    society:{
      civil:"도시·철도 회랑별 민간행정 유지",
      military:"높음 / 지역별 편차",
      zone:"모스크바 · 시베리아 · 극동 연결회랑",
      note:"모스크바와 주요 도시, 자원지대, 철도·군수 회랑에서 생활권을 유지한다. 러시아어가 일상 언어이며, I.D.A. 합동작전에서는 영어를 공용 교신어로 사용한다는 연합군 설정을 적용한다. 자동 통역은 보조수단이며 전투 명령은 표준 용어로 확인한다."
    },
    defense:{
      doctrine:"기갑·기동전 / 철도·극지 방위",
      command:"대통령 → 국방부·총참모부 → 전략방위군관구 → 제병협동군·야전부대",
      status:"전쟁 중 / 103년째",
      note:"지상군·항공우주군·해군과 지원 전력이 국가 지휘체계 아래 운용된다. 동부 및 북부 회랑에 중장비·기동예비·극지 대응 전력을 집중하며, 러시아 고유 계급체계를 유지한다(лейтенант 중위급 장교, капитан 대위, майор 소령 등). I.D.A. 파견 부대는 협정에 따른 연합작전 통제를 받되 러시아의 인사·행정 권한은 존속한다."
    },
    institution:{
      name:"극동전략지휘사관학교",
      eng:"Дальневосточное высшее стратегическое командное училище",
      class:"4년 장교 양성과정",
      location:"블라고베셴스크 · 아무르주",
      role:"제병협동·극지·대에이돌론 전술 장교교육",
      status:"2081년 개편 / 가상 후계기관",
      note:"실존했던 블라고베셴스크 극동고등제병협동지휘학교의 전통을 계승해, 2081년 극동전략지휘사관학교로 개편됐다는 가상 설정. 아나스타시야 볼코바는 2125년 입교·2129년 임관으로 계획한다."
    }
  }
};
