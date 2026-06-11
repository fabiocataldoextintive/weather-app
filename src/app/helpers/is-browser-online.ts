/** True when browser reports network connectivity. SSR/test-safe. */
export function isBrowserOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine;
}
