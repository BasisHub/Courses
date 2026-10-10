import fs from 'node:fs';

// Windows can refuse a rename for a moment when antivirus, an indexer or an editor holds the target
// file. The baseline's last step (the report) lost a 30-minute run to one such EPERM. A rename is
// retried on these codes only; any other error, and the last failure, is thrown unchanged.
export const RETRYABLE_RENAME_CODES = ['EPERM', 'EBUSY', 'EACCES'];

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Renames a file, retrying when the operating system says the file is busy.
 * @param {string} from
 * @param {string} to
 * @param {{ rename?: (from: string, to: string) => void, retries?: number, waitMs?: number, sleep?: (ms: number) => void }} [options]
 *   `retries` is the number of repeats after the first try (default 10), `waitMs` the pause before each repeat (default 200).
 */
export function renameWithRetry(from, to, { rename = fs.renameSync, retries = 10, waitMs = 200, sleep = sleepSync } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      rename(from, to);
      return;
    } catch (error) {
      if (!RETRYABLE_RENAME_CODES.includes(error?.code) || attempt >= retries) throw error;
      sleep(waitMs);
    }
  }
}

/**
 * Replaces `to` with the content of `from`. Tries the atomic rename first (with retries); when the
 * target stays locked against replacement, which happens on Windows while an editor or indexer
 * keeps the file open without delete sharing, writes the content into the existing file instead.
 * Returns 'renamed' or 'written'. The caller removes `from` afterwards.
 * @param {string} from
 * @param {string} to
 * @param {Parameters<typeof renameWithRetry>[2]} [options]
 */
export function replaceFile(from, to, options = {}) {
  try {
    renameWithRetry(from, to, options);
    return 'renamed';
  } catch (error) {
    if (!RETRYABLE_RENAME_CODES.includes(error?.code) || !fs.existsSync(to)) throw error;
    fs.writeFileSync(to, fs.readFileSync(from));
    return 'written';
  }
}
