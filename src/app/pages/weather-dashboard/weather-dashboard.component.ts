import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WeatherService } from '../../services/weather/weather.service';
import { CurrentWeatherCardComponent } from '../../components/current-weather-card/current-weather-card.component';
import { SearchLocation } from '../../models/search-location.interface';
import { Root } from '../../models/root.interface';
import { cleanText } from '../../helpers/clean-text';

const MAX_RECENT = 3;
const MIN_QUERY_LEN = 2;

interface RecentWeatherRow {
  key: string;
  label: string;
  root: Root;
}

@Component({
  selector: 'app-weather-dashboard',
  imports: [CommonModule, FormsModule, CurrentWeatherCardComponent],
  templateUrl: './weather-dashboard.component.html',
  styleUrl: './weather-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherDashboardComponent {
  private readonly weather = inject(WeatherService);

  protected readonly searchText = signal('');
  protected readonly suggestions = signal<SearchLocation[]>([]);
  protected readonly showSuggestions = signal(false);
  protected readonly validationMessage = signal<string | null>(null);

  protected readonly loadingWeather = signal(false);
  protected readonly weatherError = signal<string | null>(null);

  /** Rows successful enough to compare in the table (INT-10). */
  protected readonly recentCities = signal<RecentWeatherRow[]>([]);

  /** Which row is highlighted / used when opening detail from table. */
  protected readonly selectedKey = signal<string | null>(null);

  /** Hero detail card source — cleared on failed fetch (INT-6). */
  protected readonly displayRoot = signal<Root | null>(null);

  protected readonly viewMode = signal<'table' | 'detail'>('detail');

  private debounceTimer?: ReturnType<typeof setTimeout>;

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    this.validationMessage.set(null);
    window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => this.runAutocomplete(value), 300);
  }

  private runAutocomplete(raw: string): void {
    const q = raw.trim();
    if (q.length < MIN_QUERY_LEN) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    this.weather.searchLocations(q).subscribe({
      next: (list) => {
        this.suggestions.set(list);
        this.showSuggestions.set(list.length > 0);
      },
      error: () => {
        this.suggestions.set([]);
        this.showSuggestions.set(false);
      },
    });
  }

  protected pickLocation(loc: SearchLocation): void {
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    const q = `${loc.lat},${loc.lon}`;
    const label = cleanText(`${loc.name}, ${loc.country}`);
    this.searchText.set(label);
    this.fetchCurrent(q, label);
  }

  protected onSearchKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.showSuggestions.set(false);
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const list = this.suggestions();
      if (this.showSuggestions() && list.length > 0) {
        this.pickLocation(list[0]);
      }
    }
  }

  private fetchCurrent(q: string, label: string): void {
    this.loadingWeather.set(true);
    this.weatherError.set(null);
    this.weather.getCurrent(q).subscribe({
      next: (root) => {
        this.loadingWeather.set(false);
        this.weatherError.set(null);
        this.displayRoot.set(root);
        this.addRecent(q, label, root);
        this.selectedKey.set(q);
      },
      error: (err: Error) => {
        this.loadingWeather.set(false);
        this.displayRoot.set(null);
        this.weatherError.set(this.toUserMessage(err));
      },
    });
  }

  private addRecent(key: string, label: string, root: Root): void {
    const row: RecentWeatherRow = { key, label, root };
    const prev = this.recentCities().filter((r) => r.key !== key);
    this.recentCities.set([row, ...prev].slice(0, MAX_RECENT));
  }

  protected selectRow(row: RecentWeatherRow): void {
    this.selectedKey.set(row.key);
    this.displayRoot.set(row.root);
    this.weatherError.set(null);
    this.viewMode.set('detail');
  }

  protected setView(mode: 'table' | 'detail'): void {
    this.viewMode.set(mode);
  }

  private toUserMessage(err: Error): string {
    const raw = err.message ?? '';
    if (/location/i.test(raw) || /no matching/i.test(raw)) {
      return 'That location could not be found. Try another city.';
    }
    if (/Weather API request failed/i.test(raw)) {
      return raw.replace(/^Weather API request failed:\s*/i, 'Weather could not be loaded: ');
    }
    return 'Something went wrong. Check your connection and try again.';
  }
}
