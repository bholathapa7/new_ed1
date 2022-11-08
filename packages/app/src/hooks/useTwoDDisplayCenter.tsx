import { useSelector } from 'react-redux';

import { defaultMapZoom } from '^/constants/defaultContent';
import * as T from '^/types';
import { getCenterBoundary } from '^/utilities/map-util';

import isDeepEqual from 'react-fast-compare';
import { typeGuardMap } from './contents';
import { lastDSMOrMapContentSelector } from './useLastContent';

function twoDDisplayCenterSelector(s: T.State): T.GeoPoint | undefined {
  const {
    Contents: { contents: { byId } },
    Pages: { Contents: { twoDDisplayZoom } },
  }: typeof s = s;
  const lastMapId: T.Content['id'] | undefined = lastDSMOrMapContentSelector(s, T.ContentType.MAP)?.id;
  let twoDDisplayCenter: T.GeoPoint | undefined;
  if (lastMapId && twoDDisplayZoom) {
    const tms: T.MapContent['info']['tms'] = typeGuardMap(byId[lastMapId])?.info.tms;
    if (tms) {
      twoDDisplayCenter = getCenterBoundary(tms.boundaries[defaultMapZoom]);
    }
  }

  return twoDDisplayCenter;
}

export type UseTwoDDisplayCenter = T.GeoPoint | undefined;

export function useTwoDDisplayCenter(): UseTwoDDisplayCenter {
  return useSelector(twoDDisplayCenterSelector, isDeepEqual);
}
