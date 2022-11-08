import * as T from '^/types';

export default {
  action: {
    restore: {
      [T.Language.KO_KR]: '복원하기',
      [T.Language.EN_US]: 'Restore',
    },
    restored: {
      [T.Language.KO_KR]: '복원됨',
      [T.Language.EN_US]: 'Restored',
    },
    tooltipExpireRestore: {
      [T.Language.KO_KR]: '복원 가능 기간이 지나 복원할 수 없습니다.',
      [T.Language.EN_US]: 'Restoration period has expired and cannot be restored.',
    },
  },
  event: {
    [T.ContentEvent.CREATED]: {
      [T.Language.KO_KR]: '생성',
      [T.Language.EN_US]: 'Create',
    },
    [T.ContentEvent.DESTROY]: {
      [T.Language.KO_KR]: '삭제',
      [T.Language.EN_US]: 'Delete',
    },
    [T.ContentEvent.RECOVERED]: {
      [T.Language.KO_KR]: '복원',
      [T.Language.EN_US]: 'Restore',
    },
  },
  createdAyBy: {
    [T.Language.KO_KR]: '생성된 날짜/생성자: ',
    [T.Language.EN_US]: 'Created at/by: ',
  },
};
