import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';

import { appConfig } from './app.config';
import { weatherFeature } from './store/weather/weather.reducer';
import * as weatherStorage from './store/weather/weather.storage';

describe('appConfig', () => {
  it('defines a provider list for bootstrap', () => {
    expect(appConfig).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect((appConfig.providers ?? []).length).toBeGreaterThan(0);
  });

  describe('bootstrap', () => {
    beforeEach(async () => {
      vi.spyOn(weatherStorage, 'readRecentCitiesFromStorage').mockReturnValue({});
      vi.spyOn(weatherStorage, 'readFavoritesFromStorage').mockReturnValue({});
      vi.spyOn(weatherStorage, 'readVisualizationMode').mockReturnValue('table');
      vi.spyOn(weatherStorage, 'readLocaleFromStorage').mockReturnValue('es');
      await TestBed.configureTestingModule({
        providers: appConfig.providers,
      }).compileComponents();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      TestBed.resetTestingModule();
    });

    it('runs app initializer and hydrates weather state from storage', async () => {
      await TestBed.inject(ApplicationInitStatus).donePromise;
      const store = TestBed.inject(Store);
      const mode = store.selectSignal(weatherFeature.selectVisualizationMode);
      expect(mode()).toBe('table');
      const locale = store.selectSignal(weatherFeature.selectLocale);
      expect(locale()).toBe('es');
      const recent = store.selectSignal(weatherFeature.selectRecentCities);
      expect(recent()).toEqual({});
    });
  });
});
