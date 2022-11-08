import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '내 정보 수정하기',
    [Language.EN_US]: 'Update My Info',
  },
  description: {
    [Language.KO_KR]: '계정의 현재 비밀번호를 입력해주세요.',
    [Language.EN_US]: 'Please enter your current password.',
  },
  error: {
    client: {
      [Language.KO_KR]: '비밀번호가 올바르지 않습니다.',
      [Language.EN_US]: 'Password is incorrect.',
    },
    client_auth: {
      [Language.KO_KR]: '비밀번호가 올바르지 않습니다.',
      [Language.EN_US]: 'Password is incorrect.',
    },
    server: {
      [Language.KO_KR]: '서버에서 에러가 발생했습니다. 반복해서 문제가 발생할 경우 고객센터로 연락해주세요.',
      [Language.EN_US]: 'Error occured on server. Please refresh(F5) the page. If the problem continues, please contact us at help@angelswing.io',
    },
    unknown: {
      [Language.KO_KR]: '알 수 없는 에러가 발생했습니다. 반복해서 문제가 발생할 경우 고객센터로 연락해주세요.',
      [Language.EN_US]: 'Unknown error occured. Please refresh(F5) the page. If the problem continues, please contact us at help@angelswing.io',
    },
  },
  save: {
    [Language.KO_KR]: '저장',
    [Language.EN_US]: 'Save',
  },
  password: {
    label: {
      [Language.KO_KR]: '현재 비밀번호',
      [Language.EN_US]: 'Current Password',
    },
    placeholder: {
      [Language.KO_KR]: '비밀번호를 입력하세요',
      [Language.EN_US]: 'Enter your password',
    },
  },
};
