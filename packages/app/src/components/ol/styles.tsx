/* eslint-disable no-magic-numbers, max-lines */
import Color from 'color';
import { FeatureLike } from 'ol/Feature';
import GeometryType from 'ol/geom/GeometryType';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import IconAnchorUnits from 'ol/style/IconAnchorUnits';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import OlText from 'ol/style/Text';
import React from 'react';

import PlusPNG from '^/assets/icons/annotation/add-point@2x.png';
import CheckSVG from '^/assets/icons/annotation/check.svg';
import CurrentLocationSVG from '^/assets/icons/annotation/current-location.svg';
import PlainWhitePNG from '^/assets/icons/annotation/edit-point@2x.png';
import { MarkerIconWithShadow, MarkerIconWithoutShadow } from '^/assets/icons/annotation/marker-on-map.svg';
import { ClickedOrMovingPointIcon } from '^/assets/icons/annotation/point-clicked.svg';
import BlueGCPMarker from '^/assets/icons/blue-gcp-marker.png';
import GCPMarker from '^/assets/icons/gcp-marker.png';
import RotateDefaultSVG from '^/assets/icons/rotate-default.svg';
import PhotoMarkerPNG from '^/assets/icons/photo/photo-marker.png';
import { commonConstants } from '^/constants/map-display';
import palette from '^/constants/palette';
import * as T from '^/types';
import { isMobile } from '^/utilities/device';
import { makeIntoOlIcon } from '^/utilities/ol-layer-util';
import { OlCustomPropertyNames } from './constants';
import { OlTextStyleGeometryType, createOlTextStyleFromGeometryType } from './contentTypeSwitch';
import dsPalette from '^/constants/ds-palette';

export enum ColorNumbers {
  Point05 = 0.5,
  Point02 = 0.2,
  Point17 = 0.17,
}

export interface DesignDxfStyleParam {
  color: Color;
  strokeWidth: number;
  fillAlpha?: number;
}

/**
 * @desc Do not use mere style but use styleFunctions, because they increase performance greatly
 * describe an action or a state for a key name
 */
