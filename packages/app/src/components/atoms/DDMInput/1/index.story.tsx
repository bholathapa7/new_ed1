import { storiesOf } from '@storybook/react';
import React from 'react';

import DDMInput from '.';

storiesOf('Atoms|DDMInput', module)
  .add('default', () => (
    <DDMInput error={false} placeholder='PLACEHOLDER' />
  )).add('error', () => (
    <DDMInput error={true} placeholder='PLACEHOLDER' />
  ));
