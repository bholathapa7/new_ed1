/* eslint-disable no-magic-numbers */
/* eslint-disable max-lines */
import * as Sentry from '@sentry/browser';
import * as T from '^/types';
import Color from 'color';
import _, { flow as compose } from 'lodash-es';
import { LineString } from 'ol/geom';

import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color as CesiumColor,
  ConstantPositionProperty,
  CustomDataSource,
  DataSource,
  DataSourceCollection,
  Ellipsoid,
  Math as CesiumMath,
  Ray,
  Viewer,
  defined,
  Entity,
  ConstantProperty,
  Transforms,
  ColorMaterialProperty,
  HeadingPitchRoll,
  Matrix4,
} from 'cesium';

import { CoordinateAndElevation } from '^/components/ol/OlLengthSegmentOverlays/util';
import { createGeometryFromLocations, getImperialMeasurementFromGeometry, getMeasurementFromGeometry } from '^/components/ol/contentTypeSwitch';
import { CESIUM_ENTITY_PREFIX, ESS_MODEL_HEADING_CONTROLS, THREED_TILESET_BOUNDS_ID } from '^/constants/cesium';
import { cesiumConstants as CC } from '^/constants/map-display';
import { AuthHeader, jsonContentHeader, volumeServiceHostname } from '^/store/duck/API';
import { calcSlopeOfLength } from '^/utilities/math';
import proj4 from 'proj4';
import { Observable, of } from 'rxjs';
import { AjaxResponse, ajax } from 'rxjs/ajax';
import { catchError, map } from 'rxjs/operators';

// Convert 'color' to Cesium Color
export const getCesiumColor: (color: Color) => CesiumColor = (color) => new CesiumColor(...color.unitArray());

// // Calculate the length of a Polyline
// // @info https://gis.stackexchange.com/questions/175399/cesium-js-line-length/236940
// // @todo Make sure this is used correctly in 2D / 3D
// export const getPolylineLength: (positions: Array<Cartesian3>) => number = (positions) => {
//   const surfacePositions: any = GeometryPipeline.generateArc({ positions });
//   const scratchCartesian3: Cartesian3 = new Cartesian3();
//   const surfacePositionsLength: number = surfacePositions.length;
//   let totalDistanceInMeters: number = 0;
//   for (let i: number = 3; i < surfacePositionsLength; i += 3) {
//     scratchCartesian3.x = surfacePositions[i] - surfacePositions[i - 3];
//     scratchCartesian3.y = surfacePositions[i + 1] - surfacePositions[i - 2];
//     scratchCartesian3.z = surfacePositions[i + 2] - surfacePositions[i - 1];
//     totalDistanceInMeters += Cartesian3.magnitude(scratchCartesian3);
//   }

//   return round(totalDistanceInMeters, 2);
// };

// Calculate the area of a Polygon
// @info https://groups.google.com/forum/#!topic/cesium-dev/EimmL-poCDI
// @todo Make sure this is used correctly in 2D / 3D
// export const getPolygonArea: (positions: Array<Cartesian3>, holes?: Array<PolygonHierarchy>) => number = (positions, holes) => {
//   // "indices" here defines an array, elements of which defines the indice of a vector
//   // Defining one corner of a triangle. Add up the areas of those triangles to get
//   // An approximate area for the polygon
//   const indices: any = PolygonPipeline.triangulate(positions, holes);
//   let area: number = 0; // In square kilometers

//   for (let i: number = 0; i < indices.length; i += 3) {
//     const vector1: any = positions[indices[i]];
//     const vector2: any = positions[indices[i + 1]];
//     const vector3: any = positions[indices[i + 2]];

//     // These vectors define the sides of a parallelogram (double the size of the triangle)
//     const vectorC: any = Cartesian3.subtract(vector2, vector1, new Cartesian3());
//     const vectorD: any = Cartesian3.subtract(vector3, vector1, new Cartesian3());

//     // Area of parallelogram is the cross product of the vectors defining its sides
//     const areaVector: any = Cartesian3.cross(vectorC, vectorD, new Cartesian3());

//     // Area of the triangle is just half the area of the parallelogram, add it to the sum.
//     area += Cartesian3.magnitude(areaVector) / 2;
//   }

//   return round(area, 2);
// };

