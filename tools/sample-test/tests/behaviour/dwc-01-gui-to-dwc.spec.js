// Behaviour tests for chapter 01 of the DWC book (GUI to BUI to DWC): what the course pages say each
// sample shows or does. Pages: dwc/01-gui-to-bui-to-dwc/02-hello-world.md, 03-gui-to-bui-to-dwc.md,
// 90-exercise-gui-to-bui-to-dwc.mdx and dwc/02-browser-developer-tools/03-css-custom-properties.md
// (lines 116 to 120: the three theme samples), 04-dwc-themes.md.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { clickDialogButton, cssVar, iconReport, panelStyle, readDialogs, settle } from '../../lib/dwc.js';

const BASE = 'dwc/01_GUI2BUI2DWC/';
const THEMES = `${BASE}DWC_AppThemes/`;

/** The track sizes of a computed grid-template-columns value, in px ('94px 188px' gives [94, 188]). */
function tracks(value) {
  return String(value ?? '')
    .split(/\s+/)
    .filter((part) => part !== '' && part !== 'none')
    .map((part) => Number.parseFloat(part));
}

/**
 * Fills both text boxes, presses Say Hello and waits for the message box. Returns the message box
 * ({ title, text, buttons }) and closes it again.
 */
async function sayHello(page, note, first = 'Jane', last = 'Doe') {
  const boxes = page.getByRole('textbox');
  await expect(boxes, 'the window has two text boxes').toHaveCount(2);
  await boxes.nth(0).fill(first);
  await boxes.nth(0).press('Tab');
  await boxes.nth(1).fill(last);
  await boxes.nth(1).press('Tab');
  await page.getByRole('button', { name: /Say Hello/ }).click();
  await expect
    .poll(async () => (await readDialogs(page)).length, { message: 'a message box opens after Say Hello', timeout: 15000 })
    .toBeGreaterThan(0);
  const [dialog] = await readDialogs(page);
  note(`message box "${dialog.title}": "${dialog.text}" with buttons ${dialog.buttons.join(', ')}`);
  await clickDialogButton(page, dialog.buttons[0] ?? 'OK').catch(() => {});
  return dialog;
}

/** The first DWC message of the "no longer available" kind, shortened, or null. */
async function directiveError(page) {
  const messages = await page.consoleMessages().catch(() => []);
  for (const message of messages) {
    if (message.type() !== 'error') continue;
    const found = /Starting from BBj v[\d.]+, the \w+ directives are no longer available/.exec(message.text());
    if (found) return `${found[0]} (the message names BBjWebManager as the replacement)`;
  }
  return null;
}

/** Background and text colour of the page body, as the browser computes them. */
function bodyColors(page) {
  return page.evaluate(() => ({
    bg: getComputedStyle(document.body).backgroundColor,
    text: getComputedStyle(document.body).color,
  }));
}

function themeAttribute(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-app-theme'));
}

// ---------------------------------------------------------------------------------------------
// GUISample.bbj: Example 1 of 03-gui-to-bui-to-dwc.md, the start of the exercise
// ---------------------------------------------------------------------------------------------

behaviourTest(`${BASE}GUISample.bbj`, 'the window shows both name fields and the Say Hello button', {}, async ({ page, note }) => {
  await expect(page.getByText('First Name:').first(), 'First Name label').toBeVisible();
  await expect(page.getByText('Last Name:').first(), 'Last Name label').toBeVisible();
  await expect(page.getByRole('textbox'), 'two edit boxes').toHaveCount(2);
  await expect(page.getByRole('button', { name: /Say Hello/ }), 'Say Hello button').toBeVisible();
  note('labels First Name: and Last Name:, 2 text boxes and the Say Hello button are visible');
});

behaviourTest(`${BASE}GUISample.bbj`, 'Say Hello greets the entered name in a message box', {}, async ({ page, note }) => {
  const dialog = await sayHello(page, note);
  expect(dialog.title, 'message box title').toBe('Hello World');
  expect(dialog.text, 'message box text').toContain('Hello Jane Doe');
});

// ---------------------------------------------------------------------------------------------
// MessageBox.bbj: Example 1 and the program notes of 02-hello-world.md
// ---------------------------------------------------------------------------------------------

behaviourTest(`${BASE}MessageBox.bbj`, 'the message box greets the DWC client with the title Greetings', {}, async ({ page, note }) => {
  const dialogs = await readDialogs(page);
  expect(dialogs.length, 'a message box is open').toBeGreaterThan(0);
  note(`message box "${dialogs[0].title}": "${dialogs[0].text}" with buttons ${dialogs[0].buttons.join(', ')}`);
  expect(dialogs[0].title, 'message box title').toBe('Greetings');
  expect(dialogs[0].text, 'message box text').toContain("Hello from BBj's DWC client!");
});

