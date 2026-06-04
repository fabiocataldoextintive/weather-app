import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { weatherActions } from '../../../store/weather/weather.actions';
import { favoriteCityKey, initialWeatherState, type FavoriteCity } from '../../../store/weather/weather.state';
import { WeatherFavoritesListComponent } from './weather-favorites-list.component';

describe('WeatherFavoritesListComponent', () => {
  let fixture: ComponentFixture<WeatherFavoritesListComponent>;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  const favorite: FavoriteCity = { cityLabel: favoriteCityKey('Paris, FR') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherFavoritesListComponent],
      providers: [
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(WeatherFavoritesListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show empty hint when no favorites', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No favorites yet');
  });

  it('should render favorites when store has entries', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [favorite.cityLabel]: favorite },
      },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.favorites__list')).toBeTruthy();
    expect(el.textContent).toContain(favorite.cityLabel);
  });

  it('should dispatch favoriteSelected when row clicked', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [favorite.cityLabel]: favorite },
      },
    });
    fixture.detectChanges();
    dispatchSpy.mockClear();

    const cmp = fixture.componentInstance as unknown as {
      selectFavorite(f: FavoriteCity): void;
    };
    cmp.selectFavorite(favorite);
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.favoriteSelected({ cityLabel: favorite.cityLabel }),
    );
  });

  it('should dispatch favoriteCityToggled when remove clicked', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [favorite.cityLabel]: favorite },
      },
    });
    fixture.detectChanges();
    dispatchSpy.mockClear();

    const cmp = fixture.componentInstance as unknown as {
      removeFavorite(f: FavoriteCity, event: Event): void;
    };
    cmp.removeFavorite(favorite, new Event('click'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.favoriteCityToggled({ cityLabel: favorite.cityLabel }),
    );
  });

  it('isActive matches active location label via favoriteCityKey', () => {
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [favorite.cityLabel]: favorite },
        activeLocationLabel: 'Paris, FR',
      },
    });
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as {
      isActive(f: FavoriteCity): boolean;
    };
    expect(cmp.isActive(favorite)).toBe(true);
  });
});