// Compute the center position of a given polygon's positions
// @desc https://groups.google.com/forum/#!topic/cesium-dev/zAJwEbd9irQ
export const getCenterPosition: (positions: Array<Cartesian3>) => ConstantPositionProperty = (positions) => {
  const center: Cartesian3 = BoundingSphere.fromPoints(positions).center;
  Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);

  return new ConstantPositionProperty(center);
};

/**
 * Ol -> Cesium
 */

/**
 * @desc https://angelswing.atlassian.net/wiki/spaces/PROD/pages/93585425/zoom+location+rotation+synchronization+in+2D+and+3D#Zoom-level
 */
export function convertOlZoomToCesiumAlt(olZoom?: number): number {
  if (olZoom === undefined) {
    // Return default altitude if there is no olZoom
    return 7657;
  }

  /* istanbul ignore next: impossible to test */
  return (9.624 * (10 ** 7)) * (2 ** (1 - olZoom));
}

export interface LonLatAlt {
  lon: number;
  lat: number;
  alt: number;
}

export interface SetCesiumCameraPositionParams extends LonLatAlt {
  viewer: Viewer;
  pitch: number;
  rotation: number;
}

export function setCesiumCameraPosition({
  viewer,
  lon,
  lat,
  alt,
  pitch,
  rotation,
}: SetCesiumCameraPositionParams): void {
  if (viewer.isDestroyed()) return;
  viewer.camera.flyTo({
    duration: 0,
    destination : Cartesian3.fromDegrees(lon, lat, alt),
    orientation: {
      ...CC.defaultCameraOrientation,
      pitch: CesiumMath.toRadians(-pitch),
      heading: -rotation,
    },
  });
}

export type ElevationValueObservable = Observable<T.ElevationInfo['value']>;

export interface RequestElevationInfoOnCoordinateParams {
  lastDSMId?: number;
  authHeader?: AuthHeader;
  lon: number;
  lat: number;
}
export function requestElevationInfoOnCoordinate({
  lastDSMId, lon, lat, authHeader,
}: RequestElevationInfoOnCoordinateParams): ElevationValueObservable {
  // Simply send out an empty once-signal since there's no DSM.
  if (!lastDSMId) return of(0);

  const URL: string =
    `https://${volumeServiceHostname}/elev/${lastDSMId}?lon=${lon}&lat=${lat}`;

  const request$: ElevationValueObservable = ajax.get(URL, {
    ...authHeader,
    ...jsonContentHeader,
  })
    .pipe(
      catchError(() => of(0)),
      map(({ response }: AjaxResponse) => response?.value === undefined ? 0 : response.value),
    );

  request$.subscribe({
    error: (err) => Sentry.captureException(err),
  });

  return request$;
}

/**
 * Cesium -> Ol
 *
 * @desc https://angelswing.atlassian.net/wiki/spaces/PROD/pages/93585425/zoom+location+rotation+synchronization+in+2D+and+3D#Zoom-level
 */
/* istanbul ignore next: impossible to test */
export const convertCesiumAltToOlZoom: (cesiumAlt: number) => number = (cesiumAlt) =>
  -1.4427 * Math.log(5.19535 * ((10 ** (-9)) * cesiumAlt));

export type LonLat = Omit<LonLatAlt, 'alt'>;

interface RayAndViewer {
  ray: Ray;
  viewer: Viewer;
}

export const getRayFromMapCenter: (viewer: Viewer, canvas: Element) => RayAndViewer =
  (viewer, { clientWidth, clientHeight }) => ({
    ray: viewer.camera.getPickRay(
      new Cartesian2(
        ...[clientWidth, clientHeight].map((val: number) => Math.round(val / 2)),
      ),
    ),
    viewer,
  });

export const getPositionFromRay: ({ ray, viewer }: RayAndViewer) => Cartesian3 | undefined =
  ({ ray, viewer }) => viewer.scene.globe.pick(ray, viewer.scene);

export const getCartographicFromPosition: (position: Cartesian3) => Cartographic =
  (position) => {
    // Note that in some edge cases, although the types didn't say that,
    // the function might return undefined, and it will break when getting the longitude/latitude.
    // Not sure what causes it, but add a fallback in case it happens.
    const cartographic: Cartographic = Ellipsoid.WGS84.cartesianToCartographic(position);

    return defined(cartographic) ? cartographic : new Cartographic();
  };

