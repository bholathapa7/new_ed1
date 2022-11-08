import { storiesOf } from '@storybook/react';
import React from 'react';

import ChartLine, { Props } from './';

import { UnitType } from '^/types';

const props: Props = {
  data: [],
  isDesignDXFMap: [],
  comparisonColors: [],
  comparisonTitles: [],
  unitType: UnitType.METRIC,
};

storiesOf('Molecules|ChartLine', module)
  .add('default', () => <ChartLine {...props} />)
;
