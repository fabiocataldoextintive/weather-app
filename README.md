# WeatherApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Environment (WeatherAPI key)

**Base URL** (non-secret) is `http://api.weatherapi.com/v1` in `src/environments/environment*.ts`. HTTP code should build request URLs with **`weatherApiUrl()`** from `src/app/core/weather/weather-api-url.ts` (e.g. `weatherApiUrl('current.json')`, `weatherApiUrl('search.json')`) so every call uses the same configured host.

Code reads **`process.env.WEATHER_API_KEY`**. In the browser bundle that name is **replaced at build time** (esbuild `define` in `angular.json`); it is not a live Node `process` at runtime.

1. Set `WEATHER_API_KEY` in **`.env`** at the project root (see `.env.example`).
2. Run **`npm start`** or **`npm run build`**. Those scripts use `dotenv-cli` to load `.env` and pass `--define process.env.WEATHER_API_KEY=...` into the Angular CLI.

Do not commit real keys. `.env` is listed in `.gitignore`.

Plain `ng serve` / `ng build` keep the default empty define unless you pass `--define process.env.WEATHER_API_KEY='...'` yourself. If the key is empty, the app throws on startup.

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

The `test` build configuration defines a placeholder `process.env.WEATHER_API_KEY` (no `.env` needed).

## Additional Resources

[Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