export const getLonLatFromCartographic: (cartographic: Cartographic) => LonLat =
  ({ longitude, latitude }) => ({
    lon: CesiumMath.toDegrees(longitude),
    lat: CesiumMath.toDegrees(latitude),
  });

export const getLonLatAltFromCartographic: (cartographic: Cartographic) => LonLatAlt =
  ({ longitude, latitude, height }) => ({
    lon: CesiumMath.toDegrees(longitude),
    lat: CesiumMath.toDegrees(latitude),
    alt: height,
  });

export const getLonLatFromCenter: (viewer: Viewer, canvas: Element) => LonLat = compose(
  getRayFromMapCenter,
  getPositionFromRay,
  getCartographicFromPosition,
  getLonLatFromCartographic,
);

export const getCesiumMapCenter: (viewer: Viewer) => LonLatAlt | undefined = (viewer) => {
  const {
    camera,
    scene: {
      canvas,
      mapProjection: { ellipsoid },
    },
  }: Viewer = viewer;
  try {
    const lonLat: LonLat = getLonLatFromCenter(viewer, canvas);
    const cartographic: Cartographic = new Cartographic();
    ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);

    return {
      ...lonLat,
      alt: cartographic.height,
    };
  } catch (e) {
    return undefined;
  }
};

export const getTitlePosition: (locations: T.GeoPoint[]) => Cartesian3 = (locations) => {
  const positions = getDegreesPositions(locations);
  if (positions.length < 2) return new Cartesian3();
  const difference = Cartesian3.subtract(positions[1], positions[0], new Cartesian3());

  // If the user double-clicks when creating measurement, an error occurs during normalization
  // if the coordinates of the two points are completely the same.
  // If there is no distance between the two points, the coordinates are exactly the same, so we return the first of the two.
  if (Cartesian3.ZERO.equals(difference)) return positions[0];

  const distance = Cartesian3.magnitude(difference);
  const direction = Cartesian3.normalize(difference, new Cartesian3());

  return Cartesian3.add(positions[0], Cartesian3.multiplyByScalar(direction, distance * 0.5, new Cartesian3()), new Cartesian3());
};

/**
 * General purpose for both Cesium and Ol
 */
export const from3857to4326: (x: number) => number = (x) => {
  const [xIn4326]: [number, number] =
    proj4('EPSG:3857', 'EPSG:4326').forward([x, 0]) as [number, number];

  return xIn4326;
};

/* istanbul ignore next: hard to test */
export const getRadiusIn4326: (altIn4326: number, pitchInRadians: number) => number = (
  altIn4326, pitchInRadians,
) => altIn4326 / Math.tan(pitchInRadians);

/**
 * The pitchInRadians is the angle you look down from. For example, if you are looking at the map
 * from the very top, just like 2D, the pitchInRadians is 90 degrees, not 0.
 */
export const getRadiusFromAltitude: (alt: number) => (pitchInRadians: number) => number = compose(
  from3857to4326,
  (altIn4326) => (pitchInRadians: number) => getRadiusIn4326(altIn4326, pitchInRadians),
);

export const getRadiusForOl: (cesiumAlt: number) => (pitchInRadians: number) => number = compose(
  convertCesiumAltToOlZoom,
  getRadiusFromAltitude,
);

export const getRadiusForCesium: (olZoom?: number | undefined) => (pitchInRadians: number) => number = compose(
  convertOlZoomToCesiumAlt,
  getRadiusFromAltitude,
);

export const getLonLatFromPosition: (position: Cartesian3) => LonLat = compose(
  getCartographicFromPosition,
  getLonLatFromCartographic,
);

export const getLonLatAltFromPosition: (position: Cartesian3) => LonLatAlt = compose(
  getCartographicFromPosition,
  getLonLatAltFromCartographic,
);

export const parseLastNumberFrom: (id: string | undefined) => number = (id) => {
  if (!id) {
    return NaN;
  }

  const stringIndex: string | undefined = id.split('-').pop();

  return stringIndex === undefined ? NaN : parseInt(stringIndex, 10);
};

export const getPositionOnTerrain: (
  position: Cartesian3, viewer: Viewer, isPointToPoint?: boolean
) => Cartesian3 = (position, viewer, isPointToPoint) => {
  if (isPointToPoint) {
    const geopoint: T.GeoPoint = Object.values(getLonLatAltFromPosition(position));
    return Cartesian3.fromDegrees(geopoint[0], geopoint[1], geopoint[2]);
  }

  const geopoint: T.GeoPoint = Object.values(getLonLatFromPosition(position));
  const height: number | undefined = viewer.scene.globe.getHeight(Cartographic.fromDegrees(geopoint[0], geopoint[1]));

  return Cartesian3.fromDegrees(geopoint[0], geopoint[1], height);
};

