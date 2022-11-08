import Feature from 'ol/Feature';
import PointGeom from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import React, { FC, useEffect, useMemo } from 'react';


import OlLayer from '^/components/atoms/OlLayer';
import { LayerZIndex } from '^/constants/zindex';
import * as T from '^/types';
import { olStyleFunctions } from '../styles';

const getVectorSource: (hoverLocation: T.GeoPoint) => VectorSource = (hoverLocation) => {
  const feature: Feature = new Feature(new PointGeom(fromLonLat(hoverLocation)));
  feature.setStyle(olStyleFunctions.plainWhitePoint);

  return new VectorSource({
    features: [feature],
  });
};

interface Props {
  hoverLocation?: T.GeoPoint;
}

/**
 * @desc
 * This is for Length content.
 * In Elevation profile, there's a hover interaction.
 * When you hover one point on elevation,
 * the layer should show point as well.
 */
const OlLengthMovablePointLayer: FC<Props> = ({ hoverLocation }) => {
  if (hoverLocation === undefined) return null;

  const layer: VectorLayer = useMemo(() => new VectorLayer({
    source: getVectorSource(hoverLocation),
    zIndex: LayerZIndex.LENGTH_MOVABLE_POINT,
  }), []);

  useEffect(() => {
    layer.setSource(getVectorSource(hoverLocation));
  }, [hoverLocation]);

  return <OlLayer layer={layer} />;
};

export default OlLengthMovablePointLayer;
