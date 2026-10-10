// Behaviour tests for the icon pool samples of the DWC book, chapter "Icon Pools" (pages
// dwc/07-icon-pools/index.md and 90-exercise-icon-static-text.mdx). The sample files are in
// docs/examples/dwc/06_IconPools.
//
// Issue #6: "Icon Buttons in this sample appear to not work at all" (DownloadButton.bbj). The page
// writes its icons as <dwc-icon ...> and registers a custom pool in window.Dwc.IconsPools; the three
// samples write <bbj-icon ...> and register the pool in window.BBj.IconsPools. The tests record, per
// pool, how many icons render, and which of the two tag names the browser knows on BBj 26.03.
//
// Controls are found by role and visible text; nothing is added to a sample. A red test is a finding:
// the sample is never changed, and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { iconReport, settle } from '../../lib/dwc.js';

const BASE = 'dwc/06_IconPools/';
const DOWNLOAD = `${BASE}DownloadButton.bbj`;
const POOLS = ['feather', 'tabler', 'fa', 'ionicons'];
/** The resolver DownloadButton.bbj registers for its custom pool (line 55), as a URL prefix. */
const IONICONS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/ionicons/6.0.2/svg/';

/** How many icon elements the page holds per pool attribute. */
function poolTotals(page) {
  return page.locator('dwc-icon, bbj-icon').evaluateAll((els) => {
    const totals = {};
    for (const el of els) {
      const pool = el.getAttribute('pool') ?? 'none';
      totals[pool] = (totals[pool] ?? 0) + 1;
    }
    return totals;
  });
}

/** Which icon tags the browser defines, which tags the page uses, and which pools are registered where. */
async function elementFacts(page) {
  const tags = await page.locator('dwc-icon, bbj-icon').evaluateAll((els) => els.map((el) => el.tagName.toLowerCase()));
  const registry = await page.evaluate(() => ({
    bbjIconDefined: Boolean(customElements.get('bbj-icon')),
    dwcIconDefined: Boolean(customElements.get('dwc-icon')),
    bbjPools: window.BBj && Array.isArray(window.BBj.IconsPools) ? window.BBj.IconsPools.map((pool) => pool.name) : [],
    dwcPools: window.Dwc && Array.isArray(window.Dwc.IconsPools) ? window.Dwc.IconsPools.map((pool) => pool.name) : [],
  }));
  const counts = {};
  for (const tag of tags) counts[tag] = (counts[tag] ?? 0) + 1;
  return { ...registry, tags: counts };
}

const tagText = (counts) => Object.entries(counts).map(([tag, n]) => `${n} x <${tag}>`).join(', ') || 'none';

/** Per pool "rendered/total" from the icon report; hidden icons do not occur in these samples. */
function perPool(totals, report) {
  const lines = [];
  for (const pool of [...POOLS, ...Object.keys(totals).filter((p) => !POOLS.includes(p))]) {
    if (!(pool in totals)) continue;
    const missing = report.missing.filter((m) => m.pool === pool);
    lines.push(`${pool} ${totals[pool] - missing.length}/${totals[pool]}`);
  }
  return lines.join(', ');
}

/**
 * Browser-only experiment, nothing in the sample changes: the same icon attributes written on <dwc-icon>
 * elements in a throwaway container (the tag the course page uses), the ionicons pool registered the
 * way the course page does it (window.Dwc.IconsPools). Returns "rendered/total" per pool. The icons
 * come from CDNs (cdn.jsdelivr.net, cdnjs.cloudflare.com), so this is a network observation.
 */
function renderAsDwcIcon(page, icons) {
  return page.evaluate(
    async ({ list, ionUrl }) => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const drawn = (el) => {
        const box = el.getBoundingClientRect();
        const svg = el.shadowRoot && el.shadowRoot.querySelector('svg');
        return box.width >= 4 && box.height >= 4 && Boolean(svg && svg.children.length > 0);
      };
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:white';
      document.body.appendChild(host);
      const make = (icon) => {
        const el = document.createElement('dwc-icon');
        for (const [name, value] of Object.entries(icon)) if (value !== null) el.setAttribute(name, value);
        host.appendChild(el);
        return el;
      };
      try {
        // Built-in pools first: that is when the DWC creates window.Dwc.IconsPools.
        const built = list.filter((icon) => icon.pool !== 'ionicons').map(make);
        await wait(3000);
        (window.Dwc ??= {}).IconsPools ??= [];
        window.Dwc.IconsPools.push({ name: 'ionicons', resolver: (name) => `${ionUrl}${name}.svg` });
        const custom = list.filter((icon) => icon.pool === 'ionicons').map(make);
        const all = [...built, ...custom];
        for (let i = 0; i < 12 && !all.every(drawn); i += 1) await wait(500);
        const result = {};
        for (const el of all) {
          const pool = el.getAttribute('pool');
          result[pool] ??= { drawn: 0, total: 0 };
          result[pool].total += 1;
          if (drawn(el)) result[pool].drawn += 1;
        }
        return result;
      } finally {
        host.remove();
      }
    },
    { list: icons, ionUrl: IONICONS_URL },
  );
}

