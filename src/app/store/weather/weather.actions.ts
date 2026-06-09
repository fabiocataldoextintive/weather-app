import { createActionGroup, emptyProps, props } from '@ngrx/store';

import type { AppLocale } from '../../i18n/app-locale';
import type { Root } from '../../models/root.interface';
import type { SearchLocation } from '../../models/search-location.interface';
import type { FavoriteCitiesMap, RecentCitiesMap, VisualizationMode } from './weather.state';

export const weatherActions = createActionGroup({
  source: 'Weather',
  events: {
    searchInputChanged: props<{ raw: string }>(),
    suggestionsResolved: props<{ list: SearchLocation[]; show: boolean }>(),

    suggestionPicked: props<{ q: string; label: string }>(),
    searchValidationFailed: props<{ message: string }>(),
    clearSearchValidation: emptyProps(),

    dismissSuggestions: emptyProps(),

    loadCurrentWeather: props<{ q: string; label: string }>(),
    loadCurrentWeatherSuccess: props<{ q: string; label: string; root: Root }>(),
    loadCurrentWeatherFailure: props<{ userMessage: string }>(),

    recentRowSelected: props<{ key: string }>(),
    visualizationModeChanged: props<{ mode: VisualizationMode }>(),
    favoriteCityToggled: props<{ cityLabel: string }>(),
    favoriteSelected: props<{ cityLabel: string }>(),

    localeChanged: props<{ locale: AppLocale }>(),
    recentCitiesRootsUpdated: props<{ updates: { key: string; root: Root }[] }>(),

    hydrateFromLocalStorage: props<{
      recentCities: RecentCitiesMap;
      favoritesCities: FavoriteCitiesMap;
      visualizationMode: VisualizationMode;
      locale: AppLocale;
    }>(),
  },
});
