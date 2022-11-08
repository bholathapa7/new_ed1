import * as Sentry from '@sentry/browser';
import { geom } from 'jsts';
import _ from 'lodash-es';
import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { fromLonLat, toLonLat } from 'ol/proj';
import proj4 from 'proj4';

import { CoordinateAndElevation } from '^/components/ol/OlLengthSegmentOverlays/util';
import { INVALID } from '^/components/ol/constants';
import * as T from '^/types';
import { getEPSGfromProjectionLabel } from './coordinate-util';

/**
 * @desc EPSG:4326 -> EPSG:3857 makes error(epsilon: e < 0.00001m)
 * because EPSG:3857 uses 8 digit numbers, we accepts 1cm error
 */
const POLYGON_BUFFER_VALUE: number = -0.01;

export const convertRangedToPercent: (
  rangedValue: number, minValue: number, maxValue: number,
) => number = (
  rangedValue, minValue, maxValue,
) => (rangedValue - minValue) / (maxValue - minValue);

export const convertPercentToRanged: (
  percent: number, minValue: number, maxValue: number,
) => number = (
  percent, minValue, maxValue,
) => percent * (maxValue - minValue) + minValue;

/**
 * Sigh, instanbul cannot ignore the whole function.
 */
export const getCircularElem: (
  currentIndex: number, min: number, max: number, isNext?: boolean,
) => number = (
  currentIndex, min, max, isNext,
) => {
  /* istanbul ignore next: not used anywhere */
  let newIndex: number = currentIndex + (isNext ? 1 : -1);
  /* istanbul ignore next: not used anywhere */
  newIndex = newIndex < min ? max : (newIndex > max ? min : newIndex);

  /* istanbul ignore next: not used anywhere */
  return newIndex;
};

export type Point = [number, number];
export type Line = [Point, Point];
export type Polygon = Array<Point>;

/**
 * Ray Casting Algorithm
 * https://en.wikipedia.org/wiki/Point_in_polygon
 * https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
 * https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
 * @param polygon set of points
 * @param point point
 */
export const isPointInPolygon: (polygon: Polygon, point: Point) => boolean = (polygon, point) => {
  const nvert: number = polygon.length;
  let isInside: boolean = false;

  for (let i: number = 0, j: number = nvert - 1; i < nvert; j = i++) {
    if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) &&
      (point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
      isInside = !isInside;
    }
  }

  return isInside;
};

export const getJSTSCoordinateFromPolygon: (param: {
  polygon: Array<Coordinate>;
  shouldChangeCoordinates?: boolean;
}) => Array<geom.Coordinate> = ({ polygon, shouldChangeCoordinates }) => polygon.map((point) => {
  const coordinate: Coordinate = shouldChangeCoordinates ? fromLonLat(point) : point;

  return new geom.Coordinate(coordinate[0], coordinate[1]);
});

export const makeClosedPolygon: (polygon: Array<Coordinate>) => Array<Coordinate> = (polygon) => {
  const copiedPolygon: Array<Coordinate> = [...polygon];
  if (!_.isEqual(copiedPolygon[0], copiedPolygon[copiedPolygon.length - 1])) copiedPolygon.push(copiedPolygon[0]);

  return copiedPolygon;
};
export const isBoundaryViolated: (
  locations: Array<Coordinate>, designDXFContent?: T.DesignDXFContent,
) => boolean = (
  locations, designDXFContent,
) => {
  if (designDXFContent) {
    const volumeLocations: Array<geom.Coordinate> =
      getJSTSCoordinateFromPolygon({ polygon: makeClosedPolygon(locations), shouldChangeCoordinates: true });
    const designDxfLocations: Array<geom.Coordinate> =
      getJSTSCoordinateFromPolygon({ polygon: makeClosedPolygon(designDXFContent.info.designBorder) });
    const jstsGeomFactory: geom.GeometryFactory = new geom.GeometryFactory();

    const deflatedVolumePolygon: geom.Geometry = jstsGeomFactory
      .createPolygon(jstsGeomFactory.createLinearRing(volumeLocations), []).buffer(POLYGON_BUFFER_VALUE, 0, 0);
    const designDxfPolygon: geom.Polygon = jstsGeomFactory.createPolygon(jstsGeomFactory.createLinearRing(designDxfLocations), []);

    try {
      return deflatedVolumePolygon.difference(designDxfPolygon).getArea() > 0;
    } catch (err) {
      // There was an error thrown here on certain cases, it's not clear what is the cause yet.
      // "Uncaught TopologyException: found non-noded intersection between LINESTRING".
      // It seems to only happen on certain (problematic) DXFs, becaue it's usually working fine.
      // Returning true would be the correct approach since it is an error related to the boundary.
      // Report this error to Sentry to see how often this error occurs and see if should be handled properly.
      // eslint-disable-next-line no-console
      console.error(err);
      Sentry.captureException(err);

      return true;
    }
  }

  return true;
};

const INVALID_ELEVATION: number = -10000;

export function calcSlopeOfLength(
  coordinateAndElevations: [CoordinateAndElevation, CoordinateAndElevation],
): string {
  const [{ coordinate: coordinate1, elevation: elevation1 }, { coordinate: coordinate2, elevation: elevation2 }]:
    [CoordinateAndElevation, CoordinateAndElevation] = coordinateAndElevations;
  for (const num of [coordinate1, elevation1, coordinate2, elevation2]) {
    if (num === undefined || num === null || num === INVALID_ELEVATION) return INVALID;
  }
  const coordinatesInEPSG3857: Array<Coordinate> =
    [coordinate1, coordinate2]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
      .map((c) => proj4('EPSG:4326', 'EPSG:3857').forward(c!));
  const SEGMENT_LENGTH: number = new LineString(coordinatesInEPSG3857).getLength();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const PERPENDICULAR_LENGTH: number = Math.abs(elevation1! - elevation2!);
  if (Number.isNaN(PERPENDICULAR_LENGTH)) return INVALID;

  // eslint-disable-next-line no-magic-numbers
  return ((PERPENDICULAR_LENGTH / SEGMENT_LENGTH) * 100).toFixed(2);
}

/**
 * Depending on which type of the measurements, returns the correct location in DB.
 *
 * @param type Measurement type
 * @param coordinates coordinates in EPSG:3857.
 * @param projection current project's projection.
 */
export function getLocationsForDB(
  type: T.LocationBasedContentType,
  coordinates: T.GeoPoint[],
  projection: 'EPSG:4326' | 'EPSG:3857' | T.ProjectionEnum,
): T.GeoPoint[] {
  // For markers, the locations are projected to EPSG:3857 if they are from the listed projection below.
  // See https://angelswing.atlassian.net/browse/DFE-799 for more details.
  if (type === T.ContentType.MARKER && projection !== 'EPSG:4326' && projection !== 'EPSG:3857') {
    return [proj4('EPSG:3857', getEPSGfromProjectionLabel(projection)).forward(coordinates[0])];
  }

  // Return the coordinates as-is if it's already in EPSG:4326.
  if (projection === 'EPSG:4326') return coordinates;

  // Otherwise, project them to lon-lat as the default.
  return coordinates.map((coordinate: T.GeoPoint) => toLonLat(coordinate, 'EPSG:3857'));
}
