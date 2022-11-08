import * as T from '^/types';

export default {
  title: {
    delete: {
      [T.Language.KO_KR]: '삭제하기',
      [T.Language.EN_US]: 'Delete',
    },
  },
  description: {
    default: {
      [T.Language.KO_KR]: ['데이터가 영구적으로 삭제됩니다.', '삭제하시겠습니까?'],
      [T.Language.EN_US]: ['Data will be permanently deleted. Are you sure you want to delete it?'],
    },
    uploading: {
      [T.Language.KO_KR]: ['업로드 중인 데이터를 삭제하면', '영구적으로 삭제됩니다. 삭제하시겠습니까?'],
      [T.Language.EN_US]: ['If you delete the currently uploading data, it will be deleted permanently. Are you sure you want to delete it?'],
    },
    [T.ContentType.MAP]: {
      [T.Language.KO_KR]: ['정사영상을 삭제하면 3D 정사영상도 함께 삭제됩니다. 삭제하시겠습니까?'],
      [T.Language.EN_US]: ['Deleting the Orthomosaic will also delete the 3D Orthomosaic. Are you sure you want to delete it?'],
    },
    [T.ContentType.DSM]: {
      [T.Language.KO_KR]: ['수치표면모델을 삭제하면 3D 정사영상도 함께 삭제됩니다. 삭제하시겠습니까? '],
      [T.Language.EN_US]: ['Deleting the DSM will also delete the 3D Orthomosaic. Are you sure you want to delete it?'],
    },
    [T.ContentType.POINTCLOUD]: {
      [T.Language.KO_KR]: ['포인트클라우드를 삭제하시겠습니까?'],
      [T.Language.EN_US]: ['Are you sure want to delete Point Cloud?'],
    },
    [T.ContentType.THREE_D_ORTHO]: {
      [T.Language.KO_KR]: ['3D 정사영상을 삭제하시겠습니까?'],
      [T.Language.EN_US]: ['Are you sure want to delete 3D Orthomosaic?'],
    },
    [T.ContentType.GCP_GROUP]: {
      [T.Language.KO_KR]: [''],
      [T.Language.EN_US]: [''],
    },
    [T.ContentType.THREE_D_MESH]: {
      [T.Language.KO_KR]: ['3D 메쉬 모델을 삭제하시겠습니까?'],
      [T.Language.EN_US]: ['Are you sure want to delete 3D Mesh Model?'],
    },
  },
  deleteButtonLabel: {
    [T.Language.KO_KR]: '삭제',
    [T.Language.EN_US]: 'DELETE',
  },
};
