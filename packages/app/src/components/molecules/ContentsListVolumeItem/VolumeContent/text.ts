import { Language, VolumeCalcMethod, VolumeSlider } from '^/types';

export default {
  title: {
    base: {
      [Language.KO_KR]: '기준 밑면',
      [Language.EN_US]: 'Base Plane',
    },
    tooltipBasePlane: {
      [Language.KO_KR]: '절토, 성토량을 구하는 기준이 되는 평면',
      [Language.EN_US]: 'The reference level from which the cut and fill volumes are calculated',
    },
    customElevation: {
      [Language.KO_KR]: '사용자 지정 고도',
      [Language.EN_US]: 'Custom Level',
    },
    selectDate: {
      [Language.KO_KR]: '다른 날짜와 비교',
      [Language.EN_US]: 'Select Survey to Compare',
    },
    cutFillMap: {
      [Language.KO_KR]: '절토/성토 색상 맵',
      [Language.EN_US]: 'Cut/Fill Color Map',
    },
    opacity: {
      [Language.KO_KR]: '불투명도',
      [Language.EN_US]: 'Opacity',
    },
    cut: {
      [Language.KO_KR]: '절토 고도 범위',
      [Language.EN_US]: 'Cut Elevation Range',
    },
    fill: {
      [Language.KO_KR]: '성토 고도 범위',
      [Language.EN_US]: 'Fill Elevation Range',
    },
    compareWith: {
      [Language.KO_KR]: '비교 지도',
      [Language.EN_US]: 'Compare with',
    },
    tooltip: {
      [VolumeCalcMethod.DESIGN]: {
        [VolumeSlider.CUT]: {
          [Language.KO_KR]: '계획고 대비 절토량의 고도 범위',
          [Language.EN_US]: 'Elevation range of cut',
        },
        [VolumeSlider.FILL]: {
          [Language.KO_KR]: '계획고 대비 성토량의 고도 범위',
          [Language.EN_US]: 'Elevation range of fill',
        },
      },
      [VolumeCalcMethod.SURVEY]: {
        [VolumeSlider.CUT]: {
          [Language.KO_KR]: '비교 지도 대비 절토량의 고도 범위',
          [Language.EN_US]: 'Elevation range of cut',
        },
        [VolumeSlider.FILL]: {
          [Language.KO_KR]: '비교 지도 대비 성토량의 고도 범위',
          [Language.EN_US]: 'Elevation range of fill',
        },
      },
    },
    calendar: {
      [Language.KO_KR]: '지도 날짜 선택',
      [Language.EN_US]: 'Select Map Date',
    },
    design: {
      [Language.KO_KR]: '계획고',
      [Language.EN_US]: 'Design DXF',
    },
  },
  hasNoValues: {
    [VolumeSlider.CUT]: {
      [Language.KO_KR]: '선택한 지역의 절토 값을 찾을 수 없습니다.',
      [Language.EN_US]: 'Cannot find cut value for the selected region',
    },
    [VolumeSlider.FILL]: {
      [Language.KO_KR]: '선택한 지역의 성토 값을 찾을 수 없습니다.',
      [Language.EN_US]: 'Cannot find fill value for the selected region',
    },
  },
  submit: {
    [Language.KO_KR]: '설정 완료',
    [Language.EN_US]: 'Confirm',
  },
  disabled: {
    [VolumeCalcMethod.DESIGN]: {
      [Language.KO_KR]: '업로드된 계획고가 없어 기능을 사용할 수 없습니다.',
      [Language.EN_US]: 'Cannot use the function because no 3D design surface has been uploaded.',
    },
    [VolumeCalcMethod.SURVEY]: {
      [Language.KO_KR]: '비교할 다른 날짜의 지도가 없어 기능을 사용할 수 없습니다.',
      [Language.EN_US]: 'Cannot use the function because there is no survey to compare.',
    },
  },
};
