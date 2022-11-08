import { Language } from '^/types';

export default {
  description: {
    [Language.KO_KR]:
      '가입시 등록했던 이메일을 입력해주세요.' + ' ' +
      '이메일로 발송된 링크를 통해 패스워드를 재설정할 수 있습니다.',
    [Language.EN_US]:
      'Enter your email account that you registered.' + ' ' +
      'We\'ll send you an e-mail to reset your password.',
  },
  emailPlaceholder: {
    [Language.KO_KR]: '이메일을 입력하세요',
    [Language.EN_US]: 'Enter your email address',
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'Submit',
  },
  error: {
    email: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
      pattern: {
        [Language.KO_KR]: '이메일 형식을 확인하세요.',
        [Language.EN_US]: 'Please enter a vaild email address.',
      },
      existed: {
        [Language.KO_KR]: '이미 존재하는 계정입니다.',
        [Language.EN_US]: 'The account already exists.',
      },
      error: {
        [Language.KO_KR]: '서버에서 에러가 발생했습니다. 반복해서 문제가 발생할 경우 고객센터로 연락주세요.',
        [Language.EN_US]:
          'Something went wrong in the server...' +
          'If the problem continues, please contact to our customer support',
      },
    },
  },
};
