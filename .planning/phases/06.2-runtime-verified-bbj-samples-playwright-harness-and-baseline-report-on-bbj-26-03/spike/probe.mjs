// Spike probe: open a DWC URL, record what the page does, dump a DOM outline.
// Usage: node probe.mjs <url> <outPrefix> [waitMs] [clickText]
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const [url, out, waitMs = '6000', clickText] = process.argv.slice(2);
const log = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('console', m => log.push(`console.${m.type()}: ${m.text()}`));
page.on('pageerror', e => log.push(`pageerror: ${e.message}`));
page.on('requestfailed', r => log.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
page.on('response', r => { if (r.status() >= 400) log.push(`http ${r.status()}: ${r.url()}`); });
page.on('dialog', d => log.push(`native dialog: ${d.type()} ${d.message()}`));
page.on('framenavigated', f => { if (f === page.mainFrame()) log.push(`navigated: ${f.url()}`); });

const t0 = Date.now();
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(Number(waitMs));
log.push(`elapsed: ${Date.now() - t0} ms`);

const outline = () => page.evaluate(() => {
  const tags = {}; const lines = [];
  const walk = (root, depth) => {
    for (const el of root.children ?? []) {
      const t = el.tagName.toLowerCase();
      tags[t] = (tags[t] ?? 0) + 1;
      if (depth < 9 && lines.length < 160 && !['script','style','link','meta','path','svg'].includes(t)) {
        const cls = (el.getAttribute('class') ?? '').slice(0, 80);
        lines.push(`${'  '.repeat(depth)}${t}${el.id ? '#' + el.id : ''}${cls ? ' .' + cls : ''}${el.shadowRoot ? ' [shadow]' : ''}`);
      }
      if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
      walk(el, depth + 1);
    }
  };
  walk(document, 0);
  return { title: document.title, text: document.body?.innerText?.slice(0, 1500), tags, lines };
});

let dump = await outline();
fs.writeFileSync(`${out}-dom.json`, JSON.stringify(dump, null, 1));
await page.screenshot({ path: `${out}.png`, fullPage: true });

if (clickText) {
  await page.getByText(clickText).first().click();
  await page.waitForTimeout(2500);
  dump = await outline();
  fs.writeFileSync(`${out}-after-click-dom.json`, JSON.stringify(dump, null, 1));
  await page.screenshot({ path: `${out}-after-click.png`, fullPage: true });
}
fs.writeFileSync(`${out}-log.txt`, log.join('\n') + '\n');
console.log(log.join('\n'));
console.log('TITLE:', dump.title);
console.log('TEXT:', JSON.stringify(dump.text));
console.log('CUSTOM TAGS:', Object.keys(dump.tags).filter(t => t.includes('-')).join(' '));
await browser.close();
