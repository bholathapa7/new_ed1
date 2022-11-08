import { GeolocationError, Language } from '^/types';

const { PERMISSION }: typeof GeolocationError = GeolocationError;

export default {
  error: {
    default: {
      title: {
        [Language.KO_KR]: '사용자 위치 오류',
        [Language.EN_US]: 'User Location Error',
      },
      description: {
        [Language.KO_KR]: '오류가 발생하였습니다.',
        [Language.EN_US]: 'An error occurred.',
      },
    },
    [PERMISSION]: {
      title: {
        [Language.KO_KR]: '사용자 위치 사용 권한',
        [Language.EN_US]: 'User Location Permission',
      },
      description: {
        [Language.KO_KR]: '설정에서 위치정보 사용을 승인 후 다시 시도해주세요.',
        [Language.EN_US]: 'Please try again after enabling location permission from Settings.',
      },
    },
  },
};
