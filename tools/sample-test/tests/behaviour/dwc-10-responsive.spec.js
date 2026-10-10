// Behaviour tests for the two exercise solutions of the DWC book, chapter "Advanced Responsive Design"
// (pages dwc/11-advanced-responsive/90-exercise-media-queries.mdx and 91-exercise-button-transition.mdx;
// 06.1-HUMAN-UAT tests 4 and 5). The sample files are in docs/examples/dwc/10_AdvancedResponsive.
//
// Both programs read their CSS file through BBjFileSystem::resolvePath, which resolves against the
// PREFIX. Every test notes first whether the CSS arrived and was applied. The media query test resizes
// the viewport with page.setViewportSize; the transition test switches the reduced motion preference
// with page.emulateMedia.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { cssVar, panelStyle, settle } from '../../lib/dwc.js';

const BASE = 'dwc/10_AdvancedResponsive/';

/** Number of tracks in a computed grid-template-columns value ('none' has none). */
function tracks(value) {
  const text = String(value ?? '').trim();
  return text === '' || text === 'none' ? 0 : text.split(/\s+/).length;
}

const px = (text) => Number.parseFloat(String(text));

// ---------------------------------------------------------------------------------------------
// Exercise-MediaQueriesComplete.bbj. The page: the grid moves into Exercise-MediaQueriesComplete.css;
// "Below 600px the form switches to one column, uses a smaller font and hides the optional Company
// field." UAT test 4 adds: "at 600px and wider it shows two columns". The media query is
// @media (width < 600px), so it follows the viewport, and the strict less-than keeps two columns at
// exactly 600 px.
// ---------------------------------------------------------------------------------------------

/** Resizes the viewport, waits for the layout and reads what the form looks like. */
async function formAt(page, width) {
  await page.setViewportSize({ width, height: 800 });
  await settle(page, 800);
  const panel = await panelStyle(page, ['display', 'grid-template-columns', 'gap', 'padding-top']);
  const columns = panel.values['grid-template-columns'] ?? '';
  return {
    width,
    display: panel.values.display ?? null,
    columns: tracks(columns),
    columnsText: columns,
    gap: panel.values.gap ?? null,
    companyVisible: await page.getByText('Company:', { exact: true }).first().isVisible(),
    textboxes: await page.getByRole('textbox').count(),
  };
}

const describeForm = (f) =>
  `${f.width}px: ${f.columns} column${f.columns === 1 ? '' : 's'} (${f.columnsText}), gap ${f.gap}, Company ${f.companyVisible ? 'visible' : 'hidden'}, ${f.textboxes} edit boxes`;

behaviourTest(
  `${BASE}Exercise-MediaQueriesComplete.bbj`,
  'below 600 px one column without Company, from 600 px two columns with the Company field',
  {},
  async ({ page, note }) => {
    // The first look is at the default viewport of 1280 px: it shows whether the CSS file arrived.
    const start = await panelStyle(page, ['display', 'grid-template-columns', 'gap', 'padding-top']);
    const startClass = await page.locator('dwc-window-content').first().getAttribute('class');
    note(`CSS file applied: panel class "${startClass}", display ${start.values.display}, gap ${start.values.gap}, padding ${start.values['padding-top']}`);

    const wide = await formAt(page, 1024);
    const edge = await formAt(page, 600);
    const narrow = await formAt(page, 599);
    const phone = await formAt(page, 500);
    note(describeForm(wide));
    note(describeForm(edge));
    note(describeForm(narrow));
    note(describeForm(phone));

    expect(start.values.display, 'the grid class from the CSS file is applied to the panel').toBe('grid');

    // 600 px and wider: two columns and the Company field.
    expect(wide.columns, '1024 px: columns').toBe(2);
    expect(wide.companyVisible, '1024 px: Company field visible').toBe(true);
    expect(edge.columns, '600 px: columns (the strict less-than keeps two)').toBe(2);
    expect(edge.companyVisible, '600 px: Company field visible').toBe(true);

    // Below 600 px: one column and no Company field (its label and its edit box).
    expect(narrow.columns, '599 px: columns').toBe(1);
    expect(narrow.companyVisible, '599 px: Company field hidden').toBe(false);
    expect(phone.columns, '500 px: columns').toBe(1);
    expect(phone.companyVisible, '500 px: Company field hidden').toBe(false);
    expect(phone.textboxes, 'the Company edit box is gone as well').toBe(wide.textboxes - 1);
  },
);

