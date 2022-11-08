import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '전경 사진 업로드 실패',
    [Language.EN_US]: 'Photos upload failed',
  },
  description: {
    error: {
      [Language.KO_KR]: '전경 사진 업로드 중 오류가 발생했습니다.',
      [Language.EN_US]: 'Failed to upload photos.',
    },
    solution: {
      [Language.KO_KR]: '업로드 권한이 없는지, 또는 파일이 올바른지 확인해주십시오.',
      [Language.EN_US]: 'Please check if you are authorized to upload or the file is correct.',
    },
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'Close',
  },
};
