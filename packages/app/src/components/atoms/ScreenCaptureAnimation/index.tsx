import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import styled, { Keyframes, keyframes, css } from 'styled-components';

import { responsiveStyle } from '^/constants/styles';
import * as T from '^/types';
import Expire from '../Expire';

const fadeInAndOutKeyframe: Keyframes = keyframes`
  0% {
    opacity: 0;
  }
  45% {
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`;

const ANIMATION_DURATION_MS: number = 500;
// eslint-disable-next-line no-magic-numbers
const TENTH: number = ANIMATION_DURATION_MS / 10;

interface RootProps {
  showSidebar: boolean;
}

/**
 * @todo using a fixed value for left is not a good solution
 * we can bring ScreenCaptureAnimation component out to ContentPage to naturally
 * adopt to the width of ContentPage later
 *
 * In style-components v4 and above, keyframe must be used through css helper.
 * I tried to use style object for consistency, but it doesn't seem to be supported by types.
 * If it is changed to be supported later or if I am mistaken, please correct it.
 */
const Root = styled.div<RootProps>(({ showSidebar }) => ({
  height: '100%',
  width: '100%',
  position: 'fixed',
  left: showSidebar ? responsiveStyle.sideBar[T.Device.DESKTOP]?.width : 0,
  top: 0,
  zIndex: 500,
  backgroundColor: 'white',
}), css`
  animation: ${fadeInAndOutKeyframe} ${ANIMATION_DURATION_MS}ms linear 0s 1;
`);

export interface Props {
  isShown: boolean;
}

const ScreenCaptureAnimation: FC<Props> = ({ isShown }) => {
  const { Pages: { Contents: { showSidebar } } }: T.State = useSelector((state: T.State) => state);

  if (isShown) {
    return (
      <Expire delay={ANIMATION_DURATION_MS - TENTH}>
        <Root data-testid='screen-capture-animation' showSidebar={showSidebar} />
      </Expire>
    );
  }

  return null;
};

export default ScreenCaptureAnimation;
