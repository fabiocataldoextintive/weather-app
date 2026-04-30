/** WeatherAPI `search.json` item — see https://www.weatherapi.com/docs/ */
export interface SearchLocation {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}
