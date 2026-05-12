import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Store } from '@ngrx/store';

import { Root } from '../../models/root.interface';
import { weatherActions } from '../../store/weather/weather.actions';
import { weatherFeature } from '../../store/weather/weather.reducer';
import { favoriteCityKey } from '../../store/weather/weather.state';

@Component({
  selector: 'app-current-weather-card',
  imports: [DecimalPipe],
  templateUrl: './current-weather-card.component.html',
  styleUrl: './current-weather-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentWeatherCardComponent {
  private readonly store = inject(Store);

  readonly root = input.required<Root>();
  readonly favoriteLabel = input<string | null>(null);

  private readonly favoritesCities = this.store.selectSignal(weatherFeature.selectFavoritesCities);

  protected readonly isFavorite = computed(() => {
    const label = this.favoriteLabel()?.trim();
    if (!label) return false;
    const k = favoriteCityKey(label);
    return this.favoritesCities()[k] !== undefined;
  });

  protected readonly iconSrc = computed(() => {
    const icon = this.root().current.condition.icon;
    if (!icon) return '';
    return icon.startsWith('//') ? `https:${icon}` : icon;
  });

  protected readonly titleLine = computed(() => {
    const loc = this.root().location;
    return `${loc.name}${loc.region ? ', ' + loc.region : ''}, ${loc.country}`;
  });

  protected toggleFavorite(): void {
    const label = this.favoriteLabel()?.trim();
    if (!label) return;
    this.store.dispatch(weatherActions.favoriteCityToggled({ cityLabel: label }));
  }
}
