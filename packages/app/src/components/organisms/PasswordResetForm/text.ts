import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '재설정할 비밀번호를 입력하세요.',
    [Language.EN_US]: 'Please enter your new password.',
  },
  passwordPlaceholder: {
    [Language.KO_KR]: '새 비밀번호',
    [Language.EN_US]: 'New password',
  },
  passwordConfirmPlaceholder: {
    [Language.KO_KR]: '한 번 더 입력하세요',
    [Language.EN_US]: 'Confirm your new password',
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'Submit',
  },
  error: {
    password: {
      required: {
        [Language.KO_KR]: '비밀번호가 비어있습니다.',
        [Language.EN_US]: 'Please enter new password.',
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
        [Language.EN_US]: 'Password should include capital/small letters and numbers.',
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
        [Language.EN_US]: 'Enter password confirmation.',
      },
      equalPassword: {
        [Language.KO_KR]: '비밀번호가 같지 않습니다.',
        [Language.EN_US]: 'The passwords don\'t match.',
      },
    },
  },
};
