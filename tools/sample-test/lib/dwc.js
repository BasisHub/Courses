// Browser-side observation helpers for BBj DWC programs. Everything here talks to the page through
// Playwright; nothing talks to BBjServices. Playwright locators pierce DWC's open shadow DOM, so the
// helpers use locators and evaluate on the elements they find instead of walking shadow roots by hand.
//
// DWC details these helpers rely on (observed in the spike and confirmed live in plan 06.2-08):
//   app started       a `dwc-window-content` element exists
//   message box       a visible `dwc-dialog` element
//   console           `.dwc-console-frame` with an xterm.js Terminal on `.dwc-console__xterm`
//   dark theme        `data-app-theme` on <html> (`html[data-app-theme~=dark]` in dwc-ui.css)
import os from 'node:os';
import { joinWrapped } from './console.js';
import { resultsDir } from './paths.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', os.hostname().toLowerCase()]);

function isExternal(url) {
  try {
    return !LOCAL_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    // data: and blob: URLs and anything unparsable never leave the machine
    return false;
  }
}

/**
 * Collects what the page does while a program runs. Console messages that DWC itself writes
 * (/BASIS Dynamic Web Client/) and Chromium's own "Failed to load resource" lines (they repeat a
 * network entry that is recorded separately) are skipped. Native dialogs (alert, confirm, prompt)
 * are recorded and dismissed so they cannot block the page.
 * @param {import('@playwright/test').Page} page
 */
export function attachCollectors(page) {
  const collectors = {
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    network: [],
    nativeDialogs: [],
    downloads: [],
    popups: [],
  };

  page.on('pageerror', (error) => {
    collectors.pageErrors.push(String((error && error.message) || error));
  });
  page.on('console', (message) => {
    const text = message.text();
    if (/BASIS Dynamic Web Client/.test(text) || /^Failed to load resource/.test(text)) return;
    if (message.type() === 'error') collectors.consoleErrors.push(text);
    else if (message.type() === 'warning') collectors.consoleWarnings.push(text);
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    collectors.network.push({
      url: request.url(),
      status: null,
      error: (failure && failure.errorText) || 'request failed',
      external: isExternal(request.url()),
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      collectors.network.push({
        url: response.url(),
        status: response.status(),
        error: null,
        external: isExternal(response.url()),
      });
    }
  });
  page.on('dialog', (dialog) => {
    collectors.nativeDialogs.push({ type: dialog.type(), message: dialog.message() });
    dialog.dismiss().catch(() => {});
  });
  page.on('download', (download) => {
    collectors.downloads.push({ filename: download.suggestedFilename(), url: download.url() });
  });
  page.on('popup', (popup) => {
    collectors.popups.push(popup.url());
  });
  return collectors;
}

// A BBj message box is a `dwc-dialog` whose light DOM has three slotted parts (confirmed live):
//   header[slot=header]   its first child div holds the title; a second div holds the dwc-icon
//   section[slot=content] the message text, with line breaks as rendered
//   footer[slot=footer]   one dwc-button per button, the label is its text
// The dialog host covers the whole viewport (backdrop), so a visible dialog has a non-empty box.
const READ_DIALOGS = (elements) =>
  elements
    .filter((el) => {
      const box = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    })
    .map((el) => {
      const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
      const lines = (node) =>
        String((node && (node.innerText || node.textContent)) || '')
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line !== '')
          .join('\n');
      const header = el.querySelector('[slot=header]');
      const titleNode = header && header.firstElementChild ? header.firstElementChild : header;
      return {
        title: clean(titleNode && titleNode.textContent),
        text: lines(el.querySelector('[slot=content]')),
        buttons: [...el.querySelectorAll('[slot=footer] dwc-button, [slot=footer] button')]
          .map((button) => clean(button.textContent))
          .filter((label) => label !== ''),
      };
    });

/**
 * The visible dwc-dialog elements: [{ title, text, buttons }].
 * @param {import('@playwright/test').Page} page
 */
export async function readDialogs(page) {
  try {
    return await page.locator('dwc-dialog').evaluateAll(READ_DIALOGS);
  } catch {
    return [];
  }
}

/**
 * Waits until the program shows a window, the console or a dialog.
 * @param {import('@playwright/test').Page} page
 * @param {{ timeoutMs?: number, states?: Array<'window'|'console'|'dialog'> }} [options]
 * @returns {Promise<{ state: 'window'|'console'|'dialog'|'license'|'timeout', ms: number }>}
 */
