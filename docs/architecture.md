# Architecture

## Pattern

Feature-oriented Angular SPA with **NgRx** for shared weather state. UI components are thin: they read store signals and dispatch actions. Side effects (HTTP, debounce, persistence) live in `WeatherEffects`.

```
┌─────────────────────────────────────────────────────────┐
│  App (app.ts)                                           │
│    └── WeatherDashboardComponent                        │
│          ├── search + view toggle                       │
│          ├── WeatherResultsTableComponent (table mode)  │
│          └── WeatherDetailPanelComponent (detail mode)  │
│                └── CurrentWeatherCardComponent          │
└─────────────────────────────────────────────────────────┘
                          │ dispatch / select
                          ▼
┌─────────────────────────────────────────────────────────┐
│  NgRx — weatherFeature                                  │
│    state · reducer · selectors · effects                │
└─────────────────────────────────────────────────────────┘
          │ HTTP                              │ localStorage
          ▼                                   ▼
   WeatherService                      weather.storage.ts
          │
          ▼
   WeatherAPI (search.json, current.json)
```

## Bootstrap (`app.config.ts`)

Providers registered at startup:

- `provideStore()` + `provideState(weatherFeature)` + `provideEffects(WeatherEffects)`
- `provideStoreDevtools` (dev only, `maxAge: 60`)
- `provideAppInitializer` — hydrates recent cities, favorites, and visualization mode from `localStorage`
- `provideRouter(routes)` — routes array is empty; dashboard is mounted in root template
- `provideHttpClient()`

## State Shape (`WeatherState`)

| Slice | Description |
|-------|-------------|
| `searchText` | Sanitized search input |
| `suggestions` / `showSuggestions` | Autocomplete results and visibility |
| `searchValidationMessage` | Inline validation error for search |
| `currentStatus` | `idle` \| `loading` \| `success` \| `error` |
| `currentWeather` | Latest `Root` response from API |
| `currentError` | User-facing error message |
| `selectedKey` | Query key (`lat,lon`) of active result |
| `activeLocationLabel` | Display label for current selection |
| `recentCities` | Map of past searches with cached weather |
| `favoritesCities` | Map of favorited city labels |
| `visualizationMode` | `table` \| `detailed` |

Default visualization mode: **`detailed`**.

## Data Flow

### Search autocomplete

1. User types → `searchInputChanged` (input sanitized in reducer)
2. Effect `autocomplete$` debounces 300 ms, validates min length (2 letters/digits)
3. `WeatherService.searchLocations` → `suggestionsResolved`
4. Dashboard renders suggestion list; Enter picks first item; Escape dismisses

### Load weather

1. Pick suggestion → `suggestionPicked` → effect maps to `loadCurrentWeather`
2. Effect validates query, calls `WeatherService.getCurrent`
3. Success → updates `currentWeather`, upserts `recentCities`, sets `selectedKey`
4. Failure → `toWeatherUserMessage` maps API errors to i18n strings

### Table row click

1. `recentRowSelected` restores cached `Root` from `recentCities`
2. Switches `visualizationMode` to `detailed`

### Persistence

| Key | Storage key | Written on |
|-----|-------------|------------|
| Recent cities | `recent-cities` | weather load success, favorite toggle |
| Favorites | `favorite-cities` | same |
| View mode | `visualization-mode` | `visualizationModeChanged` |

Serialization/parsing logic and legacy format support live in `weather.storage.ts`.

## Layer Responsibilities

| Layer | Path | Role |
|-------|------|------|
| Pages | `src/app/pages/` | Route-level UI, composes feature components |
| Components | `src/app/components/` | Reusable presentational widgets |
| Store | `src/app/store/weather/` | Actions, reducer, effects, storage, user messages |
| Services | `src/app/services/weather/` | HTTP adapter to WeatherAPI |
| Models | `src/app/models/` | TypeScript interfaces matching API shapes |
| Helpers | `src/app/helpers/` | Pure utilities (sanitize, clean text) |

## API Integration

`WeatherService` builds URLs from `environment.baseUrl` and injects `import.meta.env.NG_APP_WEATHER_API_KEY`. Errors from `HttpErrorResponse` are normalized to `Error` with a `Weather API request failed:` prefix for downstream mapping.

## i18n

- Source locale: English (`en`)
- Spanish build: `development-es` configuration localizes to `es` using `src/locale/messages.es.xlf`
- User-facing strings use `$localize` or `i18n` attributes in templates
- Error messages centralized in `weather-user-message.ts` and effect inline messages

## Testing Architecture

- **Runner:** Vitest with jsdom
- **Pattern:** `*.spec.ts` co-located with source
- **Coverage:** store (reducer, effects, storage), services, helpers, components
- **Setup:** `src/test-setup.ts` configures Angular testing environment

## Known Legacy Artifacts

Older flat component files under `weather-dashboard/` (e.g. `weather-detail-panel.component.ts` at page root) and typo folder `weather-resultas-table/` exist alongside the canonical subfolders. Active imports use:

- `weather-dashboard/weather-detail-panel/`
- `weather-dashboard/weather-results-table/`
