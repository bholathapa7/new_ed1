import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import CoordinateTitleDropdown from '.';

storiesOf('Molecules|CoordinateTitleDropdown', module)
  .add('default', () => (
    <CoordinateTitleDropdown
      coordinateSystem={T.ProjectionEnum.WGS84_EPSG_4326_LL}
      value={''}
      onSelect={action('select')}
    />
  ));
