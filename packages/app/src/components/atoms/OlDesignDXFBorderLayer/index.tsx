import _ from 'lodash-es';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import olMap from 'ol/Map';
import { easeIn } from 'ol/easing';
import { Extent } from 'ol/extent';
import WKT from 'ol/format/WKT';
import { Geometry } from 'ol/geom';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import { get } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import React, { FC, ReactNode, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Panel from '^/components/atoms/DesignBoundaryViolationPanel';
import OlLayer from '^/components/atoms/OlLayer';
import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { DesignDxfStyleParam, olStyleFunctions } from '^/components/ol/styles';
import palette from '^/constants/palette';
import { typeGuardDesignDXF } from '^/hooks';
import * as T from '^/types';
import Color from 'color';

// eslint-disable-next-line no-magic-numbers
const FEATURE_STROKE_WIDTH: number = 2;
const CAMERA_PADDING_VALUE: number = 100;
const CAMERA_PADDING: Extent = [CAMERA_PADDING_VALUE, CAMERA_PADDING_VALUE, CAMERA_PADDING_VALUE, CAMERA_PADDING_VALUE];
const WORLD_EXTENT: Extent = get('EPSG:3857').getExtent();

export const moveCameraPositionByDesignDxf: (content: T.DesignDXFContent, map: olMap) => void = (content, map) => {
  const polygonFeature: Feature = new Feature(new Polygon([content.info.designBorder]));
  map.getView().fit(polygonFeature.getGeometry() as Polygon, {
    padding: CAMERA_PADDING,
    size: map.getSize(),
    duration: 200,
    easing: easeIn,
    callback: (complete) => {
      /**
       * @desc Openlayers' camera animation is not perfect.
       * It can be canceled by other animations easily. And it looks weird
       * So, If the camera failed at moving camera, I forced to make it always success
       * This may occur performance issue
       */
      if (!complete) {
        moveCameraPositionByDesignDxf(content, map);
      }
    },
  });
};

/* eslint-disable no-magic-numbers */
const initVectorLayer: (param: {
  points: Array<[number, number]> | undefined;
  zIndex: number;
  extent?: Extent;
  hasError?: boolean;
  isBoundaryFilled?: boolean;
  featureStyle?: DesignDxfStyleParam;
}) => VectorLayer = ({
  points, zIndex, extent, hasError, isBoundaryFilled, featureStyle,
}) => {
  if (!points) {
    return new VectorLayer({
      source: new VectorSource({
        features: new Collection(),
      }),
      zIndex,
    });
  }

  const features: Collection<Feature<Geometry>> = new Collection();

  if (extent !== undefined) {
    const worldExtentWKT: string = `POLYGON ((
      ${extent[0]} ${extent[1]},
      ${extent[0]} ${extent[3]},
      ${extent[2]} ${extent[3]},
      ${extent[2]} ${extent[1]},
      ${extent[0]} ${extent[1]}
    ), (
      ${points.map(([x, y]) => `${x} ${y}`).join(',')}
    ))`;
    const wktFeature: Feature = new WKT().readFeature(worldExtentWKT);
    wktFeature.setStyle(new Style({
      fill: new Fill({
        color: palette.black.alpha(0.7).toString(),
      }),
    }));
    features.push(wktFeature);
  }

  const polygonFeature: Feature = new Feature(new Polygon([points]));
  const featureColor: Color = hasError ? palette.error : featureStyle?.color ? featureStyle.color : palette.designDXFLayerBorder;
  polygonFeature.setStyle(
    olStyleFunctions.designDXFStyle({
      color: featureColor,
      strokeWidth: featureStyle?.strokeWidth ? featureStyle.strokeWidth : FEATURE_STROKE_WIDTH,
      fillAlpha: isBoundaryFilled ? featureStyle?.fillAlpha : undefined,
    }),
  );
  features.push(polygonFeature);

  return new VectorLayer({
    source: new VectorSource({
      features,
    }),
    zIndex,
  });
};

export interface Props {
  designDxfId: T.DesignDXFContent['id'];
  zIndex: number;
  hasOutsideBlur?: boolean;
  isCameraFit?: boolean;
  hasError?: boolean;
  isBoundaryFilled?: boolean;
  isViolationPanelShown?: boolean;
  featureStyle?: DesignDxfStyleParam;
}

export const OlDesignDXFBorderLayer: FC<OlProps<Props>> = ({
  designDxfId, zIndex, hasOutsideBlur, isCameraFit, hasError, map, isBoundaryFilled, isViolationPanelShown, featureStyle,
}) => {
  const designDXFContent: T.DesignDXFContent | undefined
    = useSelector((state: T.State) => typeGuardDesignDXF(state.Contents.contents.byId[designDxfId]));

  useEffect(() => {
    if (isCameraFit && designDXFContent !== undefined) {
      moveCameraPositionByDesignDxf(designDXFContent, map);
    }
  }, [isCameraFit]);

  const vectorLayer: VectorLayer | undefined = useMemo(() => designDXFContent !== undefined ? initVectorLayer({
    points: designDXFContent.info.designBorder,
    zIndex,
    extent: hasOutsideBlur ? WORLD_EXTENT : undefined,
    hasError,
    isBoundaryFilled,
    featureStyle,
  }) : undefined, [designDXFContent, zIndex, hasOutsideBlur, hasError, isBoundaryFilled, featureStyle]);

  const olLayer: ReactNode = useMemo(() => vectorLayer !== undefined ? (
    <OlLayer layer={vectorLayer} />
  ) : undefined, [vectorLayer]);

  const panel: ReactNode = useMemo(() => isViolationPanelShown ? (
    <Panel />
  ) : undefined, [isViolationPanelShown]);

  return (
    <>
      {olLayer}
      {panel}
    </>
  );
};

export default olWrap(OlDesignDXFBorderLayer);
