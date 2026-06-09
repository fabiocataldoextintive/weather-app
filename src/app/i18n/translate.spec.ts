import { translate } from './translate';

describe('translate', () => {
  it('returns English by default', () => {
    expect(translate('dashboard.title', 'en')).toBe('Weather');
  });

  it('returns Spanish catalog entry', () => {
    expect(translate('dashboard.title', 'es')).toBe('Tiempo');
  });

  it('interpolates params', () => {
    expect(translate('table.paginationStatus', 'en', { current: 2, total: 5 })).toBe('Page 2 of 5');
  });
});
