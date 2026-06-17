import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, filter, forkJoin, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { toWeatherApiLang } from '../../i18n/app-locale';
import { translate } from '../../i18n/translate';
import { isWeatherRefreshDue, lastUpdateToMs } from '../../helpers/weather-refresh';
import { countLettersAndDigits, sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import { searchStoredCities } from '../../helpers/search-stored-cities';
import type { Root } from '../../models/root.interface';
import { ConnectivityService } from '../../services/connectivity/connectivity.service';
import { WeatherService } from '../../services/weather/weather.service';
import { weatherActions } from './weather.actions';
import { toWeatherUserMessage } from './weather-user-message';
import { weatherFeature } from './weather.reducer';
import {
  writeFavoritesToStorage,
  writeLocaleToStorage,
  writeRecentCitiesToStorage,
  writeVisualizationMode,
  writeWeatherUpdateIntervalToStorage,
} from './weather.storage';
import { findRecentCityForFavorite, MIN_SEARCH_QUERY_LEN, favoriteCityKey, type RecentCity, type RecentCitiesMap } from './weather.state';

function resolveCachedWeather(q: string, label: string, recentCities: RecentCitiesMap): RecentCity | undefined {
  if (recentCities[q]) {
    return recentCities[q];
  }
  return findRecentCityForFavorite(recentCities, label) ?? findRecentCityForFavorite(recentCities, q);
}

function shouldFetchFreshWeather(cached: RecentCity | undefined, intervalMs: number): boolean {
  if (!cached) return true;
  return isWeatherRefreshDue(lastUpdateToMs(cached.lastUpdate, cached.updatedAt), intervalMs);
}

@Injectable()
export class WeatherEffects {
  private readonly actions$ = inject(Actions);
  private readonly weather = inject(WeatherService);
  private readonly store = inject(Store);
  private readonly connectivity = inject(ConnectivityService);

  readonly autocomplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.searchInputChanged),
      debounceTime(300),
      withLatestFrom(
        this.store.select(weatherFeature.selectSearchText),
        this.store.select(weatherFeature.selectLocale),
        this.store.select(weatherFeature.selectRecentCities),
        this.store.select(weatherFeature.selectFavoritesCities),
      ),
      switchMap(([, q, locale, recentCities, favoritesCities]) => {
        if (q.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(q) < MIN_SEARCH_QUERY_LEN) {
          return of(weatherActions.suggestionsResolved({ list: [], show: false }));
        }
        if (!this.connectivity.isOnline()) {
          const list = searchStoredCities(q, recentCities, favoritesCities);
          if (list.length === 0) {
            return of(
              weatherActions.suggestionsResolved({ list, show: false }),
              weatherActions.searchValidationFailed({
                message: translate('err.offlineSearch', locale),
              }),
            );
          }
          return of(weatherActions.suggestionsResolved({ list, show: true }));
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
      withLatestFrom(
        this.store.select(weatherFeature.selectRecentCities),
        this.store.select(weatherFeature.selectWeatherUpdateTimeInterval),
      ),
      filter(([{ key }, recentCities]) => Boolean(recentCities[key])),
      map(([{ key }, recentCities, intervalMs]) => {
        const row = recentCities[key];
        if (!this.connectivity.isOnline()) {
          return weatherActions.loadCurrentWeatherSuccess({
            q: key,
            label: row.label,
            root: row.root,
          });
        }
        if (!shouldFetchFreshWeather(row, intervalMs)) {
          return weatherActions.loadCurrentWeatherSuccess({
            q: key,
            label: row.label,
            root: row.root,
          });
        }
        return weatherActions.loadCurrentWeather({ q: key, label: row.label });
      }),
    ),
  );

  readonly favoriteSelectedLoadsWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.favoriteSelected),
      withLatestFrom(
        this.store.select(weatherFeature.selectFavoritesCities),
        this.store.select(weatherFeature.selectRecentCities),
        this.store.select(weatherFeature.selectLocale),
        this.store.select(weatherFeature.selectWeatherUpdateTimeInterval),
      ),
      filter(([{ cityLabel }, favoritesCities]) => Boolean(favoritesCities[favoriteCityKey(cityLabel)])),
      switchMap(([{ cityLabel }, favoritesCities, recentCities, locale, intervalMs]) => {
        const fk = favoriteCityKey(cityLabel);
        const favorite = favoritesCities[fk];
        const cached = findRecentCityForFavorite(recentCities, cityLabel);
        if (!this.connectivity.isOnline()) {
          if (cached) {
            return of(
              weatherActions.loadCurrentWeatherSuccess({
                q: cached.key,
                label: cached.label,
                root: cached.root,
              }),
            );
          }
          return of(
            weatherActions.loadCurrentWeatherFailure({
              userMessage: translate('err.offlineLiveWeather', locale),
            }),
          );
        }
        const lastUpdateMs = lastUpdateToMs(favorite?.lastUpdate, cached?.updatedAt);
        if (cached && !isWeatherRefreshDue(lastUpdateMs, intervalMs)) {
          return of(
            weatherActions.loadCurrentWeatherSuccess({
              q: cached.key,
              label: cached.label,
              root: cached.root,
            }),
          );
        }
        return of(weatherActions.loadCurrentWeather({ q: cityLabel, label: cityLabel }));
      }),
    ),
  );

  readonly loadCurrentWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.loadCurrentWeather),
      withLatestFrom(
        this.store.select(weatherFeature.selectLocale),
        this.store.select(weatherFeature.selectRecentCities),
        this.store.select(weatherFeature.selectWeatherUpdateTimeInterval),
      ),
      switchMap(([{ q, label }, locale, recentCities, intervalMs]) => {
        const qApi = sanitizeWeatherSearchInput(q);
        if (qApi.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(qApi) < MIN_SEARCH_QUERY_LEN) {
          return of(
            weatherActions.loadCurrentWeatherFailure({
              userMessage: translate('err.invalidSearchQuery', locale),
            }),
          );
        }
        const cached = resolveCachedWeather(qApi, label, recentCities);
        if (!this.connectivity.isOnline()) {
          if (cached) {
            return of(
              weatherActions.loadCurrentWeatherSuccess({
                q: cached.key,
                label: cached.label,
                root: cached.root,
              }),
            );
          }
          return of(
            weatherActions.loadCurrentWeatherFailure({
              userMessage: translate('err.offlineLiveWeather', locale),
            }),
          );
        }
        if (cached && !shouldFetchFreshWeather(cached, intervalMs)) {
          return of(
            weatherActions.loadCurrentWeatherSuccess({
              q: cached.key,
              label: cached.label,
              root: cached.root,
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
        if (!this.connectivity.isOnline()) {
          return of(weatherActions.recentCitiesRootsUpdated({ updates: [] }));
        }
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

  readonly persistWeatherUpdateInterval$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(weatherActions.weatherUpdateIntervalChanged),
        tap(({ intervalMs }) => {
          writeWeatherUpdateIntervalToStorage(intervalMs);
        }),
      ),
    { dispatch: false },
  );
}
