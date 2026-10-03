// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ).
// Local changes: tryDecorate() no longer receives the DOM Event as its retry
// count (upstream polled forever), and the non-existent `pushstate` listener is
// gone. SPA route changes call window.tryDecorate() from the client module
// src/clientModules/link-decorator.js (onRouteDidUpdate).
function decorateLinks() {
  document.querySelectorAll('a').forEach(a => {
    if (a.textContent.trim() && a.children.length === 0) {
      a.classList.add('empty-link');
    }
  });
}

function tryDecorate(retries) {
  if (typeof retries !== 'number') retries = 10;
  if (retries <= 0) return;
  decorateLinks();
  setTimeout(() => tryDecorate(retries - 1), 50);
}

window.tryDecorate = tryDecorate;
document.addEventListener('DOMContentLoaded', () => tryDecorate());
window.addEventListener('popstate', () => tryDecorate());
tryDecorate();
