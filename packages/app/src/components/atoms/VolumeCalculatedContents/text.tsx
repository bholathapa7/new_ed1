import { Language } from '^/types';

export default {
  SURVEY: {
    cut: {
      [Language.KO_KR]: '완료된 절토량',
      [Language.EN_US]: 'Cut completed',
    },
    fill: {
      [Language.KO_KR]: '완료된 성토량',
      [Language.EN_US]: 'Fill completed',
    },
    tooltips: {
      cut: {
        [Language.KO_KR]: '비교 지도 대비 진행된 절토량',
        [Language.EN_US]: 'Volume removed based on the compared survey',
      },
      fill: {
        [Language.KO_KR]: '비교 지도 대비 진행된 성토량',
        [Language.EN_US]: 'Volume added based on the compared survey',
      },
      total: {
        [Language.KO_KR]: '비교 지도 대비 진행된 작업 총량',
        [Language.EN_US]: 'The total completed amount of cut and fill',
      },
    },
  },
  DESIGN: {
    cut: {
      [Language.KO_KR]: '필요한 절토량',
      [Language.EN_US]: 'Cut needed',
    },
    fill: {
      [Language.KO_KR]: '필요한 성토량',
      [Language.EN_US]: 'Fill needed',
    },
    tooltips: {
      cut: {
        [Language.KO_KR]: '계획고 대비 잔여 절토량',
        [Language.EN_US]: 'The remaining cut amount compared to the design',
      },
      fill: {
        [Language.KO_KR]: '계획고 대비 잔여 성토량',
        [Language.EN_US]: 'The remaining fill amount compared to the design',
      },
      total: {
        [Language.KO_KR]: '설정한 영역의 잔여 물량',
        [Language.EN_US]: 'The remaining amount left in the selected area',
      },
    },
  },
  BASIC: {
    cut: {
      [Language.KO_KR]: '절토량',
      [Language.EN_US]: 'Cut',
    },
    fill: {
      [Language.KO_KR]: '성토량',
      [Language.EN_US]: 'Fill',
    },
    tooltips: {
      cut: {
        [Language.KO_KR]: '기준 밑면보다 위에 있는 지형의 체적',
        [Language.EN_US]: 'Volume above the base plane',
      },
      fill: {
        [Language.KO_KR]: '기준 밑면보다 아래에 있는 지형의 체적',
        [Language.EN_US]: 'Empty volume below the base plane',
      },
      total: {
        [Language.KO_KR]: '절토량과 성토량의 총량',
        [Language.EN_US]: 'The total amount of cut and fill',
      },
    },
  },
  total: {
    [Language.KO_KR]: '절토/성토량 총합',
    [Language.EN_US]: 'Total',
  },
};
