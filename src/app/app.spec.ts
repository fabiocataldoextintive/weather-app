import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { App } from './app';
import type { Root } from './core/weather/models/root.interface';
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
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, weather-app');
  });
});
