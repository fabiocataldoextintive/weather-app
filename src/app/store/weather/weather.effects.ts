import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, filter, map, of, switchMap, tap, withLatestFrom } from 'rxjs';

import { countLettersAndDigits, sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import { WeatherService } from '../../services/weather/weather.service';
import { weatherActions } from './weather.actions';
import { toWeatherUserMessage } from './weather-user-message';
import { weatherFeature } from './weather.reducer';
import {
  writeFavoritesToStorage,
  writeRecentCitiesToStorage,
  writeVisualizationMode,
} from './weather.storage';
import { MIN_SEARCH_QUERY_LEN } from './weather.state';

@Injectable()
export class WeatherEffects {
  private readonly actions$ = inject(Actions);
  private readonly weather = inject(WeatherService);
  private readonly store = inject(Store);

  readonly autocomplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.searchInputChanged),
      debounceTime(300),
      withLatestFrom(this.store.select(weatherFeature.selectSearchText)),
      switchMap(([, q]) => {
        if (q.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(q) < MIN_SEARCH_QUERY_LEN) {
          return of(weatherActions.suggestionsResolved({ list: [], show: false }));
        }
        return this.weather.searchLocations(q).pipe(
          map((list) => weatherActions.suggestionsResolved({ list, show: list.length > 0 })),
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

  readonly loadCurrentWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherActions.loadCurrentWeather),
      switchMap(({ q, label }) => {
        const qApi = sanitizeWeatherSearchInput(q);
        if (qApi.length < MIN_SEARCH_QUERY_LEN || countLettersAndDigits(qApi) < MIN_SEARCH_QUERY_LEN) {
          return of(
            weatherActions.loadCurrentWeatherFailure({
              userMessage: $localize`:@@err.invalidSearchQuery:That search is not valid. Use letters or numbers (for example a city name or coordinates).`,
            }),
          );
        }
        return this.weather.getCurrent(qApi).pipe(
          map((root) => weatherActions.loadCurrentWeatherSuccess({ q: qApi, label, root })),
          catchError((err: unknown) =>
            of(
              weatherActions.loadCurrentWeatherFailure({
                userMessage: toWeatherUserMessage(err instanceof Error ? err : new Error(String(err))),
              }),
            ),
          ),
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
}
