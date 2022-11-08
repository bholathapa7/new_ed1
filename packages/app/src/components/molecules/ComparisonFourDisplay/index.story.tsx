
import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import { ComparisonFourDisplay, Props } from './';

const props: Props = {
  MapTarget: styled('div')({}),
  redraw: 0,
};

storiesOf('Molecules|ComparisonFourDisplay', module)
  .add('default', () => <ComparisonFourDisplay {...props} />)
;
