import { BasicCalcBasePlane, Language } from '^/types';

export default {
  itemTitle: {
    customElevation: {
      [Language.EN_US]: 'Custom Elevation',
      [Language.KO_KR]: '사용자 지정 고도',
    },
    lowestPoint: {
      [Language.EN_US]: 'Lowest Point',
      [Language.KO_KR]: '최저점 기준',
    },
    highestPoint: {
      [Language.EN_US]: 'Highest Point',
      [Language.KO_KR]: '최고점 기준',
    },
    average: {
      [Language.EN_US]: 'Average',
      [Language.KO_KR]: '평균점 기준',
    },
    triangulated: {
      [Language.EN_US]: 'Triangulation',
      [Language.KO_KR]: '삼각분할',
    },
  },
  placeholder: {
    [Language.EN_US]: 'Please select the a base plane',
    [Language.KO_KR]: '기준 밑면을 선택해주세요',
  },
  tutorial: {
    [BasicCalcBasePlane.TRIANGULATED]: {
      title: {
        [Language.EN_US]: 'Triangulated',
        [Language.KO_KR]: '삼각 분할',
      },
      description: {
        [Language.EN_US]: 'The base plane is set based on the triangle planes of all edge points created by the user.',
        [Language.KO_KR]: '사용자가 생성한 점을 삼각망 형태로 이어 기준 밑면을 만듭니다.',
      },
    },
    [BasicCalcBasePlane.LOWEST_POINT]: {
      title: {
        [Language.EN_US]: 'Lowest Point',
        [Language.KO_KR]: '최저점 기준',
      },
      description: {
        [Language.EN_US]: 'The base plane is set based on the lowest point created by the user.',
        [Language.KO_KR]: '사용자가 생성한 점 중 가장 낮은 고도를 기준으로 밑면을 설정합니다.',
      },
    },
    [BasicCalcBasePlane.HIGHEST_POINT]: {
      title: {
        [Language.EN_US]: 'Highest Point',
        [Language.KO_KR]: '최고점 기준',
      },
      description: {
        [Language.EN_US]: 'The base plane is set based on the highest point created by the user.',
        [Language.KO_KR]: '사용자가 생성한 점 중 가장 높은 고도를 기준으로 밑면을 설정합니다.',
      },
    },
    [BasicCalcBasePlane.AVERAGE]: {
      title: {
        [Language.EN_US]: 'Average Point',
        [Language.KO_KR]: '평균점 기준',
      },
      description: {
        [Language.EN_US]: 'The base plane is set based on the average level of the points created by the user.',
        [Language.KO_KR]: '사용자가 생성한 점의 평균 고도를 기준으로 밑면을 설정합니다.',
      },
    },
    [BasicCalcBasePlane.CUSTOM]: {
      title: {
        [Language.EN_US]: 'Custom Point',
        [Language.KO_KR]: '사용자 지정 고도',
      },
      description: {
        [Language.EN_US]: 'The base plane is set based on the level designated by the user.',
        [Language.KO_KR]: '사용자가 입력한 고도를 기준으로 밑면을 설정합니다.',
      },
    },
  },
};
