import { AttachmentType, Language } from '^/types';

const {
  PHOTO, ORTHO, BLUEPRINT_PDF, BLUEPRINT_DXF, BLUEPRINT_DWG, DESIGN_DXF, DSM, POINTCLOUD,
}: typeof AttachmentType = AttachmentType;

export default {
  upload: {
    [Language.KO_KR]: '업로드',
    [Language.EN_US]: 'Upload',
  },
  back: {
    [Language.KO_KR]: '이전',
    [Language.EN_US]: 'Back',
  },
  datasetDateAndName: {
    [Language.KO_KR]: '데이터 세트 날짜/이름',
    [Language.EN_US]: 'Date and title of dataset',
  },
  overwritingWarningMsg: {
    [Language.KO_KR]: '선택된 데이터 세트에 덮어써야 하는 데이터가 존재합니다. 업로드를 진행하면 데이터를 덮어쓰게 됩니다.',
    [Language.EN_US]: 'Data in the selected dataset needs to be overwritten. If you proceed, the data will be overwritten.',
  },
  next: {
    [Language.KO_KR]: '다음',
    [Language.EN_US]: 'Next',
  },
  content: {
    [PHOTO]: {
      [Language.KO_KR]: '전경 사진',
      [Language.EN_US]: 'Bird Eye View Photos',
    },
    [ORTHO]: {
      [Language.KO_KR]: '정사영상',
      [Language.EN_US]: 'Orthomosaic',
    },
    [BLUEPRINT_PDF]: {
      [Language.KO_KR]: '도면',
      [Language.EN_US]: 'Overlay',
    },
    [BLUEPRINT_DXF]: {
      [Language.KO_KR]: '도면',
      [Language.EN_US]: 'Overlay',
    },
    [BLUEPRINT_DWG]: {
      [Language.KO_KR]: '도면',
      [Language.EN_US]: 'Overlay',
    },
    [POINTCLOUD]: {
      [Language.KO_KR]: '포인트 클라우드',
      [Language.EN_US]: 'Point Cloud',
    },
    [DSM]: {
      [Language.KO_KR]: '수치표면모델',
      [Language.EN_US]: 'DSM',
    },
    [DESIGN_DXF]: {
      [Language.KO_KR]: '계획고',
      [Language.EN_US]: 'Design Surface',
    },
  },
  photoUploadingText: {
    [Language.KO_KR]: '업로드 중...',
    [Language.EN_US]: 'Uploading...',
  },
};
