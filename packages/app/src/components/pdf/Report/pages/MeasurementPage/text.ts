import { Language } from '^/types';

export default {
  marker: {
    title: {
      [Language.KO_KR]: '위치',
      [Language.EN_US]: 'Location',
    },
    head: [{
      [Language.KO_KR]: '태그',
      [Language.EN_US]: 'Tag',
    }, {
      [Language.KO_KR]: '이름',
      [Language.EN_US]: 'Title',
    }, {
      [Language.KO_KR]: '고도',
      [Language.EN_US]: 'Elevation',
    }, {
      [Language.KO_KR]: 'X/위도',
      [Language.EN_US]: 'X/Latitude',
    }, {
      [Language.KO_KR]: 'Y/경도',
      [Language.EN_US]: 'Y/Longitude',
    }],
  },
  length: {
    title: {
      [Language.KO_KR]: '거리',
      [Language.EN_US]: 'Distance',
    },
    head: [{
      [Language.KO_KR]: '태그',
      [Language.EN_US]: 'Tag',
    }, {
      [Language.KO_KR]: '이름',
      [Language.EN_US]: 'Title',
    }, {
      [Language.KO_KR]: '수평 거리',
      [Language.EN_US]: 'Horizontal Distance',
    }, {
      [Language.KO_KR]: '표면 거리',
      [Language.EN_US]: 'Surface Distance',
    }, {
      [Language.KO_KR]: '직선 거리',
      [Language.EN_US]: 'Point to Point Distance',
    }],
  },
  area: {
    title: {
      [Language.KO_KR]: '면적',
      [Language.EN_US]: 'Area',
    },
    head: [{
      [Language.KO_KR]: '태그',
      [Language.EN_US]: 'Tag',
    }, {
      [Language.KO_KR]: '이름',
      [Language.EN_US]: 'Title',
    }, {
      [Language.KO_KR]: '수평 면적',
      [Language.EN_US]: 'Horizontal Area',
    }, {
      [Language.KO_KR]: '표면적',
      [Language.EN_US]: 'Surface Area',
    }],
  },
  volume: {
    title: {
      [Language.KO_KR]: '체적',
      [Language.EN_US]: 'Volume',
    },
    subTitle: {
      basic: {
        [Language.KO_KR]: '기본 계산',
        [Language.EN_US]: 'Basic Volume',
      },
      design: {
        [Language.KO_KR]: '계획고와 비교',
        [Language.EN_US]: '3D Design Surface',
      },
      survey: {
        [Language.KO_KR]: '비교 지도',
        [Language.EN_US]: 'Compare Survey',
      },
    },
    head: {
      basic: [{
        [Language.KO_KR]: '태그',
        [Language.EN_US]: 'Tag',
      }, {
        [Language.KO_KR]: '이름',
        [Language.EN_US]: 'Title',
      }, {
        [Language.KO_KR]: '기준 밑면',
        [Language.EN_US]: 'Base Plane',
      }, {
        [Language.KO_KR]: '절토량',
        [Language.EN_US]: 'Cut',
      }, {
        [Language.KO_KR]: '성토량',
        [Language.EN_US]: 'Fill',
      }, {
        [Language.KO_KR]: '절토/성토량 총합',
        [Language.EN_US]: 'Total',
      }],
      design: [{
        [Language.KO_KR]: '태그',
        [Language.EN_US]: 'Tag',
      }, {
        [Language.KO_KR]: '이름',
        [Language.EN_US]: 'Title',
      }, {
        [Language.KO_KR]: '계획고',
        [Language.EN_US]: 'Design DXF',
      }, {
        [Language.KO_KR]: '필요한 절토량',
        [Language.EN_US]: 'Cut needed',
      }, {
        [Language.KO_KR]: '필요한 성토량',
        [Language.EN_US]: 'Fill needed',
      }, {
        [Language.KO_KR]: '절토/성토량 총합',
        [Language.EN_US]: 'Total',
      }],
      survey: [{
        [Language.KO_KR]: '태그',
        [Language.EN_US]: 'Tag',
      }, {
        [Language.KO_KR]: '이름',
        [Language.EN_US]: 'Title',
      }, {
        [Language.KO_KR]: '비교 지도',
        [Language.EN_US]: 'Compare with',
      }, {
        [Language.KO_KR]: '완료된 절토량',
        [Language.EN_US]: 'Cut finished',
      }, {
        [Language.KO_KR]: '완료된 성토량',
        [Language.EN_US]: 'Fill finished',
      }, {
        [Language.KO_KR]: '절토/성토량 총합',
        [Language.EN_US]: 'Total',
      }],
    },
  },
};
