import { Language } from '^/types';

export default {
  submit: {
    [Language.KO_KR]: '회원가입',
    [Language.EN_US]: 'SIGN UP',
  },
  error: {
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
        [Language.KO_KR]: '이미 존재하는 계정입니다',
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
    passwordConfirmation: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
      equalPassword: {
        [Language.KO_KR]: '비밀번호가 같지 않습니다.',
        [Language.EN_US]: 'These passwords don\'t match. Try again?',
      },
    },
    firstName: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    lastName: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    organization: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    contactNumber: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    country: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    purpose: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    language: {
      required: {
        [Language.KO_KR]: '필수 입력 사항입니다.',
        [Language.EN_US]: 'Required',
      },
    },
    eula: {
      required: {
        [Language.KO_KR]: '체크박스를 눌러 위의 내용에 동의해주세요.',
        [Language.EN_US]: 'Please agree with Terms and Conditions & Privacy Policy',
      },
    },
  },
  checkBoxLabelParts: [
    {
      [Language.EN_US]: 'By signing up, I agree to the ',
      [Language.KO_KR]: '엔젤스윙 ',
    },
    {
      [Language.EN_US]: 'Terms and Conditions',
      [Language.KO_KR]: '이용약관',
    },
    {
      [Language.EN_US]: ' & ',
      [Language.KO_KR]: ' 및 ',
    },
    {
      [Language.EN_US]: 'Privacy Policy',
      [Language.KO_KR]: '개인정보 처리방침',
    },
    {
      [Language.EN_US]: '.',
      [Language.KO_KR]: '에 동의합니다.',
    },
  ],
};
