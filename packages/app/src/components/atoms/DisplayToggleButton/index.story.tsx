import { storiesOf } from '@storybook/react';
import React from 'react';

import DisplayToggleButton from './';

storiesOf('Atoms|DisplayToggleButton', module)
  .add('default', () => (
    <DisplayToggleButton />
  ));
