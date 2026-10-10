// Behaviour tests for the runnable programs of the book "Introduction to BBj Development"
// (docs/docs/intro-bbj). The sample files are in docs/examples/intro-bbj. The programs are dialogs,
// two lesson programs, a layout exercise and the Tic-Tac-Toe exercises. 06.1-HUMAN-UAT recorded
// the expected behaviour of the exercise solutions by hand (tests 6 to 10); these tests make that
// repeatable.
//
// Controls are found by role and visible text. Message boxes are read with readDialogs and answered
// with clickDialogButton. A red test is a finding: the sample is never changed, and an assertion is
// never weakened to make it pass.
import fs from 'node:fs';
import path from 'node:path';
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { clickDialogButton, consolePresent, panelStyle, readConsole, readDialogs, settle } from '../../lib/dwc.js';
import { parseConsole } from '../../lib/console.js';

const BASE = 'intro-bbj/';

/** Whitespace-collapsed text of a message box. */
const textOf = (dialog) => (dialog ? dialog.text.replace(/\s+/g, ' ').trim() : '');
const describeBox = (dialog) => (dialog ? `"${dialog.title}": "${textOf(dialog)}" [${dialog.buttons.join(', ')}]` : 'no message box');

/** Selects the whole content of an edit box and types the text; an empty text deletes the content. */
async function enter(page, box, text) {
  await box.click({ timeout: 5000 });
  await box.press('ControlOrMeta+A');
  if (text === '') await box.press('Delete');
  else await box.pressSequentially(text);
  await settle(page, 300);
}

/** Waits until at least one message box is on the page and returns all of them. */
async function waitForDialogs(page) {
  await expect
    .poll(async () => (await readDialogs(page)).length, { message: 'a message box appears', timeout: 10000 })
    .toBeGreaterThan(0);
  return readDialogs(page);
}

/** Answers a message box with its first button and waits until it is gone. */
async function dismiss(page, dialog) {
  await clickDialogButton(page, dialog.buttons[0]);
  await expect
    .poll(async () => (await readDialogs(page)).length, { message: 'the message box closes', timeout: 8000 })
    .toBe(0);
}

// ---------------------------------------------------------------------------------------------
// BetterHelloWorld.bbj. Page 01-getting-started/04-better-hello-world.mdx: "a true Window and a
// Button. When the user pushes the button, we want to show our MessageBox". The code shows the
// message "Hello World" with the title "Greetings!" and the OK button.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}better-hello-world/BetterHelloWorld.bbj`,
  'Push Me shows a message box "Hello World" titled "Greetings!"',
  {},
  async ({ page, note }) => {
    const push = page.getByRole('button', { name: 'Push Me' });
    await expect(push, 'the Push Me button is visible').toBeVisible({ timeout: 10000 });
    note(`window "${await page.title()}" with the Push Me button; no message box before the push: ${(await readDialogs(page)).length === 0}`);

    await push.click({ timeout: 5000 });
    const dialogs = await waitForDialogs(page);
    note(`after the push: ${dialogs.length} message box(es), ${describeBox(dialogs[0])}`);
    expect(dialogs.length, 'one message box').toBe(1);
    expect(dialogs[0].title, 'message box title').toBe('Greetings!');
    expect(textOf(dialogs[0]), 'message box text').toBe('Hello World');

    await dismiss(page, dialogs[0]);
    await expect(push, 'the window stays open after the message box').toBeVisible({ timeout: 5000 });
    note('OK closes the message box and the window with its button stays');
  },
);

// ---------------------------------------------------------------------------------------------
// dwc-lesson-start/Sample.bbj. Page 03-web-development/03-developing-for-the-web.mdx: "two input
// fields and a button, and uses pixel-oriented layout instructions". The window is 800 x 600; the
// controls sit at the pixel positions of lines 3 to 7.
// ---------------------------------------------------------------------------------------------

/** Position (relative to the window panel), size and CSS position of a DWC control. */
async function placeOf(locator) {
  return locator.evaluate(
    (el) => {
      const panel = el.closest('dwc-window-content');
      const p = panel.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x - p.x),
        y: Math.round(r.y - p.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        position: getComputedStyle(el).position,
      };
    },
    undefined,
    { timeout: 5000 },
  );
}

const placeText = (p) => `${p.x},${p.y} ${p.w}x${p.h} ${p.position}`;

