import { get } from 'ol/proj';
import React, { FC } from 'react';

import OlTileLayer from '^/components/atoms/OlTileLayer';
import { GOOGLE_MAPS_MAX_ZOOM } from '^/constants/map-display';

export interface Props {
  readonly zIndex: number;
}

/**
 * Component that inject an ol layer for Google map
 */
const OlGoogleMapLayer: FC<Props> = (props) => {
  const preload: number = 2;

  return (
    <OlTileLayer
      url='https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
      projection={get('EPSG:3857')}
      preload={preload}
      zIndex={props.zIndex}
      crossOrigin='anonymous'
      maxZoom={GOOGLE_MAPS_MAX_ZOOM}
    >
      {props.children}
    </OlTileLayer>
  );
};
export default OlGoogleMapLayer;
