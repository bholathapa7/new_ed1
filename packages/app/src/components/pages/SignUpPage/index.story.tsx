import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';
import * as T from '^/types';

import SignUpPage from './';

storiesOf('Pages|SignUpPage', module)
  .addDecorator(makeReduxDecorator({
    Auth: M.mockAuth,
    Pages: M.mockPages,
    router: M.mockrouter,
  }))
  .add('default', () => (
    <SignUpPage
      signUpStatus={T.APIStatus.IDLE}
      resetSignUpAPI={action('reset-sign-up-api')}
    />
  ));
