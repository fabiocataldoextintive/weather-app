import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { WeatherService } from './core/weather/weather.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weather-app');

  private readonly weather = inject(WeatherService);

  constructor() {
    this.weather.getCurrent('Córdoba', 'es').subscribe({
      next: (data) => console.log(data),
      error: (err) => console.log(err),
    });
  }
}