behaviourTest(
  `${BASE}dwc-lesson-start/Sample.bbj`,
  'the form is laid out in pixels: two labels, two edit boxes and the Say Hello button',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'Say Hello' }), 'the Say Hello button is visible').toBeVisible({ timeout: 10000 });
    const panel = await page.locator('dwc-window-content').first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(el).display, cls: el.className };
    });
    // [name, locator, x, y, width, height] as written in lines 3 to 7 of the program
    const expected = [
      ['label Firstname:', page.getByText('Firstname:', { exact: true }), 10, 10, 200, 20],
      ['first edit box', page.locator('dwc-field').nth(0), 210, 10, 200, 20],
      ['label Lastname:', page.getByText('Lastname:', { exact: true }), 10, 40, 200, 20],
      ['second edit box', page.locator('dwc-field').nth(1), 210, 40, 200, 20],
      ['Say Hello button', page.locator('dwc-button').filter({ hasText: 'Say Hello' }), 10, 70, 400, 30],
    ];
    const seen = [];
    const mismatches = [];
    for (const [name, locator, x, y, w, h] of expected) {
      const p = await placeOf(locator);
      seen.push(`${name} ${placeText(p)}`);
      if (p.position !== 'absolute') mismatches.push(`${name}: position ${p.position}, expected absolute`);
      if (Math.abs(p.x - x) > 1 || Math.abs(p.y - y) > 1) mismatches.push(`${name}: at ${p.x},${p.y}, expected ${x},${y}`);
      if (Math.abs(p.w - w) > 1 || Math.abs(p.h - h) > 1) mismatches.push(`${name}: ${p.w}x${p.h}, expected ${w}x${h}`);
    }
    note(`${mismatches.length} differences from the pixel positions in the code: ${mismatches.join('; ') || 'none'}`);
    note(`window panel ${panel.w}x${panel.h}, display ${panel.display}, class "${panel.cls}"`);
    note(`controls (x,y w x h, css position): ${seen.join('; ')}`);

    expect(await page.getByRole('textbox').count(), 'two input fields').toBe(2);
    expect(mismatches, 'every control sits at its pixel position').toEqual([]);
    expect(panel.display, 'the pixel version does not lay the panel out with a CSS grid').not.toBe('grid');
  },
);

behaviourTest(
  `${BASE}dwc-lesson-start/Sample.bbj`,
  'Say Hello shows a message box titled "Hello World" with the typed names',
  {},
  async ({ page, note }) => {
    const boxes = page.getByRole('textbox');
    await expect(boxes.nth(1), 'the second edit box is visible').toBeVisible({ timeout: 10000 });
    await enter(page, boxes.nth(0), 'Jane');
    await enter(page, boxes.nth(1), 'Doe');
    await page.getByRole('button', { name: 'Say Hello' }).click({ timeout: 5000 });
    const dialogs = await waitForDialogs(page);
    note(`after Say Hello: ${dialogs.length} message box(es), ${describeBox(dialogs[0])}`);
    // The listing on the page greets with "Hello", the downloadable file with "Hallo": noted, not asserted.
    note('the page listing reads "Hello" + names; the sample file reads "Hallo" + names');

    expect(dialogs.length, 'one message box').toBe(1);
    expect(dialogs[0].title, 'message box title').toBe('Hello World');
    expect(textOf(dialogs[0]), 'the message names both typed values').toMatch(/Jane Doe$/);
    await dismiss(page, dialogs[0]);
  },
);

// ---------------------------------------------------------------------------------------------
// dwc-lesson-result/Sample.bbj. Page 03-web-development/08-external-css-file.mdx: the three
// setPanelStyle lines become addPanelStyle("mypanel"), and sample.css (display: inline-grid,
// grid-template-columns: 1fr 1fr, gap: 5px) is registered with the app in Enterprise Manager;
// "You should again see the program with the nice grid layout". The program does not read sample.css
// itself and the harness registers no CSS file, so the test applies the file in the browser, the way
// the page's registration step would, and notes how the page looks without it.
// ---------------------------------------------------------------------------------------------
const SAMPLE_CSS = path.resolve(import.meta.dirname, '../../../../docs/examples/intro-bbj/dwc-lesson-result/sample.css');

behaviourTest(
  `${BASE}dwc-lesson-result/Sample.bbj`,
  'the panel takes the mypanel class and, with sample.css registered, becomes a two-column grid',
  {},
  async ({ page, note }) => {
    const button = page.locator('dwc-button').filter({ hasText: 'Say Hello' });
    await expect(button, 'the Say Hello button is visible').toBeVisible({ timeout: 10000 });

    const read = () =>
      page.locator('dwc-window-content').first().evaluate((panel) => {
        const style = getComputedStyle(panel);
        const p = panel.getBoundingClientRect();
        const b = [...panel.querySelectorAll('dwc-button')].find((e) => e.textContent.trim() === 'Say Hello');
        const r = b.getBoundingClientRect();
        return {
          cls: panel.className,
          inline: panel.getAttribute('style'),
          display: style.display,
          columns: style.gridTemplateColumns,
          gap: style.columnGap,
          buttonX: Math.round(r.x - p.x),
          buttonColumn: getComputedStyle(b).gridColumnStart,
          expanse: b.getAttribute('expanse'),
          theme: b.getAttribute('theme'),
          buttonInline: b.getAttribute('style'),
        };
      });

    const before = await read();
    note(`without sample.css registered: panel class "${before.cls}", display ${before.display}, inline style ${before.inline}`);
    note(`button: grid-column ${before.buttonColumn} (inline style "${before.buttonInline}"), expanse ${before.expanse}, theme ${before.theme}`);

    // The registration step of the page, done in the browser: the same CSS text, as a style element.
    await page.addStyleTag({ content: fs.readFileSync(SAMPLE_CSS, 'utf8') });
    await settle(page, 500);
    const after = await read();
    const tracks = after.columns === 'none' ? [] : after.columns.split(/\s+/).map(Number.parseFloat);
    note(`with sample.css applied: display ${after.display}, columns ${after.columns}, gap ${after.gap}, button x ${after.buttonX}px`);

    // What the program sets itself (lines 12, 21, 23 and 24).
    expect(before.cls, 'addPanelStyle puts the mypanel class on the window panel').toContain('mypanel');
    expect(before.buttonColumn, 'setStyle("grid-column", "2") reaches the button').toBe('2');
    expect(before.expanse, 'the button attribute expanse').toBe('xl');
    expect(before.theme, 'the button attribute theme').toBe('success');
    // What the registered CSS file makes of the class.
    expect(after.display, 'sample.css: display').toBe('inline-grid');
    expect(tracks.length, 'sample.css: two grid columns').toBe(2);
    expect(Math.abs(tracks[0] - tracks[1]), 'sample.css: the columns are equal (1fr 1fr)').toBeLessThan(1);
    expect(after.gap, 'sample.css: gap').toBe('5px');
    expect(after.buttonX, 'the button sits in the second column').toBeGreaterThanOrEqual(Math.round(tracks[0]));
  },
);

