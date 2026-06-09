import { toWeatherUserMessage } from './weather-user-message';

describe('toWeatherUserMessage', () => {
  it('maps location-not-found style messages', () => {
    expect(toWeatherUserMessage(new Error('No matching location found'))).toBe(
      'That location could not be found. Try another city.',
    );
    expect(toWeatherUserMessage(new Error('LOCATION invalid'))).toBe(
      'That location could not be found. Try another city.',
    );
  });

  it('rewrites Weather API request failed prefix', () => {
    expect(
      toWeatherUserMessage(new Error('Weather API request failed: bad thing')),
    ).toBe('Weather could not be loaded: bad thing');
  });

  it('returns generic message for other errors', () => {
    expect(toWeatherUserMessage(new Error('something else'))).toBe(
      'Something went wrong. Check your connection and try again.',
    );
    expect(toWeatherUserMessage(new Error('something else'), 'es')).toBe(
      'Algo salió mal. Comprueba la conexión e inténtalo de nuevo.',
    );
  });

  it('handles empty message', () => {
    const e = new Error('');
    e.message = '';
    expect(toWeatherUserMessage(e)).toBe(
      'Something went wrong. Check your connection and try again.',
    );
  });
});
