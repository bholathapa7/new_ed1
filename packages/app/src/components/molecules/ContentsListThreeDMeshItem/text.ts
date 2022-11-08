import { generalErrorDescription } from '^/hooks';
import { Language } from '^/types';

export default {
  firstBalloonTitle: {
    [Language.KO_KR]: '불투명도',
    [Language.EN_US]: 'Opacity',
  },
  fallback: {
    content: {
      title: {
        [Language.KO_KR]: '3D 메쉬 데이터에 오류가 발생했습니다.',
        [Language.EN_US]: 'Error has occurred in 3D Mesh.',
      },
      description: generalErrorDescription,
    },
  },
};
