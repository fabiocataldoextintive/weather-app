import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { Subject } from 'rxjs';

import { sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import { WeatherService } from '../../services/weather/weather.service';
import type { SearchLocation } from '../../models/search-location.interface';
import { weatherActions } from './weather.actions';
import { WeatherEffects } from './weather.effects';
import { mockWeatherRoot } from './weather-test-fixtures';
import { initialWeatherState } from './weather.state';
import * as weatherStorage from './weather.storage';

describe('WeatherEffects', () => {
  let actions$: Subject<Action>;
  let weatherApi: { searchLocations: ReturnType<typeof vi.fn>; getCurrent: ReturnType<typeof vi.fn> };
  let store: MockStore;

  beforeEach(() => {
    vi.useFakeTimers();
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
      ],
    });
    store = TestBed.inject(MockStore);
    vi.spyOn(weatherStorage, 'writeRecentCitiesToStorage').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeFavoritesToStorage').mockImplementation(() => {});
    vi.spyOn(weatherStorage, 'writeVisualizationMode').mockImplementation(() => {});
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
    const root = mockWeatherRoot();
    const key = '40,-74';
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: {
          [key]: { key, label: 'NYC', root, updatedAt: 1 },
        },
      },
    });
    const emitted = firstValueFrom(effects.recentRowSelectedLoadsWeather$);
    actions$.next(weatherActions.recentRowSelected({ key }));
    const action = await emitted;
    expect(action).toEqual(weatherActions.loadCurrentWeather({ q: key, label: 'NYC' }));
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
});
