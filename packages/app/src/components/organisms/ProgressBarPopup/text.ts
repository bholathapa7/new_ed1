import { AttachmentType, Language } from '^/types';

export default {
  total: {
    [Language.KO_KR]: '총',
    [Language.EN_US]: 'Total',
  },
  hour: {
    [Language.KO_KR]: '시간',
    [Language.EN_US]: 'hr',
  },
  minute: {
    [Language.KO_KR]: '분',
    [Language.EN_US]: 'min',
  },
  second: {
    [Language.KO_KR]: '초',
    [Language.EN_US]: 'secs',
  },
  left: {
    [Language.KO_KR]: '남음',
    [Language.EN_US]: 'left',
  },
  submit: {
    [Language.KO_KR]: '업로드',
    [Language.EN_US]: 'Upload',
  },
  back: {
    [Language.KO_KR]: '이전',
    [Language.EN_US]: 'Back',
  },
  cancel: {
    [Language.KO_KR]: '업로드 취소',
    [Language.EN_US]: 'Cancel Upload',
  },
  [AttachmentType.SOURCE]: {
    [Language.KO_KR]: '소스포토 업로드',
    [Language.EN_US]: 'Upload Source Photos',
  },
  [AttachmentType.BLUEPRINT_PDF]: {
    [Language.KO_KR]: '도면 업로드',
    [Language.EN_US]: 'Upload CAD Overlay',
  },
  [AttachmentType.BLUEPRINT_DXF]: {
    [Language.KO_KR]: '도면 업로드',
    [Language.EN_US]: 'Upload CAD Overlay',
  },
  [AttachmentType.BLUEPRINT_DWG]: {
    [Language.KO_KR]: '도면 업로드',
    [Language.EN_US]: 'Upload CAD Overlay',
  },
  [AttachmentType.DSM]: {
    [Language.KO_KR]: '수치표면모델 업로드',
    [Language.EN_US]: 'Upload DSM',
  },
  [AttachmentType.ORTHO]: {
    [Language.KO_KR]: '파일 첨부',
    [Language.EN_US]: 'Upload Orthomosaic',
  },
  [AttachmentType.POINTCLOUD]: {
    [Language.KO_KR]: '포인트 클라우드 업로드',
    [Language.EN_US]: 'Upload Point Cloud',
  },
  [AttachmentType.PHOTO]: {
    [Language.KO_KR]: '타입을 위하여',
    [Language.EN_US]: 'for type',
  },
  [AttachmentType.DESIGN_DXF]: {
    [Language.KO_KR]: '계획고 업로드',
    [Language.EN_US]: 'Design Upload',
  },
};