export async function waitForStart(page, { timeoutMs = 30000, states = ['window', 'console', 'dialog'] } = {}) {
  const t0 = Date.now();
  for (;;) {
    const seen = await probeState(page);
    const ms = Date.now() - t0;
    if (seen.license) return { state: 'license', ms };
    for (const state of states) {
      if (seen[state]) return { state, ms };
    }
    if (ms >= timeoutMs) return { state: 'timeout', ms };
    await sleep(250);
  }
}

async function probeState(page) {
  const seen = { window: false, console: false, dialog: false, license: false };
  try {
    seen.window = (await page.locator('dwc-window-content').count()) > 0;
    seen.console = (await page.locator('.dwc-console-frame').count()) > 0;
    const dialogs = await readDialogs(page);
    seen.dialog = dialogs.length > 0;
    seen.license = dialogs.some((d) => /E3008|out of licenses/i.test(d.text));
  } catch {
    // the page is navigating or closing: nothing seen this round
  }
  return seen;
}

/** True when the DWC console frame is on the page. */
export async function consolePresent(page) {
  try {
    return (await page.locator('.dwc-console-frame').count()) > 0;
  } catch {
    return false;
  }
}

async function readRows(page) {
  try {
    return await page.locator('.dwc-console__xterm').first().evaluate(
      (host) => {
        const term = host.xterm || (host.widgetManager && host.widgetManager.terminal);
        if (!term || !term.buffer || !term.buffer.active) return null;
        const buffer = term.buffer.active;
        const rows = [];
        for (let i = 0; i < buffer.length; i += 1) {
          const line = buffer.getLine(i);
          if (line) rows.push({ text: line.translateToString(true), wrapped: line.isWrapped });
        }
        return rows;
      },
      undefined,
      { timeout: 2000 },
    );
  } catch {
    return null;
  }
}

/**
 * The console text as logical lines (wrapped rows joined, trailing empty lines dropped), or null
 * when the console or its terminal is not there. Polls every 500 ms until a line equals READY or
 * waitForReadyMs has passed. The first lines hold the license serial number: callers must run the
 * result through parseConsole before anything is stored.
 * @param {import('@playwright/test').Page} page
 * @param {{ waitForReadyMs?: number }} [options]
 * @returns {Promise<string[]|null>}
 */
export async function readConsole(page, { waitForReadyMs = 8000 } = {}) {
  const deadline = Date.now() + waitForReadyMs;
  let lines = null;
  for (;;) {
    const rows = await readRows(page);
    if (rows) {
      // The console pads every row to its width with spaces: drop them.
      lines = joinWrapped(rows).map((line) => line.replace(/\s+$/, ''));
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
      if (lines.some((line) => line.trim() === 'READY')) return lines;
    }
    if (Date.now() >= deadline) return lines;
    await sleep(500);
  }
}

/**
 * Clicks the button with this name inside the first visible dwc-dialog.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
export async function clickDialogButton(page, name) {
  const dialog = page.locator('dwc-dialog');
  const byRole = dialog.getByRole('button', { name });
  if ((await byRole.count()) > 0) {
    await byRole.first().click({ timeout: 5000 });
    return;
  }
  // Fall back to the dwc-button host, whose label is its light DOM text.
  await dialog.locator('dwc-button').filter({ hasText: name }).first().click({ timeout: 5000 });
}

/** Rating of icon elements, run in the page. */
const RATE_ICONS = (elements) =>
  elements.map((el) => {
    const box = el.getBoundingClientRect();
    const visible = typeof el.checkVisibility === 'function' ? el.checkVisibility() : box.width > 0;
    const scope = el.shadowRoot || el;
    const svg = scope.querySelector('svg');
    const img = scope.querySelector('img');
    const drawn = Boolean(svg && svg.children.length > 0) || Boolean(img && img.naturalWidth > 0);
    return {
      pool: el.getAttribute('pool'),
      name: el.getAttribute('name'),
      visible,
      rendered: visible && box.width >= 4 && box.height >= 4 && drawn,
    };
  });