behaviourTest(`${BASE}MessageBox.bbj`, 'the MODE string gives the message box the primary theme', {}, async ({ page, note }) => {
  const dialog = page.locator('dwc-dialog').first();
  await expect(dialog, 'a message box is open').toBeVisible();
  const theme = await dialog.getAttribute('theme');
  const buttonTheme = await dialog.locator('dwc-button').first().getAttribute('theme');
  note(`dwc-dialog theme="${theme}"; the OK button theme="${buttonTheme}" (the code sets only MODE="theme=primary")`);
  expect(theme, 'theme attribute of the dwc-dialog').toBe('primary');
});

// ---------------------------------------------------------------------------------------------
// DWC1.bbj: flow layout, CSS grid, expanse and theme of the button
// ---------------------------------------------------------------------------------------------

behaviourTest(`${BASE}DWC1.bbj`, 'Say Hello greets the entered name in a message box', {}, async ({ page, note }) => {
  const dialog = await sayHello(page, note);
  expect(dialog.title, 'message box title').toBe('Hello World');
  expect(dialog.text, 'message box text').toContain('Hello Jane Doe');
});

behaviourTest(
  `${BASE}DWC1.bbj`,
  'the panel is a two-column grid and Say Hello an extra large success button in column 2',
  {},
  async ({ page, note }) => {
    const style = await panelStyle(page, ['display', 'grid-template-columns', 'gap', 'padding']);
    if (!style.found) throw new BlockedError('no dwc-window-content element on the page');
    const columns = tracks(style.values['grid-template-columns']);
    const button = page.locator('dwc-button').filter({ hasText: 'Say Hello' }).first();
    const expanse = await button.getAttribute('expanse');
    const theme = await button.getAttribute('theme');
    const box = await page.getByRole('textbox').first().boundingBox();
    const buttonBox = await page.getByRole('button', { name: /Say Hello/ }).boundingBox();
    note(
      `panel display=${style.values.display}, columns=${style.values['grid-template-columns']}, gap=${style.values.gap}, padding=${style.values.padding}`,
    );
    note(`button expanse=${expanse}, theme=${theme}; button x=${buttonBox && Math.round(buttonBox.x)}, first edit box x=${box && Math.round(box.x)}`);
    expect(style.values.display, 'display of the panel').toBe('grid');
    expect(columns.length, 'number of grid columns').toBe(2);
    expect(columns[0], 'width of the first column (page: 180px)').toBe(180);
    expect(style.values.gap, 'gap').toBe('5px');
    expect(style.values.padding, 'padding').toBe('15px');
    expect(expanse, 'expanse of the Say Hello button').toBe('xl');
    expect(theme, 'theme of the Say Hello button').toBe('success');
    expect(Math.abs((buttonBox?.x ?? -999) - (box?.x ?? 999)), 'button sits in column 2 under the edit boxes (px)').toBeLessThanOrEqual(4);
  },
);

// ---------------------------------------------------------------------------------------------
// DWC2.bbj: no title bar, inline-grid 1fr 2fr, icon in the button (issue 4)
// ---------------------------------------------------------------------------------------------

behaviourTest(`${BASE}DWC2.bbj`, 'Say Hello greets the entered name in a message box', {}, async ({ page, note }) => {
  const dialog = await sayHello(page, note);
  expect(dialog.title, 'message box title').toBe('Hello World');
  expect(dialog.text, 'message box text').toContain('Hello Jane Doe');
});

behaviourTest(
  `${BASE}DWC2.bbj`,
  'the window has no title bar and the panel is an inline grid with a 1 to 2 column ratio',
  {},
  async ({ page, note }) => {
    const style = await panelStyle(page, ['display', 'grid-template-columns', 'gap', 'padding']);
    if (!style.found) throw new BlockedError('no dwc-window-content element on the page');
    const columns = tracks(style.values['grid-template-columns']);
    const button = page.locator('dwc-button').filter({ hasText: 'Say Hello' }).first();
    const expanse = await button.getAttribute('expanse');
    const theme = await button.getAttribute('theme');
    const titleButtons = await page.getByRole('button', { name: /^(Minimize|Maximize|Close)$/ }).count();
    note(`panel display=${style.values.display}, columns=${style.values['grid-template-columns']}, gap=${style.values.gap}, padding=${style.values.padding}`);
    note(`button expanse=${expanse}, theme=${theme} (the page names xl and success in Example 3, the code sets primary); title bar buttons: ${titleButtons}`);
    expect(style.values.display, 'display of the panel').toBe('inline-grid');
    expect(columns.length, 'number of grid columns').toBe(2);
    expect(columns[1] / columns[0], 'second column is twice as wide as the first').toBeCloseTo(2, 1);
    expect(titleButtons, 'window controls of a title bar (flag $01101083$ removes it)').toBe(0);
    expect(expanse, 'expanse of the Say Hello button').toBe('xl');
  },
);

