import * as T from '^/types';
import { L10nDictionary } from '^/utilities/l10n';

export const volumeAlgorithmLabel: Record<T.BasicCalcBasePlane, L10nDictionary> = {
  [T.BasicCalcBasePlane.LOWEST_POINT]: {
    [T.Language.KO_KR]: '최저점 기준',
    [T.Language.EN_US]: 'Lowest Point',
  },
  [T.BasicCalcBasePlane.HIGHEST_POINT]: {
    [T.Language.KO_KR]: '최고점 기준',
    [T.Language.EN_US]: 'Highest Point',
  },
  [T.BasicCalcBasePlane.AVERAGE]: {
    [T.Language.EN_US]: 'Average',
    [T.Language.KO_KR]: '평균점 기준',
  },
  [T.BasicCalcBasePlane.TRIANGULATED]: {
    [T.Language.EN_US]: 'Triangulation',
    [T.Language.KO_KR]: '삼각분할',
  },
  [T.BasicCalcBasePlane.CUSTOM]: {
    [T.Language.EN_US]: 'Custom Elevation',
    [T.Language.KO_KR]: '사용자 지정 고도',
  },
};
