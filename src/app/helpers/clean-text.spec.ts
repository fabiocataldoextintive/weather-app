import { cleanText } from './clean-text';

describe('cleanText', () => {
  it('lowercases, strips accents, and keeps comma', () => {
    expect(cleanText('  São Paulo, BR!  ')).toBe('sao paulo, br');
  });

  it('collapses whitespace', () => {
    expect(cleanText('a   b\tc')).toBe('a b c');
  });

  it('returns empty for punctuation-only', () => {
    expect(cleanText('!!!')).toBe('');
  });
});
