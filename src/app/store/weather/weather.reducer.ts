import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { sanitizeWeatherSearchInput } from '../../helpers/weather-search-query';
import { createLastUpdateTimestamp } from '../../helpers/weather-refresh';
import { locationDisplayLabel } from '../../helpers/location-display-label';
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
  const lastUpdate = createLastUpdateTimestamp(now);
  return {
    ...state.recentCities,
    [key]: { key, label, root, updatedAt: now, lastUpdate },
  };
}

function syncFavoriteLastUpdate(
  favorites: WeatherState['favoritesCities'],
  cityLabel: string,
  lastUpdate: string,
): WeatherState['favoritesCities'] {
  const fk = favoriteCityKey(cityLabel);
  const fav = favorites[fk];
  if (!fav) return favorites;
  return { ...favorites, [fk]: { ...fav, lastUpdate } };
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
  on(weatherActions.loadCurrentWeatherSuccess, (state, { q, label, root }) => {
    const displayLabel = locationDisplayLabel(
      root.location.name,
      root.location.region,
      root.location.country,
    );
    const recentCities = upsertRecentMap(state, q, displayLabel, root);
    const row = recentCities[q];
    const lastUpdate = row?.lastUpdate ?? createLastUpdateTimestamp();
    return {
      ...state,
      currentStatus: 'success',
      currentWeather: root,
      currentError: null,
      selectedKey: q,
      activeLocationLabel: displayLabel,
      searchText: displayLabel,
      recentCities,
      favoritesCities: syncFavoriteLastUpdate(state.favoritesCities, displayLabel, lastUpdate),
    };
  }),
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
      const cached = Object.values(state.recentCities).find(
        (row) => row.label === cityLabel || favoriteCityKey(row.label) === fk,
      );
      next[fk] = { cityLabel: fk, lastUpdate: cached?.lastUpdate };
    }
    return { ...state, favoritesCities: next };
  }),
  on(weatherActions.weatherUpdateIntervalChanged, (state, { intervalMs }) => ({
    ...state,
    weatherUpdateTimeInterval: intervalMs,
  })),
  on(weatherActions.localeChanged, (state, { locale }) => ({
    ...state,
    locale,
    searchValidationMessage: null,
    currentError: null,
  })),
  on(weatherActions.recentCitiesRootsUpdated, (state, { updates }) => {
    if (updates.length === 0) return state;
    let recentCities = state.recentCities;
    for (const { key, root } of updates) {
      const row = recentCities[key];
      if (!row) continue;
      recentCities = { ...recentCities, [key]: { ...row, root } };
    }
    const selected = state.selectedKey ? recentCities[state.selectedKey] : undefined;
    return {
      ...state,
      recentCities,
      currentWeather: selected?.root ?? state.currentWeather,
    };
  }),
  on(weatherActions.hydrateFromLocalStorage, (state, { recentCities, favoritesCities, visualizationMode, locale, weatherUpdateTimeInterval }) => ({
    ...state,
    recentCities,
    favoritesCities,
    visualizationMode,
    locale,
    weatherUpdateTimeInterval,
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
