import { useContent } from '^/hooks';
import * as T from '^/types';

export function useLengthAreaVolumeContent<C extends T.LengthAreaVolumeContent>(id: C['id']): C | undefined {
  return useContent(id, (prev, next) => (
    prev?.title === next?.title &&
      prev?.info.locations.toString() === next?.info.locations.toString() &&
      prev?.color.toString() === next?.color.toString()
  ));
}