// Issue 4: https://github.com/BasisHub/Courses/issues/4 "Is there a better way in modern DWC / BBj to do this?"
// Line 35 builds the title as <html>Say Hello <dwc-icon name='speakerphone'></dwc-icon></html>.
behaviourTest(
  `${BASE}DWC2.bbj`,
  'the Say Hello button shows the speakerphone icon from its <html> title',
  { issue: 4 },
  async ({ page, note }) => {
    const host = page.locator('dwc-button').filter({ hasText: 'Say Hello' }).first();
    const icon = host.locator('dwc-icon');
    note("markup in the program: <html>Say Hello <dwc-icon name='speakerphone'></dwc-icon></html> (tabler pool by default)");
    const found = await icon.count();
    if (found === 0) throw new BlockedError('no dwc-icon inside the Say Hello button');
    // DWC fetches the icon's SVG from the CDN after it upgrades the element. A one-shot read raced that
    // once in the baseline (svg not drawn here while iconReport below found the icon rendered), so wait
    // for it first. A real failure still shows: after 10 s the read below says svg drawn: false.
    await expect
      .poll(() => icon.first().evaluate((el) => Boolean(el.shadowRoot?.querySelector('svg')?.children.length)), { timeout: 10000 })
      .toBe(true)
      .catch(() => {});
    const detail = await icon.first().evaluate((el) => {
      const box = el.getBoundingClientRect();
      const svg = el.shadowRoot && el.shadowRoot.querySelector('svg');
      return {
        name: el.getAttribute('name'),
        pool: el.getAttribute('pool'),
        expanse: el.getAttribute('expanse'),
        width: Math.round(box.width),
        height: Math.round(box.height),
        drawn: Boolean(svg && svg.children.length > 0),
        parent: el.parentElement ? el.parentElement.tagName.toLowerCase() : null,
      };
    });
    const markup = await host.evaluate((el) => el.innerHTML.replace(/\s+/g, ' ').trim());
    const report = await iconReport(page);
    const hidden = report.total - report.rendered - report.missing.length;
    note(
      `DOM: <${detail.parent}> holds dwc-icon name=${detail.name} pool=${detail.pool} expanse=${detail.expanse}, ${detail.width}x${detail.height} px, svg drawn: ${detail.drawn}`,
    );
    note(`button content in the DOM: ${markup}`);
    note(`iconReport: total ${report.total}, rendered ${report.rendered}, missing ${report.missing.length}, hidden ${hidden} (not visible, so not judged)`);
    expect(report.total, 'icons on the page').toBeGreaterThanOrEqual(1);
    expect(detail.name, 'icon name').toBe('speakerphone');
    expect(detail.drawn && detail.width >= 4 && detail.height >= 4, 'the speakerphone icon is drawn').toBe(true);
    expect(report.rendered, 'rendered icons').toBeGreaterThanOrEqual(1);
    expect(report.missing, 'visible icons that did not render').toEqual([]);
  },
);

// ---------------------------------------------------------------------------------------------
// DWC_AppThemes: 03-css-custom-properties.md, "Example Programs" (UserPreference, Themes, DWCThemer)
// ---------------------------------------------------------------------------------------------

behaviourTest(`${THEMES}Themes.bbj`, 'the app always displays in the DWC dark theme', {}, async ({ page, note }) => {
  const attr = await themeAttribute(page);
  const dark = await bodyColors(page);
  // "Always": it stays dark when the operating system asks for light.
  await page.emulateMedia({ colorScheme: 'light' });
  await settle(page, 1000);
  const stillDark = await themeAttribute(page);
  // The light value for comparison: the same page with the attribute set to light, then put back.
  await page.evaluate(() => document.documentElement.setAttribute('data-app-theme', 'light'));
  await settle(page, 500);
  const light = await bodyColors(page);
  await page.evaluate((value) => document.documentElement.setAttribute('data-app-theme', value), attr ?? 'dark');
  note(`data-app-theme="${attr}" (after OS light: "${stillDark}"); body background dark ${dark.bg}, light ${light.bg}; text dark ${dark.text}, light ${light.text}`);
  expect(attr, 'data-app-theme on <html>').toBe('dark');
  expect(stillDark, 'data-app-theme with the OS in light mode').toBe('dark');
  expect(dark.bg, 'dark page background differs from the light one').not.toBe(light.bg);
});

