import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import SignUpFailureMessage from './';

storiesOf('Molecules|SignUpFailureMessage', module)
  .add('default',
    () => <SignUpFailureMessage resetSignUpAPI={action('resetSignUpAPI')} />);
