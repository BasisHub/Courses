// Behaviour tests for the CSS layout samples of the DWC book, chapter "Flow Layouts and CSS for
// Responsive Design" (pages dwc/06-flow-layouts/index.md, Example 1 and Example 2). The sample files
// are in docs/examples/dwc/05_CssLayouts.
//
// Also the two exercise solutions (pages 91-exercise-css-flexbox.mdx and 90-exercise-css-grid-layout.mdx).
//
// The issue #7 tests for these files are in the panel style sweep, not here. The starters
// Exercise-ConvertToCssFlexbox.bbj and Exercise-ConvertToCssLayout.bbj are covered by smoke and that sweep.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { clickDialogButton, panelStyle, readDialogs, settle } from '../../lib/dwc.js';

const BASE = 'dwc/05_CssLayouts/';

/** Collapses every run of whitespace to one space. */
function flat(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
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

/** Clicks an option of a list box by its visible text. */
async function choose(page, option) {
  await page.getByRole('option', { name: option, exact: true }).first().click({ timeout: 5000 });
  await settle(page, 1000);
}

// ---------------------------------------------------------------------------------------------
// Example 1, DWCFlexbox.bbj and its legacy copy DWCFlexbox.BBj24.bbj. The child window "Flexbox
// Layout Preview" holds 15 boxes (3 visible at the start); the list boxes Wrap, Direction,
// Justification, Alignment and Item flex-grow change the flex style of that window with setStyle().
// ---------------------------------------------------------------------------------------------

const PREVIEW = 'Flexbox Layout Preview';

/** The preview child window (a fieldset with the legend "Flexbox Layout Preview"). */
function preview(page) {
  return page.getByRole('group', { name: PREVIEW });
}

/** Computed flex style of the preview window and the position and width of its visible boxes. */
async function previewState(page) {
  await expect(preview(page), 'the Flexbox Layout Preview window is visible').toBeVisible();
  const style = await preview(page).evaluate(
    (el) => {
      const s = getComputedStyle(el);
      return { display: s.display, direction: s.flexDirection, wrap: s.flexWrap, width: Math.round(el.getBoundingClientRect().width) };
    },
    undefined,
    { timeout: 5000 },
  );
  const boxes = await page.getByText(/^Box \d+$/).evaluateAll((els) =>
    els
      .filter((el) => el.checkVisibility())
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { name: el.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
      }),
  );
  return { ...style, boxes };
}

/** All boxes on one horizontal line. */
const inRow = (boxes) => boxes.length > 1 && boxes.every((b) => Math.abs(b.y - boxes[0].y) <= 2);
/** All boxes on one vertical line. */
const inColumn = (boxes) => boxes.length > 1 && boxes.every((b) => Math.abs(b.x - boxes[0].x) <= 2);
const where = (boxes) => boxes.map((b) => `${b.name.replace('Box ', '')}@${b.x},${b.y}`).join(' ');

/**
 * What BBjWebManager::injectLinkUrl made of the three calls in the injectCss routine. Each passes a
 * whole <link ...> tag where the first argument is a URL. Read before anything else: Playwright keeps
 * only the last 100 requests of a page.
 */
async function noteInjectedLinks(page, note) {
  await settle(page, 2500); // let the DWC component scripts finish loading
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('link')]
      .filter((l) => !/dwc-ui\.css$/.test(l.getAttribute('href') ?? ''))
      .map((l) => ({ rel: l.getAttribute('rel') ?? '', href: l.getAttribute('href') ?? '' })),
  );
  const urls = (await page.requests()).map((r) => r.url()).filter((u) => !/^wss?:/.test(u));
  const stray = urls.filter((u) => /fonts\.(googleapis|gstatic)\.com|%3Clink|<link/i.test(u));
  note(`injectLinkUrl made ${links.length} link elements; rel values: ${links.map((l) => `"${l.rel}"`).join(', ') || 'none'}`);
  note(`their href values start with: ${links.map((l) => l.href.slice(0, 18)).join(' | ') || 'none'} (a whole <link> tag as the URL)`);
  note(`requests seen: ${urls.length}; to Google Fonts or with a link tag in the URL: ${stray.length}`);
}

