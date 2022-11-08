import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import CoordinateSystemDropdown from './';

storiesOf('Molecules|CoordinateSystemDropdown', module)
  .add('default', () => (
    <CoordinateSystemDropdown
      value={''}
      onSelect={action('select')}
    />
  ));
