import { Language, VolumeCalcMethod } from '^/types';

export default {
  tooltipPointer: {
    [Language.KO_KR]: '선택',
    [Language.EN_US]: 'Select',
  },
  tooltipMarker: {
    [Language.KO_KR]: '위치',
    [Language.EN_US]: 'Location',
  },
  tooltipLength: {
    [Language.KO_KR]: '거리/종횡단면도',
    [Language.EN_US]: 'Distance/Elevation',
  },
  tooltipArea: {
    [Language.KO_KR]: '면적',
    [Language.EN_US]: 'Area',
  },
  tooltipESSArrow: {
    [Language.KO_KR]: '화살표',
    [Language.EN_US]: 'Arrow',
  },
  tooltipESSPolyline: {
    [Language.KO_KR]: '선',
    [Language.EN_US]: 'Polyline',
  },
  tooltipESSPolygon: {
    [Language.KO_KR]: '다각형',
    [Language.EN_US]: 'Polygon',
  },
  tooltipESSText: {
    [Language.KO_KR]: '텍스트',
    [Language.EN_US]: 'Text',
  },
  tooltipVolume: {
    default: {
      [Language.KO_KR]: '체적',
      [Language.EN_US]: 'Volume',
    },
    disabled: {
      [Language.KO_KR]: '현재 날짜의 수치표면모델(DSM)이 없어 기능을 사용할 수 없습니다.',
      [Language.EN_US]: 'The feature cannot be used since no DSM exists for the current date.',
    },
    disabledIn3d: {
      [Language.KO_KR]: '이 기능은 3D 뷰어에서 지원되지 않습니다.',
      [Language.EN_US]: 'This feature is not supported in the 3D viewer.',
    },
    dbvcDisabled: {
      [Language.KO_KR]: '업로드된 계획고가 없어 기능을 사용할 수 없습니다.',
      [Language.EN_US]: 'Cannot use the function because no 3D design surface has been uploaded.',
    },
    sbvcDisabled: {
      [Language.KO_KR]: '비교할 수 있는 수치표면모델(DSM)이 없으므로 기능을 사용할 수 없습니다.',
      [Language.EN_US]: 'Cannot use the function because no DSM provided to compare.',
    },
  },
  volumeAlgorithm: {
    basic: {
      [Language.KO_KR]: '기본 계산',
      [Language.EN_US]: 'Basic Volume',
    },
    survey: {
      [Language.KO_KR]: '다른 날짜와 비교',
      [Language.EN_US]: 'Compare Survey',
    },
    design: {
      [Language.KO_KR]: '계획고와 비교',
      [Language.EN_US]: '3D Design Surface',
    },
  },
  tooltipToogle: {
    fold: {
      [Language.KO_KR]: '접기',
      [Language.EN_US]: 'Hide',
    },
    unfold: {
      [Language.KO_KR]: '펼치기',
      [Language.EN_US]: 'Show',
    },
  },
  tutorial: {
    [VolumeCalcMethod.BASIC]: {
      title: {
        [Language.KO_KR]: '기본 계산',
        [Language.EN_US]: 'Basic Volume',
      },
      description: {
        [Language.KO_KR]: '사용자가 기준 밑면을 설정하여 단일 날짜에 대한 체적을 계산합니다.',
        [Language.EN_US]: 'Volume is calculated based on the base plane set by the user.',
      },
    },
    [VolumeCalcMethod.DESIGN]: {
      title: {
        [Language.KO_KR]: '계획고와 비교',
        [Language.EN_US]: '3D Design Surface',
      },
      description: {
        [Language.KO_KR]: '계획고를 기준 밑면으로 설정하여 단일 날짜에 대한 체적을 계산합니다.',
        [Language.EN_US]: 'Volume is calculated based on the base plane set by the 3D Design Surface.',
      },
    },
    [VolumeCalcMethod.SURVEY]: {
      title: {
        [Language.KO_KR]: '다른 날짜와 비교',
        [Language.EN_US]: 'Compare Survey',
      },
      description: {
        [Language.KO_KR]: '다른 날짜를 기준 밑면으로 선택하여 체적의 변화량을 계산합니다.',
        [Language.EN_US]: 'Volume change is calculated based on the base plane from another date.',
      },
    },
  },
};
