import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, filter, forkJoin, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { toWeatherApiLang } from '../../i18n/app-locale';
import { translate } from '../../i18n/translate';
import { countLettersAndDigits, sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import type { Root } from '../../models/root.interface';
import { WeatherService } from '../../services/weather/weather.service';
import { weatherActions } from './weather.actions';
import { toWeatherUserMessage } from './weather-user-message';
import { weatherFeature } from './weather.reducer';
import {
  writeFavoritesToStorage,
  writeLocaleToStorage,
  writeRecentCitiesToStorage,
  writeVisualizationMode,
} from './weather.storage';
import { MIN_SEARCH_QUERY_LEN, favoriteCityKey } from './weather.state';

@Injectable()
export class WeatherEffects {
  private readonly actions$ = inject(Actions);
  private readonly weather = inject(WeatherService);
  private readonly store = inject(Store);

  readonly autocomplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.searchInputChanged),
      debounceTime(300),
      withLatestFrom(
        this.store.select(weatherFeature.selectSearchText),
        this.store.select(weatherFeature.selectLocale),
      ),
      switchMap(([, q, locale]) => {
        if (q.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(q) < MIN_SEARCH_QUERY_LEN) {
          return of(weatherActions.suggestionsResolved({ list: [], show: false }));
        }
        return this.weather.searchLocations(q).pipe(
          switchMap((list) => {
            if (list.length === 0) {
              return of(
                weatherActions.suggestionsResolved({ list, show: false }),
                weatherActions.searchValidationFailed({
                  message: translate('err.noCitySuggestions', locale),
                }),
              );
            }
            return of(weatherActions.suggestionsResolved({ list, show: true }));
          }),
          catchError(() => of(weatherActions.suggestionsResolved({ list: [], show: false }))),
        );
      }),
    ),
  );

  readonly pickSuggestionLoadsWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.suggestionPicked),
      map(({ q, label }) => weatherActions.loadCurrentWeather({ q, label })),
    ),
  );

  readonly recentRowSelectedLoadsWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.recentRowSelected),
      withLatestFrom(this.store.select(weatherFeature.selectRecentCities)),
      filter(([{ key }, recentCities]) => Boolean(recentCities[key])),
      map(([{ key }, recentCities]) => {
        const row = recentCities[key];
        return weatherActions.loadCurrentWeather({ q: key, label: row.label });
      }),
    ),
  );

  readonly favoriteSelectedLoadsWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.favoriteSelected),
      withLatestFrom(this.store.select(weatherFeature.selectFavoritesCities)),
      filter(([{ cityLabel }, favoritesCities]) => Boolean(favoritesCities[favoriteCityKey(cityLabel)])),
      map(([{ cityLabel }]) => weatherActions.loadCurrentWeather({ q: cityLabel, label: cityLabel })),
    ),
  );

  readonly loadCurrentWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.loadCurrentWeather),
      withLatestFrom(this.store.select(weatherFeature.selectLocale)),
      switchMap(([{ q, label }, locale]) => {
        const qApi = sanitizeWeatherSearchInput(q);
        if (qApi.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(qApi) < MIN_SEARCH_QUERY_LEN) {
          return of(
            weatherActions.loadCurrentWeatherFailure({
              userMessage: translate('err.invalidSearchQuery', locale),
            }),
          );
        }
        return this.weather.getCurrent(qApi, toWeatherApiLang(locale)).pipe(
          map((root) => weatherActions.loadCurrentWeatherSuccess({ q: qApi, label, root })),
          catchError((err: unknown) =>
            of(
              weatherActions.loadCurrentWeatherFailure({
                userMessage: toWeatherUserMessage(err instanceof Error ? err : new Error(String(err)), locale),
              }),
            ),
          ),
        );
      }),
    ),
  );

  readonly refreshRecentOnLocaleChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.localeChanged),
      withLatestFrom(
        this.store.select(weatherFeature.selectLocale),
        this.store.select(weatherFeature.selectRecentCities),
      ),
      switchMap(([, locale, recentCities]) => {
        const keys = Object.keys(recentCities);
        if (keys.length === 0) {
          return of(weatherActions.recentCitiesRootsUpdated({ updates: [] }));
        }
        const apiLang = toWeatherApiLang(locale);
        return forkJoin(
          keys.map((key) => {
            const qApi = sanitizeWeatherSearchInput(key);
            return this.weather.getCurrent(qApi, apiLang).pipe(
              map((root) => ({ key, root })),
              catchError(() => of(null)),
            );
          }),
        ).pipe(
          map((results) => {
            const updates = results.filter((row): row is { key: string; root: Root } => row !== null);
            return weatherActions.recentCitiesRootsUpdated({ updates });
          }),
        );
      }),
    ),
  );

  readonly persistRecentAndFavorites$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(weatherActions.loadCurrentWeatherSuccess, weatherActions.favoriteCityToggled),
        tap(() => {
          const recent = this.store.selectSignal(weatherFeature.selectRecentCities)();
          const favorites = this.store.selectSignal(weatherFeature.selectFavoritesCities)();
          writeRecentCitiesToStorage(recent);
          writeFavoritesToStorage(favorites);
        }),
      ),
    { dispatch: false },
  );

  readonly persistVisualization$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(weatherActions.visualizationModeChanged),
        tap(() => {
          const mode = this.store.selectSignal(weatherFeature.selectVisualizationMode)();
          writeVisualizationMode(mode);
        }),
      ),
    { dispatch: false },
  );

  readonly persistLocale$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(weatherActions.localeChanged),
        tap(({ locale }) => {
          writeLocaleToStorage(locale);
          if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
          }
        }),
      ),
    { dispatch: false },
  );
}
