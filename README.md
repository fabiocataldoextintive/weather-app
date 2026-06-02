# WeatherApp

Angular 21 SPA for city weather search via [WeatherAPI](https://www.weatherapi.com/docs/). NgRx state, autocomplete, table/detail views, recent cities and favorites in `localStorage`.

Full project docs: [`docs/`](docs/) (`project-overview.md`, `architecture.md`, `modules.md`, `conventions.md`).

## Environment (WeatherAPI key)

**Base URL** (non-secret): `http://api.weatherapi.com/v1` in `src/environments/environment*.ts`. `WeatherService` builds URLs from `environment.baseUrl`.

**API key** is injected at build time by [`@ngx-env/builder`](https://github.com/chihab/ngx-env) as `import.meta.env.NG_APP_WEATHER_API_KEY` (see `src/env.d.ts`, used in `src/app/services/weather/weather.service.ts`).

1. Copy `.env.example` → `.env`
2. Set `NG_APP_WEATHER_API_KEY=<your-key>`
3. Start the dev server (see below)

`.env` is gitignored — do not commit real keys.

## Development server

```bash
npm start
```

Open `http://localhost:4200/`. Spanish locale: `npm run start:es`.

## Building

```bash
npm run build:dev
```

Production build: `ng build` (default configuration in `angular.json`). Output under `dist/`.

## Running unit tests

```bash
npm run test        # watch
npm run test:run    # single run
npm run test:coverage
```

Vitest + jsdom; config in `vitest.config.ts`.

## i18n

Extract messages: `npm run i18n:extract` → `src/locale/messages.xlf`.

## Code scaffolding

```bash
ng generate component component-name
ng generate --help
```

## Additional resources

- [Angular CLI](https://angular.dev/tools/cli)
- [WeatherAPI docs](https://www.weatherapi.com/docs/)
