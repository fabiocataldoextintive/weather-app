import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { I18nPipe } from '../../../i18n/i18n.pipe';
import { weatherActions } from '../../../store/weather/weather.actions';
import { weatherFeature } from '../../../store/weather/weather.reducer';
import { favoriteCityKey, type FavoriteCity } from '../../../store/weather/weather.state';

@Component({
  selector: 'app-weather-favorites-list',
  standalone: true,
  imports: [CommonModule, I18nPipe],
  templateUrl: './weather-favorites-list.component.html',
  styleUrl: './weather-favorites-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherFavoritesListComponent {
  private readonly store = inject(Store);

  protected readonly favoritesOrdered = this.store.selectSignal(weatherFeature.selectFavoritesCitiesOrdered);
  protected readonly favoritesCount = this.store.selectSignal(weatherFeature.selectFavoritesCitiesCount);
  protected readonly activeLocationLabel = this.store.selectSignal(weatherFeature.selectActiveLocationLabel);

  protected selectFavorite(favorite: FavoriteCity): void {
    this.store.dispatch(weatherActions.favoriteSelected({ cityLabel: favorite.cityLabel }));
  }

  protected removeFavorite(favorite: FavoriteCity, event: Event): void {
    event.stopPropagation();
    this.store.dispatch(weatherActions.favoriteCityToggled({ cityLabel: favorite.cityLabel }));
  }

  protected isActive(favorite: FavoriteCity): boolean {
    const active = this.activeLocationLabel()?.trim();
    if (!active) return false;
    return favoriteCityKey(active) === favorite.cityLabel;
  }
}
