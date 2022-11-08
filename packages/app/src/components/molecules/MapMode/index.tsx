import React, { FC, memo } from 'react';
import styled from 'styled-components';

import BaseMapToggleButton from '^/components/atoms/BasemapToggleButton';
import DisplayToggleButton from '^/components/atoms/DisplayToggleButton';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { Fallback } from './fallback';

export const Root = styled.div({
  position: 'absolute',
  left: '35px',
  bottom: '35px',

  zIndex: 1,
});

const MapMode: FC = () => (
  <Root>
    <BaseMapToggleButton />
    <DisplayToggleButton />
  </Root>
);

export default memo(withErrorBoundary(MapMode)(Fallback));
