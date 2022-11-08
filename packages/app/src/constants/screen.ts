import * as T from '^/types';
import { L10nDictionary } from '^/utilities/l10n';

export const defaultScreenMap: {[key in T.Screen['title']]: L10nDictionary } = {
  title: {
    [T.Language.KO_KR]: '새 데이터 세트',
    [T.Language.EN_US]: 'New data set',
  },
};
