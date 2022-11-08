import palette from '^/constants/palette';
import { CSSObject } from 'styled-components';

const alpha: number = 0.75;
export const darkDropdownTheme: {
  [P: string]: CSSObject;
} = {
  mainButtonStyle: {
    backgroundColor: palette.black.alpha(alpha).toString(),
    color: palette.white.toString(),
    border: 'none',
  },
  caretStyle: {
    color: palette.white.toString(),
  },
  menuStyle: {
    border: 'none',
    backgroundColor: palette.transparent.toString(),
  },
  itemStyle: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    backgroundColor: palette.black.alpha(alpha).toString(),
    color: palette.white.toString(),

    ':hover': {
      color: 'var(--color-theme-primary-lightest)',
    },
  },
};
