import PlusPNG from '^/assets/icons/annotation/add-point@2x.png';
import CheckSVG from '^/assets/icons/annotation/check.svg';
import { MarkerIconWithShadow } from '^/assets/icons/annotation/marker-on-map.svg';
import { ClickedOrMovingPointIcon } from '^/assets/icons/annotation/point-clicked.svg';
import {
  ARROW_DEFAULT_ALPHA,
  ESS_TEXT_ALPHA,
  POLYGON_ON_GROUND_ALPHA,
  POLYGON_ON_GROUND_EDGE_ALPHA,
} from '^/constants/cesium';
import { commonConstants } from '^/constants/map-display';
import palette from '^/constants/palette';
import * as T from '^/types';
import { makeIntoOlIcon } from '^/utilities/ol-layer-util';
import {
  BillboardGraphics,
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  ColorMaterialProperty,
  Entity,
  HeightReference,
  HorizontalOrigin,
  LabelGraphics,
  PolygonGraphics,
  PolygonHierarchy,
  PolylineArrowMaterialProperty,
  PolylineGraphics,
  VerticalOrigin,
} from 'cesium';
import Color from 'color';
import _ from 'lodash-es';
import React from 'react';
import { makeTextEliipsis } from '../cesium/styles';
import { getCesiumColor, getDegreesPositions, makeCesiumType } from './cesium-util';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { TextDefaultPointIcon } from '^/assets/icons/annotation/text-point-default.svg';
import { TextSelectedPointIcon } from '^/assets/icons/annotation/text-point-clicked.svg';


export { makeTextEliipsis } from '^/components/ol/styles';

export const ESS_ARROW_LINE_WIDTH: number = 20;
export const ESS_POLYLINE_WIDTH: number = 5;
const MEASUREMENT_POLYLINE_WIDTH: number = 2;

/* eslint-disable no-magic-numbers */
export function createCesiumMarkerOptions({
  color,
}: { color: Color }):
  Pick<
    BillboardGraphics.ConstructorOptions,
    'image' |
    'verticalOrigin' |
    'horizontalOrigin' |
    'heightReference' |
    'scale' |
    'pixelOffsetScaleByDistance' |
    'pixelOffset'
  > {
  return {
    image: makeIntoOlIcon(<MarkerIconWithShadow color={color} />),
    verticalOrigin: VerticalOrigin.BOTTOM,
    horizontalOrigin: HorizontalOrigin.LEFT,
    pixelOffset: new Cartesian3(-3, 3),
    heightReference: HeightReference.CLAMP_TO_GROUND,
    scale: commonConstants.markerIconScale,
    pixelOffsetScaleByDistance: undefined,
  };
}

export function createCesiumTextItemDefaultPointOptions({
  color,
}: { color: Color }):
  Pick<
    BillboardGraphics.ConstructorOptions,
    'image' |
    'verticalOrigin' |
    'horizontalOrigin' |
    'heightReference' |
    'scale' |
    'pixelOffsetScaleByDistance' |
    'pixelOffset'
    > {
  return {
    image: makeIntoOlIcon(<TextDefaultPointIcon color={color} />),
    verticalOrigin: VerticalOrigin.CENTER,
    horizontalOrigin: HorizontalOrigin.CENTER,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    scale: commonConstants.selectCircle,
    pixelOffset: new Cartesian3(2, 0),
    pixelOffsetScaleByDistance: undefined,
  };
}

export function createCesiumTextItemSelectPointOptions({
  textColor, labelColor,
}: { textColor?: Color; labelColor?: Color }):
  Pick<
    BillboardGraphics.ConstructorOptions,
    'image' |
    'verticalOrigin' |
    'horizontalOrigin' |
    'heightReference' |
    'scale' |
    'pixelOffsetScaleByDistance' |
    'pixelOffset'
    > {
  return {
    image: makeIntoOlIcon(<TextSelectedPointIcon textColor={textColor} labelColor={labelColor} />),
    verticalOrigin: VerticalOrigin.CENTER,
    horizontalOrigin: HorizontalOrigin.CENTER,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    scale: commonConstants.selectCircle,
    pixelOffset: new Cartesian3(2, 0),
    pixelOffsetScaleByDistance: undefined,
  };
}

