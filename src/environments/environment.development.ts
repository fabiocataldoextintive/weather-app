export const environment = {
  production: false,
  weatherApi: {
    baseUrl: 'http://api.weatherapi.com/v1',
    apiKey: process.env.WEATHER_API_KEY ?? '',
  },
};