behaviourTest(
  `${BASE}Exercise-MediaQueriesComplete.bbj`,
  'the font is smaller below 600 px',
  {},
  async ({ page, note }) => {
    /** Computed font sizes (px) of the label, the edit box and the panel, plus the token the CSS changes. */
    const fonts = async (width) => {
      await page.setViewportSize({ width, height: 800 });
      await settle(page, 800);
      return {
        width,
        label: px(await page.getByText('* First Name:', { exact: true }).first().evaluate((el) => getComputedStyle(el).fontSize)),
        input: px(await page.getByRole('textbox').first().evaluate((el) => getComputedStyle(el).fontSize)),
        panel: px((await panelStyle(page, ['font-size'])).values['font-size']),
        token: await cssVar(page, '--dwc-font-size', { selector: 'dwc-window-content' }),
      };
    };
    const wide = await fonts(1024);
    const narrow = await fonts(500);

    // Facts first: the wrapper keeps the first 700 characters of the evidence.
    note(`label font ${wide.label}px at 1024 and ${narrow.label}px at 500; edit box ${wide.input}px and ${narrow.input}px; panel ${wide.panel}px and ${narrow.panel}px`);
    note(`custom property --dwc-font-size on the panel: ${wide.token} at 1024, ${narrow.token} at 500`);

    // Browser-only experiment (nothing in the sample changes, the style is removed again): does the
    // label follow the custom property once an element uses it for its font-size?
    try {
      const used = await page.locator('dwc-window-content').first().evaluate((panel) => {
        panel.style.fontSize = 'var(--dwc-font-size)';
        const label = [...panel.querySelectorAll('dwc-static-text')].find((e) => e.textContent.trim() === '* First Name:');
        const size = label ? getComputedStyle(label).fontSize : 'no label';
        panel.style.removeProperty('font-size');
        return size;
      });
      note(`experiment in the browser: with font-size: var(--dwc-font-size) set on the panel the label is ${used} at 500`);
    } catch (error) {
      note(`experiment could not run: ${String(error.message).split('\n')[0].slice(0, 100)}`);
    }

    // "uses a smaller font": the text of the form is rendered smaller than before.
    const smaller = narrow.label < wide.label || narrow.input < wide.input || narrow.panel < wide.panel;
    expect(smaller, `rendered font sizes below 600 px (label ${narrow.label}px, edit box ${narrow.input}px) are smaller than at 1024 px (${wide.label}px, ${wide.input}px)`).toBe(true);
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-ButtonTransitionComplete.bbj. The page: the button has the class grow-button; the hover
// rule scales it (transform: scale(1.2)) and "transition: transform 0.25s ease-in-out" smooths the
// change; "readers whose system asks for reduced motion get the change without the animation".
// UAT test 5, open question A8: the scale must land on the visible DWC button.
// ---------------------------------------------------------------------------------------------

/** The dwc-button host that carries the class grow-button. */
function growButton(page) {
  return page.locator('dwc-button').filter({ hasText: 'Hover over me' });
}

/** Computed transition and size of the button and of the real button inside it. */
async function buttonState(page) {
  return growButton(page).first().evaluate((el) => {
    // 'none' is scale 1, 'matrix(a, ...)' is scale a
    const scaleOf = (t) => {
      const m = /^matrix\(([^,]+),/.exec(t);
      return m ? Number.parseFloat(m[1]) : 1;
    };
    const style = getComputedStyle(el);
    const inner = el.shadowRoot ? el.shadowRoot.querySelector('button') : null;
    const box = el.getBoundingClientRect();
    return {
      transform: style.transform,
      scale: scaleOf(style.transform),
      duration: style.transitionDuration,
      property: style.transitionProperty,
      timing: style.transitionTimingFunction,
      width: box.width,
      innerWidth: inner ? inner.getBoundingClientRect().width : null,
    };
  });
}

/** Hovers the button and reports, two animation frames later, which transitions run and how far the scale is. */
async function hoverAndWatch(page) {
  await growButton(page).first().hover();
  return growButton(page).first().evaluate(
    (el) =>
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const m = /^matrix\(([^,]+),/.exec(getComputedStyle(el).transform);
            resolve({
              transitions: el.getAnimations().map((a) => `${a.constructor.name}:${a.transitionProperty}:${a.effect.getTiming().duration}ms`),
              scale: m ? Number.parseFloat(m[1]) : 1,
            });
          }),
        ),
      ),
  );
}

