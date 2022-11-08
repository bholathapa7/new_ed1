import Color from 'color';
import React, { FC } from 'react';

export const ClickedOrMovingPointIcon: FC<{ color: Color; hasTranslucentCircle?: boolean }> = ({ color, hasTranslucentCircle }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='25px' height='25px' viewBox='0 0 25 25'>
    <g id='Edit-Point-Copy-2' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      {/* eslint-disable-next-line no-magic-numbers */}
      <circle id='Oval-1' fillOpacity={hasTranslucentCircle ? 0.4 : 0} fill='#FFFFFF' cx='12.5' cy='12.5' r='12.5' />
      <circle id='Oval-2' fill='#FFFFFF' cx='12.5' cy='12.5' r='5.5' />
      <circle id='Oval-3' fill={color.toString()} cx='12.5' cy='12.5' r='2.5' />
    </g>
  </svg>
);
