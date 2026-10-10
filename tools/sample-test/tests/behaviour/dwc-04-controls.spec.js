// Behaviour tests for the extended attribute samples of the DWC book, chapter "DWC Controls With
// Extended Attributes" (pages dwc/05-dwc-controls/index.md, Example 1 and Example 2, and
// 90-exercise-search-bbjtree.mdx). The sample files are in docs/examples/dwc/04_ExtendedAttributes.
//
// Includes the named test for GitHub issue #5 ("is --dwc-space overcome?", LabelAttributes.bbj line 34).
// The issue #7 tests for these files are in the panel style sweep, not here.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { cssVar, iconReport, panelStyle, settle } from '../../lib/dwc.js';

const BASE = 'dwc/04_ExtendedAttributes/';

/** The first sentence of every DWC "directives are no longer available" console error, once each. */
async function directiveMessages(page) {
  const found = [];
  for (const message of await page.consoleMessages().catch(() => [])) {
    if (message.type() !== 'error') continue;
    const hit = /Starting from BBj v[\d.]+, the \w+ directives are no longer available/.exec(message.text());
    if (hit && !found.includes(hit[0])) found.push(hit[0]);
  }
  return found;
}

/** Collapses every run of whitespace to one space. */
function flat(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

/** The accessible names of the tree items of one dwc-tree (n counts from 0), in DOM order. */
function treeItemNames(page, n) {
  return page
    .locator('dwc-tree')
    .nth(n)
    .getByRole('treeitem')
    .evaluateAll((els) => els.map((el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()));
}

// ---------------------------------------------------------------------------------------------
// LabelAttributes.bbj: Example 2 and "Input Control Labels". The program asks "Use Label Attributes?"
// first; the manifest answers Yes by default.
// ---------------------------------------------------------------------------------------------

// Issue 5: https://github.com/BasisHub/Courses/issues/5 "is --dwc-space overcome?" Line 34 reads
// json!.addProperty("padding", "var(--dwc-space)"); it read var(--bbj-space) when the issue was filed.
// The test records what DWC on BBj 26.03 resolves both names to.
behaviourTest(`${BASE}LabelAttributes.bbj`, '--dwc-space resolves on BBj 26.03', { issue: 5 }, async ({ page, note }) => {
  const space = await cssVar(page, '--dwc-space');
  const old = await cssVar(page, '--bbj-space');
  note(`--dwc-space=${space || '(empty)'}`);
  note(`--bbj-space=${old || '(empty)'}`);
  const onPanel = await cssVar(page, '--dwc-space', { selector: 'dwc-window-content' }).catch(() => '(not read)');
  const scale = [];
  for (const size of ['3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl']) {
    scale.push(`${size}=${(await cssVar(page, `--dwc-space-${size}`)) || '(empty)'}`);
  }
  note(`--dwc-space on the window panel: ${onPanel || '(empty)'}; scale ${scale.join(' ')}`);
  const panel = await panelStyle(page, ['padding-top', 'row-gap']);
  note(
    `panel padding-top=${panel.values['padding-top'] ?? '(not read)'}, row-gap=${panel.values['row-gap'] ?? '(not read)'} ` +
      '(lines 34 to 40 set padding and gap to var(--dwc-space) through setPanelStyle("@element", ...))',
  );
  const messages = await directiveMessages(page);
  note(`DWC console: ${messages.length > 0 ? messages.join('; ') : 'no directive message'}`);
  expect(space, '--dwc-space resolves to a value in DWC on BBj 26.03').not.toBe('');
});

behaviourTest(
  `${BASE}LabelAttributes.bbj`,
  'Yes: the edit boxes carry the labels Name:, Company:, Email: as label attributes',
  {},
  async ({ page, note }) => {
    const wanted = [
      ['Name:', 'Joe Blow'],
      ['Company:', 'BASIS International Ltd.'],
      ['Email:', 'joeBlow@basis.com'],
    ];
    await expect(page.getByText('Using Label Attributes', { exact: true }).first(), 'window title').toBeVisible();
    const attributes = await page.locator('dwc-field').evaluateAll((els) => els.map((el) => el.getAttribute('label')));
    const statics = await page.locator('dwc-static-text').count();
    note(`label attribute of the edit boxes: ${attributes.join(', ')}; separate static texts: ${statics}`);
    note(`field values: ${(await page.getByRole('textbox').evaluateAll((els) => els.map((el) => el.value))).join(' | ')}`);

    for (const [label, value] of wanted) {
      await expect(page.getByText(label, { exact: true }), `label ${label} is visible`).toBeVisible();
      // the accessible name of the edit box is its label attribute
      await expect(page.getByRole('textbox', { name: label, exact: true }), `edit box labelled ${label}`).toHaveValue(value);
    }
    expect(attributes, 'label attributes of the three edit boxes').toEqual(['Name:', 'Company:', 'Email:']);
    expect(statics, 'no separate static texts before the fields').toBe(0);

    // Example 2 step 3: "attribute labels stay with their inputs" when the window is resized.
    await page.setViewportSize({ width: 420, height: 700 });
    await settle(page, 1500);
    const apart = [];
    for (const [index, [label]] of wanted.entries()) {
      const field = page.locator('dwc-field').nth(index);
      const box = await field.boundingBox();
      const text = await field.getByText(label, { exact: true }).boundingBox();
      const inside =
        box !== null &&
        text !== null &&
        text.x >= box.x - 1 &&
        text.y >= box.y - 1 &&
        text.x + text.width <= box.x + box.width + 1 &&
        text.y + text.height <= box.y + box.height + 1;
      note(`after resize to 420 px: ${label} at ${text && Math.round(text.x)},${text && Math.round(text.y)}, its field at ${box && Math.round(box.x)},${box && Math.round(box.y)}`);
      if (!inside) apart.push(label);
    }
    expect(apart, 'labels that left their edit box after the resize').toEqual([]);
  },
);

behaviourTest(`${BASE}LabelAttributes.bbj`, 'No: discrete labels as static texts', { startDialog: { button: 'No' } }, async ({ page, note }) => {
  const wanted = ['Name:', 'Company:', 'Email:'];
  await expect(page.getByText('Using Discrete Labels', { exact: true }).first(), 'window title').toBeVisible();
  const statics = page.locator('dwc-static-text');
  await expect(statics, 'three separate static texts').toHaveCount(3);
  const texts = (await statics.allTextContents()).map(flat);
  const attributes = await page.locator('dwc-field').evaluateAll((els) => els.map((el) => el.getAttribute('label')));
  note(`static texts: ${texts.join(', ')}; label attribute of the edit boxes: ${attributes.map((a) => a ?? 'none').join(', ')}`);
  expect(texts, 'the three labels as separate static texts').toEqual(wanted);
  expect(attributes, 'the edit boxes carry no label attribute').toEqual([null, null, null]);

  // Example 2 step 3 for the discrete labels: where each static text and its edit box are after a resize.
  // The page says they can separate; that is recorded, not asserted.
  await page.setViewportSize({ width: 420, height: 700 });
  await settle(page, 1500);
  for (const [index, label] of wanted.entries()) {
    const text = await statics.nth(index).boundingBox();
    const box = await page.locator('dwc-field').nth(index).boundingBox();
    const sameRow = text !== null && box !== null && text.y + text.height > box.y && text.y < box.y + box.height;
    note(
      `after resize to 420 px: ${label} at ${text && Math.round(text.x)},${text && Math.round(text.y)}, its edit box at ` +
        `${box && Math.round(box.x)},${box && Math.round(box.y)}${sameRow ? '' : ' (not on the same row)'}`,
    );
  }
});

// ---------------------------------------------------------------------------------------------
// TreeSearch.bbj: Example 1, steps 3 to 5. Two trees with their own search box (search-input) and a
// global search box that sets search-term on both; tree 1 has a custom search-nodata message; the
// code injects .first-tree and .second-tree rules with --dwc-tree-icon-fill (orange and blue).
// ---------------------------------------------------------------------------------------------

behaviourTest(
  `${BASE}TreeSearch.bbj`,
  'the search boxes narrow the trees and a term without a match shows the custom message',
  {},
  async ({ page, note }) => {
    const trees = page.locator('dwc-tree');
    await expect(trees, 'two trees').toHaveCount(2);
    const count = (n) => page.locator('dwc-tree').nth(n).getByRole('treeitem').count();
    await expect.poll(() => count(0), { message: 'items in tree 1', timeout: 15000 }).toBeGreaterThan(1);
    const before = [await count(0), await count(1)];
    note(`tree items before searching: tree 1 ${before[0]}, tree 2 ${before[1]}`);

    // Step 3a: the search box of the first tree narrows only that tree.
    const own = page.getByRole('searchbox', { name: 'Search first tree', exact: true });
    await own.pressSequentially('Beatles', { delay: 50 });
    await expect.poll(() => count(0), { message: 'tree 1 narrows to the term', timeout: 10000 }).toBeLessThan(before[0]);
    const afterOwn = [await count(0), await count(1)];
    note(`own search "Beatles": tree 1 ${afterOwn[0]} items (${(await treeItemNames(page, 0)).join(', ')}), tree 2 ${afterOwn[1]} items`);
    await own.fill('');
    await settle(page, 1000);
    note(`after clearing the box: tree 1 shows ${await count(0)} items`);

    // Step 3b: the global search box narrows both trees.
    const global = page.getByRole('searchbox', { name: 'Type to search both trees', exact: true });
    await global.pressSequentially('Silence', { delay: 50 });
    await expect.poll(() => count(0), { message: 'tree 1 narrows to the global term', timeout: 10000 }).toBeLessThan(before[0]);
    await expect.poll(() => count(1), { message: 'tree 2 narrows to the global term', timeout: 10000 }).toBeLessThan(before[1]);
    const afterGlobal = [await treeItemNames(page, 0), await treeItemNames(page, 1)];
    note(`global search "Silence": tree 1 ${afterGlobal[0].join(', ')}; tree 2 ${afterGlobal[1].join(', ')}`);

    // Step 4: a term without a match shows the custom search-nodata message of the first tree.
    await global.fill('');
    await global.pressSequentially('zzzqq', { delay: 50 });
    await expect.poll(() => count(0), { message: 'tree 1 has no match', timeout: 10000 }).toBe(0);
    const custom = page.getByText("Oops, we can't find that text in the tree!");
    const standard = await page.getByText('No data to display').count();
    note(`no match: custom message shown ${await custom.count()} time(s); standard "No data to display" shown ${standard} time(s) (tree 2 has no custom message)`);

    expect(afterOwn[0], 'own search leaves matching items in tree 1').toBeGreaterThan(0);
    expect(afterOwn[1], 'own search of tree 1 does not change tree 2').toBe(before[1]);
    expect(afterGlobal[0].join(','), 'tree 1 keeps the match of the global term').toContain('The Sound of Silence');
    expect(afterGlobal[1].join(','), 'tree 2 keeps the match of the global term').toContain('The Sound of Silence');
    await expect(custom, 'custom search-nodata message of the first tree').toBeVisible();
  },
);

behaviourTest(`${BASE}TreeSearch.bbj`, 'the first tree paints its icons orange and the second paints them blue', {}, async ({ page, note }) => {
  const trees = page.locator('dwc-tree');
  await expect(trees, 'two trees').toHaveCount(2);
  const fills = [];
  for (const n of [0, 1]) {
    fills.push(await trees.nth(n).evaluate((el) => getComputedStyle(el).getPropertyValue('--dwc-tree-icon-fill').trim()));
  }
  // Is a rule for either tree class anywhere in the page, also inside shadow roots?
  const rules = await page.evaluate(() => {
    let styles = 0;
    let hits = 0;
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.tagName === 'STYLE') {
          styles += 1;
          if (/\.(first|second)-tree/.test(el.textContent || '')) hits += 1;
        }
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    return { styles, hits };
  });
  const messages = await directiveMessages(page);
  note(`--dwc-tree-icon-fill on tree 1: ${fills[0] || '(empty)'}; on tree 2: ${fills[1] || '(empty)'} (the code sets #ffa726 and #64b5f6)`);
  note(`style elements with a .first-tree or .second-tree rule: ${rules.hits} of ${rules.styles}`);
  note(`DWC console: ${messages.length > 0 ? messages.join('; ') : 'no directive message'}`);
  const norm = (value) => value.toLowerCase().replace(/\s+/g, '');
  expect(norm(fills[0]), 'icon colour of the first tree (orange, #ffa726)').toMatch(/^(#ffa726|rgb\(255,167,38\))$/);
  expect(norm(fills[1]), 'icon colour of the second tree (blue, #64b5f6)').toMatch(/^(#64b5f6|rgb\(100,181,246\))$/);
});

// ---------------------------------------------------------------------------------------------
// Exercise-SearchBBjTreeComplete.bbj: the four goals of 90-exercise-search-bbjtree.mdx. The tree
// lists the artists of the CDStore CDINVENTORY table.
// ---------------------------------------------------------------------------------------------

behaviourTest(`${BASE}Exercise-SearchBBjTreeComplete.bbj`, 'the search box narrows the tree to the matching artist', {}, async ({ page, note }) => {
  const items = page.getByRole('treeitem');
  await expect.poll(() => items.count(), { message: 'tree items', timeout: 15000 }).toBeGreaterThan(2);
  const before = await items.count();
  // A term from the data itself: the first artist whose name is plain words (the root is called Root).
  const names = await treeItemNames(page, 0);
  const term = names.find((name) => name !== 'Root' && /^[A-Za-z]{4,}( [A-Za-z]+)*$/.test(name));
  if (!term) throw new BlockedError(`no plain artist name among the first tree items: ${names.slice(0, 6).join(', ')}`);
  note(`tree items before searching: ${before}; search term taken from the tree: "${term}"`);
  const box = page.getByRole('searchbox', { name: 'Search', exact: true });
  await expect(box, 'the search box above the tree (search-input)').toBeVisible();
  await box.pressSequentially(term, { delay: 50 });
  await expect.poll(() => items.count(), { message: 'the tree narrows to the term', timeout: 10000 }).toBeLessThan(before);
  const after = await treeItemNames(page, 0);
  note(`after searching "${term}": ${after.length} items (${after.slice(0, 6).join(', ')})`);
  await box.fill('');
  await settle(page, 1000);
  note(`after clearing the box: ${await items.count()} items`);
  expect(after, 'the matching artist stays in the tree').toContain(term);
});

behaviourTest(
  `${BASE}Exercise-SearchBBjTreeComplete.bbj`,
  'the tree is limited to 75vh and scrolls, and leaf nodes show the disc icon',
  {},
  async ({ page, note }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new BlockedError('the page has no viewport size');
    const limit = viewport.height * 0.75;
    const tree = page.locator('dwc-tree').first();
    await expect(tree, 'the tree is on the page').toBeVisible();
    const style = await tree.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        maxHeight: s.maxHeight,
        overflowY: s.overflowY,
        height: Math.round(el.getBoundingClientRect().height),
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    });
    note(
      `viewport height ${viewport.height} px (75vh = ${limit} px); tree max-height ${style.maxHeight}, overflow-y ${style.overflowY}, ` +
        `height ${style.height} px, scrollHeight ${style.scrollHeight} px, clientHeight ${style.clientHeight} px`,
    );

    // Goal 4: expand the first artist, then look for the disc icon on its albums (leaf nodes).
    const names = await treeItemNames(page, 0);
    const artist = names.find((name) => name !== 'Root');
    if (!artist) throw new BlockedError('no artist in the tree');
    const before = await page.getByRole('treeitem').count();
    await tree.getByRole('treeitem', { name: artist, exact: true }).first().getByRole('img').first().click({ timeout: 5000 });
    await expect.poll(() => page.getByRole('treeitem').count(), { message: `the artist ${artist} expands`, timeout: 10000 }).toBeGreaterThan(before);
    const icons = await page.locator('dwc-tree dwc-icon').evaluateAll((els) =>
      els.map((el) => ({ pool: el.getAttribute('pool'), name: el.getAttribute('name'), visible: el.checkVisibility() })),
    );
    const disc = icons.filter((icon) => icon.name === 'disc' && icon.pool === 'tabler' && icon.visible);
    note(`icons in the tree after expanding ${artist}: ${[...new Set(icons.map((i) => `${i.pool}:${i.name}`))].join(', ')}; visible tabler:disc icons: ${disc.length}`);
    const report = await iconReport(page);
    note(`iconReport: total ${report.total}, rendered ${report.rendered}, missing ${report.missing.length}`);

    expect(Number.parseFloat(style.maxHeight), 'max-height of the tree is 75vh (px)').toBeCloseTo(limit, 0);
    expect(style.height, 'the tree is no taller than 75vh (px)').toBeLessThanOrEqual(limit + 1);
    expect(style.overflowY, 'overflow of the tree').toMatch(/^(auto|scroll)$/);
    expect(style.scrollHeight, 'there is more content than the tree shows, so it scrolls (px)').toBeGreaterThan(style.clientHeight);
    expect(disc.length, 'leaf nodes show the tabler:disc icon').toBeGreaterThan(0);
  },
);
