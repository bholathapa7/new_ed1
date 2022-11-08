import { Language } from '^/types';

import { projectionSystemLabel } from '^/utilities/coordinate-util';

export default {
  placeholder: {
    [Language.KO_KR]: '사용하고 있는 좌표계를 선택하세요',
    [Language.EN_US]: 'Select a coordinate system',
  },
  errorMessage: {
    [Language.KO_KR]: '* 사용하고 있는 좌표계를 선택해주세요.',
    [Language.EN_US]: '* Please select a coordinate system.',
  },
  options: projectionSystemLabel,
};
