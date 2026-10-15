# 리버스엔지니어링 근거

## 대상과 경계

대상은 사용자가 지정한 `https://store.hanssem.com/`의 공개 랜딩. 2026-10-15 관찰. 원본에 로그인·주문·상담 신청 등 쓰기 작업을 수행하지 않았습니다. 본문 전체를 스크린샷 한 장으로 붙이지 않고, 원본 사진·SVG·폰트를 개별 자산으로 사용하여 HTML/CSS/JS로 재구현했습니다.

## 관찰된 사실

- Aside의 기존 한샘 탭을 열어 홈으로 이동하고 팝업 닫기와 가구/홈리빙 hover를 수행했습니다. Aside snapshot에 침실·거실·다이닝·옷장·드레스룸·키즈룸·학생방·홈오피스·홈&데코가 나타났습니다.
- Aside 초기 원본 스크린샷은 CDP 시간 초과, 원본 창은 검은 배경을 보여 별도 설치된 Chrome의 독립 세션으로 1440×900 원본 캡처를 확보했습니다. 원본의 일시적인 검은 상태를 정상 디자인으로 추정하지 않았습니다.
- 원본 HTML `__NEXT_DATA__`의 공개 `pageProps.data`에는 사진 배너 7개와 제목·부제·링크가 있습니다. 인증/게스트/트래킹 데이터는 앱 data.json에 복사하지 않았습니다.
- 원본 배포 JS index-c855449ab0a4eff5.js에서 세로 Swiper, 5000ms autoplay, 800ms speed, creative next translate [0,100%,1], mousewheel 옵션을 확인했습니다. 로고 top132px, 753.88×72px, 메뉴 간격49px, 설명 bottom64px, 배경 cover/center도 정적 구문에서 확인했습니다.
- 원본 실제 DOM/스크린샷은 `evidence/reference.png`, `evidence/reference-dom.html`에 기록했습니다. 제목은 700 40px/52px, 부제는 500 20px/28px Pretendard입니다.
- `/furnishing` 공개 HTML에서 BEST 상품 40개의 이름·이미지·가격·할인율·리뷰·배지를 추출했습니다. `/goods/644540` 원본 응답 제목이 해당 상품명과 일치함을 별도 확인했습니다.

## REA

Aside 127.0.0.1:45103 포트는 인증된 서비스 포트여서 REA `list_browser_targets`는 `invalid_endpoint_response`로 실패했습니다. 연결 설정을 임의로 바꾸지 않았습니다.

대신 배포된 index.js를 내려받아 REA `analyze_javascript_application`의 summary 분석을 수행했습니다.

- Parent Evidence: `ev_1d1e085875ad8d7669190b7ad794eb2752a36390d972a7ac77a173f42cc7cd1e`
- Summary Evidence: `ev_486e3a0ef341e4306f15871fa2182e52904a2fc2c5ae6d177afffc29395d3378`
- SHA-256: `3d0e73d1349de86f221266096207f50338b34c79d7b7d58bb0c658df05f6c7d5` (directory artifact)
- 1 JS file, 12 modules, 8344 AST nodes, 53 findings, 0 parse failures
- 범위는 내려받은 랜딩 번들 한 개뿐이며 application coverage는 partial, semantic coverage unknown입니다. 실행 관찰은 REA 정적 분석의 결과가 아니라 별도 Aside/Chrome 결과입니다. 정적 구문에서 보이는 설정이 전체 백엔드 동작을 증명하지 않습니다.

## 구현 선택과 미확인

- 의존성을 추가하지 않고 브라우저 표준 API·CSS로 슬라이더와 로컬 경로를 구현했습니다.
- 원본의 full page 사진·로고·폰트·제목을 사용했고 hover 카테고리를 재현했습니다.
- 원본 후속 사이트 전체를 복제한 것은 아닙니다. 로컬 상품 목록·상세·장바구니·찜은 실제 사용할 수 있는 데모 구현입니다.
- 모바일은 별도 반응형 구현이며 `m.store.hanssem.com`과 픽셀 비교하지 않았습니다.
- 서버 인증·실시간 검색 API·상품 옵션·로그인·주문·결제·쿠폰 발급·매장 API·상담 접수는 범위에 포함하지 않았습니다. 기능처럼 보이는 가짜 성공 메시지를 표시하지 않습니다.
- 시각 점수는 사람이 보는 방식의 모델 평가이며 자동 측정된 유사도 수치가 아닙니다.
