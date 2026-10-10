// Behaviour tests for the embedding samples of the DWC book, chapter "Embedding Third-Party Components"
// (pages dwc/10-embedding-components/index.md and 90-exercise-embed-component.mdx). The sample files
// are in docs/examples/dwc/09_EmbeddingOtherComponents.
//
// These programs load Chart.js 3.5.1 from cdnjs and Shoelace from jsDelivr. A CDN that does not answer
// is not a defect of the sample: the test then ends as blocked with the evidence "external network"
// (outcome blocked, category check), kept apart from a BBj or DWC finding. Network results are noted
// first in every test, because the wrapper cuts the evidence at 700 characters.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest, BlockedError } from '../../lib/behaviour.js';
import { clickDialogButton, consolePresent, readDialogs, settle } from '../../lib/dwc.js';

const BASE = 'dwc/09_EmbeddingOtherComponents/';
const CDNJS = /^https:\/\/cdnjs\.cloudflare\.com\//;
const JSDELIVR = /^https:\/\/cdn\.jsdelivr\.net\//;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Collapses every run of whitespace to one space. */
function flat(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

/** The text without any whitespace: a message box wraps long lines at a fixed column, also inside a word. */
function compact(text) {
  return String(text ?? '').replace(/\s+/g, '');
}

/**
 * Watches the requests to one CDN. Starts at once, so it sees the library load that follows the
 * start of the program; finish() adds requests the page made before the watcher started (Playwright
 * keeps the last 100 only). A request that failed or answered 4xx or 5xx is a network problem,
 * a request that has no answer yet is "pending".
 */
function watchNetwork(page, pattern) {
  const seen = new Map();
  page.on('request', (request) => {
    if (pattern.test(request.url()) && !seen.has(request.url())) seen.set(request.url(), { state: 'pending' });
  });
  page.on('response', (response) => {
    if (pattern.test(response.url())) seen.set(response.url(), { state: 'answered', status: response.status() });
  });
  page.on('requestfailed', (request) => {
    if (pattern.test(request.url())) {
      const failure = request.failure();
      seen.set(request.url(), { state: 'failed', error: (failure && failure.errorText) || 'request failed' });
    }
  });
  return {
    async finish() {
      for (const request of await page.requests().catch(() => [])) {
        if (!pattern.test(request.url()) || seen.has(request.url())) continue;
        const failure = request.failure();
        if (failure) {
          seen.set(request.url(), { state: 'failed', error: failure.errorText });
          continue;
        }
        const response = await Promise.race([request.response().catch(() => null), sleep(1000)]);
        seen.set(request.url(), response ? { state: 'answered', status: response.status() } : { state: 'pending' });
      }
    },
    /** Requests that failed, answered 4xx or 5xx, or never got an answer. */
    problems() {
      const bad = [];
      for (const [url, entry] of seen) {
        if (entry.state === 'failed') bad.push(`${new URL(url).pathname.split('/').pop()} ${entry.error}`);
        else if (entry.state === 'answered' && entry.status >= 400) bad.push(`${new URL(url).pathname.split('/').pop()} HTTP ${entry.status}`);
        else if (entry.state === 'pending') bad.push(`${new URL(url).pathname.split('/').pop()} no answer`);
      }
      return bad;
    },
    count() {
      return seen.size;
    },
    /** 'cdnjs.cloudflare.com: 1 request, all answered 200' style line for a note. */
    summary(host) {
      const bad = this.problems();
      const ok = [...seen.values()].filter((e) => e.state === 'answered' && e.status < 400).length;
      const base = `${host}: ${seen.size} request${seen.size === 1 ? '' : 's'}, ${ok} answered ok`;
      return bad.length === 0 ? base : `${base}, ${bad.length} problem${bad.length === 1 ? '' : 's'} (${bad.slice(0, 2).join('; ')})`;
    },
  };
}

/**
 * Polls fn in the page until it returns a truthy value (at most timeoutMs). When the component never
 * appears: a CDN problem makes the test blocked with category check ("external network ..."), a CDN
 * that answered fine makes it a failed check (the component did not render although its library came).
 */
async function whenComponent(page, net, host, label, fn, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await page.evaluate(fn).catch(() => null);
    if (value) return value;
    if (Date.now() >= deadline) break;
    await page.waitForTimeout(500);
  }
  await net.finish();
  const problems = net.problems();
  if (problems.length > 0) {
    throw new BlockedError(`external network (${host}): ${label} not available: ${problems.slice(0, 2).join('; ')}`);
  }
  if (net.count() === 0) throw new Error(`${label} never appeared and the page made no request to ${host}`);
  throw new Error(`${label} never appeared although ${net.summary(host)}`);
}

