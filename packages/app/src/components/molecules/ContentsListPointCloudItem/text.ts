import { Language } from '^/types';

export const LINK_CUSTOM_TAG = '<link>';

export default {
  sizeOfPoint: {
    [Language.KO_KR]: '점의 크기',
    [Language.EN_US]: 'Point Size',
  },
  numberOfPoints: {
    [Language.KO_KR]: '점의 개수',
    [Language.EN_US]: 'Number of Points',
  },
  sizeOfPointTooltip: {
    [Language.KO_KR]: '모델을 구성하는 점의 크기를 조정합니다.',
    [Language.EN_US]: 'Resize point of the model',
  },
  numberOfPointsTooltip: {
    [Language.KO_KR]: '모델을 구성하는 전체 점의 개수를 조정합니다.',
    [Language.EN_US]: 'Adjust the number of total points in the model',
  },
  unit: {
    [Language.KO_KR]: '백만 개',
    [Language.EN_US]: 'M',
  },
  requestReprocessing: {
    [Language.KO_KR]:
    `${LINK_CUSTOM_TAG}를 클릭하면, 기존 뷰어에서 보던 포인트 클라우드를 변환하여 3차원 측정이 가능한 환경으로 통합합니다. 기존의 뷰어로 되돌릴 수 없습니다.`,
    [Language.EN_US]:
    `Click ${LINK_CUSTOM_TAG} to convert the existing point cloud with the legacy viewer to the 3D-measurable environment.
     This action is irreversible.`,
  },
  requestReprocessingLink: {
    [Language.KO_KR]: '여기',
    [Language.EN_US]: 'here',
  },
  reprocessingInProgress: {
    [Language.KO_KR]: '포인트 클라우드를 변환하고 있으며, 다소 시간이 소요될 수 있습니다. 처리가 완료되면, 안내 메일을 발송하여 드립니다.',
    [Language.EN_US]: 'Point clouds are being converted and it may take some time. A notification email will be sent upon completing processing.',
  },
};
