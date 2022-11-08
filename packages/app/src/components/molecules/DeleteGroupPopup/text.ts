import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '그룹 삭제하기',
    [Language.EN_US]: 'Delete Group',
  },
  button: {
    delete: {
      [Language.KO_KR]: '삭제',
      [Language.EN_US]: 'Delete',
    },
    confirm: {
      [Language.KO_KR]: '확인',
      [Language.EN_US]: 'Confirm',
    },
  },
  description: {
    first: {
      [Language.KO_KR]: '삭제하기',
      [Language.EN_US]: 'Delete',
    },
    second: {
      [Language.KO_KR]: '해당 그룹 내 선택된 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?',
      [Language.EN_US]: 'All selected data in the group will be permanently deleted and will not be recoverable. Are you sure you want to delete it?',
    },
  },
};
