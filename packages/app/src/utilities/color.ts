import Color from 'color';

export const isTransparent: (color: Color) => boolean = (color) => color.alpha() === 0;
export const isWhite: (color: Color) => boolean = (color) => color.luminosity() === 1;
