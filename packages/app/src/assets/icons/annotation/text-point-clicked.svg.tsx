import Color from 'color';
import React, { FC } from 'react';

import { ESS_TEXT_ALPHA } from '^/constants/cesium';
import palette from '^/constants/palette';

interface StyleProps {
  textColor?: Color;
  labelColor?: Color;
}

export const TextSelectedPointIcon: FC<StyleProps> = ({ textColor, labelColor }) => (
  <svg width='14' height='44' viewBox='0 0 14 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='7' cy='37' r='7' fill={labelColor ? labelColor.alpha(ESS_TEXT_ALPHA).toString() : palette.white.alpha(ESS_TEXT_ALPHA).toString()} />
    <rect x='5' width='4' height='31'
      fill={labelColor ? labelColor.alpha(ESS_TEXT_ALPHA).toString() : palette.white.alpha(ESS_TEXT_ALPHA).toString()} />
    <path d='M10.6 36.4V34.6L13 37L10.6 39.4V37.6H7.6V40.6H9.4L7 43L4.6 40.6H6.4V37.6H3.4V39.4L1
    37L3.4 34.6V36.4H6.4V33.4H4.6L7 31L9.4 33.4H7.6V36.4H10.6Z' fill={textColor ? textColor.toString() : palette.textBlack.toString()} />
  </svg>
);
