import { locationDisplayLabel } from './location-display-label';

describe('locationDisplayLabel', () => {
  it('joins name, region, and country', () => {
    expect(locationDisplayLabel('Cordoba', 'Cordoba', 'Argentina')).toBe('Cordoba, Cordoba, Argentina');
  });

  it('skips empty region', () => {
    expect(locationDisplayLabel('Test City', '', 'TC')).toBe('Test City, TC');
  });

  it('trims whitespace from parts', () => {
    expect(locationDisplayLabel(' Paris ', ' Ile-de-France ', ' France ')).toBe('Paris, Ile-de-France, France');
  });
});
