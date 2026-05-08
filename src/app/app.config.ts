import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore, Store } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { weatherActions } from './store/weather/weather.actions';
import { WeatherEffects } from './store/weather/weather.effects';
import { weatherFeature } from './store/weather/weather.reducer';
import {
  readFavoritesFromStorage,
  readRecentCitiesFromStorage,
  readVisualizationMode,
} from './store/weather/weather.storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore(),
    provideState(weatherFeature),
    provideEffects(WeatherEffects),
    ...(isDevMode() ? [provideStoreDevtools({ maxAge: 60 })] : []),
    provideAppInitializer(() => {
      inject(Store).dispatch(
        weatherActions.hydrateFromLocalStorage({
          recentCities: readRecentCitiesFromStorage(),
          favoritesCities: readFavoritesFromStorage(),
          visualizationMode: readVisualizationMode(),
        }),
      );
    }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
