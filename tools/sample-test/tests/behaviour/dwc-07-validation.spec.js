// Behaviour tests for the control validation samples of the DWC book, chapter "Control Validation"
// (pages dwc/08-control-validation/index.md and 90-exercise-email-validation.mdx). The sample files are
// in docs/examples/dwc/07_ControlValiation. All of them lay out a contact form of eight edit boxes
// (First name, Last name, Company, Email, Country, City, State, Zip Code) and a Submit button.
//
// The issue #7 tests for these files are in the panel style sweep (issue-07-panel-style.spec.js), not
// here. The starter Exercise-BuiltInValidation.bbj is covered by smoke and that sweep.
//
// Edit boxes are found by role (textbox, in form order) and the button by its visible text. The
// validation state is read from the dwc-field element the edit box is rendered as. A red test is a
// finding: the sample is never changed, and an assertion is never weakened to make it pass.
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { clickDialogButton, readDialogs, settle } from '../../lib/dwc.js';

const BASE = 'dwc/07_ControlValiation/';
const FIRST = 0;
const LAST = 1;
const COMPANY = 2;
const EMAIL = 3;
const ZIP = 7;

/**
 * Selects the whole content of an edit box and types the text; an empty text deletes the content.
 * (fill() glues the new text to the old content of a DWC edit box, seen live on BBj 26.03.)
 */
async function enter(page, index, text) {
  const box = page.getByRole('textbox').nth(index);
  await box.click({ timeout: 5000 });
  await box.press('ControlOrMeta+A');
  if (text === '') await box.press('Delete');
  else await box.pressSequentially(text);
  await settle(page, 300);
}

/** Moves the focus out of the field that was edited, into the Company box. */
async function leave(page) {
  await page.getByRole('textbox').nth(COMPANY).click({ timeout: 5000 });
  await settle(page, 400);
}

/** The validation state DWC keeps for the edit box at this index. */
function fieldState(page, index) {
  return page.locator('dwc-field').nth(index).evaluate(
    (el) => {
      const input = el.shadowRoot ? el.shadowRoot.querySelector('input') : null;
      return {
        required: el.hasAttribute('required'),
        invalid: el.hasAttribute('invalid'),
        ariaInvalid: input ? input.getAttribute('aria-invalid') : null,
        native: input ? input.validity.valid : null,
        value: el.value ?? '',
      };
    },
    undefined,
    { timeout: 5000 },
  );
}

/** Presses Submit and returns the message boxes it caused; each one is dismissed with its first button. */
async function pressSubmit(page) {
  await page.getByRole('button', { name: 'Submit' }).click({ timeout: 5000 });
  await settle(page, 2000);
  const dialogs = await readDialogs(page);
  for (const dialog of dialogs) await clickDialogButton(page, dialog.buttons[0]).catch(() => {});
  await settle(page, 500);
  return dialogs;
}

/** True when the Submit button is disabled. */
function submitDisabled(page) {
  return page.locator('dwc-button').filter({ hasText: 'Submit' }).first().evaluate((el) => el.hasAttribute('disabled'), undefined, { timeout: 5000 });
}

const boxText = (dialog) => (dialog ? `"${dialog.title}": ${dialog.text.replace(/\s+/g, ' ')}` : 'no message box');
const flag = (state) => `invalid attribute ${state.invalid}, aria-invalid ${state.ariaInvalid}, native validity ${state.native}`;

