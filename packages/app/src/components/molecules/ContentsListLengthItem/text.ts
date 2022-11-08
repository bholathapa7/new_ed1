import { Language } from '^/types';

export default {
  firstBalloonTitle: {
    [Language.KO_KR]: '거리',
    [Language.EN_US]: 'Distance',
  },
  elevation: {
    [Language.KO_KR]: '종횡단면도',
    [Language.EN_US]: 'Elevation Profile',
  },
  noDsmElevation: {
    [Language.KO_KR]: '수치표면모델(DSM) 데이터가 없어 종횡단면도와 기울기 정보를 표시할 수 없습니다.',
    [Language.EN_US]: 'No DSM data. Elevation profile and slope information cannot be viewed.',
  },
  horizontalLength: {
    [Language.KO_KR]: '수평 거리',
    [Language.EN_US]: 'Horizontal Distance',
  },
  pointToPointLength: {
    [Language.KO_KR]: '직선 거리',
    [Language.EN_US]: 'Point to Point Distance',
  },
  surfaceLength: {
    [Language.KO_KR]: '표면 거리',
    [Language.EN_US]: 'Surface Distance',
  },
  horizontalLengthTooltip: {
    [Language.KO_KR]: '점과 점 사이의 동일 고도선상 거리',
    [Language.EN_US]: 'Distance of the cross-section along the same elevation',
  },
  pointToPointLengthTooltip: {
    [Language.KO_KR]: '점과 점 사이의 최단 거리',
    [Language.EN_US]: 'The nearest distance between points',
  },
  surfaceLengthTooltip: {
    [Language.KO_KR]: '지형의 사면 또는 굴곡을 포함한 거리',
    [Language.EN_US]: 'Distance including slopes and curves of the terrain',
  },
  twoDDisabled: {
    [Language.KO_KR]: '2D로 전환하면, 지도에 시각화를 확인할 수 있습니다.',
    [Language.EN_US]: 'To visualize it on the map, switch to 2D Viewer.',
  },
  threeDDisabled: {
    [Language.KO_KR]: '3D로 전환하면, 지도에 시각화를 확인할 수 있습니다.',
    [Language.EN_US]: 'To visualize it on the map, switch to 3D Viewer.',
  },
};
