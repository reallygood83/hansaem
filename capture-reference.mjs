import { chromium } from '/Users/moon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
await fs.mkdir(new URL('evidence/', import.meta.url), { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://store.hanssem.com/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.main-wrapper', { timeout: 45000 });
await page.getByRole('button', { name: '닫기', exact: true }).click({ timeout: 5000 }).catch(() => {});
await page.evaluate(() => { const swiper = document.querySelector('.main-wrapper .swiper')?.swiper; swiper?.autoplay.stop(); swiper?.slideTo(1, 0); });
await page.waitForTimeout(1500);
await page.screenshot({ path: new URL('evidence/reference.png', import.meta.url).pathname });
console.log(await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('header svg, [class*="Header"] svg, .main-wrapper svg, .main_title, .main_subtitle')];
  return nodes.map(el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return { tag: el.tagName, text: el.textContent, width: r.width, height: r.height, x:r.x,y:r.y,font:s.font,html:el.tagName==='svg'?el.outerHTML:undefined }; });
}));
await fs.writeFile(new URL('evidence/reference-dom.html', import.meta.url), await page.content());
await browser.close();