// ---------------------------------------------------------------------------------------------
// builtInValidation.bbj: First name and Last name are required, Zip Code has the pattern
// (\d{5})(-\d{4})? (lines 83 to 88). Page "Controlling When Validation Runs" and "Pattern Validation".
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}builtInValidation.bbj`,
  'required names: pristine at the start, invalid once emptied again, Submit waits for both',
  {},
  async ({ page, note }) => {
    const start = [await fieldState(page, FIRST), await fieldState(page, LAST)];
    await enter(page, FIRST, 'a');
    await enter(page, FIRST, '');
    await leave(page);
    const first = await fieldState(page, FIRST);
    const last = await fieldState(page, LAST);
    const blocked = await pressSubmit(page);
    await enter(page, FIRST, 'Jane');
    await enter(page, LAST, 'Doe');
    const accepted = await pressSubmit(page);

    note(`at the start: first name required ${start[0].required}, invalid ${start[0].invalid}; last name required ${start[1].required}, invalid ${start[1].invalid}`);
    note(`first name after typing a and emptying it: ${flag(first)}; the last name, never touched: invalid ${last.invalid}`);
    note(`Submit with an empty first name: ${blocked.length} message boxes (${boxText(blocked[0])})`);
    note(`Submit with both names filled: ${boxText(accepted[0])}`);

    expect(start[0].required && start[1].required, 'first and last name carry the required attribute').toBe(true);
    expect(start[0].invalid || start[1].invalid, 'the empty name fields are not marked invalid at the start').toBe(false);
    expect(first.invalid, 'an emptied first name is marked invalid').toBe(true);
    expect(last.invalid, 'the untouched last name is not marked invalid').toBe(false);
    expect(blocked.length, 'the form is not submitted while the first name is empty').toBe(0);
    expect(accepted.length, 'the filled form is submitted').toBe(1);
    expect(accepted[0].title, 'the success message box').toBe('Form Submitted Successfully');
  },
);

behaviourTest(
  `${BASE}builtInValidation.bbj`,
  'zip pattern: 87109 and 87109-1234 are valid, abc and 87109-12 are invalid, empty is valid',
  {},
  async ({ page, note }) => {
    // [text, valid]: the page says the field is valid with a regular or an extended zip code, and
    // that a field with a pattern is also valid when it is empty.
    const cases = [['abc', false], ['8710', false], ['87109', true], ['87109-1234', true], ['87109-12', false], ['', true]];
    const seen = [];
    const mismatches = [];
    for (const [text, valid] of cases) {
      await enter(page, ZIP, text);
      await leave(page);
      const state = await fieldState(page, ZIP);
      seen.push(`"${text}" ${state.invalid ? 'invalid' : 'valid'}`);
      if (state.invalid === valid) mismatches.push(`"${text}" is ${state.invalid ? 'invalid' : 'valid'}, expected ${valid ? 'valid' : 'invalid'}`);
    }
    note(`zip code states: ${seen.join(', ')}`);
    note(`${mismatches.length} differences: ${mismatches.join('; ') || 'none'}`);

    expect(mismatches, 'the zip pattern accepts exactly the values the page lists').toEqual([]);
  },
);

// ---------------------------------------------------------------------------------------------
// formValidation.bbj: server-side validation only, in the ON_FORM_VALIDATION callback (lines 75 to 86).
// Page "Form Validation" and "Example: Form Validation".
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}formValidation.bbj`,
  'Submit with empty names shows "Invalid Input", with both names filled "Form Submitted Successfully"',
  {},
  async ({ page, note }) => {
    const empty = await pressSubmit(page);
    await enter(page, FIRST, 'Jane');
    await enter(page, LAST, 'Doe');
    const filled = await pressSubmit(page);
    note(`Submit with empty names: ${empty.length} message boxes, ${boxText(empty[0])} [${(empty[0]?.buttons ?? []).join(', ')}]`);
    note(`Submit with both names filled: ${filled.length} message boxes, ${boxText(filled[0])}`);

    expect(empty.length, 'Submit with empty names opens one message box').toBe(1);
    expect(empty[0].title, 'the rejection message box').toBe('Invalid Input');
    expect(empty[0].text, 'the rejection names the required fields').toContain("You didn't fill in your first and last names, which are required");
    expect(filled.length, 'Submit with both names opens one message box').toBe(1);
    expect(filled[0].title, 'the success message box').toBe('Form Submitted Successfully');
    expect(filled[0].text, 'the success message').toContain('You filled in the form successfully!');
  },
);

behaviourTest(
  `${BASE}formValidation.bbj`,
  'a single space in each name field passes the check, as the page warns',
  {},
  async ({ page, note }) => {
    await enter(page, FIRST, ' ');
    await enter(page, LAST, ' ');
    const spaces = await pressSubmit(page);
    note(`Submit with a space in both name fields: ${spaces.length} message boxes, ${boxText(spaces[0])}`);

    expect(spaces.length, 'Submit opens one message box').toBe(1);
    expect(spaces[0].title, 'spaces pass the check (the page: "the user could enter a space in each name field and pass the check")').toBe('Form Submitted Successfully');
  },
);

