// Behaviour tests for the ARC file and grid samples of the DWC book, chapter "Upgrading Apps":
// 03B_ArcFiles (page dwc/04-upgrading-apps/01-arc-files.md) and 03C_Grid2GridEx (pages
// 02-upgrading-grids.md and 90-exercise-bbjgridexwidget.mdx).
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass. The grid samples need the BBjGridExWidget
// plug-in and the CDStore demo database; when one of them is missing, the BBj error shows up as the
// wrapper's finding and a hang as its timeout result.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { clickDialogButton, panelStyle, readDialogs } from '../../lib/dwc.js';

const ARC = 'dwc/03B_ArcFiles/';
const GRID = 'dwc/03C_Grid2GridEx/';

/** The track sizes of a computed grid-template-columns value, in px ('188px 188px' gives [188, 188]). */
function tracks(value) {
  return String(value ?? '')
    .split(/\s+/)
    .filter((part) => part !== '' && part !== 'none')
    .map((part) => Number.parseFloat(part));
}

/** Collapses every run of whitespace to one space. */
function flat(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Types a first and a last name into the two edit boxes of the ARC window, presses its button (the
 * .arc gives it the text "Button") and waits for the message box. Returns the message box
 * ({ title, text, buttons }) and closes it again.
 */
async function greet(page, note, first = 'Jane', last = 'Doe') {
  const boxes = page.getByRole('textbox');
  await expect(boxes, 'the window has two edit boxes').toHaveCount(2);
  await boxes.nth(0).fill(first);
  await boxes.nth(0).press('Tab');
  await boxes.nth(1).fill(last);
  await boxes.nth(1).press('Tab');
  await page.getByRole('button', { name: 'Button', exact: true }).click();
  await expect
    .poll(async () => (await readDialogs(page)).length, { message: 'a message box opens after the button', timeout: 15000 })
    .toBeGreaterThan(0);
  const [dialog] = await readDialogs(page);
  note(`message box "${dialog.title}": "${dialog.text}" with buttons ${dialog.buttons.join(', ')}`);
  await clickDialogButton(page, dialog.buttons[0] ?? 'OK').catch(() => {});
  return dialog;
}

/** Tag, text, box and grid placement of every control directly inside the window panel. */
function panelChildren(page) {
  return page.locator('dwc-window-content > *').evaluateAll((els) =>
    els.map((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        x: Math.round(box.x),
        y: Math.round(box.y),
        bottom: Math.round(box.bottom),
        position: style.position,
        column: style.gridColumnStart,
        row: style.gridRowStart,
        expanse: el.getAttribute('expanse'),
        theme: el.getAttribute('theme'),
      };
    }),
  );
}

// ---------------------------------------------------------------------------------------------
// ArcSample.bbj and DWCArcSample.bbj: 01-arc-files.md. Both read window 101 of ArcSample.arc, which
// holds the GRAVITY flag and adds BTN_OK first, then Firstname:, its edit box, Lastname:, its edit box.
// ---------------------------------------------------------------------------------------------

behaviourTest(`${ARC}ArcSample.bbj`, 'the button greets the name typed into the Firstname and Lastname boxes', {}, async ({ page, note }) => {
  await expect(page.getByText('Firstname:').first(), 'Firstname label').toBeVisible();
  await expect(page.getByText('Lastname:').first(), 'Lastname label').toBeVisible();
  await expect(page.getByRole('textbox'), 'two edit boxes').toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Button', exact: true }), 'the button of the .arc file').toBeVisible();
  note('window 101 of ArcSample.arc: labels Firstname: and Lastname:, 2 edit boxes and the button (text "Button") are visible');
  const dialog = await greet(page, note);
  expect(dialog.title, 'message box title').toBe('Hello World');
  expect(dialog.text, 'message box text').toContain('Hello Jane Doe');
});

