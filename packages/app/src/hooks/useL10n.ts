import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import * as T from '^/types';
import { L10nDictionary, L10nDictionaryWithArray } from '^/utilities/l10n';

export interface L10nFn {
  (dict: L10nDictionary): string;
  (dict: L10nDictionaryWithArray): Array<string>;
}

const createL10n: (lang: T.Language) => L10nFn = (lang) => {
  function l10n(dict: L10nDictionary): string;
  function l10n(dict: L10nDictionaryWithArray): Array<string>;
  /**
   * @desc This function is for internationalization.
   * @todo
   * This is duplicate code with utilities/l10n.
   * Becuase if you call l10n function in new overloaded function,
   * it occured type error. So please change this if there's other way.
   */
  function l10n(dict: L10nDictionary | L10nDictionaryWithArray): string | Array<string> {
    if (!dict) return '';
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

  return l10n;
};

export type UseL10n = [L10nFn, T.Language];
/**
 * @desc
 * Provide l10n function & language in Redux State.
 */
export const useL10n: () => UseL10n = () => {
  const lang: T.Language = useSelector((state: T.State) => state.Pages.Common.language);

  const memoizedL10n: L10nFn = useMemo(() => createL10n(lang), [lang]);

  return [memoizedL10n, lang];
};
