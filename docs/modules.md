# WeatherApp — Modules & Features

## App shell

| Path | Responsibility |
|------|----------------|
| `src/app/app.ts` | Root component; renders `WeatherDashboardComponent` |
| `src/app/app.config.ts` | Providers: store, weather feature, effects, router, HTTP, hydration |
| `src/app/app.routes.ts` | Empty route table (placeholder) |
| `src/main.ts` | Bootstrap entry |

## Feature: Weather dashboard

**Component:** `pages/weather-dashboard/weather-dashboard.component.ts`

- Search input bound to store (`searchText`) via `FormsModule`
- Autocomplete list from `suggestions` / `showSuggestions`
- On suggestion pick, `searchText` uses API capitalization from `loc.name`, `loc.region`, `loc.country` via `locationDisplayLabel` (INT-32, INT-33)
- Keyboard: `Escape` dismisses suggestions; `Enter` picks first suggestion
- Empty autocomplete (`search.json` returns `[]` for valid query) → `searchValidationFailed` with `err.noCitySuggestions` (shown under search input)
- View toggle: table vs detailed (`visualizationModeChanged`)
- **Language selector** (header, top-right): English / Spanish segmented control → `localeChanged`; persists to `localStorage` key `app-locale`
- **Refresh interval selector** (below city search): prefix label `dashboard.refreshEvery` (**Refresh every** / **Actualizar cada**) left of 5 / 10 / 15 / 30 min buttons → `weatherUpdateIntervalChanged`; persists to `weather-update-interval`; option labels via `I18nPipe` (`interval.5min` … `interval.30min`)
- **Offline banner** when `ConnectivityService.isOnline()` is false (`err.offlineBanner`)
- Loading and error banners driven by `currentStatus` / `currentError`
- Embeds **`WeatherFavoritesListComponent`** (always visible below search)

**Child — favorites list** (`weather-favorites-list/`)

- Lists `selectFavoritesCitiesOrdered` (alphabetical by normalized label)
- Row click → `favoriteSelected` → effect re-fetches current weather via API → switches to detail view
- Remove (×) → `favoriteCityToggled` → removed from store and `localStorage`
- Empty state when no favorites; active row highlighted when `activeLocationLabel` matches

**Child — results table** (`weather-results-table/`)

- Lists `selectRecentCitiesOrdered` with client-side pagination (`RECENT_CITIES_PAGE_SIZE = 25`)
- Row click → `recentRowSelected` → effect re-fetches current weather via API
- Shows count via `selectRecentCitiesCount`
- Prev/Next controls when history exceeds one page

**Child — detail panel** (`weather-detail-panel/`)

- Reads `currentWeather`, `activeLocationLabel`, loading/error/validation state
- Embeds `CurrentWeatherCardComponent` when data present

## Shared UI

### `CurrentWeatherCardComponent`

**Path:** `components/current-weather-card/`

- **Inputs:** `root` (required `Root`), `favoriteLabel` (optional)
- Displays location title, condition icon (protocol-relative icons prefixed with `https:`), temperature, and favorite toggle
- Favorite state from `selectFavoritesCities` + `favoriteCityKey(label)`
- Dispatches `favoriteCityToggled`

## Services

### `WeatherService`

**Path:** `services/weather/weather.service.ts`

| Method | API | Notes |
|--------|-----|-------|
| `searchLocations(q)` | `/search.json` | Trims query; errors → observable error |
| `getCurrent(q, lang?)` | `/current.json` | Optional `lang` query param |

### `ConnectivityService`

**Path:** `services/connectivity/connectivity.service.ts`

- Signal `isOnline` — mirrors `navigator.onLine`, updates on `online` / `offline` window events
- Used by effects to gate WeatherAPI calls and by dashboard for offline banner

## Store module (`store/weather/`)