export const olStyleFunctions: {
  mouseHoverOnLayer(color: Color): () => Style;
  newlyCreatedVectorLayer(): Style;
  markerWithoutShadow(color: Color): Style;
  markerWithShadow(color: Color, text?: string): () => Style;
  emptyCircle(): Style;
  blueCircle(): Style;
  rotateDefaultPoint(): Style;
  plainWhitePoint(): Style;
  plusPoint(): Style;
  plusPointDebug(): Style;
  checkPoint(): Style;
  defaultLayerStyle(color: Color, text?: string): () => Array<Style>;
  clickedWhitePoint(color: Color): () => Style;
  movingPoint(color: Color): () => Style;
  designDXFStyle(param: DesignDxfStyleParam): () => Style;
  photoMarker(text: string): Style;
  gcp(): (featureLike: FeatureLike) => Style;
  blueGCP(): (featureLike: FeatureLike) => Style;
  geolocation(): Style;
  geolocationAccuracy(): Style;
} = {
  mouseHoverOnLayer: (color) => () => new Style({
    fill: new Fill({
      color: color.alpha(ColorNumbers.Point17).toString(),
    }),
    stroke: new Stroke({
      color: color === undefined ? '#3399CC' : color.darken(ColorNumbers.Point02).lighten(ColorNumbers.Point05).toString(),
      width: 3,
    }),
  }),
  newlyCreatedVectorLayer: () => new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33',
      }),
    }),
  }),
  markerWithoutShadow: (color: Color) =>
    new Style({
      image: new Icon({
        /**
         * @todo change svg to png, because svg is 엄청 느려요. 걍 엄청 느립니다 바꿔야합니다.
         */
        src: makeIntoOlIcon(<MarkerIconWithoutShadow color={color} />),
        scale: commonConstants.markerIconScale,
      }),
    }),
  markerWithShadow: (color: Color, text?: string) => () => {
    const processedText: string | null = text !== undefined ? makeTextEliipsis(text) : null;

    return new Style({
      image: new Icon({
        /**
         * @todo change svg to png, because svg is 엄청 느려요. 걍 엄청 느립니다 바꿔야합니다.
         */
        src: makeIntoOlIcon(<MarkerIconWithShadow color={color} />),
        anchorOrigin: 'bottom-center' as any,
        // eslint-disable-next-line no-magic-numbers
        anchor: [0.2, 55],
        anchorXUnits: IconAnchorUnits.FRACTION,
        anchorYUnits: IconAnchorUnits.PIXELS,
        scale: commonConstants.markerIconScale,
      }),
      text: processedText !== null ?
        new OlText({
          ...createOlTextStyleFromGeometryType({ geometryType: OlTextStyleGeometryType.MARKER, textLength: processedText.length }),
          text: processedText,
        }) : undefined,
    });
  },
  emptyCircle: () => new Style({
    image: new CircleStyle({
      radius: 0,
    }),
  }),
  blueCircle: () => new Style({
    image: new CircleStyle({
      radius: increasePointSizeOnMobile(6),
      fill: new Fill({
        color: new Color(palette.white).toString(),
      }),
      stroke: new Stroke({
        color: dsPalette.themePrimaryLighter.toString(),
        width: 3,
      }),
    }),
  }),
  rotateDefaultPoint: () => new Style({
    image: new Icon({
      src: makeIntoOlIcon(<RotateDefaultSVG />),
      scale: isMobile() ? 1.5 : 1,
    }),
  }),
  plainWhitePoint: () => new Style({
    image: new Icon({
      src: encodeURI(PlainWhitePNG),
      scale: increasePointSizeOnMobile(0.5),
    }),
    zIndex: 9999999999999,
  }),
  plusPoint: () => new Style({
    image: new Icon({
      src: encodeURI(PlusPNG),
      scale: increasePointSizeOnMobile(0.5),
    }),
    zIndex: 9999999999999,
  }),
  plusPointDebug: () => new Style({
    image: new Icon({
      src: encodeURI(PlusPNG),
      scale: increasePointSizeOnMobile(0.8),
    }),
    zIndex: 9999999999999,
  }),
  checkPoint: () => new Style({
    image: new Icon({
      src: makeIntoOlIcon(<CheckSVG />),
      scale: isMobile() ? 1.5 : 1,
    }),
    zIndex: 999999999999999,
  }),
  defaultLayerStyle: (color: Color, text?: string) => () => {
    const processedText: string | null = text !== undefined ? makeTextEliipsis(text) : null;

    return [
      new Style({
        fill: new Fill({
          color: color.alpha(ColorNumbers.Point17).toString(),
        }),
        stroke: new Stroke({
          color: color.darken(ColorNumbers.Point02).toString(),
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
        text: processedText !== null ?
          new OlText({
            ...createOlTextStyleFromGeometryType({ geometryType: OlTextStyleGeometryType.NON_MARKER, textLength: processedText.length }),
            text: processedText,
          }) : undefined,
      }),
    ];
  },
  clickedWhitePoint: (color: Color) => () => new Style({
    image: new Icon({
      src: makeIntoOlIcon(<ClickedOrMovingPointIcon color={color} />),
      scale: increasePointSizeOnMobile(1),
    }),
    zIndex: 9999999999999,
  }),
  movingPoint: (color: Color) => () => new Style({
    image: new Icon({
      src: makeIntoOlIcon(<ClickedOrMovingPointIcon color={color} hasTranslucentCircle={true} />),
      scale: increasePointSizeOnMobile(1),
    }),
    zIndex: 9999999999999,
  }),
  designDXFStyle: (param: DesignDxfStyleParam) => () => new Style({
    fill: param.fillAlpha ? new Fill({
      color: param.color.alpha(param.fillAlpha).toString(),
    }) : undefined,
    stroke: new Stroke({
      width: param.strokeWidth,
      color: param.color.toString(),
    }),
  }),
  photoMarker: (text) => new Style({
    image: new Icon({
      src: encodeURI(PhotoMarkerPNG),
      scale: isMobile() ? 0.7 : 0.6,
    }),
    text: new OlText({
      ...createOlTextStyleFromGeometryType({ geometryType: OlTextStyleGeometryType.PHOTO_MARKER, textLength: text.length }),
      text,
    }),
    zIndex: 9999999999999,
  }),
  gcp: () => (featureLike) => {
    const text: string | null = (() => {
      const unProcessedText: string | undefined = featureLike.get(OlCustomPropertyNames.GCP_LABEL)?.toString();

      if (unProcessedText) {
        return makeTextEliipsis(unProcessedText);
      }

      return null;
    })();

    return new Style({
      image: new Icon({
        src: encodeURI(GCPMarker),
        scale: increasePointSizeOnMobile(1),
      }),
      zIndex: 9999999999999,
      text: text ? new OlText({
        ...createOlTextStyleFromGeometryType({ geometryType: OlTextStyleGeometryType.MARKER, textLength: text.length }),
        text,
      }) : undefined,
    });
  },
  blueGCP: () => (featureLike) => {
    const gcpStyle: Style = olStyleFunctions.gcp()(featureLike);

    gcpStyle.setImage(new Icon({
      src: encodeURI(BlueGCPMarker),
      scale: increasePointSizeOnMobile(1),
    }));
    gcpStyle.setZIndex(gcpStyle.getZIndex() + 1);

    return gcpStyle;
  },
  geolocation: () => new Style({
    image: new Icon({
      src: makeIntoOlIcon(<CurrentLocationSVG />),
      rotateWithView: true,
    }),
  }),
  geolocationAccuracy: () => new Style({
    fill: new Fill({
      color: 'rgba(31, 71, 130, 0.2)',
    }),
  }),
};

/**
 * @description to override styles of draw interaction
 * don't change order of spread arrays
 */
export function makeCustomDrawStyle({
  contentType,
  geometryType,
}: {
  contentType: T.MeasurementContent['type'];
  geometryType: GeometryType;
}): Array<Style> {
  return [
    ...(
      geometryType === GeometryType.LINE_STRING ?
        [
          ...olStyleFunctions.defaultLayerStyle(palette.measurements[contentType])(),
        ] : []
    ),
    ...[
      new Style({
        fill: new Fill({
          color: palette.measurements[contentType].alpha(ColorNumbers.Point17).toString(),
        }),
      }),
    ],
    ...(
      [T.ContentType.AREA, T.ContentType.VOLUME].includes(contentType) ?
        [] :
        olStyleFunctions.defaultLayerStyle(palette.measurements[contentType])()
    ),
  ];
}

const MOBILE_POINT_SCALE: number = 2;

function increasePointSizeOnMobile(initialScale: number): number {
  return isMobile() ? initialScale * MOBILE_POINT_SCALE : initialScale;
}

const ELLIPSIS_THRESHOLD: number = 18;

export function makeTextEliipsis(text: string): string {
  return text.length > ELLIPSIS_THRESHOLD ? `${text.substr(0, ELLIPSIS_THRESHOLD)}...` : text;
}