export function createCesiumSelectPointOptions():
  Pick<
    BillboardGraphics.ConstructorOptions,
    'image' |
    'verticalOrigin' |
    'horizontalOrigin' |
    'heightReference' |
    'scale' |
    'pixelOffsetScaleByDistance' |
    'pixelOffset'
    > {
  return {
    image: makeIntoOlIcon(<ClickedOrMovingPointIcon color={palette.white} />),
    verticalOrigin: VerticalOrigin.CENTER,
    horizontalOrigin: HorizontalOrigin.CENTER,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    scale: commonConstants.selectCircle,
    pixelOffset: new Cartesian3(0, 0),
    pixelOffsetScaleByDistance: undefined,
  };
}

export function createCesiumPlusIcon(isPointToPoint: boolean):
  Pick<
    BillboardGraphics.ConstructorOptions,
    'image' |
    'verticalOrigin' |
    'horizontalOrigin' |
    'heightReference' |
    'scale' |
    'pixelOffsetScaleByDistance' |
    'pixelOffset' |
    'eyeOffset'
    > {
  return {
    image: encodeURI(PlusPNG),
    verticalOrigin: VerticalOrigin.CENTER,
    horizontalOrigin: HorizontalOrigin.CENTER,
    heightReference: isPointToPoint ? HeightReference.NONE : HeightReference.CLAMP_TO_GROUND,
    scale: commonConstants.plusCircle,
    pixelOffset: new Cartesian3(0, 0),
    pixelOffsetScaleByDistance: undefined,
    eyeOffset: new Cartesian3(0, 0, -1),
  };
}

export function createCesiumPolylineOptions(
  { color, locations, isPointToPoint }: { color: T.MeasurementContent['color']; locations: T.GeoPoint[]; isPointToPoint?: boolean }
):
  Pick<
    PolylineGraphics.ConstructorOptions,
    'positions' |
    'width' |
    'material' |
    'depthFailMaterial' |
    'clampToGround'
  > {
  return {
    positions: getDegreesPositions(locations),
    width: 2,
    material: new ColorMaterialProperty(
      getCesiumColor(color).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA),
    ),
    depthFailMaterial: new ColorMaterialProperty(
      getCesiumColor(palette.black).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA),
    ),
    clampToGround: !isPointToPoint,
  };
}

export function createCesiumPolygonOptions({ color, locations }: { color: T.MeasurementContent['color']; locations: T.GeoPoint[] }):
  Pick<
    PolygonGraphics.ConstructorOptions,
    'hierarchy' |
    'material'
  > {
  return {
    material: getCesiumColor(color).withAlpha(POLYGON_ON_GROUND_ALPHA),
    hierarchy: new PolygonHierarchy(locations.map(([lon, lat]) => Cartesian3.fromDegrees(lon, lat))),
  };
}

export function createCesiumLabelOptions({
  text,
  isPointToPoint,
}: {
  text: string;
  isPointToPoint?: boolean;
}): LabelGraphics.ConstructorOptions {
  return {
    text: makeTextEliipsis(text),
    fillColor: getCesiumColor(palette.OlMeasurementBox.title),
    font: commonConstants.labelFontStyle,
    heightReference : isPointToPoint ? HeightReference.NONE : HeightReference.CLAMP_TO_GROUND,
    horizontalOrigin : HorizontalOrigin.LEFT,
    verticalOrigin : VerticalOrigin.BOTTOM,
    pixelOffset: new Cartesian3(18, 22),
    showBackground : true,
    backgroundColor : getCesiumColor(palette.OlMeasurementBox.background),
    backgroundPadding : new Cartesian2(6, 6),
  };
}

