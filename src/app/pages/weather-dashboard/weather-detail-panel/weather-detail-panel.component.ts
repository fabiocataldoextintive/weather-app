import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { CurrentWeatherCardComponent } from '../../../components/current-weather-card/current-weather-card.component';
import { weatherFeature } from '../../../store/weather/weather.reducer';

@Component({
  selector: 'app-weather-detail-panel',
  standalone: true,
  imports: [CommonModule, CurrentWeatherCardComponent],
  templateUrl: './weather-detail-panel.component.html',
  styleUrl: './weather-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherDetailPanelComponent {
  private readonly store = inject(Store);

  protected readonly displayRoot = this.store.selectSignal(weatherFeature.selectCurrentWeather);
  protected readonly activeLocationLabel = this.store.selectSignal(weatherFeature.selectActiveLocationLabel);
  protected readonly currentStatus = this.store.selectSignal(weatherFeature.selectCurrentStatus);
  protected readonly weatherError = this.store.selectSignal(weatherFeature.selectCurrentError);
  protected readonly validationMessage = this.store.selectSignal(weatherFeature.selectSearchValidationMessage);

  protected loadingWeather(): boolean {
    return this.currentStatus() === 'loading';
  }
}
