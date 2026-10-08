# #2134 : 군사시대

2031년 **제1강하(First Descent)** 이후 103년이 지난 2134년의 세계를 다루는 인터랙티브 세계관 아카이브입니다.

## 기록 구조

1. **세계** — 현재 전구, 세계지도, 연표, 전황
2. **인물** — 캐릭터 기록과 세계관 연결
3. **세계 질서** — 국가·정부·사회·국방·기관
4. **에이돌론** — 적성 개체 분류와 분석 기록
5. **군사** — 지휘·편제·전력·계급·배치
6. **기록** — 주요 역사 연표

PC와 모바일은 동일한 전역 하단 기록 네비게이션을 사용합니다.

## 코드 소유권

화면 수정 시 아래 역할을 지켜 중복 패치를 만들지 않습니다.

- `css/site.css` — 전역 프레임, 상단 헤더, 공통 기록 UI
- `css/record-nav.css` — PC/모바일 공용 하단 기록 네비게이션
- `css/world.css` — WORLD 데스크톱
- `css/world-mobile.css` — WORLD 모바일 전용
- `css/characters.css` — 인물 기록
- `css/nations.css` — WORLD ORDER 기본/데스크톱
- `css/nations-mobile.css` — WORLD ORDER 모바일 전용
- `css/eidolon.css` — EIDOLON 분류·스캐너·위험도
- `css/eidolon-mobile.css` — EIDOLON 모바일 코어
- `css/eidolon-records.css` — EIDOLON 개체정보·행동·네스트·교전
- `css/military.css` — MILITARY
- `js/navigation.js` — 전역 기록 이동
- `js/characters-data.js` — 캐릭터 데이터
- `js/characters.js` — 캐릭터 화면 렌더링/동작

## 유지보수 원칙

- 가독성 수정은 별도 override 파일을 만들지 않고 **해당 섹션 CSS에서 처리**합니다.
- PC/모바일 공통 기능은 중복 구현하지 않습니다.
- 캐릭터 추가는 `characters-data.js`를 우선 수정합니다.
- EIDOLON 상세 기록 스타일은 `eidolon-records.css`가 소유합니다.
- 사용하지 않는 임시 UI와 파일은 기능 교체 시 함께 삭제합니다.
- 배포 캐시 버전은 한 번의 작업 단위에서 동일한 값으로 맞춥니다.

## GitHub Pages

배포 주소:

https://psdt9tn9fy-source.github.io/first-fall-world/

## EIDOLON 3D 유지보수

- GLB 등록은 `js/eidolon-3d.js`의 `MODELS` 한 곳에서 관리합니다.
- `ei-3d-capable` CSS 상태는 모델 레지스트리에서 자동 결정합니다. 새 분류 추가 시 CSS의 모델 이름 목록을 수정하지 마세요.
- 개체별 텍스처 GLB는 화면을 열었을 때만 불러옵니다. 3D 모델이 없는 세라프는 기존 2D 스캐너를 사용합니다.
- 사용하지 않는 옛 연표 PNG 10개는 백업 브랜치 `archive/unused-event-png-20261008`에 남겨두고 배포용 브랜치에서 제외합니다.
