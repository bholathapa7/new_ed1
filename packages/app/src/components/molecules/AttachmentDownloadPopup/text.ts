import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '다운로드',
    [Language.EN_US]: 'Download Data',
  },
  selectMapTitle: {
    [Language.KO_KR]: '데이터 세트',
    [Language.EN_US]: 'Dataset',
  },
  downloadDataTitle: {
    [Language.KO_KR]: '데이터 다운로드',
    [Language.EN_US]: 'Download Data',
  },
  placeholderText: {
    [Language.KO_KR]: '지도를 선택하세요.',
    [Language.EN_US]: 'Select a map to download',
  },
  notice: {
    [Language.KO_KR]: '다운로드 가능한 데이터만 활성화됩니다.',
    [Language.EN_US]: 'Gray icon means the data is not available.',
  },
  originalText: {
    [Language.KO_KR]: '원본',
    [Language.EN_US]: 'Original',
  },
  compressedText: {
    compressedDSMDefault: {
      [Language.KO_KR]: '저용량 (25cm/px)',
      [Language.EN_US]: 'Reduced Resolution (25cm/px)',
    },
    compressedOrtho10Text: {
      [Language.KO_KR]: '저용량 (10cm/px)',
      [Language.EN_US]: 'Reduced Resolution (10cm/px)',
    },
    compressedOrtho20Text: {
      [Language.KO_KR]: '저용량 (20cm/px)',
      [Language.EN_US]: 'Reduced Resolution (20cm/px)',
    },
    compressedPointCloud_100: {
      [Language.KO_KR]: '저용량 (100 Pts/m²)',
      [Language.EN_US]: 'Reduced Resolution (100 Pts/m²)',
    },
    compressedPointCloud_25: {
      [Language.KO_KR]: '저용량 (25 Pts/m²)',
      [Language.EN_US]: 'Reduced Resolution (25 Pts/m²)',
    },
    compressedPointCloud_4: {
      [Language.KO_KR]: '저용량 (4 Pts/m²)',
      [Language.EN_US]: 'Reduced Resolution (4 Pts/m²)',
    },
  },
  lasDownloadClick: {
    [Language.KO_KR]: '여기',
    [Language.EN_US]: 'Click',
  },
  lasDownloadPrompt: {
    [Language.KO_KR]: '를 클릭하면, 저용량 파일의 다운로드 처리를 요청합니다.',
    [Language.EN_US]: ' here to request reduced resolution files.',
  },
  lasDownloadDone: {
    [Language.KO_KR]: '다소 시간이 소요될 수 있으며 다운로드 링크를 메일로 발송합니다.',
    [Language.EN_US]: 'Processing may take a while. We\'ll send you a download link via email.',
  },
};