behaviourTest(`${ARC}ArcSample.bbj`, 'GRAVITY gives a flow layout in the .arc add order with the button first', {}, async ({ page, note }) => {
  const panel = await panelStyle(page, ['display']);
  if (!panel.found) throw new BlockedError('no dwc-window-content element on the page');
  const children = await panelChildren(page);
  const order = children.map((c) => `${c.tag}${c.text === '' ? '' : ` "${c.text}"`}`);
  note(`panel display=${panel.values.display}; DOM order: ${order.join(', ')}`);
  note(`x of each control: ${children.map((c) => c.x).join(', ')}; positions: ${[...new Set(children.map((c) => c.position))].join(', ')}`);
  expect(children.map((c) => c.tag), 'controls in .arc add order (button, label, edit, label, edit)').toEqual([
    'dwc-button',
    'dwc-static-text',
    'dwc-field',
    'dwc-static-text',
    'dwc-field',
  ]);
  expect(children[0].text, 'the button added first is the first control').toBe('Button');
  expect(children.map((c) => c.x), 'controls run left to right in DOM order (flow layout)').toEqual([...children.map((c) => c.x)].sort((a, b) => a - b));
  expect(
    children.filter((c) => c.position === 'absolute'),
    'controls placed by pixel position (GRAVITY drops it)',
  ).toEqual([]);
});

behaviourTest(`${ARC}DWCArcSample.bbj`, 'the button greets the name typed into the Firstname and Lastname boxes', {}, async ({ page, note }) => {
  await expect(page.getByText('Firstname:').first(), 'Firstname label').toBeVisible();
  await expect(page.getByText('Lastname:').first(), 'Lastname label').toBeVisible();
  await expect(page.getByRole('button', { name: 'Button', exact: true }), 'the button of the .arc file').toBeVisible();
  note('window 101 of ArcSample.arc with CSS grid styling: both labels, 2 edit boxes and the button are visible');
  const dialog = await greet(page, note);
  expect(dialog.title, 'message box title').toBe('Hello World');
  expect(dialog.text, 'message box text').toContain('Hello Jane Doe');
});

behaviourTest(`${ARC}DWCArcSample.bbj`, 'CSS grid puts the button in column 2, row 4 below the edit boxes', {}, async ({ page, note }) => {
  const panel = await panelStyle(page, ['display', 'grid-template-columns', 'gap', 'padding']);
  if (!panel.found) throw new BlockedError('no dwc-window-content element on the page');
  const columns = tracks(panel.values['grid-template-columns']);
  const children = await panelChildren(page);
  const button = children.find((c) => c.tag === 'dwc-button');
  const fields = children.filter((c) => c.tag === 'dwc-field');
  if (!button || fields.length === 0) throw new BlockedError('no button or edit box found in the window panel');
  note(`panel display=${panel.values.display}, columns=${panel.values['grid-template-columns']}, gap=${panel.values.gap}, padding=${panel.values.padding}`);
  note(
    `button grid column ${button.column}, row ${button.row}, expanse ${button.expanse}, theme ${button.theme}; ` +
      `button x=${button.x}, y=${button.y}; edit boxes x=${fields.map((f) => f.x).join('/')}, bottom=${fields.map((f) => f.bottom).join('/')}`,
  );
  expect(panel.values.display, 'display of the panel').toBe('inline-grid');
  expect(columns.length, 'number of grid columns').toBe(2);
  expect(columns[1] / columns[0], 'the two columns are equally wide (1fr 1fr)').toBeCloseTo(1, 1);
  expect(button.column, 'grid column of the button').toBe('2');
  expect(button.row, 'grid row of the button').toBe('4');
  expect(button.y, 'the button sits below the edit boxes (px)').toBeGreaterThanOrEqual(Math.max(...fields.map((f) => f.bottom)));
  expect(Math.abs(button.x - fields[0].x), 'the button sits in the column of the edit boxes (px)').toBeLessThanOrEqual(4);
});

// ---------------------------------------------------------------------------------------------
// Grids: 02-upgrading-grids.md and 90-exercise-bbjgridexwidget.mdx.
// BBjGridExWidget renders an AG Grid (role grid, gridcell); BBjStandardGrid runs in the DWC as an
// HTML table (role table, cell).
// ---------------------------------------------------------------------------------------------

/** The data rows of an AG Grid, header row excluded. Only rows that are in the DOM count (AG Grid virtualises). */
function agDataRows(page) {
  return page.getByRole('row').filter({ has: page.getByRole('gridcell') });
}

