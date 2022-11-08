import { Language } from '^/types';

export default {
  description: {
    [Language.KO_KR]: '회원 가입이 완료되었습니다. 튜토리얼로 5분만에 플랫폼 사용법을 익혀보세요.' +
      ' 혹은 곧바로 로그인하셔서 사용해보세요.',
    [Language.EN_US]: 'Sign up Complete.' +
      ' Go to the tutorial and learn how to use our service in 5 minutes.' +
      ' Or simply sign in and enjoy our service.',
  },
  tutorial: {
    text: {
      [Language.KO_KR]: '튜토리얼',
      [Language.EN_US]: 'Tutorial',
    },
  },
  login: {
    [Language.KO_KR]: '로그인',
    [Language.EN_US]: 'SIGN IN',
  },
};
