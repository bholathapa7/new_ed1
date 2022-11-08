import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { APIStatus } from '^/types';
import PasswordForm, { Props } from './';

storiesOf('Organisms|PasswordForm', module)
  .add('default', () => {
    const props: Props = {
      formValues: {
        email: '',
      },
      resetPasswordStatus: APIStatus.SUCCESS,
      onChange: action('change'),
      onSubmit: action('submit'),
    };

    return (
      <PasswordForm {...props} />
    );
  });