behaviourTest(`${THEMES}UserPreference.bbj`, 'the app follows the OS light and dark setting', {}, async ({ page, note }) => {
  const states = {};
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    await settle(page, 1500);
    states[scheme] = {
      attr: await themeAttribute(page),
      // proof that the emulated OS setting reaches the page, so a missing reaction is the app's
      prefersDark: await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches),
      ...(await bodyColors(page)),
    };
  }
  const reported = await directiveError(page);
  note(`prefers-color-scheme dark in the page: ${states.light.prefersDark} (OS light), ${states.dark.prefersDark} (OS dark)`);
  note(`OS light: data-app-theme=${states.light.attr}, background ${states.light.bg}; OS dark: data-app-theme=${states.dark.attr}, background ${states.dark.bg}`);
  note(`DWC console: ${reported ?? 'no directive message'}`);
  expect(states.dark.bg, 'page background with the OS in dark mode differs from light mode').not.toBe(states.light.bg);
  expect(states.dark.attr ?? '', 'data-app-theme with the OS in dark mode').toMatch(/dark/);
  expect(states.light.attr ?? '', 'data-app-theme with the OS in light mode').not.toMatch(/dark/);
});

// MyDwcTheme.css sets --dwc-color-primary-h 340, --dwc-color-primary-s 82% and --dwc-color-default-h 52 on :root.
behaviourTest(`${THEMES}DWCThemer.bbj`, 'the theme from MyDwcTheme.css is applied', {}, async ({ page, note }) => {
  const hue = await cssVar(page, '--dwc-color-primary-h');
  const saturation = await cssVar(page, '--dwc-color-primary-s');
  const defaultHue = await cssVar(page, '--dwc-color-default-h');
  note(`--dwc-color-primary-h=${hue} (file: 340), --dwc-color-primary-s=${saturation} (file: 82%), --dwc-color-default-h=${defaultHue} (file: 52)`);
  expect(hue, '--dwc-color-primary-h').toBe('340');
  expect(saturation, '--dwc-color-primary-s').toBe('82%');
  expect(defaultHue, '--dwc-color-default-h').toBe('52');
});

// ---------------------------------------------------------------------------------------------
// DWC_ExternalCSS/Sample.bbj: issue 3
// ---------------------------------------------------------------------------------------------

// Issue 3: https://github.com/BasisHub/Courses/issues/3 "Setting the css with @app-style on the window
// doesn't appear to have an impact in current BBj". Line 18 sets Sample.css with
// wnd!.setAttribute("@app-style", css!), line 20 adds the class mypanel to the panel.
behaviourTest(
  `${BASE}DWC_ExternalCSS/Sample.bbj`,
  'CSS from Sample.css set with @app-style lays out the mypanel panel as a two-column inline grid',
  { issue: 3 },
  async ({ page, note }) => {
    const found = await page.evaluate(() => {
      const panels = [];
      const styles = [];
      let allStyles = 0;
      const walk = (root) => {
        for (const el of root.querySelectorAll('*')) {
          if (el.classList.contains('mypanel')) panels.push(el);
          if (el.tagName === 'STYLE') {
            allStyles += 1;
            if (/\.mypanel/.test(el.textContent || '')) styles.push(el);
          }
          if (el.shadowRoot) walk(el.shadowRoot);
        }
      };
      walk(document);
      const panel = panels[0];
      const style = panel ? getComputedStyle(panel) : null;
      return {
        panels: panels.length,
        tag: panel ? panel.tagName.toLowerCase() : null,
        display: style ? style.display : null,
        columns: style ? style.gridTemplateColumns : null,
        gap: style ? style.gap : null,
        padding: style ? style.padding : null,
        styleElementsWithMypanel: styles.length,
        styleElements: allStyles,
      };
    });
    const reported = await directiveError(page);
    note(`DWC console: ${reported ?? 'no directive message'}`);
    note(`style elements containing .mypanel: ${found.styleElementsWithMypanel} of ${found.styleElements}`);
    if (found.panels === 0) throw new BlockedError('no element with class mypanel');
    note(`element with class mypanel: <${found.tag}> (${found.panels}); display=${found.display}, columns=${found.columns}, gap=${found.gap}, padding=${found.padding}`);
    expect(found.display, 'computed display of the mypanel element (Sample.css: inline-grid)').toBe('inline-grid');
    expect(tracks(found.columns).length, 'number of grid columns (Sample.css: 1fr 1fr)').toBe(2);
  },
);
