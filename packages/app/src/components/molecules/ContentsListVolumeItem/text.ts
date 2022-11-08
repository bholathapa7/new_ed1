import * as T from '^/types';

export default {
  title: {
    [T.Language.KO_KR]: '절토량, 성토량',
    [T.Language.EN_US]: 'Cut, Fill',
  },
  comparison: {
    [T.VolumeCalcMethod.BASIC]: {
      [T.Language.KO_KR]: '기본 계산',
      [T.Language.EN_US]: 'Basic Volume',
    },
    [T.VolumeCalcMethod.SURVEY]: {
      [T.Language.KO_KR]: '다른 날짜와 비교',
      [T.Language.EN_US]: 'Compare Survey',
    },
    [T.VolumeCalcMethod.DESIGN]: {
      [T.Language.KO_KR]: '계획고와 비교',
      [T.Language.EN_US]: '3D Design Surface',
    },
  },
  dbvcBoundaryViolation: {
    title: {
      [T.Language.KO_KR]: 'N/A',
      [T.Language.EN_US]: 'N/A',
    },
    description: {
      [T.Language.KO_KR]: '지정 영역이 계획고 영역에서 벗어났기 때문에 결과를 생성할 수 없습니다. ',
      [T.Language.EN_US]: 'Cannot generate result because volume specified area is outside the design.',
    },
  },
  tutorial: {
    [T.VolumeCalcMethod.BASIC]: {
      [T.Language.KO_KR]: '사용자가 기준 밑면을 설정하여 단일 날짜에 대한 체적을 계산합니다.',
      [T.Language.EN_US]: 'Volume is calculated based on the base plane set by the user.',
    },
    [T.VolumeCalcMethod.SURVEY]: {
      [T.Language.KO_KR]: '다른 날짜를 기준 밑면으로 선택하여 체적의 변화량을 계산합니다.',
      [T.Language.EN_US]: 'Volume change is calculated based on the base plane from another date.',
    },
    [T.VolumeCalcMethod.DESIGN]: {
      [T.Language.KO_KR]: '계획고를 기준 밑면으로 설정하여 단일 날짜에 대한 체적을 계산합니다.',
      [T.Language.EN_US]: 'Volume is calculated based on the base plane set by the 3D Design Surface.',
    },
  },
};
