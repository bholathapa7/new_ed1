import * as T from '^/types';

/* eslint-disable max-len */
export default {
  label: {
    [T.Language.KO_KR]: '데이터 세트 생성 옵션',
    [T.Language.EN_US]: 'Dataset Options',
  },
  oldOption: {
    title: {
      [T.Language.KO_KR]: '기존 데이터 세트',
      [T.Language.EN_US]: 'Default Datasets',
    },
    description: {
      [T.Language.KO_KR]: '정사영상, 수치표면모델, 포인트 클라우드, 3D 정사영상으로 구성된 기본 데이터 세트를 생성합니다.',
      [T.Language.EN_US]: 'Creates the default dataset consisting of Orthophoto, Digital Surface Model, Point Cloud, and 3D Orthophoto.',
    },
  },
  meshOption: {
    title: {
      [T.Language.KO_KR]: ['기존 데이터 세트', '+ 3D 메쉬'],
      [T.Language.EN_US]: ['Default Datasets', '+ 3D Mesh'],
    },
    description: {
      [T.Language.KO_KR]: '기본 데이터 세트 외에 3D 메쉬 데이터를 추가로 생성합니다.',
      [T.Language.EN_US]: 'Creates 3D Mesh data in addition to the default data set.',
    },
  },
  meshInfo: {
    title: {
      [T.Language.KO_KR]: '3D 메쉬 생성 시, 무엇이 달라지나요?',
      [T.Language.EN_US]: 'What changes with 3D Mesh?',
    },
    description1: {
      [T.Language.KO_KR]: '건물의 측면 데이터를 보다 정교하게 구현한 3D 메쉬 데이터가 추가로 생성됩니다. 3D 메쉬란, 옆면이 흘러내리는 단점이 있었던 3D 정사영상의 한계를 보완한 새로운 형식의 데이터입니다.',
      [T.Language.EN_US]: 'Additional 3D Mesh data will be generated with a more detailed representation of the model’s sides. 3D mesh is a new type of data that complements the limitations of 3D Orthophoto, which had the disadvantage of melting sides.',
    },
    description2: {
      [T.Language.KO_KR]: '3D 메쉬 추가 생성 옵션을 선택할 경우, 처리시간이 24시간을 초과할 수 있습니다.',
      [T.Language.EN_US]: 'If you select the option for creating the additional 3D Mesh data, the processing time may exceed 24 hours.',
    },
  },
};
