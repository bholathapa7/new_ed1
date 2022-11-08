import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import CloseSvg from '^/assets/icons/close-new-thin.svg';
import dsPalette from '^/constants/ds-palette';


interface CustomStyleProp {
  readonly customStyle?: CSSObject;
}

const IconWrapper = styled.div<CustomStyleProp>(({ customStyle }) => ({
  position: 'relative',

  width: '40px',
  height: '40px',

  cursor: 'pointer',

  ':hover': {
    borderRadius: '50%',
    backgroundColor: dsPalette.iconHover.toString(),
  },

  ...customStyle,
}));

const CloseIcon = styled(CloseSvg)({
  fill: dsPalette.title.toString(),

  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'scale(0.63) translate(-79%,-83%)',
});

export interface Props {
  readonly iconWrapperCustomStyle?: CSSObject;
  onCloseClick(): void;
}

export const CloseButton: FC<Props> = ({
  onCloseClick,
  iconWrapperCustomStyle,
}) => (
  <IconWrapper
    onClick={onCloseClick}
    customStyle={iconWrapperCustomStyle}
  >
    <CloseIcon data-testid='popup-close' />
  </IconWrapper>
);
