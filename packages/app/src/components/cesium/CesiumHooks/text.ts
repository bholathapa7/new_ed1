import { ContentType, Language } from '^/types';
import { contentTexts } from '^/utilities/content-util';

export default {
  noDSM: {
    [Language.EN_US]: 'No DSM data',
    [Language.KO_KR]: '수치표면모델 없음',
  },
  noThreeDOrthoDataMessage: {
    [Language.KO_KR]: `현재 선택한 데이터 세트에 불러올 수 있는 ${contentTexts[ContentType.THREE_D_ORTHO]['ko-KR']} 데이터가 없습니다.`,
    [Language.EN_US]: `There is no ${contentTexts[ContentType.THREE_D_ORTHO]['en-US']} data for the currently selected dataset.`,
  },
  threeDOrthoBeingProcessedMessage: {
    [Language.KO_KR]: `현재 선택한 데이터 세트의 ${contentTexts[ContentType.THREE_D_ORTHO]['ko-KR']} 데이터가 처리되고 있습니다.`,
    [Language.EN_US]: `${contentTexts[ContentType.THREE_D_ORTHO]['en-US']} data for the currently selected dataset is being processed.`,
  },
  total: {
    [Language.EN_US]: 'Total',
    [Language.KO_KR]: '전체',
  },
};
