import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { weatherActions } from '../../store/weather/weather.actions';
import { weatherFeature } from '../../store/weather/weather.reducer';
import type { RecentCity } from '../../store/weather/weather.state';

@Component({
  selector: 'app-weather-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-results-table.component.html',
  styleUrl: './weather-results-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherResultsTableComponent {
  private readonly store = inject(Store);

  protected readonly recentCitiesOrdered = this.store.selectSignal(weatherFeature.selectRecentCitiesOrdered);
  protected readonly recentCitiesCount = this.store.selectSignal(weatherFeature.selectRecentCitiesCount);
  protected readonly selectedKey = this.store.selectSignal(weatherFeature.selectSelectedKey);
  protected readonly currentStatus = this.store.selectSignal(weatherFeature.selectCurrentStatus);

  protected loadingWeather(): boolean {
    return this.currentStatus() === 'loading';
  }

  protected selectRow(row: RecentCity): void {
    this.store.dispatch(weatherActions.recentRowSelected({ key: row.key }));
  }
}
