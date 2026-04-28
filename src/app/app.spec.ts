import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import type { Root } from './core/weather/models/root.interface';
import type { SearchLocation } from './core/weather/models/search-location.interface';
import { WeatherService } from './core/weather/weather.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getCurrent: () => of({} as Root),
            searchLocations: () => of([] as SearchLocation[]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render weather heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Weather');
  });
});
