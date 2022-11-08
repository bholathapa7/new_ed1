/* eslint-disable max-lines */
import Collection, { CollectionEvent } from 'ol/Collection';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { boundingExtent, getCenter } from 'ol/extent';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import LineStringGeom from 'ol/geom/LineString';
import PointGeom from 'ol/geom/Point';
import PolygonGeom from 'ol/geom/Polygon';
import Interaction from 'ol/interaction/Interaction';
import { TranslateEvent } from 'ol/interaction/Translate';
import BaseVectorLayer from 'ol/layer/BaseVector';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import FillStyle from 'ol/style/Fill';
import IconStyle from 'ol/style/Icon';
import StrokeStyle from 'ol/style/Stroke';
import StyleStyle from 'ol/style/Style';

import React, { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Color from 'color';
import _ from 'lodash-es';

import palette from '^/constants/palette';

import DotWhite from '^/assets/icons/annotation/point-plain.svg';
import DotPlus from '^/assets/icons/annotation/point-plus.svg';
import DotTick from '^/assets/icons/annotation/point-tick.svg';
import { OlCustomPropertyNames } from '^/components/ol/constants';
import {
  getMeasurementFromGeometry,
  getMeasurementUnitFromGeometryType,
  getOverlayPositionFromGeometryType,
} from '^/components/ol/contentTypeSwitch';
import { olStyleFunctions } from '^/components/ol/styles';
import { ContentsPageState } from '^/types';
import { Overlay } from 'ol';

/**
 * Nums for working with ol layers
 */

/* eslint-disable no-magic-numbers */
export enum nums {
  AREA_ALPHA= 0.53,
  EDIT_CIRCLE_RADIUS = 4,
  NORMAL_CIRCLE_RADIUS = 7.5,
  SELECTED_CIRCLE_RADIUS = 13,
  SELECTED_CIRCLE_ALPHA = 0.4,
  DOT_CHECK_ICON_SIZE = 20,
  DOT_CHECK_ICON_SCALE = 1.3,
  DOT_PLUS_ICON_SIZE = 20,
  DOT_PLUS_ICON_SCALE = 1.3,
  DOT_PLUS_ICON_Z_INDEX = 200,
  DOT_WHITE_ICON_SIZE = 20,
  DOT_WHITE_ICON_SCALE = 1.3,
  MIDDLE_POINT_LAYER_Z_INDEX = 200,
  AREA_MAIN_WIDTH = 2.5,
  AREA_WHITE_WIDTH = 6,
  LENGTH_MAIN_WIDTH = 3.5,
  LENGTH_WHITE_WIDTH = 7,
  TWO = 2,
  THREE = 3,
  HIGHEST_Z_INDEX = Number.MAX_SAFE_INTEGER - 1,
  SI_GAP = 1000,
}

/**
 * Strings for working with ol layers
 */
export enum strings {
  LAST_POINT = 'LAST_POINT',
  BACKSPACE = 'Backspace',
  DELETE = 'Delete',
}

export const makeIntoOlIcon: (iconComponent: ReactElement) => string = (iconComponent) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(renderToStaticMarkup(iconComponent))}`;

export const DotTickIcon: string = makeIntoOlIcon(<DotTick />);

export const DotPlusIcon: string = makeIntoOlIcon(<DotPlus />);

/**
 * Why do we not just use a CircleStyle?
 * It would give a pixelated (unclear, blurred) circle.
 * That's why we resorted to using a svg.
 */
export const DotWhiteIcon: string = makeIntoOlIcon(<DotWhite />);

/**
 * Styles
 */

export const getSelectedCircleStyle: () => CircleStyle = () => new CircleStyle({
  radius: nums.SELECTED_CIRCLE_RADIUS,
  fill: new FillStyle({ color: palette.white.alpha(nums.SELECTED_CIRCLE_ALPHA).toString() }),
});

export const getDefaultCircleStyle: () => CircleStyle = () => new CircleStyle({
  radius: nums.NORMAL_CIRCLE_RADIUS,
  fill: new FillStyle({ color: palette.white.toString() }),
  stroke: new StrokeStyle({
    color: palette.black.toString(),
  }),
});

export const getDefaultLayerStyle: ({
  color, geoType,
}: { color: Color; geoType: GeometryType }) =>
  Array<StyleStyle> = ({ color, geoType }) => [
    new StyleStyle({
      stroke: new StrokeStyle({
        color: palette.white.alpha(0).toString(),
        width: nums.AREA_MAIN_WIDTH,
      }),
    }),
    new StyleStyle({
      stroke: new StrokeStyle({
        color: color.darken(0.1).toString(),
        width: geoType === GeometryType.LINE_STRING ? nums.LENGTH_MAIN_WIDTH : nums.AREA_MAIN_WIDTH,
      }),
      fill: new FillStyle({
        color: color.alpha(nums.AREA_ALPHA).toString(),
      }),
      image: undefined,
    }),
  ];

/**
 * Vectors and layers
 */
export interface LocationsToVectorParams {
  locations: Array<Coordinate>;
  editable: boolean;
  isNew: boolean;
  layerLocations: Array<Coordinate>;
  geoType: GeometryType;
  isEditAndLength?: boolean;
}

export const locationsToVector: (options: LocationsToVectorParams) => VectorSource
= ({ locations, editable, isNew, layerLocations, geoType, isEditAndLength }) => {
  const xylocs: Array<Coordinate> = locations.map((loc) => fromLonLat(loc));

  if (geoType === GeometryType.POLYGON) {
    return new VectorSource({
      features: new Collection(
        xylocs
          .map((xy, idx) => {
            const feature: Feature = new Feature(new PointGeom(xy));
            const isCheckIconVisible: boolean = idx === xylocs.length - 1 && editable && isNew;
            if (isCheckIconVisible
                && layerLocations.length > 2) {
              feature.setStyle(new StyleStyle({
                image: new IconStyle({
                  src: DotTickIcon,
                  size: [nums.DOT_CHECK_ICON_SIZE, nums.DOT_CHECK_ICON_SIZE],
                  scale: nums.DOT_CHECK_ICON_SCALE,
                }),
              }));
              feature.setId(strings.LAST_POINT);
            } else if (editable) {
              feature.setStyle(new StyleStyle({
                image: new IconStyle({
                  src: DotWhiteIcon,
                  size: [nums.DOT_WHITE_ICON_SIZE, nums.DOT_WHITE_ICON_SIZE],
                  scale: nums.DOT_WHITE_ICON_SCALE,
                }),
              }));
              feature.setId(`point-${idx}`);
            }

            return feature;
          })
          .concat([new Feature(new PolygonGeom([xylocs]))]),
      ),
    });
  } else if (geoType === GeometryType.LINE_STRING) {
    return new VectorSource({
      features: new Collection(
        xylocs
          .map((xy, idx) => {
            const feature: Feature = new Feature(new PointGeom(xy));
            const isCheckIconVisible: boolean = idx === xylocs.length - 1 && editable && isNew;
            if (isCheckIconVisible
                && layerLocations.length > 1
                && !isEditAndLength) {
              feature.setStyle(new StyleStyle({
                image: new IconStyle({
                  src: DotTickIcon,
                  size: [nums.DOT_CHECK_ICON_SIZE, nums.DOT_CHECK_ICON_SIZE],
                  scale: nums.DOT_CHECK_ICON_SCALE,
                }),
              }));
              feature.setId(strings.LAST_POINT);
            } else if (idx === 0 && isEditAndLength && layerLocations.length > 1) {
              feature.setStyle(new StyleStyle({
                image: undefined,
              }));
            } else if (editable) {
              feature.setStyle(new StyleStyle({
                image: new IconStyle({
                  src: DotWhiteIcon,
                  size: [nums.DOT_WHITE_ICON_SIZE, nums.DOT_WHITE_ICON_SIZE],
                  scale: nums.DOT_WHITE_ICON_SCALE,
                }),
              }));
              feature.setId(`point-${idx}`);
            }

            return feature;
          })
          .concat([new Feature(new LineStringGeom(xylocs))]),
      ),
    });
  }

  return new VectorSource();
};

type locationsToVectorSource = ({ locations, geoType }:
  { locations: Array<Coordinate>; geoType: GeometryType }) => VectorSource;

export const initLayerVectorSource: locationsToVectorSource = ({ locations, geoType }) => {
  const xylocs: Array<Coordinate> = locations.map((loc) => fromLonLat(loc));

  return new VectorSource({
    features: new Collection(
      [
        ...xylocs
          .map((xy) => new Feature(new PointGeom(xy))),
        ...[new Feature(
          geoType === GeometryType.POLYGON ?
            new PolygonGeom([xylocs]) :
            new LineStringGeom(xylocs),
        )],
      ],
    ),
  });
};

export const locationsToVectorMiddle: locationsToVectorSource = ({ locations, geoType }) => {
  const points: Array<Coordinate> = locations.map((loc, index) =>
    getCenter(boundingExtent(index === locations.length - 1 ?
      [locations[0], locations[locations.length - 1]] : [loc, locations[index + 1]])));

  if (geoType === GeometryType.LINE_STRING) points.pop();

  return new VectorSource({
    features: new Collection(
      points
        .map((xy, index) => {
          const feature: Feature = new Feature(new PointGeom(xy));
          feature.setStyle(olStyleFunctions.plusPoint);
          feature.set('id', `${OlCustomPropertyNames.PLUS}${index}`);

          return feature;
        })
        .concat([new Feature(
          geoType === GeometryType.POLYGON ?
            new PolygonGeom([points]) :
            new LineStringGeom(points),
        )]),
    ),
  });
};

export const createMiddlePointLayer:
  ({ locations, geoType }: { locations: Array<Coordinate>; geoType: GeometryType }) => VectorLayer
  = ({ locations, geoType }) => {
    const p: VectorSource = locationsToVectorMiddle({ locations, geoType });

    return new VectorLayer({
      source: p,
      zIndex: 99999999999999999999,
      style: new StyleStyle({
        stroke: new StrokeStyle({
          width: 0,
          // Omit this for debugging purposes
          color: palette.white.alpha(0).toString(),
        }),
        zIndex: 99999999999999999999,
      }),
    });
  };

export interface CreateEditLayerParams {
  locations: Array<Coordinate>;
  color: Color;
  isNew: boolean;
  zIndex: number;
  editable: boolean;
  geoType: GeometryType;
  isEditAndLength?: boolean;
}

export const createEditLayer: (options: CreateEditLayerParams) => VectorLayer
  = ({ locations, color, isNew, zIndex, editable, geoType, isEditAndLength }) => {
    const firstLocation: Coordinate = locations[0];
    const lastLocation: Coordinate = locations[locations.length - 1];
    /**
     * @desc lineBlackLength will be increased by two widths on both end.
     * i.e., real lineBlackLength is lineBlackLength + 2 * lineWidth
     */
    const lineBlackLength: number = 0;
    const lineSpaceLength: number = 6;

    const lineStringLocations: Array<Coordinate> = [lastLocation, lastLocation];
    const polygonLocations: Array<Coordinate> = [firstLocation, lastLocation, lastLocation];
    const isPolygon: boolean = geoType === GeometryType.POLYGON;

    return new VectorLayer({
      source: locationsToVector({
        locations: isPolygon ? polygonLocations : lineStringLocations,
        layerLocations: locations,
        editable,
        isNew,
        geoType,
        isEditAndLength,
      }),
      style: new StyleStyle({
        stroke: new StrokeStyle({
          lineDash: [lineBlackLength, lineSpaceLength],
          color: color.toString(),
          width: geoType === GeometryType.LINE_STRING ?
            nums.LENGTH_MAIN_WIDTH : nums.AREA_MAIN_WIDTH,
        }),
        fill: new FillStyle({
          color: isPolygon ? color.alpha(nums.AREA_ALPHA).toString() :
            color.toString(),
        }),
      }),
      zIndex,
    });
  };

export const initSelectInteractionPointLayer:
  ({ location }: { location: Coordinate }) => VectorSource
  = ({ location }) => {
    const circleFeature: Feature = new Feature(new PointGeom(location));
    circleFeature.setStyle(new StyleStyle({
      image: getSelectedCircleStyle(),
    }));

    return new VectorSource({
      features: [circleFeature],
    });
  };


export interface LayerActionFunctionParams {
  map: OlMap;
  layer?: BaseVectorLayer;
  layerGroup?: LayerGroup;
  interactions?: Array<Interaction>;
}

export type layerActionFunction =
  ({ map, layerGroup, layer, interactions }: LayerActionFunctionParams) => void;

export const attachLayer: layerActionFunction = ({ map, layerGroup, layer, interactions }) => {
  if (layer !== undefined) {
    if (layerGroup !== undefined) {
      layerGroup.getLayers().push(layer);
    } else {
      map.addLayer(layer);
    }
  }
  if (interactions !== undefined) {
    // Changing it to forEach(map.addInteraction) will break it
    interactions.forEach((interaction) => map.addInteraction(interaction));
  }
};

export const detachLayer: layerActionFunction = ({ map, layerGroup, layer, interactions }) => {
  if (layer !== undefined) {
    if (layerGroup !== undefined) {
      layerGroup.getLayers().remove(layer);
    } else {
      map.removeLayer(layer);
    }
  }
  if (interactions !== undefined) {
    // Changing it to forEach(map.removeInteraction) will break it
    interactions.forEach((interaction) => map.removeInteraction(interaction));
  }
};

/**
 * Misc
 */
export type getPointCoordinatesFromFeaturesArray =
  (featuresArr: Array<Feature>) => Array<Coordinate>;

export const getPointCoordinatesFromFeaturesArray:
  getPointCoordinatesFromFeaturesArray = (featuresArr) =>
    featuresArr.map(
      (feature: Feature) => feature.getGeometry(),
    ).filter(
      (geom: Geometry) => geom.getType() === GeometryType.POINT,
    ).map(
      (point: PointGeom) => toLonLat(point.getCoordinates()),
    );

export interface UpdateLayerColorParams {
  layer: VectorLayer;
  toColor: Color;
  geoType: GeometryType;
  isSelected?: boolean;
}

type OlAnnotationStyle = Array<StyleStyle> | StyleStyle;
export type updateColorLayer = ({ layer, toColor, geoType }: UpdateLayerColorParams) => void;

export const updateLayerColor: updateColorLayer = ({ layer, toColor, geoType, isSelected }) => {
  let styles: OlAnnotationStyle = layer.getStyle() as OlAnnotationStyle;

  styles = Array.isArray(styles) ? styles : [styles];

  styles.forEach((style, idx) => {
    if (idx === 0) {
      if (Boolean(isSelected)) {
        style.setStroke(new StrokeStyle({
          color: palette.white.toString(),
          width: geoType === GeometryType.LINE_STRING ?
            nums.LENGTH_WHITE_WIDTH : nums.AREA_WHITE_WIDTH,
        }));
      } else {
        style.setStroke(new StrokeStyle({
          color: palette.white.alpha(0).toString(),
        }));
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      style.getStroke()?.setColor(toColor.toString());
      if (geoType === GeometryType.POLYGON) {
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        style.getFill()?.setColor(toColor.alpha(nums.AREA_ALPHA).toString());
      }
    }
  });

  layer.changed();
};

export interface SetLayerZIndexifDefinedParams {
  layer: VectorLayer | undefined;
  zIndex: number;
}

export type setLayerZIndexIfDefined = ({ layer, zIndex }: SetLayerZIndexifDefinedParams) => void;

export const setLayerZIndexIfDefined: setLayerZIndexIfDefined = ({ layer, zIndex }) => {
  if (layer !== undefined) {
    layer.setZIndex(zIndex);
  }
};

export const filterPoints: (feat: Feature) => boolean = (feat) => {
  const geometry: Geometry | undefined = feat.getGeometry();

  return geometry?.getType() === GeometryType.POINT;
};

export const getCoordinateFromCollectionEvent: (event: CollectionEvent<Feature>) => Coordinate
  = (event) => (event.element.getGeometry() as PointGeom).getCoordinates();

export const getPolygonFromLayer: (layer: VectorLayer) => PolygonGeom = (layer) =>
  layer
    .getSource()
    .getFeatures()
    .map((feature: Feature) => feature.getGeometry())
    .filter((geom: Geometry) => geom.getType() === 'Polygon')[0] as PolygonGeom;

export const getLineStringFromLayer: (layer: VectorLayer) => LineStringGeom = (layer) =>
  layer
    .getSource()
    .getFeatures()
    .map((feature: Feature) => feature.getGeometry())
    .filter((geom: Geometry) => geom.getType() === 'LineString')[0] as LineStringGeom;

export const getLookUpIndexFromEvent: (event: TranslateEvent) => number = (event) =>
  Number((event.features.getArray()[0].getId() as string).split('-')[1]);

export interface RealTimeMeasurementTooltipOverlayAndElement {
  realtimeMeasurementTooltip: Overlay;
  realtimeMeasurementTooltipElement: HTMLDivElement;
}

export function makeRealtimeMeasurementTooltip(): RealTimeMeasurementTooltipOverlayAndElement {
  const realtimeMeasurementTooltipElement: HTMLDivElement = document.createElement('div');
  const realtimeMeasurementTooltip: Overlay = new Overlay({
    element: realtimeMeasurementTooltipElement,

    offset: [0, -30],
    positioning: 'center-center' as any,
    className: OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME,
    stopEvent: false,
    insertFirst: true,
  });
  realtimeMeasurementTooltip.set('id', OlCustomPropertyNames.OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME);

  return {
    realtimeMeasurementTooltip,
    realtimeMeasurementTooltipElement,
  };
}

export type UpdateRealtimeMeasuementTooltipParams = RealTimeMeasurementTooltipOverlayAndElement & {
  geometry: Geometry;
  geometryType: NonNullable<ContentsPageState['currentContentTypeFromAnnotationPicker']>;
  overridingTooltipText?: string;
  overridingTooltipPosition?: Coordinate;
};

export function updateMeasurementTooltip({
  realtimeMeasurementTooltip,
  realtimeMeasurementTooltipElement,
  geometry,
  geometryType,
  overridingTooltipText,
  overridingTooltipPosition,
}: UpdateRealtimeMeasuementTooltipParams): void {
  const geometryRelatedFunctionParams: {
    geometry: Geometry;
    geometryType: NonNullable<ContentsPageState['currentContentTypeFromAnnotationPicker']>;
  } = {
    geometry, geometryType,
  };
  realtimeMeasurementTooltipElement.textContent =
  overridingTooltipText === undefined ?
    `${getMeasurementFromGeometry(geometryRelatedFunctionParams)}${getMeasurementUnitFromGeometryType({
      geometryType,
    })}` : overridingTooltipText;
  realtimeMeasurementTooltip.setPosition(
    overridingTooltipPosition ?
      overridingTooltipPosition :
      getOverlayPositionFromGeometryType(geometryRelatedFunctionParams),
  );
}

export interface GetLayerByIdParams {
  olMap: OlMap;
  id: number | string;
}

export function getLayerById<U extends BaseVectorLayer>({ olMap, id }: GetLayerByIdParams): U | undefined {
  return olMap.getLayers().getArray().find((l) => l.get('id') === id) as U | undefined;
}
