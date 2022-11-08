import { HTTPError, Language } from '^/types';

export default {
  autoLogin: {
    [Language.KO_KR]: '자동로그인',
    [Language.EN_US]: 'Remember me',
  },
  findPassword: {
    [Language.KO_KR]: '비밀번호 찾기',
    [Language.EN_US]: 'Forgot password?',
  },
  login: {
    [Language.KO_KR]: '로그인',
    [Language.EN_US]: 'Sign in',
  },
  signup: {
    [Language.KO_KR]: '회원가입하기',
    [Language.EN_US]: 'Sign up',
  },
  error: {
    invalid: {
      [Language.KO_KR]: '아이디가 등록되지 않았거나, 아이디 또는 비밀번호를 잘못 입력하셨습니다.',
      [Language.EN_US]: 'Invalid username or password.',
    },
    email: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
      pattern: {
        [Language.KO_KR]: '이메일 형식을 확인하세요.',
        [Language.EN_US]: 'Please try again with a correct email address.',
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
    password: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
      minLength: {
        [Language.KO_KR]: '비밀번호는 6자 이상이어야 합니다.',
        [Language.EN_US]: 'Short passwords are easy to guess. Try one with at least 6 characters.',
      },
      maxLength: {
        [Language.KO_KR]: '비밀번호는 22자 이하여야 합니다.',
        [Language.EN_US]: 'Password should be less than 22 characters.',
      },
      pattern: {
        [Language.KO_KR]: '비밀번호는 대/소문자와 숫자를 포함해야 합니다.',
        [Language.EN_US]: 'Password should include capital letters and numbers.',
      },
      validCharacter: {
        [Language.KO_KR]: '비밀번호는 영문 대/소문자, 숫자, 간단한 특수문자(!@#$%^&* 등)만을 포함해야합니다.',
        [Language.EN_US]:
          'Password can only include capital/small letters, numbers, and simple symbols(!@$%^&*).',
      },
    },
    [HTTPError.CLIENT_UNAUTHORIZED_ERROR]: {
      [Language.KO_KR]: '소속 회사의 링크로 접속하시거나, 엔젤스윙 기본 플랫폼으로 로그인해주세요.',
      [Language.EN_US]: 'Please login using a registered company portal or the default Angelswing portal.',
    },
    [HTTPError.SERVER_ERROR]: {
      [Language.KO_KR]: '서버에 문제가 있습니다. 반복해서 문제가 발생할 경우 고객센터로 연락해주세요.' +
        ' E. support@angelswing.io | T. 070-8098-1040',
      [Language.EN_US]:
        'Looks like there is a problem with our server.' +
        ' If the problem continues, please contact to our customer support.' +
        ' E. support@angelswing.io | T. +82 70-8098-1040',
    },
    [HTTPError.CLIENT_OUTDATED_ERROR]: {
      [Language.KO_KR]: '클라이언트 버전 업데이트가 필요합니다. 페이지를 새로 고침해 주세요',
      [Language.EN_US]: 'Client version update required. Please refresh page.',
    },
    [HTTPError.UNKNOWN_ERROR]: {
      [Language.KO_KR]: '인터넷의 상태가 좋지 않습니다.',
      [Language.EN_US]:
        'Looks like there is a problem with the connection. Please check your network status.',
    },
  },
};