// ---------------------------------------------------------------------------------------------
// LoginDialog.bbj. Page 02-object-oriented-syntax/90-exercise-login-dialog.mdx: user name
// "demo", password "bbj-demo" (labelled demo values of the exercise); show() returns TRUE after a
// correct login and FALSE after Cancel; "When the user tries to enter an invalid username/password
// combination, an error message should appear like 'Please check your input' and the dialog should
// remain open." The main flow reports the result in a message box. 06.1-HUMAN-UAT test 8.
// ---------------------------------------------------------------------------------------------
const DEMO_USER = 'demo';
const DEMO_PASSWORD = 'bbj-demo';

/** The user name and password edit boxes of a login dialog (the password box is a textbox too). */
function loginBoxes(page) {
  return { user: page.getByRole('textbox').nth(0), password: page.getByRole('textbox').nth(1) };
}

async function attemptLogin(page, user, password) {
  const { user: userBox, password: passwordBox } = loginBoxes(page);
  if (user !== null) await enter(page, userBox, user);
  if (password !== null) await enter(page, passwordBox, password);
  await page.getByRole('button', { name: 'Login' }).click({ timeout: 5000 });
}

behaviourTest(
  `${BASE}exercises/LoginDialog.bbj`,
  'the demo pair is accepted and the program reports "Login accepted."',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'Login' }), 'the Login button is visible').toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Cancel' }), 'the Cancel button is visible').toBeVisible();
    note(`dialog "${await page.title()}": User name and Password fields ${(await page.getByRole('textbox').count())} edit boxes, password type input ${await page.locator('input[type="password"]').count()}`);

    await attemptLogin(page, DEMO_USER, DEMO_PASSWORD);
    const dialogs = await waitForDialogs(page);
    const dialogGone = (await page.getByRole('textbox').count()) === 0;
    note(`after the demo pair: ${dialogs.length} message box(es), ${describeBox(dialogs[0])}; the login dialog is gone: ${dialogGone}`);

    expect(dialogs.length, 'one message box').toBe(1);
    expect(textOf(dialogs[0]), 'result message').toBe('Login accepted.');
    expect(dialogs[0].title, 'result message title').toBe('Login');
    expect(dialogGone, 'the dialog closed before the result is reported').toBe(true);
    await dismiss(page, dialogs[0]);
  },
);

behaviourTest(
  `${BASE}exercises/LoginDialog.bbj`,
  'a wrong pair shows "Please check your input" and the dialog stays; Cancel gives "Login canceled."',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'Login' }), 'the Login button is visible').toBeVisible({ timeout: 10000 });
    const { user, password } = loginBoxes(page);

    // a wrong pair
    await attemptLogin(page, DEMO_USER, 'not-the-password');
    const wrong = await waitForDialogs(page);
    note(`wrong pair: ${wrong.length} message box(es), ${describeBox(wrong[0])}`);
    await dismiss(page, wrong[0]);
    const stays = await page.getByRole('button', { name: 'Login' }).isVisible();
    const userAfter = await user.inputValue();
    const passwordAfter = await password.inputValue();
    note(`after the message: dialog still open ${stays}; user name field "${userAfter}", password field has ${passwordAfter.length} characters`);

    // an empty password is no pair either
    await page.getByRole('button', { name: 'Login' }).click({ timeout: 5000 });
    const empty = await waitForDialogs(page);
    note(`empty password: ${empty.length} message box(es), ${describeBox(empty[0])}`);
    await dismiss(page, empty[0]);

    // Cancel ends the dialog and the program reports it
    await page.getByRole('button', { name: 'Cancel' }).click({ timeout: 5000 });
    const canceled = await waitForDialogs(page);
    note(`Cancel: ${canceled.length} message box(es), ${describeBox(canceled[0])}`);

    expect(wrong.length, 'a wrong pair shows one message box').toBe(1);
    expect(textOf(wrong[0]), 'wrong pair message').toBe('Please check your input');
    expect(stays, 'the dialog remains open after the wrong pair').toBe(true);
    expect(empty.length, 'an empty password shows one message box').toBe(1);
    expect(textOf(empty[0]), 'empty password message').toBe('Please check your input');
    expect(canceled.length, 'Cancel shows one message box').toBe(1);
    expect(textOf(canceled[0]), 'Cancel result').toBe('Login canceled.');
    await dismiss(page, canceled[0]);
  },
);