export function makeCesiumId(id: T.BaseContent['id']): string {
  return `${CESIUM_ENTITY_PREFIX}-${id}`;
}

export function makeCesiumType(type: T.MeasurementContent['type'] | T.ESSContent['type']): string {
  return `${CESIUM_ENTITY_PREFIX}-type-${type}`;
}

export const getSegmentLabelInfo: (values: [CoordinateAndElevation, CoordinateAndElevation], unitType?: T.UnitType)
=> { slope: string; distance: string} = (values, unitType) => {
  const slope: string = calcSlopeOfLength(values);
  const geometry: LineString = createGeometryFromLocations({
    locations: [values[0].coordinate, values[1].coordinate],
    geometryType: T.ContentType.LENGTH,
  }) as LineString;
  const distance: string = (unitType && unitType === T.UnitType.IMPERIAL) ?
    getImperialMeasurementFromGeometry({ geometry, geometryType: T.ContentType.LENGTH }) :
    getMeasurementFromGeometry({ geometry, geometryType: T.ContentType.LENGTH });

  return {
    slope: slope === 'INVALID' ? '-' : slope,
    distance,
  };
};

export function getSpecificDataSourcefrom<U extends DataSource>({
  dataSourceCollection,
  dataSourceName,
  Constructor,
}: {
  dataSourceCollection: DataSourceCollection;
  dataSourceName: string;
  Constructor: new (...params: any) => U;
}): U | null {
  const dataSources: Array<DataSource> = dataSourceCollection.getByName(dataSourceName);
  if (!(dataSources[0] instanceof Constructor)) {
    Sentry.captureMessage(
      `there must be one unique dataSourceName, but found no dataSource at all or more than one dataSources. dataSourceName: ${dataSourceName}`
    );

    if (dataSources.length === 0) return null;
    if (dataSources.length >= 2) return dataSources[0] as U;
  }

  return dataSources[0] as U;
}

export const getCustomLayer: (viewer: Viewer, id: string) => CustomDataSource | undefined = (
  viewer, id,
) => {
  if (viewer.isDestroyed()) return;

  const sources: CustomDataSource[] = viewer.dataSources.getByName(id);
  if (sources.length === 0) return;

  return sources[0];
};

export const createCustomLayer: (viewer: Viewer, id: string) => void = (
  viewer, id,
) => {
  if (viewer.isDestroyed()) return;

  if (!getCustomLayer(viewer, id)) {
    const dataSource: CustomDataSource = new CustomDataSource(id);
    void viewer.dataSources.add(dataSource);
  }
};

export const deleteCustomLayer: (viewer: Viewer, id: string) => void = (
  viewer, id,
) => {
  if (viewer.isDestroyed()) return;

  const source: CustomDataSource | undefined = getCustomLayer(viewer, id);
  if (source) {
    viewer.dataSources.remove(source, true);
  }
};

export const setThreeDTilesetCenter: (params: {
  viewer: Viewer;
  minBounds: Cartesian3;
  maxBounds: Cartesian3;
}) => void = ({ viewer, minBounds, maxBounds }) => {
  const centerPoint = Cartesian3.lerp(minBounds, maxBounds, 1/2, new Cartesian3());
  let tilesetBoundEntity: Entity | undefined = viewer.entities.getById(THREED_TILESET_BOUNDS_ID);

  if (tilesetBoundEntity?.polyline) {
    tilesetBoundEntity.position = new ConstantPositionProperty(centerPoint);
    tilesetBoundEntity.polyline.positions = new ConstantProperty([minBounds, maxBounds]);
  } else {
    tilesetBoundEntity = viewer.entities.add({
      id: THREED_TILESET_BOUNDS_ID,
      position: centerPoint,
      polyline: {
        positions: [minBounds, maxBounds],
        material: new ColorMaterialProperty(CesiumColor.WHITE.withAlpha(0)),
      },
    });
  }

  // Simplest way to center while acknowledging its bounds for now
  // is to set the min/max bounds as a transparet line then zooms into it.
  void viewer.zoomTo(tilesetBoundEntity);
};

