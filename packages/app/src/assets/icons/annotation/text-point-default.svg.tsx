import Color from 'color';
import React, { FC } from 'react';

import { ESS_TEXT_ALPHA } from '^/constants/cesium';
import palette from '^/constants/palette';

interface StyleProps {
  color?: Color;
}

export const TextDefaultPointIcon: FC<StyleProps> = ({ color }) => (
  <svg width='14' height='44' viewBox='0 0 14 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <circle cx='7' cy='37' r='7' fill={color ? color.alpha(ESS_TEXT_ALPHA).toString() : palette.white.toString()} />
    <rect x='5' width='4' height='31' fill={color ? color.alpha(ESS_TEXT_ALPHA).toString() : palette.white.toString()} />
  </svg>
);
