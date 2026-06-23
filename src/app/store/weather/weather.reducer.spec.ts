import type { SearchLocation } from '../../models/search-location.interface';
import { mockWeatherRoot } from './weather-test-fixtures';
import { weatherActions } from './weather.actions';
import { weatherFeature } from './weather.reducer';
import { favoriteCityKey, initialWeatherState } from './weather.state';

describe('weather reducer', () => {
  const reduce = weatherFeature.reducer;

  it('searchInputChanged sanitizes text and clears validation', () => {
    const next = reduce(initialWeatherState, weatherActions.searchInputChanged({ raw: '  Hi  ' }));
    expect(next.searchText).toBe('Hi');
    expect(next.searchValidationMessage).toBeNull();
  });

  it('suggestionsResolved updates list and flag', () => {
    const next = reduce(
      initialWeatherState,
      weatherActions.suggestionsResolved({ list: [] as SearchLocation[], show: true }),
    );
    expect(next.showSuggestions).toBe(true);
  });

  it('dismissSuggestions clears suggestions', () => {
    const s = reduce(
      {
        ...initialWeatherState,
        suggestions: [] as SearchLocation[],
        showSuggestions: true,
      },
      weatherActions.dismissSuggestions(),
    );
    expect(s.suggestions).toEqual([]);
    expect(s.showSuggestions).toBe(false);
  });

  it('suggestionPicked sets label and closes suggestions', () => {
    const next = reduce(
      {
        ...initialWeatherState,
        suggestions: [] as SearchLocation[],
        showSuggestions: true,
      },
      weatherActions.suggestionPicked({ q: 'x', label: 'City' }),
    );
    expect(next.searchText).toBe('City');
    expect(next.showSuggestions).toBe(false);
  });

  it('searchValidationFailed / clearSearchValidation', () => {
    let s = reduce(initialWeatherState, weatherActions.searchValidationFailed({ message: 'bad' }));
    expect(s.searchValidationMessage).toBe('bad');
    s = reduce(s, weatherActions.clearSearchValidation());
    expect(s.searchValidationMessage).toBeNull();
  });

  it('loadCurrentWeather sets loading', () => {
    const next = reduce(initialWeatherState, weatherActions.loadCurrentWeather({ q: 'q', label: 'l' }));
    expect(next.currentStatus).toBe('loading');
    expect(next.currentWeather).toBeNull();
  });

  it('loadCurrentWeatherSuccess updates weather and recent', () => {
    const root = mockWeatherRoot();
    const next = reduce(
      initialWeatherState,
      weatherActions.loadCurrentWeatherSuccess({ q: '40,-74', label: 'NYC', root }),
    );
    expect(next.currentStatus).toBe('success');
    expect(next.selectedKey).toBe('40,-74');
    expect(next.searchText).toBe('Test City, TC');
    expect(next.activeLocationLabel).toBe('Test City, TC');
    expect(next.recentCities['40,-74']?.label).toBe('Test City, TC');
    expect(next.recentCities['40,-74']?.lastUpdate).toBeTruthy();
  });

  it('loadCurrentWeatherSuccess includes region in display label', () => {
    const root = mockWeatherRoot({ location: { region: 'Cordoba' } });
    const next = reduce(
      initialWeatherState,
      weatherActions.loadCurrentWeatherSuccess({ q: '40,-74', label: 'x', root }),
    );
    expect(next.searchText).toBe('Test City, Cordoba, TC');
  });

  it('loadCurrentWeatherFailure sets error', () => {
    const next = reduce(
      initialWeatherState,
      weatherActions.loadCurrentWeatherFailure({ userMessage: 'oops' }),
    );
    expect(next.currentStatus).toBe('error');
    expect(next.currentError).toBe('oops');
  });

  it('recentRowSelected ignores unknown key', () => {
    const next = reduce(initialWeatherState, weatherActions.recentRowSelected({ key: 'missing' }));
    expect(next).toBe(initialWeatherState);
  });

  it('recentRowSelected switches to detailed view for known key', () => {
    const root = mockWeatherRoot();
    const key = 'k1';
    const base = reduce(
      initialWeatherState,
      weatherActions.loadCurrentWeatherSuccess({ q: key, label: 'L', root }),
    );
    const next = reduce(
      { ...base, visualizationMode: 'table' },
      weatherActions.recentRowSelected({ key }),
    );
    expect(next.visualizationMode).toBe('detailed');
    expect(next.currentWeather).toEqual(root);
  });

  it('visualizationModeChanged updates mode', () => {
    const next = reduce(initialWeatherState, weatherActions.visualizationModeChanged({ mode: 'table' }));
    expect(next.visualizationMode).toBe('table');
  });

  it('favoriteCityToggled adds and removes', () => {
    const label = 'Boston';
    const fk = favoriteCityKey(label);
    let s = reduce(initialWeatherState, weatherActions.favoriteCityToggled({ cityLabel: label }));
    expect(s.favoritesCities[fk]).toEqual({ cityLabel: fk });
    s = reduce(s, weatherActions.favoriteCityToggled({ cityLabel: label }));
    expect(s.favoritesCities[fk]).toBeUndefined();
  });

  it('favoriteCityToggled noop when key empty', () => {
    const next = reduce(initialWeatherState, weatherActions.favoriteCityToggled({ cityLabel: '   ' }));
    expect(next.favoritesCities).toEqual({});
  });

  it('favoriteSelected switches to detailed when favorite exists', () => {
    const label = 'Paris';
    const fk = favoriteCityKey(label);
    const state = {
      ...initialWeatherState,
      visualizationMode: 'table' as const,
      favoritesCities: { [fk]: { cityLabel: fk } },
    };
    const next = reduce(state, weatherActions.favoriteSelected({ cityLabel: label }));
    expect(next.visualizationMode).toBe('detailed');
  });

  it('favoriteSelected noop when favorite missing', () => {
    const next = reduce(
      initialWeatherState,
      weatherActions.favoriteSelected({ cityLabel: 'Unknown' }),
    );
    expect(next).toBe(initialWeatherState);
  });

  it('weatherUpdateIntervalChanged updates interval', () => {
    const next = reduce(
      initialWeatherState,
      weatherActions.weatherUpdateIntervalChanged({ intervalMs: 600_000 }),
    );
    expect(next.weatherUpdateTimeInterval).toBe(600_000);
  });

  it('loadCurrentWeatherSuccess syncs favorite lastUpdate', () => {
    const root = mockWeatherRoot();
    const fk = favoriteCityKey('Test City, TC');
    const state = {
      ...initialWeatherState,
      favoritesCities: { [fk]: { cityLabel: fk } },
    };
    const next = reduce(
      state,
      weatherActions.loadCurrentWeatherSuccess({ q: '40,-74', label: 'NYC', root }),
    );
    expect(next.favoritesCities[fk]?.lastUpdate).toBe(next.recentCities['40,-74']?.lastUpdate);
  });

  it('hydrateFromLocalStorage merges persisted slices', () => {
    const recent = {} as typeof initialWeatherState.recentCities;
    const favorites = {} as typeof initialWeatherState.favoritesCities;
    const next = reduce(
      initialWeatherState,
      weatherActions.hydrateFromLocalStorage({
        recentCities: recent,
        favoritesCities: favorites,
        visualizationMode: 'table',
        locale: 'es',
        weatherUpdateTimeInterval: 900_000,
      }),
    );
    expect(next.visualizationMode).toBe('table');
    expect(next.locale).toBe('es');
    expect(next.weatherUpdateTimeInterval).toBe(900_000);
    expect(next.recentCities).toBe(recent);
  });

  it('localeChanged updates locale and clears stale messages', () => {
    const base = {
      ...initialWeatherState,
      locale: 'en' as const,
      searchValidationMessage: 'bad',
      currentError: 'oops',
    };
    const next = reduce(base, weatherActions.localeChanged({ locale: 'es' }));
    expect(next.locale).toBe('es');
    expect(next.searchValidationMessage).toBeNull();
    expect(next.currentError).toBeNull();
  });

  it('recentCitiesRootsUpdated refreshes stored weather rows', () => {
    const root = mockWeatherRoot();
    const updated = { ...root, current: { ...root.current, condition: { ...root.current.condition, text: 'Nublado' } } };
    const base = reduce(
      initialWeatherState,
      weatherActions.loadCurrentWeatherSuccess({ q: '40,-74', label: 'NYC', root }),
    );
    const next = reduce(
      base,
      weatherActions.recentCitiesRootsUpdated({ updates: [{ key: '40,-74', root: updated }] }),
    );
    expect(next.recentCities['40,-74']?.root.current.condition.text).toBe('Nublado');
    expect(next.currentWeather?.current.condition.text).toBe('Nublado');
  });
});
