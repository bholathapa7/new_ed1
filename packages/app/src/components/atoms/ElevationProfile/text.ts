import { Language } from '^/types';

export default {
  elevationProfile: {
    [Language.KO_KR]: '종횡단면도',
    [Language.EN_US]: 'Elevation Profile',
  },
  outOfBoundary: {
    [Language.KO_KR]: '수치표면모델(DSM) 데이터의 영역에서 벗어나\n일부 종횡단면도와 일부 기울기 정보를 표시할 수 없습니다.',
    [Language.EN_US]: 'Some elevation profiles and slope information couldn\'t be shown outside the area of DSM.',
  },
};
