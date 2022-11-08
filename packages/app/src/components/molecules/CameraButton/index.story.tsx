import { storiesOf } from '@storybook/react';
import React from 'react';

import styled from 'styled-components';
import CameraButton, { Props } from './';

const props: Props = {
  isCesium: false,
  isDisabled: false,
};

const Wrapper = styled.div({
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

storiesOf('Molecules|CameraButton', module)
  .add('default', () => (
    <Wrapper>
      <CameraButton {...props} />
    </Wrapper>
  ),
  );
