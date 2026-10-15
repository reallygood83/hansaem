import { chromium } from '/Users/moon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const checks=[];
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
try{
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button',{name:'자동 재생 일시정지',exact:true}).click();
  await page.mouse.move(1439,0);
  await page.waitForTimeout(250);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:new URL('evidence/clone-desktop.png',root).pathname});
  await check('7 original banners + footer',async()=>assert.equal(await page.locator('[data-slide]').count(),8));
  await check('navigation hover',async()=>{await page.getByRole('link',{name:'가구/홈리빙',exact:true}).hover();assert(await page.getByRole('link',{name:'침실',exact:true}).isVisible());});
  await page.mouse.move(900,600);
  await check('indicator and keyboard navigation',async()=>{
    await page.getByRole('button',{name:'3번 배너',exact:true}).click();
    assert(await page.locator('[data-slide="2"]').evaluate(el=>el.classList.contains('active')));
    await page.keyboard.press('ArrowDown');
    assert(await page.locator('[data-slide="3"]').evaluate(el=>el.classList.contains('active')));
    await page.keyboard.press('Home');
    await page.getByRole('button',{name:'3번 배너',exact:true}).click();
    await page.getByRole('link',{name:'한샘몰 홈',exact:true}).click();
    assert(await page.locator('[data-slide="0"]').evaluate(el=>el.classList.contains('active')));
  });
  await check('search results',async()=>{
    await page.getByRole('button',{name:'검색',exact:true}).click();
    await page.getByRole('searchbox',{name:'검색어'}).fill('소파');
    await page.getByRole('button',{name:'검색 실행',exact:true}).click();
    await page.waitForURL('**/search?q=*');
    assert((await page.locator('.product-card').count())>0);
    for(const text of await page.locator('.product-name').allTextContents())assert(text.includes('소파'));
  });
  await check('sort low to high',async()=>{
    await page.getByLabel('상품 정렬').selectOption('low');
    const prices=await page.locator('.product-price').allTextContents();
    const values=prices.map(x=>Number(x.replace(/^\d+%/,'').replace(/[^0-9]/g,'')));
    assert.deepEqual(values,[...values].sort((a,b)=>a-b));
  });
  await check('wishlist persists',async()=>{
    await page.locator('.wish').first().click();await page.reload();
    assert.equal(await page.locator('.wish.saved').count(),1);
  });
  await page.locator('.product-image').first().click();
  await check('detail quantity and add to cart',async()=>{
    await page.getByRole('button',{name:'수량 늘리기',exact:true}).click();
    assert.equal(await page.locator('#quantity').textContent(),'2');
    await page.getByRole('button',{name:'장바구니 담기',exact:true}).click();
    await page.getByRole('button',{name:'장바구니 보기',exact:true}).click();
    assert.equal(await page.locator('.cart-row .quantity span').textContent(),'2');
  });
  await check('cart refresh, quantity update, deletion',async()=>{
    await page.reload();assert.equal(await page.locator('.cart-row').count(),1);
    await page.locator('[data-cart-qty][data-delta="1"]').click();
    assert.equal(await page.locator('.cart-row .quantity span').textContent(),'3');
    await page.locator('[data-remove]').click();assert.equal(await page.locator('.cart-row').count(),0);
  });
  await check('search no results and injection safety',async()=>{
    await page.goto('http://127.0.0.1:4173/search?q='+encodeURIComponent('<img src=x onerror=alert(1)>'));
    assert.equal(await page.locator('.product-card').count(),0);
    assert.equal(await page.locator('img[src="x"]').count(),0);
    assert(await page.locator('.empty').isVisible());
  });
  await check('direct routes and category filtering',async()=>{
    await page.goto('http://127.0.0.1:4173/category/20071');
    assert((await page.locator('.product-card').count())>0);
    await page.goto('http://127.0.0.1:4173/interior');
    assert.equal(await page.locator('.campaign-card').count(),4);
    await page.goto('http://127.0.0.1:4173/plan/4');
    assert(await page.locator('.campaign-banner').isVisible());
  });
  await page.goto('http://127.0.0.1:4173/furnishing');
  await page.screenshot({path:new URL('evidence/catalog-desktop.png',root).pathname,fullPage:true});
  await check('local assets load',async()=>{
    const broken=await page.locator('img').evaluateAll(nodes=>nodes.filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src));
    assert.deepEqual(broken,[]);
  });
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button',{name:'자동 재생 일시정지',exact:true}).click();
  await page.screenshot({path:new URL('evidence/clone-mobile.png',root).pathname});
  await check('mobile home and catalog fit viewport',async()=>{
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.getByRole('link',{name:'가구/홈리빙',exact:true}).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:new URL('evidence/catalog-mobile.png',root).pathname});
  });
  await check('zero JS runtime errors',async()=>assert.deepEqual(errors,[]));
  await check('corrupted storage recovers',async()=>{
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate(()=>localStorage.setItem('hanssem-demo-cart','[null,{},false,{"id":1,"qty":0}]'));
    await page.reload();assert(await page.locator('.stage').isVisible());
    await page.getByRole('button',{name:'장바구니',exact:true}).click();
    assert.equal(await page.locator('.cart-row').count(),0);
  });
  await check('skip link moves keyboard focus',async()=>{
    await page.goto('http://127.0.0.1:4173/');
    await page.getByRole('link',{name:'본문 바로가기'}).focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
  });
  await check('focused carousel pauses autoplay',async()=>{
    await page.locator('.slide.active .slide-link').focus();
    await page.waitForTimeout(5300);
    assert(await page.locator('[data-slide="0"]').evaluate(el=>el.classList.contains('active')));
  });
  await check('no late JS runtime errors',async()=>assert.deepEqual(errors,[]));
  await fs.writeFile(new URL('evidence/qa.json',root),JSON.stringify({status:'passed',checks,errors},null,2));
}finally{await browser.close();}