/**
 * Get the position of an entity depending on the mesh/terrrain available.
 */
export const getMeshOrTerrainPosition: (
  position: Cartesian3, entity: Entity, viewer: Viewer,
) => Cartesian3 = (
  position, entity, viewer,
) => {
  // There are cases where viewer or cesiumWidget is undefined,
  // even though the viewer is defined. It will throw an error when retriving viewer.scene.
  if (!viewer || !defined(viewer) || !viewer.cesiumWidget) return Cartesian3.ZERO;

  return viewer.scene.clampToHeight(position, [entity]) ?? getPositionOnTerrain(position, viewer);
};

export const shouldShowMoveCursor: (entity: Entity | undefined) => boolean = (entity) => {
  switch (entity?.name) {
    case makeCesiumType(T.ContentType.ESS_MODEL):
    case ESS_MODEL_HEADING_CONTROLS: {
      return true;
    }
    default: {
      return false;
    }
  }
};

export const zoomToCoordinate: (
  viewer: Viewer, coordinate: T.GeoPoint,
) => void = (
  viewer, coordinate,
) => {
  if (!viewer || !defined(viewer) || !viewer.cesiumWidget) return;

  // In order to show the camera a little higher,
  // move them above the ground by this amount,
  // otherwise it's too close to the center point.
  const DEFAULT_HEIGHT_OFFSET = 25;

  // Get the height of the center point properly because
  // it has to place the camera following where the content is
  // on the terrain map.
  const heightFromTerrain = Math.max(
    viewer.scene.globe.getHeight(Cartographic.fromDegrees(coordinate[0], coordinate[1])) ?? 0,
    0,
  );
  const height = heightFromTerrain + DEFAULT_HEIGHT_OFFSET;
  const center = Cartesian3.fromDegrees(coordinate[0], coordinate[1], height);

  // Different calculations for when item is on the ground or not
  // since it needs to take the height of the dataset into account.
  const yOffset = heightFromTerrain === 0
    ? -DEFAULT_HEIGHT_OFFSET * 2
    : -Math.sqrt(height * DEFAULT_HEIGHT_OFFSET / 2);
  const localFrame = Transforms.eastNorthUpToFixedFrame(center);

  // Move the camera destination following the height offset specified.
  const offset = new Cartesian3(0, yOffset, 0);
  const transformedOffset = Matrix4.multiplyByPoint(localFrame, offset, new Cartesian3());

  viewer.camera.setView({
    destination: transformedOffset,
    orientation: new HeadingPitchRoll(0, -Math.PI / 5, 0),
  });
};


export const getDegreesPositions: (locations: T.GeoPoint[]) => Cartesian3[] = (locations) => {
  if (!locations[0]) return [];

  // Cartesian3.fromDegreesArrayHeights(locations) throws and Error when locations is an empty array
  return isAvailablePointToPoint(locations)
    ? Cartesian3.fromDegreesArrayHeights(_.flatten(locations))
    : Cartesian3.fromDegreesArray(_.flatten(locations.map((location) => location.slice(0, 2))));
};

export const hasLonLatHeight: (location: T.GeoPoint) => boolean = (location) => location.length === 3;

export const isAvailablePointToPoint: (locations: T.GeoPoint[]) => boolean = (locations) =>
  locations.every(hasLonLatHeight);

// When Measurement is created, it is sometimes initialized
// without the distance type of config due to the hepatic request order.
// So I added undefined in condition
export const isContentPointToPoint: (content: T.Content) => boolean = (content) =>
  content.type === T.ContentType.LENGTH
    && [undefined, T.DistanceType.HORIZONTAL, T.DistanceType.POINT_TO_POINT].includes(content.config?.distanceType)
    && isAvailablePointToPoint(content.info.locations);

export const getRGBOfEntity: (entityColor: string | undefined) => Color = (entityColor) => {
  const rgbaValues = entityColor?.match(/\((.*?)\)/)?.slice(1, 2).pop();
  /* eslint-disable no-magic-numbers */
  const red = Number(rgbaValues?.split(', ')[0]) * 255;
  const green = Number(rgbaValues?.split(', ')[1]) * 255;
  const blue = Number(rgbaValues?.split(', ')[2]) * 255;
  const alpha = Number(rgbaValues?.split(', ')[3]);
  const color = Color.rgb(red, green, blue, alpha);

  return color;
};