/**
 * Rates every dwc-icon and bbj-icon element, also inside open shadow roots. An icon is rendered when
 * it is at least 4 x 4 px and its shadow root (or the element itself) holds an svg with a child
 * element or an img that loaded. An icon that is not visible at all (inside a closed tab, a hidden
 * panel) cannot be judged: it counts in total but in neither rendered nor missing. Polls until the
 * rendered count has been the same for 1 s or settleMs has passed.
 * @param {import('@playwright/test').Page} page
 * @param {{ settleMs?: number }} [options]
 * @returns {Promise<{ total: number, rendered: number, missing: Array<{ pool: string|null, name: string|null }> }>}
 */
export async function iconReport(page, { settleMs = 5000 } = {}) {
  const deadline = Date.now() + settleMs;
  let last = null;
  let stableSince = Date.now();
  let rated = [];
  for (;;) {
    try {
      rated = await page.locator('dwc-icon, bbj-icon').evaluateAll(RATE_ICONS);
    } catch {
      rated = [];
    }
    const rendered = rated.filter((i) => i.rendered).length;
    if (rendered !== last) {
      last = rendered;
      stableSince = Date.now();
    }
    if (Date.now() - stableSince >= 1000 || Date.now() >= deadline) break;
    await sleep(250);
  }
  return {
    total: rated.length,
    rendered: rated.filter((i) => i.rendered).length,
    missing: rated.filter((i) => i.visible && !i.rendered).map((i) => ({ pool: i.pool, name: i.name })),
  };
}

/**
 * Computed style of the window panel (the element `setPanelStyle` writes to).
 * @param {import('@playwright/test').Page} page
 * @param {string[]} props CSS property names, for example ['display', 'gap']
 * @param {{ selector?: string }} [options]
 * @returns {Promise<{ found: boolean, selector: string, values: Record<string, string> }>}
 */
export async function panelStyle(page, props, { selector = 'dwc-window-content' } = {}) {
  try {
    const values = await page.locator(selector).first().evaluate(
      (el, names) => {
        const style = getComputedStyle(el);
        return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
      },
      props,
      { timeout: 3000 },
    );
    return { found: true, selector, values };
  } catch {
    return { found: false, selector, values: {} };
  }
}

/**
 * Computed value of a custom property (for example '--dwc-color-primary'), on the document element
 * or on the element the selector finds. Trimmed, with every run of whitespace collapsed to one
 * space: DWC writes some tokens over several lines (an oklch() expression, for example). An empty
 * string when the property is not set.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 * @param {{ selector?: string|null }} [options]
 * @returns {Promise<string>}
 */
export async function cssVar(page, name, { selector = null } = {}) {
  const read = (el, prop) => getComputedStyle(el).getPropertyValue(prop).replace(/\s+/g, ' ').trim();
  if (selector) return page.locator(selector).first().evaluate(read, name, { timeout: 3000 });
  return page.evaluate(
    ([prop]) => getComputedStyle(document.documentElement).getPropertyValue(prop).replace(/\s+/g, ' ').trim(),
    [name],
  );
}

/**
 * Takes a light and a dark screenshot into results/screenshots. Dark is the DWC dark theme: the
 * harness sets data-app-theme to 'dark' on <html> and restores the previous value afterwards. The
 * console header shows the license serial number, so screenshots never leave the results folder.
 * @param {import('@playwright/test').Page} page
 * @param {string} base file name stem, for example the app name
 * @returns {Promise<{ light: string, dark: string }>} paths relative to resultsDir()
 */
export async function takeScreenshots(page, base) {
  const folder = resultsDir('screenshots');
  const light = `screenshots/${base}-light.png`;
  const dark = `screenshots/${base}-dark.png`;
  await page.screenshot({ path: `${folder}/${base}-light.png` });
  const previous = await page.evaluate(() => document.documentElement.getAttribute('data-app-theme'));
  await page.evaluate(() => document.documentElement.setAttribute('data-app-theme', 'dark'));
  try {
    await sleep(500);
    await page.screenshot({ path: `${folder}/${base}-dark.png` });
  } finally {
    await page
      .evaluate((value) => {
        if (value === null) document.documentElement.removeAttribute('data-app-theme');
        else document.documentElement.setAttribute('data-app-theme', value);
      }, previous)
      .catch(() => {});
  }
  return { light, dark };
}

/** Waits a fixed time so that DWC can finish rendering. */
export async function settle(page, ms = 2000) {
  await page.waitForTimeout(ms);
}
