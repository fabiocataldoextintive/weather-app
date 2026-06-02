# Modules & Features

## App Shell

### `App` (`src/app/app.ts`)

Root component. Imports only `WeatherDashboardComponent`. No router outlet — dashboard is the entire UI.

---

## Page: Weather Dashboard

**Path:** `src/app/pages/weather-dashboard/`

Main feature surface. Owns city search, suggestion dropdown, loading/error status, and view-mode toggle.

### `WeatherDashboardComponent`

| Concern | Implementation |
|---------|----------------|
| Search input | Two-way binding via `ngModel` + `searchInputChanged` |
| Suggestions | Renders listbox; click or Enter selects location |
| Keyboard | Escape dismisses suggestions |
| View toggle | Dispatches `visualizationModeChanged` (`table` / `detailed`) |
| Status | Shows loading spinner text and API errors |

**Child components (conditional):**

- `app-weather-results-table` when mode is `table`
- `app-weather-detail-panel` when mode is `detailed`

---

## Dashboard Children

### `WeatherResultsTableComponent`

**Path:** `weather-dashboard/weather-results-table/`

Displays **recent searches** as a clickable table.

| Column | Source |
|--------|--------|
| City | `RecentCity.label` |
| Temp (°C) | `row.root.current.temp_c` |
| Condition | `row.root.current.condition.text` |
| Local time | `row.root.location.localtime` |

- Rows sorted by `updatedAt` descending (via `selectRecentCitiesOrdered`)
- Selected row highlighted when `row.key === selectedKey`
- Row click → `recentRowSelected` (switches to detail view)
- Empty state when no recent cities and not loading

### `WeatherDetailPanelComponent`

**Path:** `weather-dashboard/weather-detail-panel/`

Shows detailed weather for the current selection. Wraps `CurrentWeatherCardComponent` when `currentWeather` is set. Empty hint when idle with no errors.

---

## Shared Component

### `CurrentWeatherCardComponent`

**Path:** `src/app/components/current-weather-card/`

Presentational card for a `Root` weather response.

| Input | Purpose |
|-------|---------|
| `root` (required) | WeatherAPI current response |
| `favoriteLabel` | Label used for favorite toggle (optional) |

**Features:**

- Title from location name, region, country
- Condition icon (protocol-relative URLs prefixed with `https:`)
- Temp in °C and °F, condition text, wind, humidity
- Favorite star toggle → `favoriteCityToggled`

---

## Store: Weather

**Path:** `src/app/store/weather/`

### Actions (`weather.actions.ts`)

| Action | Trigger |
|--------|---------|
| `searchInputChanged` | User types in search |
| `suggestionsResolved` | Autocomplete effect completes |
| `dismissSuggestions` | Escape key |
| `suggestionPicked` | User selects suggestion |
| `loadCurrentWeather` | Start fetch |
| `loadCurrentWeatherSuccess` / `Failure` | API result |
| `recentRowSelected` | Table row click |
| `visualizationModeChanged` | View toggle |
| `favoriteCityToggled` | Star button |
| `hydrateFromLocalStorage` | App init |

### Effects (`weather.effects.ts`)

| Effect | Behavior |
|--------|----------|
| `autocomplete$` | 300 ms debounce, min query length 2 |
| `pickSuggestionLoadsWeather$` | Maps pick → load |
| `loadCurrentWeather$` | Calls API, maps errors |
| `persistRecentAndFavorites$` | Writes to localStorage (no dispatch) |
| `persistVisualization$` | Persists view mode (no dispatch) |

### Reducer highlights

- Search input sanitized on every keystroke
- Successful load upserts into `recentCities` map keyed by query (`lat,lon`)
- Favorites keyed by normalized label via `favoriteCityKey()`
- `recentRowSelected` restores cached weather without new API call

### Storage (`weather.storage.ts`)

- Keys: `recent-cities`, `favorite-cities`, `visualization-mode`
- Supports legacy array and object formats on read
- `detail` legacy value normalized to `detailed`

### User messages (`weather-user-message.ts`)

Maps raw `Error.message` to localized user strings (location not found, API failure, generic).

---

## Service: Weather

**Path:** `src/app/services/weather/weather.service.ts`

| Method | Endpoint | Returns |
|--------|----------|---------|
| `searchLocations(q)` | `/search.json` | `SearchLocation[]` |
| `getCurrent(q, lang?)` | `/current.json` | `Root` |

Injectable `providedIn: 'root'`. Centralized HTTP error handling.

---

## Models

**Path:** `src/app/models/`

| File | Type | Usage |
|------|------|-------|
| `root.interface.ts` | `Root` | Top-level current weather response |
| `location.interface.ts` | `Location` | City metadata |
| `current.interface.ts` | `Current` | Current conditions |
| `condition.interface.ts` | `Condition` | Icon + text |
| `air-quality.interface.ts` | `AirQuality` | Optional on `Current` |
| `search-location.interface.ts` | `SearchLocation` | Autocomplete item |

---

## Helpers

**Path:** `src/app/helpers/`

| File | Function | Purpose |
|------|----------|---------|
| `weather-search-query.ts` | `sanitizeWeatherSearchInput` | Strip unsafe chars, normalize Unicode |
| `weather-search-query.ts` | `countLettersAndDigits` | Validate searchable content length |
| `clean-text.ts` | `cleanText` | Lowercase, strip accents, normalize for favorite keys |

---

## i18n

**Path:** `src/locale/`

| File | Locale |
|------|--------|
| `messages.xlf` | Source (English) |
| `messages.es.xlf` | Spanish |

Extract with `npm run i18n:extract`. Template strings use `i18n="@@id"` and `$localize`:@@id:...`` in TypeScript.

---

## Environments

| File | `production` | Used when |
|------|--------------|-----------|
| `environment.ts` | `true` | Production build |
| `environment.development.ts` | `false` | Dev / test builds |

Both set `baseUrl: 'http://api.weatherapi.com/v1'`.
