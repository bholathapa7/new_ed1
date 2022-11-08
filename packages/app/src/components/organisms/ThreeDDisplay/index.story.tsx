import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import ThreeDDisplay, { Props } from './';

storiesOf('Organisms|ThreeDDisplay', module)
  .add('default', () => {
    const props: Props = {
      authHeader: {
        Authorization: '',
      },
      contents: [],
      openWarning: action('open-warning'),
      logout: action('logout'),
      unselectExcept: action('unselect-except'),
    };

    return (
      <ThreeDDisplay {...props} />
    );
  });
