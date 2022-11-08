import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { fromLonLat, get } from 'ol/proj';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import OlTileLayer from '^/components/atoms/OlTileLayer';
import { DEFAULT_OPACITY } from '^/constants/defaultContent';
import { typeGuardCADContent } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';


// As per BE request, the max zoom level is capped at 22.
const MAX_ZOOM_LEVEL: number = 22;

interface Props {
  readonly contentId: T.CADContent['id'];
  readonly zIndex?: number;
}

export const OlRasterizedBlueprintCADLayer: FC<Props> = ({ contentId, zIndex }) => {
  const opacity: T.BlueprintDXFConfigPerUser['opacity'] | T.BlueprintDWGConfigPerUser['opacity'] = useSelector((state: T.State) => {
    const content: T.CADContent | undefined = typeGuardCADContent(state.Contents.contents.byId[contentId]);

    if (content?.config?.opacity !== undefined) return content.config.opacity / DEFAULT_OPACITY;

    return 1;
  });

  // Supplying the correct extent prevents
  // requesting images outside of the overlay bounds.
  const extent: Extent | undefined = useSelector((state: T.State) => {
    const content: T.CADContent | undefined = typeGuardCADContent(state.Contents.contents.byId[contentId]);

    const tms: T.CADContent['info']['tms'] = content?.info?.tms;

    if (!tms || !tms.bounds) {
      return undefined;
    }

    const [b1, b2, b3, b4]: Extent = tms.bounds;
    const [p1, p2]: Coordinate = fromLonLat([b1, b2]);
    const [p3, p4]: Coordinate = fromLonLat([b3, b4]);

    return [p1, p2, p3, p4];
  });

  return (
    <OlTileLayer
      // Use -y so that it could match with BE's tiling logic for Y coordinate.
      url={makeS3URL(contentId, 'raster_tiles', '{z}', '{x}', '{-y}@2x.png')}
      projection={get('EPSG:3857')}
      preload={0}
      extent={extent}
      zIndex={zIndex}
      maxZoom={MAX_ZOOM_LEVEL}
      opacity={opacity}
      crossOrigin='use-credentials'
    />
  );
};
