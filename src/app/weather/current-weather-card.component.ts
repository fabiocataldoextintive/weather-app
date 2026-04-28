import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { Root } from '../core/weather/models/root.interface';

@Component({
  selector: 'app-current-weather-card',
  imports: [DecimalPipe],
  templateUrl: './current-weather-card.component.html',
  styleUrl: './current-weather-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentWeatherCardComponent {
  readonly root = input.required<Root>();

  protected readonly iconSrc = computed(() => {
    const icon = this.root().current.condition.icon;
    if (!icon) return '';
    return icon.startsWith('//') ? `https:${icon}` : icon;
  });

  protected readonly titleLine = computed(() => {
    const loc = this.root().location;
    return `${loc.name}${loc.region ? ', ' + loc.region : ''}, ${loc.country}`;
  });
}
