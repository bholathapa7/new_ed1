import { Language } from '^/types';

export default {
  hide: {
    [Language.KO_KR]: '다시 보지 않음',
    [Language.EN_US]: 'Do not show again',
  },
  detail: {
    [Language.KO_KR]: '더 알아보기',
    [Language.EN_US]: 'Learn more',
  },
  title: (version: string) => ({
    [Language.KO_KR]: `플랫폼 ${version} 업데이트`,
    [Language.EN_US]: `Platform ${version} Update`,
  }),
  update: (version: string) => ({
    [Language.KO_KR]: `플랫폼이 ${version}으로 업데이트되었습니다.`,
    [Language.EN_US]: `Platform has been updated to ${version}`,
  }),
  clickHere: {
    [Language.KO_KR]: '상세 업데이트 정보를 확인해보세요.',
    [Language.EN_US]: 'Check out the detailed update information.',
  },
};
