import * as T from '^/types';
import _ from 'lodash-es';

import { defaultMapZoom } from '^/constants/defaultContent';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

export const getCenterBoundary: (
  boundary: T.MapBoundary,
) => T.GeoPoint = (
  { minLon, maxLon, minLat, maxLat },
) => [_.mean([minLon, maxLon]), _.mean([minLat, maxLat])];

export const getZoom: (
  tms: T.MapContent['info']['tms'],
  currentZoom: number,
  defaultZoom?: number,
  sharedMaxZoom?: number,
  isShared?: boolean,
) => number = (
  tms,
  currentZoom,
  defaultZoom = defaultMapZoom,
  // eslint-disable-next-line no-magic-numbers
  sharedMaxZoom = 19,
  isShared,
) => {
  if (!tms) {
    return defaultZoom;
  }
  let zoom: number = currentZoom;
  if (tms.zoomLevels.length !== 0 &&
    !tms.zoomLevels.includes(defaultZoom)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const smallestZoom: number = _.min(tms.zoomLevels)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const unsharedLargestZoom: number = _.max(tms.zoomLevels)!;
    const largestZoom: number = isShared ?
      Math.min(unsharedLargestZoom, sharedMaxZoom) :
      unsharedLargestZoom;
    zoom = _.clamp(currentZoom, smallestZoom, largestZoom);
  }

  return zoom;
};

export const getSquareOrBoundary: (
  square: [T.GeoPoint, T.GeoPoint],
  boundary: T.MapBoundary,
) => [T.GeoPoint, T.GeoPoint] = (
  [squareMinXY, squareMaxXY],
  { minLon, minLat, maxLon, maxLat },
) => {
  if (
    !_.inRange(squareMinXY[0], minLon, maxLon) ||
    !_.inRange(squareMinXY[1], minLat, maxLat) ||
    !_.inRange(squareMaxXY[0], minLon, maxLon) ||
    !_.inRange(squareMaxXY[1], minLat, maxLat)
  ) {
    return [
      [minLon, maxLat],
      [maxLon, minLat],
    ];
  }

  return [squareMinXY, squareMaxXY];
};

export const getMidPoint: (locations: Array<T.GeoPoint>) => T.GeoPoint = (locations) => {
  const lonAverage: number = _.meanBy(_.map(locations, (val) => val[0]));
  const latAverage: number = _.meanBy(_.map(locations, (val) => val[1]));

  return [lonAverage, latAverage];
};

export const getClosestZoomLevel: (
  tms: T.MapContent['info']['tms'],
  zoom: number,
) => number = (
  tms, zoom,
) => {
  if (!tms) {
    return defaultMapZoom;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const minZoom: number = _.min(tms.zoomLevels)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const maxZoom: number = _.max(tms.zoomLevels)!;

  return _.clamp(zoom, minZoom, maxZoom);
};

export function getExtentAndMaxZoom(
  content: T.DSMContent | T.MapContent | T.BlueprintDXFContent | undefined, isShared?: boolean,
): {extent?: Extent; maxZoom?: number} {
  const tms: (T.DSMContent | T.MapContent | T.BlueprintDXFContent)['info']['tms'] | undefined = content?.info?.tms;
  if (tms === undefined || tms.zoomLevels.length === 0) return { extent: undefined, maxZoom: undefined };


  const boundary: (typeof tms)['boundaries'][0] = tms.boundaries[tms.zoomLevels[tms.zoomLevels.length - 1]];
  if (boundary === undefined) return { extent: undefined, maxZoom: undefined };
  const minCoord: Coordinate = fromLonLat([boundary.minLon, boundary.minLat]);
  const maxCoord: Coordinate = fromLonLat([boundary.maxLon, boundary.maxLat]);
  const extent: Extent = [minCoord[0], minCoord[1], maxCoord[0], maxCoord[1]];

  const defaultZoom: number = 12;
  const unsharedLargestZoom: number = _.max(tms.zoomLevels) || defaultZoom;
  const sharedMaxZoom: number = 19;
  const largestZoom = isShared ?
    Math.min(unsharedLargestZoom, sharedMaxZoom) :
    unsharedLargestZoom;

  return { extent, maxZoom: largestZoom };
}

export const getExtentFromVolumeContent: (content: T.VolumeContent) => Extent
  = ({ info: { locations } }) => new Polygon([locations.map((points) => fromLonLat(points))]).getExtent();
