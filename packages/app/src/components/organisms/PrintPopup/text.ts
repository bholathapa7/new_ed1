import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '인쇄 파일 요청',
    [Language.EN_US]: 'Request File(s) to Print',
  },
  labelTitle: {
    [Language.KO_KR]: '파일 제목',
    [Language.EN_US]: 'File Title',
  },
  supportedFileFormats: {
    [Language.KO_KR]: '지원되는 파일 : JPEG, JPG',
    [Language.EN_US]: 'Supported file formats : JPEG, JPG',
  },
  imageSizes: {
    [Language.KO_KR]: '이미지 해상도',
    [Language.EN_US]: 'Image resolution',
  },
  imageLow: {
    [Language.KO_KR]: '저해상 (A4 인쇄에 적합)',
    [Language.EN_US]: 'Low (suitable for A4 output)',
  },
  imageMedium: {
    [Language.KO_KR]: '일반 (A2~A3 인쇄에 적합)',
    [Language.EN_US]: 'Medium (suitable for A2 ~ A3 outputs)',
  },
  imageHigh: {
    [Language.KO_KR]: '고해상 (A0~A1 인쇄에 적합)',
    [Language.EN_US]: 'High (suitable for A0 ~ A1 outputs)',
  },
  submit: {
    [Language.KO_KR]: '확인',
    [Language.EN_US]: 'Confirm',
  },
  error: {
    [Language.KO_KR]: '이미지 해상도를 하나 이상 선택하세요.',
    [Language.EN_US]: 'Please select at least one image resolution.',
  },
};
