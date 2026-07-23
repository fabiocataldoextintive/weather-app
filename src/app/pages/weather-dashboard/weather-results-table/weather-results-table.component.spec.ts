import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { weatherActions } from '../../../store/weather/weather.actions';
import { mockRecentCity, mockWeatherRoot } from '../../../store/weather/weather-test-fixtures';
import { initialWeatherState, RECENT_CITIES_PAGE_SIZE, type RecentCity } from '../../../store/weather/weather.state';
import { WeatherResultsTableComponent } from './weather-results-table.component';

describe('WeatherResultsTableComponent', () => {
  let fixture: ComponentFixture<WeatherResultsTableComponent>;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  const row = mockRecentCity({
    key: '40.7,-74',
    label: 'NYC, US',
  });

  function makeRecentCity(index: number): RecentCity {
    return mockRecentCity({
      key: `${index},${index}`,
      label: `City ${index}`,
      updatedAt: index,
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherResultsTableComponent],
      providers: [
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WeatherResultsTableComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show empty hint when no recent cities and not loading', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No saved results yet');
  });

  it('should render rows when recent cities exist', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [row.key]: row },
        selectedKey: row.key,
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.results-table')).toBeTruthy();
    expect(el.textContent).toContain('NYC, US');
  });

  it('should dispatch recentRowSelected on row click', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [row.key]: row },
      },
    });
    fixture.detectChanges();
    dispatchSpy.mockClear();

    const cmp = fixture.componentInstance as unknown as {
      selectRow(r: RecentCity): void;
    };
    cmp.selectRow(row);
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.recentRowSelected({ key: row.key }),
    );
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

  it('should paginate when history exceeds page size', () => {
    const recentCities: Record<string, RecentCity> = {};
    for (let i = 0; i < RECENT_CITIES_PAGE_SIZE + 3; i++) {
      const city = makeRecentCity(i);
      recentCities[city.key] = city;
    }
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities,
      },
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.table-pagination')).toBeTruthy();
    expect(el.querySelectorAll('.results-table__row').length).toBe(RECENT_CITIES_PAGE_SIZE);

    const cmp = fixture.componentInstance as unknown as {
      goToNextPage(): void;
      goToPreviousPage(): void;
      currentPage(): number;
    };
    cmp.goToNextPage();
    fixture.detectChanges();
    expect(el.querySelectorAll('.results-table__row').length).toBe(3);
    expect(cmp.currentPage()).toBe(1);

    cmp.goToPreviousPage();
    fixture.detectChanges();
    expect(el.querySelectorAll('.results-table__row').length).toBe(RECENT_CITIES_PAGE_SIZE);
    expect(cmp.currentPage()).toBe(0);

    cmp.goToPreviousPage();
    expect(cmp.currentPage()).toBe(0);
  });

  it('should hide pagination when history fits one page', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        recentCities: { [row.key]: row },
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.table-pagination')).toBeNull();
  });
});
