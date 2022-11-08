import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import PasswordResetFailureMessage, { Props } from './';

storiesOf('Molecules|PasswordResetFailureMessage', module)
  .add('default', () => {
    const props: Props = {
      backToForm: action('backToForm'),
    };

    return (
      <PasswordResetFailureMessage {...props} />
    );
  });
