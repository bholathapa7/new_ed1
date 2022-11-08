import React, { FC, ReactNode, memo, useContext, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import CameraSvg from '^/assets/icons/screen-capture.svg';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import ScreenCaptureAnimation from '^/components/atoms/ScreenCaptureAnimation';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import palette from '^/constants/palette';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { handleCameraClickFunctor, runScreenCapture } from '^/utilities/camera-button-util';
import { Event } from 'cesium';

import Text from './text';


export const MapScreenCaptureWrapper = styled.div<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  height: '30px',
  cursor: isDisabled ? 'default' : 'pointer',
  boxShadow: palette.insideMap.shadow,
  backdropFilter: 'blur(10px)',

  marginBottom: '6px',

  borderRadius: '3px',
  backgroundColor: isDisabled ? palette.MapTopBar.backgroundDisabled.toString() : palette.insideMap.gray.toString(),

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '&:hover': isDisabled ? undefined : {
    backgroundColor: palette.insideMap.hoverGray.toString(),
  },
}));

const CameraSvgWrapper = styled.div<{ isDisabled: boolean }>(
  ({ isDisabled }) => ({
    width: '32px',
    height: '32px',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    'svg > g > path, svg > g > circle': isDisabled
      ? {
        fill: palette.MapTopBar.iconDisabled.toString(),
      }
      : undefined,
  })
);


const TooltipBalloonStyle: CSSObject = {
  left: 'auto',
  right: '33px',
  bottom: '3px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: {
    width: '100%',
    height: '100%',
  },
  tooltipBalloonStyle: TooltipBalloonStyle,
};

const TIME_UNTIL_DOWNLOAD_HAPPENS: number = 5000;

export interface Props {
  readonly isCesium: boolean;
  readonly isDisabled: boolean;
}

const CameraButton: FC<Props> = ({
  isCesium,
  isDisabled,
}) => {
  const [isScreenBeingCaptured, setIsScreenBeingCaptured]: UseState<boolean> =
    useState<boolean>(false);
  const [l10n]: UseL10n = useL10n();

  const onStart: () => void = () => {
    setIsScreenBeingCaptured(true);
  };

  const onEnd: () => void = () => {
    /**
     * @description
     * for some reason state is not synced well without setTimeout, allowing multiple clicks on the capture
     * even if download has not yet happened
     */
    setTimeout(() => setIsScreenBeingCaptured(false), TIME_UNTIL_DOWNLOAD_HAPPENS);
  };

  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const handle3DCameraClick: () => void = () => {
    const removePostRender: Event.RemoveCallback | undefined =
    viewer?.scene.postRender.addEventListener(handleCameraClickFunctor({
      onStart, onEnd, mainScreenCaptureFunction: async () => {
        removePostRender?.();
        const threeDView: Element | null = document.getElementsByClassName('cesium-viewer')[0];

        return runScreenCapture(threeDView as HTMLElement, `${l10n(Text.capturedPictureDownloadName)}.png`);
      },
    }));
    viewer?.scene.requestRender();
  };

  const handle2DCameraClick: () => void = handleCameraClickFunctor({
    onStart, onEnd, mainScreenCaptureFunction: async () => {
      const twoDView: Element | null = document.getElementById('as-ol-view-wrapper');

      return runScreenCapture(
        twoDView as HTMLElement, `${l10n(Text.capturedPictureDownloadName)}.png`,
      );
    },
  });

  const cameraButtonIcon: ReactNode = isScreenBeingCaptured ?
    <LoadingIcon /> :
    <CameraSvgWrapper isDisabled={isDisabled}><CameraSvg data-testid='camera-btn-svg' /></CameraSvgWrapper>;

  const handleClick: () => void = () => {
    if (isDisabled || isScreenBeingCaptured) return;

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    return isCesium ? handle3DCameraClick() : handle2DCameraClick();
  };

  return (
    <>
      <MapScreenCaptureWrapper
        data-ddm-track-action='map-output'
        data-ddm-track-label={`btn-screen-capture-${isCesium ? '3d' : '2d'}`}
        onClick={handleClick}
        isDisabled={isDisabled}
        data-testid='map-screen-capture-btn'
      >
        <WrapperHoverable
          allowForceCheckMouseout={true}
          allowForceCheckTouchend={true}
          title={l10n(Text.tooltipCamera)}
          customStyle={TooltipCustomStyle}
        >
          {cameraButtonIcon}
        </WrapperHoverable>
      </MapScreenCaptureWrapper>
      <ScreenCaptureAnimation isShown={isScreenBeingCaptured} />
    </>
  );
};

export default memo(CameraButton);
