import { systemLanguage } from './system-language';

describe('systemLanguage', () => {
  it('takes the device’s first language as two letters', () => {
    expect(systemLanguage(['de-AT', 'en'])).toBe('de');
    expect(systemLanguage(['EN-us'])).toBe('en');
  });

  it('falls back to English', () => {
    expect(systemLanguage([])).toBe('en');
  });
});