// ---------------------------------------------------------------------------------------------
// ResponsiveLoginDialog.bbj. Page 03-web-development/90-exercise-responsive-login-dialog.mdx:
// "From 600px up the dialog is a centered card of fixed width on a tinted background, and below
// 600px it fills the screen." The login logic is the one of LoginDialog.bbj. 06.1-HUMAN-UAT test 10.
// The card is the innermost window panel that holds the Login button.
// ---------------------------------------------------------------------------------------------

/** Resizes the viewport and measures the card against it. */
async function cardAt(page, width) {
  const height = 800;
  await page.setViewportSize({ width, height });
  await settle(page, 800);
  const card = page.locator('dwc-window-content').filter({ has: page.getByRole('button', { name: 'Login' }) }).last();
  const box = await card.boundingBox();
  if (box === null) throw new Error(`no card found at ${width}px`);
  const style = await card.evaluate((el) => ({ cls: el.className, display: getComputedStyle(el).display, radius: getComputedStyle(el).borderTopLeftRadius }));
  return {
    width,
    height,
    box,
    centerOffset: Math.round(box.x + box.width / 2 - width / 2),
    ...style,
  };
}

const cardText = (c) =>
  `${c.width}px: card ${Math.round(c.box.width)}x${Math.round(c.box.height)} at x ${Math.round(c.box.x)} (center offset ${c.centerOffset}px, radius ${c.radius})`;

behaviourTest(
  `${BASE}exercises/ResponsiveLoginDialog.bbj`,
  'from 600 px the login dialog is a centered card, below 600 px it fills the screen',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'Login' }), 'the Login button is visible').toBeVisible({ timeout: 10000 });
    const wide = await cardAt(page, 1024);
    const edge = await cardAt(page, 600);
    const narrow = await cardAt(page, 599);
    const phone = await cardAt(page, 500);
    note(`card panel class "${wide.cls}", display ${wide.display}`);
    note(cardText(wide));
    note(cardText(edge));
    note(cardText(narrow));
    note(cardText(phone));
    note(`at 500 px the card is ${Math.round(phone.box.height)} px tall in an ${phone.height} px viewport`);

    // From 600 px: narrower than the viewport and centered within 10 px.
    for (const c of [wide, edge]) {
      expect(c.box.width, `${c.width}px: the card is narrower than the viewport`).toBeLessThan(c.width - 40);
      expect(Math.abs(c.centerOffset), `${c.width}px: the card is horizontally centered`).toBeLessThanOrEqual(10);
    }
    // Below 600 px: the card fills the screen (a thin border of the child container is allowed).
    for (const c of [narrow, phone]) {
      expect(c.box.width, `${c.width}px: the card fills the width`).toBeGreaterThanOrEqual(c.width - 4);
      expect(c.box.height, `${c.width}px: the card fills the height`).toBeGreaterThanOrEqual(c.height - 4);
    }
  },
);

behaviourTest(
  `${BASE}exercises/ResponsiveLoginDialog.bbj`,
  'the demo pair is accepted and the program reports "Login accepted."',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'Login' }), 'the Login button is visible').toBeVisible({ timeout: 10000 });
    await attemptLogin(page, DEMO_USER, DEMO_PASSWORD);
    const dialogs = await waitForDialogs(page);
    note(`after the demo pair: ${dialogs.length} message box(es), ${describeBox(dialogs[0])}`);

    expect(dialogs.length, 'one message box').toBe(1);
    expect(textOf(dialogs[0]), 'result message').toBe('Login accepted.');
    await dismiss(page, dialogs[0]);
  },
);

