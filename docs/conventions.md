# WeatherApp — Conventions

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Components | kebab-case files, `*Component` class, selector `app-*` | `weather-dashboard.component.ts`, `app-weather-dashboard` |
| NgRx feature | `weather` feature name, `weatherFeature` export | `createFeature({ name: 'weather', ... })` |
| Actions | `createActionGroup`, source `'Weather'` | `weatherActions.loadCurrentWeather` |
| Interfaces | PascalCase, file `*.interface.ts` | `Root`, `SearchLocation` |
| Storage keys | kebab-case string constants in `weather.storage.ts` | `recent-cities` |
| Recent city key | `"lat,lon"` string from API location | Used as map key in `recentCities` |
| Favorite key | `favoriteCityKey(cityLabel)` — cleaned lowercase label | `cleanText` + normalization |

## Angular style

- **Standalone components** with explicit `imports` arrays
- **OnPush** change detection on feature UI components
- **Signals** for store selections: `store.selectSignal(weatherFeature.select…)`
- **Inputs** on presentational components use `input()` / `input.required()` (see `CurrentWeatherCardComponent`)
- **Control flow:** `@if`, `@for` in templates (not legacy `*ngIf` in new code)
- **SCSS** per component (`styleUrl`); global tokens in `src/styles.scss`

## State conventions

- UI dispatches actions; **never** mutates store state directly
- Async work lives in **effects**; reducers stay synchronous
- Side-effect-only effects use `{ dispatch: false }` (persistence)
- Validation messages and API errors are **user-facing strings** (often `$localize`)
- Minimum search length: `MIN_SEARCH_QUERY_LEN = 2` (letters/digits counted after sanitize)

## HTTP & errors

- `WeatherService` catches `HttpErrorResponse` and throws `Error` with a stable prefix for `toWeatherUserMessage`
- Effects map failures to `loadCurrentWeatherFailure({ userMessage })`
- Autocomplete errors fail silently (empty suggestions) to avoid noisy UX

## Environment & secrets

- Never commit `.env` or real API keys
- Use `NG_APP_WEATHER_API_KEY` only via `import.meta.env` (typed in `src/env.d.ts`)
- Base URL stays in `environment*.ts` (not secret)

## Formatting & editor

- **Prettier:** 100 print width, single quotes; Angular HTML parser for `*.html` (`.prettierrc`)
- **EditorConfig:** 2 spaces, UTF-8, final newline (`.editorconfig`)

## Testing

- Framework: **Vitest** (not Karma)
- File suffix: `*.spec.ts` next to implementation
- Prefer testing reducers/effects/services in isolation; use `weather-test-fixtures` for API shapes
- `localStorage` tests must account for guards in storage helpers

## File organization

```
src/app/
├── components/     # reusable UI
├── pages/          # route-level / screen containers
├── services/       # HTTP and infra
├── store/          # NgRx feature folders
├── models/         # API TypeScript interfaces
└── helpers/        # pure functions
```

## Shell commands (agents)

Project rule: prefix terminal commands with **`rtk`** where applicable (`rtk git status`, `rtk npm test`) to reduce token noise in agent sessions.

## Documentation

- `/docs/` is the **source of truth** for architecture and modules
- Update relevant doc files when features, stack, or conventions change
- Do not rescan the whole repo for routine tasks if docs are current

## Cleanup backlog (non-blocking)

Remove unused duplicate files under `pages/weather-dashboard/` (flat `weather-*-panel.component.*`) and `weather-resultas-table/` once confirmed no imports reference them.
