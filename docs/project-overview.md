# WeatherApp — Project Overview

## Purpose

Single-page Angular application for searching cities via [WeatherAPI](https://www.weatherapi.com/docs/), viewing current conditions, browsing recent searches, and managing favorite cities. State is centralized in NgRx; persistence uses `localStorage`.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Angular 21 (standalone components, signals in UI) |
| Language | TypeScript ~5.9 |
| State | NgRx Store 21 (`createFeature`, effects, devtools in dev) |
| HTTP | `@angular/common/http` |
| Styling | SCSS (component-scoped + `src/styles.scss`) |
| Tests | Vitest 4 + jsdom + `@analogjs/vite-plugin-angular` |
| i18n | `@angular/localize` (build-time) + runtime `I18nPipe` / `messages.ts` (`en`, `es`) |
| PWA | `@angular/service-worker` (production builds); `manifest.webmanifest`; offline favorites/history |
| Env / secrets | `@ngx-env/builder` → `import.meta.env.NG_APP_WEATHER_API_KEY` |
| API | WeatherAPI v1 (`search.json`, `current.json`) |

## Repository layout (high level)

```
weather-app/
├── src/app/           # application code
├── src/environments/  # API base URL
├── src/locale/        # XLF translations
├── public/            # static assets
├── docs/              # architecture source of truth (this folder)
└── angular.json       # build, i18n, ngx-env builder
```

## External API

- **Docs:** https://www.weatherapi.com/docs/
- **Base URL:** `http://api.weatherapi.com/v1` (`src/environments/environment*.ts`)
- **Endpoints used:**
  - `GET /search.json` — autocomplete (`WeatherService.searchLocations`)
  - `GET /current.json` — current weather (`WeatherService.getCurrent`)

API key is **not** committed. Copy `.env.example` → `.env` and set `NG_APP_WEATHER_API_KEY`.

## NPM scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Dev server (`ng serve`) |
| `npm run start:es` | Dev server with Spanish locale |
| `npm run build:dev` | Development build |
| `ng build --configuration=production` | Production build with service worker (PWA) |
| `npm run test` | Vitest watch |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Coverage report |
| `npm run i18n:extract` | Extract i18n messages to `src/locale/messages.xlf` |

## Agent / workflow notes

See root `AGENTS.md` (Rocky — lead architect). Functional specs may arrive via user-provided documents; specialists live under `.cursor/agents/`.

## Out of scope (current codebase)

- No Angular routes (empty `app.routes.ts`); shell is `App` → `WeatherDashboardComponent` only.
- No forecast/history endpoints beyond `current.json` payload fields exposed in UI.