// ---------------------------------------------------------------------------------------------
// MyDialog.bbj. Page 02-object-oriented-syntax/04-oo-dialog.mdx: "a small dialog to take user input
// and return it to the calling program"; the screenshot shows a small window titled Your Input with
// one text field showing the word input and an Ok button. The main flow (line 49) prints the value
// the dialog returns, so the printed text is read from the console after the dialog closed.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}oo-samples/MyDialog.bbj`,
  'the dialog shows "input" and an Ok button; the typed value is printed after Ok',
  {},
  async ({ page, note }) => {
    const field = page.getByRole('textbox');
    const ok = page.getByRole('button', { name: 'Ok' });
    await expect(ok, 'the Ok button is visible').toBeVisible({ timeout: 10000 });
    expect(await page.title(), 'window title').toBe('Your Input');
    expect(await field.count(), 'one text field').toBe(1);
    const start = await field.first().inputValue();
    note(`window "${await page.title()}": one text field showing "${start}" and the Ok button`);

    // The class disables Ok while the field is empty (onInputChanged): noted, the page does not claim it.
    await enter(page, field.first(), '');
    const disabledWhenEmpty = await page.locator('dwc-button').filter({ hasText: 'Ok' }).first().evaluate((el) => el.hasAttribute('disabled'));
    note(`with an empty field Ok is disabled: ${disabledWhenEmpty}`);

    const typed = 'Hello BBj';
    await enter(page, field.first(), typed);
    await ok.click({ timeout: 5000 });

    await expect.poll(() => consolePresent(page), { message: 'the console appears after the dialog closed', timeout: 15000 }).toBe(true);
    const lines = await readConsole(page, { waitForReadyMs: 10000 });
    const parsed = lines ? parseConsole(lines) : { printed: [], errors: [], ready: false };
    note(`printed after Ok: ${JSON.stringify(parsed.printed)}; console ended with READY: ${parsed.ready}`);
    note(`the dialog window is gone: ${(await page.locator('dwc-window-content').count()) === 0}`);

    expect(start, 'the text field starts with the value the program passes in').toBe('input');
    expect(parsed.printed, 'the program prints the typed value').toContain(typed);
  },
);

// ---------------------------------------------------------------------------------------------
// The Tic-Tac-Toe exercises. All three programs lay out nine cell buttons (control IDs 101 to 109, in
// reading order), a status line and a New game button. Cells have no text of their own, so they are
// the buttons of the window panel in DOM order; a mark is the text of the button. The status line is
// the first static text of the panel.
//   TicTacToe.bbj (page 01-getting-started/90-exercise-tic-tac-toe.mdx; 06.1-HUMAN-UAT test 6): "shows
//     the player who is up for the next move", "check with every move if one of the players won";
//     UAT: turns alternate, a line of three on the ninth move still wins, a full board without a
//     line is a draw, a click on an occupied cell is ignored, New game resets the board.
//   TicTacToeComputer.bbj (91-exercise-computer-player.mdx; UAT test 7): the computer plays O, the
//     list button switches between Random and MinMax while you play, MinMax never loses.
//   oo-tic-tac-toe/PlayTicTacToe.bbj (02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx; UAT
//     test 9): the object-oriented version behaves like TicTacToe.bbj.
// ---------------------------------------------------------------------------------------------

/** The window's buttons: cells 1 to 9 are index 0 to 8; the New game button is found by name. */
const panelButtons = (page) => page.locator('dwc-window-content').getByRole('button');

/** The nine cell marks ("X", "O" or "") in reading order. */
async function marks(page) {
  const all = await page
    .locator('dwc-window-content dwc-button')
    .evaluateAll((els) => els.map((e) => e.textContent.trim()), undefined, { timeout: 5000 });
  return all.slice(0, 9);
}

/** The text of the status line. */
async function statusLine(page) {
  return ((await page.locator('dwc-window-content dwc-static-text').first().textContent({ timeout: 5000 })) ?? '').trim();
}

const boardText = (b) => b.map((m) => (m === '' ? '.' : m)).join('');
const countOf = (b, mark) => b.filter((m) => m === mark).length;

/** Clicks a cell (1 to 9) and waits until it shows a mark; returns the board (unchanged after 6 s). */
async function playCell(page, cell) {
  await panelButtons(page).nth(cell - 1).click({ timeout: 5000 });
  const deadline = Date.now() + 6000;
  for (;;) {
    const b = await marks(page);
    if (b[cell - 1] !== '' || Date.now() > deadline) return b;
    await page.waitForTimeout(150);
  }
}

/**
 * The status line once it reads one of the wanted texts (the program sets the cell first and the
 * status line a moment later); the last text seen after `ms` when none of them appears.
 */
async function statusAfter(page, wanted, ms = 4000) {
  const list = Array.isArray(wanted) ? wanted : [wanted];
  const deadline = Date.now() + ms;
  for (;;) {
    const text = await statusLine(page);
    if (list.includes(text) || Date.now() > deadline) return text;
    await page.waitForTimeout(100);
  }
}

/** Clicks a cell that must not change anything and returns the board and status afterwards. */
async function clickIgnored(page, cell) {
  await panelButtons(page).nth(cell - 1).click({ timeout: 5000 });
  await settle(page, 900);
  return { board: await marks(page), status: await statusLine(page) };
}

async function newGame(page) {
  await page.getByRole('button', { name: 'New game' }).click({ timeout: 5000 });
  await settle(page, 700);
  return { board: await marks(page), status: await statusLine(page) };
}

/**
 * Plays the moves in order (X first) and checks the mark and the status line after each one.
 * `expectStatus(moveIndex, moves)` gives the status line wanted after the move. Returns the problems.
 */