/** The Chart.js chart in the HTML view: version, type, labels, datasets, legend state and size. */
const READ_CHART = () => {
  const canvas = document.querySelector('dwc-htmlview canvas');
  const Chart = window.Chart;
  if (!canvas || !Chart || typeof Chart.getChart !== 'function') return null;
  const chart = Chart.getChart(canvas);
  if (!chart) return null;
  const box = canvas.getBoundingClientRect();
  return {
    version: Chart.version,
    type: chart.config.type,
    labels: [...chart.data.labels],
    datasets: chart.data.datasets.map((d) => d.label),
    hidden: chart.legend.legendItems.map((i) => Boolean(i.hidden)),
    canvas: { w: Math.round(box.width), h: Math.round(box.height) },
  };
};

/** Clicks the legend entry with this index, where Chart.js has laid it out. */
async function clickLegend(page, index) {
  const spot = await page.evaluate((i) => {
    const canvas = document.querySelector('dwc-htmlview canvas');
    const chart = window.Chart.getChart(canvas);
    const hit = chart.legend.legendHitBoxes && chart.legend.legendHitBoxes[i];
    if (!hit) return null;
    const box = canvas.getBoundingClientRect();
    return { x: box.x + hit.left + hit.width / 2, y: box.y + hit.top + hit.height / 2 };
  }, index);
  if (!spot) throw new BlockedError(`Chart.js has no legend hit box ${index}`);
  await page.mouse.click(spot.x, spot.y);
}

/** Waits for a message box and returns the first one. */
async function nextDialog(page, what) {
  await expect
    .poll(async () => (await readDialogs(page)).length, { message: what, timeout: 10000 })
    .toBeGreaterThan(0);
  return (await readDialogs(page))[0];
}

/** Closes the message box with OK and waits until it is gone. */
async function closeDialog(page) {
  await clickDialogButton(page, 'OK');
  await expect.poll(async () => (await readDialogs(page)).length, { timeout: 5000 }).toBe(0);
}

// ---------------------------------------------------------------------------------------------
// ChartJS.bbj: Chart.js 3.5.1 in a BBjHTMLView. The page: the library comes from cdnjs, the chart is
// created with injectScript, and a click on a legend entry sends a "legend-clicked" event back to BBj
// through basisDispatchCustomEvent. The ON_NATIVE_JAVASCRIPT handler shows the event detail in a
// MSGBOX titled "Event Details". The list button Line / Bar is in the code, not on the page.
// ---------------------------------------------------------------------------------------------

/** Waits for the chart and checks what the page's example builds. Returns the chart state. */
async function expectChart(page, note, net) {
  const chart = await whenComponent(page, net, 'cdnjs.cloudflare.com', 'the Chart.js chart', READ_CHART);
  await net.finish();
  note(net.summary('cdnjs.cloudflare.com'));
  note(`chart: Chart.js ${chart.version}, type ${chart.type}, canvas ${chart.canvas.w} x ${chart.canvas.h} px, datasets ${chart.datasets.join(', ')}, ${chart.labels.length} labels`);
  expect(chart.canvas.w, 'the canvas has a width').toBeGreaterThan(0);
  expect(chart.canvas.h, 'the canvas has a height').toBeGreaterThan(0);
  expect(chart.version, 'Chart.js version from cdnjs').toBe('3.5.1');
  expect(chart.type).toBe('line');
  expect(chart.labels).toEqual(['January', 'February', 'March', 'April', 'May', 'June', 'July']);
  expect(chart.datasets).toEqual(['Year 2021', 'Year 2022']);
  return chart;
}

