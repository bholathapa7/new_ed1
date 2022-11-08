import Color from 'color';
import React, { FC } from 'react';

/* eslint-disable max-len */
export const MarkerIconWithShadow: FC<{ color: Color }> = ({ color }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='56' height='65' viewBox='0 0 56 65'>
    <defs>
      <filter id='a' width='111.5%' height='111.9%' x='-5.7%' y='-5.9%' filterUnits='objectBoundingBox'>
        <feGaussianBlur in='SourceGraphic' stdDeviation='1' />
      </filter>
    </defs>
    <g fill='none' fillRule='evenodd'>
      <path fill='#000' fillOpacity='.37' fillRule='nonzero' d='M31.118 11.48l22.341 26.93-30.523-1.965-8.959 16.124c1.057 2.49.31 5.672-2.172 7.754-2.986 2.506-7.102 2.262-9.26-.309-2.157-2.57-1.682-6.667 1.304-9.173 1.965-1.649 4.42-2.107 6.484-1.494l17.95-32.306 2.835-5.562zM6.49 53.988c-.677.568-.844 1.724-.2 2.632l1.66-2.989c-.538-.092-1.078.036-1.46.357z' filter='url(#a)' transform='translate(1)' />
      <path fill={`${color.toString()}`} d='M8.026 3.583L44 18.959 8 34.424z' />
      <path fill='#FFF' fillRule='nonzero' d='M6.051 0l42.865 18.96L10 36.172l.001 14.397a7 7 0 1 1-3.95-.015V0zM8 54.279a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm2-48.16v25.678l29.028-12.838L10 6.12z' />
    </g>
  </svg>
);

export const MarkerIconWithoutShadow: FC<{ color: Color}> = ({ color }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='64' viewBox='0 0 60 64'>
    <g fill='none' fillRule='evenodd'>
      <path fill={`${color.toString()}`} d='M13.026 3.583L49 18.959 13 34.424z' />
      <path fill='#FFF' fillRule='nonzero' d='M11.051 0l42.865 18.96L15 36.172l.001 14.397a7 7 0 1 1-3.95-.015V0zM13 54.279a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm2-48.16v25.678l29.028-12.838L15 6.12z' />
    </g>
  </svg>
);