behaviourTest(
  `${BASE}DWCFlexbox.bbj`,
  'the options change the flex layout of the preview and the boxes follow the window width',
  {},
  async ({ page, note }) => {
    await noteInjectedLinks(page, note);

    // Start: the three visible boxes sit in a row in a flex container.
    const start = await previewState(page);
    note(`start: display ${start.display}, direction ${start.direction}, wrap ${start.wrap}, ${start.boxes.length} boxes ${where(start.boxes)}`);

    // Direction: column, then row-reverse.
    await choose(page, 'column');
    const column = await previewState(page);
    note(`after column: direction ${column.direction}, boxes ${where(column.boxes)}`);
    note(`legends after column: Justification (V) ${await page.getByRole('group', { name: 'Justification (V)' }).count()}, Alignment (H) ${await page.getByRole('group', { name: 'Alignment (H)' }).count()}`);
    await choose(page, 'row-reverse');
    const reverse = await previewState(page);
    note(`after row-reverse: direction ${reverse.direction}, boxes ${where(reverse.boxes)}`);

    // Wrap: wrap-reverse.
    await choose(page, 'wrap-reverse');
    const wrapped = await previewState(page);
    note(`after wrap-reverse: wrap ${wrapped.wrap}`);

    // Window resize (page step 2): with row and "grow equally" the boxes fill the preview, so their
    // width follows the browser width.
    await choose(page, 'row');
    await choose(page, 'grow equally');
    const wide = await previewState(page);
    await page.setViewportSize({ width: 560, height: 800 });
    await settle(page, 1000);
    const narrow = await previewState(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    note(`grow equally: preview width ${wide.width} to ${narrow.width} px, first box ${wide.boxes[0]?.w} to ${narrow.boxes[0]?.w} px at 1280 and 560 px viewport`);

    expect(start.display, 'the preview window uses display: flex').toBe('flex');
    expect(start.boxes.length, 'three boxes are visible at the start').toBe(3);
    expect(inRow(start.boxes), 'the boxes sit side by side in a row at the start').toBe(true);
    expect(column.direction, 'choosing column sets flex-direction: column').toBe('column');
    expect(inColumn(column.boxes), 'the boxes are stacked in a column after choosing column').toBe(true);
    expect(reverse.direction, 'choosing row-reverse sets flex-direction: row-reverse').toBe('row-reverse');
    expect(reverse.boxes[0].x, 'box 1 is right of box 2 after choosing row-reverse').toBeGreaterThan(reverse.boxes[1].x);
    expect(wrapped.wrap, 'choosing wrap-reverse sets flex-wrap: wrap-reverse').toBe('wrap-reverse');
    expect(narrow.boxes[0].w, 'the boxes get narrower when the window gets narrower').toBeLessThan(wide.boxes[0].w);
  },
);

behaviourTest(
  `${BASE}DWCFlexbox.bbj`,
  'Show CSS lists the current CSS styles and the BBj code in the Layout Information dialog',
  {},
  async ({ page, note }) => {
    await choose(page, 'row-reverse');
    await choose(page, 'wrap');

    // The CSS Preview window of this program shows the same styles all the time.
    const previewWindow = page.getByRole('group', { name: 'CSS Preview' });
    if ((await previewWindow.count()) > 0) {
      note(`CSS Preview window: ${flat(await previewWindow.first().textContent({ timeout: 5000 })).slice(0, 150)}`);
    }

    await page.getByRole('button', { name: 'Show CSS' }).click({ timeout: 5000 });
    await settle(page, 1500);
    const dialogs = await readDialogs(page);
    const text = flat(dialogs[0]?.text);
    note(`dialogs: ${dialogs.length}; title: ${dialogs[0]?.title}; buttons: ${(dialogs[0]?.buttons ?? []).join(', ')}`);
    const css = /Method 1: CSS Styles (.*?) Method 1: BBj Code (.*)$/.exec(text);
    note(`CSS in the dialog: ${css ? css[1].slice(0, 150) : 'section not found'}`);
    note(`BBj code in the dialog: ${css ? css[2].slice(0, 150) : 'section not found'}`);
    const tokens = await page.locator('dwc-dialog .token').count();
    note(`Prism highlighting: ${tokens} token elements in the dialog, typeof window.Prism is ${await page.evaluate(() => typeof window.Prism)}`);
    if (dialogs.length > 0) await clickDialogButton(page, dialogs[0].buttons[0]);

    expect(dialogs.length, 'Show CSS opens one dialog').toBe(1);
    expect(dialogs[0].title, 'the dialog title').toBe('Layout Information');
    expect(css, 'the dialog has a CSS Styles section and a BBj Code section').not.toBeNull();
    expect(css[1], 'the CSS section holds display: flex').toContain('display: flex');
    expect(css[1], 'the CSS section holds the chosen direction row-reverse').toMatch(/flex-(flow|direction): row-reverse/);
    expect(css[2], 'the BBj code sets the panel display to flex').toContain('setPanelStyle("display", "flex")');
    expect(css[2], 'the BBj code holds the chosen direction row-reverse').toMatch(/setPanelStyle\("flex-(flow|direction)", "row-reverse/);
  },
);

// The legacy copy: no page names it, so the chapter page is the spec. One test: it starts, shows the
// same preview and the options change it.
behaviourTest(
  `${BASE}DWCFlexbox.BBj24.bbj`,
  'the legacy copy shows the same flexbox preview and its options change it',
  {},
  async ({ page, note }) => {
    await noteInjectedLinks(page, note);
    const windows = await page.getByRole('group').evaluateAll((els) => els.map((el) => el.querySelector('legend')?.textContent ?? ''));
    note(`child windows: ${[...new Set(windows)].join(', ')}; Show CSS button: ${await page.getByRole('button', { name: 'Show CSS' }).count()}`);

    const start = await previewState(page);
    note(`start: display ${start.display}, direction ${start.direction}, wrap ${start.wrap}, ${start.boxes.length} boxes ${where(start.boxes)}`);
    await choose(page, 'column');
    const column = await previewState(page);
    note(`after column: direction ${column.direction}, boxes ${where(column.boxes)}`);

    expect(start.display, 'the preview window uses display: flex').toBe('flex');
    expect(start.boxes.length, 'three boxes are visible at the start').toBe(3);
    expect(inRow(start.boxes), 'the boxes sit side by side in a row at the start').toBe(true);
    expect(column.direction, 'choosing column sets flex-direction: column').toBe('column');
    expect(inColumn(column.boxes), 'the boxes are stacked in a column after choosing column').toBe(true);
  },
);

// ---------------------------------------------------------------------------------------------
// Example 2, DWCGrid.bbj. The list "Select a CSS Layout" has CSS Layout 1 to 9; each choice injects
// a rule for the form panel (the child window "CSS Layout") and shows the CSS in "CSS Preview".
// ---------------------------------------------------------------------------------------------

/** Computed grid columns of the form panel: the parent of the "First Name:" label. */
async function gridState(page) {
  return page
    .getByText('First Name:', { exact: true })
    .locator('xpath=..')
    .evaluate(
      (el) => {
        const s = getComputedStyle(el);
        const tracks = s.gridTemplateColumns === 'none' ? [] : s.gridTemplateColumns.split(' ').map(parseFloat);
        return { display: s.display, tracks };
      },
      undefined,
      { timeout: 5000 },
    );
}

behaviourTest(
  `${BASE}DWCGrid.bbj`,
  'choosing layouts 1 to 6 sets the column definitions the page lists',
  {},
  async ({ page, note }) => {
    const templates = ['auto 1fr', '1fr auto', '25% 1fr', '1fr 3fr', 'auto 1fr auto 1fr', 'repeat(2, auto 1fr)'];
    const states = [];
    let previewShows = 0;
    for (const [index, template] of templates.entries()) {
      await choose(page, `CSS Layout ${index + 1}`);
      const state = await gridState(page);
      states.push(state);
      const css = flat(await page.getByRole('group', { name: 'CSS Preview' }).textContent({ timeout: 5000 }));
      if (css.includes(`grid-template-columns: ${template}`)) previewShows += 1;
      note(`layout ${index + 1} (${template}): ${state.display}, columns ${state.tracks.map(Math.round).join(' ')}`);
    }
    note(`CSS Preview shows the column template of the chosen layout for ${previewShows} of 6 layouts`);
    // Line 145 sets "@app-style" with setAttribute, an attributes directive. The layouts themselves
    // arrive through injectStyle (lines 95 and 264), so the grids above do not depend on it.
    const directives = await directiveMessages(page);
    note(`DWC console: ${directives.length > 0 ? directives.join('; ') : 'no directive message'}`);

    // Layouts 5 and 6 always use four columns, also in a narrow window (page: "truncated when narrow").
    await page.setViewportSize({ width: 500, height: 800 });
    await settle(page, 800);
    const narrow6 = await gridState(page);
    await choose(page, 'CSS Layout 5');
    const narrow5 = await gridState(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    note(`at 500 px: layout 5 has ${narrow5.tracks.length} columns, layout 6 has ${narrow6.tracks.length}`);

    // The program's own style sheet: lines 226 to 235 define .winSelectCSS and .winCSSPreview, line 236
    // assigns style$ again with = instead of adding to it.
    const hasRule = await page.evaluate(() => [...document.querySelectorAll('style')].some((s) => /\.winSelectCSS/.test(s.textContent ?? '')));
    note(`a style element holds the .winSelectCSS rule of lines 226 to 235: ${hasRule}`);

    for (const [index, state] of states.entries()) {
      expect(state.display, `layout ${index + 1} is a CSS grid`).toBe('grid');
    }
    expect(states[0].tracks.length, 'layout 1 (auto 1fr) has two columns').toBe(2);
    expect(states[0].tracks[1], 'layout 1: the inputs are wider than the labels').toBeGreaterThan(states[0].tracks[0]);
    expect(states[1].tracks.length, 'layout 2 (1fr auto) has two columns').toBe(2);
    expect(states[1].tracks[0], 'layout 2: the labels are wider than the inputs').toBeGreaterThan(states[1].tracks[1]);
    expect(states[2].tracks.length, 'layout 3 (25% 1fr) has two columns').toBe(2);
    expect(states[2].tracks[0] / (states[2].tracks[0] + states[2].tracks[1]), 'layout 3: the labels take a quarter of the width').toBeCloseTo(0.25, 1);
    expect(states[3].tracks.length, 'layout 4 (1fr 3fr) has two columns').toBe(2);
    expect(states[3].tracks[1] / states[3].tracks[0], 'layout 4: the inputs are three times wider than the labels').toBeCloseTo(3, 1);
    expect(states[4].tracks.length, 'layout 5 has four columns').toBe(4);
    expect(states[5].tracks.length, 'layout 6 has four columns').toBe(4);
    expect(narrow5.tracks.length, 'layout 5 keeps four columns in a narrow window').toBe(4);
    expect(narrow6.tracks.length, 'layout 6 keeps four columns in a narrow window').toBe(4);
  },
);

behaviourTest(
  `${BASE}DWCGrid.bbj`,
  'layouts 7 to 9 add columns as the viewport gets wider, layout 8 shows 2, 4 and 6',
  {},
  async ({ page, note }) => {
    const widths = [500, 700, 1000, 1280];
    const counts = {};
    for (const layout of [7, 8, 9]) {
      await choose(page, `CSS Layout ${layout}`);
      counts[layout] = [];
      for (const width of widths) {
        await page.setViewportSize({ width, height: 800 });
        await settle(page, 600);
        counts[layout].push((await gridState(page)).tracks.length);
      }
      note(`layout ${layout}: columns at ${widths.join(' / ')} px viewport: ${counts[layout].join(' / ')}`);
    }
    await page.setViewportSize({ width: 1280, height: 800 });

    expect(counts[7][0], 'layout 7 has fewer columns at 500 px than at 1000 px').toBeLessThan(counts[7][2]);
    expect(counts[8].slice(0, 3), 'layout 8 shows 2, 4 and 6 columns at 500, 700 and 1000 px').toEqual([2, 4, 6]);
    expect(counts[9][0], 'layout 9 has fewer columns at 500 px than at 1000 px').toBeLessThan(counts[9][2]);
    for (const layout of [7, 9]) {
      expect(counts[layout][0], `layout ${layout} uses fewer than four columns in a narrow window`).toBeLessThan(4);
    }
  },
);

// ---------------------------------------------------------------------------------------------
// The exercise solutions. Both build a JsonObject of panel styles and apply it with
// window!.setPanelStyle("@element", json!.toString()), a style directive. On BBj 26.03 DWC logs that
// the style directives are no longer available, and the properties of the JSON never reach the panel.
// ---------------------------------------------------------------------------------------------

/** "label@x,y" (or "@x,y") of every dwc-field, for a note. */
function fieldPositions(page) {
  return page.locator('dwc-field').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.getAttribute('label') ?? el.getAttribute('placeholder') ?? ''}@${Math.round(r.x)},${Math.round(r.y)}`;
    }),
  );
}

// Exercise-ConvertToCssFlexboxComplete.bbj (page 91-exercise-css-flexbox.mdx). Lines 36 to 38 store
// the void result of setAttribute in BBjEditBox variables; the type check flags them. A probe program
// with the same statement (run once, not committed) showed what happens at runtime: no error at the
// assignment, the variable is null afterwards, and a later call on it ends with
// !ERROR=252 "Attempt to invoke method 'setText' on null object".
const FLEXBOX_COMPLETE = `${BASE}Exercise-ConvertToCssFlexboxComplete.bbj`;

behaviourTest(
  FLEXBOX_COMPLETE,
  'the form shows Name:, Company: and Email: with their values as label attributes',
  {},
  async ({ page, note }) => {
    const wanted = [
      ['Name:', 'Joe Blow'],
      ['Company:', 'BASIS International Ltd.'],
      ['Email:', 'joeBlow@basis.com'],
    ];
    const labels = await page.locator('dwc-field').evaluateAll((els) => els.map((el) => el.getAttribute('label')));
    const statics = await page.locator('dwc-static-text').count();
    const values = await page.getByRole('textbox').evaluateAll((els) => els.map((el) => el.value));
    note(`label attributes: ${labels.join(', ')}; values: ${values.join(' | ')}; separate static texts: ${statics}`);
    note('lines 36 to 38 assign the void result of setAttribute to BBjEditBox variables: no BBj error at runtime, the three label attributes reached the page');
    note('probe with the same statement (not committed): the variable is null afterwards, a later call on it fails with !ERROR=252 "Attempt to invoke method on null object"');
    note('this program never uses myName!, myCompany! or myEmail! again, so the void result breaks nothing here');

    for (const [label, value] of wanted) {
      await expect(page.getByText(label, { exact: true }), `label ${label} is visible`).toBeVisible();
      await expect(page.getByRole('textbox', { name: label, exact: true }), `edit box labelled ${label}`).toHaveValue(value);
    }
    expect(labels, 'label attributes of the three edit boxes').toEqual(['Name:', 'Company:', 'Email:']);
    expect(statics, 'the labels are attributes, not separate static texts').toBe(0);
  },
);

behaviourTest(FLEXBOX_COMPLETE, 'the window panel is a flexbox column with padding and a gap', {}, async ({ page, note }) => {
  const panel = await panelStyle(page, ['display', 'flex-direction', 'row-gap', 'padding-top']);
  const v = panel.values;
  note(`panel${panel.found ? '' : ' (not found)'}: display ${v.display}, flex-direction ${v['flex-direction']}, row-gap ${v['row-gap']}, padding-top ${v['padding-top']}`);
  note('lines 24 to 32 put display flex, flex-direction column, gap and padding in a JsonObject, applied with setPanelStyle("@element", ...)');
  note(`field positions: ${(await fieldPositions(page)).join(' ')}`);
  const directives = await directiveMessages(page);
  note(`DWC console: ${directives.length > 0 ? directives.join('; ') : 'no directive message'}`);

  expect(panel.found, 'the window panel is found').toBe(true);
  expect(v.display, 'the panel uses display: flex').toBe('flex');
  expect(v['flex-direction'], 'the panel lays out its controls in a column').toBe('column');
  expect(v['row-gap'], 'the panel has a gap between the controls').not.toMatch(/^(normal|0px)$/);
  expect(v['padding-top'], 'the panel has padding around the controls').not.toBe('0px');
});

// Exercise-ConvertToCssLayoutComplete-Grid.bbj (page 90-exercise-css-grid-layout.mdx): a contact
// form of eight labels and edit boxes and a Submit button that spans both columns.
const GRID_COMPLETE = `${BASE}Exercise-ConvertToCssLayoutComplete-Grid.bbj`;

behaviourTest(
  GRID_COMPLETE,
  'the window panel is a two-column CSS grid with padding, a gap and centered rows',
  {},
  async ({ page, note }) => {
    const panel = await panelStyle(page, ['display', 'grid-template-columns', 'align-items', 'row-gap', 'column-gap', 'padding-top']);
    const v = panel.values;
    const template = v['grid-template-columns'] ?? 'none';
    const columns = template === 'none' ? 0 : template.split(' ').length;
    note(`panel${panel.found ? '' : ' (not found)'}: display ${v.display}, columns ${columns} (${template.slice(0, 40)}), align-items ${v['align-items']}`);
    note(`gap ${v['row-gap']} / ${v['column-gap']}, padding-top ${v['padding-top']}`);
    note('lines 21 to 30 put display grid, grid-template-columns "auto 1fr", align-items center, gap and padding in a JsonObject, applied with setPanelStyle("@element", ...)');
    const labels = await page.locator('dwc-static-text').evaluateAll((els) =>
      els.slice(0, 4).map((el) => {
        const r = el.getBoundingClientRect();
        return `${el.textContent.trim()}@${Math.round(r.x)},${Math.round(r.y)}`;
      }),
    );
    note(`first four labels: ${labels.join(' ')}`);
    const directives = await directiveMessages(page);
    note(`DWC console: ${directives.length > 0 ? directives.join('; ') : 'no directive message'}`);

    expect(panel.found, 'the window panel is found').toBe(true);
    expect(v.display, 'the panel uses display: grid').toBe('grid');
    expect(columns, 'the grid has two columns').toBe(2);
    expect(v['align-items'], 'the rows are centered vertically').toBe('center');
    expect(v['row-gap'], 'the grid has a gap between its rows').not.toMatch(/^(normal|0px)$/);
    expect(v['padding-top'], 'the window has padding').not.toBe('0px');
  },
);

behaviourTest(GRID_COMPLETE, 'the Submit button spans both columns of the grid', {}, async ({ page, note }) => {
  const submit = page.getByRole('button', { name: 'Submit' });
  await expect(submit, 'the Submit button is visible').toBeVisible();
  // The grid item is the dwc-button host, not the inner button element.
  const host = page.locator('dwc-button').filter({ hasText: 'Submit' });
  const button = await host.evaluate(
    (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), right: Math.round(r.right), gridColumn: getComputedStyle(el).gridColumn };
    },
    undefined,
    { timeout: 5000 },
  );
  const label = await page.getByText('* First Name:', { exact: true }).boundingBox();
  const firstEdit = await page.locator('dwc-field').first().boundingBox();
  const lastEdit = await page.locator('dwc-field').last().boundingBox();
  note(`Submit: computed grid-column "${button.gridColumn}", x ${button.x} to ${button.right}, y ${button.y}`);
  note(`first label x ${Math.round(label.x)}; first edit box x ${Math.round(firstEdit.x)} to ${Math.round(firstEdit.x + firstEdit.width)}; last edit box bottom ${Math.round(lastEdit.y + lastEdit.height)}`);

  // The program validates the first and last name on Submit (lines 73 to 84); the page does not
  // describe it, so this is recorded and not asserted.
  let validation;
  try {
    await submit.click({ timeout: 5000 });
    await settle(page, 1500);
    const empty = await readDialogs(page);
    if (empty.length > 0) await clickDialogButton(page, empty[0].buttons[0]);
    // the first two edit boxes are First name and Last name
    await page.getByRole('textbox').nth(0).fill('Jane');
    await page.getByRole('textbox').nth(1).fill('Doe');
    await submit.click({ timeout: 5000 });
    await settle(page, 1500);
    const filled = await readDialogs(page);
    if (filled.length > 0) await clickDialogButton(page, filled[0].buttons[0]);
    validation = `empty names: "${empty[0]?.title}"; first and last name filled: "${filled[0]?.title}"`;
  } catch (error) {
    validation = `not completed: ${String(error.message).split('\n')[0]}`;
  }
  note(`Submit validation: ${validation}`);

  expect(button.gridColumn, 'setStyle("grid-column", "1 / 3") reached the Submit button').toBe('1 / 3');
  expect(button.x, 'the Submit button starts at the left edge of the first column').toBeLessThanOrEqual(label.x + 2);
  expect(button.right, 'the Submit button reaches the right edge of the second column').toBeGreaterThanOrEqual(firstEdit.x + firstEdit.width - 2);
});
