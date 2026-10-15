const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const dataResponse = await fetch('/data.json');
if (!dataResponse.ok) throw new Error('화면 데이터를 불러오지 못했습니다.');
const { banners, menu, products } = await dataResponse.json();
const groups = menu.sectionMenuList;
const money = value => Number(value).toLocaleString('ko-KR');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
let cart = readStorage('hanssem-demo-cart', []);
let wishes = readStorage('hanssem-demo-wishes', []);
let recent = readStorage('hanssem-demo-search', []);
cart = Array.isArray(cart) ? cart.filter(x => x && typeof x === 'object' && products.some(p => p.id === x.id) && Number.isInteger(x.qty) && x.qty > 0 && x.qty <= 99) : [];
wishes = Array.isArray(wishes) ? wishes.filter(id => products.some(p => p.id === id)) : [];
recent = Array.isArray(recent) ? recent.filter(x => typeof x === 'string').slice(0,5) : [];
let slideIndex = 0, timer, wheelLock = 0, touchY = null, playing = true, toastTimer;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) playing = false;
const paths = {
  search:'<circle cx="12" cy="12" r="8.3"/><path d="m18.3 18.3 5.5 5.5"/>',
  login:'<path d="M10 4h12v20H10v-5M3 14h14m-5-5 5 5-5 5"/>',
  pin:'<path d="M21.5 11c0 6-7.5 13-7.5 13S6.5 17 6.5 11a7.5 7.5 0 1 1 15 0Z"/><circle cx="14" cy="11" r="2.6"/>',
  bag:'<path d="m7 9-2 15h18L21 9H7Z"/><path d="M10 9V6a4 4 0 0 1 8 0v3"/>',
  user:'<circle cx="14" cy="8" r="4.5"/><path d="M4 25v-7h20v7"/>',
  heart:'<path d="M14 24 4 14C-3 6 8-1 14 7 20-1 31 6 24 14L14 24Z"/>',
  pause:'<path d="M10 6v16M18 6v16"/>', play:'<path d="m10 5 13 9-13 9Z"/>',
  left:'<path d="m18 5-9 9 9 9"/>', right:'<path d="m10 5 9 9-9 9"/>',
};
const icon = name => `<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" aria-hidden="true">${paths[name] || ''}</svg>`;
function store() {
  try {
    localStorage.setItem('hanssem-demo-cart', JSON.stringify(cart));
    localStorage.setItem('hanssem-demo-wishes', JSON.stringify(wishes));
    localStorage.setItem('hanssem-demo-search', JSON.stringify(recent));
  } catch { toast('브라우저 저장소를 사용할 수 없어 이번 화면에서만 유지됩니다.'); }
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function toolbar() {
  const count = cart.reduce((n, x) => n + x.qty, 0);
  return `<nav class="toolbar" aria-label="사용자 메뉴">${[
    ['search','검색','search'],['login','로그인','login'],['pin','매장찾기','stores'],['bag','장바구니','cart'],['user','마이','my'],
  ].map(([i,label,action]) => `<button class="tool" data-action="${action}" aria-label="${label}">${icon(i)}${action === 'cart' && count ? `<span class="count">${count}</span>` : ''}<span class="tip">${label}</span></button>`).join('')}</nav>`;
}
function categoryDropdown(group) {
  const categories = group.groupCategoryList;
  return `<div class="dropdown"><div class="dropdown-inner">${categories.map(c => `<a href="/category/${escape(c.categoryNo)}">${escape(c.categoryName)}</a>`).join('')}${group.mallType === 'REMODELING' ? '<a href="/interior?view=cases">시공사례</a><a href="/interior?view=all">전체인테리어</a><a href="/interior?view=consult">무료견적상담</a>' : ''}</div></div>`;
}
function brand() {
  return `<div class="brand"><a href="/" class="brand-home" aria-label="한샘몰 홈"><img src="/assets/logo.svg" alt="HANSSEM 한샘" width="754" height="72"></a><nav class="entry-nav" aria-label="주요 카테고리"><div class="entry"><a href="/furnishing" aria-haspopup="true">가구/홈리빙</a>${categoryDropdown(groups[0])}</div><span class="entry-separator"></span><div class="entry"><a href="/interior" aria-haspopup="true">인테리어</a>${categoryDropdown(groups[1])}</div></nav></div>`;
}
function footer() {
  return `<footer><div class="footer-links"><a href="https://company.hanssem.com/main.do" target="_blank" rel="noopener">회사소개</a><a href="https://mall.hanssem.com/customer/customerAgreement.do" target="_blank" rel="noopener">이용약관</a><a href="https://mall.hanssem.com/customer/locationAgreement.do" target="_blank" rel="noopener">위치정보이용약관</a><a href="https://mall.hanssem.com/customer/customerPrivacy.do" target="_blank" rel="noopener">개인정보처리방침</a><button data-action="support">고객센터</button><button data-action="family">FAMILY SITE ⌄</button></div><div class="footer-columns"><div><b>HANSSEM</b><p>고객센터 이용안내</p><p>평일 09:00 - 18:00<br>토요일 09:00 - 13:00 (일요일, 공휴일 휴무)</p></div><div><b>한샘몰 문의 ›</b><p>상품, 배송, 사이트 이용문의 (1688-4945)</p><button data-action="support">채팅 상담</button></div><div><b>A/S 문의 ›</b><p>A/S 신청 및 추가부품 문의 (1588-0900)</p><button data-action="support">채팅 상담</button></div><div><b>한샘 이전설치 ›</b><p>상품 이전설치 / 분리 / 재설치 서비스</p><button data-action="support">상담 신청</button></div></div><p>㈜한샘 대표자: 김유진　경기도 안산시 성곡동 665　사업자등록번호: 133-81-22865<br>통신판매업신고: 2010-경기안산-0512　(C) Hanssem Co., Ltd. All rights reserved.</p><p class="local-note">비공식 로컬 클론 · 2026.10.15 공개 화면 자료 기반. 원본 한샘몰과 연결된 주문·로그인·상담 서비스가 아닙니다.</p></footer>`;
}
function renderHome() {
  document.body.className = 'home';
  app.innerHTML = `<main id="main" class="stage" aria-label="한샘몰 프로모션" aria-roledescription="carousel">${banners.map((b,i) => `<section class="slide ${i === slideIndex ? 'active' : i < slideIndex ? 'past' : ''}" data-slide="${i}" aria-label="${i+1} / 8" ${i !== slideIndex ? 'inert aria-hidden="true"' : ''}><a class="slide-link" href="/plan/${i}" aria-label="${escape(b.title.join(' '))}"><img src="/${b.image}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}><div class="caption"><h1>${escape(b.title[0])}<br>${escape(b.title[1])}</h1><p>${b.subtitle.map(s=>`<span>${escape(s)}</span>`).join('')}</p></div></a></section>`).join('')}<section class="slide footer-slide ${slideIndex === 7 ? 'active' : ''}" data-slide="7" aria-label="고객센터" ${slideIndex !== 7 ? 'inert aria-hidden="true"' : ''}>${footer()}</section>${brand()}${toolbar()}<nav class="indicators" aria-label="배너 페이지">${Array.from({length:8},(_,i)=>`<button class="indicator ${i === slideIndex?'active':''}" data-slide-to="${i}" aria-label="${i===7?'고객센터':`${i+1}번 배너`}" ${i === slideIndex?'aria-current="true"':''}></button>`).join('')}</nav><div class="hero-controls"><button class="prev-btn" data-action="prev" aria-label="이전 배너">${icon('left')}</button><button data-action="pause" aria-label="${playing?'자동 재생 일시정지':'자동 재생 시작'}">${icon(playing?'pause':'play')}</button><button class="next-btn" data-action="next" aria-label="다음 배너">${icon('right')}</button></div></main>`;
  schedule();
}
function schedule() {
  clearInterval(timer);
  if (playing && !document.hidden && document.body.classList.contains('home') && !dialog.open && !document.querySelector('.stage:focus-within')) timer = setInterval(() => setSlide((slideIndex+1)%8),5000);
}
function setSlide(index) {
  if (!document.body.classList.contains('home')) return;
  slideIndex = (index+8)%8;
  document.querySelectorAll('[data-slide]').forEach(el => {
    const i = Number(el.dataset.slide), active = i === slideIndex;
    el.classList.toggle('active', active); el.classList.toggle('past',i < slideIndex);
    el.inert = !active; el.setAttribute('aria-hidden',String(!active));
  });
  document.querySelectorAll('[data-slide-to]').forEach(el => {
    const active = Number(el.dataset.slideTo) === slideIndex;
    el.classList.toggle('active',active);
    if (active) el.setAttribute('aria-current','true'); else el.removeAttribute('aria-current');
  });
}
function shopHeader(active='') {
  return `<header class="shop-header"><a href="/" aria-label="한샘몰 홈"><img src="/assets/logo.svg" alt="HANSSEM 한샘"></a>${toolbar()}<nav class="shop-nav" aria-label="쇼핑 메뉴"><a href="/furnishing" class="${active==='furnishing'?'active':''}">가구/홈리빙</a><a href="/interior" class="${active==='interior'?'active':''}">인테리어</a><a href="/furnishing?sort=popular">한샘 인기랭킹</a><a href="/plan/0">한샘 특가</a><a href="/favorites">찜한 상품</a><a href="/plan/0">쌤페스타</a></nav></header>`;
}
function shell(content, active='') {
  document.body.className='shop'; clearInterval(timer);
  app.innerHTML = `${shopHeader(active)}<main id="main" class="content">${content}</main><footer class="shop-footer">비공식 로컬 클론 · 상품·가격은 2026.10.15 공개 자료 스냅샷입니다.<br>장바구니와 찜은 이 브라우저에만 저장됩니다. 실제 주문·결제·회원 서비스는 연결되지 않습니다.<br><button data-action="home">HANSSEM 홈으로</button></footer><button class="back-top" data-action="top" aria-label="맨 위로">↑</button>`;
}
function productCards(list) {
  if (!list.length) return '<div class="empty"><b>표시할 상품이 없습니다</b>다른 검색어나 카테고리를 선택해 보세요.<br>이 데모는 원본에서 수집한 일부 상품만 제공합니다.</div>';
  return list.map(p=>`<article class="product-card"><a href="/product/${p.id}" class="product-image" aria-label="${escape(p.name)}"><img src="/${p.image}" alt="${escape(p.name)}" loading="lazy"></a><button class="wish ${wishes.includes(p.id)?'saved':''}" data-wish="${p.id}" aria-label="${escape(p.name)} 찜" aria-pressed="${wishes.includes(p.id)}">${icon('heart')}</button><a class="product-info" href="/product/${p.id}"><div class="product-brand">${escape(p.brand)}</div><div class="product-name">${escape(p.name)}</div><div class="product-price"><span class="discount">${p.discount}%</span>${money(p.price)}<small>원</small></div><div class="product-rating">★ ${p.rating ?? '-'}　리뷰 ${money(p.reviews || 0)}</div>${p.tags.map(t=>`<span class="tag">${escape(t)}</span>`).join('')}</a></article>`).join('');
}
function sorted(list, sort) {
  return [...list].sort((a,b)=>sort === 'low' ? a.price-b.price : sort === 'high' ? b.price-a.price : (b.reviews||0)-(a.reviews||0));
}
const sorts = sort => `<select id="sort" aria-label="상품 정렬"><option value="popular" ${sort==='popular'?'selected':''}>인기순</option><option value="low" ${sort==='low'?'selected':''}>낮은 가격순</option><option value="high" ${sort==='high'?'selected':''}>높은 가격순</option></select>`;
function findCategory(id) {
  for (const g of groups) {
    for (const c of g.groupCategoryList) {
      if (String(c.categoryNo) === id) return { category:c, group:g };
      for (const m of c.middleCategoryList || []) if (String(m.categoryNo) === id) return { category:m,group:g };
    }
  }
}
function renderCatalog(url) {
  const isInterior = url.pathname==='/interior';
  const category = findCategory(url.pathname.split('/')[2] || '');
  const query = url.searchParams.get('q');
  const sort = url.searchParams.get('sort') || 'popular';
  const catFilter = url.searchParams.get('type') || '';
  let title = category?.category.categoryName || (query!==null ? `'${query}' 검색 결과` : '지금, 우리 집에 필요한 가구');
  let list = products;
  if (query!==null) list = list.filter(p=>`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  const categoryName = category?.category.categoryName;
  const match = (name, productName) => {
    const words = {'침실':['침대','매트리스'], '거실':['소파','거실장','테이블'],'다이닝':['식탁'],'옷장·드레스룸':['옷장','드레스룸'],'키즈룸':['키즈','아이'],'학생방':['책상','책장'],'홈오피스':['책상','의자'],'홈&데코':['커튼','패브릭'],'화장대·서랍장':['화장대','서랍장']};
    return (words[name] || [name]).some(w=>productName.includes(w));
  };
  if (categoryName) list = list.filter(p=>match(categoryName,p.name));
  if (catFilter) list = list.filter(p=>p.category===catFilter);
  if (isInterior || category?.group.mallType === 'REMODELING') {
    const label = categoryName || '인테리어';
    shell(`<div class="breadcrumb"><a href="/">홈</a> / 인테리어</div><h1 class="page-title">${escape(label)}</h1><p>더 나은 집을 위한 선택, 한샘</p><div class="chips">${groups[1].groupCategoryList.map(c=>`<button data-go="/category/${c.categoryNo}">${escape(c.categoryName)}</button>`).join('')}<button data-action="consult">무료 견적상담</button></div><div class="campaign-grid">${banners.slice(2,6).map((b,i)=>`<a href="/plan/${i+2}" class="campaign-card"><img src="/${b.image}" alt="${escape(b.title.join(' '))}"><h3>${escape(b.title.join(' '))}</h3><p>${escape(b.subtitle.join(' '))}</p></a>`).join('')}</div>`,'interior');
    if(url.searchParams.get('view')==='consult') showConsult();
    return;
  }
  shell(`<div class="breadcrumb"><a href="/">홈</a> / 가구·홈리빙${categoryName?' / '+escape(categoryName):''}</div>${query===null&&!category?`<a class="catalog-hero" href="/plan/0" style="display:block"><img src="/${banners[0].image}" alt="쌤페스타"><div class="copy"><h1>쌤페스타<br>한샘 연중 최대 세일 이벤트</h1><p>9.28 ~ 10.26　~85% SALE</p></div></a>`:''}<h1 class="page-title">${escape(title)}</h1><div class="chips">${(category?.category.middleCategoryList || groups[0].groupCategoryList).map(c=>`<button class="${c.categoryName===categoryName?'active':''}" data-go="/category/${c.categoryNo}">${escape(c.categoryName)}</button>`).join('')}<button data-go="/furnishing">전체보기</button></div><div class="section-heading"><h2>${query!==null?'검색 결과':category?'추천 상품':'한샘 BEST'} <small class="result-meta">${list.length}개</small></h2>${sorts(sort)}</div><p class="catalog-notice">원본 공개 상품 일부를 재현한 로컬 탐색 화면입니다. 판매 가격·옵션·재고는 원본에서 확인해 주세요.</p><div class="product-grid">${productCards(sorted(list,sort))}</div>`,'furnishing');
}
function renderDetail(id) {
  const p=products.find(x=>String(x.id)===id);
  if(!p){shell('<h1>상품을 찾을 수 없습니다</h1><a href="/furnishing">전체 상품 보기</a>');return;}
  shell(`<div class="breadcrumb"><a href="/">홈</a> / <a href="/furnishing">가구·홈리빙</a> / ${escape(p.category)}</div><div class="detail-layout"><img src="/${p.image}" alt="${escape(p.name)}"><section class="detail-info"><div class="product-brand">${escape(p.brand)}</div><h1>${escape(p.name)}</h1><p class="product-rating">★ ${p.rating ?? '-'}　리뷰 ${money(p.reviews||0)}</p><div class="original-price">${money(p.normalPrice)}원</div><div class="product-price"><span class="discount">${p.discount}%</span>${money(p.price)}<small>원</small></div><div class="details-list">배송·설치　원본 상품 페이지에서 확인<br>상품 옵션　원본에서 제공하는 옵션을 확인해 주세요</div><div class="quantity"><span>수량</span><button data-qty="-1" aria-label="수량 줄이기">−</button><output id="quantity">1</output><button data-qty="1" aria-label="수량 늘리기">+</button></div><div class="section-heading"><span>총 상품 금액</span><b id="total">${money(p.price)}원</b></div><div class="actions"><button data-wish="${p.id}" aria-pressed="${wishes.includes(p.id)}">${wishes.includes(p.id)?'찜 해제':'찜하기'}</button><button class="primary" data-add="${p.id}">장바구니 담기</button></div><a class="original-link" href="https://store.hanssem.com/goods/${p.id}" target="_blank" rel="noopener">원본 상품 페이지에서 상세·옵션 확인 ↗</a><p class="catalog-notice">로컬 데모: 상품 옵션 선택과 실제 주문·결제는 지원하지 않습니다.</p></section></div>`);
}
function renderCart() {
  const total = cart.reduce((n,x)=>n+products.find(p=>p.id===x.id).price*x.qty,0);
  shell(`<div class="breadcrumb"><a href="/">홈</a> / 장바구니</div><h1 class="page-title">장바구니 <small class="result-meta">${cart.length}개</small></h1>${cart.length?cart.map(item=>{const p=products.find(p=>p.id===item.id);return `<article class="cart-row"><a href="/product/${p.id}"><img src="/${p.image}" alt="${escape(p.name)}"></a><div><h3><a href="/product/${p.id}">${escape(p.name)}</a></h3><b>${money(p.price)}원</b><div class="quantity"><button data-cart-qty="${p.id}" data-delta="-1" ${item.qty<=1?'disabled':''} aria-label="${escape(p.name)} 수량 줄이기">−</button><span>${item.qty}</span><button data-cart-qty="${p.id}" data-delta="1" ${item.qty>=99?'disabled':''} aria-label="${escape(p.name)} 수량 늘리기">+</button></div></div><button data-remove="${p.id}">삭제 ×</button></article>`;}).join('')+`<div class="cart-total"><span>총 상품 금액</span><span>${money(total)}원</span></div><button class="primary wide" data-action="checkout">주문 안내</button>`:'<div class="empty"><b>장바구니가 비어 있습니다</b><p>마음에 드는 가구를 담아 보세요.</p><a href="/furnishing" class="outline">상품 둘러보기</a></div>'}`);
}
function renderCampaign(index) {
  const b = banners[index];
  if (!b) {navigate('/');return;}
  shell(`<div class="breadcrumb"><a href="/">홈</a> / 기획전</div><h1 class="page-title">${escape(b.title.join(' '))}</h1><img class="campaign-banner" src="/${b.image}" alt="${escape(b.title.join(' '))}"><p>${escape(b.subtitle.join(' · '))}</p><a class="original-link" href="${escape(b.href)}" target="_blank" rel="noopener">원본 기획전 보기 ↗</a><div class="section-heading" style="margin-top:55px"><h2>함께 둘러보세요</h2><a href="/furnishing">전체보기 ›</a></div><div class="product-grid">${productCards(products.slice(0,8))}</div>`);
}
function modal(title,content) {
  clearInterval(timer);
  dialog.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="close-dialog" data-action="close" aria-label="닫기">×</button></div>${content}`;
  if(!dialog.open)dialog.showModal();
}
function showSearch() {
  modal('검색',`<form class="search-form" id="search-form"><input name="q" type="search" maxlength="100" placeholder="어떤 상품을 찾으세요?" aria-label="검색어" autocomplete="off" required><button aria-label="검색 실행">${icon('search')}</button></form><div class="search-hints"><h3>인기 검색어</h3>${['소파','침대','식탁','책상','옷장','매트리스'].map(q=>`<button data-query="${q}">${q}</button>`).join('')}<div class="search-history"><h3>최근 검색어</h3><button data-action="clear-search">전체 삭제</button></div>${recent.length?recent.map(q=>`<button data-query="${escape(q)}">${escape(q)}</button>`).join(''):'<p>최근 검색어가 없습니다.</p>'}<p>공개 자료에서 수집한 ${products.length}개 상품 내에서 검색합니다.</p></div>`);
  dialog.querySelector('input').focus();
}
function submitSearch(query) {
  const q=query.trim().slice(0,100);if(!q)return;
  recent=[q,...recent.filter(x=>x!==q)].slice(0,5);store();dialog.close();navigate('/search?q='+encodeURIComponent(q));
}
function showConsult() {modal('인테리어 견적상담', '<p>이 화면은 로컬 클론입니다. 실제 한샘 상담 접수는 원본 인테리어 서비스에서 진행해 주세요.</p><p>이 데모는 이름·연락처를 수집하거나 상담 신청을 전송하지 않습니다.</p><a class="original-link" href="https://store.hanssem.com/interior" target="_blank" rel="noopener">원본 인테리어 서비스 열기 ↗</a>');}
function route() {
  const url=new URL(location.href),path=url.pathname;
  if(dialog.open)dialog.close();
  if(path==='/')renderHome();
  else if(['/furnishing','/interior','/search'].includes(path)||path.startsWith('/category/'))renderCatalog(url);
  else if(path.startsWith('/product/'))renderDetail(path.split('/')[2]);
  else if(path==='/cart')renderCart();
  else if(path==='/favorites')shell(`<h1 class="page-title">찜한 상품</h1><div class="product-grid">${productCards(products.filter(p=>wishes.includes(p.id)))}</div>`);
  else if(path.startsWith('/plan/'))renderCampaign(Number(path.split('/')[2]));
  else shell('<div class="error-page"><h1>페이지를 찾을 수 없습니다</h1><a href="/">홈으로 돌아가기</a></div>');
  document.querySelector('#main').tabIndex=-1;
}
function navigate(path) {if(path==='/')slideIndex=0;history.pushState({},'',path);window.scrollTo(0,0);route();}
window.addEventListener('popstate',route);
document.addEventListener('click',event=>{
  const target=event.target.closest('button,a');if(!target)return;
  if(target.matches('a[href]')){
    const url=new URL(target.href,location.href);
    if(url.origin===location.origin&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&target.target!=='_blank'){
      event.preventDefault();if(url.hash==='#main'){document.querySelector('#main').focus();return;}navigate(url.pathname+url.search);return;
    }
  }
  if(target.dataset.go){navigate(target.dataset.go);return;}
  if(target.dataset.slideTo!==undefined){setSlide(Number(target.dataset.slideTo));schedule();return;}
  if(target.dataset.query){submitSearch(target.dataset.query);return;}
  if(target.dataset.wish){
    const id=Number(target.dataset.wish);wishes=wishes.includes(id)?wishes.filter(x=>x!==id):[...wishes,id];store();
    const saved=wishes.includes(id);target.setAttribute('aria-pressed',String(saved));target.classList.toggle('saved',saved);
    if(!target.classList.contains('wish'))target.textContent=saved?'찜 해제':'찜하기';
    toast(saved?'찜한 상품에 저장했습니다.':'찜한 상품에서 삭제했습니다.');
    if(location.pathname==='/favorites')route();return;
  }
  if(target.dataset.qty){
    const output=document.querySelector('#quantity'),p=products.find(p=>String(p.id)===location.pathname.split('/')[2]);
    const qty=Math.min(99,Math.max(1,Number(output.value)+Number(target.dataset.qty)));
    output.value=qty;document.querySelector('#total').textContent=money(qty*p.price)+'원';return;
  }
  if(target.dataset.add){
    const id=Number(target.dataset.add),qty=Number(document.querySelector('#quantity').value),item=cart.find(x=>x.id===id);
    if(item)item.qty=Math.min(99,item.qty+qty);else cart.push({id,qty});store();
    document.querySelector('.toolbar').outerHTML=toolbar();
    modal('장바구니에 담았습니다','<p>선택한 상품이 이 브라우저의 장바구니에 저장되었습니다.</p><button class="primary" data-action="cart">장바구니 보기</button><button class="outline wide" data-action="close">계속 둘러보기</button>');return;
  }
  if(target.dataset.cartQty){const item=cart.find(x=>x.id===Number(target.dataset.cartQty));item.qty=Math.max(1,Math.min(99,item.qty+Number(target.dataset.delta)));store();renderCart();return;}
  if(target.dataset.remove){cart=cart.filter(x=>x.id!==Number(target.dataset.remove));store();renderCart();toast('장바구니에서 삭제했습니다.');return;}
  switch(target.dataset.action){
    case 'search':showSearch();break;
    case 'close':dialog.close();break;
    case 'cart':navigate('/cart');break;
    case 'home':slideIndex=0;navigate('/');break;
    case 'next':setSlide(slideIndex+1);schedule();break;
    case 'prev':setSlide(slideIndex-1);schedule();break;
    case 'pause':playing=!playing;target.innerHTML=icon(playing?'pause':'play');target.setAttribute('aria-label',playing?'자동 재생 일시정지':'자동 재생 시작');schedule();break;
    case 'top':window.scrollTo({top:0,behavior:reduceMotion?'instant':'smooth'});break;
    case 'clear-search':recent=[];store();showSearch();break;
    case 'login':case 'my':modal('한샘몰 회원 서비스','<p>비공식 로컬 클론이므로 로그인 정보는 입력받지 않습니다.</p><p>찜과 장바구니는 로그인 없이 이 브라우저에 저장할 수 있습니다.</p><button class="primary" data-go="/favorites">찜한 상품 보기</button>');break;
    case 'stores':modal('한샘 매장찾기','<p>실제 매장 위치·영업시간은 한샘 원본 서비스에서 확인해 주세요.</p><a class="original-link" href="https://store.hanssem.com/interior" target="_blank" rel="noopener">한샘 원본 인테리어 서비스 열기 ↗</a>');break;
    case 'consult':showConsult();break;
    case 'support':modal('고객센터 안내','<p>한샘몰 문의　1688-4945<br>A/S 문의　1588-0900</p><p>평일 09:00 - 18:00, 토요일 09:00 - 13:00<br>일요일·공휴일 휴무</p><p>이 로컬 데모는 실제 상담을 연결하거나 접수하지 않습니다.</p><a class="original-link" href="https://mall.hanssem.com/csCenter/csMain.do" target="_blank" rel="noopener">원본 고객센터 열기 ↗</a>');break;
    case 'family':modal('FAMILY SITE','<p><a href="https://company.hanssem.com/main.do" target="_blank" rel="noopener">㈜한샘 회사소개 ↗</a></p>');break;
    case 'checkout':modal('실제 주문은 원본에서','<p>이 장바구니는 로컬 데모이며 주문·결제 기능이 연결되지 않았습니다.</p><p>상품 상세의 원본 링크에서 최신 가격과 옵션을 확인해 주세요.</p><button class="primary" data-action="close">확인</button>');break;
  }
});
document.addEventListener('submit',event=>{if(event.target.id==='search-form'){event.preventDefault();submitSearch(new FormData(event.target).get('q'));}});
document.addEventListener('change',event=>{if(event.target.id==='sort'){const url=new URL(location.href);url.searchParams.set('sort',event.target.value);navigate(url.pathname+url.search);}});
document.addEventListener('keydown',event=>{
  if(dialog.open||!document.body.classList.contains('home')||event.target.closest('input,select,textarea,.entry'))return;
  if(['ArrowDown','PageDown','ArrowUp','PageUp','Home','End'].includes(event.key)){
    event.preventDefault();setSlide(event.key==='Home'?0:event.key==='End'?7:slideIndex+(['ArrowDown','PageDown'].includes(event.key)?1:-1));schedule();
  }
});
document.addEventListener('wheel',event=>{
  if(!document.body.classList.contains('home')||dialog.open||event.target.closest('.dropdown')||Math.abs(event.deltaY)<10)return;
  event.preventDefault();if(Date.now()<wheelLock)return;wheelLock=Date.now()+950;
  setSlide(slideIndex+(event.deltaY>0?1:-1));schedule();
},{passive:false});
document.addEventListener('touchstart',event=>{touchY=event.touches[0].clientY;},{passive:true});
document.addEventListener('touchend',event=>{
  if(touchY===null||dialog.open||!document.body.classList.contains('home')||event.target.closest('.dropdown'))return;
  const delta=touchY-event.changedTouches[0].clientY;touchY=null;
  if(Math.abs(delta)>50){setSlide(slideIndex+(delta>0?1:-1));schedule();}
},{passive:true});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',schedule);
document.addEventListener('focusin',event=>{if(event.target.closest('.stage'))clearInterval(timer);});
document.addEventListener('focusout',()=>queueMicrotask(schedule));
document.addEventListener('visibilitychange',schedule);
route();
