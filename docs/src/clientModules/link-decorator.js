// Re-runs the link decorator from static/js/link-decorator.js after each
// client-side route change. The static script defines window.tryDecorate.
export function onRouteDidUpdate() {
  if (typeof window !== 'undefined' && typeof window.tryDecorate === 'function') {
    window.tryDecorate();
  }
}