behaviourTest(
  `${BASE}ChartJS.bbj`,
  'the Chart.js line chart renders with two datasets and seven months',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, CDNJS);
    await expectChart(page, note, net);

    // Not on the page, only in the code: the list button Line / Bar changes the chart type.
    try {
      await page.getByRole('button', { name: 'Line', exact: true }).click({ timeout: 5000 });
      await page.getByRole('option', { name: 'Bar', exact: true }).first().click({ timeout: 5000 });
      await settle(page, 1000);
      const after = await page.evaluate(READ_CHART);
      note(`list button: choosing Bar sets the chart type to ${after ? after.type : 'unknown'}`);
    } catch (error) {
      note(`list button Line / Bar could not be used: ${String(error.message).split('\n')[0].slice(0, 120)}`);
    }
  },
);

behaviourTest(
  `${BASE}ChartJS.bbj`,
  'a legend click sends legend-clicked to BBj, which shows the detail in Event Details',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, CDNJS);
    const before = await whenComponent(page, net, 'cdnjs.cloudflare.com', 'the Chart.js chart', READ_CHART);
    note(`before the click: legend entries hidden ${before.hidden.join(', ')}`);

    await clickLegend(page, 0);
    const dialog = await nextDialog(page, 'the message box Event Details after a legend click');
    note(`message box "${dialog.title}", buttons ${dialog.buttons.join(', ')}, text ${flat(dialog.text)}`);
    expect(dialog.title, 'MSGBOX title in handleNativeJavascript').toBe('Event Details');
    // The detail is the object the JavaScript puts into the custom event: text, index and hidden.
    const detail = JSON.parse(dialog.text);
    expect(detail).toEqual({ text: 'Year 2021', index: 0, hidden: true });

    // Chart.js still does its own work first: the dataset is hidden.
    const hidden = await page.evaluate(READ_CHART);
    expect(hidden.hidden, 'Chart.js default legend click hides the dataset').toEqual([true, false]);

    // A second click on the same entry: the detail says it is shown again.
    await closeDialog(page);
    await clickLegend(page, 0);
    const second = await nextDialog(page, 'the message box after the second legend click');
    note(`second click on Year 2021: ${flat(second.text)}`);
    await closeDialog(page);
    await clickLegend(page, 1);
    const third = await nextDialog(page, 'the message box after a click on Year 2022');
    note(`click on Year 2022: ${flat(third.text)}`);
    expect(JSON.parse(third.text)).toEqual({ text: 'Year 2022', index: 1, hidden: true });
  },
);

// ---------------------------------------------------------------------------------------------
// ChartJS_NoEventFromJS.bbj: the same chart without a native JavaScript event handler and without the
// list button. No page names it; the chapter page shows the chart code without the event part.
// ---------------------------------------------------------------------------------------------

behaviourTest(
  `${BASE}ChartJS_NoEventFromJS.bbj`,
  'the chart renders and a legend click only hides the dataset in the browser',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, CDNJS);
    await expectChart(page, note, net);

    await clickLegend(page, 0);
    await settle(page, 2000);
    const after = await page.evaluate(READ_CHART);
    const dialogs = await readDialogs(page);
    note(`after a click on Year 2021: legend entries hidden ${after.hidden.join(', ')}; message boxes: ${dialogs.length}`);
    note(`list button Line present: ${(await page.getByRole('button', { name: 'Line', exact: true }).count()) > 0}`);
    expect(after.hidden, 'Chart.js default legend click hides the dataset').toEqual([true, false]);
  },
);

// ---------------------------------------------------------------------------------------------
// EventMapSample.bbj: the sample from the BASIS documentation. HTML elements in a BBjHTMLView call
// basisDispatchNativeEvent; BBj reads the event with getEventMap. The program prints info() lines
// first and then, for every event except the meter, prints the event name and map and shows a MSGBOX
// titled "<event name> <mystuff>" whose text is the whole map.
// ---------------------------------------------------------------------------------------------

