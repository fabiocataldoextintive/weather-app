import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import { cleanText } from '../../helpers/clean-text';
import type { SearchLocation } from '../../models/search-location.interface';
import { weatherActions } from '../../store/weather/weather.actions';
import { weatherFeature } from '../../store/weather/weather.reducer';
import { WeatherDetailPanelComponent } from './weather-detail-panel.component';
import { WeatherResultsTableComponent } from './weather-results-table.component';

@Component({
  selector: 'app-weather-dashboard',
  imports: [CommonModule, FormsModule, WeatherResultsTableComponent, WeatherDetailPanelComponent],
  templateUrl: './weather-dashboard.component.html',
  styleUrl: './weather-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherDashboardComponent {
  private readonly store = inject(Store);

  protected readonly searchText = this.store.selectSignal(weatherFeature.selectSearchText);
  protected readonly suggestions = this.store.selectSignal(weatherFeature.selectSuggestions);
  protected readonly showSuggestions = this.store.selectSignal(weatherFeature.selectShowSuggestions);
  protected readonly validationMessage = this.store.selectSignal(weatherFeature.selectSearchValidationMessage);

  protected readonly currentStatus = this.store.selectSignal(weatherFeature.selectCurrentStatus);
  protected readonly weatherError = this.store.selectSignal(weatherFeature.selectCurrentError);
  protected readonly visualizationMode = this.store.selectSignal(weatherFeature.selectVisualizationMode);

  protected loadingWeather(): boolean {
    return this.currentStatus() === 'loading';
  }

  protected onSearchInput(value: string): void {
    this.store.dispatch(weatherActions.searchInputChanged({ raw: value }));
  }

  protected pickLocation(loc: SearchLocation): void {
    const q = `${loc.lat},${loc.lon}`;
    const label = cleanText(`${loc.name}, ${loc.country}`);
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
}
