import {
  DefaultLocationBasedContentParams,
  createDefaultArea,
  createDefaultESSWorkTool, createDefaultLength,
  createDefaultMarker, createDefaultVolume,
} from '^/constants/defaultContent';
import { commonConstants } from '^/constants/map-display';
import palette from '^/constants/palette';
import { LayerGroupZIndex } from '^/constants/zindex';
import { isLonLat } from '^/hooks';
import { PostContentArguments } from '^/store/duck/Contents';
import * as T from '^/types';
import { getEPSGfromProjectionLabel, projectionSystem } from '^/utilities/coordinate-util';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { getLocationsForDB } from '^/utilities/math';
import Color from 'color';
import { Coordinate } from 'ol/coordinate';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { getArea, getLength } from 'ol/sphere';
import { Fill } from 'ol/style';
import { Options as OlTextOptions } from 'ol/style/Text';
import proj4 from 'proj4';
import { olStyleFunctions } from './styles';
import { calculateArea, calculateDistance } from '^/utilities/imperial-unit';

/**
 * @desc get coordinates from geometry before POST Content to server
 */
export function getCoordinatesFromGeometry(
  geometry: Geometry, annotationContentType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>,
  projection: 'EPSG:4326' | 'EPSG:3857' | T.ProjectionEnum = 'EPSG:3857',
): Array<T.GeoPoint> {
  let coordinates: Array<T.GeoPoint> | undefined;
  proj4.defs(projectionSystem);
  switch (annotationContentType) {
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
      /**
       * @desc First of all, getCoordinates is not type definition somehow
       * Secondly, getCoordinates returns Array<Array<[number, number]>> while
       * it should be Array<[number, number]>
       */
      coordinates = (geometry as any).getCoordinates()[0];
      /**
       * @todo Ol Polygon has two same points at first and last by default. Remove duplicate point at the end.
       */
      coordinates?.pop();
      break;
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYLINE:
    case T.ContentType.ESS_POLYGON:
      coordinates = (geometry as any).getCoordinates();
      break;
    case T.ContentType.MARKER:
    case T.ContentType.ESS_TEXT:
      coordinates = [(geometry as Point).getLastCoordinate()];
      break;
    default:
      exhaustiveCheck(annotationContentType);
  }

  /**
   * @todo attach Sentry
   */
  // eslint-disable-next-line no-console
  if (!coordinates) throw new Error('trying to get coordinates from geometry, but they are undefined');

  return getLocationsForDB(annotationContentType, coordinates, projection);
}

export const contentTypeToGeometryType: {
  [K in NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>]: GeometryType;
} = {
  [T.ContentType.VOLUME]: GeometryType.POLYGON,
  [T.ContentType.AREA]: GeometryType.POLYGON,
  [T.ContentType.LENGTH]: GeometryType.LINE_STRING,
  [T.ContentType.MARKER]: GeometryType.POINT,
  [T.ContentType.ESS_ARROW]: GeometryType.LINE_STRING,
  [T.ContentType.ESS_POLYGON]: GeometryType.LINE_STRING,
  [T.ContentType.ESS_POLYLINE]: GeometryType.LINE_STRING,
  [T.ContentType.ESS_TEXT]: GeometryType.POINT,
};

const EPSG3857: string = 'EPSG:3857';

export function createGeometryFromLocations({
  locations,
  geometryType,
  projectProjection,
}: {
  locations: Array<Coordinate>;
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
  projectProjection?: T.ProjectionEnum;
}): Geometry {
  const locationsReprojectedToEPSG3857: Array<Coordinate> = (() => {
    if (geometryType === T.ContentType.MARKER) {
      if (!isLonLat(locations[0]) && projectProjection !== undefined) {
        return [proj4(getEPSGfromProjectionLabel(projectProjection), EPSG3857).forward(locations[0])];
      }
    }

    return locations.map((location) => fromLonLat(location, EPSG3857));
  })();

  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return new LineString(locationsReprojectedToEPSG3857);
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
      return new Polygon([[...locationsReprojectedToEPSG3857, locationsReprojectedToEPSG3857[0]]]);
    case T.ContentType.MARKER:
    case T.ContentType.ESS_TEXT:
      return new Point(locationsReprojectedToEPSG3857[0]);
    default:
      exhaustiveCheck(geometryType);
  }
}

