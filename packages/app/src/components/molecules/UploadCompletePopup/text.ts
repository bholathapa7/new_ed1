import { AttachmentType, Language } from '^/types';

export default {
  type: {
    [AttachmentType.SOURCE]: {
      [Language.KO_KR]: '소스포토를',
      [Language.EN_US]: 'Source photo',
    },
    [AttachmentType.BLUEPRINT_PDF]: {
      [Language.KO_KR]: '도면을',
      [Language.EN_US]: 'CAD Overlay',
    },
    [AttachmentType.BLUEPRINT_DXF]: {
      [Language.KO_KR]: '도면을',
      [Language.EN_US]: 'CAD Overlay',
    },
    [AttachmentType.BLUEPRINT_DWG]: {
      [Language.KO_KR]: '도면을',
      [Language.EN_US]: 'CAD Overlay',
    },
    [AttachmentType.DSM]: {
      [Language.KO_KR]: '수치표면모델을',
      [Language.EN_US]: 'DSM',
    },
    [AttachmentType.ORTHO]: {
      [Language.KO_KR]: '정사영상을',
      [Language.EN_US]: 'Orthomosaic',
    },
    [AttachmentType.POINTCLOUD]: {
      [Language.KO_KR]: '포인트 클라우드를',
      [Language.EN_US]: 'Point Cloud',
    },
    [AttachmentType.DESIGN_DXF]: {
      [Language.KO_KR]: '계획고를',
      [Language.EN_US]: 'Design',
    },
    [AttachmentType.PHOTO]: {
      [Language.KO_KR]: '',
      [Language.EN_US]: '',
    },
  },
  success: {
    title: {
      [Language.KO_KR]: '업로드 완료',
      [Language.EN_US]: 'Upload Complete',
    },
    description1: {
      [Language.KO_KR]: '데이터를 정상적으로 업로드하였습니다.',
      [Language.EN_US]: 'Data is successfully uploaded.',
    },
    description2: {
      [Language.KO_KR]: '데이터 처리는 24시간 이내에 완료됩니다.',
      [Language.EN_US]: ' processing takes some time. ',
    },
    description3: {
      [Language.KO_KR]: '',
      [Language.EN_US]: 'We\'ll let you know once completes.',
    },
  },
  error: {
    title: {
      [Language.KO_KR]: '업로드 실패',
      [Language.EN_US]: 'Upload Failed',
    },
    description: {
      [Language.KO_KR]: '데이터를 업로드하는데 실패하였습니다',
      [Language.EN_US]: 'Failed to upload data',
    },
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'CONFIRM',
  },
};
