import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { RequestVolumeCalculation, SetOutdatedVolumes } from '^/store/duck/Contents';
import * as T from '^/types';

export type UseUpdateVolume = () => void;
export function useUpdateVolume(content: T.Content): UseUpdateVolume {
  const dispatch: Dispatch = useDispatch();

  const outdatedVolumeIds: T.ContentsState['outdatedVolumeIds'] = useSelector((s: T.State) => s.Contents.outdatedVolumeIds);

  return useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (content.type !== T.ContentType.VOLUME || !content.info.calculatedVolume.calculation) return;

    dispatch(RequestVolumeCalculation({ contentId: content.id, info: content.info.calculatedVolume.calculation }));
    dispatch(SetOutdatedVolumes({ outdatedVolumeIds: outdatedVolumeIds.filter((vid) => vid !== content.id) }));
  }, [content, outdatedVolumeIds]);
}
