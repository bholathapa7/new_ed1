import { Language } from '^/types';

/**
 * @desc This enum is used only this directory
 */
export enum Tool {
  SCREEN_CHANGE = 'DATE_CHANGE',
  SCREEN_DELETE = 'DATE_DELETE',
  DISABLED = 'DISABLED',
}

export default {
  tooltip: {
    [Tool.SCREEN_CHANGE]: {
      [Language.KO_KR]: '데이터 세트 전체의 날짜를 이동합니다.',
      [Language.EN_US]: 'Change the date of entire dataset',
    },
    [Tool.SCREEN_DELETE]: {
      [Language.KO_KR]: '데이터 세트 전체를 삭제합니다.',
      [Language.EN_US]: 'Delete entire dataset',
    },
    [Tool.DISABLED]: {
      [Language.KO_KR]: '마지막 남은 데이터 세트는 삭제할 수 없습니다.',
      [Language.EN_US]: 'You must have at least one dataset.',
    },
  },
};
