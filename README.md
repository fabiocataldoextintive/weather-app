# WeatherApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Environment (WeatherAPI key)

**Base URL** (non-secret) is `http://api.weatherapi.com/v1` in `src/environments/environment*.ts`. HTTP code should build request URLs with **`weatherApiUrl()`** from `src/app/core/weather/weather-api-url.ts` (e.g. `weatherApiUrl('current.json')`, `weatherApiUrl('search.json')`) so every call uses the same configured host.

**`process.env.WEATHER_API_KEY`** is read only in code that needs the key (e.g. `getWeatherApiKey()`, `assertWeatherApiKeyConfigured()` before a WeatherAPI call). In the browser bundle it is **replaced at build time** via esbuild `define` in `angular.json`; it is not a live Node `process` at runtime.

Default `npm start` / `npm run build` use an **empty** key unless you pass a define to the CLI. Examples:

```bash
# PowerShell (example key — use your own)
ng serve --define process.env.WEATHER_API_KEY="'your-key-here'"
```

```bash
# macOS / Linux
ng serve --define process.env.WEATHER_API_KEY=\"$WEATHER_API_KEY\"
```

You can keep a local **`.env`** for your own tooling (see `.env.example`); this project does **not** load it automatically. `.env` stays gitignored — do not commit real keys.

## Development server

```bash
npm start
```

Open `http://localhost:4200/`. The app reloads when you change source files.

## Code scaffolding

```bash
ng generate component component-name
```

```bash
ng generate --help
```

## Building

```bash
npm run build
```

Output is under `dist/`.

## Running unit tests

```bash
ng test
```

The `test` build configuration defines a placeholder `process.env.WEATHER_API_KEY` (no extra flags needed).

## Additional Resources

[Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
