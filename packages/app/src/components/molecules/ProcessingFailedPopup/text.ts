import { Language } from '^/types';

/* eslint-disable max-len */
export default {
  title: {
    [Language.KO_KR]: ' 처리 중 실패',
    [Language.EN_US]: ' Processing Failed',
  },
  descriptionPrefix: {
    [Language.KO_KR]: [
      '업로드 하신 ',
    ],
    [Language.EN_US]: [
      'Processing has failed because a problem occurred while processing the uploaded ',
    ],
  },
  description: {
    [Language.KO_KR]: [
      '에 문제가 발생하여 처리에 실패하였습니다. 화면 오른쪽 아래 "지원" 버튼을 클릭하여 문제가 발생한 해당 원본 도면 파일을 첨부해 주세요. 엔젤스윙의 전문가가 실패 원인과 해결 방법에 대해 안내 해드리겠습니다.',
    ],
    [Language.EN_US]: [
      '. Click the Help button on the bottom right of the screen to attach the Design file. Angelswing\'s experts will guide you through the cause of the failure and how to resolve the issue.',
    ],
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'CONFIRM',
  },
};
