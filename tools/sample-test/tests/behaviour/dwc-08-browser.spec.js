// Behaviour tests for the browser constraint samples of the DWC book, chapter "Browser Constraints"
// (page dwc/09-browser-constraints/index.md: "File Uploads", "File Downloads", "Printing and Print
// Preview"). The sample files are in docs/examples/dwc/08_BrowserConstraints.
//
// A download is never read: the tests note its suggested file name and its size only, and delete it.
// An upload is a file made in the page itself and dropped on the file chooser, so nothing is written
// below docs/. The Select Files... button of the chooser cannot be driven: the control opens the
// picker with window.showOpenFilePicker, which Playwright's file chooser interception aborts, and the
// page itself names drag and drop as the other way to add files.
//
// Controls are found by role and visible text. A red test is a finding: the sample is never changed,
// and an assertion is never weakened to make it pass.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect } from '../../lib/fixtures.js';
import { behaviourTest } from '../../lib/behaviour.js';
import { clickDialogButton, readDialogs, settle } from '../../lib/dwc.js';

const BASE = 'dwc/08_BrowserConstraints/';

/** The first visible message box within the time, or null. */
async function nextDialog(page, timeoutMs = 10000) {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const dialogs = await readDialogs(page);
    if (dialogs.length > 0) return dialogs[0];
    if (Date.now() > end) return null;
    await settle(page, 250);
  }
}

/** Drops files on the BBjFileChooser (a dwc-upload element). The files are created in the page. */
async function dropFiles(page, names) {
  const transfer = await page.evaluateHandle((list) => {
    const data = new DataTransfer();
    for (const name of list) data.items.add(new File([`courses sample test upload ${name}\n`], name, { type: 'text/plain' }));
    return data;
  }, names);
  const zone = page.locator('dwc-upload');
  for (const type of ['dragenter', 'dragover', 'drop']) await zone.dispatchEvent(type, { dataTransfer: transfer }, { timeout: 5000 });
}

// ---------------------------------------------------------------------------------------------
// BBjFileChooserUpload.bbj: a BBjFileChooser (multi-selection, "Text Files" filter active); every
// approved file is copied to the server with copyFromClient() and a message box names it
// ("File <name> uploaded to Server", lines 29 to 35). The page: "The user can also add files by drag
// and drop ... and to show a drop zone."
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}BBjFileChooserUpload.bbj`,
  'a file dropped on the file chooser is uploaded and a message box names it',
  {},
  async ({ page, note }) => {
    const name = 'courses-sample-upload.txt';
    const dropZone = await page.getByText('Drop files to upload').first().isVisible();
    const selectButton = await page.locator('dwc-button').filter({ hasText: 'Select Files' }).first().isVisible();
    note(`the file chooser shows a drop zone ${dropZone} and a Select Files button ${selectButton}; window title "${await page.title()}"`);

    await dropFiles(page, [name]);
    const dialog = await nextDialog(page);
    const listed = await page.locator('dwc-upload').evaluate((el) => (el.shadowRoot ? el.shadowRoot.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 80), undefined, { timeout: 5000 });
    note(`file list of the chooser: ${listed}`);
    note(`message box: "${dialog ? dialog.title : 'none'}" with buttons ${dialog ? dialog.buttons.join(', ') : 'none'}; its text is the server path of the copy (not recorded)`);
    if (dialog) await clickDialogButton(page, dialog.buttons[0]).catch(() => {});

    expect(dropZone, 'the chooser shows a drop zone').toBe(true);
    expect(dialog, 'a message box appears after the drop').not.toBeNull();
    expect(dialog.title.startsWith('File '), 'the title starts with "File "').toBe(true);
    expect(dialog.title.endsWith('uploaded to Server'), 'the title ends with "uploaded to Server"').toBe(true);
    expect(dialog.title, 'the title names the dropped file').toContain(name);
  },
);

behaviourTest(
  `${BASE}BBjFileChooserUpload.bbj`,
  'two dropped files are both uploaded, one message box each',
  {},
  async ({ page, note }) => {
    const names = ['courses-upload-a.txt', 'courses-upload-b.txt'];
    await dropFiles(page, names);
    const titles = [];
    for (let i = 0; i < names.length; i += 1) {
      const dialog = await nextDialog(page);
      if (!dialog) break;
      titles.push(dialog.title);
      await clickDialogButton(page, dialog.buttons[0]).catch(() => {});
      await settle(page, 500);
    }
    note(`message boxes in order: ${titles.map((title) => `"${title}"`).join(' then ') || 'none'}`);

    expect(titles.length, 'one message box per dropped file').toBe(names.length);
    for (const name of names) {
      expect(titles.filter((title) => title.includes(name) && title.endsWith('uploaded to Server')).length, `a message box names ${name}`).toBe(1);
    }
  },
);

// ---------------------------------------------------------------------------------------------
// DownloadingAFile.bbj: the button "Download BBj.properties" copies ../cfg/BBj.properties to the client
// as BBj.properties.txt with BBjClientFile::copyToClient (lines 13 to 16). Page "File Downloads".
// The content of the file is never read.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}DownloadingAFile.bbj`,
  'the button downloads BBj.properties to the client as BBj.properties.txt',
  {},
  async ({ page, note }) => {
    const button = page.getByRole('button', { name: 'Download BBj.properties' });
    await expect(button, 'the Download BBj.properties button is visible').toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), button.click({ timeout: 5000 })]);
    const name = download.suggestedFilename();
    const failure = await download.failure();
    // Only the size is read: the downloaded file is saved to a temporary file, measured and deleted.
    let size = null;
    const copy = path.join(os.tmpdir(), `courses-download-size-${process.pid}.tmp`);
    try {
      await download.saveAs(copy);
      size = fs.statSync(copy).size;
    } finally {
      fs.rmSync(copy, { force: true });
      await download.delete();
    }
    note(`download: suggested file name ${name}, size ${size} bytes, failure ${failure ?? 'none'}; the content is never read or noted`);

    expect(failure, 'the download did not fail').toBeNull();
    expect(name, 'the suggested file name').toBe('BBj.properties.txt');
    expect(size, 'the download is not empty').toBeGreaterThan(0);
  },
);

