import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { mockWeatherRoot } from '../../store/weather/weather-test-fixtures';
import { weatherActions } from '../../store/weather/weather.actions';
import { favoriteCityKey, initialWeatherState } from '../../store/weather/weather.state';
import { CurrentWeatherCardComponent } from './current-weather-card.component';

describe('CurrentWeatherCardComponent', () => {
  let fixture: ComponentFixture<CurrentWeatherCardComponent>;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  const baseRoot = mockWeatherRoot();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentWeatherCardComponent],
      providers: [
        provideMockStore({
          initialState: { weather: initialWeatherState },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(CurrentWeatherCardComponent);
  });

  function setInputs(root = baseRoot, favoriteLabel: string | null = null): void {
    fixture.componentRef.setInput('root', root);
    fixture.componentRef.setInput('favoriteLabel', favoriteLabel);
    fixture.detectChanges();
  }

  it('should create', () => {
    setInputs();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('titleLine includes region when present', () => {
    const root = mockWeatherRoot({
      location: { ...baseRoot.location, name: 'X', region: 'R', country: 'C' },
    });
    setInputs(root);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card__title')?.textContent).toContain('X, R, C');
  });

  it('titleLine omits region when empty', () => {
    const root = mockWeatherRoot({
      location: { ...baseRoot.location, name: 'Y', region: '', country: 'Z' },
    });
    setInputs(root);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.card__title')?.textContent).toContain('Y, Z');
    expect(el.querySelector('.card__title')?.textContent).not.toContain(', ,');
  });

  it('iconSrc prefixes protocol-relative URLs', () => {
    const root = mockWeatherRoot({
      current: {
        ...baseRoot.current,
        condition: { ...baseRoot.current.condition, icon: '//cdn.example.com/i.png' },
      },
    });
    setInputs(root);
    const img = (fixture.nativeElement as HTMLElement).querySelector('.card__icon') as HTMLImageElement | null;
    expect(img?.src).toBe('https://cdn.example.com/i.png');
  });

  it('iconSrc uses absolute icon URL as-is', () => {
    const root = mockWeatherRoot({
      current: {
        ...baseRoot.current,
        condition: { ...baseRoot.current.condition, icon: 'https://x/y.png' },
      },
    });
    setInputs(root);
    const img = (fixture.nativeElement as HTMLElement).querySelector('.card__icon') as HTMLImageElement | null;
    expect(img?.src).toBe('https://x/y.png');
  });

  it('does not render icon when condition.icon is empty', () => {
    const root = mockWeatherRoot({
      current: {
        ...baseRoot.current,
        condition: { ...baseRoot.current.condition, icon: '' },
      },
    });
    setInputs(root);
    expect((fixture.nativeElement as HTMLElement).querySelector('.card__icon')).toBeNull();
  });

  it('toggleFavorite dispatches when label present and favorite is toggled', () => {
    setInputs(baseRoot, '  My City  ');
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card__fav');
    expect(btn).toBeTruthy();
    btn?.dispatchEvent(new Event('click'));
    expect(dispatchSpy).toHaveBeenCalledWith(
      weatherActions.favoriteCityToggled({ cityLabel: 'My City' }),
    );
  });

  it('toggleFavorite no-op when favoriteLabel blank', () => {
    setInputs(baseRoot, '   ');
    dispatchSpy.mockClear();
    const cmp = fixture.componentInstance as unknown as { toggleFavorite(): void };
    cmp.toggleFavorite();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('favorite button reflects store favorites', () => {
    const label = 'Boston, US';
    const fk = favoriteCityKey(label);
    store.setState({
      weather: {
        ...initialWeatherState,
        favoritesCities: { [fk]: { cityLabel: fk } },
      },
    });
    setInputs(baseRoot, label);
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.card__fav');
    expect(btn?.textContent?.trim()).toBe('★');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
  });
});
