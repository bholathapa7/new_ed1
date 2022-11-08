import { Language } from '^/types';

/* eslint-disable max-len */
export default {
  emptyMap: {
    [Language.KO_KR]: '아직 생성된 지도가 없습니다. 왼쪽 ‘업로드’ 버튼을 클릭하여 새로운 지도를 생성해 보세요.',
    [Language.EN_US]: 'Map has not been created yet. Click the “Upload” button on the left to create a new map.',
  },
  emptyOverlay: {
    [Language.KO_KR]: '아직 업로드된 도면도가 없습니다. 왼쪽 ‘업로드’ 버튼을 클릭하여 도면도를 올리고 정사영상 위에 중첩해 보세요.',
    [Language.EN_US]: 'CAD Overlay has not been uploaded yet. Click the “Upload” button to create and superimpose on the Orthomosaic.',
  },
  emptyMeasurement: {
    [Language.KO_KR]: '아직 측정된 데이터가 없습니다. 오른쪽 ‘측정’ 버튼을 클릭하여 새로운 위치, 거리, 면적, 체적을 생성해 보세요.',
    [Language.EN_US]: 'Measurement has not been created yet. Click the “Measurement” button on the right to create a new location, distance, area, and volume.',
  },
};