export function initVectorLayer({
  source,
  color,
  geometryType,
  text,
}: {
  source: VectorSource;
  color: Color;
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
  text?: string;
}): VectorLayer {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return new VectorLayer({
        source,
        style: olStyleFunctions.defaultLayerStyle(color, text),
        zIndex: LayerGroupZIndex.VOLUME,
      });
    case T.ContentType.ESS_TEXT:
    case T.ContentType.MARKER:
      return new VectorLayer({
        source,
        style: olStyleFunctions.markerWithShadow(color, text),
        zIndex: 9999999999999,
      });
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getOverlayPositionFromGeometryType({
  geometry,
  geometryType,
}: {
  geometry: Geometry;
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
}): Coordinate {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return (geometry as LineString).getFlatMidpoint();
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
      return (geometry as Polygon).getInteriorPoint().getCoordinates();
    case T.ContentType.MARKER:
    case T.ContentType.ESS_TEXT:
      return (geometry as Point).getLastCoordinate();
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getMeasurementFromGeometry({
  geometry,
  geometryType,
}: {
  geometry: Geometry;
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
}): string {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return String(getLength(geometry).toFixed(2));
    case T.ContentType.AREA:
      return String(getArea(geometry).toFixed(2));
    case T.ContentType.VOLUME:
      return String(getArea(geometry).toFixed(0));
    case T.ContentType.MARKER:
    case T.ContentType.ESS_TEXT:
      return String((geometry as Point).getLastCoordinate());
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getImperialMeasurementFromGeometry({
  geometry,
  geometryType,
}: {
  geometry: Geometry;
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
}): string {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return String(calculateDistance(getLength(geometry), T.UnitType.IMPERIAL).toFixed(2));
    case T.ContentType.AREA:
      return String(calculateArea(getArea(geometry), T.UnitType.IMPERIAL).toFixed(2));
    case T.ContentType.VOLUME:
      return String(calculateArea(getArea(geometry), T.UnitType.IMPERIAL).toFixed(0));
    case T.ContentType.MARKER:
    case T.ContentType.ESS_TEXT:
      return String((geometry as Point).getLastCoordinate());
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getMeasurementUnitFromGeometryType({
  geometryType,
}: {
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
}): string {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
    case T.ContentType.MARKER:
      return 'm';
    case T.ContentType.AREA:
      return 'm²';
    case T.ContentType.VOLUME:
      return 'm³';
    case T.ContentType.ESS_TEXT:
      return '';
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getImperialMeasurementUnitFromGeometryType({
  geometryType,
}: {
  geometryType: NonNullable<T.ContentsPageState['currentContentTypeFromAnnotationPicker']>;
}): string {
  switch (geometryType) {
    case T.ContentType.LENGTH:
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
    case T.ContentType.MARKER:
      return 'ft';
    case T.ContentType.AREA:
      return 'ft²';
    case T.ContentType.VOLUME:
      return 'yd³';
    case T.ContentType.ESS_TEXT:
      return '';
    default:
      exhaustiveCheck(geometryType);
  }
}

export function getDefaultContentCreatorFromGeometryType({
  geometryType,
  createOptions,
}: {
  geometryType: T.GeometryContent['type'];
  createOptions: DefaultLocationBasedContentParams;
}): Pick<T.GeometryContent, PostContentArguments> {
  switch (geometryType) {
    case T.ContentType.LENGTH:
      return createDefaultLength(createOptions);
    case T.ContentType.AREA:
      return createDefaultArea(createOptions);
    case T.ContentType.VOLUME:
      return createDefaultVolume(createOptions);
    case T.ContentType.MARKER:
      return createDefaultMarker({ ...createOptions, location: createOptions.locations[0] });
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return createDefaultESSWorkTool({ ...createOptions, type: geometryType });
    default:
      exhaustiveCheck(geometryType);
  }
}

type ShapeContent = T.AreaContent | T.VolumeContent | T.LengthContent;

export const getMinNumberOfPointsToMakeShape: (contentType: ShapeContent['type']) => number = (contentType) => {
  switch (contentType) {
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
      // eslint-disable-next-line no-magic-numbers
      return 4;
    case T.ContentType.LENGTH:
      return 2;
    default:
      exhaustiveCheck(contentType);
  }
};

const baseOlTextStyle: OlTextOptions = {
  font: commonConstants.labelFontStyle,
  fill: new Fill({ color: palette.OlMeasurementBox.title.toString() }),
  backgroundFill: new Fill({ color: palette.OlMeasurementBox.background.toString() }),
  // eslint-disable-next-line no-magic-numbers
  padding: [7, 5, 6, 6],
  overflow: true,
};

export enum OlTextStyleGeometryType {
  NON_MARKER = 'NON_MARKER',
  MARKER = 'MARKER',
  PHOTO_MARKER = 'PHOTO_MARKER',
}

const WIDTH_PER_LETTER: number = 2;

export function createOlTextStyleFromGeometryType({
  geometryType,
  textLength,
}: {
  geometryType: OlTextStyleGeometryType;
  textLength: number;
}): OlTextOptions {
  const MAKRER_OFFSET_X: number = 33;
  const NON_MARKER_OFFSET_X: number = 30;
  const PHOTO_MARKER_OFFSET_X: number = 15;
  switch (geometryType) {
    case OlTextStyleGeometryType.NON_MARKER:
      return {
        ...baseOlTextStyle,
        offsetX: NON_MARKER_OFFSET_X + textLength * WIDTH_PER_LETTER,
        offsetY: 20,
      };
    case OlTextStyleGeometryType.MARKER:
      return {
        ...baseOlTextStyle,
        offsetX: MAKRER_OFFSET_X + textLength * WIDTH_PER_LETTER,
        offsetY: 20,
      };
    case OlTextStyleGeometryType.PHOTO_MARKER:
      return {
        ...baseOlTextStyle,
        offsetX: textLength * WIDTH_PER_LETTER - PHOTO_MARKER_OFFSET_X,
        offsetY: 40,
      };
    default:
      exhaustiveCheck(geometryType);
  }
}
