import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';
import * as T from '^/types';

import SignUpForm, { Props } from './';

storiesOf('Organisms|SignUpForm', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
  }))
  .add('default', () => {
    const props: Props = {
      signUpStatus: T.APIStatus.IDLE,
      onSubmit: action('submit'),
    };

    return (
      <SignUpForm {...props} />
    );
  });
