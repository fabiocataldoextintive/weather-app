import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { weatherActions } from '../../store/weather/weather.actions';
import { mockWeatherRoot } from '../../store/weather/weather-test-fixtures';
import { favoriteCityKey, initialWeatherState } from '../../store/weather/weather.state';
import { CurrentWeatherCardComponent } from './current-weather-card.component';

describe('CurrentWeatherCardComponent', () => {
  let fixture: ComponentFixture<CurrentWeatherCardComponent>;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  const root = mockWeatherRoot({
    location: {
      name: 'Paris',
      region: 'Ile-de-France',
      country: 'France',
      lat: 48.85,
      lon: 2.35,
      tz_id: 'Europe/Paris',
      localtime_epoch: 0,
      localtime: '2024-06-01 15:00',
    },
    current: {
      ...mockWeatherRoot().current,
      condition: { text: 'Sunny', icon: '//cdn.example/icon.png', code: 1000 },
      temp_c: 22.4,
      temp_f: 72.3,
      wind_kph: 12,
      wind_dir: 'NW',
      humidity: 40,
    },
  });

  async function createCard(
    favoriteLabel: string | null,
    favoritesCities: Record<string, { cityLabel: string }> = {},
  ): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CurrentWeatherCardComponent],
      providers: [
        provideMockStore({
          initialState: {
            weather: {
              ...initialWeatherState,
              favoritesCities,
            },
          },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CurrentWeatherCardComponent);
    fixture.componentRef.setInput('root', root);
    fixture.componentRef.setInput('favoriteLabel', favoriteLabel);
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    await createCard('Paris, France');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders title with region and weather details', async () => {
    await createCard('Paris, France');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Paris, Ile-de-France, France');
    expect(el.textContent).toContain('Sunny');
    expect(el.querySelector('.card__icon')?.getAttribute('src')).toBe('https://cdn.example/icon.png');
  });

  it('prefixes protocol-relative icon URLs with https', async () => {
    await createCard('Paris, France');
    const cmp = fixture.componentInstance as unknown as { iconSrc(): string };
    expect(cmp.iconSrc()).toBe('https://cdn.example/icon.png');
  });

  it('returns empty iconSrc when condition icon is missing', async () => {
    await createCard('Paris, France');
    fixture.componentRef.setInput(
      'root',
      mockWeatherRoot({
        current: { ...mockWeatherRoot().current, condition: { text: 'Clear', icon: '', code: 1000 } },
      }),
    );
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as { iconSrc(): string };
    expect(cmp.iconSrc()).toBe('');
  });

  it('keeps absolute icon URLs unchanged', async () => {
    await createCard('Paris, France');
    fixture.componentRef.setInput(
      'root',
      mockWeatherRoot({
        current: {
          ...mockWeatherRoot().current,
          condition: { text: 'Clear', icon: 'https://cdn.example/abs.png', code: 1000 },
        },
      }),
    );
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as { iconSrc(): string };
    expect(cmp.iconSrc()).toBe('https://cdn.example/abs.png');
  });

  it('omits region from title when region is empty', async () => {
    await createCard('Paris, France');
    fixture.componentRef.setInput(
      'root',
      mockWeatherRoot({
        location: {
          ...mockWeatherRoot().location,
          name: 'Madrid',
          region: '',
          country: 'Spain',
        },
      }),
    );
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as { titleLine(): string };
    expect(cmp.titleLine()).toBe('Madrid, Spain');
  });

  it('marks favorite when label exists in store', async () => {
    const label = 'Paris, France';
    await createCard(label, {
      [favoriteCityKey(label)]: { cityLabel: label },
    });
    const cmp = fixture.componentInstance as unknown as { isFavorite(): boolean };
    expect(cmp.isFavorite()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card__fav')?.textContent?.trim()).toBe('★');
  });

  it('isFavorite is false when favoriteLabel is blank', async () => {
    await createCard('   ');
    const cmp = fixture.componentInstance as unknown as { isFavorite(): boolean };
    expect(cmp.isFavorite()).toBe(false);
  });

  it('dispatches favoriteCityToggled when favorite button is clicked', async () => {
    await createCard('Paris, France');
    dispatchSpy.mockClear();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card__fav') as HTMLButtonElement;
    btn.click();
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.favoriteCityToggled({ cityLabel: 'Paris, France' }),
    );
  });

  it('does not dispatch favorite toggle when favoriteLabel is null', async () => {
    await createCard(null);
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as { toggleFavorite(): void };
    cmp.toggleFavorite();
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).querySelector('.card__fav')).toBeNull();
  });
});