// ---------------------------------------------------------------------------------------------
// javaScriptValidation-Required.bbj: client-side JavaScript functions for First name (popover message,
// lines 85 to 91) and Last name (inline message with its own icon, lines 101 to 104), and
// data-validation-auto-disable on the window (line 108). Page "JavaScript Validation".
// ---------------------------------------------------------------------------------------------
const FIRST_MESSAGE = 'This field is required; please enter your first name before submitting the form';
const LAST_MESSAGE = 'This field is required; please enter your last name before submitting the form';

/**
 * Where a validation message sits relative to its edit box: visible, and below the box. The box is the
 * text input itself: the dwc-field element around it grows to hold an inline message.
 */
async function messageBelow(page, message, index) {
  const text = page.getByText(message).first();
  const visible = await text.waitFor({ state: 'visible', timeout: 4000 }).then(() => true, () => false);
  if (!visible) return { visible: false, below: false };
  const at = await text.boundingBox();
  const input = await page.getByRole('textbox').nth(index).boundingBox();
  return { visible: true, below: Boolean(at && input && at.y >= input.y + input.height - 2), messageY: at && Math.round(at.y), fieldBottom: input && Math.round(input.y + input.height) };
}

behaviourTest(
  `${BASE}javaScriptValidation-Required.bbj`,
  'first name: the custom message shows in a popover below the field, spaces stay invalid, Submit is disabled',
  {},
  async ({ page, note }) => {
    const start = { first: await fieldState(page, FIRST), disabled: await submitDisabled(page) };
    await enter(page, FIRST, 'a');
    await enter(page, FIRST, '');
    const emptied = await fieldState(page, FIRST);
    const message = await messageBelow(page, FIRST_MESSAGE, FIRST);
    const disabledEmpty = await submitDisabled(page);
    await enter(page, FIRST, '   ');
    const spaces = await fieldState(page, FIRST);
    const disabledSpaces = await submitDisabled(page);

    note(`at the start: first name invalid ${start.first.invalid}, Submit disabled ${start.disabled}`);
    note(`after typing a and emptying the field: ${flag(emptied)}; Submit disabled ${disabledEmpty}`);
    note(`custom message visible ${message.visible}, below the field ${message.below} (message y ${message.messageY}, field bottom ${message.fieldBottom})`);
    note(`three spaces: invalid ${spaces.invalid}; Submit disabled ${disabledSpaces}`);

    expect(emptied.invalid, 'an emptied first name is invalid').toBe(true);
    expect(message.visible, 'the custom message "This field is required; please enter your first name..." is shown').toBe(true);
    expect(message.below, 'the popover sits below the first name field').toBe(true);
    expect(disabledEmpty, 'Submit is disabled while the first name is invalid').toBe(true);
    expect(spaces.invalid, 'spaces alone stay invalid because of trim()').toBe(true);
    expect(disabledSpaces, 'Submit stays disabled for spaces only').toBe(true);
  },
);

behaviourTest(
  `${BASE}javaScriptValidation-Required.bbj`,
  'last name: the custom message shows inline below the field, Submit is enabled once both names pass',
  {},
  async ({ page, note }) => {
    await enter(page, LAST, 'x');
    await enter(page, LAST, '');
    const emptied = await fieldState(page, LAST);
    const message = await messageBelow(page, LAST_MESSAGE, LAST);
    const disabledEmpty = await submitDisabled(page);
    await enter(page, FIRST, 'Jane');
    await enter(page, LAST, 'Doe');
    const disabledFilled = await submitDisabled(page);
    const accepted = await pressSubmit(page);

    note(`after typing x and emptying the last name: ${flag(emptied)}; Submit disabled ${disabledEmpty}`);
    note(`inline message visible ${message.visible}, below the field ${message.below} (message y ${message.messageY}, field bottom ${message.fieldBottom})`);
    note(`both names filled: Submit disabled ${disabledFilled}; Submit gives ${boxText(accepted[0])}`);

    expect(emptied.invalid, 'an emptied last name is invalid').toBe(true);
    expect(message.visible, 'the custom message "This field is required; please enter your last name..." is shown').toBe(true);
    expect(message.below, 'the inline message sits below the last name field').toBe(true);
    expect(disabledEmpty, 'Submit is disabled while the last name is invalid').toBe(true);
    expect(disabledFilled, 'Submit is enabled once both names pass').toBe(false);
    expect(accepted.length, 'Submit opens one message box').toBe(1);
    expect(accepted[0].title, 'the success message box').toBe('Form Submitted Successfully');
  },
);

