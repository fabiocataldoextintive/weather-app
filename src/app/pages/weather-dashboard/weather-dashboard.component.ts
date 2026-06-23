import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { parseOfflinePick } from '../../helpers/search-stored-cities';
import type { AppLocale } from '../../i18n/app-locale';
import { I18nPipe } from '../../i18n/i18n.pipe';
import type { SearchLocation } from '../../models/search-location.interface';
import { weatherActions } from '../../store/weather/weather.actions';
import { weatherFeature } from '../../store/weather/weather.reducer';
import {
  WEATHER_UPDATE_INTERVAL_OPTIONS,
  type WeatherUpdateIntervalMs,
} from '../../store/weather/weather-update-interval';
import { ConnectivityService } from '../../services/connectivity/connectivity.service';
import { WeatherDetailPanelComponent } from './weather-detail-panel/weather-detail-panel.component';
import { WeatherFavoritesListComponent } from './weather-favorites-list/weather-favorites-list.component';
import { WeatherResultsTableComponent } from './weather-results-table/weather-results-table.component';

@Component({
  selector: 'app-weather-dashboard',
  imports: [CommonModule, FormsModule, I18nPipe, WeatherResultsTableComponent, WeatherDetailPanelComponent, WeatherFavoritesListComponent],
  templateUrl: './weather-dashboard.component.html',
  styleUrl: './weather-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherDashboardComponent {
  private readonly store = inject(Store);
  private readonly connectivity = inject(ConnectivityService);

  protected readonly isOnline = this.connectivity.isOnline;

  protected readonly searchText = this.store.selectSignal(weatherFeature.selectSearchText);
  protected readonly suggestions = this.store.selectSignal(weatherFeature.selectSuggestions);
  protected readonly showSuggestions = this.store.selectSignal(weatherFeature.selectShowSuggestions);
  protected readonly validationMessage = this.store.selectSignal(weatherFeature.selectSearchValidationMessage);

  protected readonly currentStatus = this.store.selectSignal(weatherFeature.selectCurrentStatus);
  protected readonly weatherError = this.store.selectSignal(weatherFeature.selectCurrentError);
  protected readonly visualizationMode = this.store.selectSignal(weatherFeature.selectVisualizationMode);
  protected readonly locale = this.store.selectSignal(weatherFeature.selectLocale);
  protected readonly weatherUpdateInterval = this.store.selectSignal(
    weatherFeature.selectWeatherUpdateTimeInterval,
  );
  protected readonly intervalOptions = WEATHER_UPDATE_INTERVAL_OPTIONS;

  protected loadingWeather(): boolean {
    return this.currentStatus() === 'loading';
  }

  protected onSearchInput(value: string): void {
    this.store.dispatch(weatherActions.searchInputChanged({ raw: value }));
  }

  protected pickLocation(loc: SearchLocation): void {
    const offlineQ = parseOfflinePick(loc.url);
    const q = offlineQ ?? `${loc.lat},${loc.lon}`;
    const label = loc.country ? `${loc.name}, ${loc.country}` : loc.name;
    this.store.dispatch(weatherActions.suggestionPicked({ q, label }));
  }

  protected onSearchKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.store.dispatch(weatherActions.dismissSuggestions());
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const list = this.suggestions();
      if (this.showSuggestions() && list.length > 0) {
        this.pickLocation(list[0]);
      }
    }
  }

  protected setView(mode: 'table' | 'detailed'): void {
    this.store.dispatch(weatherActions.visualizationModeChanged({ mode }));
  }

  protected setLocale(locale: AppLocale): void {
    if (this.locale() === locale) return;
    this.store.dispatch(weatherActions.localeChanged({ locale }));
  }

  protected setUpdateInterval(intervalMs: WeatherUpdateIntervalMs): void {
    if (this.weatherUpdateInterval() === intervalMs) return;
    this.store.dispatch(weatherActions.weatherUpdateIntervalChanged({ intervalMs }));
  }
}
