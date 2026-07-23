import { TestBed } from '@angular/core/testing';

import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('reflects navigator.onLine', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    const service = TestBed.inject(ConnectivityService);
    expect(service.isOnline()).toBe(true);
  });

  it('updates signal when browser fires offline/online events', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    const service = TestBed.inject(ConnectivityService);
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
  });
});

/*
 * NOTE (coverage gap — intentional skip after retries):
 * `ConnectivityService` constructor line `if (typeof window === 'undefined') return;`
 * is an SSR guard. jsdom exposes a non-configurable `window`, so this branch cannot
 * be exercised without editing production source. File stays ~88.9% statements /
 * ~85.7% lines; all browser paths are covered.
 */
