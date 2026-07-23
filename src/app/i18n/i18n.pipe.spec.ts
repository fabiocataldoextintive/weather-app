import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { initialWeatherState } from '../store/weather/weather.state';
import { I18nPipe } from './i18n.pipe';

describe('I18nPipe', () => {
  function createPipe(locale: 'en' | 'es' = 'en'): I18nPipe {
    TestBed.configureTestingModule({
      providers: [
        I18nPipe,
        provideMockStore({
          initialState: {
            weather: { ...initialWeatherState, locale },
          },
        }),
      ],
    });
    return TestBed.inject(I18nPipe);
  }

  it('translates keys using the store locale (English)', () => {
    const pipe = createPipe('en');
    expect(pipe.transform('dashboard.title')).toBe('Weather');
  });

  it('translates keys using the store locale (Spanish)', () => {
    const pipe = createPipe('es');
    expect(pipe.transform('dashboard.title')).toBe('Tiempo');
  });

  it('passes interpolation params through', () => {
    const pipe = createPipe('en');
    expect(pipe.transform('table.paginationStatus', { current: 1, total: 3 })).toBe('Page 1 of 3');
  });
});
