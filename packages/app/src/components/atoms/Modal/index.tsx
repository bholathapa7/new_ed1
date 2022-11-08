import Color from 'color';
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';

interface BackgroundProps {
  readonly hasBlur?: boolean;
  readonly backgroundColor: Color;
  readonly zIndex: number;
}

const Background = styled.div<BackgroundProps>({
  position: 'absolute',

  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  '& > *': {
    position: 'absolute',

    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}, ({ backgroundColor, hasBlur, zIndex }) => ({
  backgroundColor: backgroundColor.toString(),
  backdropFilter: hasBlur ? 'blur(5px)' : undefined,
  zIndex,
}));

export interface Props extends BackgroundProps {
  readonly children: ReactElement<object>;
}

const Modal: FC<Props> = (
  { hasBlur, backgroundColor, children, zIndex },
) => (
  <Background hasBlur={hasBlur} backgroundColor={backgroundColor} zIndex={zIndex} data-testid='modal-background'>
    {children}
  </Background>
);
export default Modal;
