import { Language } from '^/types';

/* eslint-disable max-len */
export default {
  processingWithGCPs: {
    [Language.KO_KR]: '지상기준점(GCP) 사용 선택',
    [Language.EN_US]: 'Process with GCPs',
  },
  description: {
    [Language.KO_KR]: '지상기준점(GCP)은 정확한 좌표를 알 수 있는 지면에 표시된 표적입니다. 지상기준점을 입력하면 지도의 정확도를 크게 높일 수 있습니다.',
    [Language.EN_US]: 'Ground Control Points (GCP) are marked targets on the ground in which exact locations are known. It could significantly increase the accuracy in drone mapping.',
  },
  coordinateLabel: {
    [Language.KO_KR]: '좌표계 선택',
    [Language.EN_US]: 'Select Coordinate System',
  },
  coordinateTooltip: {
    [Language.KO_KR]: '좌표참조체계(CRS, Coordinate Reference System) 또는 공간참조체계(SRS, Spatial Reference System)는 정확한 지리적 위치를 찾기 위해 사용되는 지역 또는 전역 시스템입니다. 이는 서로 다른 기준의 시스템 간의 변환 뿐만 아니라 특정 지도 투영도를 정의합니다.',
    [Language.EN_US]: 'Coordinate reference system (CRS), also known as spatial reference system (SRS), is a local, regional, or global system used to locate geographical entities. It defines a specific map projection, as well as transformations between different special reference system.',
  },
  gcp: {
    [Language.KO_KR]: '지상기준점',
    [Language.EN_US]: 'GCP',
  },
  gcpTooltip: {
    [Language.KO_KR]: '.CSV 파일을 첨부하여 GCP 데이터를 업로드하거나, 아래 표에 직접 값을 입력해 주세요. 지도 보정을 위해선 최소 4개의 GCP 데이터가 필요합니다.',
    [Language.EN_US]: 'You can either upload your GCP data by attaching a csv file. Or simply enter them manually in the table below. Please note that at least 4 GCP data points need to be provided if you decided to include GCP data in this map.',
  },
  attachDropdownLabel: {
    [Language.KO_KR]: '.CSV 첨부 또는 GCP 가져오기',
    [Language.EN_US]: 'Attach .CSV or Load GCP',
  },
  attach: {
    [Language.KO_KR]: '새로운 .CSV 첨부하기',
    [Language.EN_US]: 'Attach new .CSV',
  },
  noGCP: {
    [Language.KO_KR]: '업로드된 GCP 없음',
    [Language.EN_US]: 'No GCP Uploaded',
  },
  label: {
    [Language.KO_KR]: '라벨',
    [Language.EN_US]: 'Label',
  },
  loadedFrom: {
    [Language.KO_KR]: '불러온 GCP 데이터 : ',
    [Language.EN_US]: 'Uploaded GCP data : ',
  },
  errorMessage: {
    [Language.KO_KR]: '최소 4개의 GCP 데이터를 입력해주세요.',
    [Language.EN_US]: 'Please include at least 4 GCP data.',
  },
  optionWarning: {
    [Language.KO_KR]: '지상기준점을 첨부하지 않아도 정사영상을 생성할 수 있습니다.',
    [Language.EN_US]: 'You can generate orthophotos without using GCPs.',
  },
  optionBoldWarning: {
    [Language.KO_KR]: '다만, 정확한 절대 위치정보와 차이가 발생할 수 있습니다.',
    [Language.EN_US]: 'However, the data may show differences from the exact absolute location.',
  },
  infoTitle: {
    [Language.KO_KR]: '혹시, Y와 X의 좌표가 바뀌지 않았나요?',
    [Language.EN_US]: 'Please check the order of the Y and X coordinate pair.',
  },
  infoDescription: {
    [Language.KO_KR]: '정확한 GCP 보정을 위하여, GCP가 지도에 맞게 위치하였는지 다시 한번 확인해 주세요.',
    [Language.EN_US]: 'For accurate GCP rectification, please check if the GCPs are precisely located on the map.',
  },
};