/** Network facts: SVG requests grouped by host with their status, and the failed requests. */
async function svgNetwork(page) {
  const requests = await page.requests();
  const byHost = {};
  let failed = 0;
  for (const request of requests) {
    if (request.failure()) failed += 1;
    if (!/\.svg(\?|$)/.test(request.url())) continue;
    const host = new URL(request.url()).host;
    const response = await request.response().catch(() => null);
    const key = `${host} ${response ? response.status() : 'no response'}`;
    byHost[key] = (byHost[key] ?? 0) + 1;
  }
  return { failed, text: Object.entries(byHost).map(([key, n]) => `${n} x ${key}`).join(', ') || 'none' };
}

// ---------------------------------------------------------------------------------------------
// DownloadButton.bbj: eight buttons with an icon in the title: feather, tabler and Font Awesome (lines
// 30 to 37), the same three with expanse, theme and an inline style (lines 42 to 49), and two buttons
// from a custom ionicons pool (lines 54 to 65).
// ---------------------------------------------------------------------------------------------
behaviourTest(
  DOWNLOAD,
  'every button icon renders (feather, tabler, Font Awesome and the ionicons custom pool)',
  { issue: 6 },
  async ({ page, note }) => {
    await settle(page, 1500);
    const report = await iconReport(page);
    const totals = await poolTotals(page);
    const facts = await elementFacts(page);
    const before = await svgNetwork(page);
    const ionRequests = (await page.requests()).filter((request) => request.url().includes('ionicons')).length;

    // Most important first: the evidence of a result is cut at 700 characters.
    note(`rendered per pool: ${perPool(totals, report)} (${report.rendered} of ${report.total})`);
    note(`page tags ${tagText(facts.tags)}; defined in the browser: bbj-icon ${facts.bbjIconDefined}, dwc-icon ${facts.dwcIconDefined}`);

    // The attributes of the sample's own markup, written on <dwc-icon> (browser only, not saved anywhere).
    let experiment = null;
    try {
      const list = await page.locator('dwc-icon, bbj-icon').evaluateAll((els) =>
        els.map((el) => ({
          pool: el.getAttribute('pool'),
          name: el.getAttribute('name'),
          expanse: el.getAttribute('expanse'),
          theme: el.getAttribute('theme'),
          style: el.getAttribute('style'),
        })),
      );
      const drawn = await renderAsDwcIcon(page, list);
      const text = POOLS.filter((pool) => pool in drawn).map((pool) => `${pool} ${drawn[pool].drawn}/${drawn[pool].total}`).join(', ');
      const after = await svgNetwork(page);
      experiment = { text, network: after.text };
      note(`with <dwc-icon> instead of <bbj-icon> (browser only, sample unchanged): ${text}`);
    } catch (error) {
      note(`experiment with <dwc-icon> not completed: ${String(error.message).split('\n')[0]}`);
    }
    note(`pools: window.BBj.IconsPools ${facts.bbjPools.join(', ') || 'none'}, window.Dwc.IconsPools ${facts.dwcPools.join(', ') || 'none'} before the experiment`);
    note(`network of the unchanged sample: svg requests ${before.text}, ionicons requests ${ionRequests}, failed ${before.failed}`);
    if (experiment) note(`network during the experiment: svg requests ${experiment.network}`);
    note(`missing: ${report.missing.map((m) => `${m.pool}:${m.name}`).join(', ') || 'none'}`);

    expect(report.total, 'the sample has eight icon buttons').toBe(8);
    expect(report.rendered, 'every icon renders').toBe(report.total);
  },
);

