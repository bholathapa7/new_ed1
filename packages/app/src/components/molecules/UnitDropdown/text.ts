import { Language } from '^/types';

import { unitLabel } from '^/utilities/imperial-unit';

export default {
  placeholder: {
    [Language.KO_KR]: '사용하고 있는 단위를 선택해주세요',
    [Language.EN_US]: 'Please select the unit system used',
  },
  errorMessage: {
    [Language.KO_KR]: '* 사용하고 있는 단위를 선택해주세요.',
    [Language.EN_US]: '* Please select the unit system used.',
  },
  options: {
    ...unitLabel,
  },
};
