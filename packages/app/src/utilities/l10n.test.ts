import * as T from '^/types';

import { l10n } from './l10n';

describe('l10n', () => {
  it('should return empty string when there is no text for specified language, and even for fallback language', () => {
    expect(l10n({}, T.Language.KO_KR)).toBe('');
  });

  it('should return fallback language (EN_US) string when there is no text for specified language', () => {
    expect(l10n({
      [T.Language.EN_US]: 'English',
    }, T.Language.KO_KR)).toBe('English');
  });

  it('should return text for specified language if it exists', () => {
    expect(l10n({
      [T.Language.EN_US]: 'Some Text',
      [T.Language.KO_KR]: '한글 문장',
    }, T.Language.KO_KR)).toBe('한글 문장');
  });

  it('should return array of texts for specified language if it exists', () => {
    expect(l10n({
      [T.Language.EN_US]: ['Some Text1', 'Some Text2'],
      [T.Language.KO_KR]: ['한글 문장1', '한글 문장2'],
    }, T.Language.EN_US)).toEqual(['Some Text1', 'Some Text2']);
  });
});
