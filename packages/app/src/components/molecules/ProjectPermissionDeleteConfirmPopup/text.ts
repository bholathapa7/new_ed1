import * as T from '^/types';

export const EMAIL_CUSTOM_TAG = '<email>';

export default {
  title: {
    [T.Language.KO_KR]: '삭제하기',
    [T.Language.EN_US]: 'Remove Permission',
  },
  description: {
    [T.Language.KO_KR]: `${EMAIL_CUSTOM_TAG}을 삭제하시겠습니까?`,
    [T.Language.EN_US]: `Are you sure want to remove ${EMAIL_CUSTOM_TAG}'s permission?`,
  },
  deleteButtonLabel: {
    [T.Language.KO_KR]: '삭제',
    [T.Language.EN_US]: 'REMOVE',
  },
};
