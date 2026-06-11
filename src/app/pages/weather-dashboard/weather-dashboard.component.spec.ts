import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { weatherActions } from '../../store/weather/weather.actions';
import { initialWeatherState } from '../../store/weather/weather.state';
import type { SearchLocation } from '../../models/search-location.interface';
import { WeatherDashboardComponent } from './weather-dashboard.component';

describe('WeatherDashboardComponent', () => {
  let fixture: ComponentFixture<WeatherDashboardComponent>;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  const sampleLocation: SearchLocation = {
    id: 1,
    name: 'Paris',
    region: 'Ile-de-France',
    country: 'France',
    lat: 48.85,
    lon: 2.35,
    url: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherDashboardComponent],
      providers: [
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WeatherDashboardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show loading status when currentStatus is loading', () => {
    store.setState({
      weather: { ...initialWeatherState, currentStatus: 'loading' },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status--loading')?.textContent).toContain('Loading weather');
  });

  it('should show search validation message from store', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        searchValidationMessage:
          'No city suggestions available. Try writing another city.',
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.search__validation')?.textContent).toContain(
      'No city suggestions available',
    );
  });

  it('should dispatch searchInputChanged on search input', () => {
    const cmp = fixture.componentInstance as unknown as {
      onSearchInput(value: string): void;
    };
    cmp.onSearchInput('  Lyon  ');
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.searchInputChanged({ raw: '  Lyon  ' }),
    );
  });

  it('should dispatch suggestionPicked on pickLocation', () => {
    const cmp = fixture.componentInstance as unknown as {
      pickLocation(loc: SearchLocation): void;
    };
    cmp.pickLocation(sampleLocation);
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.suggestionPicked({
        q: `${sampleLocation.lat},${sampleLocation.lon}`,
        label: 'paris, france',
      }),
    );
  });

  it('should dispatch dismissSuggestions on Escape', () => {
    const cmp = fixture.componentInstance as unknown as {
      onSearchKeydown(ev: KeyboardEvent): void;
    };
    cmp.onSearchKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dispatchSpy).toHaveBeenCalledWith(weatherActions.dismissSuggestions());
  });

  it('should pick first suggestion on Enter when list is visible', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        suggestions: [sampleLocation],
        showSuggestions: true,
      },
    });
    fixture.detectChanges();
    dispatchSpy.mockClear();

    const cmp = fixture.componentInstance as unknown as {
      onSearchKeydown(ev: KeyboardEvent): void;
    };
    const ev = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    cmp.onSearchKeydown(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.suggestionPicked({
        q: `${sampleLocation.lat},${sampleLocation.lon}`,
        label: 'paris, france',
      }),
    );
  });

  it('Enter does not pick suggestion when list is hidden', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        suggestions: [sampleLocation],
        showSuggestions: false,
      },
    });
    fixture.detectChanges();
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as {
      onSearchKeydown(ev: KeyboardEvent): void;
    };
    cmp.onSearchKeydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch visualizationModeChanged when toggling view', () => {
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as {
      setView(mode: 'table' | 'detailed'): void;
    };
    cmp.setView('table');
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.visualizationModeChanged({ mode: 'table' }),
    );
    cmp.setView('detailed');
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.visualizationModeChanged({ mode: 'detailed' }),
    );
  });

  it('should reflect weather error from store', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        currentError: 'Network error',
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status--error')?.textContent).toContain('Network error');
  });

  it('should render language selector buttons', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.lang-selector')).toBeTruthy();
    expect(el.textContent).toContain('English');
    expect(el.textContent).toContain('Spanish');
  });

  it('should dispatch localeChanged when selecting another language', () => {
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as {
      setLocale(locale: 'en' | 'es'): void;
    };
    cmp.setLocale('es');
    expect(dispatchSpy).toHaveBeenCalledWith(weatherActions.localeChanged({ locale: 'es' }));
  });

  it('should not dispatch localeChanged when language is unchanged', () => {
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as {
      setLocale(locale: 'en' | 'es'): void;
    };
    cmp.setLocale('en');
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
