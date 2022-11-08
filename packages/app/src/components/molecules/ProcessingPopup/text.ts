import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '진행중',
    [Language.EN_US]: 'In Progress',
  },
  description: {
    [Language.KO_KR]: [
      '데이터 처리중입니다. ',
      '처리가 완료되면 좌측바의 아이콘이 변경됩니다.',
    ],
    [Language.EN_US]: [
      'Processing in progress... ',
      'Once completes, the icon on the left side bar will be changed.',
    ],
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'CONFIRM',
  },
};