// ---------------------------------------------------------------------------------------------
// Exercise-BuiltInValidationComplete.bbj (page 90-exercise-email-validation.mdx): the solution makes
// the Email field required (line 71) and gives it the email pattern from the exercise (line 72).
// First name and Last name are prefilled (Charlie Brown), Email is empty.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}Exercise-BuiltInValidationComplete.bbj`,
  'goal 1: the Email field is required, emptied again it turns invalid and Submit waits for it',
  {},
  async ({ page, note }) => {
    const start = await fieldState(page, EMAIL);
    await enter(page, EMAIL, 'a');
    await enter(page, EMAIL, '');
    await leave(page);
    const emptied = await fieldState(page, EMAIL);
    const blocked = await pressSubmit(page);

    note(`at the start: email required ${start.required}, invalid ${start.invalid}, native validity ${start.native}`);
    note(`after typing a and emptying the field: ${flag(emptied)}`);
    note(`Submit with an empty email: ${blocked.length} message boxes (${boxText(blocked[0])})`);

    expect(start.required, 'the Email field carries the required attribute').toBe(true);
    expect(emptied.invalid, 'an emptied Email field is marked invalid').toBe(true);
    expect(blocked.length, 'the form is not submitted while the email is empty').toBe(0);
  },
);

behaviourTest(
  `${BASE}Exercise-BuiltInValidationComplete.bbj`,
  'goal 2: the email pattern rejects malformed addresses, accepts a valid one, and Submit shows Congrats',
  {},
  async ({ page, note }) => {
    // [text, valid]
    const cases = [['abc', false], ['abc@', false], ['jane@example', false], ['jane@@example.com', false], ['jane@example.com', true], ['jane.doe@sub.example.org', true]];
    const seen = [];
    const mismatches = [];
    for (const [text, valid] of cases) {
      await enter(page, EMAIL, text);
      await leave(page);
      const state = await fieldState(page, EMAIL);
      seen.push(`${text} ${state.invalid ? 'invalid' : 'valid'}`);
      if (state.invalid === valid) mismatches.push(`${text} is ${state.invalid ? 'invalid' : 'valid'}, expected ${valid ? 'valid' : 'invalid'}`);
    }
    await enter(page, EMAIL, 'jane@example.com');
    const accepted = await pressSubmit(page);

    // The browser tells why it ignores a pattern it cannot compile.
    const complaint = (await page.consoleMessages().catch(() => [])).map((m) => m.text()).find((text) => /^Pattern attribute value .* is not a valid regular expression/.test(text));
    // The message ends "...Invalid regular expression: /<pattern>/<flags>: <reason>"; the pattern is long, so keep the end.
    const tail = complaint ? /\/([a-z]+): ([^:/]+)$/.exec(complaint) : null;
    const reason = !complaint ? 'no console message about the pattern' : tail ? `compiled with flags ${tail[1]}: ${tail[2]}` : `message ends "${complaint.slice(-80)}"`;

    // Most important first: the evidence of a result is cut at 700 characters.
    note(`${mismatches.length} differences: ${mismatches.join('; ') || 'none'}`);
    note(`browser console about the pattern attribute: ${complaint ? 'is not a valid regular expression' : 'nothing'}; ${reason}`);
    note(`Submit with all fields valid: ${boxText(accepted[0])}`);
    note(`email states: ${seen.join(', ')}`);

    expect(mismatches, 'the Email pattern accepts exactly the valid addresses').toEqual([]);
    expect(accepted.length, 'Submit opens one message box').toBe(1);
    expect(accepted[0].title, 'the success message box').toBe('Form Submitted Successfully');
    expect(accepted[0].text, 'the success message').toContain('Congrats, you filled in the form successfully!');
  },
);
