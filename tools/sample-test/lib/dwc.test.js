// attachCollectors against a fake page: no browser, no BBj.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import os from 'node:os';
import { attachCollectors } from './dwc.js';

function fakePage() {
  const page = new EventEmitter();
  page.on = page.addListener.bind(page);
  return page;
}

const message = (type, text) => ({ type: () => type, text: () => text });
const request = (url, errorText) => ({ url: () => url, failure: () => (errorText ? { errorText } : null) });
const response = (url, status) => ({ url: () => url, status: () => status });

test('page errors are recorded by message', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('pageerror', new Error('e.componentOnReady is not a function'));
  page.emit('pageerror', 'plain text error');
  assert.deepEqual(c.pageErrors, ['e.componentOnReady is not a function', 'plain text error']);
});

test('console errors and warnings are split by type; log and info are ignored', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('console', message('error', 'boom'));
  page.emit('console', message('warning', 'careful'));
  page.emit('console', message('log', 'hello'));
  page.emit('console', message('info', 'fyi'));
  assert.deepEqual(c.consoleErrors, ['boom']);
  assert.deepEqual(c.consoleWarnings, ['careful']);
});

test('DWC start-up lines and Chromium resource lines are skipped', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('console', message('log', 'Launching BASIS Dynamic Web Client'));
  page.emit('console', message('error', 'Running BASIS Dynamic Web Client failed'));
  page.emit('console', message('error', 'Failed to load resource: the server responded with a status of 404 (Not Found)'));
  page.emit('console', message('error', 'A real error that mentions Failed to load resource later'));
  assert.deepEqual(c.consoleErrors, ['A real error that mentions Failed to load resource later']);
});

test('responses of 400 and above are recorded, others are not', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('response', response('http://localhost:8888/ok.css', 200));
  page.emit('response', response('http://localhost:8888/redirect', 302));
  page.emit('response', response('http://localhost:8888/missing.css', 404));
  page.emit('response', response('https://cdnjs.cloudflare.com/x.js', 503));
  assert.deepEqual(c.network, [
    { url: 'http://localhost:8888/missing.css', status: 404, error: null, external: false },
    { url: 'https://cdnjs.cloudflare.com/x.js', status: 503, error: null, external: true },
  ]);
});

test('failed requests are recorded with the error text', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('requestfailed', request('https://fonts.googleapis.com/css', 'net::ERR_NAME_NOT_RESOLVED'));
  page.emit('requestfailed', request('http://localhost:8888/a', null));
  assert.deepEqual(c.network, [
    { url: 'https://fonts.googleapis.com/css', status: null, error: 'net::ERR_NAME_NOT_RESOLVED', external: true },
    { url: 'http://localhost:8888/a', status: null, error: 'request failed', external: false },
  ]);
});

test('local hosts are localhost, 127.0.0.1, ::1 and this machine', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  for (const host of ['localhost', '127.0.0.1', '[::1]', os.hostname().toLowerCase()]) {
    page.emit('response', response(`http://${host}:8888/x`, 404));
  }
  page.emit('response', response('http://example.com/x', 404));
  assert.deepEqual(c.network.map((n) => n.external), [false, false, false, false, true]);
});

test('native dialogs are recorded and dismissed', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  let dismissed = 0;
  page.emit('dialog', {
    type: () => 'alert',
    message: () => 'hi',
    dismiss: () => {
      dismissed += 1;
      return Promise.resolve();
    },
  });
  assert.deepEqual(c.nativeDialogs, [{ type: 'alert', message: 'hi' }]);
  assert.equal(dismissed, 1);
});

test('downloads and popups are recorded', () => {
  const page = fakePage();
  const c = attachCollectors(page);
  page.emit('download', { suggestedFilename: () => 'a.txt', url: () => 'http://localhost:8888/a.txt' });
  page.emit('popup', { url: () => 'http://localhost:8888/popup' });
  assert.deepEqual(c.downloads, [{ filename: 'a.txt', url: 'http://localhost:8888/a.txt' }]);
  assert.deepEqual(c.popups, ['http://localhost:8888/popup']);
});
