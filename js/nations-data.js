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
  }
};
