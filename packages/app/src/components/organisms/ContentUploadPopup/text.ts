import * as T from '^/types';

export default {
  title: {
    [T.Language.KO_KR]: '사진 & 데이터 업로드',
    [T.Language.EN_US]: 'Upload Data & Photos',
  },
  [T.AttachmentType.PHOTO]: {
    title: {
      [T.Language.KO_KR]: '전경 사진',
      [T.Language.EN_US]: 'Bird Eye View Photos',
    },
    description: {
      [T.Language.KO_KR]: [
        '사진 데이터를 업로드 해주세요.',
        '촬영한 위치와 시간을 기준으로 자동 정렬됩니다.',
      ],
      [T.Language.EN_US]: [
        'Please upload photos.',
        'Photos will be automatically listed based on the location and time taken.',
      ],
    },
    extension: ['.JPEG', '.PNG'],
  },
  [T.AttachmentType.SOURCE]: {
    title: {
      [T.Language.KO_KR]: '소스포토',
      [T.Language.EN_US]: 'Source Photo',
    },
    description: {
      [T.Language.KO_KR]: [
        '드론으로 촬영한 원본 데이터를 업로드 해주세요. ',
        '(데이터 처리는 24시간 이내에 완료됩니다)',
      ],
      [T.Language.EN_US]: [
        'Upload drone mapped data.',
        'Once uploaded, data will be automatically',
        'processed to a 2D orthophoto and a 3D model.',
      ],
    },
    extension: ['Geotagged JPEG'],
  },
  [T.AttachmentType.BLUEPRINT_PDF]: {
    title: {
      [T.Language.KO_KR]: '도면',
      [T.Language.EN_US]: 'CAD Overlay',
    },
    description: {
      [T.Language.KO_KR]: ['도면을 DWG, DXG, PDF 파일로 변환하여 업로드 해주세요.'],
      [T.Language.EN_US]: [
        'Upload a CAD Overlay.',
        '(Supported File Type - DWG, DXG, PDF)',
      ],
    },
    extension: ['.DWG', '.DXF', '.PDF'],
  },
  [T.AttachmentType.DESIGN_DXF]: {
    title: {
      [T.Language.KO_KR]: '계획고',
      [T.Language.EN_US]: '3D Design Surface',
    },
    description: {
      [T.Language.KO_KR]: ['계획고를 DXF 파일로 변환하여 업로드 해주세요.'],
      [T.Language.EN_US]: [
        'Upload a 3D Design Surface to overlay.',
        '(Supported File Type - DXF)',
      ],
    },
    extension: ['.DXF'],
  },
  [T.AttachmentType.ORTHO]: {
    title: {
      [T.Language.KO_KR]: '정사영상',
      [T.Language.EN_US]: 'Orthomosaic',
    },
    description: {
      [T.Language.KO_KR]: ['처리된 정사영상을 업로드 해주세요.'],
      [T.Language.EN_US]: ['Upload Orthomosaic'],
    },
    extension: ['.TIFF'],
  },
  [T.AttachmentType.POINTCLOUD]: {
    title: {
      [T.Language.KO_KR]: '포인트 클라우드',
      [T.Language.EN_US]: 'Point Cloud',
    },
    description: {
      [T.Language.KO_KR]: ['처리된 포인트 클라우드를 업로드 해주세요.'],
      [T.Language.EN_US]: ['Upload pointcloud'],
    },
    extension: ['.LAS'],
  },
  [T.AttachmentType.DSM]: {
    title: {
      [T.Language.KO_KR]: '수치표면모델',
      [T.Language.EN_US]: 'DSM',
    },
    description: {
      [T.Language.KO_KR]: ['처리된 수치표면모델(DSM)을 업로드 해주세요.'],
      [T.Language.EN_US]: ['Upload a Digital Surface Model'],
    },
    extension: ['.TIFF'],
  },
};
