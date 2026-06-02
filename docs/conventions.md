# Conventions

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Components | kebab-case files, `*Component` class | `weather-dashboard.component.ts` |
| Selectors | `app-` prefix | `app-weather-dashboard` |
| Services | kebab-case folder, `*Service` class | `weather.service.ts` |
| Store files | feature name prefix | `weather.actions.ts`, `weather.reducer.ts` |
| Models | `*.interface.ts` | `root.interface.ts` |
| Tests | co-located `*.spec.ts` | `weather.effects.spec.ts` |
| SCSS | component-scoped, BEM-like blocks | `.dashboard__header`, `.search__input` |

## Angular Patterns

- **Standalone components** — no NgModules; dependencies listed in `imports` array
- **OnPush** change detection on dashboard and child feature components
- **Signals from store** — `store.selectSignal(weatherFeature.selectX)` in components
- **Signal inputs** — `input.required<T>()` on presentational components (`CurrentWeatherCardComponent`)
- **Computed signals** — derived UI state (`isFavorite`, `iconSrc`, `titleLine`)
- **Control flow** — `@if`, `@for` (not `*ngIf` / `*ngFor`) in templates
- **Root app** — minimal shell; feature lives under `pages/`

## NgRx Patterns

- Single feature: `weatherFeature` via `createFeature`
- Actions grouped with `createActionGroup` (`source: 'Weather'`)
- Effects use `inject()` instead of constructor DI
- Non-dispatching effects for side effects only (`persistRecentAndFavorites$`, `persistVisualization$`)
- Extra selectors defined in `extraSelectors` (e.g. ordered recent cities)
- State interfaces and pure helpers in `weather.state.ts`, separate from reducer

## State & Persistence

- Recent cities keyed by API query string (`"${lat},${lon}"`)
- Favorite cities keyed by `favoriteCityKey(label)` → `cleanText(label)`
- Never store API key in state or localStorage
- Hydration happens once in `provideAppInitializer`; writes happen in effects after success/toggle

## HTTP & Errors

- All WeatherAPI calls go through `WeatherService`
- API key from `import.meta.env.NG_APP_WEATHER_API_KEY` (never hardcoded)
- Service throws `Error` with descriptive message; effects map to user-facing i18n strings via `toWeatherUserMessage`
- Search input sanitized before API calls (`sanitizeWeatherSearchInput`)

## i18n

- Every user-visible string in templates should have `i18n` with stable `@@id`
- Runtime messages in TypeScript use `$localize`:@@id:Default text``
- Error IDs prefixed with `@@err.` (e.g. `@@err.locationNotFound`)
- Dashboard IDs prefixed with `@@dashboard.`, table with `@@table.`, card with `@@card.`

## Styling

- SCSS per component (`styleUrl` singular)
- Global resets and tokens in `src/styles.scss`
- Status classes: `.status`, `.status--loading`, `.status--error`, `.status--muted`
- Accessibility: `role="alert"`, `aria-live`, `aria-expanded`, listbox/option roles on suggestions

## Testing

- **Framework:** Vitest (`describe`, `it`, `expect` — globals enabled)
- **File naming:** `*.spec.ts` next to implementation
- **Fixtures:** shared test data in `weather-test-fixtures.ts`
- **Store tests:** reducer pure transitions, effect marbles/observables, storage round-trips
- Run: `npm run test:run` for CI-style single pass

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NG_APP_WEATHER_API_KEY` | WeatherAPI key (`.env`, injected at build) |

Declared in `src/env.d.ts`. Example in `.env.example`. Do not commit `.env`.

## File Organization

```
src/app/
├── components/     # Reusable UI (cross-page)
├── helpers/        # Pure functions, no Angular deps
├── models/         # Interfaces only
├── pages/          # Feature pages and their local children
├── services/       # HTTP and external integrations
└── store/          # NgRx feature folders
```

## Code Style

- Prettier configured (project devDependency)
- Prefer `inject()` over constructor injection in new code
- `protected` for template-bound class members in components
- `readonly` on injected dependencies and signal selectors
- Type imports: `import type { ... }` for interfaces

## Git & Secrets

- `.env` gitignored
- Never commit API keys or credentials
- `skills-lock.json` and local tooling files are not part of application source
