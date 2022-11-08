/* eslint-disable max-len */
import { Language } from '^/types';

export default {
  MissingContentDetected: {
    title: {
      [Language.KO_KR]: '작업 중인 콘텐츠가 있습니다.',
      [Language.EN_US]: 'Simultaneous Access Detected',
    },
    description: {
      [Language.KO_KR]: '동일 프로젝트 내 동시 접속으로 인해 정상적으로 저장되지 않은 콘텐츠(도면, 측정)가 있습니다. 해당 콘텐츠는 \'임시 보관\' 그룹에서 확인하실 수 있습니다. 문제가 해결되지 않을 경우, 아래의 주소로 문의해 주세요. help@angelswing.io',
      [Language.EN_US]: 'Some contents(CAD Overlay, Measurement) were not saved properly due to simultaneous access within the same project. You can check the contents in the \'Temporary\' group. If the problem is not resolved, please contact us at help@angelswing.io',
    },
  },
};
