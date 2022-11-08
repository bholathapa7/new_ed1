import { Language } from '^/types';

export default {
  formats: {
    [Language.KO_KR]: ['.CSV', '.DXF', '.DXF'],
    [Language.EN_US]: ['.CSV', '.DXF', '.DXF'],
  },
  dimension: {
    [Language.KO_KR]: ['', '(2D)', '(3D)'],
    [Language.EN_US]: ['', '(2D)', '(3D)'],
  },
  metricDisatnceHeader: {
    [Language.KO_KR]: '거리 (m)',
    [Language.EN_US]: 'Distance (meters)',
  },
  imperialDisatnceHeader: {
    [Language.KO_KR]: '거리 (ft)',
    [Language.EN_US]: 'Distance (feet)',
  },
  MapDateOrDXFName: {
    [Language.KO_KR]: '지도 날짜 / 계획고 (DXF)',
    [Language.EN_US]: 'Map Date / Design DXF',
  },
  exportSentence: {
    [Language.KO_KR]: '내보내기',
    [Language.EN_US]: 'Export as',
  },
  singleElevationFileTitle: {
    [Language.KO_KR]: '종횡단면도_지도날짜',
    [Language.EN_US]: 'singleprofile_mapdate',
  },
  multiElevationFileTitle: {
    [Language.KO_KR]: '다수종횡단면도_지도날짜',
    [Language.EN_US]: 'multiprofile_mapdate',
  },
};
