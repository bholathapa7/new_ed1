import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import SignUpSuccessMessage from './';

storiesOf('Molecules|SignUpSuccessMessage', module)
  .add('default',
    () => <SignUpSuccessMessage onLogin={action('onLogin')} />);
