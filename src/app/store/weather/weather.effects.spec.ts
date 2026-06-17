import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { signal, type WritableSignal } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { Subject } from 'rxjs';

import { sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import { ConnectivityService } from '../../services/connectivity/connectivity.service';
import { WeatherService } from '../../services/weather/weather.service';
import type { SearchLocation } from '../../models/search-location.interface';
import { weatherActions } from './weather.actions';
import { WeatherEffects } from './weather.effects';
import { mockRecentCity, mockWeatherRoot } from './weather-test-fixtures';
import { initialWeatherState } from './weather.state';
import * as weatherStorage from './weather.storage';

describe('WeatherEffects', () => {
  let actions$: Subject<Action>;
  let weatherApi: { searchLocations: ReturnType<typeof vi.fn>; getCurrent: ReturnType<typeof vi.fn> };
  let store: MockStore;
  let isOnline: WritableSignal<boolean>;

  beforeEach(() => {
    vi.useFakeTimers();
    isOnline = signal(true);
    actions$ = new Subject<Action>();
    weatherApi = {
      searchLocations: vi.fn(),
      getCurrent: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        WeatherEffects,
        provideMockActions(() => actions$.asObservable()),
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
        { provide: WeatherService, useValue: weatherApi },
        { provide: ConnectivityService, useValue: { isOnline } },
      ],
    });
    store = TestBed.inject(MockStore);
    vi.spyOn(weatherStorage, 'writeRecentCitiesToStorage').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeFavoritesToStorage').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeVisualizationMode').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeLocaleToStorage').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeWeatherUpdateIntervalToStorage').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should instantiate effects', () => {
    expect(TestBed.inject(WeatherEffects)).toBeTruthy();
  });

  it('autocomplete emits empty list without API when query too short', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const emitted = firstValueFrom(effects.autocomplete$);
    actions$.next(weatherActions.searchInputChanged({ raw: 'a' }));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('a'),
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    const action = await emitted;
    expect(weatherApi.searchLocations).not.toHaveBeenCalled();
    expect(action).toEqual(weatherActions.suggestionsResolved({ list: [], show: false }));
  });

  it('autocomplete emits validation message when API returns empty list', async () => {
    const effects = TestBed.inject(WeatherEffects);
    weatherApi.searchLocations.mockReturnValue(of([]));
    const emitted: Action[] = [];
    const sub = effects.autocomplete$.subscribe((a) => emitted.push(a));
    actions$.next(weatherActions.searchInputChanged({ raw: 'ddddddddasdasdasdasdasd' }));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('ddddddddasdasdasdasdasd'),
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    sub.unsubscribe();
    expect(weatherApi.searchLocations).toHaveBeenCalled();
    expect(emitted).toContainEqual(weatherActions.suggestionsResolved({ list: [], show: false }));
    expect(emitted).toContainEqual(
      weatherActions.searchValidationFailed({
        message: 'No city suggestions available. Try writing another city.',
      }),
    );
  });

  it('autocomplete calls API when query is valid', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const loc: SearchLocation = {
      id: 1,
      name: 'Paris',
      region: '',
      country: 'FR',
      lat: 1,
      lon: 2,
      url: '',
    };
    weatherApi.searchLocations.mockReturnValue(of([loc]));
    const emitted = firstValueFrom(effects.autocomplete$);
    actions$.next(weatherActions.searchInputChanged({ raw: 'Paris' }));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('Paris'),
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    const action = await emitted;
    expect(weatherApi.searchLocations).toHaveBeenCalledWith('Paris');
    expect(action.type).toBe(weatherActions.suggestionsResolved.type);
  });

  it('pickSuggestionLoadsWeather emits loadCurrentWeather', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const emitted = firstValueFrom(effects.pickSuggestionLoadsWeather$);
    actions$.next(weatherActions.suggestionPicked({ q: '1,2', label: 'L' }));
    const action = await emitted;
    expect(action).toEqual(weatherActions.loadCurrentWeather({ q: '1,2', label: 'L' }));
  });

  it('recentRowSelectedLoadsWeather emits loadCurrentWeather for known row', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const row = mockRecentCity({ lastUpdate: new Date(Date.now() - 600_000).toISOString() });
    const key = row.key;
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [key]: row },
      },
    });
    const emitted = firstValueFrom(effects.recentRowSelectedLoadsWeather$);
    actions$.next(weatherActions.recentRowSelected({ key }));
    const action = await emitted;
    expect(action).toEqual(weatherActions.loadCurrentWeather({ q: key, label: row.label }));
  });

  it('recentRowSelectedLoadsWeather serves cache when interval not elapsed', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const row = mockRecentCity({ lastUpdate: new Date().toISOString() });
    const key = row.key;
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [key]: row },
      },
    });
    const emitted = firstValueFrom(effects.recentRowSelectedLoadsWeather$);
    actions$.next(weatherActions.recentRowSelected({ key }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherSuccess({ q: key, label: row.label, root: row.root }),
    );
  });

  it('recentRowSelectedLoadsWeather ignores unknown key', async () => {
    const effects = TestBed.inject(WeatherEffects);
    let emitted = false;
    effects.recentRowSelectedLoadsWeather$.subscribe(() => {
      emitted = true;
    });
    actions$.next(weatherActions.recentRowSelected({ key: 'missing' }));
    await vi.advanceTimersByTimeAsync(0);
    expect(emitted).toBe(false);
  });

  it('favoriteSelectedLoadsWeather emits loadCurrentWeather for known favorite', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const fk = 'paris fr';
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [fk]: { cityLabel: fk } },
      },
    });
    const emitted = firstValueFrom(effects.favoriteSelectedLoadsWeather$);
    actions$.next(weatherActions.favoriteSelected({ cityLabel: fk }));
    const action = await emitted;
    expect(action).toEqual(weatherActions.loadCurrentWeather({ q: fk, label: fk }));
  });

  it('favoriteSelectedLoadsWeather ignores unknown favorite', async () => {
    const effects = TestBed.inject(WeatherEffects);
    let emitted = false;
    effects.favoriteSelectedLoadsWeather$.subscribe(() => {
      emitted = true;
    });
    actions$.next(weatherActions.favoriteSelected({ cityLabel: 'missing' }));
    await vi.advanceTimersByTimeAsync(0);
    expect(emitted).toBe(false);
  });

  it('loadCurrentWeather fails fast when q invalid after sanitize', async () => {
    TestBed.inject(WeatherEffects);
    actions$.next(weatherActions.loadCurrentWeather({ q: '..', label: 'x' }));
    await vi.advanceTimersByTimeAsync(0);
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
  });

  it('loadCurrentWeatherSuccess path calls getCurrent', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    weatherApi.getCurrent.mockReturnValue(of(root));
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: 'London', label: 'London, UK' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).toHaveBeenCalled();
    expect(action.type).toBe(weatherActions.loadCurrentWeatherSuccess.type);
  });

  it('loadCurrentWeather serves cache when interval not elapsed', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const row = mockRecentCity({
      key: '51.5,-0.1',
      label: 'London, UK',
      lastUpdate: new Date().toISOString(),
    });
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [row.key]: row },
      },
    });
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: 'London', label: 'London, UK' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherSuccess({
        q: row.key,
        label: row.label,
        root: row.root,
      }),
    );
  });

  it('loadCurrentWeather maps HTTP error to failure', async () => {
    const effects = TestBed.inject(WeatherEffects);
    weatherApi.getCurrent.mockReturnValue(throwError(() => new Error('No matching location')));
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: 'Nowhere', label: 'N' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).toHaveBeenCalled();
    expect(action.type).toBe(weatherActions.loadCurrentWeatherFailure.type);
  });

  it('autocomplete resolves empty list when API errors', async () => {
    const effects = TestBed.inject(WeatherEffects);
    weatherApi.searchLocations.mockReturnValue(throwError(() => new Error('network')));
    const emitted = firstValueFrom(effects.autocomplete$);
    actions$.next(weatherActions.searchInputChanged({ raw: 'Berlin' }));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('Berlin'),
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    const action = await emitted;
    expect(action).toEqual(weatherActions.suggestionsResolved({ list: [], show: false }));
  });

  it('persistRecentAndFavorites taps storage writers', async () => {
    const effects = TestBed.inject(WeatherEffects);
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: {},
        favoritesCities: {},
      },
    });
    const done = firstValueFrom(effects.persistRecentAndFavorites$);
    actions$.next(
      weatherActions.loadCurrentWeatherSuccess({
        q: 'q',
        label: 'L',
        root: mockWeatherRoot(),
      }),
    );
    await done;
    expect(weatherStorage.writeRecentCitiesToStorage).toHaveBeenCalled();
    expect(weatherStorage.writeFavoritesToStorage).toHaveBeenCalled();
  });

  it('persistVisualization invokes storage writer from current store mode', async () => {
    const effects = TestBed.inject(WeatherEffects);
    store.setState({
      weather: { ...initialWeatherState, visualizationMode: 'table' },
    });
    const done = firstValueFrom(effects.persistVisualization$);
    actions$.next(weatherActions.visualizationModeChanged({ mode: 'detailed' }));
    await done;
    expect(weatherStorage.writeVisualizationMode).toHaveBeenCalledWith('table');
  });

  it('loadCurrentWeather passes Spanish lang to API when locale is es', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    weatherApi.getCurrent.mockReturnValue(of(root));
    store.setState({
      weather: { ...initialWeatherState, locale: 'es' },
    });
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: 'London', label: 'London, UK' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).toHaveBeenCalledWith('London', 'es');
    expect(action.type).toBe(weatherActions.loadCurrentWeatherSuccess.type);
  });

  it('refreshRecentOnLocaleChange refetches recent city weather', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    const updated = {
      ...root,
      current: { ...root.current, condition: { ...root.current.condition, text: 'Soleado' } },
    };
    weatherApi.getCurrent.mockReturnValue(of(updated));
    store.setState({
      weather: {
        ...initialWeatherState,
        locale: 'es',
        recentCities: {
          '40,-74': mockRecentCity(),
        },
        selectedKey: '40,-74',
        currentWeather: root,
      },
    });
    const emitted = firstValueFrom(effects.refreshRecentOnLocaleChange$);
    actions$.next(weatherActions.localeChanged({ locale: 'es' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).toHaveBeenCalledWith('40,-74', 'es');
    expect(action).toEqual(
      weatherActions.recentCitiesRootsUpdated({
        updates: [{ key: '40,-74', root: updated }],
      }),
    );
  });

  it('persistLocale writes locale to storage', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const done = firstValueFrom(effects.persistLocale$);
    actions$.next(weatherActions.localeChanged({ locale: 'es' }));
    await done;
    expect(weatherStorage.writeLocaleToStorage).toHaveBeenCalledWith('es');
  });

  it('autocomplete searches stored cities when offline', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    const emitted: Action[] = [];
    const sub = effects.autocomplete$.subscribe((a) => emitted.push(a));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('paris'),
        recentCities: {
          '48.85,2.35': mockRecentCity({
            key: '48.85,2.35',
            label: 'paris, france',
            root,
          }),
        },
      },
    });
    actions$.next(weatherActions.searchInputChanged({ raw: 'paris' }));
    await vi.advanceTimersByTimeAsync(300);
    sub.unsubscribe();
    expect(weatherApi.searchLocations).not.toHaveBeenCalled();
    expect(emitted).toContainEqual(
      weatherActions.suggestionsResolved({ list: expect.any(Array), show: true }),
    );
  });

  it('autocomplete shows offline validation when no stored city matches', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const emitted: Action[] = [];
    const sub = effects.autocomplete$.subscribe((a) => emitted.push(a));
    actions$.next(weatherActions.searchInputChanged({ raw: 'tokyo' }));
    store.setState({
      weather: {
        ...initialWeatherState,
        searchText: sanitizeWeatherSearchInput('tokyo'),
      },
    });
    await vi.advanceTimersByTimeAsync(300);
    sub.unsubscribe();
    expect(emitted).toContainEqual(
      weatherActions.searchValidationFailed({
        message: 'No saved cities match that search. Try a name from your favorites or history.',
      }),
    );
  });

  it('loadCurrentWeather loads cached weather offline when suggestion matches history', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: {
          '48.85,2.35': mockRecentCity({
            key: '48.85,2.35',
            label: 'paris, france',
            root,
          }),
        },
      },
    });
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: '48.85,2.35', label: 'paris, france' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherSuccess({
        q: '48.85,2.35',
        label: 'paris, france',
        root,
      }),
    );
  });

  it('loadCurrentWeather fails with offline message when offline', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const emitted = firstValueFrom(effects.loadCurrentWeather$);
    actions$.next(weatherActions.loadCurrentWeather({ q: 'London', label: 'London, UK' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherFailure({
        userMessage: 'Live weather requires a network connection.',
      }),
    );
  });

  it('recentRowSelected serves cached weather when offline', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const row = mockRecentCity();
    const key = row.key;
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [key]: row },
      },
    });
    const emitted = firstValueFrom(effects.recentRowSelectedLoadsWeather$);
    actions$.next(weatherActions.recentRowSelected({ key }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherSuccess({ q: key, label: row.label, root: row.root }),
    );
  });

  it('favoriteSelected fails offline when no cached history exists', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const fk = 'paris fr';
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [fk]: { cityLabel: fk } },
      },
    });
    const emitted = firstValueFrom(effects.favoriteSelectedLoadsWeather$);
    actions$.next(weatherActions.favoriteSelected({ cityLabel: fk }));
    const action = await emitted;
    expect(action).toEqual(
      weatherActions.loadCurrentWeatherFailure({
        userMessage: 'Live weather requires a network connection.',
      }),
    );
  });

  it('refreshRecentOnLocaleChange skips API when offline', async () => {
    isOnline.set(false);
    const effects = TestBed.inject(WeatherEffects);
    const root = mockWeatherRoot();
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: {
          '40,-74': mockRecentCity(),
        },
      },
    });
    const emitted = firstValueFrom(effects.refreshRecentOnLocaleChange$);
    actions$.next(weatherActions.localeChanged({ locale: 'es' }));
    const action = await emitted;
    expect(weatherApi.getCurrent).not.toHaveBeenCalled();
    expect(action).toEqual(weatherActions.recentCitiesRootsUpdated({ updates: [] }));
  });

  it('persistWeatherUpdateInterval writes interval to storage', async () => {
    const effects = TestBed.inject(WeatherEffects);
    const done = firstValueFrom(effects.persistWeatherUpdateInterval$);
    actions$.next(weatherActions.weatherUpdateIntervalChanged({ intervalMs: 600_000 }));
    await done;
    expect(weatherStorage.writeWeatherUpdateIntervalToStorage).toHaveBeenCalledWith(600_000);
  });
});
