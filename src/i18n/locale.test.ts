import { describe, expect, it } from '@jest/globals';

import { formattingLocale, resolveLanguage } from './locale';

describe('locale', () => {
  it('uses the preferred language first', () => {
    expect(resolveLanguage('en', { languageCode: 'fr', regionCode: 'CH' })).toBe('en');
  });

  it('follows the device language when supported, else English', () => {
    expect(resolveLanguage(null, { languageCode: 'fr', regionCode: 'CH' })).toBe('fr');
    expect(resolveLanguage(null, { languageCode: 'de', regionCode: 'CH' })).toBe('en');
    expect(resolveLanguage(null, undefined)).toBe('en');
  });

  it('formats numbers with the app language and the device region', () => {
    expect(formattingLocale('fr', { languageCode: 'de', regionCode: 'CH' })).toBe('fr-CH');
    expect(formattingLocale('en', { languageCode: 'en', regionCode: null })).toBe('en');
  });
});
