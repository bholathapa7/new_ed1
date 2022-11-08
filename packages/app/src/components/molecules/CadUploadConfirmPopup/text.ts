import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '도면 업로드',
    [Language.EN_US]: 'Upload Overlay',
  },
  subTitle: {
    [Language.KO_KR]: '먼저! 도면 업로드 할 때, 꼭 확인해 주세요!',
    [Language.EN_US]: 'Please check the following when uploading overlays!',
  },
  description: {
    [Language.KO_KR]: '모두 확인하셨나요? 위의 사항이 충족되지 않으면, 도면이 정상적으로 처리되지 않습니다.',
    [Language.EN_US]: 'If the above conditions are not met, the overlay will not be processed properly.',
  },
  checkForm: [
    {
      [Language.KO_KR]: '도면에 불필요한 객체가 없는지 확인해 주세요.',
      [Language.EN_US]: 'Overlay does not contain any unnecessary elements.',
    },
    {
      [Language.KO_KR]: '도면이 실좌표계에 맞추어졌는지 확인해 주세요.',
      [Language.EN_US]: 'Overlay is aligned with the project coordinate system.',
    },
    {
      [Language.KO_KR]: '도면의 축적이 \'m\' 기준인지 확인해 주세요.',
      [Language.EN_US]: 'Overlay scale is in metric units.',
    },
  ],
  submit: {
    [Language.KO_KR]: '업로드',
    [Language.EN_US]: 'Upload',
  },
  detail: {
    [Language.KO_KR]: '유의사항 자세히 보기',
    [Language.EN_US]: 'Learn more',
  },
};
