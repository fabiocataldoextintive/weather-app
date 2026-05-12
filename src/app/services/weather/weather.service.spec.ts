import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Root } from '../../models/root.interface';
import type { SearchLocation } from '../../models/search-location.interface';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let httpMock: HttpTestingController;
  let service: WeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeatherService, provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WeatherService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('searchLocations trims query and hits search.json', async () => {
    const resp: SearchLocation[] = [];
    const promise = firstValueFrom(service.searchLocations('  Paris  '));
    const req = httpMock.expectOne((r) =>
      r.url.startsWith(`${environment.baseUrl}/search.json`),
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('Paris');
    expect(req.request.params.has('key')).toBe(true);
    req.flush(resp);
    await expect(promise).resolves.toEqual(resp);
  });

  it('getCurrent requests current.json without lang by default', async () => {
    const root = {} as Root;
    const promise = firstValueFrom(service.getCurrent('London'));
    const req = httpMock.expectOne((r) =>
      r.url.startsWith(`${environment.baseUrl}/current.json`),
    );
    expect(req.request.params.get('q')).toBe('London');
    expect(req.request.params.has('lang')).toBe(false);
    req.flush(root);
    await expect(promise).resolves.toBe(root);
  });

  it('getCurrent adds lang when provided', async () => {
    const root = {} as Root;
    const promise = firstValueFrom(service.getCurrent('London', 'fr'));
    const req = httpMock.expectOne((r) => r.url.includes('current.json'));
    expect(req.request.params.get('lang')).toBe('fr');
    req.flush(root);
    await expect(promise).resolves.toBe(root);
  });

  it('getCurrent omits lang when empty string', async () => {
    const root = {} as Root;
    const promise = firstValueFrom(service.getCurrent('London', ''));
    const req = httpMock.expectOne((r) => r.url.includes('current.json'));
    expect(req.request.params.has('lang')).toBe(false);
    req.flush(root);
    await expect(promise).resolves.toBe(root);
  });

  it('maps HttpErrorResponse to Error with API message', async () => {
    const promise = firstValueFrom(service.searchLocations('x'));
    const req = httpMock.expectOne((r) => r.url.includes('search.json'));
    req.flush(
      { error: { message: 'oops', code: 1006 } },
      { status: 400, statusText: 'Bad Request' },
    );
    await expect(promise).rejects.toThrow(/Weather API request failed.*oops/s);
  });

  it('maps unknown HTTP body using status text', async () => {
    const promise = firstValueFrom(service.getCurrent('z'));
    const req = httpMock.expectOne((r) => r.url.includes('current.json'));
    req.flush(null, { status: 500, statusText: 'Server Error' });
    await expect(promise).rejects.toMatchObject({
      message: expect.stringContaining('Weather API request failed'),
    });
  });

  it('maps HttpErrorResponse when body has no nested message', async () => {
    const promise = firstValueFrom(service.searchLocations('q'));
    const req = httpMock.expectOne((r) => r.url.includes('search.json'));
    req.flush({ notErrorShape: true }, { status: 502, statusText: 'Bad Gateway' });
    await expect(promise).rejects.toThrow(/Weather API request failed/);
  });

  it('propagates non-HTTP errors from HttpClient', async () => {
    const http = TestBed.inject(HttpClient);
    const spy = vi.spyOn(http, 'get').mockReturnValue(throwError(() => new Error('upstream')));
    try {
      await expect(firstValueFrom(service.getCurrent('City'))).rejects.toThrow('upstream');
    } finally {
      spy.mockRestore();
    }
  });

  it('wraps non-HTTP string errors from HttpClient', async () => {
    const http = TestBed.inject(HttpClient);
    const spy = vi.spyOn(http, 'get').mockReturnValue(throwError(() => 'plain string'));
    try {
      await expect(firstValueFrom(service.searchLocations('x'))).rejects.toThrow('plain string');
    } finally {
      spy.mockRestore();
    }
  });

  it('wraps unknown non-HTTP errors as Unknown error', async () => {
    const http = TestBed.inject(HttpClient);
    const spy = vi.spyOn(http, 'get').mockReturnValue(throwError(() => ({ code: 1 })));
    try {
      await expect(firstValueFrom(service.getCurrent('y'))).rejects.toThrow('Unknown error');
    } finally {
      spy.mockRestore();
    }
  });
});
