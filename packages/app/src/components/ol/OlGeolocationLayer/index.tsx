import Feature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { FC, memo, useLayoutEffect } from 'react';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import { LayerGroupZIndex } from '^/constants/zindex';
import { olStyleFunctions } from '../styles';

export interface Props {
  readonly position?: Coordinate;
  readonly accuracyGeometry?: Polygon;
}

const RawOlGeolocationLayer: FC<OlProps<Props>> = ({
  map, position, accuracyGeometry,
}) => {
  useLayoutEffect(() => {
    if (!position) return;

    const feature: Feature = new Feature();
    feature.setStyle(olStyleFunctions.geolocation());

    feature.setGeometry(new Point(position));

    const vectorLayer: VectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature],
      }),
    });
    vectorLayer.setZIndex(LayerGroupZIndex.GEOLOCATION_POSITION);

    map.addLayer(vectorLayer);

    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [position]);

  useLayoutEffect(() => {
    if (!accuracyGeometry) return;

    const feature: Feature = new Feature();
    feature.setStyle(olStyleFunctions.geolocationAccuracy());

    feature.setGeometry(accuracyGeometry);

    const vectorLayer: VectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature],
      }),
    });
    vectorLayer.setZIndex(LayerGroupZIndex.GEOLOCATION_ACCURACY);

    map.addLayer(vectorLayer);

    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [accuracyGeometry]);

  return null;
};

export default memo(olWrap(RawOlGeolocationLayer));
