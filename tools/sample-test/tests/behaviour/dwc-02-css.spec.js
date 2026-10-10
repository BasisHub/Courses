// Behaviour tests for chapter 02 of the DWC book (browser developer tools, CSS styles and custom
// properties): what the course pages say each sample does. Pages: dwc/02-browser-developer-tools/
// 03-css-custom-properties.md, 04-dwc-themes.md, 90-exercise-theming-support.mdx.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { cssVar, panelStyle, settle } from '../../lib/dwc.js';

const BASE = 'dwc/02_CSSStylesAndCustomProperties/';

function themeAttribute(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-app-theme'));
}

/** Notes the first browser page errors, if any (a smoke finding for this sample: componentOnReady). */
async function notePageErrors(page, note) {
  const errors = await page.pageErrors().catch(() => []);
  note(errors.length === 0 ? 'page errors: none' : `page errors: ${errors.length}, first: ${String(errors[0].message).slice(0, 100)}`);
}

// ---------------------------------------------------------------------------------------------
// CSSCustomProperties.bbj: "Example 1 - Setting Custom Values for CSS Custom Properties"
// ---------------------------------------------------------------------------------------------

/** Opens one of the two drop-downs ("Toggle dropdown" buttons, in window order) and picks an entry. */
async function choose(page, dropdown, entry) {
  await page.getByRole('button', { name: 'Toggle dropdown' }).nth(dropdown).click();
  await page.getByRole('option', { name: entry, exact: true }).click();
}

