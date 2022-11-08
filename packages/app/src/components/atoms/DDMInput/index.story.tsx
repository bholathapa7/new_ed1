import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';
import { DDMInput } from '.';

const Wrapper = styled.div({
  width: '287px',
  height: '37px',

  padding: '50px',
  backgroundColor: palette.white.toString(),
});

storiesOf('Atoms|V2_DDMInput', module)
  .add('default', () => (
    <Wrapper>
      <DDMInput hasError={false} placeholder='PLACEHOLDER' />
    </Wrapper>
  )).add('error', () => (
    <Wrapper>
      <DDMInput hasError={true} placeholder='PLACEHOLDER' />
    </Wrapper>
  ));
