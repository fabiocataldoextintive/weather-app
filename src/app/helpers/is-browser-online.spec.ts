import { isBrowserOnline } from './is-browser-online';

describe('isBrowserOnline', () => {
  it('returns true when navigator.onLine is true', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    expect(isBrowserOnline()).toBe(true);
  });

  it('returns false when navigator.onLine is false', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    expect(isBrowserOnline()).toBe(false);
  });
});