/** Click one control in the view, wait for the message box and return it (the box is closed again). */
async function eventBox(page, control, what) {
  await control.click({ timeout: 5000 });
  const dialog = await nextDialog(page, what);
  const info = { title: dialog.title, text: dialog.text, buttons: dialog.buttons };
  await closeDialog(page);
  return info;
}

behaviourTest(
  `${BASE}EventMapSample.bbj`,
  'the HTML button click reaches BBj with myElement button and mystuff Button Title',
  {},
  async ({ page, note }) => {
    note(`console frame present while the window is open: ${await consolePresent(page)} (the print lines of the program stay in the BBj console)`);
    const box = await eventBox(page, page.getByRole('button', { name: 'Button Title', exact: true }), 'the message box after the Button Title click');
    const map = compact(box.text);
    note(`message box title "${box.title}", button ${box.buttons.join(', ')}, text ${box.text.length} characters`);
    note(`map holds myElement=button: ${map.includes('myElement=button')}, mystuff=ButtonTitle: ${map.includes('mystuff=ButtonTitle')}, type=click: ${map.includes('type=click')}`);
    expect(flat(box.title), 'event name plus mystuff').toBe('BBjNativeJavaScriptEvent Button Title');
    expect(map).toContain('myElement=button');
    expect(map).toContain('mystuff=ButtonTitle');
    expect(map).toContain('type=click');
  },
);

behaviourTest(
  `${BASE}EventMapSample.bbj`,
  'the injected JavaScript examples dispatch events: function, listener, custom event',
  {},
  async ({ page, note }) => {
    // The first button calls alert() in the browser before it dispatches the event.
    const alerts = [];
    page.on('dialog', (dialog) => alerts.push(`${dialog.type()}: ${dialog.message()}`));

    const clicks = page.getByRole('button', { name: 'click me' });
    expect(await clicks.count(), 'two buttons are labelled click me').toBe(2);

    const external = await eventBox(page, clicks.nth(0), 'the message box after the external function call');
    const injected = await eventBox(page, clicks.nth(1), 'the message box after the injected event listener');
    const custom = await eventBox(page, page.getByRole('button', { name: 'custom', exact: true }), 'the message box after the custom event');

    const a = compact(external.text);
    const b = compact(injected.text);
    const c = compact(custom.text);
    note(`external function: title "${external.title}", myElement=jsfunction ${a.includes('myElement=jsfunction')}, browser alert "${alerts.join(' | ')}"`);
    note(`injected listener: title "${injected.title}", myElement=jsfunction ${b.includes('myElement=jsfunction')}`);
    note(`custom event: title "${custom.title}", type=custom_event ${c.includes('type=custom_event')}, detail with message hello ${c.includes('"message":"hello"')}`);

    expect(flat(external.title)).toBe('BBjNativeJavaScriptEvent click me');
    expect(a).toContain('myElement=jsfunction');
    expect(alerts.join(' | ')).toContain('JS alert: click me');
    expect(flat(injected.title)).toBe('BBjNativeJavaScriptEvent click me');
    expect(b).toContain('myElement=jsfunction');
    expect(flat(custom.title)).toBe('BBjNativeJavaScriptEvent custom');
    expect(c).toContain('myElement=jsfunction');
    expect(c).toContain('type=custom_event');
    expect(c).toContain('"message":"hello"');
  },
);

// ---------------------------------------------------------------------------------------------
// ShoelaceSplitter.bbj: Shoelace 2.0.0-beta.69 sl-split-panel. The page: two child windows are moved
// with appendChild into the Start and End areas of the splitter, which gives "a splitter with two
// child windows, each hosting a full-size button" (a red top panel and a green bottom panel). The
// page says to call setAttribute("id", ...) before getAttribute("id") when the id is needed.
// ---------------------------------------------------------------------------------------------

