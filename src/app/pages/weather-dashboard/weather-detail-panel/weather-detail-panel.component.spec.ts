import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { mockWeatherRoot } from '../../../store/weather/weather-test-fixtures';
import { initialWeatherState } from '../../../store/weather/weather.state';
import { WeatherDetailPanelComponent } from './weather-detail-panel.component';

describe('WeatherDetailPanelComponent', () => {
  let fixture: ComponentFixture<WeatherDetailPanelComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherDetailPanelComponent],
      providers: [
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(WeatherDetailPanelComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show muted hint when no weather and idle', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Search for a city to see the forecast');
  });

  it('should show current weather card when root is present', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        currentWeather: mockWeatherRoot(),
        activeLocationLabel: 'Test City, TC',
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-current-weather-card')).toBeTruthy();
  });

  it('loadingWeather should be true when status is loading', () => {
    store.setState({
      weather: { ...initialWeatherState, currentStatus: 'loading' },
    });
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as {
      loadingWeather(): boolean;
    };
    expect(cmp.loadingWeather()).toBe(true);
  });
});
