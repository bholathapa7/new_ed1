import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import { ComparisonTwoDisplay, Props } from './';
const props: Props = {
  MapTarget: styled('div')({}),
  redraw: 0,
};

storiesOf('Molecules|ComparisonTwoDisplay', module)
  .add('default', () => <ComparisonTwoDisplay {...props} />)
;