/** The splitter, its divider and the two buttons: where they are and what they sit in. */
const READ_SPLITTER = () => {
  const split = document.querySelector('sl-split-panel');
  if (!split) return null;
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const divider = split.shadowRoot ? split.shadowRoot.querySelector('[part~=divider]') : null;
  const part = (text) => {
    const button = [...document.querySelectorAll('dwc-button')].find((e) => e.textContent.trim() === text);
    if (!button) return null;
    const panel = button.closest('dwc-panel');
    return {
      box: rect(button),
      inSplit: Boolean(button.closest('sl-split-panel')),
      slot: panel ? panel.getAttribute('slot') : null,
      panelParent: panel && panel.parentElement ? panel.parentElement.tagName.toLowerCase() : null,
      panelHasId: panel ? panel.hasAttribute('id') : null,
    };
  };
  return {
    defined: Boolean(customElements.get('sl-split-panel')),
    split: rect(split),
    divider: divider ? rect(divider) : null,
    children: [...split.children].map((c) => `${c.tagName.toLowerCase()}[slot=${c.getAttribute('slot')}]`),
    assigned: split.shadowRoot ? [...split.shadowRoot.querySelectorAll('slot')].map((s) => `${s.name}:${s.assignedElements().length}`) : [],
    top: part('This is the top panel'),
    bottom: part('This is the bottom panel'),
  };
};

const SPLITTER_READY = () => Boolean(window.customElements && customElements.get('sl-split-panel') && document.querySelector('sl-split-panel'));

behaviourTest(
  `${BASE}ShoelaceSplitter.bbj`,
  'the Shoelace sl-split-panel renders with a divider between its Start and End areas',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, JSDELIVR);
    await whenComponent(page, net, 'cdn.jsdelivr.net', 'the Shoelace script (sl-split-panel)', SPLITTER_READY);
    await settle(page, 1500);
    await net.finish();
    note(net.summary('cdn.jsdelivr.net'));
    const info = await page.evaluate(READ_SPLITTER);
    if (!info) throw new Error('no sl-split-panel element on the page');
    note(`sl-split-panel defined: ${info.defined}; box ${info.split.w} x ${info.split.h} px; divider ${info.divider ? `${info.divider.w} x ${info.divider.h} px at y ${info.divider.y}` : 'none'}; shadow slots ${info.assigned.join(' ')}`);
    expect(info.defined, 'Shoelace defines sl-split-panel').toBe(true);
    expect(info.split.w).toBeGreaterThan(0);
    expect(info.split.h).toBeGreaterThan(0);
    expect(info.divider, 'the divider part is drawn').not.toBeNull();
    expect(info.divider.w).toBeGreaterThan(0);
    expect(info.divider.h).toBeGreaterThan(0);
    // position="50": the divider sits in the middle of the splitter, between the Start and End areas.
    const middle = info.split.y + info.split.h / 2;
    expect(Math.abs(info.divider.y + info.divider.h / 2 - middle), 'divider is about in the middle').toBeLessThan(info.split.h * 0.1);
  },
);