/** The data rows of an HTML table, header row excluded. */
function tableDataRows(page) {
  return page.getByRole('row').filter({ has: page.getByRole('cell') });
}

/** Text of every header cell, trimmed (for notes; assertions use the accessible name, see expectColumns). */
function headerTexts(page) {
  return page.getByRole('columnheader').evaluateAll((els) => els.map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim()));
}

/** Every named column header is on the page (matched by its accessible name). */
async function expectColumns(page, names) {
  for (const name of names) {
    await expect(page.getByRole('columnheader', { name, exact: true }), `column header ${name}`).toBeVisible();
  }
}

/**
 * Notes and returns what an AG Grid shows: header texts, rows in the DOM, the total the grid reports
 * (aria-rowcount counts the header row too) and the first data row.
 */
async function observeAgGrid(page, note) {
  const grid = page.getByRole('grid').first();
  await expect(grid, 'the grid is on the page').toBeVisible();
  const rows = agDataRows(page);
  await expect.poll(() => rows.count(), { message: 'data rows in the grid', timeout: 15000 }).toBeGreaterThan(1);
  const headers = await headerTexts(page);
  const total = await grid.getAttribute('aria-rowcount');
  const first = (await rows.first().getByRole('gridcell').allTextContents()).map(flat);
  note(`columns in view: ${headers.join(', ')}; data rows in the DOM: ${await rows.count()}; grid reports aria-rowcount ${total ?? 'none'} (header included)`);
  note(`first row: ${first.slice(0, 4).join(' | ')}`);
  return { headers, first, total };
}

behaviourTest(`${GRID}DWCGridSample.bbj`, 'the grid shows the CDINVENTORY rows', {}, async ({ page, note }) => {
  const seen = await observeAgGrid(page, note);
  await expectColumns(page, ['CD Number', 'Title', 'Artist']);
  expect(seen.first[1], 'title cell of the first row').not.toBe('');
  expect(Number(seen.total ?? 0), 'rows the grid reports, header included').toBeGreaterThan(2);
});

behaviourTest(`${GRID}DWCGridSample.bbj`, 'selecting a row names the CD, title and artist', {}, async ({ page, note }) => {
  const rows = agDataRows(page);
  await expect.poll(() => rows.count(), { message: 'data rows in the grid', timeout: 15000 }).toBeGreaterThan(1);
  const cells = rows.first().getByRole('gridcell');
  const [cd, title, artist] = (await cells.allTextContents()).map(flat);
  await cells.nth(1).click();
  const message = page.getByText(/You selected/).first();
  await expect(message, 'the selection text appears after the click').toBeVisible({ timeout: 10000 });
  const shown = flat(await message.textContent());
  const expected = `You selected ${cd}: '${title}' by ${artist}`;
  note(`clicked row ${cd} / ${title} / ${artist}; the program shows: ${shown}`);
  if (artist !== title && shown === `You selected ${cd}: '${title}' by ${title}`) {
    note('the sentence repeats the title where the artist belongs (line 69 of the program reads the TITLE field twice)');
  }
  expect(shown, 'selection text (CD number, title and artist of the clicked row)').toBe(expected);
});

behaviourTest(`${GRID}GUIGridSample.bbj`, 'the grid shows the CDINVENTORY rows', {}, async ({ page, note }) => {
  const table = page.getByRole('table').first();
  await expect(table, 'the BBjStandardGrid shows as a table').toBeVisible();
  const rows = tableDataRows(page);
  await expect.poll(() => rows.count(), { message: 'data rows in the grid', timeout: 15000 }).toBeGreaterThan(1);
  const headers = await headerTexts(page);
  const first = (await rows.first().getByRole('cell').allTextContents()).map(flat);
  note(`columns: ${headers.join(', ')}; data rows: ${await rows.count()}`);
  note(`first row: ${first.slice(0, 4).join(' | ')}`);
  await expectColumns(page, ['CD Number', 'Title', 'Artist', 'Label', 'Playing Time', 'Quality', 'Musictype', 'Bin', 'Tracks', 'Stock', 'Cost', 'Retail']);
  expect(headers.length, 'number of column headers set by the program').toBe(12);
  expect(first[1], 'title cell of the first row').not.toBe('');
});

