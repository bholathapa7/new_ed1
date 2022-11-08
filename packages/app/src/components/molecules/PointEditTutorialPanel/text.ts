import { Language } from '^/types';

export default {
  addPoint: {
    heading: {
      [Language.KO_KR]: '포인트 추가',
      [Language.EN_US]: 'Add a point',
    },
    explanation: {
      [Language.KO_KR]: '십자 아이콘을 드래그하여 점과 점 사이에 새로운 포인트를 추가하세요.',
      [Language.EN_US]: 'Drag the point with plus mark to add a new point in between.',
    },
  },
  deletePoint: {
    heading: {
      [Language.KO_KR]: '포인트 삭제',
      [Language.EN_US]: 'Delete a point',
    },
    explanation: {
      [Language.KO_KR]: '삭제하기 원하는 포인트를 클릭하고 백스페이스 키를 눌러 삭제하세요.',
      [Language.EN_US]: 'Click the point and press backspace key to delete a point.',
    },
  },
  checkboxMessage: {
    [Language.KO_KR]: '더 이상 이 창을 열지 않습니다',
    [Language.EN_US]: 'Dismiss',
  },
};
