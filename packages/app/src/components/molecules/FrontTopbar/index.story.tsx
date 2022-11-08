import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import FrontTopbar from './';

storiesOf('Molecules|FrontTopbar', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
  }))
  .add('default', () => (
    <FrontTopbar
      isLoginPage={false}
      isSignUpPage={false}
      isPasswordPage={false}
      toHomePage={action('to-home-page')}
      toLoginPage={action('to-login-page')}
      toSignUpPage={action('to-sign-up-page')}
    />
  ));
