// Issue #7: "it appears to be a pattern throughout that this way of setting styles to a panel doesn't
// work with BBj 26". Thirteen samples build a JsonObject of panel styles and apply it with
//
//     window!.setPanelStyle("@element", json!.toString())
//
// The sweep below checks every one of them: the computed style of the window panel is compared with
// the properties the JSON sets. The oracle is DWC2.bbj, which sets the same kind of styles one
// property at a time (setPanelStyle("display", "inline-grid") and its siblings).
//
// What a red test here means: the JSON never reached the panel. The panel is dwc-window-content (plan
// 06.2-08). A starter (Exercise-...) is covered like the solutions; its JSON is shorter, so its test
// checks only what the JSON sets.
//
// Controls are found by role and visible text; nothing is added to a sample. A red test is a finding:
// the sample is never changed, and an assertion is never weakened to make it pass.
import fs from 'node:fs';
import { test, expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { panelStyle } from '../../lib/dwc.js';

const D = 'dwc/';

/**
 * One row per file that calls setPanelStyle("@element", ...), written from reading each file.
 *   json     computed properties that must equal the value the JSON sets (computed form, so 'gap' is
 *            checked through row-gap and the track lists through the track counts below)
 *   columns  number of tracks of grid-template-columns (computed values are pixels: count, don't compare)
 *   rows     number of tracks of grid-template-rows
 *   spaced   the JSON sets gap and padding: row-gap must not be 'normal' or 0 and padding-top not 0
 *   what     the short form of the title
 */
const PANEL_JSON = [
  // 04_ExtendedAttributes
  { id: `${D}04_ExtendedAttributes/Exercise-SearchBBjTree.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, rows: 2, spaced: true },
  { id: `${D}04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, rows: 2, spaced: true },
  { id: `${D}04_ExtendedAttributes/LabelAttributes.bbj`, what: 'display grid', json: { display: 'grid', 'justify-items': 'stretch', 'align-items': 'stretch', 'box-sizing': 'border-box' }, columns: 1, spaced: true },
  { id: `${D}04_ExtendedAttributes/TreeSearch.bbj`, what: 'display grid', json: { display: 'grid', 'justify-items': 'stretch', 'align-items': 'stretch', 'box-sizing': 'border-box' }, columns: 1, rows: 3, spaced: true },
  // 05_CssLayouts (the two starters set only width, height and box-sizing)
  { id: `${D}05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj`, what: 'box-sizing border-box', json: { 'box-sizing': 'border-box' } },
  { id: `${D}05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj`, what: 'display flex', json: { display: 'flex', 'flex-direction': 'column', 'box-sizing': 'border-box' }, spaced: true },
  { id: `${D}05_CssLayouts/Exercise-ConvertToCssLayout.bbj`, what: 'box-sizing border-box', json: { 'box-sizing': 'border-box' } },
  { id: `${D}05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
  // 07_ControlValiation
  { id: `${D}07_ControlValiation/Exercise-BuiltInValidation.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
  { id: `${D}07_ControlValiation/Exercise-BuiltInValidationComplete.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
  { id: `${D}07_ControlValiation/builtInValidation.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
  { id: `${D}07_ControlValiation/formValidation.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
  { id: `${D}07_ControlValiation/javaScriptValidation-Required.bbj`, what: 'display grid', json: { display: 'grid', 'align-items': 'center', 'box-sizing': 'border-box' }, columns: 2, spaced: true },
];

/** Computed properties every row reads besides the ones its JSON sets. */
const EXTRA_PROPS = ['display', 'grid-template-columns', 'grid-template-rows', 'row-gap', 'column-gap', 'padding-top', 'box-sizing', 'width', 'height'];

/** Number of tracks in a computed grid-template-* value ('none' when the element is no grid). */
function trackCount(value) {
  const text = String(value ?? 'none').trim();
  return text === 'none' || text === '' ? 0 : text.split(/\s+/).length;
}

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

// The table must list exactly the files the manifest tags with issue 7 (13 of them).
test('issue #7 table: PANEL_JSON lists the 13 manifest entries that carry issue 7', async () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../../manifest.json', import.meta.url), 'utf8'));
  const tagged = manifest.entries.filter((entry) => (entry.issues ?? []).includes(7)).map((entry) => entry.id).sort();
  expect(PANEL_JSON, 'the table has one row per file').toHaveLength(13);
  expect(PANEL_JSON.map((row) => row.id).sort(), 'the table rows are the manifest entries with issue 7').toEqual(tagged);
});

// ---------------------------------------------------------------------------------------------
// The oracle. DWC2.bbj sets the panel style one property at a time (lines 11 to 14). If the same
// element shows those values, then the panel is found by the sweep below and a red sweep result means
// the JSON form did not reach it, not that the panel was looked up wrongly.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${D}01_GUI2BUI2DWC/DWC2.bbj`,
  'panel oracle: per-property setPanelStyle reaches the window panel',
  {},
  async ({ page, note }) => {
    const panel = await panelStyle(page, ['display', 'grid-template-columns', 'row-gap', 'padding-top', 'box-sizing']);
    const v = panel.values;
    const inline = await page.locator(panel.selector).first().getAttribute('style', { timeout: 3000 }).catch(() => null);
    note(`panel ${panel.selector}${panel.found ? '' : ' (not found)'}: display ${v.display}, columns ${trackCount(v['grid-template-columns'])} tracks (${v['grid-template-columns']})`);
    note(`gap ${v['row-gap']}, padding-top ${v['padding-top']}, box-sizing ${v['box-sizing']} (nothing sets box-sizing here: the panel default)`);
    note(`inline style of the panel element: ${inline ?? 'none'}`);
    note(`DWC console directive messages: ${(await directiveMessages(page)).length}`);
    if (!panel.found) throw new BlockedError(`panel element ${panel.selector} not found`);

    expect(v.display, 'setPanelStyle("display", "inline-grid") reaches the window panel').toBe('inline-grid');
    expect(trackCount(v['grid-template-columns']), 'setPanelStyle("grid-template-columns", "1fr 2fr") gives two tracks').toBe(2);
  },
);

// ---------------------------------------------------------------------------------------------
// The sweep: one issue #7 test per file.
// ---------------------------------------------------------------------------------------------
for (const row of PANEL_JSON) {
  behaviourTest(
    row.id,
    `setPanelStyle("@element", json) applies ${row.what} to the window panel`,
    { issue: 7 },
    async ({ page, note }) => {
      const props = [...new Set([...Object.keys(row.json), ...EXTRA_PROPS])];
      const panel = await panelStyle(page, props);
      if (!panel.found) throw new BlockedError(`panel element ${panel.selector} not found`);
      const v = panel.values;
      const inline = await page.locator(panel.selector).first().getAttribute('style', { timeout: 3000 }).catch(() => null);
      const parent = await page.locator(panel.selector).first().evaluate(
        (el) => {
          const box = el.parentElement ? el.parentElement.getBoundingClientRect() : null;
          return box ? `${Math.round(box.width)} x ${Math.round(box.height)}` : 'none';
        },
        undefined,
        { timeout: 3000 },
      ).catch(() => 'unknown');

      const columns = trackCount(v['grid-template-columns']);
      const rows = trackCount(v['grid-template-rows']);
      const mismatches = [];
      for (const [prop, want] of Object.entries(row.json)) {
        if (v[prop] !== want) mismatches.push(`${prop} ${v[prop]} (want ${want})`);
      }
      if (row.columns !== undefined && columns !== row.columns) mismatches.push(`columns ${columns} (want ${row.columns})`);
      if (row.rows !== undefined && rows !== row.rows) mismatches.push(`rows ${rows} (want ${row.rows})`);
      if (row.spaced) {
        if (/^(normal|0px)$/.test(v['row-gap'])) mismatches.push(`row-gap ${v['row-gap']} (want gap)`);
        if (v['padding-top'] === '0px') mismatches.push('padding-top 0px (want padding)');
      }

      // Most important first: the evidence of a result is cut at 700 characters.
      note(`computed vs JSON, ${mismatches.length} differ: ${mismatches.join('; ') || 'none'}`);
      note(`inline style of the panel element: ${inline ?? 'none'}`);
      const directives = await directiveMessages(page);
      note(`DWC console: ${directives.length > 0 ? directives.join('; ') : 'no directive message'}`);
      note(`panel ${v.width} x ${v.height} in a parent of ${parent} (JSON sets width and height 100%)`);

      if (row.json.display !== undefined) {
        expect(v.display, `the panel uses display: ${row.json.display}`).toBe(row.json.display);
      }
      expect(mismatches, 'the panel shows every property of the JSON').toEqual([]);
    },
  );
}
