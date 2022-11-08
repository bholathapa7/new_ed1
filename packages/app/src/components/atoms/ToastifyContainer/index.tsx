import React, { FC } from 'react';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { defaultToastContainerOption } from '^/hooks';


const CustomToastifyContainer = styled(ToastContainer)({
  // Toastify Container should cover zendesk button
  zIndex: 1000000,
  '.Toastify__toast-container': {
    width: undefined,
  },
  '.Toastify__close-button': {
    position: 'absolute',
    right: '6px',
    top: '6px',
    color: dsPalette.title.toString(),
    opacity: 1,
  },
  '.Toastify__toast--error, .Toastify__toast--info': {
    width: '320px',
    borderRadius: '6px',
    // eslint-disable-next-line no-magic-numbers
    boxShadow: `0 0 10px 0 ${palette.black.alpha(0.54).toString()}`,
    backgroundColor: palette.white.toString(),
  },
});


export const ToastifyContainer: FC = () => (
  <CustomToastifyContainer
    {...defaultToastContainerOption}
  />
);
