import React, { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { PoweredBy } from '^/components/atoms/PoweredBy';
import palette from '^/constants/palette';
import { UseL10n, useL10n, useProjectCoordinateSystem } from '^/hooks';
import * as T from '^/types';
import { projectionSystemLabel } from '^/utilities/coordinate-util';
import { isMobile } from '^/utilities/device';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';

// eslint-disable-next-line max-len
const cesiumCompassGyroPaths: string = 'M31.4,36.5c0.6-0.9,1-2.3,1.2-3.9c1.6-0.2,3-0.6,3.9-1.2C36,34,34,36,31.4,36.5 M23.5,31.4c0.9,0.6,2.3,1,3.9,1.2c0.2,1.6,0.6,3,1.2,3.9C26,36,24,34,23.5,31.4 M28.6,23.5c-0.6,0.9-1,2.3-1.2,3.9c-1.6,0.2-3,0.6-3.9,1.2C24,26,26,24,28.6,23.5 M36.5,28.6c-0.9-0.6-2.3-1-3.9-1.2c-0.2-1.6-0.6-3-1.2-3.9C34,24,36,26,36.5,28.6 M32.7,28.2c2.5,0.4,4,1.2,4,1.8c0,0.6-1.5,1.4-4,1.8c0.1-0.6,0.1-1.2,0.1-1.8C32.8,29.4,32.7,28.8,32.7,28.2 M30,23.3c0.6,0,1.4,1.5,1.8,4c-0.6-0.1-1.2-0.1-1.8-0.1s-1.2,0-1.8,0.1C28.6,24.8,29.4,23.3,30,23.3 M27.3,31.8c-2.5-0.4-4-1.2-4-1.8c0-0.6,1.5-1.4,4-1.8c-0.1,0.6-0.1,1.2-0.1,1.8C27.2,30.6,27.3,31.2,27.3,31.8 M30,31.9c-0.7,0-1.3,0-1.9-0.1c-0.1-0.6-0.1-1.2-0.1-1.9c0-0.7,0-1.3,0.1-1.9c0.6-0.1,1.2-0.1,1.9-0.1c0.7,0,1.3,0,1.9,0.1c0.1,0.6,0.1,1.2,0.1,1.9c0,0.7,0,1.3-0.1,1.9C31.3,31.9,30.7,31.9,30,31.9 M30,36.7c-0.6,0-1.4-1.5-1.8-4c0.6,0.1,1.2,0.1,1.8,0.1s1.2,0,1.8-0.1C31.4,35.2,30.6,36.7,30,36.7 M30,22.5c-4.1,0-7.5,3.4-7.5,7.5c0,4.1,3.4,7.5,7.5,7.5s7.5-3.4,7.5-7.5C37.5,25.9,34.1,22.5,30,22.5';

const CesiumCompassGyroSvg = styled.svg({
  width: '25px',
  height: '25px',
  transform: 'translate(-16px, -16px) scale(0.9)',
  overflow: 'visible',
  verticalAlign: 'top',
});
CesiumCompassGyroSvg.displayName = 'CesiumCompassGyroSvg';
const CesiumCompassGyroPath = styled.path.attrs(() => ({
  d: cesiumCompassGyroPaths,
}))`
  fill: ${palette.textBlack.toString()};
`;
CesiumCompassGyroPath.displayName = 'CesiumCompassGyroPath';

const LocationOverlayRoot = styled.div({
  zIndex: 1,
  display: 'flex',
  position: 'absolute',
  right: '0',
  bottom: '0',
  height: '25px',
  lineHeight: '25px',
  padding: '0px 14px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: palette.textBlack.toString(),
  fontSize: '11px',
});
LocationOverlayRoot.displayName = 'LocationOverlayRoot';

const LocationOverlayText = styled.span({ display: 'inline-block', minWidth: '90px' });
LocationOverlayText.displayName = 'LocationOverlayText';

const LocationOverlayProjection = styled.div({
  paddingRight: '20px',
});
LocationOverlayProjection.displayName = 'LocationOverlayProjection';

const LocationOverlayCoords = styled.div``;
LocationOverlayCoords.displayName = 'LocationOverlayCoords';

const PoweredByStyle: CSSObject = {
  marginRight: '18px',
};


const LocationOverlay: FC = () => {
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();
  const isLonLat: boolean = projectProjection === T.ProjectionEnum.WGS84_EPSG_4326_LL;
  const [l10n]: UseL10n = useL10n();

  // As long as slug exists, this means user uses a non-regular DDM platform.
  // This is to still show that their page is made by Angelswing.
  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);
  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  const poweredBy: ReactNode = useMemo(() => needsCustomization ? <PoweredBy customStyle={PoweredByStyle} /> : null, [needsCustomization]);

  return isMobile() || isESS ? null : (
    <LocationOverlayRoot>
      {poweredBy}
      <LocationOverlayProjection>
        <CesiumCompassGyroSvg>
          <CesiumCompassGyroPath />
        </CesiumCompassGyroSvg>
        {l10n(projectionSystemLabel[projectProjection])}
      </LocationOverlayProjection>
      <LocationOverlayCoords>
        {isLonLat ? 'Lat :' : 'Y :'}&nbsp;
        <LocationOverlayText id='coordY' />&nbsp;
        {isLonLat ? 'Lon :' : 'X :'}&nbsp;
        <LocationOverlayText id='coordX' />&nbsp;
        Z :&nbsp;
        <LocationOverlayText id='coordZ' />
      </LocationOverlayCoords>
    </LocationOverlayRoot>
  );
};

export default LocationOverlay;
