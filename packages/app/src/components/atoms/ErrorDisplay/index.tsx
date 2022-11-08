import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const Root = styled.main({
  width: '100%',
  height: '100%',

  background: palette.background.toString(),
});

const ErrorMessageWrapper = styled.div({
  position: 'relative',

  width: '100%',
  height: '100%',
});

const ErrorMessage = styled.article({
  position: 'absolute',
  top: '50%',
  left: '50%',

  width: '460px',

  padding: '20px',

  borderRadius: '3px',
  background: palette.white.toString(),
  transform: 'translate(-50%, -50%)',

  textAlign: 'center',
  fontSize: '15px',
  color: palette.textGray.toString(),
  lineHeight: 1.3,
});

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc display errors with entire screen
 */
const ErrorDisplay: FC = ({ children }) => (
  <Root>
    <ErrorMessageWrapper data-testid='errordisplay-wrapper'>
      <ErrorMessage data-testid='errordisplay-message'>{children}</ErrorMessage>
    </ErrorMessageWrapper>
  </Root>
);

export default ErrorDisplay;
