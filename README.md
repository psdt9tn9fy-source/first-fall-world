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

## 코드 구조 및 정적 검증

- `js/eidolon-data.js`: 개체·네스트 설정의 단일 소스
- `js/eidolon.js`: 화면 조작 및 3D 연결
- `js/eidolon-records.js`: 상세 분석, 작전위험도 공통 게이지
- `js/eidolon-3d.js`: 3D 개체 등록과 카메라 동작
- `css/intro.css`, `css/eidolon-records.css`: 선언을 바꾸지 않고 서식만 정리
- 검증 명령: `node scripts/check-project.mjs`. 브라우저 시각·상호작용 검증은 별도.

## 모듈 경계 (2026-10-08)

- `js/eidolon-records.js`: 개체기록 탭 전환 및 서브 컨트롤러의 생성·해제만 담당
- `js/eidolon-records-profile.js`: 식별 화면, 재분석, 세라프 식별불가
- `js/eidolon-records-behavior.js`: 학습/적응 진행 애니메이션
- `js/eidolon-records-nest.js`: 네스트 도식 상태 및 스캔 제어. 향후 네스트 3D 구현은 여기에서 연계
- `js/eidolon-records-risk.js`: 위험도 D~S 및 세라프 규격외 표시
- `css/eidolon*.css`: 공통 화면, 3D, 상세정보, 분석 HUD, 3D 조작 UI로 구분
- `css/eidolon-records*.css`: 기록 공통, 행동, 네스트, 교전, 개체 식별, 가독성 보정으로 구분

CSS 파일들의 **연결 순서를 유지**해야 기존 디자인 우선순위가 보존됩니다. `scripts/check-project.mjs`는 기존 CSS와 분리된 CSS의 연결 결과가 동일한지 검사합니다. 의도적으로 디자인을 수정할 때만 검증 스냅샷을 변경하세요.

`backup/before-modular-refactor-20261008` 브랜치에는 구조 변경 전의 파일이 보존돼 있습니다.

### 검증 추가사항

`node scripts/check-project.mjs`은 이제 모든 로컬 JS 모듈 참조, CSS 로드 경로, 분리한 지도 투영 함수와 공유 국기 URL까지 확인합니다. 국가·세계 CSS는 원본 내용을 유지하면서 기능별 파일로 분리했고, 검사기에서 원본과 합본 체크섬·연결 순서를 검증합니다.

## 세라프 관측 화면 (2026-10-09)

- `assets/eidolon/seraph-silhouette.webp`: 이전에 생성한 실루엣을 최적화한 760px 웹 이미지. 목격 자료의 비검증 재구성이며 확정된 실물 이미지가 아님.
- `js/eidolon-seraph.js`: 외형·내부·통신 기록의 표시 전환, 참고 이미지의 신호 연출.
- `css/eidolon-seraph.css`: 세라프 전용 색감·실루엣·간헐적 오류·모바일·동작 감소 지원.
- 포획 표본이 없는 설정을 반영해 기존 코어/네트워크의 일반 기록을 세라프에 그대로 적용하지 않음.
- 위험도는 규격외/측정 불가 유지. 다른 에이돌론 3D 모델 5개는 유지.

### 세라프 규격외 기록 전용 인터페이스 (2026-10-09)

- `js/eidolon-records-seraph.js`는 세라프의 목격 자료 분류·탭 레이블과 변경 시 효과만 담당하며 표준 기록을 수정하지 않는다.
- `css/eidolon-records-seraph.css`는 `seraph-mode`에서만 별도의 기록 패널을 표시한다.
- 일반 에이돌론의 행동 적응 단계, 네스트 연결 그래프, D–S 미터는 세라프에게 적용하지 않는다. 측정 불가는 S급 수치와 같지 않다.
- 실루엣은 목격 내용을 재구성한 비검증 자료다. 교차검증되지 않은 사건·능력·네스트 연결을 사실로 표현하지 않는다.
- 일반 분류로 전환하면 기존 4개 탭과 실측/분류 데이터 표시로 복귀한다.

### N-01 소형 네스트 3D 정찰 (2026-10-09)

- `js/eidolon-nest-recon.js` / `css/eidolon-nest-recon.css`: 3D 모델 lazy-loading, 위성 정찰 재구성 애니메이션, TACTICAL/LIDAR/THERMAL 화면 모드.
- 정식 GLB 저장 위치: **`assets/nest/small.glb`** (GitHub Pages 정적 파일). 원본을 웹용으로 최적화한 GLB를 이 경로에 업로드하면 자동 표시된다.
- 아직 GLB가 업로드되지 않았다면 로컬 GLB 미리보기 버튼을 통해 자신의 컴퓨터/모바일에서 일시적으로 모델을 로드할 수 있다. 이 동작은 서버에 업로드하거나 저장하지 않는다.
- N-02/N-03 기존 네트워크 그래프와 SERAPH 미확인 네스트 기록은 그대로 유지한다.
- 화면의 LIDAR/THERMAL 필터와 재구성 퍼센트는 시각적 효과이며 실제 측정된 수치가 아니다.

### 실제 네스트 메시 기반 LIDAR 재구성 (2026-10-09)

- `js/eidolon-nest-lidar.js` extracts up to 3300 sampled 3D vertices and 1550 real mesh triangles from uploaded N-01 GLB without another WebGL renderer; no synthetic points are fabricated.
- Canvas overlay uses <model-viewer>'s current camera orbit, zoom, and target to project 3D points and wire segments while the model is rotated.
- Entry: sparse topographic points → mesh wire segment reconstruction → gradually visible textured model. LIDAR mode continues to show mesh-derived point/line scanning.
- Scanning is paused when tab is hidden; mobile caps pixel density. Reduced-motion skips the animated entrance.
- This is a **geometry-based visual reconstruction effect**, not actual orbiting satellite/thermal measurement.

### N-01 LIDAR 잔상 방지 (2026-10-09)

- Automatically rotating the model is disabled during the scan sequence and while **LIDAR** is selected; rotation resumes in normal TACTICAL/THERMAL after the scan.
- When the user manually turns/zooms the model, the independent 2D point canvas is hidden immediately and redrawn after camera motion settles (145 ms), avoiding visibly detached stale points.
- LIDAR mode no longer draws the textured model simultaneously; its geometry-derived canvas remains interactive through the transparent viewer.
- Unnecessary canvas opacity transitions removed; CSS changes are scoped solely to N-01.
