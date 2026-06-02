# Project Overview — WeatherApp

## Purpose

Single-page weather application. User searches cities via autocomplete, loads current conditions from [WeatherAPI](https://www.weatherapi.com/docs/), views results in **Table** or **Detail** layout, and persists recent searches and favorites in `localStorage`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Angular 21 (standalone components, signals) |
| State | NgRx Store 21 (`createFeature`, effects) |
| HTTP | `@angular/common/http` |
| Styling | SCSS |
| i18n | `@angular/localize` (source: `en`, locale: `es`) |
| Env injection | `@ngx-env/builder` (`import.meta.env.NG_APP_WEATHER_API_KEY`) |
| Unit tests | Vitest 4 + `@analogjs/vite-plugin-angular` + jsdom |
| Language | TypeScript ~5.9 |

## External API

- **Provider:** WeatherAPI (`http://api.weatherapi.com/v1`)
- **Endpoints used:**
  - `GET /search.json?q=` — location autocomplete
  - `GET /current.json?q=` — current weather for a city or coordinates
- **Auth:** API key via query param `key`, read from `import.meta.env.NG_APP_WEATHER_API_KEY`

## Environment Setup

1. Copy `.env.example` → `.env`
2. Set `NG_APP_WEATHER_API_KEY=<your-key>`
3. Run `npm start` (dev server on `http://localhost:4200/`)

Base URL is configured in `src/environments/environment*.ts` (`baseUrl`). Production vs development is selected via Angular file replacements in `angular.json`.

## NPM Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Dev server (development config) |
| `npm run start:es` | Dev server with Spanish locale |
| `npm run build:dev` | Development build |
| `npm run test` / `test:run` | Vitest (watch / single run) |
| `npm run test:coverage` | Coverage report → `coverage/` |
| `npm run i18n:extract` | Extract i18n messages → `src/locale/messages.xlf` |

## Repository Layout (high level)

```
weather-app/
├── docs/                  # Project documentation (source of truth)
├── public/                # Static assets
├── src/
│   ├── app/               # Application code
│   ├── environments/      # Environment configs
│   ├── locale/            # XLF translation files
│   └── styles.scss        # Global styles
├── angular.json
├── vitest.config.ts
└── package.json
```

## Current Scope

- One routeless SPA: root component renders `WeatherDashboardComponent` directly
- No authentication, no backend — browser talks to WeatherAPI only
- Client-side persistence for recent cities, favorites, and view mode
