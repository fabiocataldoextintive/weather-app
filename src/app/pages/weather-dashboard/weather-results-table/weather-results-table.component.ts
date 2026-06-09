import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { I18nPipe } from '../../../i18n/i18n.pipe';
import { weatherActions } from '../../../store/weather/weather.actions';
import { weatherFeature } from '../../../store/weather/weather.reducer';
import { RECENT_CITIES_PAGE_SIZE, RecentCity } from '../../../store/weather/weather.state';


@Component({
  selector: 'app-weather-results-table',
  standalone: true,
  imports: [CommonModule, I18nPipe],
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

  protected readonly currentPage = signal(0);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.recentCitiesCount() / RECENT_CITIES_PAGE_SIZE)),
  );

  protected readonly pagedRows = computed(() => {
    const start = this.currentPage() * RECENT_CITIES_PAGE_SIZE;
    return this.recentCitiesOrdered().slice(start, start + RECENT_CITIES_PAGE_SIZE);
  });

  protected readonly showPagination = computed(
    () => this.recentCitiesCount() > RECENT_CITIES_PAGE_SIZE,
  );

  protected loadingWeather(): boolean {
    return this.currentStatus() === 'loading';
  }

  protected selectRow(row: RecentCity): void {
    this.store.dispatch(weatherActions.recentRowSelected({ key: row.key }));
  }

  protected goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(0, page - 1));
  }

  protected goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages() - 1, page + 1));
  }
}
