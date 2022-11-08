import { Language } from '^/types';

export default {
  description: {
    [Language.KO_KR]: '위 이메일로 비밀번호 재설정 링크를 발송하였습니다.' +
      ' 10분 이내에 메일이 오지 않는 경우에는 다음 이메일로 문의해주세요.',
    [Language.EN_US]: 'Check your inbox for a link to reset your password.' +
      ' If it does not appear within a few minutes, check your spam folder or contact',
  },
  login: {
    [Language.KO_KR]: '로그인 하러 가기',
    [Language.EN_US]: 'Return to sign in',
  },
};
