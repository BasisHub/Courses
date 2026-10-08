// Spike: find the xterm.js Terminal instance behind the DWC console and read its buffer.
import { chromium } from '@playwright/test';
const [url] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url);
await page.locator('.dwc-console-frame').waitFor({ timeout: 20000 });
await page.waitForTimeout(1500);
const result = await page.evaluate(() => {
  const found = [];
  const looksLikeTerminal = o => o && typeof o === 'object' && o.buffer && o.buffer.active && typeof o.buffer.active.getLine === 'function';
  const els = [...document.querySelectorAll('.dwc-console-frame, .dwc-console-frame *')];
  for (const el of els) {
    for (const k of [...Object.getOwnPropertyNames(el), ...Object.getOwnPropertySymbols(el)]) {
      let v; try { v = el[k]; } catch { continue; }
      if (looksLikeTerminal(v)) found.push({ el: el.tagName + '.' + el.className, key: String(k), depth: 0 });
      else if (v && typeof v === 'object') {
        for (const k2 of Object.keys(v).slice(0, 200)) {
          let v2; try { v2 = v[k2]; } catch { continue; }
          if (looksLikeTerminal(v2)) found.push({ el: el.tagName + '.' + el.className, key: String(k) + '.' + k2, depth: 1 });
        }
      }
    }
  }
  let lines = [];
  if (found.length) {
    const f = found[0]; const el = els.find(e => e.tagName + '.' + e.className === f.el);
    const term = f.key.split('.').reduce((o, k) => o[k], el);
    const b = term.buffer.active;
    for (let i = 0; i < b.length; i++) lines.push(b.getLine(i).translateToString(true));
    lines = lines.filter(l => l.length);
  }
  return { found, lines };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
