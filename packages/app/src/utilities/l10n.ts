/**
 * @module $/utilities/l10n
 * @author Junyoung Clare Jang
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 */
import * as T from '^/types';

export type L10nDictionary = Readonly<Partial<Record<T.Language, string>>>;
export type L10nDictionaryWithArray = Readonly<Partial<Record<T.Language, Array<string>>>>;

/**
 * @desc This function is for internationalization. Receives dictionary containing string.
 */
export function l10n(dict: L10nDictionary, lang: T.Language): string;
/**
 * @desc This function is for internationalization. Receives dictionary containing array of string.
 */
export function l10n(dict: L10nDictionaryWithArray, lang: T.Language): Array<string>;
/**
 * @desc Implementation of function.
 */
export function l10n(dict: L10nDictionary | L10nDictionaryWithArray, lang: T.Language): string | Array<string> {
  const translated: string | Array<string> | undefined = dict[lang];
  const fallback: string | Array<string> | undefined = dict[T.Language.EN_US];

  if (translated !== undefined) {
    return translated;
  } else if (fallback !== undefined) {
    return fallback;
  } else {
    return '';
  }
}

export const changeWordsOrderOnLang: (
  str1: string, str2: string, language: T.Language,
) => string = (
  str1, str2, language,
) => {
  if (language === T.Language.KO_KR) {
    return `${str1} ${str2}`;
  } else {
    return `${str2} ${str1}`;
  }
};