behaviourTest(
  `${BASE}Exercise-ButtonTransitionComplete.bbj`,
  'hovering the button grows it with a smooth transform transition',
  {},
  async ({ page, note }) => {
    await expect(growButton(page), 'the Hover over me button is visible').toBeVisible({ timeout: 10000 });
    const panel = await panelStyle(page, ['display', 'place-items', 'padding-top']);
    const before = await buttonState(page);
    note(`CSS file applied: panel display ${panel.values.display}, place-items ${panel.values['place-items']}; button transition ${before.property} ${before.duration} ${before.timing}`);

    const live = await hoverAndWatch(page);
    await settle(page, 700);
    const after = await buttonState(page);
    await page.mouse.move(5, 5);
    await settle(page, 700);
    const left = await buttonState(page);

    note(`transitions running two frames after the hover: ${live.transitions.join(', ') || 'none'}; scale at that moment ${live.scale.toFixed(3)}`);
    note(`transform ${before.transform} before, ${after.transform} hovered, ${left.transform} after leaving; width ${before.width.toFixed(1)} to ${after.width.toFixed(1)} px, inner button ${before.innerWidth ? before.innerWidth.toFixed(1) : 'n/a'} to ${after.innerWidth ? after.innerWidth.toFixed(1) : 'n/a'} px`);

    // The transition is declared on transform and runs when the hover starts.
    expect(before.property, 'transition-property').toBe('transform');
    expect(before.duration, 'transition-duration').toBe('0.25s');
    expect(live.transitions.some((t) => t.startsWith('CSSTransition:transform:')), 'a CSS transition on transform starts at the hover').toBe(true);

    // The hover grows the visible button, not only its host.
    expect(after.scale, 'scale of the hovered button').toBeCloseTo(1.2, 2);
    expect(after.width, 'the hovered button is wider').toBeGreaterThan(before.width * 1.15);
    expect(after.innerWidth, 'the real button inside the DWC button grows with it').toBeGreaterThan(before.innerWidth * 1.15);
    expect(left.scale, 'the button returns to its size when the pointer leaves').toBeCloseTo(1, 2);
  },
);

behaviourTest(
  `${BASE}Exercise-ButtonTransitionComplete.bbj`,
  'with reduced motion the button still grows, without an animation',
  {},
  async ({ page, note }) => {
    await expect(growButton(page), 'the Hover over me button is visible').toBeVisible({ timeout: 10000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settle(page, 300);
    const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    const before = await buttonState(page);
    const live = await hoverAndWatch(page);
    const hovered = await buttonState(page);

    note(`reduced motion emulated: ${reduced}; transition-property ${before.property}, transition-duration ${before.duration}`);
    note(`transitions running two frames after the hover: ${live.transitions.join(', ') || 'none'}; scale right away ${live.scale.toFixed(3)}`);
    note(`transform ${before.transform} before, ${hovered.transform} hovered; width ${before.width.toFixed(1)} to ${hovered.width.toFixed(1)} px`);

    expect(reduced, 'the browser reports prefers-reduced-motion: reduce').toBe(true);
    // The media query sets "transition: none": the duration resolves to 0s and no transition runs.
    expect(before.duration, 'transition-duration with reduced motion').toBe('0s');
    expect(live.transitions, 'no transition runs when the button is hovered').toEqual([]);
    // The change itself stays: the hovered button is scaled at once.
    expect(hovered.scale, 'scale of the hovered button').toBeCloseTo(1.2, 2);
    expect(hovered.width, 'the hovered button is wider').toBeGreaterThan(before.width * 1.15);
  },
);
