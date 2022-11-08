import { Language, TwoDDisplayMode } from '^/types';

const { NORMAL, COMPARISON2, COMPARISON4, SLIDER }: typeof TwoDDisplayMode = TwoDDisplayMode;

export default {
  [NORMAL]: {
    [Language.KO_KR]: '기본',
    [Language.EN_US]: 'Default',
  },
  [COMPARISON2]: {
    [Language.KO_KR]: '2분할',
    [Language.EN_US]: '2-Screen',
  },
  [COMPARISON4]: {
    [Language.KO_KR]: '4분할',
    [Language.EN_US]: '4-Screen',
  },
  [SLIDER]: {
    [Language.KO_KR]: '슬라이더',
    [Language.EN_US]: 'Slider',
  },
};
