import { Language } from '^/types';

export const TEXT_ORGANIZATION_PRESET: string = '{organization}';
export const TEXT_NAME_PRESET: string = '{name}';

export default {
  title: {
    [Language.KO_KR]: `안녕하세요, ${TEXT_ORGANIZATION_PRESET} ${TEXT_NAME_PRESET}님`,
    [Language.EN_US]: `Hello, ${TEXT_NAME_PRESET} from ${TEXT_ORGANIZATION_PRESET}`,
  },
  description: {
    [Language.KO_KR]: '엔젤스윙의 플랫폼을 더욱 잘 활용하기 위한 방법',
    [Language.EN_US]: 'How to better utilize our platform',
  },
  important: {
    [Language.KO_KR]: '지금 바로 사용자 매뉴얼을 읽어보세요.',
    [Language.EN_US]: 'Read the user manual.',
  },
  essImportant: {
    [Language.KO_KR]: '지금 바로 유저 가이드를 읽어보세요.',
    [Language.EN_US]: 'Read the user guide.',
  },
  download: {
    [Language.KO_KR]: '사용자 매뉴얼 다운로드',
    [Language.EN_US]: 'Download User Manual',
  },
  essGuide: {
    [Language.KO_KR]: '유저 가이드 확인하기',
    [Language.EN_US]: 'Read User Guide',
  },
  checkboxText: {
    [Language.KO_KR]: '다음 로그인부터 이 팝업을 보지 않습니다.',
    [Language.EN_US]: 'Dismiss',
  },
  close: {
    [Language.KO_KR]: '닫기',
    [Language.EN_US]: 'Close',
  },
};
