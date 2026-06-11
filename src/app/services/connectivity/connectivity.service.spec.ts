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