// Page 07-icon-pools/index.md, "Size and color": the expanse and theme attributes, or an inline style,
// change the size and color of an icon. The sample builds the same three styled cloud icons (lines 42
// to 44): feather with expanse l and theme danger, tabler with width 0.5em and color green, Font Awesome
// with width 1em and color var(--dwc-color-danger).
behaviourTest(
  DOWNLOAD,
  'the styled variants take their size and color: expanse l and theme danger, inline width and color',
  {},
  async ({ page, note }) => {
    await settle(page, 1500);
    const facts = async (pool, name) =>
      page.locator(`[pool="${pool}"][name="${name}"]`).first().evaluate(
        (el) => {
          const box = el.getBoundingClientRect();
          const scope = el.shadowRoot || el;
          const svg = scope.querySelector('svg');
          return {
            tag: el.tagName.toLowerCase(),
            expanse: el.getAttribute('expanse'),
            theme: el.getAttribute('theme'),
            style: el.getAttribute('style'),
            width: Math.round(box.width),
            height: Math.round(box.height),
            color: getComputedStyle(el).color,
            drawn: Boolean(svg && svg.children.length > 0),
          };
        },
        undefined,
        { timeout: 5000 },
      );
    const plain = await facts('feather', 'download');
    const feather = await facts('feather', 'download-cloud');
    const tabler = await facts('tabler', 'cloud-download');
    const awesome = await facts('fa', 'fas-cloud-download-alt');
    // The color the token --dwc-color-danger resolves to, read the way the browser resolves it.
    const danger = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--dwc-color-danger)';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });

    const problems = [];
    for (const [label, f] of [['feather', feather], ['tabler', tabler], ['fa', awesome]]) {
      if (!f.drawn) problems.push(`${label} not drawn (box ${f.width} x ${f.height})`);
    }
    if (!(feather.width > plain.width)) problems.push(`expanse l not larger than default (${feather.width} vs ${plain.width} px)`);
    if (feather.color !== danger) problems.push(`theme danger does not color the feather icon (${feather.color})`);
    if (tabler.color !== 'rgb(0, 128, 0)') problems.push(`inline green not applied (${tabler.color})`);
    if (awesome.color !== danger) problems.push(`inline danger color not applied (${awesome.color})`);
    // Most important first: the evidence of a result is cut at 700 characters.
    note(`${problems.length} problems: ${problems.join('; ') || 'none'}`);

    const line = (label, f) => `${label}: <${f.tag}> expanse ${f.expanse ?? '-'} theme ${f.theme ?? '-'} style "${f.style ?? ''}", box ${f.width} x ${f.height}, color ${f.color}`;
    note(line('feather cloud', feather));
    note(line('tabler cloud', tabler));
    note(line('fa cloud', awesome));
    note(`plain feather download: box ${plain.width} x ${plain.height}; --dwc-color-danger resolves to ${danger}`);

    expect(problems, 'the styled icons are drawn with their size and color').toEqual([]);
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-IconPoolsComplete.bbj (page 90-exercise-icon-static-text.mdx): the solution adds a tabler
// tennis ball and a Font Awesome football to the static text (lines 29 to 31).
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}Exercise-IconPoolsComplete.bbj`,
  'the static text shows the tennis ball and football icons',
  { issue: 6 },
  async ({ page, note }) => {
    await settle(page, 1500);
    const report = await iconReport(page);
    const totals = await poolTotals(page);
    const facts = await elementFacts(page);
    const text = await page.getByText('I like the following sports:').first().textContent({ timeout: 5000 });
    note(`static text: "${String(text).replace(/\s+/g, ' ').trim().slice(0, 90)}"`);
    note(`icons rendered per pool: ${perPool(totals, report)}; in total ${report.rendered} of ${report.total}`);
    note(`missing: ${report.missing.map((m) => `${m.pool}:${m.name}`).join(', ') || 'none'}`);
    note(`tags the page uses: ${tagText(facts.tags)}; defined in the browser: bbj-icon ${facts.bbjIconDefined}, dwc-icon ${facts.dwcIconDefined}`);

    await expect(page.getByText('I like the following sports:').first(), 'the static text is visible').toBeVisible();
    expect(report.total, 'the static text holds two icons').toBe(2);
    expect(report.rendered, 'both icons render').toBe(2);
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-IconPools.bbj, the starter: a static text and an Exit button, no icons yet. The reader adds
// them, so zero icons here is the design, not a defect. The test carries the issue 6 anchor for the
// icon pool samples.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}Exercise-IconPools.bbj`,
  'the starter shows its static text and Exit button without icons (the reader adds them)',
  { issue: 6 },
  async ({ page, note }) => {
    await settle(page, 1500);
    const report = await iconReport(page);
    const text = await page.getByText('I like the following sports:').first().textContent({ timeout: 5000 });
    note(`static text: "${String(text).replace(/\s+/g, ' ').trim().slice(0, 90)}"`);
    note(`icons: ${report.total} (the starter has no icons by design; the exercise asks the reader to add them)`);

    await expect(page.getByText('I like the following sports:').first(), 'the static text is visible').toBeVisible();
    await expect(page.getByRole('button', { name: 'Exit' }), 'the Exit button is visible').toBeVisible();
    expect(report.total, 'the starter has no icons yet').toBe(0);
  },
);
