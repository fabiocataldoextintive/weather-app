import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import type { Root } from '../../models/root.interface';
import { weatherActions } from './weather.actions';
import {
  favoriteCityKey,
  favoritesCitiesOrdered,
  initialWeatherState,
  type RecentCitiesMap,
  type WeatherState,
} from './weather.state';

function upsertRecentMap(state: WeatherState, key: string, label: string, root: Root): RecentCitiesMap {
  const now = Date.now();
  return {
    ...state.recentCities,
    [key]: { key, label, root, updatedAt: now },
  };
}

const weatherReducer = createReducer(
  initialWeatherState,
  on(weatherActions.searchInputChanged, (state, { raw }) => ({
    ...state,
    searchText: sanitizeWeatherSearchInput(raw),
    searchValidationMessage: null,
  })),
  on(weatherActions.suggestionsResolved, (state, { list, show }) => ({
    ...state,
    suggestions: list,
    showSuggestions: show,
  })),
  on(weatherActions.dismissSuggestions, (state) => ({
    ...state,
    suggestions: [],
    showSuggestions: false,
  })),
  on(weatherActions.suggestionPicked, (state, { label }) => ({
    ...state,
    searchText: label,
    suggestions: [],
    showSuggestions: false,
  })),
  on(weatherActions.searchValidationFailed, (state, { message }) => ({
    ...state,
    searchValidationMessage: message,
  })),
  on(weatherActions.clearSearchValidation, (state) => ({
    ...state,
    searchValidationMessage: null,
  })),
  on(weatherActions.loadCurrentWeather, (state) => ({
    ...state,
    currentStatus: 'loading',
    currentWeather: null,
    currentError: null,
    activeLocationLabel: null,
  })),
  on(weatherActions.loadCurrentWeatherSuccess, (state, { q, label, root }) => ({
    ...state,
    currentStatus: 'success',
    currentWeather: root,
    currentError: null,
    selectedKey: q,
    activeLocationLabel: label,
    recentCities: upsertRecentMap(state, q, label, root),
  })),
  on(weatherActions.loadCurrentWeatherFailure, (state, { userMessage }) => ({
    ...state,
    currentStatus: 'error',
    currentWeather: null,
    currentError: userMessage,
    activeLocationLabel: null,
  })),
  on(weatherActions.recentRowSelected, (state, { key }) => {
    if (!state.recentCities[key]) return state;
    return {
      ...state,
      visualizationMode: 'detailed',
    };
  }),
  on(weatherActions.favoriteSelected, (state, { cityLabel }) => {
    const fk = favoriteCityKey(cityLabel);
    if (!state.favoritesCities[fk]) return state;
    return {
      ...state,
      visualizationMode: 'detailed',
    };
  }),
  on(weatherActions.visualizationModeChanged, (state, { mode }) => ({
    ...state,
    visualizationMode: mode,
  })),
  on(weatherActions.favoriteCityToggled, (state, { cityLabel }) => {
    const fk = favoriteCityKey(cityLabel);
    if (!fk) return state;
    const next = { ...state.favoritesCities };
    if (next[fk]) {
      delete next[fk];
    } else {
      next[fk] = { cityLabel: fk };
    }
    return { ...state, favoritesCities: next };
  }),
  on(weatherActions.hydrateFromLocalStorage, (state, { recentCities, favoritesCities, visualizationMode }) => ({
    ...state,
    recentCities,
    favoritesCities,
    visualizationMode,
  })),
);

export const weatherFeature = createFeature({
  name: 'weather',
  reducer: weatherReducer,
  extraSelectors: ({ selectRecentCities, selectFavoritesCities }) => {
    const selectRecentCitiesOrdered = createSelector(selectRecentCities, (m) =>
      Object.values(m).sort((a, b) => b.updatedAt - a.updatedAt),
    );
    const selectRecentCitiesCount = createSelector(selectRecentCities, (m) => Object.keys(m).length);
    const selectFavoritesCitiesOrdered = createSelector(selectFavoritesCities, favoritesCitiesOrdered);
    const selectFavoritesCitiesCount = createSelector(selectFavoritesCities, (m) => Object.keys(m).length);
    return {
      selectRecentCitiesOrdered,
      selectRecentCitiesCount,
      selectFavoritesCitiesOrdered,
      selectFavoritesCitiesCount,
    };
  },
});