async function playLine(page, moves, expectStatus, label) {
  const problems = [];
  const trail = [];
  for (let i = 0; i < moves.length; i += 1) {
    const mark = i % 2 === 0 ? 'X' : 'O';
    const b = await playCell(page, moves[i]);
    const want = expectStatus(i, moves);
    const status = await statusAfter(page, want);
    trail.push(`${moves[i]}${b[moves[i] - 1] || '-'}`);
    if (b[moves[i] - 1] !== mark) problems.push(`${label}: move ${i + 1} on cell ${moves[i]} shows "${b[moves[i] - 1]}", expected ${mark}`);
    if (status !== want) problems.push(`${label}: after move ${i + 1} the status reads "${status}", expected "${want}"`);
  }
  return { problems, trail: trail.join(' '), board: await marks(page), status: await statusLine(page) };
}

/** Test 1 of a two-player program: turns alternate and a completed row shows the winner. */
async function alternateAndWin(page, note) {
  const start = await statusLine(page);
  const startBoard = await marks(page);
  const moves = [1, 4, 2, 5, 3];
  const line = await playLine(
    page,
    moves,
    (i) => (i === moves.length - 1 ? 'Player X wins!' : `Player ${i % 2 === 0 ? 'O' : 'X'} is up`),
    'game',
  );
  const after = await clickIgnored(page, 6);
  const problems = [...line.problems];
  if (start !== 'Player X is up') problems.push(`at the start the status reads "${start}", expected "Player X is up"`);
  if (countOf(startBoard, '') !== 9) problems.push(`the board is not empty at the start: ${boardText(startBoard)}`);
  if (after.board[5] !== '') problems.push(`a click after the win put "${after.board[5]}" in cell 6`);
  if (after.status !== 'Player X wins!') problems.push(`after the win a click changed the status to "${after.status}"`);

  note(`${problems.length} problems: ${problems.join('; ') || 'none'}`);
  note(`start "${start}"; moves (cell, mark): ${line.trail}; final board ${boardText(line.board)}, status "${line.status}"`);
  note(`a click on empty cell 6 after the win: board ${boardText(after.board)}, status "${after.status}"`);
  expect(problems, 'turns alternate X and O, the status names the player up, a row of X wins and the game stops').toEqual([]);
}

/** Test 2 of a two-player program: occupied cell, New game, draw and a win on the ninth move. */
async function occupiedResetDrawNinth(page, note) {
  const problems = [];

  // an occupied cell ignores the click and does not pass the turn
  await playCell(page, 1);
  const occupied = await clickIgnored(page, 1);
  const next = await playCell(page, 2);
  const nextStatus = await statusAfter(page, 'Player X is up');
  if (occupied.board[0] !== 'X') problems.push(`clicking the taken cell 1 changed it to "${occupied.board[0]}"`);
  if (occupied.status !== 'Player O is up') problems.push(`clicking the taken cell changed the status to "${occupied.status}", expected "Player O is up"`);
  if (next[1] !== 'O') problems.push(`the turn after the ignored click did not go to O: cell 2 shows "${next[1]}"`);
  if (nextStatus !== 'Player X is up') problems.push(`after O's move the status reads "${nextStatus}", expected "Player X is up"`);

  // New game empties the board
  const reset = await newGame(page);
  if (countOf(reset.board, '') !== 9) problems.push(`New game left ${boardText(reset.board)} on the board`);
  if (reset.status !== 'Player X is up') problems.push(`New game: the status reads "${reset.status}", expected "Player X is up"`);

  // a full board without a line is a draw
  const drawMoves = [1, 2, 3, 5, 4, 6, 8, 7, 9];
  const draw = await playLine(
    page,
    drawMoves,
    (i) => (i === drawMoves.length - 1 ? "It's a draw." : `Player ${i % 2 === 0 ? 'O' : 'X'} is up`),
    'draw game',
  );
  problems.push(...draw.problems);

  // a line of three on the ninth move still wins (X completes 1-5-9 with the last move)
  const reset2 = await newGame(page);
  if (countOf(reset2.board, '') !== 9) problems.push(`the second New game left ${boardText(reset2.board)} on the board`);
  const winMoves = [1, 2, 3, 4, 5, 6, 8, 7, 9];
  const ninth = await playLine(
    page,
    winMoves,
    (i) => (i === winMoves.length - 1 ? 'Player X wins!' : `Player ${i % 2 === 0 ? 'O' : 'X'} is up`),
    'ninth-move game',
  );
  problems.push(...ninth.problems);

  note(`${problems.length} problems: ${problems.join('; ') || 'none'}`);
  note(`taken cell: board ${boardText(occupied.board)}, status "${occupied.status}"; New game: board ${boardText(reset.board)}, status "${reset.status}"`);
  note(`draw game ${draw.trail}: board ${boardText(draw.board)}, status "${draw.status}"`);
  note(`ninth-move game ${ninth.trail}: board ${boardText(ninth.board)}, status "${ninth.status}"`);
  expect(problems, 'an occupied cell is ignored, New game resets, a full board is a draw and a line on the ninth move wins').toEqual([]);
}

behaviourTest(
  `${BASE}exercises/TicTacToe.bbj`,
  'turns alternate X and O and a completed row shows "Player X wins!"',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    expect(await panelButtons(page).count(), 'nine cells and the New game button').toBe(10);
    await alternateAndWin(page, note);
  },
);

