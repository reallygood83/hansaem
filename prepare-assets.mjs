import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('./', import.meta.url);
const html = await fs.readFile('/tmp/hanssem-reference.html', 'utf8');
const props = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)[1]).props.pageProps;
const banners = props.data.data[0].data.content.map((b, i) => ({
  title: [b.bannerTitle1, b.bannerTitle2], subtitle: [b.bannerSubTitle1, b.bannerSubTitle2],
  image: `assets/banner-${i + 1}.jpg`, source: b.imageUrl, href: b.appLinkInfoDto.linkUrl,
}));
const menu = props.gnbMenuFallback.data;
assert.equal(banners.length, 7);
await fs.mkdir(new URL('assets/', root), { recursive: true });
await Promise.all(banners.map(async b => {
  const response = await fetch(b.source + '?w=1920');
  assert(response.ok, `Image failed: ${response.status}`);
  await fs.writeFile(new URL(b.image, root), Buffer.from(await response.arrayBuffer()));
}));
const shopHtml = await fs.readFile('/tmp/hanssem-furnishing.html', 'utf8');
const shop = JSON.parse(shopHtml.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)[1]).props.pageProps.data.data;
const products = [];
const seen = new Set();
function collect(value, category = '추천') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach(v => collect(v, category)); return; }
  const group = value.groupTitle1 || category;
  if (value.gdsNo && value.gdsNm && !seen.has(value.gdsNo)) {
    seen.add(value.gdsNo);
    products.push({ id: value.gdsNo, name: value.gdsNm, price: value.dcPrc, normalPrice: value.normalSalePrc,
      discount: value.dcRate, image: `assets/product-${value.gdsNo}.jpg`, source: value.imageUrl,
      category: group, brand: value.goodsBrandInfoDto?.brandNm || '한샘', tags: (value.goodsTagInfoDtoList || []).map(t => t.content),
      rating: value.goodsEvaluationStatInfoDto?.totAvgScore, reviews: value.goodsEvaluationStatInfoDto?.totCnt });
    return;
  }
  Object.values(value).forEach(v => collect(v, group));
}
collect(shop.filter(x => x.componentName === 'HF_베스트상품_칩형'));
const selected = products.filter((p, i, arr) => arr.slice(0, i).filter(x => x.category === p.category).length < 4);
await Promise.all(selected.map(async p => {
  const response = await fetch(p.source);
  assert(response.ok, `Product image ${p.id}: ${response.status}`);
  await fs.writeFile(new URL(p.image, root), Buffer.from(await response.arrayBuffer()));
}));
await fs.writeFile(new URL('data.json', root), JSON.stringify({ banners, menu, products: selected }, null, 2));
const rendered = await fs.readFile(new URL('evidence/reference-dom.html', root), 'utf8').catch(() => html);
const logo = [...rendered.matchAll(/<svg[^>]*>.*?<\/svg>/gs)].map(m => m[0]).find(s => s.includes('width="753.88"'));
if (logo) await fs.writeFile(new URL('assets/logo.svg', root), logo);
const fontBase = 'https://res.remodeling.hanssem.com/font/pretendard/';
const fontCss = await (await fetch(fontBase + 'pretendard-subset.css')).text();
await fs.writeFile(new URL('assets/font-license.css', root), fontCss);
await Promise.all(['Regular', 'Medium', 'Bold'].map(async weight => {
  const response = await fetch(fontBase + `subset/woff2/Pretendard-${weight}.woff2`);
  assert(response.ok);
  await fs.writeFile(new URL(`assets/Pretendard-${weight}.woff2`, root), Buffer.from(await response.arrayBuffer()));
}));
console.log('Saved 7 original banners and public navigation data (no auth/tracking).');
