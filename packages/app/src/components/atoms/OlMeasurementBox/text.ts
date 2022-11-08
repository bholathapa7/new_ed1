import { ContentType, Language } from '^/types';

export default {
  contentKeys: {
    [ContentType.LENGTH]: {
      [Language.KO_KR]: ['거리'],
      [Language.EN_US]: ['Distance'],
    },
    [ContentType.AREA]: {
      [Language.KO_KR]: ['면적'],
      [Language.EN_US]: ['Area'],
    },
    [ContentType.MARKER]: {
      [Language.KO_KR]: ['Y, X', '고도'],
      [Language.EN_US]: ['Y, X', 'Elev'],
    },
    [ContentType.VOLUME]: {
      [Language.KO_KR]: ['절토량', '성토량', '전체량'],
      [Language.EN_US]: ['Cut', 'Fill', 'Total'],
    },
  },
};
