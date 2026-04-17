import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import type { Root } from './models/root.interface';
import { assertWeatherApiKeyConfigured, getWeatherApiKey } from './weather-environment';
import { weatherApiUrl } from './weather-api-url';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  /**
   * GET `/current.json` — see https://www.weatherapi.com/docs/
   */
  getCurrent(q: string, lang?: string): Observable<Root> {
    assertWeatherApiKeyConfigured();
    const url = weatherApiUrl('current.json');
    let params = new HttpParams().set('key', getWeatherApiKey()).set('q', q);
    if (lang !== undefined && lang !== '') {
      params = params.set('lang', lang);
    }
    return this.http.get<Root>(url, { params }).pipe(catchError((err) => this.handleError(err)));
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: { message?: string; code?: number } } | undefined;
      const apiMsg = body?.error?.message;
      const detail = apiMsg ?? error.message ?? `HTTP ${error.status}`;
      return throwError(() => new Error(`Weather API request failed: ${detail}`));
    }
    return throwError(() =>
      error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error'),
    );
  }
}
