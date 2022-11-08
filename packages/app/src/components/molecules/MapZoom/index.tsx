import React, { FC, useState } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';
import Text from './text';

import MaximizeSvg from '^/assets/icons/map-controller/maximize.svg';
import MinimizeSvg from '^/assets/icons/map-controller/minimize.svg';
import { l10n } from '^/utilities/l10n';

import { OlViewProps, withOlView } from '^/components/atoms/OlViewProvider/context';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import { CesiumContextProps, withCesiumViewer } from '^/components/cesium/CesiumContext';
import { cesiumConstants as CC, olConstants as OC } from '^/constants/map-display';
import { isMobile } from '^/utilities/device';


export const ZoomWrapper = styled.div({
  height: 'auto',

  cursor: 'pointer',

  marginTop: '6px',

  boxShadow: palette.insideMap.shadow,
  backdropFilter: 'blur(10px)',

  '> div': {
    position: 'relative',
    width: '100%',
    height: '30px',
    backgroundColor: palette.insideMap.gray.toString(),

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '&:hover': {
      backgroundColor: palette.insideMap.hoverGray.toString(),
    },
  },
  '> div:first-of-type': {
    borderBottom: `1px solid ${palette.divider.toString()}`,
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  },
  '> div:last-of-type': {
    borderBottomLeftRadius: '3px',
    borderBottomRightRadius: '3px',
  },
});

export const SVGWrapper = styled.div({
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});


interface Props extends CesiumContextProps {
  isInCesium: boolean;
  tooltipCustomStyle: WrapperHoverableProps['customStyle'];
  twoDDisplayZoom: number;
  changeZoom(twoDDisplayZoom: number): void;
}

const intervalPeriod: number = 50;

/**
 * Component for zooming map
 */
const MapZoom: FC<Props & L10nProps & OlViewProps> = ({
  isInCesium, view, viewer, language, tooltipCustomStyle, changeZoom,
}) => {
  const [interval, setInterval] = useState<number>(0);
  const zoomInOnce: () => void = () => {
    if (isInCesium) {
      viewer?.camera.zoomIn(CC.zoom.defaultDiff);
    } else {
      changeZoom(view.getZoom() + OC.zoom.defaultDiff);
    }
  };

  const zoomOutOnce: () => void = () => {
    if (isInCesium) {
      viewer?.camera.zoomOut(CC.zoom.defaultDiff);
    } else {
      changeZoom(view.getZoom() - OC.zoom.defaultDiff);
    }
  };

  const handleMousedownMapZoomIn: () => void = () => {
    setInterval(window.setInterval(zoomInOnce, intervalPeriod));
  };

  const handleMouseDownMapZoomOut: () => void = () => {
    setInterval(window.setInterval(zoomOutOnce, intervalPeriod));
  };

  const handleZoomRelease: () => void = () => {
    clearInterval(interval);
  };

  return isMobile() ? null : (
    <ZoomWrapper>
      <WrapperHoverable
        title={l10n(Text.zoomIn, language)}
        customStyle={tooltipCustomStyle}
      >
        <SVGWrapper
          data-ddm-track-action='map-controls'
          data-ddm-track-label={`btn-zoom-in-${isInCesium ? '3d' : '2d'}`}
          onTouchEnd={handleZoomRelease}
          onTouchStart={handleMousedownMapZoomIn}
          onMouseUp={handleZoomRelease}
          onMouseDown={handleMousedownMapZoomIn}
          data-testid='map-zoom-in-btn'
        >
          <MaximizeSvg />
        </SVGWrapper>
      </WrapperHoverable>
      <WrapperHoverable
        title={l10n(Text.zoomOut, language)}
        customStyle={tooltipCustomStyle}
      >
        <SVGWrapper
          data-ddm-track-action='map-controls'
          data-ddm-track-label={`btn-zoom-out-${isInCesium ? '3d' : '2d'}`}
          onTouchEnd={handleZoomRelease}
          onTouchStart={handleMouseDownMapZoomOut}
          onMouseUp={handleZoomRelease}
          onMouseDown={handleMouseDownMapZoomOut}
          data-testid='map-zoom-out-btn'
        >
          <MinimizeSvg />
        </SVGWrapper>
      </WrapperHoverable>
    </ZoomWrapper>
  );
};
export default withCesiumViewer<Props>(withL10n(withOlView(MapZoom)));
