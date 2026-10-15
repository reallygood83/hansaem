import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('./', import.meta.url);
const output = new URL('dist/', root);
await fs.mkdir(output, { recursive: true });
for (const file of ['index.html', 'app.js', 'style.css', 'data.json']) {
  await fs.copyFile(new URL(file, root), new URL(file, output));
}
await fs.cp(new URL('assets/', root), new URL('assets/', output), { recursive: true });
const data = JSON.parse(await fs.readFile(new URL('data.json', output), 'utf8'));
assert.equal(data.banners.length, 7);
assert.equal(data.products.length, 40);
for (const item of [...data.banners, ...data.products]) {
  const stat = await fs.stat(new URL(item.image, output));
  assert(stat.size > 0, `Empty asset: ${item.image}`);
}
assert.deepEqual((await fs.readdir(output)).sort(), ['app.js', 'assets', 'data.json', 'index.html', 'style.css']);
console.log('Static build verified: 7 banners, 40 products, all image assets present.');
