import * as T from '^/types';
import { LocationLabel, getLatLongYXLabel } from '^/utilities/coordinate-util';
import { UseL10n, useL10n } from './useL10n';

type UseLongLatXYLabel = (params: {
  proj: T.ProjectionEnum;
  isFull?: boolean;
}) => LocationLabel;

export const useLatLongYXLabel: UseLongLatXYLabel = ({
  proj, isFull,
}) => {
  const [, language]: UseL10n = useL10n();

  return getLatLongYXLabel({ proj, language, isFull });
};
