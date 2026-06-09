import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { weatherFeature } from '../store/weather/weather.reducer';
import type { MessageId } from './messages';
import { translate } from './translate';

@Pipe({
  name: 'i18n',
  standalone: true,
  pure: false,
})
export class I18nPipe implements PipeTransform {
  private readonly store = inject(Store);
  private readonly locale = this.store.selectSignal(weatherFeature.selectLocale);

  transform(key: MessageId, params?: Record<string, string | number>): string {
    return translate(key, this.locale(), params);
  }
}
