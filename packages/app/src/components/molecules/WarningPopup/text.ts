import { ContentPagePopupType, Language } from '^/types';

export default {
  title: {
    [ContentPagePopupType.DELETE_SCREEN]: {
      [Language.KO_KR]: '데이터 세트 삭제하기',
      [Language.EN_US]: 'Delete Map',
    },
    [ContentPagePopupType.OVERWRITE_SCREEN]: {
      [Language.KO_KR]: '지도 덮어쓰기',
      [Language.EN_US]: 'Overwrite Map',
    },
  },
  button: {
    action: {
      [ContentPagePopupType.DELETE_SCREEN]: {
        [Language.KO_KR]: '삭제',
        [Language.EN_US]: 'Delete',
      },
      [ContentPagePopupType.OVERWRITE_SCREEN]: {
        [Language.KO_KR]: '덮어쓰기',
        [Language.EN_US]: 'Overwrite',
      },
    },
  },
  description: {
    first: {
      [ContentPagePopupType.DELETE_SCREEN]: {
        [Language.KO_KR]: '데이터 세트(정사영상, 수치표면모델, 3D 정사영상, 포인트클라우드) 전체가 영구적으로 삭제됩니다.',
        [Language.EN_US]: 'Data will be deleted permanently.',
      },
      [ContentPagePopupType.OVERWRITE_SCREEN]: {
        [Language.KO_KR]: '데이터가 덮어쓰기 됩니다.',
        [Language.EN_US]: 'Data will be overwritten.',
      },
    },
    second: {
      [ContentPagePopupType.DELETE_SCREEN]: {
        [Language.KO_KR]: '의 데이터를 삭제하시겠습니까?',
        [Language.EN_US]: 'Do you really want to delete?',
      },
      [ContentPagePopupType.OVERWRITE_SCREEN]: {
        [Language.KO_KR]: '의 지도를 정말 덮어씌우시겠습니까?',
        [Language.EN_US]: 'Do you really want to overwrite?',
      },
    },
  },
  submit: {
    [Language.KO_KR]: '정말로 삭제하시겠습니까?',
    [Language.EN_US]: 'Confirm delete?',
  },
};
