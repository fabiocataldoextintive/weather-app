import { Injectable, signal } from '@angular/core';

import { isBrowserOnline } from '../../helpers/is-browser-online';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly isOnline = signal(isBrowserOnline());

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const sync = (): void => this.isOnline.set(isBrowserOnline());
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
  }
}
