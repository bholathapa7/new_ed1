import React, { FC, memo } from 'react';
import styled, { CSSObject, Keyframes, keyframes } from 'styled-components';

import dsPalette from '^/constants/ds-palette';

const rotationAnimation: Keyframes =
  keyframes`
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  `;

const LoadingDiv =
  styled.div`
    border: 3px solid ${dsPalette.grey40.toString()};
    border-top: 3px solid var(--color-theme-primary);
    border-radius: 50%;
    width: 20px;
    height: 20px;

    transform-origin: center;
    
    animation-name: ${rotationAnimation};
    animation-duration: 1s;
    animation-iteration-count: infinite;
 `;


export interface Props {
  readonly loadingDivCustomStyle?: CSSObject;
}

const LoadingIcon: FC<Props> = ({ loadingDivCustomStyle }) => (
  <LoadingDiv data-testid='loading-button' style={loadingDivCustomStyle} />
);
/**
 * Never update loading icon again because there is no point of doing that
 * But there would be a problem if you are trying to change the custom style
 * dynamically
 */
export default memo(LoadingIcon, () => true);
