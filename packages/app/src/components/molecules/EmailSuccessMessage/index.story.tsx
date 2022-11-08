import { storiesOf } from '@storybook/react';
import React from 'react';

import EmailSuccessMessage, { Props } from './';

storiesOf('Molecules|EmailSuccessMessage', module)
  .add('default', () => {
    const props: Props = {
      formValues: {
        email: 'random@test.email',
      },
    };

    return (
      <EmailSuccessMessage {...props} />
    );
  });