behaviourTest(
  `${BASE}exercises/TicTacToe.bbj`,
  'an occupied cell ignores the click, New game resets, a full board is a draw and a ninth move still wins',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    await occupiedResetDrawNinth(page, note);
  },
);

// ---------------------------------------------------------------------------------------------
// TicTacToeComputer.bbj. You play X, the computer plays O (status line "Your move, you play X"). The
// list button below the board ("Computer plays:") holds Random and MinMax, Random selected at the
// start. It is a DWC choicebox: its options are read from the opened dropdown.
// ---------------------------------------------------------------------------------------------
const COMPUTER_RESULTS = ['You win!', 'The computer wins!', "It's a draw."];

/** The strategy shown on the list button. */
function strategyShown(page) {
  return page.locator('dwc-choicebox').evaluate((el) => {
    const label = el.shadowRoot ? el.shadowRoot.querySelector('[part=button-label]') : null;
    return label ? label.textContent.trim() : '';
  });
}

/** Opens the list, reads its options, picks one; returns the options and the strategy shown afterwards. */
async function chooseStrategy(page, name) {
  await page.locator('dwc-choicebox').click({ timeout: 5000 });
  await expect(page.getByRole('option').first(), 'the strategy list opens').toBeVisible({ timeout: 5000 });
  const options = (await page.getByRole('option').allTextContents()).map((t) => t.trim());
  await page.getByRole('option', { name, exact: true }).click({ timeout: 5000 });
  await settle(page, 400);
  return { options, shown: await strategyShown(page) };
}

/** Clicks a cell and waits for the computer's answer: two marks more, or a finished game. */
async function playAgainstComputer(page, cell) {
  const before = (await marks(page)).filter((m) => m !== '').length;
  await panelButtons(page).nth(cell - 1).click({ timeout: 5000 });
  const deadline = Date.now() + 30000;
  for (;;) {
    const b = await marks(page);
    const status = await statusLine(page);
    const total = b.filter((m) => m !== '').length;
    if (COMPUTER_RESULTS.includes(status) || total >= before + 2) {
      // the computer's mark is set first and the status line a moment later
      const settled = await statusAfter(page, ['Your move, you play X', ...COMPUTER_RESULTS]);
      return { board: await marks(page), status: settled, ms: 30000 - (deadline - Date.now()) };
    }
    if (Date.now() > deadline) return { board: b, status, ms: 30000, timedOut: true };
    await page.waitForTimeout(150);
  }
}

const freeCells = (b) => b.map((m, i) => (m === '' ? i + 1 : 0)).filter((c) => c > 0);

/** Plays a whole game as X with a picker function; returns the final board, status and the X moves. */
async function playGame(page, pick) {
  const moves = [];
  for (let i = 0; i < 5; i += 1) {
    const b = await marks(page);
    const status = await statusLine(page);
    if (COMPUTER_RESULTS.includes(status)) break;
    const cell = pick(freeCells(b));
    moves.push(cell);
    const reply = await playAgainstComputer(page, cell);
    if (reply.timedOut) return { board: reply.board, status: reply.status, moves, timedOut: true };
  }
  return { board: await marks(page), status: await statusLine(page), moves, timedOut: false };
}

behaviourTest(
  `${BASE}exercises/TicTacToeComputer.bbj`,
  'the computer answers every move with an O and each game ends with a result',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    const problems = [];
    const start = await statusLine(page);
    const shown = await strategyShown(page);
    if (start !== 'Your move, you play X') problems.push(`at the start the status reads "${start}"`);
    if (shown !== 'Random') problems.push(`the list button shows "${shown}" at the start, expected Random`);

    const first = await playAgainstComputer(page, 5);
    const xs = countOf(first.board, 'X');
    const os = countOf(first.board, 'O');
    if (first.board[4] !== 'X' || xs !== 1) problems.push(`after the first click the board is ${boardText(first.board)}, expected one X in cell 5`);
    if (os !== 1) problems.push(`the computer answered with ${os} O marks (board ${boardText(first.board)}), expected 1`);
    if (first.status !== 'Your move, you play X') problems.push(`after the answer the status reads "${first.status}"`);

    const game = await playGame(page, (free) => free[0]);
    const xCount = countOf(game.board, 'X');
    const oCount = countOf(game.board, 'O');
    if (game.timedOut) problems.push('the computer did not answer within 30 s');
    if (!COMPUTER_RESULTS.includes(game.status)) problems.push(`the game did not end with a result: status "${game.status}", board ${boardText(game.board)}`);
    if (game.board[4] !== 'X') problems.push(`the X in cell 5 was overwritten: board ${boardText(game.board)}`);
    if (oCount > xCount || xCount - oCount > 1) problems.push(`the marks are out of balance: ${xCount} X, ${oCount} O`);

    const over = freeCells(game.board)[0];
    let ignored = 'no free cell left';
    if (over !== undefined) {
      const after = await clickIgnored(page, over);
      ignored = `a click on free cell ${over} after the end: board ${boardText(after.board)}, status "${after.status}"`;
      if (boardText(after.board) !== boardText(game.board)) problems.push(`a click after the end changed the board to ${boardText(after.board)}`);
    }

    note(`${problems.length} problems: ${problems.join('; ') || 'none'}`);
    note(`start status "${start}", strategy shown "${shown}"; first answer to X in cell 5 (${first.ms} ms): board ${boardText(first.board)}`);
    note(`game with Random, X plays the lowest free cell after cell 5: X cells ${[5, ...game.moves].join(',')}, final board ${boardText(game.board)}, status "${game.status}"`);
    note(ignored);
    expect(problems, 'the computer answers each move with an O on a free cell and the game ends with a result').toEqual([]);
  },
);