/** The short :root rules of <style> elements the program injected, also inside shadow roots. */
function injectedRules(page) {
  return page.evaluate(() => {
    const rules = [];
    const walk = (root) => {
      for (const el of root.querySelectorAll('*')) {
        const text = (el.tagName === 'STYLE' ? el.textContent : '') || '';
        if (text.length < 200 && /:root/.test(text) && /--dwc-[\w-]+\s*:/.test(text)) rules.push(text.replace(/\s+/g, ' ').trim());
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    return rules;
  });
}

/** Picks a property and a value in the two lists, presses the button and waits (up to 8 s) for the property to change. */
async function applyCustomProperty(page, note, property, value) {
  await choose(page, 0, property);
  await choose(page, 1, value);
  const before = await cssVar(page, property);
  await page.getByRole('button', { name: 'Set CSS Property to Value' }).click();
  let after = before;
  for (let i = 0; i < 16 && after === before; i += 1) {
    await settle(page, 500);
    after = await cssVar(page, property);
  }
  const rules = await injectedRules(page);
  note(`${property}: before "${before}", after "${after}"; injected :root rules: ${rules.join(' ') || 'none'}`);
  return { before, after };
}

/**
 * The non-transparent background colours that paint the box of the check box and of the radio button:
 * the input-wrapper part and its ::before and ::after layers. DWC 26.03 paints the checked colour of
 * the check box on the ::before layer and the radio button on the wrapper itself, so a test that reads
 * only the wrapper reports a grey check box that is orange on screen (seen in the first live run).
 */
function controlColours(page) {
  return page.evaluate(() =>
    Object.fromEntries(
      ['dwc-checkbox', 'dwc-radio'].map((tag) => {
        const host = document.querySelector(tag);
        const part = host && host.shadowRoot && host.shadowRoot.querySelector('[part~=input-wrapper]');
        if (!part) return [tag, null];
        const layers = [getComputedStyle(part), getComputedStyle(part, '::before'), getComputedStyle(part, '::after')];
        return [tag, layers.map((style) => style.backgroundColor).filter((color) => color !== 'rgba(0, 0, 0, 0)')];
      }),
    ),
  );
}

behaviourTest(`${BASE}CSSCustomProperties.bbj`, 'choosing --dwc-color-primary and orange sets the property', {}, async ({ page, note }) => {
  const { after } = await applyCustomProperty(page, note, '--dwc-color-primary', 'orange');
  await notePageErrors(page, note);
  expect(after, '--dwc-color-primary on the page after pressing the button').toBe('orange');
});

behaviourTest(`${BASE}CSSCustomProperties.bbj`, 'the check box and radio button turn orange', {}, async ({ page, note }) => {
  const before = await controlColours(page);
  if (before['dwc-checkbox'] === null || before['dwc-radio'] === null) throw new BlockedError('no check box or radio button with an input-wrapper part');
  await applyCustomProperty(page, note, '--dwc-color-primary', 'orange');
  const after = await controlColours(page);
  note(`painted backgrounds before: check box ${before['dwc-checkbox'].join(' | ')}; radio ${before['dwc-radio'].join(' | ')}`);
  note(`painted backgrounds after: check box ${after['dwc-checkbox'].join(' | ')}; radio ${after['dwc-radio'].join(' | ')} (orange is rgb(255, 165, 0))`);
  expect(after['dwc-radio'], 'radio button backgrounds after setting --dwc-color-primary to orange').toContain('rgb(255, 165, 0)');
  expect(after['dwc-checkbox'], 'check box backgrounds after setting --dwc-color-primary to orange').toContain('rgb(255, 165, 0)');
});

// ---------------------------------------------------------------------------------------------
// SetStyle.bbj: "Modifying a BBjControl's Style Properties" (methods 1, 3 and 4 work, method 2 does not)
// ---------------------------------------------------------------------------------------------

/** Host class, background and text colour of the part with part="control" of every dwc-button. */
function buttonParts(page) {
  return page.locator('dwc-button').evaluateAll((hosts) =>
    hosts.map((host) => {
      const control = host.shadowRoot && host.shadowRoot.querySelector('[part~=control]');
      const style = control ? getComputedStyle(control) : null;
      return {
        cls: host.className.replace(/\bhydrated\b/, '').trim() || 'none',
        bg: style ? style.backgroundColor : null,
        color: style ? style.color : null,
      };
    }),
  );
}

const PURPLE = 'rgb(128, 0, 128)';
const YELLOW = 'rgb(255, 255, 0)';

behaviourTest(`${BASE}SetStyle.bbj`, 'setStyle() makes the first button purple with yellow text', {}, async ({ page, note }) => {
  const buttons = await buttonParts(page);
  buttons.forEach((b, i) => note(`button ${i + 1} (class ${b.cls}): background ${b.bg}, text ${b.color}`));
  if (buttons.length < 3) throw new BlockedError(`expected 3 buttons, found ${buttons.length}`);
  expect(buttons[0].bg, 'background of button 1 (setStyle)').toBe(PURPLE);
  expect(buttons[0].color, 'text colour of button 1 (setStyle)').toBe(YELLOW);
});

behaviourTest(
  `${BASE}SetStyle.bbj`,
  'the injected CSS makes buttons 2 and 3 purple with yellow text',
  {},
  async ({ page, note }) => {
    const buttons = await buttonParts(page);
    buttons.forEach((b, i) => note(`button ${i + 1} (class ${b.cls}): background ${b.bg}, text ${b.color}`));
    if (buttons.length < 3) throw new BlockedError(`expected 3 buttons, found ${buttons.length}`);
    expect(buttons[1].bg, 'background of button 2 (custom properties on .button-2)').toBe(PURPLE);
    expect(buttons[1].color, 'text colour of button 2').toBe(YELLOW);
    expect(buttons[2].bg, 'background of button 3 (::part(control) on .button-3)').toBe(PURPLE);
    expect(buttons[2].color, 'text colour of button 3').toBe(YELLOW);
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-ThemingSupportComplete.bbj: the solution of 90-exercise-theming-support.mdx
// ---------------------------------------------------------------------------------------------

// The theme file sets --dwc-color-primary-h 262, --dwc-color-primary-s 65% and --dwc-color-default-h 262
// on :root; the layout file makes dwc-window-content a flex column.
behaviourTest(`${BASE}Exercise-ThemingSupportComplete.bbj`, 'applies the theme file and the layout file', {}, async ({ page, note }) => {
  const hue = await cssVar(page, '--dwc-color-primary-h');
  const saturation = await cssVar(page, '--dwc-color-primary-s');
  const defaultHue = await cssVar(page, '--dwc-color-default-h');
  const layout = await panelStyle(page, ['display', 'flex-direction']);
  note(`--dwc-color-primary-h=${hue} (file: 262), --dwc-color-primary-s=${saturation} (file: 65%), --dwc-color-default-h=${defaultHue} (file: 262)`);
  note(`window content display=${layout.values.display}, flex-direction=${layout.values['flex-direction']} (layout file: flex, column)`);
  if (!layout.found) throw new BlockedError('no dwc-window-content element on the page');
  expect(hue, '--dwc-color-primary-h').toBe('262');
  expect(saturation, '--dwc-color-primary-s').toBe('65%');
  expect(defaultHue, '--dwc-color-default-h').toBe('262');
  expect(layout.values.display, 'display of the window content').toBe('flex');
  expect(layout.values['flex-direction'], 'flex-direction of the window content').toBe('column');
});

behaviourTest(`${BASE}Exercise-ThemingSupportComplete.bbj`, 'the toggle button switches between the light and dark theme', {}, async ({ page, note }) => {
  const seen = [`start ${await themeAttribute(page)}`];
  try {
    const lightButton = page.getByRole('button', { name: /Light/ });
    await expect(lightButton, 'a button with the label Light').toBeVisible();
    await lightButton.click();
    await expect
      .poll(() => themeAttribute(page), { message: 'data-app-theme after the first click', timeout: 8000 })
      .toMatch(/dark/);
    seen.push(`after the first click ${await themeAttribute(page)}`);
    await expect(page.getByRole('button', { name: /Dark/ }), 'the button label changes to Dark').toBeVisible();
    await page.getByRole('button', { name: /Dark/ }).click();
    await expect
      .poll(async () => (await themeAttribute(page)) ?? 'none', { message: 'data-app-theme after the second click', timeout: 8000 })
      .not.toMatch(/dark/);
    seen.push(`after the second click ${await themeAttribute(page)}`);
  } finally {
    note(`data-app-theme: ${seen.join(', ')}`);
  }
});