behaviourTest(
  `${BASE}ShoelaceSplitter.bbj`,
  'the two child windows sit in the Start and End areas, red above and green below the divider',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, JSDELIVR);
    await whenComponent(page, net, 'cdn.jsdelivr.net', 'the Shoelace script (sl-split-panel)', SPLITTER_READY);
    // The sample moves the child windows after the script was added: give that a moment.
    await settle(page, 3000);
    const info = await page.evaluate(READ_SPLITTER);
    if (!info) throw new Error('no sl-split-panel element on the page');
    expect(info.top, 'the top panel button exists').not.toBeNull();
    expect(info.bottom, 'the bottom panel button exists').not.toBeNull();
    // Facts first: the wrapper keeps the first 700 characters of the evidence.
    note(`splitter children: ${info.children.join(' ')}; shadow slots ${info.assigned.join(' ')} (Start and End hold ${info.assigned.filter((s) => /^(start|end):0$/.test(s)).length === 2 ? 'nothing' : 'something'})`);
    note(`top panel: slot ${info.top.slot}, in the splitter ${info.top.inSplit}, parent of its dwc-panel ${info.top.panelParent}, has id attribute ${info.top.panelHasId}, button y ${info.top.box.y}`);
    note(`bottom panel: slot ${info.bottom.slot}, in the splitter ${info.bottom.inSplit}, parent of its dwc-panel ${info.bottom.panelParent}, has id attribute ${info.bottom.panelHasId}, button y ${info.bottom.box.y}`);
    note(`divider y ${info.divider ? info.divider.y : 'none'}, splitter y ${info.split.y} to ${info.split.y + info.split.h}`);
    note(net.summary('cdn.jsdelivr.net'));

    expect(info.top.inSplit, 'the top child window is inside sl-split-panel').toBe(true);
    expect(info.bottom.inSplit, 'the bottom child window is inside sl-split-panel').toBe(true);
    expect(info.divider).not.toBeNull();
    expect(info.top.box.y + info.top.box.h, 'the top button ends above the divider').toBeLessThanOrEqual(info.divider.y + 1);
    expect(info.bottom.box.y, 'the bottom button starts below the divider').toBeGreaterThanOrEqual(info.divider.y + info.divider.h - 1);
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-EmbedComponentComplete.bbj (page 90-exercise-embed-component.mdx): embeds sl-rating from
// Shoelace 2.20.1 with addWebComponent; the sl-change event shows the chosen rating in a static text.
// 06.1-HUMAN-UAT test 3: a click shows "You rated the course N of 5 stars."
// ---------------------------------------------------------------------------------------------

const RATING_READY = () => Boolean(window.customElements && customElements.get('sl-rating') && document.querySelector('sl-rating'));

/** The five star icons inside the rating. */
function stars(page) {
  return page.locator('sl-rating').locator('sl-icon');
}

/** Click the middle of one star: the symbols layer of sl-rating takes the pointer events. */
async function clickStar(page, index) {
  const box = await stars(page).nth(index).boundingBox();
  if (!box) throw new BlockedError(`star ${index + 1} has no box`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

behaviourTest(
  `${BASE}Exercise-EmbedComponentComplete.bbj`,
  'the Shoelace sl-rating renders five stars and the text says nothing is rated yet',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, JSDELIVR);
    await whenComponent(page, net, 'cdn.jsdelivr.net', 'the Shoelace script (sl-rating)', RATING_READY);
    await settle(page, 1000);
    await net.finish();
    note(net.summary('cdn.jsdelivr.net'));
    const rating = await page.locator('sl-rating').evaluate((el) => ({
      label: el.getAttribute('label'),
      max: el.getAttribute('max'),
      value: el.value,
    }));
    const count = await stars(page).count();
    const sizes = await stars(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    note(`sl-rating: label "${rating.label}", max ${rating.max}, value ${rating.value}, ${count} stars, widths ${sizes.join(' ')} px`);
    expect(count, 'five stars').toBe(5);
    for (const width of sizes) expect(width, 'every star has a width').toBeGreaterThan(0);
    await expect(page.getByText('How do you like this course?')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('You have not rated the course yet.')).toBeVisible({ timeout: 5000 });
  },
);

behaviourTest(
  `${BASE}Exercise-EmbedComponentComplete.bbj`,
  'clicking the third star shows "You rated the course 3 of 5 stars."',
  {},
  async ({ page, note }) => {
    const net = watchNetwork(page, JSDELIVR);
    await whenComponent(page, net, 'cdn.jsdelivr.net', 'the Shoelace script (sl-rating)', RATING_READY);
    await settle(page, 1000);
    await net.finish();
    note(net.summary('cdn.jsdelivr.net'));

    await clickStar(page, 2);
    const third = page.getByText('You rated the course 3 of 5 stars.', { exact: true });
    await expect(third, 'text after the click on the third star').toBeVisible({ timeout: 10000 });
    note(`value of sl-rating after the click: ${await page.locator('sl-rating').evaluate((el) => el.value)}`);

    await clickStar(page, 4);
    await expect(page.getByText('You rated the course 5 of 5 stars.', { exact: true }), 'text after the click on the fifth star').toBeVisible({ timeout: 10000 });
    note('the fifth star changes the text to 5 of 5 stars');
  },
);
