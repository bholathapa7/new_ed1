import { Language } from '^/types';

import { projectionSystemLabel } from '^/utilities/coordinate-util';

export default {
  placeholder: {
    [Language.KO_KR]: '사용하고 있는 좌표계를 선택하세요',
    [Language.EN_US]: 'Please select',
  },
  errorMessage: {
    [Language.KO_KR]: '* 사용하고 있는 좌표계를 선택해주세요.',
    [Language.EN_US]: '* Please select the coordinate system used.',
  },
  options: {
    NA: {
      [Language.KO_KR]: '좌표계 정보를 모릅니다.',
      [Language.EN_US]: 'I am not sure what coordinate system was used.',
    },
    ...projectionSystemLabel,
  },
};
