import * as T from '^/types';

export default {
  groupListHeader: {
    pinned: {
      [T.ContentPageTabType.MAP]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
      [T.ContentPageTabType.OVERLAY]: {
        [T.Language.KO_KR]: '도면 그룹 목록',
        [T.Language.EN_US]: 'Overlay groups',
      },
      [T.ContentPageTabType.MEASUREMENT]: {
        [T.Language.KO_KR]: '모든 지도에서 볼 수 있는 측정',
        [T.Language.EN_US]: 'Measurements in all maps',
      },
      [T.ContentPageTabType.PHOTO]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
      [T.ContentPageTabType.ESS]: {
        [T.Language.KO_KR]: '안전작업계획 그룹 목록',
        [T.Language.EN_US]: 'List of safety workplan group',
      },
    },
    unpinned: {
      [T.ContentPageTabType.MAP]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
      [T.ContentPageTabType.OVERLAY]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
      [T.ContentPageTabType.MEASUREMENT]: {
        [T.Language.KO_KR]: '현재 지도에서만 볼 수 있는 측정',
        [T.Language.EN_US]: 'Measurements in current map',
      },
      [T.ContentPageTabType.PHOTO]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
      [T.ContentPageTabType.ESS]: {
        [T.Language.KO_KR]: '',
        [T.Language.EN_US]: '',
      },
    },
  },
};
