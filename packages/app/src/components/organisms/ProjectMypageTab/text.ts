import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '내 정보 관리',
    [Language.EN_US]: 'My Page',
  },
  error: {
    password: {
      required: {
        [Language.KO_KR]: '비밀번호가 비어있습니다.',
        [Language.EN_US]: 'Please enter your password.',
      },
      minLength: {
        [Language.KO_KR]: '비밀번호는 6자 이상이어야 합니다.',
        [Language.EN_US]: 'Password may be compromised. Try one with at least 6 characters.',
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
        [Language.KO_KR]: '비밀번호 확인이 비어있습니다.',
        [Language.EN_US]: 'Password confirmation is empty.',
      },
      equalPassword: {
        [Language.KO_KR]: '비밀번호가 같지 않습니다.',
        [Language.EN_US]: 'Passwords don\'t match.',
      },
    },
    organization: {
      required: {
        [Language.KO_KR]: '소속 기관이 비어있습니다.',
        [Language.EN_US]: 'Please enter the name of your organization.',
      },
    },
    contactNumber: {
      required: {
        [Language.KO_KR]: '전화번호가 비어있습니다.',
        [Language.EN_US]: 'Please enter your phone number.',
      },
    },
  },
  save: {
    [Language.KO_KR]: '저장',
    [Language.EN_US]: 'Save',
  },
};
