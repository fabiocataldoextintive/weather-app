/** Keys from `.env` / CI, injected by `@ngx-env/builder` as `import.meta.env.*` */
interface ImportMetaEnv {
  readonly NG_APP_WEATHER_API_KEY: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
