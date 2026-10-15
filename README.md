# 한샘몰 랜딩 클론

원본: https://store.hanssem.com/ · 관찰일: 2026-10-15

## Vercel 배포

Vercel에서 GitHub 저장소 `reallygood83/hansaem`을 Import하세요.

| 설정 | 값 |
| --- | --- |
| Framework Preset | Other |
| Root Directory | 저장소 루트 (`./`) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 24.x |
| 환경변수 | 필요 없음 |

`vercel.json`에 빌드·출력 경로·클라이언트 경로 rewrite를 포함했습니다. 상품 상세, 카테고리, 검색, 장바구니에서 직접 접속하거나 새로고침할 수 있습니다. `server.mjs`는 로컬 개발용이며 Vercel에서는 정적 파일을 배포합니다.

```sh
npm run build
```

빌드 결과에는 화면 파일 4개와 `assets/`만 포함합니다. 수집 스크립트·원본 DOM·분석 자료·검증 스크립트는 배포하지 않습니다. Node.js 기본 모듈을 사용하므로 추가 패키지나 API 키가 필요하지 않습니다.

설정 참고: [Vercel 공식 프로젝트 설정](https://vercel.com/docs/project-configuration).

## 실행

```sh
cd /Users/moon/Documents/Codex/hanssem-clone
node server.mjs
```

브라우저: http://127.0.0.1:4173/
포트 변경: `PORT=4174 node server.mjs`

프레임워크·npm 설치 없이 Node.js 기본 모듈만으로 실행합니다. 이미지 47장과 로고·폰트를 로컬에 포함했습니다.

## 구현

- 원본의 전체 화면 사진 배너 7개, 흰색 로고, 문구·폰트·치수·세로 페이지 표시 재현
- 5초 자동 전환, 일시정지, 휠·키보드·터치 전환, 표시 버튼, 고객센터 화면
- 가구/홈리빙·인테리어 메뉴를 마우스 또는 키보드 포커스로 펼침
- 원본 공개 자료의 상품 40개: 검색, 최근 검색어, 카테고리 필터, 가격 정렬, 상세
- 찜·수량 선택·장바구니 담기/수정/삭제와 새로고침 후 브라우저 저장 유지
- 로컬 기획전·인테리어 탐색과 원본 상세/기획전 링크
- 모바일 화면 조정, 모달의 Escape 닫기·포커스 관리, 모션 감소 설정 대응

## 범위

첫 랜딩의 시각 재현이 중심입니다. 상품·인테리어 후속 화면은 공개 데이터를 사용하는 로컬 데모로 구현했습니다. 실제 회원 인증·주문·결제·쿠폰 발급·상담 접수·매장 검색 API는 연결하지 않았습니다. 해당 버튼은 이 한계를 명시한 안내와 원본 링크를 표시합니다. 상품 옵션·재고를 임의로 생성하지 않습니다.

상품·가격·리뷰·혜택은 관찰일의 공개 스냅샷입니다. 현재 판매 조건을 보장하지 않습니다. 이미지와 로고의 권리는 원 권리자에게 있으며, 이 결과물은 비공식 로컬 재현본입니다.

## 검증 자료

- `evidence/reference.png`: 원본 1440×900
- `evidence/clone-desktop.png`: 클론 1440×900
- `evidence/clone-mobile.png`: 클론 390×844
- `evidence/catalog-desktop.png`, `evidence/catalog-mobile.png`: 상품 화면
- `evidence/qa.json`: 실행 검증 결과
- `evidence/source-summary.md`: 관찰·정적 분석·구현 선택·미확인 범위
- `.omx/state/hanssem-clone/ralph-progress.json`: 로컬 수동 시각 비교 판정 (Git 제외)

`node verify.mjs`는 현재 컴퓨터의 Codex 번들 Playwright와 설치된 Chrome으로 검증합니다. 실행 중인 로컬 서버가 필요합니다. 다른 컴퓨터에서는 이 스크립트의 Playwright 경로와 Chrome 경로를 조정해야 합니다.

`prepare-assets.mjs`는 최초 수집용 보조 스크립트이며 `/tmp/hanssem-reference.html`, `/tmp/hanssem-furnishing.html`의 원본 응답을 입력으로 사용합니다. 일반 실행·수정에는 필요하지 않습니다. `capture-reference.mjs`는 원본 화면 관찰용이며 원본 사이트 변경에 영향을 받습니다.
