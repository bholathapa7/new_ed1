import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import DDMCheckBox from './';

storiesOf('Atoms|DDMCheckBox', module)
  .add('checked', () => (
    <DDMCheckBox checked={true} label='hi' onChange={action('click')} />
  ))
  .add('unchecked', () => (
    <DDMCheckBox checked={false} label='hi' onChange={action('click')} />
  ));
