import * as T from '^/types';

export const groupName: { [K in T.Language]: string } = {
  [T.Language.KO_KR]: '그룹 제목',
  [T.Language.EN_US]: 'Group Title',
};

export const tempGroupName: { [K in T.Language]: string } = {
  [T.Language.KO_KR]: '임시 보관',
  [T.Language.EN_US]: 'Temp contents',
};

export const START_GROUP_NUMBER: number = 1;
export const GROUP_NUMBER_GAP: number = 1;
export const DEFAULT_NEW_GROUP_INDEX: number = 0;
export const GROUP_TITLE_PREFIX: string = ' ';

export const NO_GROUP_NUMBER_ATTACHED: number = 0;