export function createCesiumESSTextOptions({
  text,
  fontSize,
  fontColor,
  bgColor,
}: {
  text: string;
  fontSize: number;
  fontColor: Color;
  bgColor: Color;
}): LabelGraphics.ConstructorOptions {
  return {
    text,
    fillColor: getCesiumColor(fontColor),
    font: `bold ${fontSize}px Roboto`,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    horizontalOrigin: HorizontalOrigin.LEFT,
    verticalOrigin: VerticalOrigin.CENTER,
    pixelOffset: new Cartesian3(0, -18),
    showBackground: true,
    backgroundColor: getCesiumColor(bgColor).withAlpha(Math.min(bgColor.alpha(), ESS_TEXT_ALPHA)),
    backgroundPadding: new Cartesian2(6, 6),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

export const getConfirmationPointOptions: () => BillboardGraphics.ConstructorOptions = () => new BillboardGraphics({
  image: makeIntoOlIcon(<CheckSVG />),
  scale: 1,
  disableDepthTestDistance: Infinity,
  heightReference: HeightReference.CLAMP_TO_GROUND,
});

export const getCesiumContentEditingOptions: (params: {
  id: string;
  type: T.LocationBasedContentType;
  callbackPosition(): Cartesian3[] | undefined;
}) => Entity.ConstructorOptions = ({
  id, type, callbackPosition,
}) => {
  const options: Entity.ConstructorOptions = { id, name: makeCesiumType(type) };

  switch (type) {
    case T.ContentType.LENGTH: {
      options.polyline = {
        positions: new CallbackProperty(callbackPosition, false),
        clampToGround: false,
        width: MEASUREMENT_POLYLINE_WIDTH,
        material: new ColorMaterialProperty(
          getCesiumColor(palette.measurements[T.ContentType.LENGTH]).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA),
        ),
      };
      break;
    }
    case T.ContentType.AREA:
    case T.ContentType.VOLUME:
    case T.ContentType.ESS_POLYGON: {
      const color: Color = (() => {
        switch (type) {
          case T.ContentType.AREA:
          case T.ContentType.VOLUME: {
            return palette.measurements[type];
          }
          case T.ContentType.ESS_POLYGON: {
            return palette.ESSWorkTool[T.ContentType.ESS_POLYGON];
          }
          default: {
            exhaustiveCheck(type);
          }
        }
      })();

      const width: number = (() => {
        switch (type) {
          case T.ContentType.AREA:
          case T.ContentType.VOLUME: {
            return MEASUREMENT_POLYLINE_WIDTH;
          }
          case T.ContentType.ESS_POLYGON: {
            return ESS_POLYLINE_WIDTH;
          }
          default: {
            exhaustiveCheck(type);
          }
        }
      })();

      options.polygon = {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(callbackPosition()), false),
        material: new ColorMaterialProperty(
          getCesiumColor(color).withAlpha(POLYGON_ON_GROUND_ALPHA),
        ),
      };

      options.polyline = {
        positions: new CallbackProperty(callbackPosition, false),
        clampToGround: true,
        width,
        material: new ColorMaterialProperty(
          getCesiumColor(color).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA),
        ),
      };
      break;
    }
    case T.ContentType.ESS_ARROW: {
      options.polyline = {
        positions: new CallbackProperty(callbackPosition, false),
        clampToGround: true,
        width: ESS_ARROW_LINE_WIDTH,
        material: new PolylineArrowMaterialProperty(
          getCesiumColor(palette.ESSWorkTool[T.ContentType.ESS_ARROW])
            .withAlpha(ARROW_DEFAULT_ALPHA)
        ),
      };
      break;
    }
    case T.ContentType.ESS_POLYLINE: {
      options.polyline = {
        positions: new CallbackProperty(callbackPosition, false),
        clampToGround: true,
        width: ESS_POLYLINE_WIDTH,
        material: new ColorMaterialProperty(
          getCesiumColor(palette.ESSWorkTool[T.ContentType.ESS_POLYLINE]).withAlpha(POLYGON_ON_GROUND_EDGE_ALPHA),
        ),
      };
      break;
    }
    case T.ContentType.ESS_MODEL:
    case T.ContentType.ESS_TEXT: {
      break;
    }
    default: {
      throw new Error(`Invalid type for editing style in 3D: ${type}`);
    }
  }

  return options;
};
