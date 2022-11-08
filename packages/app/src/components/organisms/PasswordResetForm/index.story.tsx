import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { APIStatus } from '^/types';
import PasswordResetForm, { Props } from './';

storiesOf('Organisms|PasswordResetForm', module)
  .add('default', () => {
    const props: Props = {
      formValues: {
        password: '',
        passwordConfirmation: '',
      },
      patchPasswordStatus: APIStatus.SUCCESS,
      onChange: action('change'),
      onSubmit: action('submit'),
    };

    return (
      <PasswordResetForm {...props} />
    );
  });