| File | Role |
|------|------|
| `weather.state.ts` | State interface, `initialWeatherState`, `MIN_SEARCH_QUERY_LEN`, `RECENT_CITIES_PAGE_SIZE`, `favoriteCityKey`, `recentCitiesOrdered`; `RecentCity.lastUpdate`, `FavoriteCity.lastUpdate?` |
| `weather-update-interval.ts` | Allowed intervals, option model, `normalizeWeatherUpdateInterval` |
| `weather.actions.ts` | `createActionGroup` — search, load, favorites, hydration, `weatherUpdateIntervalChanged` |
| `weather.reducer.ts` | Pure transitions + `weatherFeature`; `loadCurrentWeatherSuccess` sets `searchText` / `activeLocationLabel` from `root.location` name+region+country (INT-32, INT-33) |
| `weather.effects.ts` | Side effects: API, debounce, persistence |
| `weather.storage.ts` | `localStorage` serialization with backward-compatible parsers |
| `weather-user-message.ts` | Maps API/HTTP errors to localized user strings |
| `weather-test-fixtures.ts` | Shared test data |

### Action reference (summary)

- **Search:** `searchInputChanged`, `suggestionsResolved`, `dismissSuggestions`, `suggestionPicked`, `searchValidationFailed`, `clearSearchValidation`
- **Weather load:** `loadCurrentWeather`, `loadCurrentWeatherSuccess`, `loadCurrentWeatherFailure`
- **UX:** `recentRowSelected`, `favoriteSelected`, `visualizationModeChanged`, `favoriteCityToggled`, `localeChanged`, `weatherUpdateIntervalChanged`
- **Init:** `hydrateFromLocalStorage`

## Helpers

| File | Purpose |
|------|---------|
| `helpers/location-display-label.ts` | `locationDisplayLabel(name, region, country)` for search/history UI labels |
| `helpers/weather-search-query.ts` | `sanitizeWeatherSearchInput`, `countLettersAndDigits` (min length 2 for API) |
| `helpers/weather-refresh.ts` | `lastUpdateToMs`, `isWeatherRefreshDue`, `createLastUpdateTimestamp` — interval gating helpers |
| `helpers/search-stored-cities.ts` | Offline autocomplete against saved favorites/history by city name |
| `helpers/clean-text.ts` | Normalize labels for display and favorite keys (NFD, strip accents) |

## Models (`models/`)

Interfaces aligned with WeatherAPI JSON:

- `root.interface.ts` — `Root { location, current }`
- `search-location.interface.ts` — autocomplete row
- `location.interface.ts`, `current.interface.ts`, `condition.interface.ts`, `air-quality.interface.ts`

## i18n

**Runtime switching (INT-20):** UI locale lives in NgRx (`locale`) and `localStorage` (`app-locale`). Templates use `I18nPipe` (`{{ 'dashboard.title' | i18n }}`) backed by `src/app/i18n/messages.ts` (catalog aligned with XLF message ids). Store/effects use `translate()` from `src/app/i18n/translate.ts`. WeatherAPI `lang` param applied on `getCurrent` when locale is `es`.

**Build-time (INT-13):** `@angular/localize` still configured in `angular.json`; compile-time Spanish via `npm run start:es`. XLF files remain source for extract/review:

- Markers legacy path: `src/locale/messages.xlf`; Spanish: `messages.es.xlf`
- Extract: `npm run i18n:extract`

## Environment

| File | `production` | `baseUrl` |
|------|--------------|-----------|
| `environment.ts` | `true` | WeatherAPI v1 |
| `environment.development.ts` | `false` | same (via file replacement in dev/test builds) |

## Tests (by area)

- **Service:** `weather.service.spec.ts`
- **Store:** `weather.state.spec.ts`, `weather.reducer.spec.ts`, `weather.actions.spec.ts`, `weather.effects.spec.ts`, `weather.storage.spec.ts`, `weather-user-message.spec.ts`, `weather-update-interval.spec.ts`
- **Helpers:** `weather-search-query.spec.ts`, `weather-refresh.spec.ts`, `clean-text.spec.ts`, `search-stored-cities.spec.ts`
- **Components:** dashboard, detail panel, results table, current-weather-card specs
