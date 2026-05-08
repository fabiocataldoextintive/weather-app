import { mockWeatherRoot } from './weather-test-fixtures';
import { weatherActions } from './weather.actions';

describe('weatherActions', () => {
  it('creates searchInputChanged', () => {
    const a = weatherActions.searchInputChanged({ raw: 'Paris' });
    expect(a.type).toContain('Weather');
    expect(a.raw).toBe('Paris');
  });

  it('creates suggestionsResolved', () => {
    const a = weatherActions.suggestionsResolved({
      list: [],
      show: false,
    });
    expect(a.list).toEqual([]);
    expect(a.show).toBe(false);
  });

  it('creates suggestionPicked', () => {
    const a = weatherActions.suggestionPicked({ q: '1,2', label: 'X' });
    expect(a.q).toBe('1,2');
    expect(a.label).toBe('X');
  });

  it('creates loadCurrentWeather / success / failure', () => {
    expect(weatherActions.loadCurrentWeather({ q: 'q', label: 'l' }).q).toBe('q');
    const root = mockWeatherRoot();
    expect(
      weatherActions.loadCurrentWeatherSuccess({
        q: 'q',
        label: 'l',
        root,
      }).root,
    ).toEqual(root);
    expect(
      weatherActions.loadCurrentWeatherFailure({ userMessage: 'e' }).userMessage,
    ).toBe('e');
  });

  it('creates dismiss and validation actions', () => {
    expect(weatherActions.dismissSuggestions().type).toContain('Weather');
    expect(weatherActions.searchValidationFailed({ message: 'm' }).message).toBe('m');
    expect(weatherActions.clearSearchValidation().type).toContain('Weather');
  });

  it('creates recentRowSelected and visualizationModeChanged', () => {
    expect(weatherActions.recentRowSelected({ key: 'k' }).key).toBe('k');
    expect(weatherActions.visualizationModeChanged({ mode: 'table' }).mode).toBe('table');
  });

  it('creates favoriteCityToggled and hydrateFromLocalStorage', () => {
    expect(weatherActions.favoriteCityToggled({ cityLabel: 'x' }).cityLabel).toBe('x');
    const h = weatherActions.hydrateFromLocalStorage({
      recentCities: {},
      favoritesCities: {},
      visualizationMode: 'detailed',
    });
    expect(h.visualizationMode).toBe('detailed');
  });
});
