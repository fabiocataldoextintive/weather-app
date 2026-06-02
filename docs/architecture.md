# WeatherApp — Architecture

## Pattern

**Feature-sliced SPA** with a thin shell, one dashboard feature, shared presentational components, and a dedicated **weather NgRx feature** for all cross-cutting search/weather state.

```
┌─────────────────────────────────────────────────────────┐
│  App (bootstrap)                                         │
│    └── WeatherDashboardComponent (search + view toggle)   │
│          ├── WeatherResultsTableComponent  (table mode)  │
│          └── WeatherDetailPanelComponent   (detail mode) │
│                └── CurrentWeatherCardComponent           │
└─────────────────────────────────────────────────────────┘
         │ dispatch/select                    │
         ▼                                      ▼
┌──────────────────┐    HTTP     ┌─────────────────────┐
│  weather feature │ ◄──────────► │  WeatherService     │
│  (store/effects) │              │  (WeatherAPI)       │
└────────┬─────────┘              └─────────────────────┘
         │ read/write
         ▼
   localStorage (recent, favorites, visualization mode)
```

## Bootstrap (`app.config.ts`)

1. `provideStore()` + `provideState(weatherFeature)` + `provideEffects(WeatherEffects)`
2. `provideStoreDevtools` when `isDevMode()`
3. `provideAppInitializer` — hydrates store from `localStorage` via `weatherActions.hydrateFromLocalStorage`
4. `provideRouter(routes)` — routes array is empty (no lazy features yet)
5. `provideHttpClient()` for API calls

## State management (NgRx)

**Feature key:** `weather` (`weatherFeature` in `weather.reducer.ts`)

| Slice | Role |
|-------|------|
| `searchText`, `suggestions`, `showSuggestions` | Autocomplete UX |
| `searchValidationMessage` | Client-side validation feedback |
| `currentStatus`, `currentWeather`, `currentError` | Active weather load |
| `selectedKey`, `activeLocationLabel` | Selection / display label |
| `recentCities` | Map keyed by query (`lat,lon`) |
| `favoritesCities` | Map keyed by normalized city label |
| `visualizationMode` | `'table'` \| `'detailed'` |

**Effects (`weather.effects.ts`):**

- `autocomplete$` — debounce 300ms on `searchInputChanged`; calls `searchLocations` when query ≥ 2 letters/digits
- `pickSuggestionLoadsWeather$` — maps `suggestionPicked` → `loadCurrentWeather`
- `recentRowSelectedLoadsWeather$` — maps `recentRowSelected` → `loadCurrentWeather` (fresh API call for history re-run)
- `loadCurrentWeather$` — sanitizes query, calls `getCurrent`, maps errors via `toWeatherUserMessage`
- `persistRecentAndFavorites$` — writes storage after successful load or favorite toggle (no dispatch)
- `persistVisualization$` — writes visualization mode on change (no dispatch)

**Selectors:** `createFeature` defaults plus `selectRecentCitiesOrdered`, `selectRecentCitiesCount`.

## Data flow (happy path)

1. User types in search → `searchInputChanged` → reducer sanitizes text → effect fetches suggestions.
2. User picks suggestion (click or Enter on first) → `suggestionPicked` → `loadCurrentWeather` with `q = "lat,lon"` and display `label`.
3. Success → `loadCurrentWeatherSuccess` → updates `currentWeather`, upserts `recentCities`, sets `selectedKey` → effect persists to `localStorage`.
4. Table mode: user selects row → `recentRowSelected` → effect dispatches `loadCurrentWeather` → fresh weather fetch → switches to detail view on success.
5. Detail mode: `CurrentWeatherCardComponent` can toggle favorite → `favoriteCityToggled` → persisted favorites map.

## Persistence (`weather.storage.ts`)

| Key | Content |
|-----|---------|
| `recent-cities` | JSON `{ recentCities: { [key]: { city, weather, updatedAt } } }` (legacy array shapes supported on read) |
| `favorite-cities` | JSON `{ favoritesCities: { [key]: { cityLabel } } }` |
| `visualization-mode` | `'table'` or `'detailed'` (legacy `'detail'` normalized to `'detailed'`) |

Parse/write helpers guard `localStorage` absence (tests, SSR-safe checks).

## API layer (`WeatherService`)

- Injectable `providedIn: 'root'`
- API key: `import.meta.env.NG_APP_WEATHER_API_KEY`
- Errors normalized to `Error` with `Weather API request failed: …` prefix for user messaging

## Models

Typed interfaces under `src/app/models/` mirror WeatherAPI shapes used in the app (`Root`, `Location`, `Current`, `Condition`, `SearchLocation`, `AirQuality`, etc.).

## Testing architecture

- Unit tests colocated as `*.spec.ts` beside sources
- Vitest config at repo root; `src/test-setup.ts` for Angular test bed
- Store/effects/services covered with mocks and fixtures (`weather-test-fixtures.ts`)

## Known structural notes

Active dashboard imports live under:

- `pages/weather-dashboard/weather-results-table/`
- `pages/weather-dashboard/weather-detail-panel/`

Older duplicate component files still exist at the `weather-dashboard/` root and under `weather-resultas-table/` (typo); they are **not** wired by `WeatherDashboardComponent` and should be removed in a future cleanup PR.
