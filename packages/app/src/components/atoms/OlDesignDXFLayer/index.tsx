import * as Sentry from '@sentry/browser';
import Color from 'color';
import _ from 'lodash-es';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';
import React, { FC, useEffect, useState } from 'react';
import { ajax } from 'rxjs/ajax';

import OlLayer from '^/components/atoms/OlLayer';
import { OlCustomPropertyNames } from '^/components/ol/constants';
import { olStyleFunctions } from '^/components/ol/styles';
import { commonConstants } from '^/constants/map-display';
import palette from '^/constants/palette';
import { UseState } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

const FEATURE_STROKE_WIDTH: number = 3;
const FEATURE_FILL_ALPHA: number = 0.3;

const initVectorLayer: () => VectorImageLayer = () =>
  new VectorImageLayer({
    source: new VectorSource({}),
  });

/**
 * @todo Implement GeoJSON file format interface
 */
const defineVectorSource: (response: any, color?: Color) => VectorSource = (response, color) => {
  const features: Array<Feature<Geometry>> = new GeoJSON().readFeatures(response);
  features.forEach((feature) => feature.setStyle(olStyleFunctions.designDXFStyle({
    color: color ? color : palette.designDXFLayerBorder,
    strokeWidth: FEATURE_STROKE_WIDTH,
    fillAlpha: FEATURE_FILL_ALPHA,
  })));

  return new VectorSource({
    features,
    format: new GeoJSON(),
  });
};

export interface Props {
  content: T.DesignDXFContent;
  zIndex: number;
  color?: Color;
}

const OlDesignDXFLayer: FC<Props> = ({
  content, zIndex, color,
}) => {
  const [vectorLayer, setVectorLayer]: UseState<VectorLayer | VectorImageLayer> = useState(initVectorLayer());

  useEffect(() => {
    /**
     * @desc This statement makes mouseHoverInteraction ignore
     */
    vectorLayer.set(OlCustomPropertyNames.GEOMETRY_TYPE, T.ContentType.DESIGN_DXF);
  }, [vectorLayer]);

  useEffect(() => {
    ajax({
      url: makeS3URL(content.id, 'downloads', 'design_vector.geojson'),
      crossDomain: true,
      withCredentials: true,
      method: 'GET',
    }).subscribe({
      next: ({ response }) => {
        const layer: VectorImageLayer = new VectorImageLayer({
          source: defineVectorSource(response, color),
          opacity: commonConstants.designDXFOpacity,
          zIndex,
        });
        layer.set('id', content.id);
        layer.set(OlCustomPropertyNames.IS_DESIGN_DXF, true);
        setVectorLayer(layer);
      },
      error: (error) => {
        Sentry.captureException(error);
      },
    });
  }, []);

  return <OlLayer layer={vectorLayer} />;
};

export default OlDesignDXFLayer;