behaviourTest(
  `${BASE}exercises/TicTacToeComputer.bbj`,
  'the strategy list switches between Random and MinMax while playing, and MinMax never loses',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    const problems = [];

    // switching while a game is on: Random answers the first move, then MinMax, then Random again
    const r1 = await playAgainstComputer(page, 1);
    const toMinMax = await chooseStrategy(page, 'MinMax');
    const r2 = await playAgainstComputer(page, freeCells(r1.board)[0]);
    const toRandom = await chooseStrategy(page, 'Random');
    const r3 = await playAgainstComputer(page, freeCells(r2.board)[0]);
    const options = toMinMax.options.join(', ');
    if (toMinMax.options.join('|') !== 'Random|MinMax') problems.push(`the list offers "${options}", expected Random and MinMax`);
    if (toMinMax.shown !== 'MinMax') problems.push(`after choosing MinMax the list button shows "${toMinMax.shown}"`);
    if (toRandom.shown !== 'Random') problems.push(`after choosing Random the list button shows "${toRandom.shown}"`);
    for (const [name, r] of [['Random', r1], ['MinMax', r2], ['Random again', r3]]) {
      if (r.timedOut) problems.push(`${name}: the computer did not answer within 30 s`);
    }
    const switched = `Random ${boardText(r1.board)} (${r1.ms} ms); MinMax ${boardText(r2.board)} (${r2.ms} ms); Random ${boardText(r3.board)} (${r3.ms} ms)`;

    // MinMax from the first answer on never loses: four games with four different X strategies
    await chooseStrategy(page, 'MinMax');
    // lowest and highest free cell; centre first, then lowest; cell 2 (an edge) first, then highest
    const pickers = [
      ['lowest', (free) => free[0]],
      ['highest', (free) => free[free.length - 1]],
      ['centre', (free) => (free.includes(5) ? 5 : free[0])],
      ['edge', (free) => (free.includes(2) ? 2 : free[free.length - 1])],
    ];
    const games = [];
    for (const [name, pick] of pickers) {
      await newGame(page);
      const game = await playGame(page, pick);
      const result = { 'You win!': 'X wins', 'The computer wins!': 'O wins', "It's a draw.": 'draw' }[game.status] ?? `"${game.status}"`;
      games.push(`${name} ${game.moves.join(',')} ${boardText(game.board)} ${result}`);
      if (game.timedOut) problems.push(`MinMax game "${name}": the computer did not answer within 30 s`);
      else if (game.status === 'You win!') problems.push(`MinMax lost the game "${name}" (board ${boardText(game.board)})`);
      else if (!COMPUTER_RESULTS.includes(game.status)) problems.push(`MinMax game "${name}" did not end with a result: "${game.status}"`);
    }

    note(`${problems.length} problems: ${problems.join('; ') || 'none'}`);
    note(`strategies seen: list "${options}"; switched while playing: ${switched}`);
    note(`MinMax games (X strategy, X cells, final board, result): ${games.join('; ')}`);
    expect(problems, 'the list switches the strategy while playing and MinMax does not lose').toEqual([]);
  },
);

// ---------------------------------------------------------------------------------------------
// oo-tic-tac-toe/PlayTicTacToe.bbj. The launcher loads GameWindow.bbj with use ::GameWindow.bbj::GameWindow,
// which loads Board.bbj and Player.bbj the same way from the program folder. The window title is
// "Tic-Tac-Toe"; the status lines use the player names ("Player X is up", "Player X wins!").
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}exercises/oo-tic-tac-toe/PlayTicTacToe.bbj`,
  'like TicTacToe.bbj: turns alternate X and O and a completed row shows "Player X wins!"',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    note(`window "${await page.title()}", ${await panelButtons(page).count()} buttons in the panel`);
    expect(await panelButtons(page).count(), 'nine cells and the New game button').toBe(10);
    await alternateAndWin(page, note);
  },
);

behaviourTest(
  `${BASE}exercises/oo-tic-tac-toe/PlayTicTacToe.bbj`,
  'like TicTacToe.bbj: occupied cell ignored, New game resets, a full board is a draw, a ninth move wins',
  {},
  async ({ page, note }) => {
    await expect(page.getByRole('button', { name: 'New game' }), 'the New game button is visible').toBeVisible({ timeout: 10000 });
    await occupiedResetDrawNinth(page, note);
  },
);