behaviourTest(`${GRID}GUIGridSample.bbj`, 'selecting a row names the CD, title and artist', {}, async ({ page, note }) => {
  const rows = tableDataRows(page);
  await expect.poll(() => rows.count(), { message: 'data rows in the grid', timeout: 15000 }).toBeGreaterThan(1);
  const cells = rows.first().getByRole('cell');
  const [cd, title, artist] = (await cells.allTextContents()).map(flat);
  await cells.nth(1).click();
  const message = page.getByText(/You selected/).first();
  await expect(message, 'the selection text appears after the click').toBeVisible({ timeout: 10000 });
  const shown = flat(await message.textContent());
  const expected = `You selected ${cd}: '${title}' by ${artist}`;
  note(`clicked row ${cd} / ${title} / ${artist}; the program shows: ${shown}`);
  expect(shown, 'selection text (CD number, title and artist of the clicked row)').toBe(expected);
});

/** The grid covers the browser canvas: its box against the viewport, noted in px. */
async function expectGridFillsWindow(page, note) {
  const viewport = page.viewportSize();
  if (!viewport) throw new BlockedError('the page has no viewport size');
  const grid = page.getByRole('grid').first();
  await expect(grid, 'the grid is on the page').toBeVisible();
  const box = await grid.boundingBox();
  const host = await page.locator('dwc-htmlview').first().boundingBox();
  const titleBar = await page.getByRole('button', { name: /^(Minimize|Maximize|Close)$/ }).count();
  note(
    `viewport ${viewport.width}x${viewport.height}; grid ${box && Math.round(box.width)}x${box && Math.round(box.height)}; ` +
      `dwc-htmlview ${host && Math.round(host.width)}x${host && Math.round(host.height)}; title bar buttons: ${titleBar}`,
  );
  expect(box, 'the grid has a box').not.toBeNull();
  expect(box.height / viewport.height, 'grid height as a share of the viewport height').toBeGreaterThanOrEqual(0.97);
  expect(box.width / viewport.width, 'grid width as a share of the viewport width').toBeGreaterThanOrEqual(0.97);
}

behaviourTest(`${GRID}Exercise-BBjGridExWidgetComplete.bbj`, 'the grid shows the CDINVENTORY rows', {}, async ({ page, note }) => {
  const seen = await observeAgGrid(page, note);
  await expectColumns(page, ['CDNUMBER', 'TITLE', 'ARTIST']); // setData creates the columns from the ResultSet
  expect(seen.first[1], 'title cell of the first row').not.toBe('');
  expect(Number(seen.total ?? 0), 'rows the grid reports, header included').toBeGreaterThan(2);
});

behaviourTest(`${GRID}Exercise-BBjGridExWidgetComplete.bbj`, 'the grid fills the browser window', {}, async ({ page, note }) => {
  await expectGridFillsWindow(page, note);
});

behaviourTest(
  `${GRID}DataRow_and_ResultSet/4_BBjGridExWidget.bbj`,
  'the grid shows the three ResultSet rows',
  {},
  async ({ page, note }) => {
    const grid = page.getByRole('grid').first();
    await expect(grid, 'the grid is on the page').toBeVisible();
    const rows = agDataRows(page);
    await expect.poll(() => rows.count(), { message: 'data rows in the grid', timeout: 15000 }).toBe(3);
    const headers = await headerTexts(page);
    const shown = [];
    for (let i = 0; i < (await rows.count()); i += 1) {
      shown.push((await rows.nth(i).getByRole('gridcell').allTextContents()).map(flat).join(' | '));
    }
    note(`columns: ${headers.join(', ')}; rows: ${shown.join(' ; ')}`);
    await expectColumns(page, ['LAST_NAME', 'FIRST_NAME']);
    expect([...shown].sort(), 'the three records the code adds to the ResultSet').toEqual(
      ['Picard | Jean-Luc', "Spock | S'Chn T'Gai", 'Uhura | Nyota'].sort(),
    );
  },
);

behaviourTest(`${GRID}DataRow_and_ResultSet/4_BBjGridExWidget.bbj`, 'the grid fills the browser window', {}, async ({ page, note }) => {
  await expectGridFillsWindow(page, note);
});
