import React, { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';

import MapCenterSvg from '^/assets/icons/map-controller/map-center.svg';
import MaximizeSvg from '^/assets/icons/map-controller/maximize.svg';
import MinimizeSvg from '^/assets/icons/map-controller/minimize.svg';
import CameraSvg from '^/assets/icons/screen-capture.svg';
import { MapScreenCaptureWrapper } from '^/components/molecules/CameraButton';
import { SVGWrapper, ZoomWrapper } from '^/components/molecules/MapZoom';
import route from '^/constants/routes';
import { ErrorText, NOT_ALLOWED_CLASS_NAME, defaultToastErrorOption, useInitialToast, useRouteIsMatching } from '^/hooks';
import * as T from '^/types';
import { MapCenterWrapper, Root } from './';

export const Fallback: FC = () => {
  const { in3D, in3DPointCloud }: T.ContentsPageState = useSelector((state: T.State) => state.Pages.Contents);

  useInitialToast({
    type: T.Toast.ERROR,
    content: {
      title: ErrorText.mapController.title,
      description: ErrorText.mapController.description,
    },
    option: defaultToastErrorOption,
  });

  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const isInCesium: boolean = !in3DPointCloud && in3D;

  const cameraButton: ReactNode = useMemo(() => (!isOnSharePage ? (
    <MapScreenCaptureWrapper>
      <CameraSvg />
    </MapScreenCaptureWrapper>
  ) : undefined), [isOnSharePage, isInCesium]);

  return (
    <Root isInCesium={isInCesium} isOnSharePage={isOnSharePage} className={NOT_ALLOWED_CLASS_NAME}>
      {cameraButton}
      <MapCenterWrapper isInCesium={isInCesium}>
        <MapCenterSvg />
      </MapCenterWrapper>
      <ZoomWrapper>
        <SVGWrapper>
          <MaximizeSvg />
        </SVGWrapper>
        <SVGWrapper>
          <MinimizeSvg />
        </SVGWrapper>
      </ZoomWrapper>
    </Root>
  );
};
