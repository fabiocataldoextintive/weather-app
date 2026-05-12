import { createActionGroup, emptyProps, props } from '@ngrx/store';

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

    hydrateFromLocalStorage: props<{
      recentCities: RecentCitiesMap;
      favoritesCities: FavoriteCitiesMap;
      visualizationMode: VisualizationMode;
    }>(),
  },
});
