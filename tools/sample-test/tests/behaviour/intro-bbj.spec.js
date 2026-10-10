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
