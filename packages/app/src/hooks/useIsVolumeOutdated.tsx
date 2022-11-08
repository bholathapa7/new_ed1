import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import * as T from '^/types';

export function useIsVolumeOutdated(content: T.Content): boolean {
  const outdatedVolumeIds: T.ContentsState['outdatedVolumeIds'] = useSelector((s: T.State) => s.Contents.outdatedVolumeIds);

  const isVolumeOutdated: boolean = useMemo(() => outdatedVolumeIds.includes(content.id), [outdatedVolumeIds, content.id]);

  if (content.type !== T.ContentType.VOLUME) return false;

  return isVolumeOutdated;
}