// ---------------------------------------------------------------------------------------------
// SysPrint.bbj: opens the "LP" printer with mode="PDF", prints HELLO, closes it, and shows
// msgbox("done!"). The page: "In BUI and the DWC, the following snippet creates a SysPrint output and
// shows it in the browser, even though the program does not specify PREVIEW." The PDF is delivered
// through the print servlet to a second browser page (a popup) the moment the printer is closed, which
// is before the test body starts, so the test reads the popup page and its requests afterwards.
// ---------------------------------------------------------------------------------------------
behaviourTest(
  `${BASE}SysPrint.bbj`,
  'the PDF print job reaches the client and the program ends with the message box "done!"',
  {},
  async ({ page, note }) => {
    await settle(page, 1500);
    const dialogs = await readDialogs(page);
    const others = page.context().pages().filter((other) => other !== page);
    const pdf = [];
    for (const other of others) {
      for (const request of await other.requests().catch(() => [])) {
        if (!/\/printServlet\/.*\.pdf/.test(request.url())) continue;
        const response = await request.response().catch(() => null);
        pdf.push({
          path: new URL(request.url()).pathname.replace(/\d{4,}/g, '<n>'),
          status: response ? response.status() : null,
          type: response ? await response.headerValue('content-type').catch(() => null) : null,
        });
      }
    }
    for (const request of await page.requests()) {
      if (/\/printServlet\/.*\.pdf/.test(request.url())) pdf.push({ path: new URL(request.url()).pathname.replace(/\d{4,}/g, '<n>'), status: null, type: null });
    }
    const hide = (await page.consoleMessages().catch(() => [])).filter((m) => /HidePrintPopupMessage/.test(m.text())).length;

    note(`message boxes: ${dialogs.length}; text "${dialogs[0] ? dialogs[0].text : 'none'}"; buttons ${dialogs[0] ? dialogs[0].buttons.join(', ') : 'none'}`);
    note(`the title of the message box is ${dialogs[0] && /SysPrint\.bbj$/.test(dialogs[0].title) ? 'the path of the program (no title was given)' : 'something else'}`);
    note(`extra browser pages (popups): ${others.length}; PDF requests of the print servlet: ${pdf.length}${pdf[0] ? ` (${pdf[0].path}, status ${pdf[0].status ?? 'n/a'}, type ${pdf[0].type ?? 'n/a'})` : ''}; HidePrintPopupMessage in the console: ${hide}`);
    if (dialogs[0]) await clickDialogButton(page, dialogs[0].buttons[0]).catch(() => {});

    expect(dialogs.length, 'the program ends with one message box').toBe(1);
    expect(dialogs[0].text, 'the message box says done!').toBe('done!');
    expect(pdf.length, 'a PDF from the print servlet reaches the browser').toBeGreaterThan(0);
  },
);
